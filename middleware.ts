import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting map (in-memory for edge runtime)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function middleware(request: NextRequest) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    'anonymous';
  
  const path = request.nextUrl.pathname;
  
  // Only apply rate limiting to API routes
  if (path.startsWith('/api/')) {
    const rateLimitKey = `ratelimit:${ip}:${path}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100; // 100 requests per minute
    
    const record = rateLimitMap.get(rateLimitKey);
    
    if (!record || now > record.resetTime) {
      // New window
      rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + windowMs });
    } else if (record.count >= maxRequests) {
      // Rate limit exceeded
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
            'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
          },
        }
      );
    } else {
      // Increment count
      record.count++;
    }
    
    // Add rate limit headers
    const currentRecord = rateLimitMap.get(rateLimitKey)!;
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - currentRecord.count)));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(currentRecord.resetTime / 1000)));
    
    return response;
  }
  
  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Add request ID for tracing
  response.headers.set('X-Request-ID', crypto.randomUUID());
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
