/**
 * Safe JSON parsing and type-safety utilities for Hind Building Solutions (HBS)
 * Prevents runtime exceptions from malformed, null, legacy, or unexpected values.
 */

/**
 * Safely parses a JSON string or returns the fallback value.
 * If the value is already an object/array, it is returned directly.
 */
export function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback;
  }

  // Already parsed object or array
  if (typeof value === "object") {
    return value as T;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  // Quick heuristic: must begin with '{' or '[' to be valid JSON structure
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return (parsed !== null && parsed !== undefined ? parsed : fallback) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely serializes an object/array to a JSON string.
 * If already a string, validates that it is well-formed or stringifies it.
 */
export function safeJsonStringify(value: unknown, fallback: string | null = null): string | null {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      return JSON.stringify(trimmed);
    }
  }

  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

/**
 * Safely extracts an array of strings from either:
 * - A string array
 * - A JSON stringified array
 * - A newline-delimited or comma-separated string
 */
export function safeStringArray(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined)
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => item !== null && item !== undefined)
            .map((item) => String(item).trim())
            .filter((item) => item.length > 0);
        }
      } catch {
        // Fall back to line splitting below
      }
    }

    // Split on newlines if present, otherwise single element
    if (trimmed.includes("\n")) {
      return trimmed
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    }

    return [trimmed];
  }

  return [];
}

/**
 * Standardized HBS Lead Statuses
 */
export const HBS_LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "QUOTATION_SENT",
  "CONVERTED",
  "LOST",
  "SPAM",
] as const;

export type HbsLeadStatus = (typeof HBS_LEAD_STATUSES)[number];

/**
 * Normalizes any lead status (including legacy lowercase values) to a standard uppercase enum.
 * Backwards compatible with legacy database records.
 */
export function normalizeLeadStatus(status: unknown): HbsLeadStatus {
  if (typeof status !== "string") return "NEW";
  const s = status.trim().toUpperCase();

  switch (s) {
    case "NEW":
      return "NEW";
    case "CONTACTED":
      return "CONTACTED";
    case "IN_PROGRESS":
    case "FOLLOW_UP":
      return "FOLLOW_UP";
    case "QUOTATION_SENT":
    case "QUOTED":
      return "QUOTATION_SENT";
    case "COMPLETED":
    case "CONVERTED":
      return "CONVERTED";
    case "CANCELLED":
    case "LOST":
      return "LOST";
    case "SPAM":
      return "SPAM";
    default:
      return "NEW";
  }
}
