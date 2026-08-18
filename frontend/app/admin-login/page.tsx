"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
        window.location.href = "/admin"; // Force full reload to update layouts
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
          <div className="w-12 h-12 mx-auto rounded-none bg-white border-2 border-construction-red flex items-center justify-center shadow-sm mb-4">
            <span className="text-construction-red font-black text-xl tracking-tighter">Hi</span>
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
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  placeholder="••••••••"
                />
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
