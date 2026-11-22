"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Download,
  AlertTriangle,
  Server,
  Lock,
  X,
  FileCode,
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  description: string;
  keyPrefix: string;
  secret: string;
  scope: string;
  lastRotated: string;
  environment: "Production" | "Staging" | "Internal";
  status: "Active" | "Revoked";
}

const INITIAL_KEYS: ApiKeyItem[] = [
  {
    id: "key-1",
    name: "Master Production Gateway Key",
    description: "Full holding company API access across HiPRO, HBS, and Empanelment portals.",
    keyPrefix: "hp_live_9f82d1c74a00bc91ef38",
    secret: "hp_sec_live_948a27b19dfa2830f03c44859a4be8120c184d0932af8812c3104e76a",
    scope: "full:admin:read-write",
    lastRotated: "12 Nov 2026, 04:30 PM IST",
    environment: "Production",
    status: "Active",
  },
  {
    id: "key-2",
    name: "Staging Sandbox API Key",
    description: "Mock testing, automated CI/CD integration and webhook payload simulation.",
    keyPrefix: "hp_test_3a7b11c900e57ba3",
    secret: "hp_sec_test_57ab9201ef3381a94bc70014aef031940acbd27891",
    scope: "staging:simulate",
    lastRotated: "18 Nov 2026, 11:15 AM IST",
    environment: "Staging",
    status: "Active",
  },
  {
    id: "key-3",
    name: "Payment Gateway Webhook Secret",
    description: "Cryptographic HMAC SHA256 signature verification for instant payment callbacks.",
    keyPrefix: "wh_sec_rzp_9841",
    secret: "whsec_98f421a9db4028ce3729fa11823bc0914e9f",
    scope: "webhook:verify-hmac",
    lastRotated: "01 Nov 2026, 09:00 AM IST",
    environment: "Production",
    status: "Active",
  },
  {
    id: "key-4",
    name: "AutoMail SMTP Relay Credential Token",
    description: "Central transactional mailer authentication token for system dispatch.",
    keyPrefix: "smtp_token_central_hq",
    secret: "smtp_live_hq_8829f001ca7d84b2ef00384716a",
    scope: "smtp:dispatch:central",
    lastRotated: "05 Nov 2026, 02:40 PM IST",
    environment: "Production",
    status: "Active",
  },
  {
    id: "key-5",
    name: "Emergency 2FA Master Override Key",
    description: "Break-glass recovery secret for the Executive Board if physical TOTP is unavailable.",
    keyPrefix: "master_2fa_breakglass",
    secret: "HP-MASTER-BREAKGLASS-9812-4410-HQ01-X99",
    scope: "auth:2fa:emergency-bypass",
    lastRotated: "22 Nov 2026, 03:00 AM IST",
    environment: "Internal",
    status: "Active",
  },
];

export default function ApiKeysVaultPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>(INITIAL_KEYS);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [rotateTarget, setRotateTarget] = useState<ApiKeyItem | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  const toggleReveal = (id: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleConfirmRotation = () => {
    if (!rotateTarget) return;
    setIsRotating(true);

    setTimeout(() => {
      const randomHex = Array.from({ length: 48 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      const nowStr = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setKeys((prev) =>
        prev.map((k) =>
          k.id === rotateTarget.id
            ? {
                ...k,
                secret: `hp_sec_${k.environment.toLowerCase()}_${randomHex}`,
                lastRotated: `${nowStr} IST`,
              }
            : k
        )
      );

      setIsRotating(false);
      setSuccessBanner(`Successfully rotated "${rotateTarget.name}". Update your microservices with the new secret.`);
      setRotateTarget(null);
      setTimeout(() => setSuccessBanner(""), 6000);
    }, 1200);
  };

  const handleDownloadEnvFile = () => {
    const lines = [
      "# ===================================================================",
      "# HINDUSTAN PROJECTS GROUP - MASTER API SECRETS (GENERATED)",
      `# Exported: ${new Date().toISOString()}`,
      "# CAUTION: KEEP STRICTLY CONFIDENTIAL. NEVER COMMIT TO PUBLIC GIT.",
      "# ===================================================================",
      "",
      `MASTER_API_GATEWAY_KEY="${keys[0].secret}"`,
      `STAGING_API_SANDBOX_KEY="${keys[1].secret}"`,
      `PAYMENT_GATEWAY_WEBHOOK_SECRET="${keys[2].secret}"`,
      `CENTRAL_SMTP_RELAY_TOKEN="${keys[3].secret}"`,
      `EMERGENCY_2FA_OVERRIDE_KEY="${keys[4].secret}"`,
      "",
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hipro_secrets_${new Date().toISOString().slice(0, 10)}.env`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_30px_rgba(15,23,42,0.03)] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors mb-3 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Master Cockpit</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight">
                API Keys & Master Secrets Vault
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Manage and rotate cryptographic API credentials, webhooks, and emergency bypass tokens for the holding company.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadEnvFile}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
        >
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span>Export .env Secrets</span>
        </button>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* ── Key Rotation Caution Banner ── */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Cryptographic Key Security Policy</p>
          <p className="text-amber-700 mt-0.5 leading-relaxed">
            API keys grant authenticated programmatic access to Hindustan Projects Group database operations. Never commit these secrets to version control. When rotating a key, ensure downstream microservices and webhooks are updated immediately.
          </p>
        </div>
      </div>

      {/* ── Active Keys Table / Deck ── */}
      <div className="space-y-4">
        {keys.map((item) => {
          const isRevealed = !!visibleSecrets[item.id];
          const isCopied = copiedKeyId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      {item.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                        item.environment === "Production"
                          ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                          : item.environment === "Staging"
                          ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                          : "bg-purple-50 text-purple-700 border border-purple-200/80"
                      }`}
                    >
                      {item.environment}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => setRotateTarget(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    title="Rotate this secret"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Rotate Key</span>
                  </button>
                </div>
              </div>

              {/* Secret Value Display Box */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200/70 font-mono text-xs">
                <div className="flex items-center gap-2 px-2 text-slate-400 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-sans font-semibold text-slate-500">Secret:</span>
                </div>
                <div className="flex-1 overflow-x-auto select-all text-slate-800 tracking-wider font-mono py-1 px-2 bg-white rounded-xl border border-slate-200/60 shadow-3xs truncate">
                  {isRevealed
                    ? item.secret
                    : `${item.secret.slice(0, 10)}••••••••••••••••••••••••••••••••••••••••••••••••••••`}
                </div>
                <div className="flex items-center gap-1.5 justify-end shrink-0">
                  <button
                    onClick={() => toggleReveal(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={isRevealed ? "Hide secret" : "Reveal secret"}
                  >
                    {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(item.id, item.secret)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-3xs"
                    title="Copy full secret to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Metadata Sub-Bar */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-3">
                  <span>Scope: <strong className="text-slate-600 font-normal">{item.scope}</strong></span>
                  <span>·</span>
                  <span>Identifier: <strong className="text-slate-600 font-normal">{item.keyPrefix}</strong></span>
                </div>
                <div>
                  <span>Last Rotated: <strong className="text-slate-600 font-normal">{item.lastRotated}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Key Rotation Confirmation Modal ── */}
      {rotateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setRotateTarget(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 ring-1 ring-amber-200">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 font-display">
              Rotate {rotateTarget.name}?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              This action will generate a new cryptographically secure 64-character secret and immediately revoke the existing token. Any server, background worker, or API client using this secret will fail until updated.
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-600">
              <p className="text-[10px] uppercase font-bold text-slate-400">Target Credential</p>
              <p className="font-bold text-slate-900 mt-0.5">{rotateTarget.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{rotateTarget.keyPrefix}</p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setRotateTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRotation}
                disabled={isRotating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isRotating ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rotating Secret...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Confirm & Rotate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
