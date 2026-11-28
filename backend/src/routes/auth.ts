import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { hashPassword, verifyPassword, createSession, logout, getSessionUser } from "../lib/auth";
import { authLoginLimiter } from "../middleware/rateLimiter";
import {
  generateTotpSetup,
  verifyTotp,
  generateBackupCodes,
  sign2FaTempToken,
  verify2FaTempToken,
} from "../lib/totp";
import {
  sendOneEmail,
  resolveEffectiveMailboxConfig,
  recordDirectDispatch,
} from "../services/automail/emailSender";
import { getAutomailSettings, resolveSenderForTrigger } from "../services/automail/settingsService";
import { escapeHtml } from "../services/automail/emailTemplateWrapper";

const router = Router();

function getClientIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.trim()) {
    return fwd.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "Unknown IP";
}

async function dispatchAdminSecurityEmail(params: {
  to: string;
  adminName?: string | null;
  eventTitle: string;
  eventSummary: string;
  req: Request;
}) {
  try {
    const cleanEmail = (params.to || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) return;

    const settings = getAutomailSettings();
    const secRule = settings.dispatchRouting?.security_alerts;
    if (secRule && secRule.active === false) return;

    const routed = resolveSenderForTrigger("security_alerts");
    const resolved = await resolveEffectiveMailboxConfig({
      mailboxId: routed.mailbox?.id,
      senderEmail: (routed as any).senderEmail || routed.mailbox?.email,
      triggerKey: "security_alerts",
      brand: "all",
    });

    const ipAddress = getClientIp(params.req);
    const userAgent = String(params.req.headers["user-agent"] || "Unknown Device").slice(0, 140);
    const timestampIst = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium",
    });

    const subject = `[Security Alert] ${params.eventTitle} — HiPRO Master Cockpit`;
    const htmlBody = `
      <div style="padding: 4px 0;">
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px 18px; margin-bottom: 18px;">
          <h2 style="margin: 0 0 6px; font-size: 16px; font-weight: 800; color: #1e3a8a;">
            ${escapeHtml(params.eventTitle)}
          </h2>
          <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
            ${escapeHtml(params.eventSummary)}
          </p>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; margin-bottom: 16px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 14px; font-weight: bold; color: #64748b; width: 34%;">Admin Account:</td>
            <td style="padding: 9px 14px; font-weight: 700; color: #0f172a;">${escapeHtml(cleanEmail)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 14px; font-weight: bold; color: #64748b;">Time (IST):</td>
            <td style="padding: 9px 14px; color: #0f172a;">${escapeHtml(timestampIst)} IST</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 9px 14px; font-weight: bold; color: #64748b;">IP Address:</td>
            <td style="padding: 9px 14px; font-family: monospace; color: #0f172a;">${escapeHtml(ipAddress)}</td>
          </tr>
          <tr>
            <td style="padding: 9px 14px; font-weight: bold; color: #64748b;">Device / Agent:</td>
            <td style="padding: 9px 14px; color: #475569;">${escapeHtml(userAgent)}</td>
          </tr>
        </table>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
          If this activity was authorized by you, no further action is needed. If you do not recognize this activity, please change your Master Admin password immediately and verify 2FA in Security Settings.
        </p>
      </div>
    `;

    await sendOneEmail({
      to: cleanEmail,
      subject,
      htmlBody,
      senderName: resolved.senderName,
      senderEmail: resolved.senderEmail,
      brand: "all",
      customConfig: resolved.customConfig,
    });

    await recordDirectDispatch({
      to: cleanEmail,
      name: params.adminName || "Master Admin",
      subject,
      brand: "all",
      senderName: resolved.senderName,
      senderEmail: resolved.senderEmail,
      source: "admin_security_alert",
      success: true,
    });
  } catch (err: any) {
    console.warn("[AUTH SECURITY MAIL] Non-blocking security alert dispatch failed:", err?.message || err);
  }
}

// Explicitly prevent caching of sensitive authentication and session endpoints
router.use((_req: Request, res: Response, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// POST /api/auth/login — Step 1: Password Check -> Prompts 2FA if enabled
router.post("/login", authLoginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!normalizedEmail || !cleanPassword) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    // Lookup user in database
    let user = await prisma.adminUser.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
        },
      },
    });

    // If configured via Environment Variables (ADMIN_EMAIL and ADMIN_PASSWORD), auto-seed if absent
    const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (!user && envAdminEmail && envAdminPassword && normalizedEmail === envAdminEmail) {
      if (cleanPassword === envAdminPassword) {
        user = await prisma.adminUser.create({
          data: {
            email: envAdminEmail,
            password: hashPassword(envAdminPassword),
            name: process.env.ADMIN_NAME || "Master Admin",
            role: "admin",
            permissions: "[]",
          },
        });
        console.log("Admin account initialized from environment variables:", user.email);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Verify password against stored hash
    const isValid = verifyPassword(cleanPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Check if 2FA (Google Authenticator) is enabled for this user
    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      const tempToken = sign2FaTempToken(user.id);
      return res.json({
        success: true,
        requires2FA: true,
        tempToken,
        email: user.email,
        message: "Google Authenticator code required",
      });
    }

    // If 2FA not enabled, create session cookie directly
    await createSession(user.id, res);

    void dispatchAdminSecurityEmail({
      to: user.email,
      adminName: user.name,
      eventTitle: "Master Admin Login Detected",
      eventSummary: `Your admin account (${user.email}) signed in to the HiPRO Master Cockpit.`,
      req,
    });

    return res.json({
      success: true,
      requires2FA: false,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/auth/login/verify-2fa — Step 2: Google Authenticator TOTP or Backup Code Verification
router.post("/login/verify-2fa", authLoginLimiter, async (req: Request, res: Response) => {
  try {
    const { tempToken, code } = req.body;
    const cleanCode = (code || "").toString().trim().toUpperCase();

    if (!tempToken || !cleanCode) {
      return res.status(400).json({ success: false, error: "Temporary token and 6-digit code required" });
    }

    // Verify temporary token signature and 5-minute expiry
    const userId = verify2FaTempToken(tempToken);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Verification session has expired or is invalid. Please log in again.",
      });
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return res.status(401).json({ success: false, error: "Invalid user or 2FA not configured" });
    }

    // Check 1: Normal 6-digit TOTP code
    const isTotpValid = verifyTotp(cleanCode, user.twoFactorSecret);
    let backupCodeUsed = false;

    if (!isTotpValid) {
      // Check 2: Emergency backup code
      let backupCodes: string[] = [];
      try {
        if (user.twoFactorBackupCodes) {
          backupCodes = JSON.parse(user.twoFactorBackupCodes);
        }
      } catch (e) {
        backupCodes = [];
      }

      const matchIndex = backupCodes.findIndex(
        (bCode) => bCode.replace(/[\s-]/g, "").toUpperCase() === cleanCode.replace(/[\s-]/g, "").toUpperCase()
      );

      if (matchIndex !== -1) {
        // Valid backup code used! Consume and remove it
        backupCodes.splice(matchIndex, 1);
        await prisma.adminUser.update({
          where: { id: user.id },
          data: { twoFactorBackupCodes: JSON.stringify(backupCodes) },
        });
        backupCodeUsed = true;
      } else {
        return res.status(401).json({
          success: false,
          error: "Invalid Google Authenticator code or backup code. Please try again.",
        });
      }
    }

    // 2FA passed! Issue session cookie
    await createSession(user.id, res);

    void dispatchAdminSecurityEmail({
      to: user.email,
      adminName: user.name,
      eventTitle: "Master Admin Login Verified (2FA)",
      eventSummary: `Your admin account (${user.email}) completed Google Authenticator 2FA sign-in${backupCodeUsed ? " using a backup code" : ""}.`,
      req,
    });

    return res.json({
      success: true,
      message: "Authentication successful",
      backupCodeUsed,
    });
  } catch (error) {
    console.error("2FA verify error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  try {
    await logout(req, res);
    return res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }
    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions || "[]",
        isTwoFactorEnabled: !!user.isTwoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================================
// 2FA Management Endpoints (Require Active Admin Session)
// ==========================================================

// GET /api/auth/2fa/status
router.get("/2fa/status", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    let backupCodesCount = 0;
    try {
      if (user.twoFactorBackupCodes) {
        const codes = JSON.parse(user.twoFactorBackupCodes);
        backupCodesCount = Array.isArray(codes) ? codes.length : 0;
      }
    } catch {
      backupCodesCount = 0;
    }

    return res.json({
      success: true,
      data: {
        isTwoFactorEnabled: !!user.isTwoFactorEnabled,
        backupCodesCount,
      },
    });
  } catch (error) {
    console.error("2FA status error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/auth/2fa/setup — Generate QR Code and Secret
router.post("/2fa/setup", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    // Generate fresh TOTP secret & QR code
    const setup = await generateTotpSetup(user.email, "HiPRO Master Cockpit");

    // Store in temp secret column until verified
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { twoFactorTempSecret: setup.secret },
    });

    return res.json({
      success: true,
      data: {
        secret: setup.secret,
        qrCodeDataUrl: setup.qrCodeDataUrl,
        otpAuthUrl: setup.otpAuthUrl,
      },
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate 2FA setup" });
  }
});

// POST /api/auth/2fa/confirm — Verify first 6-digit code and activate 2FA
router.post("/2fa/confirm", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { code } = req.body;
    const cleanCode = (code || "").toString().trim();

    if (!cleanCode || !user.twoFactorTempSecret) {
      return res.status(400).json({
        success: false,
        error: "Verification code and active setup required",
      });
    }

    const isValid = verifyTotp(cleanCode, user.twoFactorTempSecret);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code. Check your Google Authenticator app and try again.",
      });
    }

    // Generate 8 emergency backup codes
    const backupCodes = generateBackupCodes(8);

    // Commit 2FA activation
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: user.twoFactorTempSecret,
        twoFactorTempSecret: null,
        isTwoFactorEnabled: true,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      },
    });

    return res.json({
      success: true,
      message: "Google Authenticator successfully activated",
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    console.error("2FA confirm error:", error);
    return res.status(500).json({ success: false, error: "Failed to activate 2FA" });
  }
});

// POST /api/auth/2fa/disable — Disables 2FA (Requires current password + valid 2FA code)
router.post("/2fa/disable", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { password, code } = req.body;
    if (!password || !code) {
      return res.status(400).json({
        success: false,
        error: "Current password and Google Authenticator code required",
      });
    }

    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: "Incorrect password" });
    }

    if (user.twoFactorSecret) {
      const isTotpValid = verifyTotp(code, user.twoFactorSecret);
      if (!isTotpValid) {
        return res.status(400).json({ success: false, error: "Invalid Google Authenticator code" });
      }
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorTempSecret: null,
        twoFactorBackupCodes: null,
      },
    });

    return res.json({
      success: true,
      message: "Two-Factor Authentication disabled successfully",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return res.status(500).json({ success: false, error: "Failed to disable 2FA" });
  }
});

// POST /api/auth/change-password — Protected with current password + 2FA check
router.post("/change-password", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { currentPassword, newPassword, twoFactorCode } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Current and new password required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: "New password must be at least 8 characters long" });
    }

    // 1. Verify current password
    const isPasswordValid = verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: "Current password is incorrect" });
    }

    // 2. If 2FA is enabled, Google Authenticator code is mandatory
    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorCode) {
        return res.status(400).json({
          success: false,
          error: "Google Authenticator 2FA code is required to change password",
        });
      }

      const isTotpValid = verifyTotp(twoFactorCode, user.twoFactorSecret);
      if (!isTotpValid) {
        return res.status(400).json({
          success: false,
          error: "Invalid Google Authenticator code. Password change rejected.",
        });
      }
    }

    // 3. Update password
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        password: hashPassword(newPassword),
      },
    });

    void dispatchAdminSecurityEmail({
      to: user.email,
      adminName: user.name,
      eventTitle: "Admin Password Changed",
      eventSummary: `The password for your Master Admin account (${user.email}) was successfully updated.`,
      req,
    });

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, error: "Failed to change password" });
  }
});

// POST /api/auth/change-email — Update Admin login email (Protected with password + 2FA check)
router.post("/change-email", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req, res);
    if (!user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const { newEmail, currentPassword, twoFactorCode } = req.body;
    const cleanNewEmail = (newEmail || "").trim().toLowerCase();

    if (!cleanNewEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanNewEmail)) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address" });
    }
    if (!currentPassword) {
      return res.status(400).json({ success: false, error: "Current password is required" });
    }
    if (cleanNewEmail === user.email.toLowerCase()) {
      return res.status(400).json({ success: false, error: "New email is the same as your current login email" });
    }

    const isPasswordValid = verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: "Current password is incorrect" });
    }

    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorCode) {
        return res.status(400).json({
          success: false,
          error: "Google Authenticator 2FA code is required to change login email",
        });
      }
      const isTotpValid = verifyTotp(twoFactorCode, user.twoFactorSecret);
      if (!isTotpValid) {
        return res.status(400).json({
          success: false,
          error: "Invalid Google Authenticator code. Email change rejected.",
        });
      }
    }

    const existing = await prisma.adminUser.findFirst({
      where: { email: cleanNewEmail },
    });
    if (existing && existing.id !== user.id) {
      return res.status(409).json({
        success: false,
        error: "Another admin user already uses this email address",
      });
    }

    const previousEmail = user.email;
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { email: cleanNewEmail },
    });

    // Notify both previous and new login email addresses
    void dispatchAdminSecurityEmail({
      to: previousEmail,
      adminName: user.name,
      eventTitle: "Admin Login Email Changed",
      eventSummary: `Your Master Admin login email was changed from ${previousEmail} to ${cleanNewEmail}.`,
      req,
    });
    void dispatchAdminSecurityEmail({
      to: cleanNewEmail,
      adminName: user.name,
      eventTitle: "Master Admin Login Email Activated",
      eventSummary: `${cleanNewEmail} is now your active Master Admin login & security alert email.`,
      req,
    });

    return res.json({
      success: true,
      message: `Login email updated to ${cleanNewEmail}`,
      email: cleanNewEmail,
    });
  } catch (error) {
    console.error("Change email error:", error);
    return res.status(500).json({ success: false, error: "Failed to update login email" });
  }
});

export default router;
