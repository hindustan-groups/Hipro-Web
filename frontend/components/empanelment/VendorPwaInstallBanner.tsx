"use client";

import React, { useEffect, useState } from "react";
import { Download, Smartphone, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function VendorPwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [dismissed, setDismissed] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [showManualHint, setShowManualHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register Vendor PWA service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/vendor-sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const wasDismissed = localStorage.getItem("hipro_vendor_pwa_dismissed") === "1";
    setDismissed(wasDismissed);

    const ua = window.navigator.userAgent || "";
    const iosDevice = /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream;
    setIsIos(iosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowManualHint((prev) => !prev);
      return;
    }
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } catch (_e) {
      setShowManualHint(true);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("hipro_vendor_pwa_dismissed", "1");
    } catch (_e) {}
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xs sm:text-sm font-bold text-white">
            Install HiPRO Vendor App on Your Phone
          </h3>
          {deferredPrompt ? (
            <p className="text-[11px] sm:text-xs text-slate-300">
              Use the vendor portal like a native mobile app with 1-tap access to tenders &amp; updates.
            </p>
          ) : isIos ? (
            <p className="text-[11px] sm:text-xs text-slate-300 flex flex-wrap items-center gap-1">
              <span>Tap</span>
              <Share className="w-3.5 h-3.5 inline text-sky-400" />
              <strong>Share</strong>
              <span>then</span>
              <strong>&ldquo;Add to Home Screen&rdquo;</strong>
              <span>to install as an app.</span>
            </p>
          ) : (
            <p className="text-[11px] sm:text-xs text-slate-300">
              Open your browser menu (<strong>⋮</strong>) and tap <strong>&ldquo;Install App&rdquo;</strong> or <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installing}
          className="px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{installing ? "Installing..." : "Install Now"}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {showManualHint && !deferredPrompt && (
        <div className="w-full sm:hidden mt-1 p-2.5 rounded-xl bg-white/10 border border-white/15 text-[11px] text-slate-200">
          {isIos
            ? 'Tap Share ↑ at the bottom, then select "Add to Home Screen".'
            : 'Tap the ⋮ menu at top-right of Chrome and select "Add to Home screen" / "Install app".'}
        </div>
      )}
    </div>
  );
}
