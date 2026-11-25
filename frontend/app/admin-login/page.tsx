"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldAlert, Eye, EyeOff, ShieldCheck, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { sanitizeReturnUrl } from "@/lib/authUrl";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 2FA Flow State
  const [step, setStep] = useState<"credentials" | "two_factor">("credentials");
  const [tempToken, setTempToken] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [backupUsedNotice, setBackupUsedNotice] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  // Pre-warm backend service in the background so authentication is instant
  useEffect(() => {
    fetch("/api/health").catch(() => null);
  }, []);

  // Auto-focus OTP input when switching to 2FA step
  useEffect(() => {
    if (step === "two_factor") {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
    }
  }, [step, isBackupMode]);

  // Step 1: Handle Initial Credentials Submit
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (json.success) {
        if (json.requires2FA) {
          // Move to Step 2: 2FA Verification
          setTempToken(json.tempToken);
          setStep("two_factor");
        } else {
          // Standard login without 2FA
          const rawReturnTo = searchParams.get("returnTo") || searchParams.get("redirect");
          const safeDestination = sanitizeReturnUrl(rawReturnTo);
          window.location.href = safeDestination;
        }
      } else {
        setError(json.error || "Login failed. Check your email and password.");
      }
    } catch {
      setError("Network connection error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Google Authenticator 2FA Submit
  const handle2FaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = totpCode.trim();
    if (!cleanCode) {
      setError("Please enter your verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempToken,
          code: cleanCode,
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (json.backupCodeUsed) {
          setBackupUsedNotice(true);
        }
        const rawReturnTo = searchParams.get("returnTo") || searchParams.get("redirect");
        const safeDestination = sanitizeReturnUrl(rawReturnTo);
        window.location.href = safeDestination;
      } else {
        setError(json.error || "Invalid 2FA code. Please try again.");
      }
    } catch {
      setError("Network error occurred during 2FA verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-none overflow-hidden">
        {/* Header */}
        <div className="bg-construction-navy p-8 text-center text-white relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-2 border-2 border-construction-red flex items-center justify-center shadow-md mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="Hindustan Projects HiPRO Logo"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <h1 className="text-2xl font-bold font-display uppercase tracking-tight">Hindustan Projects</h1>
          <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest font-semibold">
            {step === "two_factor" ? "Security Verification (2FA)" : "Corporate Admin Portal"}
          </p>
        </div>

        {/* Content Box */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {backupUsedNotice && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-amber-600" />
              <span>Emergency backup code accepted. Remember that this code cannot be reused.</span>
            </div>
          )}

          {step === "credentials" ? (
            /* ================= STEP 1: CREDENTIALS ================= */
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div>
                <label htmlFor="admin-email" className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-construction-red hover:bg-red-700 text-white px-4 py-3 rounded-none text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-70 mt-2 shadow-xs cursor-pointer"
              >
                {loading ? "Authenticating..." : "Continue to Admin"}
              </button>
            </form>
          ) : (
            /* ================= STEP 2: GOOGLE AUTHENTICATOR (2FA) ================= */
            <form onSubmit={handle2FaSubmit} className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-none flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900">Google Authenticator Required</p>
                  <p className="mt-0.5">
                    {isBackupMode
                      ? "Enter one of your unused 8-character emergency backup recovery codes."
                      : `Open Google Authenticator on your phone and enter the 6-digit security code for ${email}.`}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="2fa-code" className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">
                  {isBackupMode ? "Emergency Backup Code" : "6-Digit Authenticator Code"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    ref={otpInputRef}
                    id="2fa-code"
                    name="twoFactorCode"
                    type="text"
                    inputMode={isBackupMode ? "text" : "numeric"}
                    autoComplete="one-time-code"
                    required
                    maxLength={isBackupMode ? 10 : 6}
                    value={totpCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (isBackupMode) {
                        setTotpCode(val);
                      } else {
                        // Numeric only for standard 6-digit TOTP
                        setTotpCode(val.replace(/\D/g, "").slice(0, 6));
                      }
                    }}
                    placeholder={isBackupMode ? "XXXX-XXXX" : "123456"}
                    className={`w-full pl-10 bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-base font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all ${
                      !isBackupMode ? "text-center text-lg tracking-[0.35em]" : ""
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (isBackupMode ? totpCode.trim().length < 6 : totpCode.trim().length !== 6)}
                className="w-full flex items-center justify-center gap-2 bg-construction-navy hover:bg-slate-900 text-white px-4 py-3 rounded-none text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? "Verifying..." : "Verify & Enter Admin"}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsBackupMode((prev) => !prev);
                    setTotpCode("");
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                >
                  {isBackupMode ? "← Use Google Authenticator Code" : "Use Emergency Backup Code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setTotpCode("");
                    setError("");
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-slate-400">
            <p>Protected by RFC 6238 Standard TOTP 2FA</p>
            <p className="mt-1">© {new Date().getFullYear()} Hindustan Projects</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" />}>
      <LoginForm />
    </Suspense>
  );
}
