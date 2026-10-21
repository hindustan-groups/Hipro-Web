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
  brandTitle: string;
  brandTagline: string;
  badgeLabel: string;
  headerBg: string;
  headerAccent: string;
  badgeColor: string;
  badgeBg: string;
  accentBarColor: string;
  websiteUrl: string;
  websiteDisplay: string;
  contactEmail: string;
  helplinePhone: string;
  divisionLabel: string;
  trustPoints: [string, string, string];
}

export const CORPORATE_BRAND_METADATA: Record<string, BrandMetadata> = {
  hipro: {
    brandKey: "hipro",
    brandTitle: "HINDUSTAN PROJECTS",
    brandTagline: "Civil Engineering • Turnkey Construction • Architectural Planning • Infrastructure",
    badgeLabel: "OFFICIAL CORPORATE DISPATCH",
    headerBg: "linear-gradient(135deg, #090e1a 0%, #0f172a 60%, #1e293b 100%)",
    headerAccent: "#dc2626",
    badgeColor: "#fca5a5",
    badgeBg: "rgba(220, 38, 38, 0.25)",
    accentBarColor: "#dc2626",
    websiteUrl: "https://www.hindustanprojects.in",
    websiteDisplay: "www.hindustanprojects.in",
    contactEmail: "info@hindustanprojects.in",
    helplinePhone: "+91 75970 00601",
    divisionLabel: "Civil Engineering, EPC & Turnkey Infrastructure Directorate",
    trustPoints: [
      "ISO 9001:2015 Quality Certified",
      "Govt Approved EPC Contractor",
      "150+ Verified Completed Landmarks",
    ],
  },
  hbs: {
    brandKey: "hbs",
    brandTitle: "HIND BUILDING SOLUTIONS",
    brandTagline: "Structural Repair • 100% Guaranteed Waterproofing • PU Crack Injection • AMC",
    badgeLabel: "HiBUILD STRUCTURAL CARE DESK",
    headerBg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 60%, #991b1b 100%)",
    headerAccent: "#ef4444",
    badgeColor: "#fecaca",
    badgeBg: "rgba(239, 68, 68, 0.25)",
    accentBarColor: "#b91c1c",
    websiteUrl: "https://hindbuilding.hindustanprojects.in",
    websiteDisplay: "hindbuilding.hindustanprojects.in",
    contactEmail: "hbs@hindustanprojects.in",
    helplinePhone: "+91 75970 00601",
    divisionLabel: "HiBUILD Property Protection & Waterproofing Division • Hindustan Projects",
    trustPoints: [
      "10-Year Waterproofing Warranty",
      "Non-Destructive Thermal Leakage Audit",
      "German Polymer & PU Chemical Tech",
    ],
  },
  empanelment: {
    brandKey: "empanelment",
    brandTitle: "HINDUSTAN PROJECTS",
    brandTagline: "Procurement Directorate • Vendor & Contractor Empanelment Board",
    badgeLabel: "OFFICIAL PROCUREMENT & TENDER DESK",
    headerBg: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #78350f 100%)",
    headerAccent: "#f59e0b",
    badgeColor: "#fef3c7",
    badgeBg: "rgba(245, 158, 11, 0.25)",
    accentBarColor: "#d97706",
    websiteUrl: "https://empanelment.hindustanprojects.in",
    websiteDisplay: "empanelment.hindustanprojects.in",
    contactEmail: "empanelment@hindustanprojects.in",
    helplinePhone: "+91 75970 00601",
    divisionLabel: "Central Procurement, Contractor Empanelment & Site Logistics Directorate",
    trustPoints: [
      "Central Vendor Registry & Smart Card",
      "Strict 14-Day RA Bill Clearance",
      "Commercial Work Packages & Tenders",
    ],
  },
  all: {
    brandKey: "all",
    brandTitle: "HINDUSTAN PROJECTS GROUP",
    brandTagline: "Civil Engineering • Turnkey Construction • Building Repairs • Procurement Hub",
    badgeLabel: "OFFICIAL EXECUTIVE DISPATCH",
    headerBg: "linear-gradient(135deg, #090e1a 0%, #0f172a 60%, #1e293b 100%)",
    headerAccent: "#dc2626",
    badgeColor: "#93c5fd",
    badgeBg: "rgba(37, 99, 235, 0.25)",
    accentBarColor: "#2563eb",
    websiteUrl: "https://www.hindustanprojects.in",
    websiteDisplay: "www.hindustanprojects.in",
    contactEmail: "info@hindustanprojects.in",
    helplinePhone: "+91 75970 00601",
    divisionLabel: "Hindustan Projects Group • Engineering, Infrastructure & Building Care",
    trustPoints: [
      "ISO 9001:2015 Quality Certified",
      "Govt Approved EPC Contractor",
      "Pan-Rajasthan Project Footprint",
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
    /* Reset & Client-Specific Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 100%; background-color: #f1f5f9; }
    
    /* Responsive Queries */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
      .mobile-padding { padding-left: 18px !important; padding-right: 18px !important; }
      .mobile-stack { display: block !important; width: 100% !important; text-align: left !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
      .brand-title { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">

  <!-- Preheader text for inbox preview snippet (hidden in body) -->
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(preheader)} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <!-- Outer Background Table -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center" valign="top">
        
        <!-- Main Email Container (Max 600px) -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
          
          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- 1. TOP METADATA & VERIFICATION STRIP -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td style="background-color: #090e17; padding: 8px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #22c55e; margin-right: 6px; vertical-align: middle;"></span>
                    <span>VERIFIED DISPATCH</span>
                    <span style="color: #475569; margin: 0 6px;">•</span>
                    <span style="color: #cbd5e1;">${escapeHtml(formattedDate)}</span>
                  </td>
                  <td align="right" class="mobile-hide" style="font-size: 10px; font-family: 'SF Mono', Consolas, monospace; color: #94a3b8; letter-spacing: 0.5px;">
                    REF: <strong style="color: #e2e8f0;">${escapeHtml(refCode)}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- 2. OFFICIAL CORPORATE BRAND HEADER -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td style="background: ${meta.headerBg}; padding: 30px 24px 24px; text-align: center; border-bottom: 4px solid ${meta.accentBarColor};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    
                    <!-- Top Category Badge Pill -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                      <tr>
                        <td align="center" style="background-color: ${meta.badgeBg}; border: 1px solid rgba(255,255,255,0.18); border-radius: 20px; padding: 4px 14px;">
                          <span style="color: ${meta.badgeColor}; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                            ${escapeHtml(meta.badgeLabel)}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Main Brand Corporate Title -->
                    <h1 class="brand-title" style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1.8px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
                      ${escapeHtml(meta.brandTitle)}
                    </h1>

                    <!-- Division / Sub-title -->
                    <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; line-height: 1.4;">
                      ${escapeHtml(meta.brandTagline)}
                    </p>

                    <!-- Trust Strip Badges -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 14px;">
                      <tr>
                        <td align="center">
                          <span style="display: inline-block; font-size: 10px; color: #94a3b8; font-weight: 600; margin: 2px 6px;">
                            🏛️ ${escapeHtml(meta.trustPoints[0])}
                          </span>
                          <span style="display: inline-block; font-size: 10px; color: #94a3b8; font-weight: 600; margin: 2px 6px;">
                            🛡️ ${escapeHtml(meta.trustPoints[1])}
                          </span>
                          <span style="display: inline-block; font-size: 10px; color: #94a3b8; font-weight: 600; margin: 2px 6px;">
                            ⚡ ${escapeHtml(meta.trustPoints[2])}
                          </span>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- 3. MAIN EMAIL BODY CONTENT -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td class="mobile-padding" style="padding: 30px 28px; background-color: #ffffff; color: #1e293b; font-size: 14px; line-height: 1.65;">
              ${innerContent}
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- 4. OFFICIAL CONTACT & QUICK ACTION BAR -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 24px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding: 4px 8px;">
                          <a href="${meta.websiteUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 8px 16px; border-radius: 6px; letter-spacing: 0.5px;">
                            🌐 Visit ${escapeHtml(meta.websiteDisplay)}
                          </a>
                        </td>
                        <td align="center" style="padding: 4px 8px;">
                          <a href="https://wa.me/917597000601" target="_blank" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 8px 16px; border-radius: 6px; letter-spacing: 0.5px;">
                            💬 WhatsApp: ${escapeHtml(meta.helplinePhone)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- 5. CORPORATE HEADQUARTERS & CREDENTIALS FOOTER -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <tr data-hipro-corporate-footer="true">
            <td style="background-color: #0f172a; color: #cbd5e1; padding: 28px 24px 22px; font-size: 11px; line-height: 1.6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                
                <!-- Company Name & Division -->
                <tr>
                  <td align="center" style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 14px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                      ${escapeHtml(meta.brandTitle)}
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 3px; font-weight: 600;">
                      ${escapeHtml(meta.divisionLabel)}
                    </div>
                  </td>
                </tr>

                <!-- Registered Address & Helplines -->
                <tr>
                  <td align="center" style="padding: 14px 8px 10px;">
                    <p style="margin: 0; color: #e2e8f0; font-size: 11px; font-weight: 600;">
                      📍 <strong>Corporate HQ:</strong> Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara - 311001, Rajasthan, India
                    </p>
                    <p style="margin: 6px 0 0; color: #94a3b8; font-size: 11px;">
                      📞 <strong>Site Helpline:</strong> <a href="tel:+917597000601" style="color: #38bdf8; text-decoration: none;">+91 75970 00601</a>
                      <span style="color: #475569; margin: 0 6px;">•</span>
                      ✉️ <strong>Official Email:</strong> <a href="mailto:${meta.contactEmail}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(meta.contactEmail)}</a>
                    </p>
                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 10px;">
                      🏗️ Project Operations Active in Bhilwara, Jaipur, Udaipur, Jodhpur, Kota & Pan-Rajasthan
                    </p>
                  </td>
                </tr>

                <!-- Legal & Statutory Confidentiality Disclaimer -->
                <tr>
                  <td style="padding: 12px 10px; background-color: rgba(0, 0, 0, 0.35); border-radius: 6px; margin: 10px 0; border: 1px solid rgba(255,255,255,0.06);">
                    <p style="margin: 0; font-size: 9.5px; line-height: 1.45; color: #94a3b8; text-align: justify;">
                      <strong style="color: #cbd5e1;">CONFIDENTIALITY & LEGAL NOTICE:</strong> This electronic mail transmission, including any attachments, contains information which may be confidential, legally privileged, and protected from disclosure under applicable laws. It is intended solely for the use of the individual or entity to whom it is addressed (recipient: <strong style="color: #f1f5f9;">${escapeHtml(recipientEmail)}</strong>). If you are not the intended recipient, please be advised that any review, dissemination, copying, or taking of any action in reliance upon the contents of this communication is strictly prohibited. If you have received this transmission in error, please immediately notify the sender by reply email and permanently delete all copies of this transmission.
                    </p>
                  </td>
                </tr>

                <!-- System Attribution & Copyright -->
                <tr>
                  <td align="center" style="padding-top: 14px; font-size: 10px; color: #64748b;">
                    <p style="margin: 0;">
                      ⚡ Dispatched via <strong>Hindustan Projects AutoMail Engine</strong> • Dispatch Reference ID: <strong style="color: #94a3b8;">${escapeHtml(refCode)}</strong>
                    </p>
                    <p style="margin: 4px 0 0;">
                      © ${currentYear} <strong>Hindustan Projects Group</strong>. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
        <!-- End Main Email Container -->

      </td>
    </tr>
  </table>
  <!-- End Outer Background Table -->

</body>
</html>`;
}

/**
 * Basic HTML escaping helper to prevent script injection in subject/names
 */
function escapeHtml(text?: string | null): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
