import { Request, Response, NextFunction } from "express";

interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  max: number;      // Maximum requests allowed in windowMs
  message: string;  // Safe message returned with HTTP 429
}

/**
 * Creates a memory-safe sliding-window rate-limiting middleware.
 * Automatically evicts expired timestamps using an unref'd timer.
 * Emits standard RateLimit and Retry-After headers.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, max, message } = options;
  const store = new Map<string, number[]>();

  // Periodically evict expired entries to prevent memory leaks
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        store.set(key, valid);
      }
    }
  }, 60000);
  cleanupTimer.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Resolve client IP (Express req.ip handles trust proxy configuration)
    const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();

    const timestamps = store.get(clientIp) || [];
    const windowStart = now - windowMs;
    const recent = timestamps.filter((t) => t > windowStart);

    const oldest = recent.length > 0 ? recent[0] : now;
    const resetTimestampSeconds = Math.ceil((oldest + windowMs) / 1000);
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

    res.setHeader("RateLimit-Limit", max.toString());
    res.setHeader("RateLimit-Reset", resetTimestampSeconds.toString());

    if (recent.length >= max) {
      res.setHeader("RateLimit-Remaining", "0");
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      return res.status(429).json({
        success: false,
        error: message,
      });
    }

    recent.push(now);
    store.set(clientIp, recent);

    const remaining = Math.max(0, max - recent.length);
    res.setHeader("RateLimit-Remaining", remaining.toString());

    next();
  };
}

// 1. Auth Login: Strong brute-force protection (5 attempts / 15 min / IP)
export const authLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// 2. Contact: Spam & flood protection (5 submissions / 15 min / IP)
export const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many contact submissions from this IP. Please try again later.",
});

// 3. Quote: Spam & flood protection (5 submissions / 15 min / IP)
export const quoteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many quote requests from this IP. Please try again later.",
});
