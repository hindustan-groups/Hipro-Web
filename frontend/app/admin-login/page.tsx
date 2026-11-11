"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { sanitizeReturnUrl } from "@/lib/authUrl";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  // Pre-warm backend service in the background so authentication is instant
  useEffect(() => {
    fetch("/api/health").catch(() => null);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
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
        const rawReturnTo = searchParams.get("returnTo") || searchParams.get("redirect");
        const safeDestination = sanitizeReturnUrl(rawReturnTo);
        window.location.href = safeDestination; // Force full reload to update layouts
      } else {
        setError(json.error || "Login failed");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-none overflow-hidden">
        
        {/* Header */}
        <div className="bg-construction-navy p-8 text-center text-white">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-2 border-2 border-construction-red flex items-center justify-center shadow-md mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="Hindustan Projects HiPRO Logo"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <h1 className="text-2xl font-bold font-display uppercase tracking-tight">Hindustan Projects</h1>
          <p className="text-blue-200 text-sm mt-1 uppercase tracking-wider font-semibold">Admin Portal</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Email Address</label>
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
              <label htmlFor="admin-password" className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Password</label>
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-construction-red hover:bg-red-700 text-white px-4 py-3 rounded-none text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-70 mt-2"
            >
              {loading ? "Authenticating..." : "Secure Login"}
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-slate-400">
            <p>Protected by 256-bit AES Encryption</p>
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
