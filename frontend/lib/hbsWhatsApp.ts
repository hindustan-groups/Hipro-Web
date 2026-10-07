/**
 * hbsWhatsApp.ts
 * Unified, safe, and context-aware WhatsApp & phone utilities for Hind Build.
 * 
 * Centralizes all wa.me URL construction to ensure:
 * 1. Safe phone number sanitization (Indian 10-digit mobile prefix normalization)
 * 2. Proper URI encoding of human-readable messages (never internal slugs)
 * 3. Consistent, professional Hind Build greetings (never legacy names or HBS abbreviations)
 * 4. Context-aware messaging tailored to Homepage, Services, Projects, and Lead Confirmation
 */

const DEFAULT_HBS_PHONE = "+91 75970 00601";
const DEFAULT_HBS_WHATSAPP_CLEAN = "917597000601";

/**
 * Normalizes a raw phone/WhatsApp string into clean digits suitable for wa.me URLs.
 * If 10 digits (e.g. 7597000601), prepends '91' country code.
 * If starts with +91 or 91, retains international digits.
 */
export function cleanWhatsAppNumber(raw?: string | null): string {
  if (!raw) return DEFAULT_HBS_WHATSAPP_CLEAN;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return DEFAULT_HBS_WHATSAPP_CLEAN;
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Normalizes a raw phone number for tel: links (e.g. +917597000601).
 */
export function cleanTelNumber(raw?: string | null): string {
  if (!raw) return "+917597000601";
  const cleaned = raw.replace(/[^\d+]/g, "");
  return cleaned || "+917597000601";
}

/**
 * Builds a standardized wa.me URL with clean digits and URL-encoded message.
 */
export function buildHbsWhatsAppUrl(
  whatsappNumber?: string | null,
  message?: string
): string {
  const number = cleanWhatsAppNumber(whatsappNumber);
  const defaultText = "Hi Hind Build, I would like to know more about your services.";
  const text = message && message.trim().length > 0 ? message.trim() : defaultText;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/**
 * Context-aware WhatsApp URL for the Homepage.
 */
export function getHomeWhatsAppUrl(whatsappNumber?: string | null): string {
  return buildHbsWhatsAppUrl(
    whatsappNumber,
    "Hi Hind Build, I would like to know more about your services."
  );
}

/**
 * Context-aware WhatsApp URL for a Service detail page or card.
 */
export function getServiceWhatsAppUrl(
  whatsappNumber: string | null | undefined,
  serviceTitle: string
): string {
  const title = serviceTitle.trim() || "Building Repair";
  return buildHbsWhatsAppUrl(
    whatsappNumber,
    `Hi Hind Build, I am interested in ${title}. Please share the details and quotation process.`
  );
}

/**
 * Context-aware WhatsApp URL for a Project case study page or card.
 */
export function getProjectWhatsAppUrl(
  whatsappNumber: string | null | undefined,
  projectTitle: string
): string {
  const title = projectTitle.trim() || "Property Renovation";
  return buildHbsWhatsAppUrl(
    whatsappNumber,
    `Hi Hind Build, I would like to discuss a project similar to ${title}.`
  );
}

/**
 * Context-aware WhatsApp URL for general Contact page inquiries.
 */
export function getContactWhatsAppUrl(whatsappNumber?: string | null): string {
  return buildHbsWhatsAppUrl(
    whatsappNumber,
    "Hi Hind Build, I would like to request a quotation."
  );
}

/**
 * Smart WhatsApp URL for Lead Submission Success confirmation.
 * Prefills lead reference ID and selected services without exposing sensitive personal info.
 */
export function getLeadSuccessWhatsAppUrl(
  whatsappNumber: string | null | undefined,
  referenceId: string,
  selectedServices: string[]
): string {
  const ref = referenceId ? `#${referenceId.replace(/^#/, "")}` : "#HB-QUOTE";
  const servicesText =
    selectedServices && selectedServices.length > 0
      ? selectedServices.join(", ")
      : "General Site Inspection";

  const message = `Hi Hind Build, I submitted a quote request.\n\nReference: ${ref}\n\nServices:\n${servicesText}\n\nPlease help me with the next steps.`;

  return buildHbsWhatsAppUrl(whatsappNumber, message);
}
