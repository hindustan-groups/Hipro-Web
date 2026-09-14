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

// Prohibited PII keys to prevent accidental leaks
const PROHIBITED_KEYS = new Set([
  "email",
  "phone",
  "phone_number",
  "phonenumber",
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
]);

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

  // Filter out any potential PII keys and undefined values
  const safeParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (PROHIBITED_KEYS.has(key.toLowerCase()) || value === undefined) {
      continue;
    }
    safeParams[key] = value;
  }

  try {
    window.gtag("event", name, safeParams);
  } catch (err) {
    // Silently fail to ensure UI and user flow are never interrupted
    if (process.env.NODE_ENV === "development") {
      console.warn(`[GA4] Failed to dispatch event "${name}":`, err);
    }
  }
}
