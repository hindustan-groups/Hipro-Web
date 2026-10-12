import { sendOneEmail } from "./automail/emailSender";

interface ApplicationEmailParams {
  email: string;
  companyName: string;
  contactName: string;
  trackingId: string;
  category: string;
  tier: string;
  pan: string;
  gstin?: string | null;
}

interface StatusEmailParams {
  email: string;
  companyName: string;
  contactName: string;
  trackingId: string;
  status: "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  registrationNo?: string | null;
  tier?: string;
  remarks?: string;
  validUntil?: Date | string | null;
}

interface GatePassEmailParams {
  email: string;
  visitorName: string;
  companyName: string;
  passCode: string;
  siteLocation: string;
  purpose: string;
  validUntil: string;
  phone: string;
}

/**
 * 1. Send Application Submission Acknowledgment Email
 */
export async function sendApplicationReceivedEmail(params: ApplicationEmailParams): Promise<void> {
  const { email, companyName, contactName, trackingId, category, tier, pan, gstin } = params;

  if (!email || !email.includes("@")) {
    console.warn(`[EMPANELMENT MAILER] Skipping email, invalid address: ${email}`);
    return;
  }

  const trackUrl = `https://empanelment.hindustanprojects.in/track?trackingId=${encodeURIComponent(trackingId)}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Empanelment Application Received - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(251, 146, 60, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 24px 30px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">HINDUSTAN PROJECTS</div>
                    <div style="font-size: 12px; color: #fed7aa; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px;">Procurement & Vendor Empanelment Board</div>
                  </td>
                  <td align="right">
                    <span style="background: rgba(0,0,0,0.25); color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;">OFFICIAL DISPATCH</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #ffffff; font-size: 20px; margin-top: 0; margin-bottom: 8px;">Vendor Application Acknowledged</h2>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
                Dear <strong>${contactName}</strong> (${companyName}),<br>
                Thank you for applying for official contractor and vendor empanelment with Hindustan Projects. Your statutory application dossier has been logged into our centralized procurement registry.
              </p>

              <!-- Tracking Highlight Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(251, 146, 60, 0.08); border: 1px dashed rgba(251, 146, 60, 0.4); border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fdba74; font-weight: 700;">YOUR APPLICATION TRACKING ID</div>
                    <div style="font-size: 24px; font-weight: 800; color: #ffedd5; letter-spacing: 1.5px; margin: 4px 0 8px 0; font-family: monospace;">${trackingId}</div>
                    <div style="font-size: 12px; color: #cbd5e1;">Use this tracking identifier to inspect verification status anytime.</div>
                  </td>
                </tr>
              </table>

              <!-- Application Details -->
              <table width="100%" cellpadding="8" cellspacing="0" style="background: #1e293b; border-radius: 8px; font-size: 13px; color: #e2e8f0; margin-bottom: 24px; border: 1px solid #334155;">
                <tr>
                  <td width="35%" style="color: #94a3b8; border-bottom: 1px solid #334155;">Company:</td>
                  <td style="font-weight: 600; border-bottom: 1px solid #334155;">${companyName}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; border-bottom: 1px solid #334155;">Category:</td>
                  <td style="font-weight: 600; border-bottom: 1px solid #334155;">${category}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; border-bottom: 1px solid #334155;">Provisional Tier:</td>
                  <td style="font-weight: 600; border-bottom: 1px solid #334155; color: #fb923c;">${tier.replace("_", " ")}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; border-bottom: 1px solid #334155;">PAN:</td>
                  <td style="font-family: monospace; border-bottom: 1px solid #334155;">${pan}</td>
                </tr>
                ${gstin ? `
                <tr>
                  <td style="color: #94a3b8;">GSTIN:</td>
                  <td style="font-family: monospace;">${gstin}</td>
                </tr>` : ""}
              </table>

              <!-- Next Steps -->
              <h3 style="color: #f8fafc; font-size: 15px; margin-bottom: 10px;">Verification Workflow</h3>
              <ol style="color: #94a3b8; font-size: 13px; line-height: 1.6; padding-left: 20px; margin-top: 0; margin-bottom: 28px;">
                <li><strong>Document Audit:</strong> CA turnover, GST/PAN compliance cross-checked.</li>
                <li><strong>Technical Scoring:</strong> Past civil work orders and capacity tier verification.</li>
                <li><strong>Approval & Smart Card:</strong> CEO digital authorization and PVC ID card release.</li>
              </ol>

              <!-- Action Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${trackUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4);">
                  Track Application Status Online &rarr;
                </a>
              </div>

              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
                If you did not initiate this empanelment request, please ignore this email or reach us at <a href="mailto:empanelment@hindustanprojects.in" style="color: #fdba74;">empanelment@hindustanprojects.in</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #090d16; padding: 20px 30px; text-align: center; border-top: 1px solid #1e293b; color: #64748b; font-size: 11px;">
              Hindustan Projects &bull; Civil Infrastructure, Industrial PEB & EPC Contractors<br>
              Head Office: Bhilwara, Rajasthan &bull; Website: <a href="https://empanelment.hindustanprojects.in" style="color: #fb923c; text-decoration: none;">empanelment.hindustanprojects.in</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await sendOneEmail({
      to: email,
      subject: `Empanelment Application Received [${trackingId}] - ${companyName}`,
      htmlBody,
      brand: "empanelment",
      senderName: "HiPRO Empanelment Desk",
    });
    console.log(`[EMPANELMENT MAILER] Acknowledgment email sent to ${email} for ${trackingId}`);
  } catch (err: any) {
    console.warn(`[EMPANELMENT MAILER] Failed to send acknowledgment email:`, err?.message || err);
  }
}

/**
 * 2. Send Status Change Notification (APPROVED or REJECTED)
 */
export async function sendApplicationStatusEmail(params: StatusEmailParams): Promise<void> {
  const { email, companyName, contactName, trackingId, status, registrationNo, tier, remarks } = params;

  if (!email || !email.includes("@")) {
    console.warn(`[EMPANELMENT MAILER] Skipping status email, invalid address: ${email}`);
    return;
  }

  const isApproved = status === "APPROVED";
  const portalUrl = `https://empanelment.hindustanprojects.in/track?trackingId=${encodeURIComponent(trackingId)}`;
  const tendersUrl = `https://empanelment.hindustanprojects.in/tenders`;

  const subject = isApproved
    ? `Congratulations! Empanelment Approved [${registrationNo || trackingId}] - Hindustan Projects`
    : `Empanelment Application Status Update [${trackingId}] - Hindustan Projects`;

  const bannerColor = isApproved ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";
  const statusBadge = isApproved ? "EMPANELMENT APPROVED" : "APPLICATION REJECTED / NEEDS REVISION";

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="background: ${bannerColor}; padding: 24px 30px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff;">HINDUSTAN PROJECTS</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 2px;">Procurement & Vendor Empanelment Board</div>
                  </td>
                  <td align="right">
                    <span style="background: rgba(0,0,0,0.3); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;">${statusBadge}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 30px;">
              ${isApproved ? `
                <h2 style="color: #34d399; font-size: 20px; margin-top: 0;">Congratulations, ${companyName}!</h2>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                  We are pleased to inform you that your vendor empanelment application has been <strong>formally reviewed, audited, and approved</strong> by the Hindustan Projects Procurement Directorate.
                </p>

                <!-- Approved Credentials Box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
                  <tr>
                    <td>
                      <div style="font-size: 11px; text-transform: uppercase; color: #6ee7b7; font-weight: 700;">OFFICIAL VENDOR REGISTRATION NUMBER</div>
                      <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; margin: 4px 0; font-family: monospace;">${registrationNo || trackingId}</div>
                      <div style="font-size: 12px; color: #a7f3d0;">Capacity Tier: <strong>${(tier || "CLASS_C").replace("_", " ")}</strong> &bull; Validity: 2 Years from issuance</div>
                    </td>
                  </tr>
                </table>

                <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">
                  You are now authorized to participate in exclusive Hindustan Projects tenders, issue digital site gate passes for your workforce, and submit commercial bids directly through the Empanelment portal.
                </p>

                <div style="text-align: center; margin: 28px 0 16px 0;">
                  <a href="${portalUrl}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; margin-right: 8px;">
                    View Digital Smart ID Card &rarr;
                  </a>
                  <a href="${tendersUrl}" target="_blank" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;">
                    Browse Active Tenders &rarr;
                  </a>
                </div>
              ` : `
                <h2 style="color: #f87171; font-size: 20px; margin-top: 0;">Application Status Update</h2>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                  Dear ${contactName},<br>
                  Following technical and statutory evaluation, your application for empanelment (Tracking ID: <strong>${trackingId}</strong>) could not be approved at this time.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 16px; margin: 20px 0;">
                  <tr>
                    <td>
                      <div style="font-size: 11px; text-transform: uppercase; color: #fca5a5; font-weight: 700;">AUDIT COMMITTEE REMARKS</div>
                      <div style="font-size: 13px; color: #fecaca; margin-top: 6px; line-height: 1.5;">${remarks || "Statutory documentation or turnover criteria did not satisfy empanelment guidelines for this tier."}</div>
                    </td>
                  </tr>
                </table>

                <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                  You may re-apply with rectified certificates or contact our Procurement Desk for assistance at <a href="mailto:empanelment@hindustanprojects.in" style="color: #fdba74;">empanelment@hindustanprojects.in</a>.
                </p>
              `}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #090d16; padding: 20px 30px; text-align: center; border-top: 1px solid #1e293b; color: #64748b; font-size: 11px;">
              Hindustan Projects Procurement Directorate &bull; Bhilwara, Rajasthan<br>
              <a href="https://empanelment.hindustanprojects.in" style="color: #fb923c; text-decoration: none;">empanelment.hindustanprojects.in</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await sendOneEmail({
      to: email,
      subject,
      htmlBody,
      brand: "empanelment",
      senderName: "HiPRO Empanelment Desk",
    });
    console.log(`[EMPANELMENT MAILER] Status update email sent to ${email} (${status})`);
  } catch (err: any) {
    console.warn(`[EMPANELMENT MAILER] Failed to send status email:`, err?.message || err);
  }
}

/**
 * 3. Send Daily Site Gate Pass Email
 */
export async function sendSiteGatePassEmail(params: GatePassEmailParams): Promise<void> {
  const { email, visitorName, companyName, passCode, siteLocation, purpose, validUntil } = params;

  if (!email || !email.includes("@")) {
    return;
  }

  const verifyUrl = `https://empanelment.hindustanprojects.in/verify-pass?passCode=${encodeURIComponent(passCode)}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HiPRO Site Gate Pass - ${passCode}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 25px 15px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background: #1e293b; border: 2px solid #3b82f6; border-radius: 14px; overflow: hidden;">
          <tr>
            <td style="background: #1d4ed8; padding: 18px 24px; color: #ffffff;">
              <div style="font-size: 18px; font-weight: 800;">HINDUSTAN PROJECTS</div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #bfdbfe;">Site Security & Gate Pass Authorization</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">PASS IDENTIFIER</div>
                <div style="font-size: 26px; font-weight: 900; color: #60a5fa; font-family: monospace; letter-spacing: 2px;">${passCode}</div>
                <div style="font-size: 12px; color: #34d399; font-weight: 600; margin-top: 4px;">&#10004; ACTIVE & VALID</div>
              </div>

              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; color: #e2e8f0; border-top: 1px solid #334155; margin-bottom: 20px;">
                <tr>
                  <td width="35%" style="color: #94a3b8;">Visitor / Lead:</td>
                  <td style="font-weight: 700;">${visitorName}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8;">Company:</td>
                  <td style="font-weight: 600;">${companyName}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8;">Site Location:</td>
                  <td style="font-weight: 600; color: #fbbf24;">${siteLocation}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8;">Purpose:</td>
                  <td>${purpose}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8;">Valid Until:</td>
                  <td style="font-weight: 700; color: #ef4444;">${validUntil}</td>
                </tr>
              </table>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${verifyUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                  Open Security QR Verification &rarr;
                </a>
              </div>

              <div style="font-size: 11px; color: #64748b; text-align: center; line-height: 1.4;">
                Present this digital pass or QR code at site checkpoint security. Pass expires automatically after 24 hours.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await sendOneEmail({
      to: email,
      subject: `Site Gate Pass [${passCode}] - ${siteLocation} (${visitorName})`,
      htmlBody,
      brand: "empanelment",
      senderName: "HiPRO Site Security",
    });
    console.log(`[EMPANELMENT MAILER] Gate pass email sent to ${email} (${passCode})`);
  } catch (err: any) {
    console.warn(`[EMPANELMENT MAILER] Failed to send gate pass email:`, err?.message || err);
  }
}
