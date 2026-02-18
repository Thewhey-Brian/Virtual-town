import { Redis } from 'ioredis';

// Redis client singleton
let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (redis) return redis;
  
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('REDIS_URL not set, caching disabled');
    return null;
  }
  
  try {
    redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });
    
    redis.on('error', (err) => {
      console.error('Redis error:', err);
    });
    
    return redis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    return null;
  }
}

// Cache keys
export const CACHE_KEYS = {
  characterPositions: (date: string, time: string) => `positions:${date}:${time}`,
  characterRoutines: (characterId: string, date: string) => `routines:${characterId}:${date}`,
  townState: (townId: string) => `town:${townId}`,
  places: (townId: string) => `places:${townId}`,
  characters: (townId: string) => `characters:${townId}`,
  conversations: (characterId: string) => `conversations:${characterId}`,
  events: (townId: string, date: string) => `events:${townId}:${date}`,
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  characterPositions: 30, // 30 seconds - frequent updates
  characterRoutines: 300, // 5 minutes
  townState: 60, // 1 minute
  places: 3600, // 1 hour
  characters: 300, // 5 minutes
  conversations: 600, // 10 minutes
  events: 1800, // 30 minutes
} as const;

// Generic cache get
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

// Generic cache set
export async function cacheSet(
  key: string, 
  value: any, 
  ttl: number
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

// Cache delete
export async function cacheDelete(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

// Cache invalidate by pattern
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidate error:', error);
  }
}

// Cached function wrapper
export function withCache<T>(
  fn: (...args: any[]) => Promise<T>,
  keyGenerator: (...args: any[]) => string,
  ttl: number
) {
  return async (...args: any[]): Promise<T> => {
    const key = keyGenerator(...args);
    
    // Try to get from cache
    const cached = await cacheGet<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Execute function
    const result = await fn(...args);
    
    // Store in cache
    await cacheSet(key, result, ttl);
    
    return result;
  };
}
