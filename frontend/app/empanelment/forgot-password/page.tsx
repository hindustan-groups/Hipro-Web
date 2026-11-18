"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process request.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/70 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mb-1">
            <KeyRound className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Forgot Password</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your registered vendor email. If an active account exists, we will send you a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Reset Instructions Sent</p>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  If <strong>{email}</strong> is associated with an active vendor account, you will receive password reset instructions shortly.
                </p>
              </div>
            </div>

            <Link
              href="/empanelment/login"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

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
                    placeholder="e.g. vendor@company.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] transition-all bg-slate-50/50 hover:bg-white text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
              Remember your password?{" "}
              <Link href="/empanelment/login" className="font-bold text-[#dc2626] hover:underline">
                Sign in here &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
