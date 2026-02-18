'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseApiOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  retryCount?: number;
  retryDelay?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  cacheKey?: string;
  cacheTTL?: number; // seconds
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  mutate: (newData: T | ((prev: T | null) => T)) => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Custom hook for API calls with retry logic and caching
 */
export function useApi<T>(options: UseApiOptions<T>): UseApiResult<T> {
  const {
    url,
    method = 'GET',
    body,
    headers = {},
    retryCount = 3,
    retryDelay = 1000,
    enabled = true,
    onSuccess,
    onError,
    cacheKey,
    cacheTTL = 60,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<ApiError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first for GET requests
    if (method === 'GET' && cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTTL * 1000) {
        setData(cached.data as T);
        setIsLoading(false);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let attempt = 0;
    let lastError: ApiError | null = null;

    while (attempt < retryCount) {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: abortControllerRef.current.signal,
        });

        const result: ApiResponse<T> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || `HTTP ${response.status}`);
        }

        // Update cache for GET requests
        if (method === 'GET' && cacheKey && result.data) {
          cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
        }

        setData(result.data || null);
        onSuccess?.(result.data as T);
        return;
      } catch (err) {
        attempt++;
        
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was cancelled
        }

        lastError = {
          code: 'FETCH_ERROR',
          message: err instanceof Error ? err.message : 'Unknown error',
        };

        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    setError(lastError);
    onError?.(lastError!);
  }, [url, method, body, headers, retryCount, retryDelay, onSuccess, onError, cacheKey, cacheTTL]);

  const refetch = useCallback(async () => {
    // Clear cache for this key
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    await fetchData();
  }, [fetchData, cacheKey]);

  const mutate = useCallback((newData: T | ((prev: T | null) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' 
        ? (newData as (prev: T | null) => T)(prev) 
        : newData;
      
      // Update cache
      if (cacheKey) {
        cache.set(cacheKey, { data: updated, timestamp: Date.now() });
      }
      
      return updated;
    });
  }, [cacheKey]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, fetchData]);

  return { data, isLoading, error, refetch, mutate };
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(options: UseApiOptions<T[]> & { initialPage?: number; limit?: number }) {
  const [page, setPage] = useState(options.initialPage || 1);
  const [hasMore, setHasMore] = useState(true);
  
  const limit = options.limit || 20;
  const urlWithPagination = `${options.url}${options.url.includes('?') ? '&' : '?'}page=${page}&limit=${limit}`;
  
  const result = useApi<T[]>({
    ...options,
    url: urlWithPagination,
  });

  const loadMore = useCallback(() => {
    if (!result.isLoading && hasMore) {
      setPage(p => p + 1);
    }
  }, [result.isLoading, hasMore]);

  const reset = useCallback(() => {
    setPage(1);
    setHasMore(true);
    result.refetch();
  }, [result]);

  // Update hasMore based on data length
  useEffect(() => {
    if (result.data) {
      setHasMore(result.data.length === limit);
    }
  }, [result.data, limit]);

  return {
    ...result,
    page,
    hasMore,
    loadMore,
    reset,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticMutation<T, V>(
  url: string,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  }
) {
  const [isMutating, setIsMutating] = useState(false);

  const mutate = useCallback(async (variables: V, optimisticData?: T) => {
    setIsMutating(true);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      });

      const result: ApiResponse<T> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Mutation failed');
      }

      options?.onSuccess?.(result.data as T);
      return result.data;
    } catch (err) {
      const error: ApiError = {
        code: 'MUTATION_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
      options?.onError?.(error);
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [url, options]);

  return { mutate, isMutating };
}
