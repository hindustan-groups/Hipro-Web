import webpush from "web-push";

// Default or environment-provided VAPID Keys
// These keys allow the server to securely sign push payloads
const VAPID_PUBLIC_KEY = 
  process.env.VAPID_PUBLIC_KEY || 
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

const VAPID_PRIVATE_KEY = 
  process.env.VAPID_PRIVATE_KEY || 
  "UUxI2qF1NxHh4yE4fF1z04fPZkWL-UeHqgYj_0h70Zc";

const VAPID_SUBJECT = 
  process.env.VAPID_SUBJECT || 
  "mailto:contact@hindustanprojects.com";

// Initialize web-push configuration
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log("[WebPush] ✅ VAPID details configured successfully.");
} catch (err: any) {
  console.error("[WebPush] ❌ Error setting VAPID details:", err.message);
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
}

export async function sendNotificationToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  const payloadString = JSON.stringify({
    title: payload.title || "Hindustan Projects",
    body: payload.body || "New update available.",
    icon: payload.icon || "/logo.jpg",
    badge: payload.badge || "/logo.jpg",
    image: payload.image || undefined,
    url: payload.url || "/",
    tag: payload.tag || "general",
  });

  return webpush.sendNotification(pushSubscription, payloadString);
}
