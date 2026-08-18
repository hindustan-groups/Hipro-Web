import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getVapidPublicKey, sendNotificationToSubscription, PushPayload } from "../utils/web-push";

const router = Router();
const prisma = new PrismaClient();

// 1. Get VAPID Public Key for client browser subscription
router.get("/vapid-public-key", (req: Request, res: Response) => {
  try {
    const publicKey = getVapidPublicKey();
    return res.json({ success: true, publicKey });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Subscribe user's browser to push notifications
router.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const { endpoint, keys, userAgent } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid push subscription object. Required: endpoint, keys.p256dh, keys.auth" 
      });
    }

    // Upsert subscription into database
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || req.headers["user-agent"] || null,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || req.headers["user-agent"] || null,
      },
    });

    console.log(`[WebPush] 👤 New subscriber registered: ${endpoint.slice(0, 45)}...`);

    // Send immediate confirmation / welcome push notification
    try {
      await sendNotificationToSubscription(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
        {
          title: "🎉 Notifications Activated!",
          body: "Thank you for subscribing to Hindustan Projects. You'll now receive timely updates on new construction projects & engineering insights.",
          icon: "/logo.jpg",
          url: "/",
        }
      );
    } catch (pushErr: any) {
      console.warn("[WebPush] Note: Initial welcome ping delivery attempt:", pushErr.message);
    }

    return res.json({ success: true, message: "Subscription saved successfully.", id: subscription.id });
  } catch (error: any) {
    console.error("[WebPush] Error saving subscription:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Unsubscribe user
router.post("/unsubscribe", async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, error: "Missing endpoint" });
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });

    return res.json({ success: true, message: "Unsubscribed successfully." });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Get active subscribers count for Admin Dashboard
router.get("/subscribers-count", async (req: Request, res: Response) => {
  try {
    const count = await prisma.pushSubscription.count();
    return res.json({ success: true, count });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Broadcast push notification to all subscribers
router.post("/broadcast", async (req: Request, res: Response) => {
  try {
    const { title, body, url, icon, image } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, error: "Title and Body are required." });
    }

    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return res.json({ success: true, message: "No active subscribers found.", sent: 0, failed: 0 });
    }

    const payload: PushPayload = {
      title,
      body,
      url: url || "/",
      icon: icon || "/logo.jpg",
      image: image || undefined,
    };

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    // Send to all subscribers in parallel
    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await sendNotificationToSubscription(
            {
              endpoint: sub.endpoint,
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
            payload
          );
          sent++;
        } catch (err: any) {
          failed++;
          // 404 or 410 Gone means the user revoked permissions or uninstalled browser
          if (err.statusCode === 410 || err.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // Clean up dead/expired subscriptions from database
    if (expiredEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: expiredEndpoints } },
      });
      console.log(`[WebPush] Cleaned up ${expiredEndpoints.length} expired subscriptions.`);
    }

    console.log(`[WebPush] 📢 Broadcast finished: ${sent} sent, ${failed} failed.`);
    return res.json({ 
      success: true, 
      sent, 
      failed, 
      total: subscriptions.length,
      message: `Notification broadcasted to ${sent} subscriber(s).` 
    });
  } catch (error: any) {
    console.error("[WebPush] Error broadcasting notification:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
