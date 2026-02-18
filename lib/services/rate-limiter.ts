import { getRedisClient } from './cache';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Simple in-memory rate limiter for development
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit by IP or user ID
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  
  if (redis) {
    // Redis-based rate limiting
    try {
      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, now - windowMs);
      pipeline.zcard(key);
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      pipeline.pexpire(key, windowMs);
      
      const results = await pipeline.exec();
      const currentCount = (results?.[1]?.[1] as number) || 0;
      
      const allowed = currentCount < maxRequests;
      const remaining = Math.max(0, maxRequests - currentCount - 1);
      const resetTime = now + windowMs;
      
      if (!allowed) {
        // Get oldest request time for retry-after
        const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const retryAfter = oldest.length > 1 
          ? Math.ceil((parseInt(oldest[1]) + windowMs - now) / 1000)
          : windowSeconds;
          
        return { allowed: false, remaining: 0, resetTime, retryAfter };
      }
      
      return { allowed: true, remaining, resetTime };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Fall through to memory-based
    }
  }
  
  // Memory-based rate limiting
  const record = memoryStore.get(key);
  
  if (!record || now > record.resetTime) {
    // New window
    memoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }
  
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: record.resetTime,
      retryAfter 
    };
  }
  
  record.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - record.count, 
    resetTime: record.resetTime 
  };
}

// Specific rate limits for different operations
export const RATE_LIMITS = {
  // AI generation endpoints
  aiGeneration: {
    maxRequests: 5,
    windowSeconds: 60,
  },
  // Character creation
  characterCreation: {
    maxRequests: 10,
    windowSeconds: 60,
  },
  // Command execution
  commandExecution: {
    maxRequests: 20,
    windowSeconds: 60,
  },
  // General API - increased for polling
  default: {
    maxRequests: 300,
    windowSeconds: 60,
  },
} as const;

// Middleware helper for API routes
export async function rateLimitMiddleware(
  req: Request,
  limitType: keyof typeof RATE_LIMITS = 'default'
): Promise<RateLimitResult | null> {
  // Get identifier from header or generate from IP
  const identifier = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'anonymous';
  
  const limit = RATE_LIMITS[limitType];
  const result = await checkRateLimit(identifier, limit.maxRequests, limit.windowSeconds);
  
  return result;
}
