"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, ShieldCheck } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("hipro_cookie_consent");
      if (!consent) {
        // Show after a brief delay so it doesn't block immediate initial render
        const timer = setTimeout(() => {
          setVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage access blocked or restricted
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("hipro_cookie_consent", "accepted");
    } catch {}
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem("hipro_cookie_consent", "essential");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent Banner"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Information & Details */}
        <div className="flex items-start sm:items-center gap-3.5 text-xs text-slate-300 leading-relaxed">
          <div className="w-9 h-9 rounded-none bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-construction-red">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-white font-display uppercase tracking-wide text-xs">
              Cookie &amp; Privacy Notice
            </p>
            <p className="text-slate-400 font-light text-[11px] sm:text-xs">
              We use cookies to analyze web traffic, optimize site performance, and improve your engineering inquiry experience. Review our{" "}
              <Link
                href="/cookie-policy"
                className="text-construction-red hover:underline font-medium"
              >
                Cookie Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-construction-red hover:underline font-medium"
              >
                Privacy Policy
              </Link>{" "}
              for complete details.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={handleEssentialOnly}
            className="flex-1 md:flex-initial px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-all font-display"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 md:flex-initial px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-construction-red hover:bg-red-700 shadow-md shadow-red-600/30 transition-all font-display"
          >
            Accept All
          </button>
          <button
            onClick={handleEssentialOnly}
            aria-label="Close Cookie Notice"
            className="hidden md:inline-flex p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
