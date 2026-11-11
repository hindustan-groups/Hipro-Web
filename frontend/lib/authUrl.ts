/**
 * Validates and sanitizes callback URLs to prevent Open Redirect vulnerabilities.
 * Strictly permits only relative paths belonging to the '/admin' route scope.
 *
 * Rules:
 * 1. Must be a non-empty string.
 * 2. Must strictly be '/admin', start with '/admin/', or start with '/admin?'.
 *    (Rejects '/administrator', '/admin-login', '/admin-settings', '/adminxyz', etc.)
 * 3. Must not start with '//', '/\', '\\', or protocol relative patterns.
 * 4. Must not contain backslashes ('\') or encoded backslashes ('%5c', '%5C').
 * 5. Must not contain path traversal ('/../', '/..', '..%2f', '%2e%2e').
 * 6. Must not contain whitespace, tabs, carriage returns, or newlines.
 * 7. Must decode cleanly via decodeURIComponent without revealing forbidden patterns.
 * 8. Must not contain pseudo-protocol schemes ('javascript:', 'data:', 'vbscript:').
 * 9. Must not redirect back to '/admin-login' or any variant thereof (prevents redirect loops).
 *
 * Falls back safely to '/admin' on any violation.
 */
export function sanitizeReturnUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "/admin";
  const trimmed = url.trim();

  // 1. Whitespace & control characters check
  if (/[\r\n\t\s]/.test(trimmed)) return "/admin";

  // 2. Backslash rejection (in both raw and encoded forms)
  if (trimmed.includes("\\") || /%5c/i.test(trimmed)) return "/admin";

  // 3. Strict route boundary: must be exact '/admin' or start with '/admin/' or '/admin?'
  // This explicitly rejects '/administrator', '/admin-login', '/admin-settings', '/adminxyz', etc.
  if (trimmed !== "/admin" && !trimmed.startsWith("/admin/") && !trimmed.startsWith("/admin?")) {
    return "/admin";
  }

  // 4. Protocol-relative or leading slash tricks
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return "/admin";

  // 5. Reject embedded schemes or pseudo-protocols
  if (/^(?:[a-z0-9+.-]+:|\/\/)/i.test(trimmed)) return "/admin";
  if (/javascript:|data:|vbscript:/i.test(trimmed)) return "/admin";

  // 6. URI Decode verification (detects double-encoded or hidden traversals/schemes)
  try {
    const decoded = decodeURIComponent(trimmed);
    if (/[\r\n\t\s]/.test(decoded)) return "/admin";
    if (decoded.includes("\\")) return "/admin";
    if (decoded.startsWith("//") || decoded.startsWith("/\\")) return "/admin";
    if (decoded !== "/admin" && !decoded.startsWith("/admin/") && !decoded.startsWith("/admin?")) {
      return "/admin";
    }
    // Path traversal check
    if (decoded.includes("/..") || decoded.includes("../") || decoded.includes("..\\")) {
      return "/admin";
    }
    if (/javascript:|data:|vbscript:/i.test(decoded)) return "/admin";
  } catch {
    // Malformed URI encoding fails closed
    return "/admin";
  }

  return trimmed;
}
