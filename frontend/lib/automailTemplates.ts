export interface AutomailBusinessTemplate {
  id: string;
  title: string;
  category: "Construction & Engineering" | "Building Repair & Maintenance" | "Formal Quotations" | "Client Relations";
  brand: "hipro" | "hbs" | "all";
  badge: string;
  description: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  html: string;
}

export const BUSINESS_TEMPLATES: AutomailBusinessTemplate[] = [
  // 1. HiPRO Turnkey Construction Proposal
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 24px; text-align: center; border-bottom: 4px solid #dc2626;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                      Hindustan Projects
                    </h1>
                    <p style="margin: 6px 0 0; color: #94a3b8; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">
                      Civil Engineering • Infrastructure • Commercial Build
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner Intro -->
          <tr>
            <td style="padding: 32px 28px 20px; color: #1e293b;">
              <p style="font-size: 16px; margin: 0 0 14px; font-weight: 700; color: #0f172a;">
                Dear {{name}},
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px;">
                Are you planning a new residential villa, commercial complex, or industrial warehouse in Rajasthan? <strong>Hindustan Projects</strong> provides end-to-end turnkey construction with disciplined site management, transparent structural estimates, and certified architectural design.
              </p>
            </td>
          </tr>

          <!-- 3 Value Pillars -->
          <tr>
            <td style="padding: 0 28px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
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
            </td>
          </tr>

          <!-- Key Stats Counters -->
          <tr>
            <td style="padding: 10px 28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
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
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td align="center" style="padding: 10px 28px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #dc2626; border-radius: 8px;">
                    <a href="https://www.hindustanprojects.in" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; letter-spacing: 0.5px;">
                      Schedule Free Consultation & Estimate
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 12px 0 0; font-size: 12px; color: #64748b;">
                Direct Site Helpline: <strong>+91 75970 00601</strong>
              </p>
            </td>
          </tr>

          <!-- Corporate Sign-Off -->
          <tr>
            <td style="padding: 0 28px 24px; color: #475569; font-size: 13px; line-height: 1.5; border-top: 1px solid #f1f5f9;">
              <p style="margin: 16px 0 0;">
                Warm Regards,<br/>
                <strong>Yogesh Kharol & Executive Engineering Team</strong><br/>
                Hindustan Projects, Bhopal Ganj, Bhilwara, Rajasthan
              </p>
            </td>
          </tr>

          <!-- Official Legal Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0;">This email was sent to <strong>{{email}}</strong> regarding construction & engineering services.</p>
              <p style="margin: 6px 0 0;">
                Hindustan Projects • Opposite Mukherji Park, Bhopal Ganj, Bhilwara 311001 • <a href="https://www.hindustanprojects.in" style="color: #0284c7; text-decoration: none;">www.hindustanprojects.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // 2. HiPRO Formal Quotation & Estimate Follow-up
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: left; border-bottom: 3px solid #0284c7;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <h2 style="margin: 0; color: #ffffff; font-size: 18px; text-transform: uppercase; font-weight: 800;">Hindustan Projects</h2>
                    <p style="margin: 2px 0 0; color: #94a3b8; font-size: 11px;">Official Estimation & Commercial Review</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(255,255,255,0.1); color: #38bdf8; font-size: 10px; font-mono; font-weight: bold; border-radius: 4px;">QUOTE REF: #HIPRO-EST</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 28px 24px; color: #334155;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 700;">Dear {{name}},</p>
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6;">
                Thank you for your recent inquiry regarding construction and development with Hindustan Projects. Our senior engineering estimator has reviewed your requirements.
              </p>

              <!-- Estimation Overview Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 18px 0; font-size: 12px;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold; color: #64748b; width: 40%;">Project Category:</td>
                  <td style="padding: 12px; font-weight: 600; color: #0f172a;">Civil Construction / Turnkey</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold; color: #64748b;">Target Location:</td>
                  <td style="padding: 12px; font-weight: 600; color: #0f172a;">Bhilwara / Rajasthan Region</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold; color: #64748b;">Material Specification:</td>
                  <td style="padding: 12px; font-weight: 600; color: #0f172a;">UltraTech / ACC Cement & Fe550 TMT Grade</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold; color: #64748b;">Consultation Status:</td>
                  <td style="padding: 12px; font-weight: bold; color: #16a34a;">Ready for Site Visit & Architectural Review</td>
                </tr>
              </table>

              <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.6;">
                We invite you to discuss the detailed Bill of Quantities (BOQ), floor layouts, and milestone payment schedules with our technical team.
              </p>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://www.hindustanprojects.in" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Schedule On-Site Inspection Call
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">Sent to {{email}} by Hindustan Projects Commercial Estimates Office.</p>
              <p style="margin: 4px 0 0;">Call +91 75970 00601 | Email: info@hindustanprojects.in</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // 3. Hind Build (HiBUILD) Property Inspection & Leakage Audit Offer
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #fef2f2; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #fecaca; box-shadow: 0 4px 20px rgba(185,28,28,0.08);">
          
          <!-- Red Brand Header -->
          <tr>
            <td style="background-color: #b91c1c; padding: 26px 24px; text-align: center; border-bottom: 4px solid #7f1d1d;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                Hind Building Solutions
              </h1>
              <p style="margin: 4px 0 0; color: #fecaca; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">
                Building Repair • Waterproofing • Structural Health
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px 24px; color: #1e293b;">
              <div style="background-color: #fef2f2; border: 1px dashed #ef4444; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; text-align: center;">
                <span style="color: #b91c1c; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                  ⚠️ Monsoon & Seepage Alert for Property Owners
                </span>
              </div>

              <p style="margin: 0 0 14px; font-size: 15px; color: #0f172a; font-weight: 700;">
                Namaste {{name}},
              </p>

              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #334155;">
                Is your building suffering from damp walls, paint peeling, terrace cracks, or basement water logging? Neglecting water seepage can weaken steel reinforcement and damage the RCC structure permanently.
              </p>

              <!-- Services List -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 10px 14px; background-color: #fff1f2; border-radius: 6px; margin-bottom: 8px;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #991b1b;">1. 100% Guaranteed Terrace Waterproofing</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #4b5563;">Multi-layer elastomeric polymer coating with 5-to-10 year warranty certificate.</p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 10px 14px; background-color: #fff1f2; border-radius: 6px; margin-bottom: 8px;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #991b1b;">2. Low-Pressure Polyurethane Crack Injection</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #4b5563;">Stops live active water leaks inside concrete slabs and basements in hours.</p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 10px 14px; background-color: #fff1f2; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #991b1b;">3. Non-Destructive Thermal & Moisture Audit</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #4b5563;">Pinpoint exact hidden leakage sources behind tiles without breaking walls.</p>
                  </td>
                </tr>
              </table>

              <!-- Big Red Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0 16px;">
                <tr>
                  <td align="center">
                    <a href="https://hindbuilding.hindustanprojects.in" style="background-color: #b91c1c; color: #ffffff; padding: 14px 30px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(185,28,28,0.25);">
                      Book Free Expert Site Inspection
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; text-align: center; font-size: 12px; color: #64748b;">
                Quick WhatsApp Support: <a href="https://wa.me/917597000601" style="color: #16a34a; font-weight: bold; text-decoration: none;">+91 75970 00601</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fef2f2; padding: 18px 24px; text-align: center; font-size: 11px; color: #7f1d1d; border-top: 1px solid #fee2e2;">
              <p style="margin: 0;">Hind Building Solutions (HiBUILD) • A Hindustan Projects Division</p>
              <p style="margin: 4px 0 0;">Opposite Mukherji Park, Bhopal Ganj, Bhilwara 311001</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // 4. Commercial Building Maintenance (AMC) Contract Pitch
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1;">
          
          <tr style="background-color: #1e293b; color: #ffffff;">
            <td style="padding: 24px; text-align: center; border-bottom: 3px solid #dc2626;">
              <h2 style="margin: 0; font-size: 19px; text-transform: uppercase;">Hind Building Solutions</h2>
              <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Corporate Property Management & AMC</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 24px; color: #334155; font-size: 13px; line-height: 1.6;">
              <p style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 0;">Dear {{name}},</p>
              <p>
                Managing a large residential complex or commercial property demands continuous structural maintenance before minor seepage turns into massive renovation costs.
              </p>
              <p>
                We offer tailored <strong>Annual Maintenance Contracts (AMC)</strong> covering:
              </p>
              <ul style="padding-left: 20px; color: #475569; margin: 12px 0;">
                <li><strong>Pre-Monsoon Roof & Drain Audits:</strong> Complete cleaning, seal checks, and chemical coatings.</li>
                <li><strong>Facade & Exterior Protection:</strong> Weatherproof exterior coats and expansion joint sealing.</li>
                <li><strong>Priority Emergency Response:</strong> On-call technical team for sudden plumbing and water intrusion crises.</li>
              </ul>
              <div style="text-align: center; margin: 24px 0;">
                <a href="https://hindbuilding.hindustanprojects.in" style="background-color: #dc2626; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 13px; border-radius: 6px; display: inline-block;">
                  Request Customized AMC Proposal
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">Hind Building Solutions • Contact: +91 75970 00601 • Email: hbs@hindustanprojects.in</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // 5. Client Review & Testimonial Request
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; text-align: center;">
          
          <tr>
            <td style="padding: 36px 24px 20px;">
              <div style="font-size: 40px; margin-bottom: 12px;">⭐ ⭐ ⭐ ⭐ ⭐</div>
              <h2 style="margin: 0 0 10px; font-size: 20px; color: #0f172a; font-weight: 800;">We Value Your Opinion, {{name}}!</h2>
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                Thank you for trusting <strong>{{brand}}</strong> with your property. Our goal is 100% engineering satisfaction and long-term durability.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 24px 30px;">
              <p style="font-size: 14px; color: #334155; margin-bottom: 24px;">
                Could you take 30 seconds to share your experience? Your feedback helps fellow property owners make informed decisions.
              </p>
              <a href="{{website}}" style="background-color: #0f172a; color: #ffffff; padding: 13px 32px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">
                Leave A 5-Star Review
              </a>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f1f5f9; padding: 16px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">Sent with gratitude to {{email}} by {{brand}}.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  // 6. Festive Corporate Greeting & Special Announcement
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #1e293b; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); text-align: center; color: #ffffff;">
          
          <tr>
            <td style="padding: 40px 24px 20px;">
              <div style="font-size: 36px; margin-bottom: 12px;">✨ 🪔 ✨</div>
              <h1 style="margin: 0 0 10px; font-size: 22px; color: #facc15; font-weight: 800; letter-spacing: 1px;">
                Warm Festive Greetings!
              </h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">
                From The Entire Team at {{brand}}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px 36px; font-size: 14px; line-height: 1.7; color: #e2e8f0;">
              <p style="margin-top: 0;">Dear <strong>{{name}}</strong>,</p>
              <p>
                On this auspicious occasion, we extend our heartfelt gratitude for your continued trust and partnership with us. It is an honor to engineer and protect homes and commercial landmarks across Rajasthan with you.
              </p>
              <p>
                May this festive season bring prosperity, robust health, and joyful success to you and your loved ones!
              </p>
              <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
                Warm Regards,<br/>
                <strong style="color: #ffffff;">Yogesh Kharol & The Leadership Team</strong><br/>
                Hindustan Projects Group
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #0f172a; padding: 18px; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0;">Sent to {{email}} • <a href="https://www.hindustanprojects.in" style="color: #38bdf8; text-decoration: none;">www.hindustanprojects.in</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
          
          <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; border-bottom: 4px solid #3b82f6;">
              <h1 style="margin: 0; font-size: 20px; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">
                {{brand}}
              </h1>
              <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">
                Engineering • Turnkey Construction • Structural Protection
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 28px 20px; color: #1e293b; font-size: 14px; line-height: 1.6;">
              <p style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0f172a;">
                Hello {{name}},
              </p>
              <p style="margin: 0 0 16px;">
                Thank you for reaching out to <strong>{{brand}}</strong>. We have successfully logged your project inquiry in our central engineering desk.
              </p>
              <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a;">What Happens Next?</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #475569;">
                  1. Our senior site engineer is reviewing your structural details.<br/>
                  2. We will contact you at this email or via phone within 24 business hours.<br/>
                  3. If needed, a complimentary site inspection will be scheduled.
                </p>
              </div>
              <p style="margin: 0 0 20px;">
                If your project is time-critical, you can directly reach our desk via WhatsApp or phone at <strong style="color: #0f172a;">+91 95499 99401</strong>.
              </p>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                Warm Regards,<br/>
                <strong style="color: #0f172a;">Client Relationship Team</strong><br/>
                {{brand}} • Rajasthan, India
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 16px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0;">Sent automatically to {{email}} • Official Website: <a href="{{website}}" style="color: #3b82f6; text-decoration: none;">{{website}}</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HiPRO Monthly Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          
          <tr>
            <td style="background-color: #0f172a; padding: 32px 24px; text-align: center; border-bottom: 4px solid #ef4444;">
              <span style="background-color: rgba(239,68,68,0.2); color: #f87171; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px;">Monthly Edition</span>
              <h1 style="margin: 12px 0 4px; font-size: 24px; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">
                Hindustan Projects Gazette
              </h1>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Architectural Innovation • Civil Engineering • Property Value Growth
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 24px 16px; font-size: 14px; line-height: 1.6; color: #1e293b;">
              <p style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0f172a;">
                Greetings {{name}},
              </p>
              <p style="margin: 0 0 16px;">
                Welcome to this month&rsquo;s edition of the <strong>HiPRO Gazette</strong>. Here are our highlighted civil engineering breakthroughs, active site milestones, and recommended construction best practices.
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

              <div align="center" style="margin: 24px 0 10px;">
                <a href="{{website}}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 6px;">
                  Explore Completed Projects →
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0;">You are receiving this newsletter as a subscribed client of {{brand}}.</p>
              <p style="margin: 4px 0 0;">Sent to {{email}} • © 2026 Hindustan Projects. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];
