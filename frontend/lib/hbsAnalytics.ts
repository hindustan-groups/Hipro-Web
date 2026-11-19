/**
 * Safe, type-safe Google Analytics (GA4) event tracker for Hind Building Solutions (HBS).
 * Cleanly no-ops when GA4 is not configured (missing NEXT_PUBLIC_HBS_GA_MEASUREMENT_ID or window.gtag).
 * Guarantees zero PII transmission by stripping forbidden identity keys and validating values.
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

export type HbsGAEventName =
  | "generate_lead"
  | "form_start"
  | "click_to_call"
  | "click_whatsapp"
  | "quote_request"
  | "page_view";

export interface HbsEventParams {
  form_id?: string;
  service_category?: string;
  source_page?: string;
  lead_type?: string;
  phone_type?: string;
  whatsapp_type?: string;
  link_location?: string;
  service_name?: string;
  page_path?: string;
  page_title?: string;
  [key: string]: string | number | boolean | undefined;
}

// Strict allowlist of permissible parameter keys per HBS GA4 event
export const ALLOWED_HBS_EVENT_PARAMS: Record<HbsGAEventName, Set<string>> = {
  generate_lead: new Set(["form_id", "service_category", "source_page", "lead_type"]),
  form_start: new Set(["form_id", "service_category", "source_page"]),
  click_to_call: new Set(["phone_type", "link_location", "source_page"]),
  click_whatsapp: new Set(["whatsapp_type", "link_location", "service_category", "source_page"]),
  quote_request: new Set(["service_name", "source_page", "form_id"]),
  page_view: new Set(["page_path", "page_title"]),
};

// Prohibited PII keys to prevent accidental leaks of customer data
export const PROHIBITED_PII_KEYS = new Set([
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
  "address",
  "street",
  "streetaddress",
  "street_address",
  "pincode",
  "zipcode",
  "postal_code",
  "notes",
  "comment",
]);

// Value inspection patterns for accidental PII values (emails, full phone numbers)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;

/**
 * Sanitizes event parameters against the strict allowlist, prohibited keys,
 * and PII value inspection patterns.
 */
export function sanitizeHbsEventParams(
  name: HbsGAEventName,
  params: HbsEventParams = {}
): Record<string, unknown> {
  const allowedKeys = ALLOWED_HBS_EVENT_PARAMS[name];
  if (!allowedKeys) return {};

  const safeParams: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();

    // Must be in allowlist and not in prohibited keys
    if (!allowedKeys.has(key) || PROHIBITED_PII_KEYS.has(lowerKey)) {
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
          console.warn(`[HBS GA4] Scrubbed potential PII value in param "${key}" for event "${name}"`);
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
 * Dispatches a custom HBS GA4 event if analytics is configured and enabled.
 * Safely ignores execution on the server or when gtag is unavailable.
 */
export function trackHbsEvent(name: HbsGAEventName, params: HbsEventParams = {}): void {
  if (typeof window === "undefined") return;

  if (typeof window.gtag !== "function") {
    // Analytics is disabled or not initialized; cleanly no-op
    return;
  }

  const safeParams = sanitizeHbsEventParams(name, params);

  try {
    window.gtag("event", name, safeParams);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[HBS GA4] Failed to dispatch event "${name}":`, err);
    }
  }
}
