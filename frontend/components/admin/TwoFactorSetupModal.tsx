"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Download,
  KeyRound,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TwoFactorSetupModal({
  isOpen,
  onClose,
  onSuccess,
}: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<"loading" | "scan" | "backup_codes">("loading");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  // Initialize Setup on modal open
  useEffect(() => {
    if (!isOpen) {
      setStep("loading");
      setConfirmCode("");
      setError("");
      setBackupCodes([]);
      return;
    }

    const initSetup = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/auth/2fa/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        if (json.success && json.data) {
          setQrCodeDataUrl(json.data.qrCodeDataUrl);
          setSecret(json.data.secret);
          setStep("scan");
        } else {
          setError(json.error || "Failed to initiate 2FA setup");
        }
      } catch {
        setError("Network error while connecting to security service");
      } finally {
        setLoading(false);
      }
    };

    initSetup();
  }, [isOpen]);

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    if (!backupCodes.length) return;
    const text = `HINDUSTAN PROJECTS (HiPRO) - 2FA RECOVERY CODES\nGenerated: ${new Date().toLocaleString()}\n\n` + backupCodes.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    if (!backupCodes.length) return;
    const text = `HINDUSTAN PROJECTS (HiPRO) - 2FA EMERGENCY BACKUP RECOVERY CODES\nGenerated: ${new Date().toLocaleString()}\nKeep these codes stored securely. Each code can be used once to access the admin portal if you lose access to your authenticator app.\n\n` + backupCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hipro-2fa-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = confirmCode.trim();
    if (cleanCode.length !== 6) {
      setError("Please enter the 6-digit code shown in your app.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode }),
      });

      const json = await res.json();
      if (json.success && json.data?.backupCodes) {
        setBackupCodes(json.data.backupCodes);
        setStep("backup_codes");
        onSuccess();
      } else {
        setError(json.error || "Verification failed. Check the code in your Google Authenticator app.");
      }
    } catch {
      setError("Network error during verification.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden rounded-none">
        {/* Header */}
        <div className="bg-construction-navy text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">Setup Google Authenticator (2FA)</h2>
              <p className="text-[11px] text-blue-200">HiPRO Corporate Security Hardening</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === "loading" && (
            <div className="py-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-construction-navy mb-3" />
              <p className="text-xs font-medium">Generating secure TOTP encryption key...</p>
            </div>
          )}

          {step === "scan" && (
            <div className="space-y-5">
              <div className="text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-900">Step 1: Scan QR Code with Authenticator App</p>
                <p>
                  Open <strong>Google Authenticator</strong> (or Microsoft Authenticator) on your mobile phone and scan the QR code below:
                </p>
              </div>

              {/* QR Code Card */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 border border-slate-200">
                <div className="w-44 h-44 shrink-0 bg-white p-2 border border-slate-300 shadow-xs flex items-center justify-center">
                  {qrCodeDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrCodeDataUrl} alt="Google Authenticator QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-12 h-12 text-slate-400" />
                  )}
                </div>

                <div className="text-xs space-y-2 flex-1">
                  <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Manual Entry Key</p>
                  <p className="font-mono text-[11px] font-bold text-slate-800 bg-white p-2 border border-slate-200 break-all select-all">
                    {secret}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                  >
                    {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSecret ? "Copied Key!" : "Copy Key"}</span>
                  </button>
                </div>
              </div>

              {/* Step 2 Form */}
              <form onSubmit={handleConfirmCode} className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label htmlFor="confirm-2fa-code" className="text-slate-700 text-xs font-bold block mb-1">
                    Step 2: Enter 6-digit code from Authenticator to confirm:
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      id="confirm-2fa-code"
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={6}
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-none px-4 py-2.5 text-center font-mono text-lg font-bold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || confirmCode.trim().length !== 6}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    {loading ? "Activating..." : "Verify & Enable 2FA"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === "backup_codes" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Google Authenticator is now successfully active on your account!</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Save Your Emergency Backup Recovery Codes</span>
                </div>
                <p>
                  If you ever lose access to your phone or authenticator app, these one-time recovery codes are the <strong>only way</strong> to regain access to your account.
                </p>
              </div>

              {/* Codes Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-800 text-center select-all">
                {backupCodes.map((c, i) => (
                  <div key={i} className="p-2 bg-white border border-slate-200 shadow-2xs">
                    {c}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                >
                  {copiedBackupCodes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBackupCodes ? "Codes Copied!" : "Copy All Codes"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download (.txt)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto px-5 py-2 text-xs font-bold uppercase tracking-wider bg-construction-navy hover:bg-slate-900 text-white transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
