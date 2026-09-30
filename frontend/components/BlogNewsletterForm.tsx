"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function BlogNewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage("Thank you! You are now subscribed to industry updates.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fade-in">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold uppercase tracking-wider mb-0.5">Subscribed Successfully</p>
          <p className="text-emerald-700 font-light leading-relaxed">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {status === "error" && message && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        className="w-full px-4 py-3 bg-white border border-slate-300 text-sm focus:outline-none focus:border-construction-red disabled:opacity-50 transition-colors"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-construction-red hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs py-4 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Subscribing...</span>
          </>
        ) : (
          <span>Subscribe</span>
        )}
      </button>
    </form>
  );
}
