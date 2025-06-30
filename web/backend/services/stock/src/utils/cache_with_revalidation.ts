import Redis from 'ioredis';
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
});

export interface CacheOptions<T> {
  key: string;
  ttl?: number; // in seconds
  fetchFn: () => Promise<T>;
}

export async function cacheWithRevalidation<T>(options: CacheOptions<T>): Promise<{ data: T; fromCache: boolean; staleFallback?: boolean }> {
  const { key, ttl = 300, fetchFn } = options;

  const cached = await redis.get(key);
  if (cached) {
    const parsed = JSON.parse(cached);

    // Background revalidation
    setImmediate(async () => {
      try {
        const fresh = await fetchFn();
        await redis.set(key, JSON.stringify(fresh), 'EX', ttl);
      } catch (e) {
        console.error(`[CacheRevalidateError] Key=${key}`, e);
      }
    });

    return {
      data: parsed,
      fromCache: true
    };
  }

  // Cache miss
  const fresh = await fetchFn();
  await redis.set(key, JSON.stringify(fresh), 'EX', ttl);

  return {
    data: fresh,
    fromCache: false
  };
}
