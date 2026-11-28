"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  CheckCircle2,
  Languages,
} from "lucide-react";
import {
  isMsg91WidgetConfigured,
  sendWidgetOtp,
  verifyWidgetOtp,
} from "@/lib/msg91Widget";

const PHONE_REGEX = /^[6-9]\d{9}$/;

const LOGIN_COPY = {
  en: {
    title: "Vendor Portal Login",
    subtitle: "Enter your registered mobile number to log in with a quick 6-digit OTP.",
    mobileLabel: "Registered Mobile Number",
    change: "Change",
    enterOtp: "Enter 6-Digit OTP",
    resendIn: "Resend OTP in",
    resend: "Resend OTP",
    sending: "Sending OTP...",
    sendOtp: "Send Login OTP",
    verifying: "Verifying...",
    verifyLogin: "Verify & Login",
    verifiedToast: "OTP Verified! Opening your Vendor Dashboard...",
    newVendor: "New contractor or supplier?",
    registerBtn: "Register as Vendor",
  },
  hi: {
    title: "वेंडर पोर्टल लॉगिन",
    subtitle: "लॉगिन करने के लिए अपना रजिस्टर्ड मोबाइल नंबर दर्ज करें और 6-अंकों का OTP डालें।",
    mobileLabel: "रजिस्टर्ड मोबाइल नंबर",
    change: "बदलें",
    enterOtp: "6-अंकों का OTP दर्ज करें",
    resendIn: "OTP दोबारा भेजें",
    resend: "OTP दोबारा भेजें",
    sending: "OTP भेजा जा रहा है...",
    sendOtp: "लॉगिन OTP भेजें",
    verifying: "जाँच हो रही है...",
    verifyLogin: "सत्यापित करें और लॉगिन करें",
    verifiedToast: "OTP सत्यापित! आपका डैशबोर्ड खुल रहा है...",
    newVendor: "नए ठेकेदार या सप्लायर हैं?",
    registerBtn: "नया रजिस्ट्रेशन करें",
  },
} as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/empanelment/portal";

  const [lang, setLang] = useState<"en" | "hi">("en");
  const [phone, setPhone] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const t = LOGIN_COPY[lang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hipro_vendor_lang");
      if (saved === "hi" || saved === "en") setLang(saved);
    } catch (_e) {}
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const toggleLanguage = (nextLang: "en" | "hi") => {
    setLang(nextLang);
    try {
      localStorage.setItem("hipro_vendor_lang", nextLang);
    } catch (_e) {}
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    const cleanPhone = phone.replace(/\D/g, "");
    if (!PHONE_REGEX.test(cleanPhone)) {
      setError(
        lang === "hi"
          ? "कृपया अपना 10-अंकों का सही मोबाइल नंबर दर्ज करें।"
          : "Please enter your valid 10-digit registered mobile number."
      );
      return;
    }

    setSendingOtp(true);
    try {
      if (isMsg91WidgetConfigured()) {
        await sendWidgetOtp(cleanPhone);
        setPhone(cleanPhone);
        setOtpSent(true);
        setResendCooldown(30);
        setDemoOtpHint("");
      } else {
        const res = await fetch("/api/vendor/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to send OTP.");
        }
        setPhone(cleanPhone);
        setOtpSent(true);
        setResendCooldown(json.cooldownSeconds || 30);
        setDemoOtpHint(json.demoOtp || "");
      }
    } catch (err: any) {
      setError(err.message || "Could not send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otpInput.trim())) {
      setError(lang === "hi" ? "कृपया 6-अंकों का OTP दर्ज करें।" : "Please enter the 6-digit OTP.");
      return;
    }

    setVerifying(true);
    try {
      let data: any;
      if (isMsg91WidgetConfigured()) {
        const accessToken = await verifyWidgetOtp(otpInput.trim());
        const res = await fetch("/api/vendor/auth/otp/verify-widget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phone, accessToken }),
        });
        data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "MSG91 login failed.");
        }
      } else {
        const res = await fetch("/api/vendor/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phone, otp: otpInput.trim() }),
        });
        data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Invalid OTP. Please try again.");
        }
      }

      if (data.data?.token) {
        localStorage.setItem("vendor_token", data.data.token);
        localStorage.setItem("hipro_vendor_token", data.data.token);
      }
      if (data.data?.account) {
        localStorage.setItem("vendor_account", JSON.stringify(data.data.account));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 400);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-5 sm:p-8">
      {/* Top Language Toggle */}
      <div className="flex justify-end mb-2">
        <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => toggleLanguage("en")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              lang === "en" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <Languages className="w-3 h-3" />
            <span>English</span>
          </button>
          <button
            type="button"
            onClick={() => toggleLanguage("hi")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              lang === "hi" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <span>हिन्दी</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-[#dc2626] mb-1">
          <ShieldCheck className="w-6 h-6 stroke-[2]" />
        </div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">{t.title}</h1>
        <p className="text-xs sm:text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#dc2626]" />
          <span className="font-medium leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-700 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{t.verifiedToast}</span>
        </div>
      )}

      <form onSubmit={otpSent ? handleVerifyLogin : handleSendOtp} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">{t.mobileLabel}</label>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 focus-within:bg-white focus-within:border-[#dc2626] transition-all overflow-hidden">
            <span className="px-3 py-3 text-xs font-bold text-slate-500 border-r border-slate-200 bg-slate-100/70">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              disabled={otpSent}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="e.g. 9829012345"
              className="w-full px-3.5 py-3 bg-transparent text-sm font-semibold text-slate-900 focus:outline-none disabled:opacity-60"
            />
            {otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpInput("");
                  setDemoOtpHint("");
                  setError("");
                }}
                className="px-3 text-[11px] font-bold text-[#dc2626] shrink-0"
              >
                {t.change}
              </button>
            )}
          </div>
        </div>

        {otpSent && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold text-slate-800">{t.enterOtp}</label>
              {demoOtpHint && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-mono font-bold">
                  Test OTP: {demoOtpHint}
                </span>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit OTP"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-center font-mono text-base font-black tracking-[0.35em] text-slate-900 focus:outline-none focus:border-slate-900"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={sendingOtp || resendCooldown > 0}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                {resendCooldown > 0 ? `${t.resendIn} ${resendCooldown}s` : t.resend}
              </button>
            </div>
          </div>
        )}

        {!otpSent ? (
          <button
            type="submit"
            disabled={sendingOtp}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <Phone className="w-4 h-4" />
            <span>{sendingOtp ? t.sending : t.sendOtp}</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={verifying || success || otpInput.length !== 6}
            className="w-full py-3.5 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <span>{verifying ? t.verifying : t.verifyLogin}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2.5">
        <p className="text-xs text-slate-500">{t.newVendor}</p>
        <Link
          href="/empanelment/apply"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#dc2626]" />
          <span>{t.registerBtn}</span>
        </Link>
      </div>
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50/70 flex flex-col items-center justify-center px-4 py-10">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-80 bg-white rounded-3xl border border-slate-200 animate-pulse" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
