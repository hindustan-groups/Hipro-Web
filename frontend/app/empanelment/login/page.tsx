"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  FileText,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/empanelment/portal";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your registered email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials. Please check your email and password.");
      }

      // Store token in localStorage as well for universal client usage
      if (data.data?.token) {
        localStorage.setItem("vendor_token", data.data.token);
      }
      if (data.data?.account) {
        localStorage.setItem("vendor_account", JSON.stringify(data.data.account));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 600);
    } catch (err: any) {
      setError(err.message || "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-[#dc2626] mb-1">
          <ShieldCheck className="w-6 h-6 stroke-[2]" />
        </div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Vendor Portal Login</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Sign in to manage empanelment, tenders, gate passes, and document compliance.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-semibold">Login successful! Redirecting to portal...</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. procurement@vendor.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] transition-all bg-slate-50/50 hover:bg-white text-slate-900"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/empanelment/forgot-password"
              className="text-xs font-semibold text-[#dc2626] hover:text-[#b91c1c] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
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
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-3.5 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In to Vendor Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Helpful Activation & Onboarding links */}
      <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Received an invitation email?</span>
          <Link
            href="/empanelment/activate"
            className="font-bold text-[#dc2626] hover:underline flex items-center gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Activate Account</span>
          </Link>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Applied recently?</span>
          <Link
            href="/empanelment/track"
            className="font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Track Application</span>
          </Link>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500">
          Not empanelled yet?{" "}
          <Link href="/empanelment/apply" className="font-bold text-[#dc2626] hover:underline">
            Register as a Vendor &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/70 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            Loading portal login...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

