/**
 * Corporate Email Template & Layout Wrapper
 * Ensures 100% of emails dispatched via the AutoMail engine contain the official
 * Hindustan Projects corporate header, trust badges, verified company credentials,
 * corporate office address, direct helplines, legal confidentiality disclaimers,
 * and standard footer across all brand divisions (HiPRO, HBS, Empanelment).
 */

export interface CorporateEmailOptions {
  brand?: "hipro" | "hbs" | "empanelment" | "all" | string;
  subject?: string;
  recipientName?: string | null;
  recipientEmail?: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
  preheaderText?: string;
  referenceId?: string;
}

export interface BrandMetadata {
  brandKey: string;
  portalCode: string;
  monogram: string;
  monogramBg: string;
  logoUrl: string;
  logoAlt: string;
  brandTitle: string;
  brandTagline: string;
  badgeLabel: string;
  headerBg: string;
  headerAccent: string;
  badgeColor: string;
  badgeBg: string;
  accentBarColor: string;
  ctaBg: string;
  websiteUrl: string;
  websiteDisplay: string;
  contactEmail: string;
  helplinePhone: string;
  divisionLabel: string;
  trustPoints: [string, string, string];
  quickLinks: Array<{ label: string; url: string }>;
}

export const CORPORATE_BRAND_METADATA: Record<string, BrandMetadata> = {
  hipro: {
    brandKey: "hipro",
    portalCode: "HiPRO CIVIL PORTAL",
    monogram: "HP",
    monogramBg: "#1d4ed8",
    logoUrl: "https://www.hindustanprojects.in/hipro-logo.jpg",
    logoAlt: "Hindustan Projects (HiPRO)",
    brandTitle: "HINDUSTAN PROJECTS",
    brandTagline: "Civil Engineering • Turnkey EPC • Architectural Design • Infrastructure",
    badgeLabel: "OFFICIAL CORPORATE DISPATCH",
    headerBg: "linear-gradient(135deg, #071124 0%, #0f1f3d 55%, #172e54 100%)",
    headerAccent: "#dc2626",
    badgeColor: "#fecaca",
    badgeBg: "rgba(220, 38, 38, 0.22)",
    accentBarColor: "#dc2626",
    ctaBg: "#0f1f3d",
    websiteUrl: "https://www.hindustanprojects.in",
    websiteDisplay: "www.hindustanprojects.in",
    contactEmail: "info@hindustanprojects.in",
    helplinePhone: "+91 75970 00601",
    divisionLabel: "Civil Engineering, EPC & Turnkey Infrastructure Directorate",
    trustPoints: [
      "Quality-First Civil Execution",
      "Transparent BOQ & Costing",
      "Pan-Rajasthan Project Delivery",
    ],
    quickLinks: [
      { label: "Official Website", url: "https://www.hindustanprojects.in" },
      { label: "Projects", url: "https://www.hindustanprojects.in/projects" },
      { label: "Cost Estimator", url: "https://www.hindustanprojects.in/cost-estimator" },
      { label: "Contact Us", url: "https://www.hindustanprojects.in/contact" },
    ],
  },
  hbs: {
    brandKey: "hbs",
    portalCode: "HiBUILD HBS CARE",
    monogram: "HB",
    monogramBg: "#b91c1c",
    logoUrl: "https://www.hindustanprojects.in/hibuild-brand-logo.png",
    logoAlt: "Hind Building Solutions (HiBUILD)",
    brandTitle: "HIND BUILDING SOLUTIONS",
    brandTagline: "Structural Rehabilitation • Guaranteed Waterproofing • PU Crack Injection",
    badgeLabel: "HiBUILD STRUCTURAL CARE DESK",
    headerBg: "linear-gradient(135deg, #3b0707 0%, #6b1111 55%, #991b1b 100%)",
    headerAccent: "#f59e0b",
    badgeColor: "#fef3c7",
    badgeBg: "rgba(245, 158, 11, 0.22)",
    accentBarColor: "#d97706",
    ctaBg: "#991b1b",
    websiteUrl: "https://hindbuilding.hindustanprojects.in",
    websiteDisplay: "hindbuilding.hindustanprojects.in",
    contactEmail: "hbs@hindustanprojects.in",
    helplinePhone: "+91 75970 00601",
    divisionLabel: "HiBUILD Property Protection & Waterproofing Division • Hindustan Projects",
    trustPoints: [
      "5–10 Yr Written Warranty",
      "Thermal Moisture Diagnostics",
      "German Polymer Chemical Systems",
    ],
    quickLinks: [
      { label: "HBS Portal", url: "https://hindbuilding.hindustanprojects.in" },
      { label: "Services", url: "https://hindbuilding.hindustanprojects.in/services" },
      { label: "Projects", url: "https://hindbuilding.hindustanprojects.in/projects" },
      { label: "Free Inspection", url: "https://hindbuilding.hindustanprojects.in/contact" },
    ],
  },
  empanelment: {
    brandKey: "empanelment",
    portalCode: "VENDOR EMPANELMENT HUB",
    monogram: "EP",
    monogramBg: "#b45309",
    logoUrl: "https://www.hindustanprojects.in/hipro-logo.jpg",
    logoAlt: "Hindustan Projects Empanelment Hub",
    brandTitle: "HINDUSTAN PROJECTS",
    brandTagline: "Procurement Directorate • Contractor Empanelment • Tenders & Gate Access",
    badgeLabel: "OFFICIAL PROCUREMENT & TENDER DESK",
    headerBg: "linear-gradient(135deg, #0b1322 0%, #162235 55%, #451a03 100%)",
    headerAccent: "#f59e0b",
    badgeColor: "#fde68a",
    badgeBg: "rgba(245, 158, 11, 0.22)",
    accentBarColor: "#d97706",
    ctaBg: "#b45309",
    websiteUrl: "https://empanelment.hindustanprojects.in",
    websiteDisplay: "empanelment.hindustanprojects.in",
    contactEmail: "empanelment@hindustanprojects.in",
    helplinePhone: "+91 75970 00601",
    divisionLabel: "Central Procurement, Contractor Empanelment & Site Logistics Directorate",
    trustPoints: [
      "Verified Vendor Registry",
      "14-Day RA Bill Clearance",
      "QR Digital Site Gate Pass",
    ],
    quickLinks: [
      { label: "Empanelment Hub", url: "https://empanelment.hindustanprojects.in" },
      { label: "Live Tenders", url: "https://empanelment.hindustanprojects.in/tenders" },
      { label: "Vendor Login", url: "https://empanelment.hindustanprojects.in/login" },
      { label: "Gate Pass", url: "https://empanelment.hindustanprojects.in/gate-pass" },
    ],
  },
  all: {
    brandKey: "all",
    portalCode: "HINDUSTAN GROUP HQ",
    monogram: "HG",
    monogramBg: "#2563eb",
    logoUrl: "https://www.hindustanprojects.in/hipro-logo.jpg",
    logoAlt: "Hindustan Projects Group",
    brandTitle: "HINDUSTAN PROJECTS GROUP",
    brandTagline: "Civil Engineering • Turnkey Construction • Building Care • Procurement Hub",
    badgeLabel: "OFFICIAL EXECUTIVE DISPATCH",
    headerBg: "linear-gradient(135deg, #090e1a 0%, #0f172a 60%, #1e293b 100%)",
    headerAccent: "#dc2626",
    badgeColor: "#bfdbfe",
    badgeBg: "rgba(37, 99, 235, 0.24)",
    accentBarColor: "#2563eb",
    ctaBg: "#0f172a",
    websiteUrl: "https://www.hindustanprojects.in",
    websiteDisplay: "www.hindustanprojects.in",
    contactEmail: "info@hindustanprojects.in",
    helplinePhone: "+91 75970 00601",
    divisionLabel: "Hindustan Projects Group • Engineering, Infrastructure & Building Care",
    trustPoints: [
      "Quality-First Civil Execution",
      "Multi-Division Turnkey Delivery",
      "Pan-Rajasthan Project Footprint",
    ],
    quickLinks: [
      { label: "HiPRO Civil", url: "https://www.hindustanprojects.in" },
      { label: "Hind Build (HBS)", url: "https://hindbuilding.hindustanprojects.in" },
      { label: "Vendor Hub", url: "https://empanelment.hindustanprojects.in" },
      { label: "Contact HQ", url: "https://www.hindustanprojects.in/contact" },
    ],
  },
};

export function getBrandMetadata(brand?: string): BrandMetadata {
  const key = (brand || "hipro").toLowerCase().trim();
  if (key.includes("hbs") || key.includes("hibuild") || key.includes("hindbuilding")) {
    return CORPORATE_BRAND_METADATA.hbs;
  }
  if (key.includes("empanel") || key.includes("vendor") || key.includes("procurement")) {
    return CORPORATE_BRAND_METADATA.empanelment;
  }
  if (key === "all" || key.includes("group")) {
    return CORPORATE_BRAND_METADATA.all;
  }
  return CORPORATE_BRAND_METADATA.hipro;
}

/**
 * Generate a clean reference code for trackability
 */
function generateRefCode(prefix: string): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
}

/**
 * Check if the provided HTML already contains our corporate header & footer
 */
export function isAlreadyCorporatelyBranded(html: string): boolean {
  if (!html) return false;
  return (
    html.includes("data-hipro-branded=\"true\"") ||
    html.includes("data-hipro-corporate-footer=\"true\"") ||
    (html.includes("Bhopal Ganj") && html.includes("CONFIDENTIALITY NOTICE"))
  );
}

/**
 * Strip outer <html>, <head>, <body> tags if caller passed an existing document
 * so we can nest it cleanly inside our standardized corporate container.
 */
function extractBodyContent(rawHtml: string): string {
  if (!rawHtml) return "";
  let content = rawHtml;

  // If it's a full HTML document, extract between <body> and </body>
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    content = bodyMatch[1].trim();
  }

  // Remove standalone <!DOCTYPE>, <html>, </html>, <head>...</head> if still present
  content = content
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .trim();

  return content;
}

/**
 * Wrap any email body (text, partial HTML, or full template) with the official
 * Hindustan Projects corporate header, trust strip, verified office credentials,
 * direct contact helplines, confidentiality notice, and footer.
 */
export function wrapWithCorporateTemplate(
  contentHtml: string,
  options: CorporateEmailOptions = {}
): string {
  // If already corporately branded with full header & footer, return as is
  if (isAlreadyCorporatelyBranded(contentHtml)) {
    return contentHtml;
  }

  const meta = getBrandMetadata(options.brand);
  const now = new Date();
  const currentYear = now.getFullYear();
  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const refCode = options.referenceId || generateRefCode(meta.brandKey.toUpperCase());
  const recipientEmail = options.recipientEmail || "{{email}}";
  const effectiveContactEmail = options.senderEmail?.trim() || meta.contactEmail;
  const subjectText = options.subject || `${meta.brandTitle} Official Communication`;
  const preheader = options.preheaderText || subjectText;

  const innerContent = extractBodyContent(contentHtml);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" data-hipro-branded="true">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(subjectText)}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 100%; background-color: #eef2f7; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 10px !important; }
      .mobile-padding { padding: 22px 18px !important; }
      .mobile-hide { display: none !important; }
      .brand-title { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #eef2f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">

  <div style="display: none; font-size: 1px; color: #eef2f7; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(preheader)} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eef2f7; padding: 28px 10px;">
    <tr>
      <td align="center" valign="top">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);">
          
          <!-- 1. TOP METADATA & PORTAL STRIP -->
          <tr>
            <td style="background-color: #070d19; padding: 9px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.9px;">
                    <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: #22c55e; margin-right: 6px; vertical-align: middle;"></span>
                    <span style="color: #e2e8f0;">${escapeHtml(meta.portalCode)}</span>
                    <span style="color: #475569; margin: 0 6px;">&bull;</span>
                    <span style="color: #94a3b8;">${escapeHtml(formattedDate)}</span>
                  </td>
                  <td align="right" class="mobile-hide" style="font-size: 10px; font-family: 'SF Mono', Consolas, monospace; color: #94a3b8; letter-spacing: 0.5px;">
                    REF <strong style="color: #e2e8f0;">${escapeHtml(refCode)}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. EXECUTIVE CORPORATE HEADER -->
          <tr>
            <td style="background: ${meta.headerBg}; padding: 28px 26px 24px; text-align: center; border-bottom: 4px solid ${meta.accentBarColor};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 14px;">
                      <tr>
                        <td align="center" valign="middle" style="background-color: #ffffff; border-radius: 10px; padding: 5px 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.18);">
                          <a href="${meta.websiteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="${meta.logoUrl}" alt="${escapeHtml(meta.logoAlt)}" height="32" style="display: block; height: 32px; width: auto; max-width: 140px; border: 0; border-radius: 4px;" />
                          </a>
                        </td>
                        <td style="width: 10px;"></td>
                        <td align="center" style="background-color: ${meta.badgeBg}; border: 1px solid rgba(255,255,255,0.18); border-radius: 20px; padding: 6px 14px;">
                          <span style="color: ${meta.badgeColor}; font-size: 10px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase;">
                            ${escapeHtml(meta.badgeLabel)}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <h1 class="brand-title" style="margin: 0; color: #ffffff; font-size: 23px; font-weight: 900; letter-spacing: 1.6px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.25;">
                      ${escapeHtml(meta.brandTitle)}
                    </h1>

                    <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 11px; font-weight: 700; letter-spacing: 0.9px; text-transform: uppercase; line-height: 1.45;">
                      ${escapeHtml(meta.brandTagline)}
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px;">
                      <tr>
                        <td align="center">
                          <span style="display: inline-block; font-size: 10px; color: #cbd5e1; font-weight: 600; margin: 2px 8px;">&#10003; ${escapeHtml(meta.trustPoints[0])}</span>
                          <span style="display: inline-block; font-size: 10px; color: #cbd5e1; font-weight: 600; margin: 2px 8px;">&#10003; ${escapeHtml(meta.trustPoints[1])}</span>
                          <span style="display: inline-block; font-size: 10px; color: #cbd5e1; font-weight: 600; margin: 2px 8px;">&#10003; ${escapeHtml(meta.trustPoints[2])}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 3. MAIN EMAIL BODY CONTENT -->
          <tr>
            <td class="mobile-padding" style="padding: 32px 28px; background-color: #ffffff; color: #1e293b; font-size: 14px; line-height: 1.7;">
              ${innerContent}
            </td>
          </tr>

          <!-- 4. OFFICIAL PORTAL & HELPLINE BAR -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding: 4px 6px;">
                          <a href="${meta.websiteUrl}" target="_blank" style="display: inline-block; background-color: ${meta.ctaBg}; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 9px 18px; border-radius: 8px; letter-spacing: 0.4px;">
                            Visit ${escapeHtml(meta.websiteDisplay)} &rarr;
                          </a>
                        </td>
                        <td align="center" style="padding: 4px 6px;">
                          <a href="https://wa.me/917597000601" target="_blank" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 9px 18px; border-radius: 8px; letter-spacing: 0.4px;">
                            WhatsApp Desk: ${escapeHtml(meta.helplinePhone)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 5. CORPORATE HEADQUARTERS & CREDENTIALS FOOTER -->
          <tr data-hipro-corporate-footer="true">
            <td style="background-color: #090e1a; color: #cbd5e1; padding: 26px 24px 20px; font-size: 11px; line-height: 1.6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <div style="font-size: 13px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                      ${escapeHtml(meta.brandTitle)}
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 3px; font-weight: 600;">
                      ${escapeHtml(meta.divisionLabel)}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding: 14px 8px 10px;">
                    <p style="margin: 0 0 10px;">
                      ${meta.quickLinks
                        .map(
                          (lnk) =>
                            `<a href="${lnk.url}" target="_blank" style="display: inline-block; color: #93c5fd; font-size: 10.5px; font-weight: 700; text-decoration: none; margin: 2px 8px;">${escapeHtml(lnk.label)}</a>`
                        )
                        .join('<span style="color: #475569;">&bull;</span>')}
                    </p>
                    <p style="margin: 0; color: #e2e8f0; font-size: 11px; font-weight: 600;">
                      <strong>Corporate HQ:</strong> Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara - 311001, Rajasthan
                    </p>
                    <p style="margin: 6px 0 0; color: #94a3b8; font-size: 11px;">
                      <strong>Site Helpline:</strong> <a href="tel:+917597000601" style="color: #60a5fa; text-decoration: none;">+91 75970 00601</a>
                      <span style="color: #475569; margin: 0 6px;">&bull;</span>
                      <strong>Official Desk:</strong> <a href="mailto:${escapeHtml(effectiveContactEmail)}" style="color: #60a5fa; text-decoration: none;">${escapeHtml(effectiveContactEmail)}</a>
                    </p>
                    <p style="margin: 4px 0 0; color: #64748b; font-size: 10px;">
                      Active Operations: Bhilwara &bull; Jaipur &bull; Udaipur &bull; Jodhpur &bull; Kota &bull; Pan-Rajasthan
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 11px 12px; background-color: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.07);">
                    <p style="margin: 0; font-size: 9.5px; line-height: 1.5; color: #94a3b8; text-align: justify;">
                      <strong style="color: #cbd5e1;">CONFIDENTIALITY &amp; STATUTORY NOTICE:</strong> This electronic transmission is intended solely for <strong style="color: #f1f5f9;">${escapeHtml(recipientEmail)}</strong> and contains confidential information of Hindustan Projects Group. Unauthorized dissemination or copying is strictly prohibited.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-top: 14px; font-size: 10px; color: #64748b;">
                    <p style="margin: 0;">
                      Dispatched via <strong style="color: #94a3b8;">Hindustan Projects AutoMail Engine</strong> &bull; Ref: <strong style="color: #94a3b8;">${escapeHtml(refCode)}</strong>
                    </p>
                    <p style="margin: 4px 0 0;">
                      &copy; ${currentYear} <strong>Hindustan Projects Group</strong>. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Basic HTML escaping helper to prevent script injection in subject/names
 */
export function escapeHtml(text?: string | null): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Convert clean plain-text message typed in a CRM reply box into formatted,
 * mobile-friendly HTML paragraphs while preserving full HTML templates as-is.
 */
export function plainTextToEmailHtml(input?: string | null): string {
  const raw = (input || "").trim();
  if (!raw) return "";

  // Preserve already structured HTML templates/snippets
  if (/<(div|table|p|h[1-6]|ul|ol|html|body|section|article)\b/i.test(raw)) {
    return raw;
  }

  const paragraphs = raw.split(/\n{2,}/);
  return paragraphs
    .map((para) => {
      const safeLines = escapeHtml(para.trim()).replace(/\n/g, "<br />");
      return `<p style="margin: 0 0 14px; color: #1e293b; font-size: 14px; line-height: 1.65;">${safeLines}</p>`;
    })
    .join("\n");
}
