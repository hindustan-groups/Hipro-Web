/**
 * hiproWhatsApp.ts
 * Unified, safe, and context-aware WhatsApp URL utilities for Hindustan Projects (HiPRO).
 * 
 * Centralizes all wa.me URL construction to ensure:
 * 1. Safe phone number sanitization (Indian 10-digit mobile prefix normalization to 91XXXXXXXXXX)
 * 2. Proper URI encoding of professional, context-specific pre-filled messages
 * 3. Consistent, professional Hindustan Projects (HiPRO) brand tone
 * 4. Context-aware messaging tailored for Homepage, Services, Projects, Estimator, and Contact pages
 */

export const DEFAULT_HIPRO_PHONE = "+91 75970 00601";
export const DEFAULT_HIPRO_WHATSAPP_CLEAN = "917597000601";

/**
 * Normalizes a raw phone/WhatsApp string into clean digits suitable for wa.me URLs.
 * If 10 digits (e.g. 7597000601), prepends '91' country code.
 * If starts with +91 or 91, retains international digits.
 */
export function cleanWhatsAppNumber(raw?: string | null): string {
  if (!raw) return DEFAULT_HIPRO_WHATSAPP_CLEAN;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return DEFAULT_HIPRO_WHATSAPP_CLEAN;
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
export function buildHiproWhatsAppUrl(
  whatsappNumber?: string | null,
  message?: string
): string {
  const number = cleanWhatsAppNumber(whatsappNumber);
  const defaultText = "Hello Hindustan Projects, I would like to discuss a construction/engineering project.";
  const text = message && message.trim().length > 0 ? message.trim() : defaultText;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/**
 * Context-aware WhatsApp URL for General / Homepage inquiries.
 */
export function getGeneralWhatsAppUrl(whatsappNumber?: string | null): string {
  return buildHiproWhatsAppUrl(
    whatsappNumber,
    "Hello Hindustan Projects, I would like to discuss a construction/engineering project."
  );
}

/**
 * Context-aware WhatsApp URL for Quotation & Consultation (e.g. Footer consultation banner, CTA section).
 */
export function getConsultationWhatsAppUrl(whatsappNumber?: string | null): string {
  return buildHiproWhatsAppUrl(
    whatsappNumber,
    "Hello Hindustan Projects, I would like to request a project quotation and engineering consultation."
  );
}

/**
 * Context-aware WhatsApp URL for a Service detail page or card.
 */
export function getServiceWhatsAppUrl(
  serviceTitle?: string | null,
  whatsappNumber?: string | null
): string {
  const title = serviceTitle?.trim() || "";
  const message = title
    ? `Hello Hindustan Projects, I am interested in your ${title} services. Please share more details and the consultation process.`
    : "Hello Hindustan Projects, I would like to know more about your engineering and construction services.";
  return buildHiproWhatsAppUrl(whatsappNumber, message);
}

/**
 * Context-aware WhatsApp URL for a Project case study page or card.
 */
export function getProjectWhatsAppUrl(
  projectTitle?: string | null,
  whatsappNumber?: string | null
): string {
  const title = projectTitle?.trim() || "";
  const message = title
    ? `Hello Hindustan Projects, I would like to enquire about your project: ${title}.`
    : "Hello Hindustan Projects, I would like to discuss a project similar to your executed portfolio.";
  return buildHiproWhatsAppUrl(whatsappNumber, message);
}

/**
 * Context-aware WhatsApp URL for Cost Estimator inquiries.
 */
export function getCostEstimatorWhatsAppUrl(whatsappNumber?: string | null): string {
  return buildHiproWhatsAppUrl(
    whatsappNumber,
    "Hello Hindustan Projects, I have an architectural plan and would like a detailed BOQ quote and cost estimate."
  );
}

/**
 * Context-aware WhatsApp URL for Contact page inquiries.
 */
export function getContactWhatsAppUrl(
  whatsappNumber?: string | null,
  options?: { isDrawingReview?: boolean }
): string {
  if (options?.isDrawingReview) {
    return buildHiproWhatsAppUrl(
      whatsappNumber,
      "Hello Hindustan Projects, I have an engineering query / drawing review and would like to consult your team."
    );
  }
  return buildHiproWhatsAppUrl(
    whatsappNumber,
    "Hello Hindustan Projects, I would like to get in touch with your engineering team regarding construction services."
  );
}

