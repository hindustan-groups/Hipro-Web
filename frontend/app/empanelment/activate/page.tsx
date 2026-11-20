"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Mail,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface VerifiedVendorData {
  email: string;
  companyName: string;
  contactName: string;
}

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [showManualToken, setShowManualToken] = useState(!tokenFromUrl);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [vendorData, setVendorData] = useState<VerifiedVendorData | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-verify token on mount or when token changes
  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const verifyToken = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) return;
    setVerifyingToken(true);
    setError("");

    try {
      const res = await fetch(
        `/api/vendor/auth/verify-token?token=${encodeURIComponent(tokenToVerify.trim())}`,
        { cache: "no-store" }
      );
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setVendorData(json.data);
      } else {
        setError(
          json.error ||
            "This setup link is invalid or has expired. Please contact HiPRO procurement or request a new invite."
        );
      }
    } catch (_e) {
      // In case verify endpoint is pending, proceed with token submission
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanToken = token.trim();
    if (!cleanToken) {
      setError("Activation token is required. Please check your invitation email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/vendor/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: cleanToken, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Failed to set password. The activation link may have expired."
        );
      }

      // Automatically store token for immediate portal entry
      if (data.data?.token) {
        localStorage.setItem("vendor_token", data.data.token);
      }
      if (data.data?.account) {
        localStorage.setItem("vendor_account", JSON.stringify(data.data.account));
      }

      setSuccess(true);

      // Instant seamless auto-login into portal
      setTimeout(() => {
        router.push("/empanelment/portal");
      }, 700);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-1">
          <KeyRound className="w-6 h-6 stroke-[2]" />
        </div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Create Portal Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Set your secure password to complete activation and enter the vendor portal.
        </p>
      </div>

      {/* Verified Partner Badge (if verified via token) */}
      {verifyingToken ? (
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#dc2626]" />
          <span>Verifying empanelment credentials...</span>
        </div>
      ) : vendorData ? (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-slate-900 text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Empanelment Approved & Verified</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{vendorData.companyName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{vendorData.email}</span>
          </div>
        </div>
      ) : null}

      {/* Success State */}
      {success ? (
        <div className="space-y-5 animate-in fade-in text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-slate-900">Password Set Successfully!</h2>
            <p className="text-xs text-slate-600">
              Your account is active. Redirecting you directly to the Vendor Portal...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#dc2626]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Entering Vendor Dashboard...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Password Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Optional Manual Token accordion if no token was in query params */}
            {(!tokenFromUrl || showManualToken) && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Invitation Token
                  </label>
                  {tokenFromUrl && (
                    <button
                      type="button"
                      onClick={() => setShowManualToken(!showManualToken)}
                      className="text-[11px] text-slate-500 hover:text-slate-800"
                    >
                      Hide token
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (e.target.value.length > 20) {
                      verifyToken(e.target.value);
                    }
                  }}
                  placeholder="Paste token from invitation email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] transition-all bg-slate-50/50 hover:bg-white text-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Create New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] transition-all bg-slate-50/50 hover:bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Must be at least 8 characters long</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] transition-all bg-slate-50/50 hover:bg-white text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || verifyingToken}
              className="w-full py-3.5 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <span>Setting password & logging in...</span>
              ) : (
                <>
                  <span>Save Password & Enter Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Already have an account?</span>
            <Link href="/empanelment/login" className="font-bold text-[#dc2626] hover:underline">
              Sign in to Portal &rarr;
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/70 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            Loading password setup...
          </div>
        }
      >
        <SetPasswordForm />
      </Suspense>
    </div>
  );
}
