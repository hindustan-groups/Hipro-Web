import { Router, Request, Response } from "express";
import {
  authenticateVendor,
  createVendorSession,
  ensureActiveVendorAccount,
  getSessionVendor,
  logoutVendor,
  activateVendorAccount,
  findVendorByActivationToken,
  requestPasswordReset,
  resetPasswordWithToken,
} from "../services/vendorAccountService";
import { logVendorActivity } from "../services/vendorActivityService";
import { sendPasswordResetEmail } from "../services/empanelmentMailer";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  verifyMsg91WidgetToken,
  normalizeIndianPhone,
} from "../services/vendorOtpService";
import { prisma } from "../lib/db";

const router = Router();

// Anti-caching for auth routes
router.use((_req: Request, res: Response, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

/**
 * GET /api/vendor/auth/check-registered?phone=...
 * Checks if a mobile number has a submitted vendor application before sending login OTP.
 */
router.get("/check-registered", async (req: Request, res: Response) => {
  try {
    const cleanPhone = normalizeIndianPhone(String(req.query.phone || ""));
    if (!cleanPhone) {
      return res.json({ success: true, registered: false });
    }

    const application = await prisma.vendorApplication.findFirst({
      where: {
        phone: cleanPhone,
        status: { not: "DRAFT" },
      },
      orderBy: { submittedAt: "desc" },
      select: { id: true },
    });

    return res.json({ success: true, registered: Boolean(application) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/vendor/auth/otp/send
 * Sends a 6-digit login OTP to a registered vendor's mobile number.
 */
router.post("/otp/send", async (req: Request, res: Response) => {
  try {
    const cleanPhone = normalizeIndianPhone(req.body?.phone);
    if (!cleanPhone) {
      return res.status(400).json({ success: false, error: "Valid 10-digit mobile number is required." });
    }

    const application = await prisma.vendorApplication.findFirst({
      where: { phone: cleanPhone, status: { not: "DRAFT" } },
      orderBy: { submittedAt: "desc" },
      select: { id: true, phone: true, contactName: true },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "No vendor account found for this mobile number. Please register first.",
      });
    }

    const result = await sendPhoneOtp(cleanPhone);
    return res.json({
      success: true,
      message:
        result.smsMode === "LIVE"
          ? `Login OTP sent to +91 ${result.phone}`
          : `Login OTP generated for +91 ${result.phone}`,
      ...result,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || "Failed to send OTP" });
  }
});

/**
 * POST /api/vendor/auth/otp/verify
 * Verifies login OTP and creates a vendor portal session immediately.
 */
router.post("/otp/verify", async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body || {};
    const verified = await verifyPhoneOtp(phone, otp);

    const application = await prisma.vendorApplication.findFirst({
      where: { phone: verified.phone },
      orderBy: { submittedAt: "desc" },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Vendor application not found for this mobile number.",
      });
    }

    const account = await ensureActiveVendorAccount(application.id, application.email);
    const token = await createVendorSession(account.id, res, req);

    await logVendorActivity({
      applicationId: application.id,
      vendorAccountId: account.id,
      actorType: "VENDOR",
      actorName: application.contactName || application.phone,
      action: "VENDOR_LOGGED_IN",
      details: `Logged in via Mobile OTP from IP: ${req.ip || "unknown"}`,
    }).catch(() => null);

    return res.json({
      success: true,
      message: "Logged in successfully",
      data: {
        token,
        account: {
          id: account.id,
          email: account.email,
          status: account.status,
          applicationId: account.applicationId,
        },
        application,
      },
    });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message || "OTP verification failed" });
  }
});

/**
 * POST /api/vendor/auth/otp/verify-widget
 * Verifies MSG91 Widget JWT access-token on backend and creates vendor session.
 */
router.post("/otp/verify-widget", async (req: Request, res: Response) => {
  try {
    const { phone, accessToken } = req.body || {};
    const verified = await verifyMsg91WidgetToken(accessToken, phone);

    const application = await prisma.vendorApplication.findFirst({
      where: { phone: verified.phone },
      orderBy: { submittedAt: "desc" },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "No vendor registration found for this mobile number. Please register first.",
      });
    }

    const account = await ensureActiveVendorAccount(application.id, application.email);
    const token = await createVendorSession(account.id, res, req);

    await logVendorActivity({
      applicationId: application.id,
      vendorAccountId: account.id,
      actorType: "VENDOR",
      actorName: application.contactName || application.phone,
      action: "VENDOR_LOGGED_IN",
      details: `Logged in via MSG91 OTP Widget from IP: ${req.ip || "unknown"}`,
    }).catch(() => null);

    return res.json({
      success: true,
      message: "Logged in successfully",
      data: {
        token,
        account: {
          id: account.id,
          email: account.email,
          status: account.status,
          applicationId: account.applicationId,
        },
        application,
      },
    });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message || "MSG91 login failed" });
  }
});

/**
 * POST /api/vendor/auth/login
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const account = await authenticateVendor(email, password);
    const token = await createVendorSession(account.id, res, req);

    await logVendorActivity({
      applicationId: account.applicationId,
      vendorAccountId: account.id,
      actorType: "VENDOR",
      actorName: account.email,
      action: "VENDOR_LOGGED_IN",
      details: `Successful login from IP: ${req.ip || "unknown"}`,
    }).catch(() => null);

    return res.json({
      success: true,
      message: "Logged in successfully",
      data: {
        token,
        account: {
          id: account.id,
          email: account.email,
          status: account.status,
          applicationId: account.applicationId,
        },
      },
    });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message || "Invalid credentials" });
  }
});

/**
 * POST /api/vendor/auth/logout
 */
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const session = await getSessionVendor(req);
    if (session) {
      await logVendorActivity({
        applicationId: session.account.applicationId,
        vendorAccountId: session.account.id,
        actorType: "VENDOR",
        actorName: session.account.email,
        action: "VENDOR_LOGGED_OUT",
        details: "Logged out",
      }).catch(() => null);
    }

    await logoutVendor(req, res);
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/vendor/auth/me
 */
router.get("/me", async (req: Request, res: Response) => {
  try {
    const session = await getSessionVendor(req);
    if (!session) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    return res.json({
      success: true,
      data: {
        account: session.account,
        application: session.application,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/vendor/auth/verify-token?token=...
 * Inspects an activation link and returns associated verified enterprise metadata.
 */
router.get("/verify-token", async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || "").trim();
    if (!token) {
      return res.status(400).json({ success: false, error: "Activation token is required" });
    }

    const result = await findVendorByActivationToken(token);
    if (!result) {
      return res.status(400).json({
        success: false,
        error: "This activation link is invalid or has expired. Please request a new setup link from administration.",
      });
    }

    return res.json({
      success: true,
      data: {
        email: result.account.email,
        companyName: result.companyName,
        contactName: result.contactName,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/vendor/auth/activate
 */
router.post("/activate", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, error: "Token and password are required" });
    }

    const account = await activateVendorAccount(token, password);
    const sessionToken = await createVendorSession(account.id, res, req);

    await logVendorActivity({
      applicationId: account.applicationId,
      vendorAccountId: account.id,
      actorType: "VENDOR",
      actorName: account.email,
      action: "ACCOUNT_ACTIVATED",
      details: "Vendor completed password setup and account activation",
    }).catch(() => null);

    return res.json({
      success: true,
      message: "Account activated successfully",
      data: {
        token: sessionToken,
        account,
      },
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/vendor/auth/forgot-password
 */
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const result = await requestPasswordReset(email);
    if (result) {
      await sendPasswordResetEmail({
        email: result.account.email,
        contactName: result.account.email.split("@")[0],
        resetToken: result.token,
        applicationId: result.account.applicationId,
      });

      await logVendorActivity({
        applicationId: result.account.applicationId,
        vendorAccountId: result.account.id,
        actorType: "SYSTEM",
        actorName: "HiPRO Security Desk",
        action: "PASSWORD_RESET_REQUESTED",
        details: "Password reset link generated and dispatched",
      }).catch(() => null);
    }

    // Always return success to prevent email enumeration
    return res.json({
      success: true,
      message: "If an active account exists for this email, password reset instructions have been sent.",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/vendor/auth/reset-password
 */
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, error: "Token and password are required" });
    }

    const account = await resetPasswordWithToken(token, password);

    await logVendorActivity({
      applicationId: account.applicationId,
      vendorAccountId: account.id,
      actorType: "VENDOR",
      actorName: account.email,
      action: "PASSWORD_RESET_COMPLETED",
      details: "Vendor successfully updated their account password",
    }).catch(() => null);

    return res.json({
      success: true,
      message: "Password has been successfully updated. You may now log in.",
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

export default router;

