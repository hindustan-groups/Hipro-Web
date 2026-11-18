import { Router, Request, Response } from "express";
import {
  authenticateVendor,
  createVendorSession,
  getSessionVendor,
  logoutVendor,
  activateVendorAccount,
  requestPasswordReset,
  resetPasswordWithToken,
} from "../services/vendorAccountService";
import { logVendorActivity } from "../services/vendorActivityService";
import { sendPasswordResetEmail } from "../services/empanelmentMailer";

const router = Router();

// Anti-caching for auth routes
router.use((_req: Request, res: Response, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
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

