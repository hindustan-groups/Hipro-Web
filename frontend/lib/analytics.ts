/**
 * Safe, type-safe Google Analytics (GA4) event tracker for Hindustan Projects.
 * Cleanly no-ops when GA4 is not configured (missing NEXT_PUBLIC_GA_MEASUREMENT_ID or window.gtag).
 * Guarantees zero PII transmission by stripping forbidden identity keys.
 */

// Global type augmentation for window.gtag and window.dataLayer
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "event" | "config" | "js" | "set",
      targetIdOrAction: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}

export type GAEventName =
  | "generate_lead"
  | "submit_application"
  | "contact_whatsapp_click"
  | "contact_phone_click"
  | "contact_email_click"
  | "calculate_cost_estimate";

export interface EventParams {
  form_id?: string;
  service_category?: string;
  state?: string;
  district?: string;
  job_role?: string;
  location?: string;
  project_type?: string;
  construction_tier?: string;
  [key: string]: string | number | boolean | undefined;
}

// Strict allowlist of permissible parameter keys per GA4 event name
export const ALLOWED_EVENT_PARAMS: Record<GAEventName, Set<string>> = {
  generate_lead: new Set(["form_id", "service_category", "state", "district"]),
  submit_application: new Set(["job_role"]),
  contact_whatsapp_click: new Set(["location"]),
  contact_phone_click: new Set(["location"]),
  contact_email_click: new Set(["location"]),
  calculate_cost_estimate: new Set(["project_type", "construction_tier"]),
};

// Prohibited PII keys to prevent accidental leaks
export const PROHIBITED_KEYS = new Set([
  "email",
  "phone",
  "phone_number",
  "phonenumber",
  "mobile",
  "cell",
  "tel",
  "name",
  "full_name",
  "firstname",
  "lastname",
  "first_name",
  "last_name",
  "message",
  "message_text",
  "resume",
  "cv",
  "address",
  "street",
  "streetaddress",
  "street_address",
  "pincode",
  "zipcode",
  "postal_code",
]);

// Value inspection patterns for accidental PII values (e.g. emails, full phone numbers)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;

/**
 * Sanitizes event parameters against the strict allowlist, prohibited keys,
 * and PII value inspection patterns.
 */
export function sanitizeEventParams(
  name: GAEventName,
  params: EventParams = {}
): Record<string, unknown> {
  const allowedKeys = ALLOWED_EVENT_PARAMS[name];
  if (!allowedKeys) return {};

  const safeParams: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();

    // Must be in allowlist and not in prohibited keys
    if (!allowedKeys.has(key) || PROHIBITED_KEYS.has(lowerKey)) {
      continue;
    }

    if (value === undefined || value === null || value === "") {
      continue;
    }

    // Inspect string values to prevent accidental PII leakage
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (EMAIL_REGEX.test(trimmed) || (trimmed.length >= 7 && PHONE_REGEX.test(trimmed))) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[GA4] Scrubbed potential PII value in param "${key}" for event "${name}"`);
        }
        continue;
      }
      safeParams[key] = trimmed;
    } else {
      safeParams[key] = value;
    }
  }

  return safeParams;
}

/**
 * Dispatches a custom GA4 event if analytics is configured and enabled.
 * Safely ignores execution on the server or when measurement ID is unset.
 */
export function trackEvent(name: GAEventName, params: EventParams = {}): void {
  if (typeof window === "undefined") return;

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId || typeof window.gtag !== "function") {
    // Analytics is disabled or not initialized; cleanly no-op
    return;
  }

  const safeParams = sanitizeEventParams(name, params);

  try {
    window.gtag("event", name, safeParams);
  } catch (err) {
    // Silently fail to ensure UI and user flow are never interrupted
    if (process.env.NODE_ENV === "development") {
      console.warn(`[GA4] Failed to dispatch event "${name}":`, err);
    }
  }
}
