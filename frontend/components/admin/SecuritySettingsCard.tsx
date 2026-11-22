"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Loader2,
  Trash2,
} from "lucide-react";
import TwoFactorSetupModal from "./TwoFactorSetupModal";

export default function SecuritySettingsCard() {
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Disable 2FA modal / form state
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableTotpCode, setDisableTotpCode] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState("");

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [totpCodeForPassword, setTotpCodeForPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" });

  const fetch2FaStatus = async () => {
    try {
      const res = await fetch("/api/auth/2fa/status");
      const json = await res.json();
      if (json.success && json.data) {
        setIs2FaEnabled(json.data.isTwoFactorEnabled);
        setBackupCodesCount(json.data.backupCodesCount || 0);
      }
    } catch (e) {
      console.error("Failed to fetch 2FA status:", e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetch2FaStatus();
  }, []);

  const handleDisable2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabling(true);
    setDisableError("");

    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: disablePassword,
          code: disableTotpCode,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowDisableForm(false);
        setDisablePassword("");
        setDisableTotpCode("");
        fetch2FaStatus();
      } else {
        setDisableError(json.error || "Failed to disable 2FA");
      }
    } catch {
      setDisableError("Network error occurred");
    } finally {
      setDisabling(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ text: "", type: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match.", type: "error" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ text: "Password must be at least 8 characters long.", type: "error" });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          twoFactorCode: is2FaEnabled ? totpCodeForPassword : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPasswordMsg({ text: "Admin password updated successfully!", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTotpCodeForPassword("");
      } else {
        setPasswordMsg({ text: json.error || "Failed to change password", type: "error" });
      }
    } catch {
      setPasswordMsg({ text: "Network error occurred", type: "error" });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2FA Card */}
      <div className="bg-white border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                is2FaEnabled ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}
            >
              {is2FaEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
                  Google Authenticator (TOTP 2FA)
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    is2FaEnabled
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {loadingStatus ? "Checking..." : is2FaEnabled ? "Active & Enforced" : "Not Configured"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Protects the Master Admin cockpit with time-based 6-digit one-time codes generated on your mobile phone.
              </p>
            </div>
          </div>

          <div>
            {is2FaEnabled ? (
              <button
                type="button"
                onClick={() => setShowDisableForm((prev) => !prev)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 px-3.5 py-2 transition-colors cursor-pointer"
              >
                {showDisableForm ? "Cancel" : "Disable 2FA"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSetupModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 transition-colors shadow-xs cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Configure 2FA</span>
              </button>
            )}
          </div>
        </div>

        {/* 2FA Active Details */}
        {is2FaEnabled && !showDisableForm && (
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Standard RFC 6238 TOTP verified. Login and password updates require phone approval.</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 border border-slate-200">
              Emergency Backup Codes Available: <strong>{backupCodesCount}</strong>
            </div>
          </div>
        )}

        {/* Disable Form */}
        {showDisableForm && (
          <form onSubmit={handleDisable2Fa} className="mt-5 p-4 bg-rose-50/50 border border-rose-200 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm 2FA Deactivation (Requires Credentials)</span>
            </div>

            {disableError && (
              <div className="p-3 bg-white border border-rose-200 text-rose-600 text-xs font-medium">
                {disableError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs px-3 py-2 focus:outline-none focus:border-rose-500"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={disableTotpCode}
                  onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs px-3 py-2 font-mono font-bold tracking-widest text-center focus:outline-none focus:border-rose-500"
                  placeholder="123456"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDisableForm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={disabling}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50"
              >
                {disabling ? "Verifying..." : "Confirm & Disable"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
              Change Admin Password
            </h3>
            <p className="text-xs text-slate-500">
              {is2FaEnabled
                ? "Protected by Two-Factor Authentication. Requires current password + phone OTP."
                : "Update your login credentials. We strongly recommend enabling 2FA above."}
            </p>
          </div>
        </div>

        {passwordMsg.text && (
          <div
            className={`mt-4 p-3.5 text-xs font-semibold flex items-center gap-2.5 ${
              passwordMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 pr-8 focus:outline-none focus:border-construction-navy"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {is2FaEnabled && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Google Authenticator Code (2FA)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={totpCodeForPassword}
                    onChange={(e) => setTotpCodeForPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-emerald-50/40 border border-emerald-300 text-slate-900 text-xs px-3 py-2 font-mono font-bold tracking-widest text-center focus:outline-none focus:border-emerald-600"
                    placeholder="123456"
                  />
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-600">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                New Password (Min. 8 characters)
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 focus:outline-none focus:border-construction-navy"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 py-2 focus:outline-none focus:border-construction-navy"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 bg-construction-navy hover:bg-slate-900 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {changingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Setup 2FA Modal */}
      <TwoFactorSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSuccess={() => {
          fetch2FaStatus();
        }}
      />
    </div>
  );
}
