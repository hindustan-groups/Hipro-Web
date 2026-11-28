import fs from "fs";
import path from "path";
import { sendOneEmail, resolveEffectiveMailboxConfig, recordDirectDispatch } from "./automail/emailSender";
import { logVendorActivity } from "./vendorActivityService";
import { prisma } from "../lib/db";

export interface EmpanelmentEmailLog {
  id: string;
  applicationId: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  templateKey: string;
  status: "sent" | "failed" | "queued";
  error?: string | null;
  htmlBody: string;
  sentAt: string;
}

const EMAIL_LOGS_PATH = path.resolve(__dirname, "../../empanelment_email_logs.json");

function loadEmailLogs(): EmpanelmentEmailLog[] {
  try {
    if (fs.existsSync(EMAIL_LOGS_PATH)) {
      return JSON.parse(fs.readFileSync(EMAIL_LOGS_PATH, "utf-8"));
    }
  } catch (e) {
    console.error("[EMPANELMENT MAILER] Failed to read email logs:", e);
  }
  return [];
}

function saveEmailLogs(logs: EmpanelmentEmailLog[]) {
  try {
    fs.writeFileSync(EMAIL_LOGS_PATH, JSON.stringify(logs, null, 2), "utf-8");
  } catch (e) {
    console.error("[EMPANELMENT MAILER] Failed to save email logs:", e);
  }
}

async function recordEmailDispatch(params: {
  applicationId: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  templateKey: string;
  htmlBody: string;
  success: boolean;
  errorMessage?: string;
}) {
  const log: EmpanelmentEmailLog = {
    id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    applicationId: params.applicationId,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    subject: params.subject,
    templateKey: params.templateKey,
    status: params.success ? "sent" : "failed",
    error: params.errorMessage || null,
    htmlBody: params.htmlBody,
    sentAt: new Date().toISOString(),
  };

  const allLogs = loadEmailLogs();
  allLogs.unshift(log);
  saveEmailLogs(allLogs);

  // Also log to VendorActivityLog
  await logVendorActivity({
    applicationId: params.applicationId,
    actorType: "SYSTEM",
    actorName: "HiPRO AutoMail Engine",
    action: "EMAIL_DISPATCHED",
    details: `Subject: "${params.subject}" | To: ${params.recipientEmail} | Status: ${log.status}${params.errorMessage ? ` (${params.errorMessage})` : ""}`,
  }).catch(() => null);

  return log;
}

export async function getEmpanelmentEmailLogs(applicationId: string): Promise<EmpanelmentEmailLog[]> {
  const allLogs = loadEmailLogs();
  return allLogs.filter((l) => l.applicationId === applicationId);
}

async function dispatchRoutedEmpanelmentEmail(params: {
  to: string;
  recipientName?: string;
  subject: string;
  htmlBody: string;
  triggerKey: string;
  fallbackSenderName: string;
}) {
  const resolved = await resolveEffectiveMailboxConfig({
    triggerKey: params.triggerKey,
    brand: "empanelment",
    senderName: params.fallbackSenderName,
  });

  const info = await sendOneEmail({
    to: params.to,
    subject: params.subject,
    htmlBody: params.htmlBody,
    brand: "empanelment",
    senderName: resolved.senderName,
    senderEmail: resolved.senderEmail,
    customConfig: resolved.customConfig,
  });

  await recordDirectDispatch({
    to: params.to,
    name: params.recipientName || params.to,
    subject: params.subject,
    brand: "empanelment",
    senderName: resolved.senderName,
    senderEmail: resolved.senderEmail,
    source: `empanelment_${params.triggerKey}`,
    success: true,
  }).catch(() => null);

  return info;
}

export async function retryEmpanelmentEmail(logId: string): Promise<{ success: boolean; error?: string }> {
  const allLogs = loadEmailLogs();
  const index = allLogs.findIndex((l) => l.id === logId);
  if (index === -1) return { success: false, error: "Email log not found" };

  const log = allLogs[index];
  try {
    await dispatchRoutedEmpanelmentEmail({
      to: log.recipientEmail,
      recipientName: log.recipientName,
      subject: log.subject,
      htmlBody: log.htmlBody,
      triggerKey: log.templateKey === "gate_pass_issued" ? "site_gate_passes" : "vendor_kyc_approvals",
      fallbackSenderName: "HiPRO Empanelment Desk",
    });

    log.status = "sent";
    log.error = null;
    log.sentAt = new Date().toISOString();
    saveEmailLogs(allLogs);

    await logVendorActivity({
      applicationId: log.applicationId,
      actorType: "ADMIN",
      actorName: "Procurement Officer",
      action: "EMAIL_RETRIED",
      details: `Retried delivery of email "${log.subject}" to ${log.recipientEmail} - Success`,
    }).catch(() => null);

    return { success: true };
  } catch (err: any) {
    log.status = "failed";
    log.error = err.message || "Retry failed";
    saveEmailLogs(allLogs);
    return { success: false, error: log.error || undefined };
  }
}

interface ApplicationEmailParams {
  email: string;
  companyName: string;
  contactName: string;
  trackingId: string;
  category: string;
  tier: string;
  pan: string;
  gstin?: string | null;
  applicationId?: string;
}

interface StatusEmailParams {
  email: string;
  companyName: string;
  contactName: string;
  trackingId: string;
  status: "APPROVED" | "REJECTED" | "UNDER_REVIEW" | "DOCS_REQUESTED";
  registrationNo?: string | null;
  tier?: string;
  remarks?: string;
  validUntil?: Date | string | null;
  applicationId?: string;
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
  applicationId?: string;
}

/**
 * Resolves full public URL for empanelment portal routes.
 */
export function getEmpanelmentUrl(subpath: string = ""): string {
  const base = (
    process.env.EMPANELMENT_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    process.env.APP_URL ||
    "https://hindustanprojects.in/empanelment"
  ).replace(/\/+$/, "");

  const cleanSub = subpath ? (subpath.startsWith("/") ? subpath : `/${subpath}`) : "";
  if (base.endsWith("/empanelment") && cleanSub.startsWith("/empanelment")) {
    return `${base}${cleanSub.substring("/empanelment".length)}`;
  }
  return `${base}${cleanSub}`;
}

/**
 * 1. Send Application Submission Acknowledgment Email
 */
export async function sendApplicationReceivedEmail(params: ApplicationEmailParams): Promise<void> {
  const { email, companyName, contactName, trackingId, category, tier, pan, gstin, applicationId } = params;

  if (!email || !email.includes("@")) {
    console.warn(`[EMPANELMENT MAILER] Skipping email, invalid address: ${email}`);
    return;
  }

  const trackUrl = getEmpanelmentUrl(`/track?trackingId=${encodeURIComponent(trackingId)}`);
  const currentYear = new Date().getFullYear();
  const subject = `Empanelment Application Received [${trackingId}] - ${companyName}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Empanelment Application Received - Hindustan Projects</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(251, 146, 60, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Metadata Bar -->
          <tr>
            <td style="background-color: #090e17; padding: 8px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #22c55e; margin-right: 6px; vertical-align: middle;"></span>
                    <span>OFFICIAL PROCUREMENT DISPATCH</span>
                  </td>
                  <td align="right" style="font-size: 10px; font-family: monospace; color: #fdba74;">
                    TRACKING: <strong>${trackingId}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 26px 30px; text-align: left; border-bottom: 4px solid #f59e0b;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">HINDUSTAN PROJECTS</div>
                    <div style="font-size: 11px; color: #fed7aa; margin-top: 3px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Procurement Directorate • Vendor & Contractor Empanelment Board</div>
                  </td>
                  <td align="right">
                    <span style="background: rgba(0,0,0,0.3); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 1px;">STATUTORY DOSSIER</span>
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
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(251, 146, 60, 0.08); border: 1px dashed rgba(251, 146, 60, 0.4); border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fdba74; font-weight: 700;">YOUR APPLICATION TRACKING ID</div>
                    <div style="font-size: 24px; font-weight: 800; color: #ffedd5; letter-spacing: 1.5px; margin: 4px 0 8px 0; font-family: monospace;">${trackingId}</div>
                    <div style="font-size: 12px; color: #cbd5e1;">Use this tracking identifier to inspect verification status anytime.</div>
                  </td>
                </tr>
              </table>

              <!-- Application Details -->
              <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background: #1e293b; border-radius: 8px; font-size: 13px; color: #e2e8f0; margin-bottom: 24px; border: 1px solid #334155;">
                <tr>
                  <td width="35%" style="color: #94a3b8; border-bottom: 1px solid #334155;">Company:</td>
                  <td style="font-weight: 600; border-bottom: 1px solid #334155;">${companyName}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; border-bottom: 1px solid #334155;">Category:</td>
                  <td style="font-weight: 600; border-bottom: 1px solid #334155;">${category || "Pending Classification"}</td>
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

              <!-- Action Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${trackUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4);">
                  Track Application Status Online &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Corporate Headquarters & Credentials Footer -->
          <tr data-hipro-corporate-footer="true">
            <td style="background: #090d16; padding: 26px 30px 20px; text-align: center; border-top: 1px solid #1e293b; color: #cbd5e1; font-size: 11px; line-height: 1.6;">
              <div style="font-size: 13px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                Hindustan Projects Procurement & Vendor Empanelment Directorate
              </div>
              <p style="margin: 8px 0 0; color: #e2e8f0; font-size: 11px;">
                📍 Bhopal Ganj, Bhilwara - 311001, Rajasthan • Helpline: +91 75970 00601
              </p>
              <p style="margin: 8px 0 0; font-size: 10px; color: #64748b;">
                ⚡ Dispatched via <strong>Hindustan Projects AutoMail Engine</strong> • © ${currentYear} All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  let success = false;
  let errorMessage: string | undefined;

  try {
    await dispatchRoutedEmpanelmentEmail({
      to: email,
      recipientName: contactName,
      subject,
      htmlBody,
      triggerKey: "vendor_kyc_approvals",
      fallbackSenderName: "HiPRO Empanelment Desk",
    });
    success = true;
    console.log(`[EMPANELMENT MAILER] Acknowledgment email sent to ${email} for ${trackingId}`);
  } catch (err: any) {
    errorMessage = err?.message || String(err);
    console.warn(`[EMPANELMENT MAILER] Failed to send acknowledgment email:`, errorMessage);
  } finally {
    if (applicationId) {
      await recordEmailDispatch({
        applicationId,
        recipientEmail: email,
        recipientName: contactName,
        subject,
        templateKey: "application_received",
        htmlBody,
        success,
        errorMessage,
      });
    }
  }
}

/**
 * 2. Send Status Change Notification (APPROVED, REJECTED, DOCS_REQUESTED)
 */
export async function sendApplicationStatusEmail(params: StatusEmailParams): Promise<void> {
  const { email, companyName, contactName, trackingId, status, registrationNo, tier, remarks, applicationId } = params;

  if (!email || !email.includes("@")) {
    console.warn(`[EMPANELMENT MAILER] Skipping status email, invalid address: ${email}`);
    return;
  }

  const isApproved = status === "APPROVED";
  const isDocsRequested = status === "DOCS_REQUESTED";
  const portalUrl = getEmpanelmentUrl(`/track?trackingId=${encodeURIComponent(trackingId)}`);
  const tendersUrl = getEmpanelmentUrl(`/tenders`);
  const currentYear = new Date().getFullYear();

  let subject = `Empanelment Application Status Update [${trackingId}] - Hindustan Projects`;
  if (isApproved) {
    subject = `Congratulations! Empanelment Approved [${registrationNo || trackingId}] - Hindustan Projects`;
  } else if (isDocsRequested) {
    subject = `Action Required: Document Revision Requested [${trackingId}] - Hindustan Projects`;
  }

  const bannerColor = isApproved
    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    : isDocsRequested
    ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
    : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";

  const statusBadge = isApproved
    ? "EMPANELMENT APPROVED"
    : isDocsRequested
    ? "DOCUMENT REVISION REQUESTED"
    : "APPLICATION REJECTED / NEEDS REVISION";

  const htmlBody = `
<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Metadata Bar -->
          <tr>
            <td style="background-color: #090e17; padding: 8px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${isApproved ? "#22c55e" : isDocsRequested ? "#a855f7" : "#ef4444"}; margin-right: 6px; vertical-align: middle;"></span>
                    <span>OFFICIAL STATUS AUDIT NOTICE</span>
                  </td>
                  <td align="right" style="font-size: 10px; font-family: monospace; color: #fdba74;">
                    REG: <strong>${registrationNo || trackingId}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background: ${bannerColor}; padding: 24px 30px; text-align: left; border-bottom: 4px solid rgba(255,255,255,0.2);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">HINDUSTAN PROJECTS</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.85); margin-top: 3px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Procurement Directorate • Vendor & Contractor Empanelment Board</div>
                  </td>
                  <td align="right">
                    <span style="background: rgba(0,0,0,0.3); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800;">${statusBadge}</span>
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
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
                  <tr>
                    <td>
                      <div style="font-size: 11px; text-transform: uppercase; color: #6ee7b7; font-weight: 700;">OFFICIAL VENDOR REGISTRATION NUMBER</div>
                      <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; margin: 4px 0; font-family: monospace;">${registrationNo || trackingId}</div>
                      <div style="font-size: 12px; color: #a7f3d0;">Capacity Tier: <strong>${(tier || "CLASS_C").replace("_", " ")}</strong> &bull; Validity: 2 Years</div>
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; margin: 28px 0 16px 0;">
                  <a href="${portalUrl}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; margin-right: 8px;">
                    View Digital Smart ID Card &rarr;
                  </a>
                  <a href="${tendersUrl}" target="_blank" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;">
                    Browse Active Tenders &rarr;
                  </a>
                </div>
              ` : isDocsRequested ? `
                <h2 style="color: #c084fc; font-size: 20px; margin-top: 0;">Document Revision Required</h2>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                  Dear ${contactName},<br>
                  During the preliminary document audit of your empanelment application (Tracking ID: <strong>${trackingId}</strong>), our review team noted that one or more documents require clarification or re-upload.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 10px; padding: 16px; margin: 20px 0;">
                  <tr>
                    <td>
                      <div style="font-size: 11px; text-transform: uppercase; color: #c4b5fd; font-weight: 700;">AUDIT COMMITTEE INSTRUCTIONS</div>
                      <div style="font-size: 13px; color: #ede9fe; margin-top: 6px; line-height: 1.5;">${remarks || "Please re-upload legible and complete statutory certificates via the vendor portal."}</div>
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; margin: 28px 0 16px 0;">
                  <a href="${getEmpanelmentUrl("/login")}" target="_blank" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;">
                    Log In to Document Vault & Re-upload &rarr;
                  </a>
                </div>
              ` : `
                <h2 style="color: #f87171; font-size: 20px; margin-top: 0;">Application Status Update</h2>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                  Dear ${contactName},<br>
                  Following technical and statutory evaluation, your application for empanelment (Tracking ID: <strong>${trackingId}</strong>) could not be approved at this time.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 16px; margin: 20px 0;">
                  <tr>
                    <td>
                      <div style="font-size: 11px; text-transform: uppercase; color: #fca5a5; font-weight: 700;">AUDIT COMMITTEE REMARKS</div>
                      <div style="font-size: 13px; color: #fecaca; margin-top: 6px; line-height: 1.5;">${remarks || "Statutory documentation or turnover criteria did not satisfy empanelment guidelines for this tier."}</div>
                    </td>
                  </tr>
                </table>
              `}
            </td>
          </tr>

          <!-- Corporate Headquarters & Credentials Footer -->
          <tr data-hipro-corporate-footer="true">
            <td style="background: #090d16; padding: 26px 30px 20px; text-align: center; border-top: 1px solid #1e293b; color: #cbd5e1; font-size: 11px; line-height: 1.6;">
              <div style="font-size: 13px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                Hindustan Projects Procurement Directorate
              </div>
              <p style="margin: 8px 0 0; color: #e2e8f0; font-size: 11px;">
                📍 Bhopal Ganj, Bhilwara - 311001, Rajasthan • Helpline: +91 75970 00601
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  let success = false;
  let errorMessage: string | undefined;

  try {
    await dispatchRoutedEmpanelmentEmail({
      to: email,
      recipientName: contactName,
      subject,
      htmlBody,
      triggerKey: "vendor_kyc_approvals",
      fallbackSenderName: "HiPRO Empanelment Desk",
    });
    success = true;
    console.log(`[EMPANELMENT MAILER] Status update email sent to ${email} (${status})`);
  } catch (err: any) {
    errorMessage = err?.message || String(err);
    console.warn(`[EMPANELMENT MAILER] Failed to send status email:`, errorMessage);
  } finally {
    if (applicationId) {
      await recordEmailDispatch({
        applicationId,
        recipientEmail: email,
        recipientName: contactName,
        subject,
        templateKey: `status_${status.toLowerCase()}`,
        htmlBody,
        success,
        errorMessage,
      });
    }
  }
}

/**
 * 3. Send Daily Site Gate Pass Email
 */
export async function sendSiteGatePassEmail(params: GatePassEmailParams): Promise<void> {
  const { email, visitorName, companyName, passCode, siteLocation, purpose, validUntil, applicationId } = params;

  if (!email || !email.includes("@")) {
    return;
  }

  const verifyUrl = getEmpanelmentUrl(`/verify-pass?passCode=${encodeURIComponent(passCode)}`);
  const currentYear = new Date().getFullYear();
  const subject = `Site Gate Pass [${passCode}] - ${siteLocation} (${visitorName})`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HiPRO Site Gate Pass - ${passCode}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 25px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #1e293b; border: 2px solid #3b82f6; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Metadata Bar -->
          <tr>
            <td style="background-color: #090e17; padding: 8px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #22c55e; margin-right: 6px; vertical-align: middle;"></span>
                    <span>SITE ACCESS CLEARANCE PERMIT</span>
                  </td>
                  <td align="right" style="font-size: 10px; font-family: monospace; color: #60a5fa;">
                    PASS: <strong>${passCode}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); padding: 20px 24px; color: #ffffff; border-bottom: 3px solid #60a5fa;">
              <div style="font-size: 18px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">HINDUSTAN PROJECTS</div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #bfdbfe; font-weight: 700; margin-top: 2px;">Site Security Directorate &bull; 24-Hour Digital Gate Pass</div>
            </td>
          </tr>

          <!-- Pass Details -->
          <tr>
            <td style="padding: 24px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">PASS IDENTIFIER</div>
                <div style="font-size: 26px; font-weight: 900; color: #60a5fa; font-family: monospace; letter-spacing: 2px;">${passCode}</div>
                <div style="font-size: 12px; color: #34d399; font-weight: 600; margin-top: 4px;">&#10004; ACTIVE & VALID (24 HOURS)</div>
              </div>

              <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; color: #e2e8f0; border-top: 1px solid #334155; margin-bottom: 20px;">
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
                <a href="${verifyUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                  Open Security QR Verification &rarr;
                </a>
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

  let success = false;
  let errorMessage: string | undefined;

  try {
    await dispatchRoutedEmpanelmentEmail({
      to: email,
      recipientName: visitorName,
      subject,
      htmlBody,
      triggerKey: "site_gate_passes",
      fallbackSenderName: "HiPRO Site Security",
    });
    success = true;
    console.log(`[EMPANELMENT MAILER] Gate pass email sent to ${email} (${passCode})`);
  } catch (err: any) {
    errorMessage = err?.message || String(err);
    console.warn(`[EMPANELMENT MAILER] Failed to send gate pass email:`, errorMessage);
  } finally {
    if (applicationId) {
      await recordEmailDispatch({
        applicationId,
        recipientEmail: email,
        recipientName: visitorName,
        subject,
        templateKey: "gate_pass_issued",
        htmlBody,
        success,
        errorMessage,
      });
    }
  }
}

/**
 * 4. Send Vendor Account Activation Invitation Email
 */
export async function sendVendorActivationEmail(params: {
  email: string;
  contactName: string;
  companyName: string;
  activationToken: string;
  applicationId: string;
}): Promise<void> {
  const { email, contactName, companyName, activationToken, applicationId } = params;
  const activateUrl = getEmpanelmentUrl(`/activate?token=${encodeURIComponent(activationToken)}`);
  const subject = `Congratulations! Empanelment Approved — Set Password & Enter Vendor Portal — ${companyName}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en" data-hipro-branded="true">
<body style="margin: 0; padding: 20px; background: #0f172a; font-family: -apple-system, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table role="presentation" width="580" style="background: #1e293b; border-radius: 14px; border: 1px solid #334155; padding: 30px;">
          <tr>
            <td>
              <div style="font-size: 18px; font-weight: 800; color: #f97316; text-transform: uppercase;">Hindustan Projects</div>
              <div style="display: inline-block; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #4ade80; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; margin-top: 10px; letter-spacing: 0.5px;">
                ✔ EMPANELMENT APPROVED & VERIFIED
              </div>
              <h2 style="color: #ffffff; font-size: 20px; margin: 12px 0 8px;">Access Your HiPRO Vendor Portal</h2>
              <p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.6;">
                Dear ${contactName},<br>
                Congratulations! Your company <strong>${companyName}</strong> has been officially approved as an authorized partner for Hindustan Projects.
              </p>
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                To get started, please set your secure account password. Once configured, you will automatically be logged in to your dedicated dashboard to browse live tenders, place commercial bids, and generate daily 24-hr site gate passes.
              </p>
              <div style="text-align: center; margin: 26px 0;">
                <a href="${activateUrl}" target="_blank" style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: #fff; padding: 14px 34px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4);">
                  Set Password & Enter Portal &rarr;
                </a>
              </div>
              <p style="color: #64748b; font-size: 11.5px; line-height: 1.5;">
                This secure setup link is valid for 72 hours. If you did not apply for empanelment, please notify empanelment@hindustanprojects.in.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  let success = false;
  let errorMessage: string | undefined;

  try {
    await dispatchRoutedEmpanelmentEmail({
      to: email,
      recipientName: contactName,
      subject,
      htmlBody,
      triggerKey: "vendor_kyc_approvals",
      fallbackSenderName: "HiPRO Vendor Access Desk",
    });
    success = true;
  } catch (err: any) {
    errorMessage = err?.message || String(err);
  } finally {
    await recordEmailDispatch({
      applicationId,
      recipientEmail: email,
      recipientName: contactName,
      subject,
      templateKey: "vendor_activation_invite",
      htmlBody,
      success,
      errorMessage,
    });
  }
}

/**
 * 5. Send Password Reset Assistance Email
 */
export async function sendPasswordResetEmail(params: {
  email: string;
  contactName: string;
  resetToken: string;
  applicationId: string;
}): Promise<void> {
  const { email, contactName, resetToken, applicationId } = params;
  const resetUrl = getEmpanelmentUrl(`/reset-password?token=${encodeURIComponent(resetToken)}`);
  const subject = `Reset Your HiPRO Vendor Portal Password`;

  const htmlBody = `
  <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; color: #b45309; margin-bottom: 8px;">Vendor Portal Account Security</div>
  <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 10px;">Password Reset Request</h2>
  <p style="color: #334155; font-size: 14px; line-height: 1.6;">
    Dear <strong>${contactName}</strong>,<br>
    A password reset request was initiated for your Hindustan Projects Vendor Portal account. Use the secure link below to set a new password:
  </p>
  <div style="text-align: center; margin: 24px 0;">
    <a href="${resetUrl}" target="_blank" style="background: #0f172a; color: #ffffff; padding: 13px 30px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; display: inline-block;">
      Reset Vendor Portal Password &rarr;
    </a>
  </div>
  <p style="color: #64748b; font-size: 12px; line-height: 1.5; background: #f8fafc; padding: 12px 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
    This verification link expires in 2 hours. If you did not request a password reset, please disregard this message safely.
  </p>`;

  let success = false;
  let errorMessage: string | undefined;

  try {
    await dispatchRoutedEmpanelmentEmail({
      to: email,
      recipientName: contactName,
      subject,
      htmlBody,
      triggerKey: "vendor_kyc_approvals",
      fallbackSenderName: "HiPRO Vendor Security",
    });
    success = true;
  } catch (err: any) {
    errorMessage = err?.message || String(err);
  } finally {
    await recordEmailDispatch({
      applicationId,
      recipientEmail: email,
      recipientName: contactName,
      subject,
      templateKey: "password_reset",
      htmlBody,
      success,
      errorMessage,
    });
  }
}

/**
 * 6. Send Bid Confirmation Notification Email
 */
export async function sendBidConfirmationEmail(params: {
  email: string;
  companyName: string;
  contactName: string;
  tenderNo: string;
  tenderTitle: string;
  bidAmount: number;
  proposedDays?: number | null;
  applicationId: string;
}): Promise<void> {
  const { email, companyName, contactName, tenderNo, tenderTitle, bidAmount, proposedDays, applicationId } = params;
  const subject = `Tender Bid Submitted [${tenderNo}] — ${tenderTitle}`;

  const htmlBody = `
  <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; color: #b45309; margin-bottom: 6px;">Tender Bid Confirmation</div>
  <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 10px;">Commercial Bid Acknowledgment</h2>
  <p style="color: #334155; font-size: 13.5px; line-height: 1.6;">
    Dear <strong>${contactName}</strong> (${companyName}),<br>
    Your electronic commercial bid for tender <strong>${tenderNo}</strong> (${tenderTitle}) has been securely logged into the procurement evaluation registry.
  </p>
  <table role="presentation" style="width: 100%; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin: 16px 0; font-size: 13px; color: #0f172a;">
    <tr><td style="padding: 10px 14px; color: #64748b; width: 40%; border-bottom: 1px solid #e2e8f0;">Tender Package:</td><td style="padding: 10px 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${tenderTitle}</td></tr>
    <tr><td style="padding: 10px 14px; color: #64748b;">Commercial Quote:</td><td style="padding: 10px 14px; font-weight: 800; color: #059669;">₹${bidAmount.toLocaleString("en-IN")}</td></tr>
    ${proposedDays ? `<tr><td style="padding: 10px 14px; color: #64748b; border-top: 1px solid #e2e8f0;">Completion Timeline:</td><td style="padding: 10px 14px; border-top: 1px solid #e2e8f0;">${proposedDays} Working Days</td></tr>` : ""}
  </table>
  <p style="color: #475569; font-size: 12.5px; margin-bottom: 0;">
    The procurement evaluation committee will review all submitted bids post the tender closing deadline.
  </p>`;

  let success = false;
  let errorMessage: string | undefined;

  try {
    await dispatchRoutedEmpanelmentEmail({
      to: email,
      recipientName: contactName,
      subject,
      htmlBody,
      triggerKey: "tenders_support",
      fallbackSenderName: "HiPRO Procurement Directorate",
    });
    success = true;
  } catch (err: any) {
    errorMessage = err?.message || String(err);
  } finally {
    await recordEmailDispatch({
      applicationId,
      recipientEmail: email,
      recipientName: contactName,
      subject,
      templateKey: "bid_submitted",
      htmlBody,
      success,
      errorMessage,
    });
  }
}

/**
 * 7. Send Custom Email to Vendor (Admin Manual Send with Preview/Edit)
 */
export async function sendCustomVendorEmail(params: {
  applicationId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  htmlBody: string;
  adminName: string;
  mailboxId?: string;
  senderEmail?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { applicationId, recipientEmail, recipientName, subject, htmlBody, adminName, mailboxId, senderEmail } = params;

  let success = false;
  let errorMessage: string | undefined;

  let resolved: any = null;
  try {
    resolved = await resolveEffectiveMailboxConfig({
      mailboxId,
      senderEmail,
      triggerKey: "vendor_kyc_approvals",
      brand: "empanelment",
      senderName: adminName ? `${adminName} (HiPRO Procurement)` : "HiPRO Empanelment Desk",
    });
    await sendOneEmail({
      to: recipientEmail,
      subject,
      htmlBody,
      brand: "empanelment",
      senderName: resolved.senderName,
      senderEmail: resolved.senderEmail,
      customConfig: resolved.customConfig,
    });
    success = true;
  } catch (err: any) {
    errorMessage = err?.message || String(err);
  } finally {
    await recordEmailDispatch({
      applicationId,
      recipientEmail,
      recipientName,
      subject,
      templateKey: "custom_admin_dispatch",
      htmlBody,
      success,
      errorMessage,
    });
    await recordDirectDispatch({
      to: recipientEmail,
      name: recipientName,
      subject,
      brand: "empanelment",
      senderName: resolved?.senderName || "HiPRO Empanelment Desk",
      senderEmail: resolved?.senderEmail || "info@hindustanprojects.in",
      source: "vendor_manual_email",
      success,
      errorMessage,
    }).catch(() => null);
  }

  return { success, error: errorMessage };
}
