"use client";

import { useState, useEffect } from "react";
import { Bell, X, CheckCircle2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const isSecure = window.isSecureContext;
      const hasSupport = "Notification" in window && "serviceWorker" in navigator;

      if (!isSecure || !hasSupport) {
        setPermission("unsupported");
        // Still allow prompt / bell to open on mobile so users see how it works
        return;
      }

      const currentPerm = Notification.permission;
      setPermission(currentPerm);

      // If permission is default (not yet allowed or denied), show prompt on page load
      if (currentPerm === "default") {
        const isDismissed = sessionStorage.getItem("push_dismissed_session");
        if (!isDismissed) {
          setShowPrompt(true);
        }
      }
    }
  }, []);

  const handleSubscribe = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      // 1. Request native browser notification permission via user click gesture
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "denied") {
        setStatusMessage("Notifications were blocked. You can enable them in your browser site settings.");
        setLoading(false);
        return;
      }

      if (result !== "granted") {
        setLoading(false);
        return;
      }

      // 2. Register Service Worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 3. Get VAPID Public Key from backend
      const resKey = await fetch("/api/notifications/vapid-public-key");
      const keyData = await resKey.json();

      if (!keyData.success || !keyData.publicKey) {
        throw new Error("Could not fetch VAPID key");
      }

      // 4. Subscribe to Push Manager
      const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // 5. Send subscription JSON to backend
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

      setStatusMessage("🎉 Notifications enabled! Check your notifications for a welcome message.");
      setTimeout(() => {
        setShowPrompt(false);
        setStatusMessage(null);
      }, 3500);
    } catch (err: any) {
      console.error("Subscription error:", err);
      setStatusMessage("Error activating notifications: " + (err.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("push_dismissed_session", "true");
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Bell Trigger Icon (bottom-left) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setShowPrompt((prev) => !prev)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group border border-white/20 ${
            permission === "granted"
              ? "bg-slate-900 text-emerald-400"
              : "bg-construction-navy text-white hover:bg-black"
          }`}
          aria-label="Notification Preferences"
          title="Notification Alerts"
        >
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          {permission === "default" && (
            <>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-construction-red rounded-full animate-ping pointer-events-none" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-construction-red rounded-full pointer-events-none" />
            </>
          )}
          {permission === "granted" && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white pointer-events-none" />
          )}
        </button>
      </div>

      {/* Main Interactive Prompt Card */}
      {showPrompt && (
        <div className="fixed bottom-20 left-6 right-6 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white/98 backdrop-blur-2xl border border-slate-200/90 rounded-2xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.25)] relative overflow-hidden">
            
            {/* Top decorative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-construction-navy via-construction-red to-yellow-500" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {statusMessage ? (
              <div className="py-2">
                <p className="text-xs font-semibold text-slate-900 leading-relaxed mb-3">
                  {statusMessage}
                </p>
                <button
                  onClick={() => setShowPrompt(false)}
                  className="text-xs text-construction-navy font-bold uppercase tracking-wider hover:underline"
                >
                  Dismiss
                </button>
              </div>
            ) : permission === "granted" ? (
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 shadow-sm mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Notifications Active</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    You are Subscribed!
                  </h4>
                  <p className="text-xs text-slate-600 font-light leading-relaxed mb-4">
                    You will receive real-time updates when new projects or engineering insights are posted.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="bg-construction-navy hover:bg-black text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                      {loading ? "Sending..." : "Test Notification"}
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : permission === "unsupported" ? (
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600 shadow-sm mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Local Testing Notice</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    Push Requires HTTPS on Mobile
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                    Mobile browsers (Android Chrome & iOS Safari) require an encrypted <strong>HTTPS</strong> connection or <strong>localhost</strong> to grant native push permissions.
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    💡 Once deployed to <strong>Render / Vercel / Live Domain (HTTPS)</strong>, mobile devices will receive native push popups automatically!
                  </p>
                  <button
                    onClick={handleDismiss}
                    className="text-xs font-bold text-construction-navy hover:underline"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : permission === "denied" ? (
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-600 shadow-sm mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-3">
                  <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    Notifications Blocked in Browser
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    To receive alerts, click the <strong>tune/padlock icon 🔒</strong> on the left of your URL bar and set <strong>Notifications</strong> to <strong>Allow</strong>.
                  </p>
                  <button
                    onClick={handleDismiss}
                    className="text-xs font-bold text-slate-700 hover:underline"
                  >
                    Got it
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-construction-red shadow-sm mt-0.5">
                  <Bell className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-construction-navy">Stay Updated</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    Enable Project &amp; Cost Updates
                  </h4>
                  <p className="text-xs text-slate-600 font-light leading-relaxed mb-4">
                    Get instant notifications on landmark infrastructure projects, cost trends, and architectural news.
                  </p>

                  <div className="flex items-center gap-2">
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
