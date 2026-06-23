import { Redis } from '@upstash/redis';

// Initialize Redis client
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch {
  // Redis not configured
}

// Cache key prefixes
export const CACHE_KEYS = {
  PRODUCTS_LIST: 'products:list',
  PRODUCTS_SINGLE: 'products:single',
  CATEGORY_PRODUCTS: 'category:products',
  CATEGORIES_LIST: 'categories:list',
  FEATURED_PRODUCTS: 'featured:products',
  FAQ: 'content:faq',
  GEM_FACTS: 'content:gem-facts',
  REVIEWS: 'reviews:approved',
  AUCTIONS: 'auctions:list',
  DASHBOARD_STATS: 'admin:dashboard-stats',
  CRYPTO_PRICES: 'crypto:prices',
  ADMIN_SESSION: 'admin:session',
} as const;

// Default TTLs in seconds
export const CACHE_TTL = {
  PRODUCTS_LIST: 300, // 5 minutes
  PRODUCTS_SINGLE: 600, // 10 minutes
  CATEGORY_PRODUCTS: 300, // 5 minutes
  CATEGORIES_LIST: 600, // 10 minutes
  FEATURED_PRODUCTS: 300, // 5 minutes
  FAQ: 1800, // 30 minutes
  GEM_FACTS: 1800, // 30 minutes
  REVIEWS: 300, // 5 minutes
  AUCTIONS: 60, // 1 minute (changes frequently)
  DASHBOARD_STATS: 120, // 2 minutes
  CRYPTO_PRICES: 60, // 1 minute (crypto prices change frequently)
  ADMIN_SESSION: 604800, // 7 days
} as const;

// Generate cache key from params
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${prefix}:${sortedParams || 'default'}`;
}

// Get from cache
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const data = await redis.get<T>(key);
    return data;
  } catch {
    return null;
  }
}

// Set cache with TTL
export async function setCache<T>(key: string, data: T, ttl: number): Promise<void> {
  if (!redis) return;

  try {
    await redis.set(key, data, { ex: ttl });
  } catch {
    // Cache set failed silently
  }
}

// Delete single cache key
export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch {
    // Cache delete failed silently
  }
}

// Delete all keys matching a pattern (for invalidation)
export async function invalidatePattern(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    // Upstash Redis supports SCAN for pattern matching
    let cursor: number = 0;
    do {
      const result = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = parseInt(String(result[0]), 10);
      const keys = result[1];

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== 0);
  } catch {
    // Pattern invalidation failed silently
  }
}

// Invalidate all product-related caches
export async function invalidateProductCaches(productId?: string): Promise<void> {
  await invalidatePattern(`${CACHE_KEYS.PRODUCTS_LIST}:*`);
  await invalidatePattern(`${CACHE_KEYS.CATEGORY_PRODUCTS}:*`);
  await deleteCache(CACHE_KEYS.FEATURED_PRODUCTS);

  if (productId) {
    await deleteCache(`${CACHE_KEYS.PRODUCTS_SINGLE}:${productId}`);
  }
}

// Invalidate content caches (FAQ, gem facts)
export async function invalidateContentCaches(type?: 'faq' | 'gem-facts'): Promise<void> {
  if (type === 'faq') {
    await deleteCache(CACHE_KEYS.FAQ);
  } else if (type === 'gem-facts') {
    await deleteCache(CACHE_KEYS.GEM_FACTS);
  } else {
    await deleteCache(CACHE_KEYS.FAQ);
    await deleteCache(CACHE_KEYS.GEM_FACTS);
  }
}

// Invalidate reviews cache
export async function invalidateReviewsCaches(): Promise<void> {
  await invalidatePattern(`${CACHE_KEYS.REVIEWS}:*`);
}

// Invalidate auctions cache
export async function invalidateAuctionsCaches(): Promise<void> {
  await invalidatePattern(`${CACHE_KEYS.AUCTIONS}:*`);
}

// Invalidate dashboard stats cache
export async function invalidateDashboardCaches(): Promise<void> {
  await invalidatePattern(`${CACHE_KEYS.DASHBOARD_STATS}:*`);
}

// Invalidate all category-related caches
export async function invalidateCategoryCaches(): Promise<void> {
  await invalidatePattern(`${CACHE_KEYS.CATEGORIES_LIST}:*`);
  await invalidatePattern(`${CACHE_KEYS.CATEGORY_PRODUCTS}:*`);
}

// Check if Redis is available
export function isCacheAvailable(): boolean {
  return redis !== null;
}

// Export redis client for advanced use cases
export { redis };
