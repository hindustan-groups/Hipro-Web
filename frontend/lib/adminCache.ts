/**
 * High-Performance Client-Side Cache Manager for Admin Portal
 * 
 * Implements an in-memory stale-while-revalidate cache store.
 * Eliminates loading flashes when navigating between tabs in the admin panel.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

// Default fresh window is 90 seconds
const DEFAULT_TTL_MS = 90 * 1000;

export function getAdminCache<T>(key: string, maxAgeMs = DEFAULT_TTL_MS): T | null {
  if (typeof window === "undefined") return null;
  const entry = memoryCache.get(key);
  if (!entry) return null;

  // Stale-while-revalidate: return cached data even if slightly older than TTL
  return entry.data as T;
}

export function isAdminCacheFresh(key: string, maxAgeMs = DEFAULT_TTL_MS): boolean {
  if (typeof window === "undefined") return false;
  const entry = memoryCache.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < maxAgeMs;
}

export function setAdminCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateAdminCache(prefix?: string): void {
  if (typeof window === "undefined") return;
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  memoryCache.forEach((_, key) => {
    if (key === prefix || key.startsWith(`${prefix}:`) || key.startsWith(`${prefix}/`)) {
      memoryCache.delete(key);
    }
  });
}
