import { Request, Response, NextFunction } from "express";

/**
 * Express middleware to enforce strict HTTP security headers on all API responses.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME-sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking / framing of API responses
  res.setHeader("X-Frame-Options", "DENY");

  // Content-Security-Policy: APIs do not render HTML or execute scripts
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");

  // Enforce HTTPS
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Control referrer information sent in requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict sensitive browser features/APIs
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );

  // Cross-Origin Resource Policy: Allow CORS-authorized cross-origin consumers to read responses
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  next();
}
