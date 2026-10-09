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

  // 1. Check in-memory Map
  const entry = memoryCache.get(key);
  if (entry) {
    return entry.data as T;
  }

  // 2. Check sessionStorage fallback for full page reloads
  try {
    const raw = sessionStorage.getItem(`hipro_adm_${key}`);
    if (raw) {
      const parsed: CacheEntry<T> = JSON.parse(raw);
      // Populate memory cache so subsequent calls are 0ms
      memoryCache.set(key, parsed);
      return parsed.data;
    }
  } catch {
    // Ignore storage quota or security errors
  }

  return null;
}

export function isAdminCacheFresh(key: string, maxAgeMs = DEFAULT_TTL_MS): boolean {
  if (typeof window === "undefined") return false;
  const entry = memoryCache.get(key);
  if (entry) return Date.now() - entry.timestamp < maxAgeMs;

  try {
    const raw = sessionStorage.getItem(`hipro_adm_${key}`);
    if (raw) {
      const parsed: CacheEntry<any> = JSON.parse(raw);
      return Date.now() - parsed.timestamp < maxAgeMs;
    }
  } catch {}

  return false;
}

export function setAdminCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(`hipro_adm_${key}`, JSON.stringify(entry));
  } catch {
    // Ignore storage quota exceeded errors
  }
}

export function invalidateAdminCache(prefix?: string): void {
  if (typeof window === "undefined") return;
  if (!prefix) {
    memoryCache.clear();
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith("hipro_adm_")) sessionStorage.removeItem(k);
      });
    } catch {}
    return;
  }

  memoryCache.forEach((_, key) => {
    if (key === prefix || key.startsWith(`${prefix}:`) || key.startsWith(`${prefix}/`)) {
      memoryCache.delete(key);
    }
  });

  try {
    Object.keys(sessionStorage).forEach((k) => {
      const target = `hipro_adm_${prefix}`;
      if (k === target || k.startsWith(`${target}:`) || k.startsWith(`${target}/`)) {
        sessionStorage.removeItem(k);
      }
    });
  } catch {}
}
