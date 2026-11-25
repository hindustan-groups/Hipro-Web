"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Save,
  Loader2,
  Globe,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function AdminGatewayKeyCard() {
  const [gatewayKey, setGatewayKey] = useState("hp-admin-gateway-key-2026");
  const [originalKey, setOriginalKey] = useState("hp-admin-gateway-key-2026");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [origin, setOrigin] = useState("https://www.hindustanprojects.in");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    fetchGatewayKey();
  }, []);

  const fetchGatewayKey = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/gateway-key");
      const json = await res.json();
      if (json.success && json.key) {
        setGatewayKey(json.key);
        setOriginalKey(json.key);
      }
    } catch (err) {
      console.error("Failed to load gateway key:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleGenerateRandom = () => {
    const r1 = Math.random().toString(36).substring(2, 6);
    const r2 = Math.random().toString(36).substring(2, 6);
    const newKey = `hp-gw-${r1}-${r2}-2026`;
    setGatewayKey(newKey);
    setShowKey(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayKey.trim() || gatewayKey.trim().length < 4) {
      setMessage({ text: "Gateway key must be at least 4 characters long", type: "error" });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch("/api/settings/gateway-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: gatewayKey.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setOriginalKey(json.key || gatewayKey.trim());
        setMessage({ text: "Admin Stealth Gateway Key updated successfully!", type: "success" });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ text: json.error || "Failed to update gateway key", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Network error while saving key", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const queryUrl = `${origin}/admin-login?key=${encodeURIComponent(gatewayKey)}`;
  const pathUrl = `${origin}/admin-login/${encodeURIComponent(gatewayKey)}`;
  const isDirty = gatewayKey !== originalKey;

  return (
    <div className="space-y-6">
      {/* ── Top Header & Active Status ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 ring-1 ring-indigo-500/20">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Admin Stealth Gateway & Secret URL Key</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              URL Obscurity & Gatekeeper Protection · Anyone without this secret key gets bounced to Homepage (/)
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-semibold border border-emerald-500/20 shadow-2xs shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Stealth Protection: ACTIVE</span>
        </div>
      </div>

      {/* ── Notification Banner ─────────────────────────────── */}
      {message && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 transition-all ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── Key Configuration Section ─────────────────────────── */}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Master Gateway Secret Key</span>
            {isDirty && (
              <span className="text-[11px] text-amber-600 font-semibold animate-pulse">
                • Unsaved changes
              </span>
            )}
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={gatewayKey}
                onChange={(e) => setGatewayKey(e.target.value)}
                placeholder="Enter admin gateway secret key..."
                disabled={loading || saving}
                className="w-full px-4 py-2.5 pr-24 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-indigo-500 text-slate-900 bg-slate-50/50 shadow-2xs"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title={showKey ? "Hide Secret" : "Show Secret"}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(gatewayKey, "key")}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                  title="Copy Key Only"
                >
                  {copiedField === "key" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateRandom}
              disabled={loading || saving}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Generate Random</span>
            </button>

            <button
              type="submit"
              disabled={loading || saving || !isDirty}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Key</span>
            </button>
          </div>
        </div>
      </form>

      {/* ── Ready-to-Use 1-Click Secret URLs ───────────────────── */}
      <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ready-to-Use Master Admin Login URLs</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500">
            Click copy and bookmark on your device
          </span>
        </div>

        {/* Option A: Query Parameter Format */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>Method 1: Query Parameter (Standard Bookmark)</span>
            {copiedField === "query" && (
              <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied Query Link!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 truncate shadow-2xs select-all">
              {queryUrl}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(queryUrl, "query")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy</span>
            </button>
            <a
              href={queryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-700 shadow-2xs transition-all shrink-0"
              title="Test Open Login"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test</span>
            </a>
          </div>
        </div>

        {/* Option B: Path Slug Format */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>Method 2: Direct Path Slug Format</span>
            {copiedField === "path" && (
              <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied Path Link!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 truncate shadow-2xs select-all">
              {pathUrl}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(pathUrl, "path")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy</span>
            </button>
            <a
              href={pathUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-700 shadow-2xs transition-all shrink-0"
              title="Test Open Login"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Operational Architecture Guide ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Unauthorized Visitors</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Anyone accessing <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">/admin</code> or <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">/admin-login</code> directly is redirected to <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">/</code> without seeing the login form.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>7-Day Trusted Cookie</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Visiting with the secret key unlocks an HTTP-only <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">admin_portal_access</code> cookie for 7 days on your trusted browser.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Instant Revocation</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Updating the key here immediately invalidates all previous keys and locks out unapproved devices across the world.
          </p>
        </div>
      </div>
    </div>
  );
}
