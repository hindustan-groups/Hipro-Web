"use client";

import { useState, useEffect } from "react";
import { Bell, X, CheckCircle2, Sparkles } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationPrompt() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications & service workers
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);

      const dismissed = localStorage.getItem("push_prompt_dismissed");
      const isSubscribed = localStorage.getItem("push_subscribed");

      // If permission is default and not dismissed recently, show polite banner after 4 seconds
      if (Notification.permission === "default" && !dismissed && !isSubscribed) {
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    if (!supported) return;

    setLoading(true);
    try {
      // 1. Request browser notification permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        setShowBanner(false);
        setLoading(false);
        return;
      }

      // 2. Register Service Worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 3. Fetch VAPID Public Key from backend
      const resKey = await fetch("/api/notifications/vapid-public-key");
      const keyData = await resKey.json();

      if (!keyData.success || !keyData.publicKey) {
        throw new Error("Could not retrieve VAPID public key from backend");
      }

      // 4. Subscribe to Push Manager
      const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // 5. Send subscription to backend
      const subJson = subscription.toJSON();
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          userAgent: navigator.userAgent,
        }),
      });

      localStorage.setItem("push_subscribed", "true");
      setSuccess(true);
      setTimeout(() => {
        setShowBanner(false);
        setSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error("[PushNotification] Subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("push_prompt_dismissed", "true");
  };

  if (!supported) return null;

  return (
    <>
      {/* Floating Bell Trigger Icon (bottom-left) */}
      {permission !== "denied" && !showBanner && (
        <button
          onClick={() => setShowBanner(true)}
          className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-construction-navy hover:bg-black text-white flex items-center justify-center shadow-2xl shadow-blue-900/40 hover:scale-110 active:scale-95 transition-all duration-300 group border border-white/20"
          aria-label="Notification Preferences"
          title="Notification Alerts"
        >
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform text-yellow-400" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-construction-red rounded-full animate-ping pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-construction-red rounded-full pointer-events-none" />
        </button>
      )}

      {/* Floating Opt-In Banner Modal */}
      {showBanner && (
        <div className="fixed bottom-6 left-6 right-6 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative overflow-hidden">
            
            {/* Top decorative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-construction-navy via-construction-red to-yellow-500" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 transition-colors p-1"
              aria-label="Dismiss notification prompt"
            >
              <X className="w-4 h-4" />
            </button>

            {success ? (
              <div className="flex items-center gap-3 py-2 text-emerald-600">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Notifications Enabled!</h4>
                  <p className="text-xs text-slate-600">You will receive instant project updates and insights.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-construction-red shadow-sm mt-0.5">
                  <Bell className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-construction-navy">Instant Alerts</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    Enable Project &amp; Cost Updates
                  </h4>
                  <p className="text-xs text-slate-600 font-light leading-relaxed mb-4">
                    Get real-time notifications on landmark projects, construction cost trends, and architectural releases.
                  </p>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="bg-construction-red hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
                    >
                      {loading ? "Subscribing..." : "Allow Notifications"}
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
