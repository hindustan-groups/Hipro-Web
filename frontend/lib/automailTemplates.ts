export interface AutomailBusinessTemplate {
  id: string;
  title: string;
  category:
    | "Construction & Engineering"
    | "Building Repair & Maintenance"
    | "Formal Quotations"
    | "Client Relations"
    | "Vendor Empanelment & Procurement";
  brand: "hipro" | "hbs" | "empanelment" | "all";
  badge: string;
  description: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  html: string;
}

interface HeaderOptions {
  badge: string;
  title?: string;
  subtitle?: string;
}

/**
 * Standardized Corporate Brand Header for HTML Email Templates
 */
export function getCorporateEmailHeader(
  brand: "hipro" | "hbs" | "empanelment" | "all",
  options: HeaderOptions
): string {
  const isHbs = brand === "hbs";
  const isEmp = brand === "empanelment";
  const isAll = brand === "all";

  const brandTitle = isHbs
    ? "HIND BUILDING SOLUTIONS"
    : isEmp
    ? "HINDUSTAN PROJECTS"
    : isAll
    ? "HINDUSTAN PROJECTS GROUP"
    : "HINDUSTAN PROJECTS";

  const brandTagline = isHbs
    ? "Structural Repair • 100% Guaranteed Waterproofing • PU Crack Injection • AMC"
    : isEmp
    ? "Procurement Directorate • Vendor & Contractor Empanelment Board"
    : isAll
    ? "Civil Engineering • Building Care • Turnkey Construction • Procurement Hub"
    : "Civil Engineering • Turnkey Construction • Infrastructure • Architectural Design";

  const headerBg = isHbs
    ? "linear-gradient(135deg, #450a0a 0%, #7f1d1d 60%, #991b1b 100%)"
    : isEmp
    ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #78350f 100%)"
    : "linear-gradient(135deg, #090e1a 0%, #0f172a 60%, #1e293b 100%)";

  const accentBorder = isHbs ? "#b91c1c" : isEmp ? "#d97706" : "#dc2626";
  const badgeBg = isHbs ? "rgba(239, 68, 68, 0.25)" : isEmp ? "rgba(245, 158, 11, 0.25)" : "rgba(220, 38, 38, 0.25)";
  const badgeColor = isHbs ? "#fecaca" : isEmp ? "#fef3c7" : "#fca5a5";

  const trust1 = isHbs ? "10-Yr Waterproofing Warranty" : isEmp ? "Central Vendor Registry" : "ISO 9001:2015 Certified";
  const trust2 = isHbs ? "Thermal Moisture Audit" : isEmp ? "14-Day RA Bill Clearance" : "Govt Approved EPC";
  const trust3 = isHbs ? "German Polymer PU Tech" : isEmp ? "Active Commercial Tenders" : "150+ Landmarks Built";

  return `<!-- Top Metadata Strip -->
<tr>
  <td style="background-color: #090e17; padding: 8px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="left" style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #22c55e; margin-right: 6px; vertical-align: middle;"></span>
          <span>OFFICIAL TRANSMISSION</span>
          <span style="color: #475569; margin: 0 6px;">•</span>
          <span style="color: #cbd5e1;">{{date}}</span>
        </td>
        <td align="right" style="font-size: 10px; font-family: monospace; color: #94a3b8;">
          REF: <strong style="color: #e2e8f0;">#HP-{{year}}-DISPATCH</strong>
        </td>
      </tr>
    </table>
  </td>
</tr>

<!-- Corporate Brand Header -->
<tr>
  <td style="background: ${headerBg}; padding: 28px 24px 22px; text-align: center; border-bottom: 4px solid ${accentBorder};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
            <tr>
              <td align="center" style="background-color: ${badgeBg}; border: 1px solid rgba(255,255,255,0.18); border-radius: 20px; padding: 4px 14px;">
                <span style="color: ${badgeColor}; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                  ${options.badge}
                </span>
              </td>
            </tr>
          </table>

          <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.2;">
            ${brandTitle}
          </h1>

          <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; line-height: 1.4;">
            ${brandTagline}
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px;">
            <tr>
              <td align="center">
                <span style="display: inline-block; font-size: 10px; color: #94a3b8; font-weight: 600; margin: 2px 6px;">
                  🏛️ ${trust1}
                </span>
                <span style="display: inline-block; font-size: 10px; color: #94a3b8; font-weight: 600; margin: 2px 6px;">
                  🛡️ ${trust2}
                </span>
                <span style="display: inline-block; font-size: 10px; color: #94a3b8; font-weight: 600; margin: 2px 6px;">
                  ⚡ ${trust3}
                </span>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

/**
 * Standardized Corporate Brand Footer for HTML Email Templates
 */
export function getCorporateEmailFooter(brand: "hipro" | "hbs" | "empanelment" | "all"): string {
  const isHbs = brand === "hbs";
  const isEmp = brand === "empanelment";
  const websiteUrl = isHbs
    ? "https://hindbuilding.hindustanprojects.in"
    : isEmp
    ? "https://empanelment.hindustanprojects.in"
    : "https://www.hindustanprojects.in";

  const websiteDisplay = isHbs
    ? "hindbuilding.hindustanprojects.in"
    : isEmp
    ? "empanelment.hindustanprojects.in"
    : "www.hindustanprojects.in";

  const contactEmail = isHbs
    ? "hbs@hindustanprojects.in"
    : isEmp
    ? "empanelment@hindustanprojects.in"
    : "info@hindustanprojects.in";

  const divisionName = isHbs
    ? "Hind Building Solutions (HiBUILD) • A Hindustan Projects Specialized Division"
    : isEmp
    ? "Hindustan Projects Procurement & Vendor Empanelment Directorate"
    : "Hindustan Projects Private Limited • Civil Infrastructure & Turnkey EPC Contractors";

  return `<!-- Quick Action & Verification Bar -->
<tr>
  <td style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding: 4px 8px;">
                <a href="${websiteUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 8px 16px; border-radius: 6px;">
                  🌐 Visit ${websiteDisplay}
                </a>
              </td>
              <td align="center" style="padding: 4px 8px;">
                <a href="https://wa.me/917597000601" target="_blank" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 8px 16px; border-radius: 6px;">
                  💬 Direct Helpline: +91 75970 00601
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>

<!-- Official Corporate Headquarters & Credentials Footer -->
<tr data-hipro-corporate-footer="true">
  <td style="background-color: #0f172a; color: #cbd5e1; padding: 26px 24px 20px; font-size: 11px; line-height: 1.6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      
      <tr>
        <td align="center" style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 13px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
            ${divisionName}
          </div>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding: 12px 8px 8px;">
          <p style="margin: 0; color: #e2e8f0; font-size: 11px; font-weight: 600;">
            📍 <strong>Corporate HQ:</strong> Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara - 311001, Rajasthan, India
          </p>
          <p style="margin: 6px 0 0; color: #94a3b8; font-size: 11px;">
            📞 <strong>Helpline:</strong> <a href="tel:+917597000601" style="color: #38bdf8; text-decoration: none;">+91 75970 00601</a>
            <span style="color: #475569; margin: 0 6px;">•</span>
            ✉️ <strong>Official Email:</strong> <a href="mailto:${contactEmail}" style="color: #38bdf8; text-decoration: none;">${contactEmail}</a>
          </p>
          <p style="margin: 4px 0 0; color: #94a3b8; font-size: 10px;">
            🏗️ Operational across Bhilwara, Jaipur, Udaipur, Jodhpur, Kota & Pan-Rajasthan
          </p>
        </td>
      </tr>

      <!-- Legal Confidentiality Notice -->
      <tr>
        <td style="padding: 10px; background-color: rgba(0, 0, 0, 0.35); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <p style="margin: 0; font-size: 9.5px; line-height: 1.45; color: #94a3b8; text-align: justify;">
            <strong style="color: #cbd5e1;">CONFIDENTIALITY NOTICE:</strong> This electronic mail transmission, including any attachments, contains information which may be confidential, legally privileged, and protected from disclosure. It is intended solely for the use of the intended recipient ({{email}}). If you are not the intended recipient, any dissemination, copying, or action in reliance upon this transmission is strictly prohibited.
          </p>
        </td>
      </tr>

      <!-- System Attribution -->
      <tr>
        <td align="center" style="padding-top: 12px; font-size: 10px; color: #64748b;">
          <p style="margin: 0;">
            ⚡ Dispatched via <strong>Hindustan Projects AutoMail Engine</strong> • Recipient: <strong style="color: #94a3b8;">{{email}}</strong>
          </p>
          <p style="margin: 4px 0 0;">
            © {{year}} <strong>Hindustan Projects Group</strong>. All rights reserved.
          </p>
        </td>
      </tr>

    </table>
  </td>
</tr>`;
}

export const BUSINESS_TEMPLATES: AutomailBusinessTemplate[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. HiPRO Turnkey Construction Proposal
  // ─────────────────────────────────────────────────────────────
  {
    id: "hipro_turnkey_pitch",
    title: "HiPRO Turnkey Construction & Engineering Pitch",
    category: "Construction & Engineering",
    brand: "hipro",
    badge: "HiPRO Master",
    description: "High-converting corporate pitch for commercial, residential, and industrial construction projects.",
    subject: "Comprehensive Construction & Turnkey Engineering Services for {{name}}",
    senderName: "Hindustan Projects",
    senderEmail: "info@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Turnkey Construction Proposal - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,0.08); border: 1px solid #cbd5e1;">
          
          ${getCorporateEmailHeader("hipro", { badge: "HiPRO Master • Turnkey Proposal" })}

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 28px 20px; color: #1e293b;">
              <p style="font-size: 16px; margin: 0 0 14px; font-weight: 700; color: #0f172a;">
                Dear {{name}},
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px;">
                Are you planning a new residential villa, commercial complex, or industrial warehouse in Rajasthan? <strong>Hindustan Projects</strong> provides end-to-end turnkey construction with disciplined site management, transparent structural estimates, and certified architectural design.
              </p>

              <!-- 3 Value Pillars -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 12px; vertical-align: top;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">🏗️ Full Turnkey Execution</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">From soil testing & RCC framing to premium plumbing, tiling & MEP finishing.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; vertical-align: top; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">📐 3D Architectural & BIM Planning</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">Accurate BOQ estimations, zero cost escalations & vastu-compliant floor plans.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; vertical-align: top; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">🛡️ Quality Assurance & Audits</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">Laboratory batch-tested concrete, Fe 550D TMT steel & strict site safety standards.</p>
                  </td>
                </tr>
              </table>

              <!-- Key Stats Counters -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="width: 33.3%; padding: 12px; background-color: #0f172a; border-radius: 8px 0 0 8px; color: #ffffff;">
                    <span style="font-size: 20px; font-weight: 800; color: #38bdf8;">150+</span><br/>
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Projects Built</span>
                  </td>
                  <td align="center" style="width: 33.3%; padding: 12px; background-color: #1e293b; color: #ffffff;">
                    <span style="font-size: 20px; font-weight: 800; color: #4ade80;">100%</span><br/>
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">On-Time Delivery</span>
                  </td>
                  <td align="center" style="width: 33.3%; padding: 12px; background-color: #0f172a; border-radius: 0 8px 8px 0; color: #ffffff;">
                    <span style="font-size: 20px; font-weight: 800; color: #f87171;">5★</span><br/>
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Client Rating</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div align="center" style="margin-bottom: 20px;">
                <a href="https://www.hindustanprojects.in" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);">
                  Schedule Free Consultation & Estimate →
                </a>
              </div>

              <!-- Sign-Off -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 13px; color: #475569;">
                Warm Regards,<br/>
                <strong style="color: #0f172a;">Executive Engineering & Civil Directorate</strong><br/>
                Hindustan Projects, Bhopal Ganj, Bhilwara, Rajasthan
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("hipro")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 2. HiPRO Formal Quotation & Estimate Follow-up
  // ─────────────────────────────────────────────────────────────
  {
    id: "hipro_quote_followup",
    title: "Official Project Estimate & Quotation Follow-up",
    category: "Formal Quotations",
    brand: "hipro",
    badge: "Formal Business",
    description: "Follow-up email for clients who requested cost estimates, quotations, or structural inquiries.",
    subject: "Your Project Quotation & Build Estimate Details — Hindustan Projects",
    senderName: "Hindustan Projects Estimates",
    senderEmail: "info@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Estimate - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
          
          ${getCorporateEmailHeader("hipro", { badge: "Commercial Estimates • Build BOQ" })}

          <tr>
            <td style="padding: 28px 24px; color: #334155;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 700;">Dear {{name}},</p>
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6;">
                Thank you for your recent inquiry regarding construction and structural development with Hindustan Projects. Our senior engineering estimator has reviewed your scope and compiled your project parameters.
              </p>

              <!-- Estimation Overview Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 18px 0; font-size: 12px;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold; color: #64748b; width: 40%;">Project Category:</td>
                  <td style="padding: 12px; font-weight: 600; color: #0f172a;">Civil Construction / Turnkey EPC</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold; color: #64748b;">Target Location:</td>
                  <td style="padding: 12px; font-weight: 600; color: #0f172a;">Bhilwara / Rajasthan Region</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold; color: #64748b;">Material Specification:</td>
                  <td style="padding: 12px; font-weight: 600; color: #0f172a;">UltraTech / ACC Cement & Fe550D TMT Steel</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold; color: #64748b;">Consultation Status:</td>
                  <td style="padding: 12px; font-weight: bold; color: #16a34a;">Ready for Site Visit & Architectural Review</td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 13px; line-height: 1.6;">
                We invite you to discuss the detailed Bill of Quantities (BOQ), floor layouts, and milestone payment schedules with our technical team.
              </p>

              <!-- CTA -->
              <div align="center" style="margin: 20px 0;">
                <a href="https://www.hindustanprojects.in" style="background-color: #0f172a; color: #ffffff; padding: 13px 30px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Schedule On-Site Inspection Call →
                </a>
              </div>

              <div style="border-top: 1px solid #f1f5f9; padding-top: 14px; font-size: 12px; color: #64748b;">
                Commercial Estimates Desk • Hindustan Projects<br/>
                Bhopal Ganj, Bhilwara 311001, Rajasthan
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("hipro")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 3. Hind Build Property Inspection & Leakage Audit Offer
  // ─────────────────────────────────────────────────────────────
  {
    id: "hbs_waterproofing_inspection",
    title: "Hind Build Waterproofing & Inspection Offer",
    category: "Building Repair & Maintenance",
    brand: "hbs",
    badge: "Hind Build Special",
    description: "High-conversion offer for homeowners, societies, and factory owners with seepage, roof leakage, or crack issues.",
    subject: "Stop Water Seepage & Roof Leakage — Claim Free Site Inspection for {{name}}",
    senderName: "Hind Building Solutions",
    senderEmail: "hbs@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Waterproofing & Inspection Offer - Hind Build</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #fecaca; box-shadow: 0 10px 30px rgba(185,28,28,0.08);">
          
          ${getCorporateEmailHeader("hbs", { badge: "HiBUILD Special • Monsoon Seepage Alert" })}

          <tr>
            <td style="padding: 28px 24px; color: #1e293b;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 700;">
                Namaste {{name}},
              </p>
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #334155;">
                Is your building suffering from damp walls, paint peeling, terrace cracks, or basement water intrusion? Neglecting water seepage weakens concrete slabs and corrodes internal steel reinforcement.
              </p>

              <!-- Services List -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0;">
                <tr>
                  <td style="padding: 12px 14px; background-color: #fff1f2; border-radius: 6px; border-left: 4px solid #b91c1c;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #991b1b;">1. 100% Guaranteed Terrace Waterproofing</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #4b5563;">Multi-layer elastomeric polymer coating with 5-to-10 year warranty certificate.</p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 14px; background-color: #fff1f2; border-radius: 6px; border-left: 4px solid #b91c1c;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #991b1b;">2. Low-Pressure Polyurethane (PU) Crack Injection</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #4b5563;">Stops live active water leaks inside RCC slabs, lift pits, and basements in hours.</p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 14px; background-color: #fff1f2; border-radius: 6px; border-left: 4px solid #b91c1c;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #991b1b;">3. Non-Destructive Thermal Leakage Audit</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #4b5563;">Pinpoint exact hidden leakage sources behind tiles without breaking walls.</p>
                  </td>
                </tr>
              </table>

              <!-- Big Button -->
              <div align="center" style="margin: 22px 0 14px;">
                <a href="https://hindbuilding.hindustanprojects.in" style="background-color: #b91c1c; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px rgba(185,28,28,0.3);">
                  Book Free Expert Site Inspection →
                </a>
              </div>

              <p style="margin: 0; text-align: center; font-size: 12px; color: #64748b;">
                Direct WhatsApp Helpline: <a href="https://wa.me/917597000601" style="color: #16a34a; font-weight: bold; text-decoration: none;">+91 75970 00601</a>
              </p>
            </td>
          </tr>

          ${getCorporateEmailFooter("hbs")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 4. Hind Build Building Repair & Structural Protection Suite
  // ─────────────────────────────────────────────────────────────
  {
    id: "hbs_building_repair_suite",
    title: "Hind Build Specialized Building Repair Suite",
    category: "Building Repair & Maintenance",
    brand: "hbs",
    badge: "Structural Health",
    description: "Comprehensive building rehabilitation, polymer jacketing, crack repair, and corrosion treatment.",
    subject: "Specialized Building Repair & Structural Protection Solutions for {{name}}",
    senderName: "Hind Building Solutions",
    senderEmail: "hbs@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Building Repair Solutions - Hind Build</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
          
          ${getCorporateEmailHeader("hbs", { badge: "HiBUILD Structural Repair & Restoration" })}

          <tr>
            <td style="padding: 28px 24px; color: #1e293b;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 700;">Dear {{name}},</p>
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #334155;">
                Aging buildings face concrete carbonation, rebar corrosion, and settling cracks. <strong>Hind Building Solutions (HiBUILD)</strong> delivers advanced civil rehabilitation to restore load-bearing strength and extend structural lifespan by decades.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 16px 0; font-size: 12px;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-weight: bold; color: #64748b; width: 35%;">RCC Strengthening:</td>
                  <td style="padding: 10px 14px; color: #0f172a;">Micro-concrete micro-jacketing & carbon fiber wrapping (CFRP)</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-weight: bold; color: #64748b;">Rebar Rust Treatment:</td>
                  <td style="padding: 10px 14px; color: #0f172a;">Zinc-rich rust conversion primers & anti-corrosion barrier coats</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-weight: bold; color: #64748b;">Expansion Joint Sealing:</td>
                  <td style="padding: 10px 14px; color: #0f172a;">High-movement polysulphide and polyurethane joint elastomeric sealants</td>
                </tr>
              </table>

              <div align="center" style="margin: 22px 0 10px;">
                <a href="https://hindbuilding.hindustanprojects.in" style="background-color: #0f172a; color: #ffffff; padding: 13px 30px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Request Engineering Structural Audit →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("hbs")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 5. Hind Build 10-Year Terrace Waterproofing Proposal
  // ─────────────────────────────────────────────────────────────
  {
    id: "hbs_roof_waterproofing_quote",
    title: "Terrace Waterproofing Proposal & 10-Year Warranty",
    category: "Building Repair & Maintenance",
    brand: "hbs",
    badge: "10-Yr Warranty",
    description: "Detailed proposal for terrace waterproofing with multi-coat acrylic & polyurethane elastomeric systems.",
    subject: "Terrace Waterproofing Proposal & 10-Year Warranty for {{name}}",
    senderName: "Hind Building Waterproofing Desk",
    senderEmail: "hbs@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terrace Waterproofing Proposal - Hind Build</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
          
          ${getCorporateEmailHeader("hbs", { badge: "Certified 10-Year Waterproofing Warranty" })}

          <tr>
            <td style="padding: 28px 24px; color: #1e293b;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 700;">Dear {{name}},</p>
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #334155;">
                Thank you for inquiring about roof and terrace waterproofing with Hind Building Solutions. We have prepared an engineering scope designed specifically for Rajasthan weather conditions (resisting UV heat up to 48°C and intense monsoon downpours).
              </p>

              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; font-weight: 800; color: #065f46;">🛡️ Official 10-Year Stamp Certificate Included</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #047857; line-height: 1.5;">
                  Covers crack-bridging capability, thermal insulation reduction (lowers terrace temperature by 5-7°C), and zero seepage guarantee.
                </p>
              </div>

              <div align="center" style="margin: 22px 0 10px;">
                <a href="https://hindbuilding.hindustanprojects.in" style="background-color: #b91c1c; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">
                  View Detailed BOQ & Schedule Site Visit →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("hbs")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 6. Commercial Building Maintenance (AMC) Contract Pitch
  // ─────────────────────────────────────────────────────────────
  {
    id: "hbs_amc_commercial",
    title: "Annual Building Maintenance (AMC) Proposal",
    category: "Building Repair & Maintenance",
    brand: "hbs",
    badge: "B2B Contract",
    description: "Designed for Housing Societies, Apartment Complexes, Schools, Hospitals & Commercial Buildings.",
    subject: "Annual Maintenance Contract (AMC) for Building Protection — {{name}}",
    senderName: "Hind Building Corporate Care",
    senderEmail: "hbs@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Annual Building Maintenance Contract - Hind Build</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
          
          ${getCorporateEmailHeader("hbs", { badge: "B2B Property Management & AMC Care" })}

          <tr>
            <td style="padding: 28px 24px; color: #334155; font-size: 13px; line-height: 1.6;">
              <p style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 0;">Dear {{name}},</p>
              <p>
                Managing a large residential society, hotel, or commercial establishment requires disciplined structural maintenance before small seepage leads to costly emergency repairs.
              </p>
              <p>
                Our comprehensive <strong>Annual Maintenance Contract (AMC)</strong> includes:
              </p>
              <ul style="padding-left: 20px; color: #475569; margin: 12px 0;">
                <li><strong>Pre-Monsoon Roof & Drain Audits:</strong> Complete cleaning, seal checks, and chemical coatings.</li>
                <li><strong>Facade & Exterior Weatherproofing:</strong> Weatherproof exterior coats and expansion joint sealing.</li>
                <li><strong>Priority Emergency Response:</strong> On-call technical team for sudden plumbing and water intrusion crises.</li>
              </ul>
              <div align="center" style="margin: 24px 0 10px;">
                <a href="https://hindbuilding.hindustanprojects.in" style="background-color: #0f172a; color: #ffffff; padding: 13px 30px; text-decoration: none; font-weight: bold; font-size: 13px; border-radius: 6px; display: inline-block;">
                  Request Customized AMC Proposal →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("hbs")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 7. HiPRO Site Survey & Consultation Confirmation
  // ─────────────────────────────────────────────────────────────
  {
    id: "hipro_client_satisfaction",
    title: "Site Survey & Engineering Consultation Confirmation",
    category: "Construction & Engineering",
    brand: "hipro",
    badge: "Inspection Scheduled",
    description: "Official confirmation sent to clients booking an architectural review or engineer site survey.",
    subject: "Site Inspection & Engineering Consultation Confirmation for {{name}}",
    senderName: "Hindustan Projects Site Engineering",
    senderEmail: "info@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Inspection Confirmation - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
          
          ${getCorporateEmailHeader("hipro", { badge: "Site Survey & Engineering Review" })}

          <tr>
            <td style="padding: 28px 24px; color: #1e293b;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 700;">Dear {{name}},</p>
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #334155;">
                Your request for an on-site structural consultation and architectural review has been confirmed with our senior engineering division.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #0f172a;">Inspection Agenda:</p>
                <ol style="margin: 6px 0 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.6;">
                  <li>Plot & boundary dimension verification</li>
                  <li>Soil bearing assessment and foundation recommendations</li>
                  <li>Initial 2D floor planning & vastu compliance discussion</li>
                  <li>Itemized Bill of Quantities (BOQ) cost estimate</li>
                </ol>
              </div>

              <div align="center" style="margin: 20px 0 10px;">
                <a href="https://www.hindustanprojects.in" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Engineer Profile & Site Location →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("hipro")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 8. Instant Inquiry Acknowledgment & Follow-Up (CRM Action)
  // ─────────────────────────────────────────────────────────────
  {
    id: "lead_inquiry_followup",
    title: "Instant Inquiry Acknowledgment & Follow-Up",
    category: "Client Relations",
    brand: "all",
    badge: "CRM Lead Action",
    description: "Instant personalized reply when a customer submits a contact inquiry or quote request on the website.",
    subject: "Thank You for Contacting {{brand}} - Your Inquiry is Under Review",
    senderName: "Hindustan Projects Client Desk",
    senderEmail: "info@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
          
          ${getCorporateEmailHeader("all", { badge: "Inquiry Desk • Quick Response" })}

          <tr>
            <td style="padding: 28px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
              <p style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0f172a;">
                Hello {{name}},
              </p>
              <p style="margin: 0 0 16px;">
                Thank you for reaching out to <strong>{{brand}}</strong>. We have successfully logged your project inquiry in our central engineering desk.
              </p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">What Happens Next?</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #475569; line-height: 1.5;">
                  1. Our senior site engineer is reviewing your structural details.<br/>
                  2. We will contact you at this email or via phone within 24 business hours.<br/>
                  3. If needed, a complimentary site inspection will be scheduled.
                </p>
              </div>

              <p style="margin: 0 0 20px;">
                If your project is urgent, feel free to directly call or WhatsApp our helpline at <strong style="color: #0f172a;">+91 75970 00601</strong>.
              </p>
            </td>
          </tr>

          ${getCorporateEmailFooter("all")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 9. Client Review & Testimonial Request
  // ─────────────────────────────────────────────────────────────
  {
    id: "client_review_request",
    title: "Post-Service Review & Client Feedback",
    category: "Client Relations",
    brand: "all",
    badge: "5-Star Google",
    description: "Send after completing a project or service to collect 5-star Google reviews and strengthen brand trust.",
    subject: "How was your experience with {{brand}}? Your feedback matters to us",
    senderName: "Customer Relations Team",
    senderEmail: "info@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Client Review Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
          
          ${getCorporateEmailHeader("all", { badge: "Client Satisfaction & Experience" })}

          <tr>
            <td style="padding: 32px 24px 20px; text-align: center;">
              <div style="font-size: 36px; margin-bottom: 10px;">⭐ ⭐ ⭐ ⭐ ⭐</div>
              <h2 style="margin: 0 0 10px; font-size: 20px; color: #0f172a; font-weight: 800;">We Value Your Opinion, {{name}}!</h2>
              <p style="margin: 0 auto 20px; max-width: 480px; font-size: 13.5px; color: #64748b; line-height: 1.6;">
                Thank you for trusting <strong>{{brand}}</strong> with your property. Our goal is 100% engineering satisfaction and long-term durability.
              </p>
              <div style="margin-bottom: 24px;">
                <a href="{{website}}" style="background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Leave A 5-Star Review On Google →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("all")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 10. Festive Corporate Greeting & Special Announcement
  // ─────────────────────────────────────────────────────────────
  {
    id: "corporate_festive_wish",
    title: "Executive Festive Greeting & Company Wish",
    category: "Client Relations",
    brand: "all",
    badge: "Festive Special",
    description: "Elegant holiday/Diwali/New Year celebration email to build warm relationships with clients & partners.",
    subject: "Warm Festive Greetings & Best Wishes from {{brand}} to {{name}} and Family",
    senderName: "Hindustan Projects Management",
    senderEmail: "info@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Festive Greetings - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
          
          ${getCorporateEmailHeader("all", { badge: "Executive Corporate Greetings" })}

          <tr>
            <td style="padding: 30px 28px; font-size: 14px; line-height: 1.7; color: #334155;">
              <p style="margin-top: 0; font-size: 16px; font-weight: bold; color: #0f172a;">Dear {{name}},</p>
              <p>
                On this auspicious occasion, we extend our heartfelt gratitude for your continued trust and partnership with us. It is an honor to engineer and protect homes and commercial landmarks across Rajasthan with you.
              </p>
              <p>
                May this festive season bring prosperity, robust health, and joyful success to you and your loved ones!
              </p>
              <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
                Warm Regards,<br/>
                <strong style="color: #0f172a;">Yogesh Kharol & The Leadership Team</strong><br/>
                Hindustan Projects Group
              </p>
            </td>
          </tr>

          ${getCorporateEmailFooter("all")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 11. Monthly Newsletter & Engineering Digest
  // ─────────────────────────────────────────────────────────────
  {
    id: "newsletter_digest",
    title: "HiPRO Monthly Construction & Insights Digest",
    category: "Client Relations",
    brand: "hipro",
    badge: "Newsletter Pro",
    description: "Engaging corporate monthly newsletter with engineering milestones, construction tips, and company updates.",
    subject: "HiPRO Insights: Latest Engineering Milestones & Architectural Tips for {{name}}",
    senderName: "Hindustan Projects Editorial",
    senderEmail: "info@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HiPRO Monthly Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(15,23,42,0.08);">
          
          ${getCorporateEmailHeader("hipro", { badge: "HiPRO Monthly Insights & Milestones" })}

          <tr>
            <td style="padding: 28px 24px 16px; font-size: 14px; line-height: 1.6; color: #1e293b;">
              <p style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0f172a;">
                Greetings {{name}},
              </p>
              <p style="margin: 0 0 16px;">
                Welcome to this month's edition of the <strong>HiPRO Gazette</strong>. Here are our highlighted civil engineering breakthroughs, active site milestones, and recommended construction best practices.
              </p>

              <!-- Article 1 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 16px; padding: 16px;">
                <tr>
                  <td>
                    <span style="font-size: 10px; font-weight: 800; color: #3b82f6; text-transform: uppercase;">SITE SPOTLIGHT</span>
                    <h3 style="margin: 4px 0 6px; font-size: 15px; color: #0f172a;">RCC Slab Quality: Fe 550D vs Standard Steel</h3>
                    <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
                      Why high-ductility steel prevents micro-cracks in harsh Rajasthan weather, saving up to 40% on lifetime structural maintenance.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Article 2 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; padding: 16px;">
                <tr>
                  <td>
                    <span style="font-size: 10px; font-weight: 800; color: #10b981; text-transform: uppercase;">PRE-CONSTRUCTION TIP</span>
                    <h3 style="margin: 4px 0 6px; font-size: 15px; color: #0f172a;">Zero-Surprise Turnkey Budgeting</h3>
                    <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
                      How our transparent Bill of Quantities (BOQ) locks in material prices before groundbreaking, shielding your investment from inflation.
                    </p>
                  </td>
                </tr>
              </table>

              <div align="center" style="margin: 20px 0 10px;">
                <a href="{{website}}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 6px;">
                  Explore Completed Projects →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("hipro")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 12. Vendor Empanelment KYC Approval Letter
  // ─────────────────────────────────────────────────────────────
  {
    id: "empanelment_kyc_approval",
    title: "Vendor Empanelment KYC Approval & Tier Classification",
    category: "Vendor Empanelment & Procurement",
    brand: "empanelment",
    badge: "KYC Verified",
    description: "Official confirmation letter sent to verified contractors assigning capacity Tier (Class A, B, or C) with portal credentials.",
    subject: "Congratulations {{name}}: Empanelment Approved & Capacity Tier Assigned — Hindustan Projects",
    senderName: "HiPRO Empanelment Desk",
    senderEmail: "empanelment@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Empanelment Approved - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,0.08); border: 1px solid #cbd5e1;">
          
          ${getCorporateEmailHeader("empanelment", { badge: "Official Procurement Letter • Verified Partner" })}

          <tr>
            <td style="padding: 24px 28px 20px; color: #1e293b;">
              
              <!-- Success Alert Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 700;">
                      ✅ Verification Status: KYC AUDIT CLEARED & APPROVED
                    </p>
                    <p style="margin: 4px 0 0; color: #047857; font-size: 12px; line-height: 1.5;">
                      Your enterprise dossiers, GST compliance, and audited turnover have been accepted by the Procurement Board.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size: 15px; margin: 0 0 14px; font-weight: 700; color: #0f172a;">
                Dear {{name}},
              </p>
              <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
                We are pleased to inform you that your registration under <strong>Hindustan Projects Vendor Empanelment Program</strong> has been officially approved. You are now authorized to participate in competitive bidding, submit technical quotations, and receive commercial work packages.
              </p>

              <!-- Benefits Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 22px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-size: 12px; font-weight: 800; color: #92400e; text-transform: uppercase;">
                      📋 YOUR EMPANELLED PRIVILEGES
                    </p>
                    <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #78350f; line-height: 1.7;">
                      <li><strong>Direct Tender Package Alerts:</strong> Immediate dispatch when relevant scopes are released.</li>
                      <li><strong>14-Day Running Account (RA) Billing:</strong> Guaranteed payment turnaround cycle.</li>
                      <li><strong>24-Hour Digital Site Gate Passes:</strong> Instant crew security clearance.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <div align="center" style="margin-bottom: 20px;">
                <a href="https://empanelment.hindustanprojects.in" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(217,119,6,0.3);">
                  Access Partner Portal & Bidding Radar →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("empanelment")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 13. Active Tender Notice & Commercial Work Package Bidding
  // ─────────────────────────────────────────────────────────────
  {
    id: "empanelment_tender_invite",
    title: "Active Tender Notice & Commercial Work Package Bidding",
    category: "Vendor Empanelment & Procurement",
    brand: "empanelment",
    badge: "Bidding Radar",
    description: "Work package notice dispatched to empanelled vendors inviting commercial quotes for civil, MEP, or structural work packages.",
    subject: "Tender Invitation: Commercial Work Package Bidding Allotment for {{name}}",
    senderName: "HiPRO Procurement & Tenders",
    senderEmail: "empanelment@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tender Invitation - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,0.08); border: 1px solid #cbd5e1;">
          
          ${getCorporateEmailHeader("empanelment", { badge: "Active Tender Notice • Commercial RFQ" })}

          <tr>
            <td style="padding: 28px 28px 16px; color: #1e293b;">
              <p style="font-size: 15px; margin: 0 0 12px; font-weight: 700; color: #0f172a;">
                Respected Partner {{name}},
              </p>
              <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
                You are cordially invited to submit your competitive commercial quote and rates for an active structural work package open for bidding.
              </p>

              <!-- Highlight Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;">Package Scope:</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">Civil RCC, MEP, or Material Package</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Location:</td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #334155; border-bottom: 1px solid #e2e8f0;">Bhilwara / Rajasthan Region</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #64748b;">Terms:</td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #065f46; font-weight: 700;">14-Day Running Account Billing Clearance</td>
                </tr>
              </table>

              <div align="center" style="margin-bottom: 14px;">
                <a href="https://empanelment.hindustanprojects.in/tenders" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 30px; border-radius: 6px;">
                  Review Specifications & Submit Rates →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("empanelment")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 14. Daily Site Security & Digital Gate Pass Authorization
  // ─────────────────────────────────────────────────────────────
  {
    id: "empanelment_gate_pass_clearance",
    title: "Daily Site Security & Digital Gate Pass Authorization",
    category: "Vendor Empanelment & Procurement",
    brand: "empanelment",
    badge: "Site Security",
    description: "Site entry pass confirmation dispatched to contractor teams for equipment and labor clearance.",
    subject: "Site Security Clearance Approved: Gate Pass Issued for {{name}}",
    senderName: "HiPRO Site Safety & Security",
    senderEmail: "empanelment@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Security Clearance - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,0.08); border: 1px solid #cbd5e1;">
          
          ${getCorporateEmailHeader("empanelment", { badge: "Security Access Permit • 24-Hr Gate Pass" })}

          <tr>
            <td style="padding: 24px 28px; color: #1e293b;">
              <p style="margin: 0 0 10px; font-size: 15px; font-weight: 700;">Authorized Contractor: {{name}}</p>
              <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
                Your site security entry permit has been authorized. Present this digital verification slip at the perimeter security checkpoint for vehicle and labor entry.
              </p>

              <div style="background-color: #f1f5f9; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #0f172a;">🛡️ Mandatory Site Safety Rules:</p>
                <p style="margin: 4px 0 0; font-size: 11px; color: #475569; line-height: 1.5;">
                  All site crew must possess standard PPE (Steel-Toe Boots, Hard Hats & High-Visibility Vests). No entry permitted without safety equipment.
                </p>
              </div>

              <div align="center" style="margin: 20px 0 10px;">
                <a href="https://empanelment.hindustanprojects.in/gate-pass" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 6px;">
                  View & Download Security Gate Pass Slip →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("empanelment")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // ─────────────────────────────────────────────────────────────
  // 15. Contractor Work Order Milestone & Billing Clearance
  // ─────────────────────────────────────────────────────────────
  {
    id: "empanelment_work_order_billing",
    title: "Contractor Work Order Milestone & Billing Clearance",
    category: "Vendor Empanelment & Procurement",
    brand: "empanelment",
    badge: "Procurement Payout",
    description: "Official work order milestone clearance dispatch confirming RA billing validation and payment release schedule.",
    subject: "Work Order Milestone Released: Invoice Clearance for {{name}}",
    senderName: "HiPRO Procurement Billing",
    senderEmail: "empanelment@hindustanprojects.in",
    html: `<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Work Order Milestone Release - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,0.08); border: 1px solid #cbd5e1;">
          
          ${getCorporateEmailHeader("empanelment", { badge: "Commercial Billing Release • Milestone Approved" })}

          <tr>
            <td style="padding: 24px 28px; color: #1e293b;">
              <p style="margin: 0 0 10px; font-size: 15px; font-weight: 700;">Partner: {{name}}</p>
              <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
                This notification confirms that the milestone inspection report for your active work package has been certified by our site project engineer. Your running account (RA) invoice has been cleared for disbursement.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 12px; font-weight: 700; color: #065f46;">Disbursement Schedule:</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #047857;">
                      Direct NEFT / RTGS transfer is processed within 3 business days to your verified bank account on file.
                    </p>
                  </td>
                </tr>
              </table>

              <div align="center" style="margin: 20px 0 10px;">
                <a href="https://empanelment.hindustanprojects.in" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 6px;">
                  View Detailed Payment Statements →
                </a>
              </div>
            </td>
          </tr>

          ${getCorporateEmailFooter("empanelment")}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];
