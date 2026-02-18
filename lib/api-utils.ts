import { NextRequest, NextResponse } from 'next/server';

/**
 * Standardized API response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string; // Only in development
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  timestamp: string;
  requestId: string;
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  meta?: Partial<ResponseMeta>,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
): NextResponse<ApiResponse> {
  const error: ApiError = {
    code,
    message,
    details,
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development' && details?.stack) {
    error.stack = details.stack as string;
  }

  const response: ApiResponse = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

/**
 * HTTP Status codes mapping
 */
export const ErrorStatusCodes: Record<string, number> = {
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.METHOD_NOT_ALLOWED]: 405,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.VALIDATION_ERROR]: 422,
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCodes.TIMEOUT_ERROR]: 504,
};

/**
 * Wrap API handler with standardized error handling
 */
export function withApiHandler(
  handler: (req: NextRequest, context?: { params: Promise<Record<string, string>> }) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const startTime = performance.now();

    try {
      // Add CORS headers
      const response = await handler(req, context);
      
      // Add common headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${Math.round(performance.now() - startTime)}ms`);
      
      return response;
    } catch (error) {
      console.error(`[${requestId}] API Error:`, error);
      
      if (error instanceof ApiException) {
        return errorResponse(
          error.code,
          error.message,
          ErrorStatusCodes[error.code] || 500,
          error.details
        );
      }

      // Handle Prisma errors
      if (error instanceof Error && error.name?.includes('Prisma')) {
        return errorResponse(
          ErrorCodes.DATABASE_ERROR,
          'Database operation failed',
          500,
          { originalError: error.message }
        );
      }

      // Generic error
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'An unexpected error occurred',
        500,
        process.env.NODE_ENV === 'development' ? { stack: (error as Error).stack } : undefined
      );
    }
  };
}

/**
 * Custom API exception class
 */
export class ApiException extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

/**
 * Validation helper
 */
export function validateBody<T>(
  body: unknown,
  requiredFields: (keyof T)[],
  validators?: Partial<Record<keyof T, (value: unknown) => boolean>>
): T {
  if (!body || typeof body !== 'object') {
    throw new ApiException(
      ErrorCodes.BAD_REQUEST,
      'Request body must be an object'
    );
  }

  const missingFields = requiredFields.filter(
    field => !(field in body) || (body as Record<string, unknown>)[field as string] === undefined
  );

  if (missingFields.length > 0) {
    throw new ApiException(
      ErrorCodes.VALIDATION_ERROR,
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }

  // Run custom validators
  if (validators) {
    for (const [field, validator] of Object.entries(validators)) {
      const value = (body as Record<string, unknown>)[field];
      if (value !== undefined && !(validator as (value: unknown) => boolean)(value)) {
        throw new ApiException(
          ErrorCodes.VALIDATION_ERROR,
          `Invalid value for field: ${field}`
        );
      }
    }
  }

  return body as T;
}
