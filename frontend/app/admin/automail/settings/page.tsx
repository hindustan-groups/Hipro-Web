"use client";

import { useState, useEffect } from "react";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import {
  Settings,
  ShieldCheck,
  Server,
  Mail,
  Key,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Building2,
  Hammer,
  HelpCircle,
  Zap,
} from "lucide-react";

export default function AutoMailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState("info@hindustanprojects.in");
  const [smtpPass, setSmtpPass] = useState("");
  const [senderNameHipro, setSenderNameHipro] = useState("Hindustan Projects");
  const [senderEmailHipro, setSenderEmailHipro] = useState("info@hindustanprojects.in");
  const [senderNameHbs, setSenderNameHbs] = useState("Hind Building Solutions");
  const [senderEmailHbs, setSenderEmailHbs] = useState("hbs@hindustanprojects.in");
  const [dailyLimit, setDailyLimit] = useState(200);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(5);
  const [replyTo, setReplyTo] = useState("info@hindustanprojects.in");
  const [smtpPassConfigured, setSmtpPassConfigured] = useState(false);

  // Test states
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testRecipient, setTestRecipient] = useState("");
  const [testBrand, setTestBrand] = useState("hipro");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch current settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/automail/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setSmtpHost(s.smtpHost || "smtp.hostinger.com");
        setSmtpPort(s.smtpPort || 465);
        setSmtpUser(s.smtpUser || "info@hindustanprojects.in");
        setSmtpPass(""); // Clear local input so user can leave blank to retain DB password
        setSenderNameHipro(s.senderNameHipro || "Hindustan Projects");
        setSenderEmailHipro(s.senderEmailHipro || "info@hindustanprojects.in");
        setSenderNameHbs(s.senderNameHbs || "Hind Building Solutions");
        setSenderEmailHbs(s.senderEmailHbs || "hbs@hindustanprojects.in");
        setDailyLimit(s.dailyLimit || 200);
        setRateLimitPerMinute(s.rateLimitPerMinute || 15);
        setReplyTo(s.replyTo || "info@hindustanprojects.in");
        setSmtpPassConfigured(Boolean(s.smtpPassConfigured));
      }
    } catch {
      setToast({ message: "Failed to load current settings from server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings permanently to PostgreSQL database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTestResult(null);

    const effectivePass = smtpPass.trim() || (smtpPassConfigured ? "••••••••••••" : "");

    try {
      const res = await fetch("/api/automail/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpUser,
          smtpPass: effectivePass,
          senderNameHipro,
          senderEmailHipro,
          senderNameHbs,
          senderEmailHbs,
          dailyLimit: Number(dailyLimit),
          rateLimitPerMinute: Number(rateLimitPerMinute),
          replyTo,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: "Settings saved permanently to PostgreSQL! Will never reset.", type: "success" });
        setSmtpPassConfigured(Boolean(data.settings?.smtpPassConfigured));
        setSmtpPass("");
      } else {
        setToast({ message: data.error || "Failed to save settings", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Test SMTP Handshake
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const effectivePass = smtpPass.trim() || (smtpPassConfigured ? "••••••••••••" : "");

    try {
      const res = await fetch("/api/automail/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpUser,
          smtpPass: effectivePass,
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({
        success: false,
        message: "Network error trying to verify SMTP server handshake.",
      });
    } finally {
      setTesting(false);
    }
  };

  // Send Single Test Email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) {
      setToast({ message: "Please enter a recipient email address for test email", type: "error" });
      return;
    }

    setSendingTest(true);
    const effectivePass = smtpPass.trim() || (smtpPassConfigured ? "••••••••••••" : "");

    try {
      const res = await fetch("/api/automail/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testRecipient,
          subject: "Hostinger SMTP Verification Test",
          htmlBody: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">🎉 Hostinger AutoMail Connection Verified!</h2>
            <p style="color: #334155; font-size: 14px;">This email confirms that your Hostinger SMTP credentials (<strong>${smtpUser}</strong> on Port <strong>${smtpPort}</strong>) are 100% active, persistent, and delivering properly.</p>
            <p style="font-size: 12px; color: #64748b;">Timestamp: ${new Date().toLocaleString()}</p>
          </div>`,
          brand: testBrand,
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpUser,
          smtpPass: effectivePass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: `Success! Test email delivered to ${testRecipient}`, type: "success" });
      } else {
        setToast({ message: data.error || "Failed to send test email", type: "error" });
      }
    } catch {
      setToast({ message: "Network error sending test email", type: "error" });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      <AutoMailNav />

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Hostinger SMTP & Email Settings</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure Hostinger mailbox credentials, sender addresses for HiPRO and Hind Build, and safe pacing limits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                smtpPassConfigured
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {smtpPassConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hostinger Password Configured</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Password Missing (Enter Below)</span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Test SMTP Connection</span>
            </button>
          </div>
        </div>

        {/* Test Result Feedback Box */}
        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-start gap-3 border ${
              testResult.success
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-red-50 text-red-900 border-red-200"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-extrabold">{testResult.success ? "Connection Verified!" : "Connection Failed"}</p>
              <p className="font-normal text-[11px] mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold">Loading Hostinger configurations...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: SMTP Credentials & Brand Senders */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Hostinger Mail Server Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Server className="w-4 h-4 text-blue-600" />
                <span>1. Hostinger Mail Server Configuration</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.hostinger.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: smtp.hostinger.com</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    SMTP Port
                  </label>
                  <select
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={465}>465 (SSL / TLS - Hostinger Default)</option>
                    <option value={587}>587 (STARTTLS)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Recommended for Hostinger: 465</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hostinger Email (Username)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="info@hindustanprojects.in"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Apna Hostinger webmail address daalo</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Hostinger Mailbox Password
                    </label>
                    {smtpPassConfigured && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        ✓ Saved in Database
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder={smtpPassConfigured ? "•••••••••••• (Saved in DB — Leave blank to keep)" : "Enter Hostinger mailbox password"}
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {smtpPassConfigured
                      ? "Password is saved in PostgreSQL database and will not reset on server restarts. Type a new password to update."
                      : "Hostinger webmail login password (saved permanently in database)."}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Multi-Brand Senders Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Multi-Brand Sender Identities</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* HiPRO Sender */}
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>HiPRO Master (Hindustan Projects)</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">From Name</label>
                    <input
                      type="text"
                      value={senderNameHipro}
                      onChange={(e) => setSenderNameHipro(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">From Email</label>
                    <input
                      type="email"
                      value={senderEmailHipro}
                      onChange={(e) => setSenderEmailHipro(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Hind Build Sender */}
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                    <Hammer className="w-4 h-4 text-red-600" />
                    <span>Hind Build (HiBUILD / HBS)</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">From Name</label>
                    <input
                      type="text"
                      value={senderNameHbs}
                      onChange={(e) => setSenderNameHbs(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">From Email</label>
                    <input
                      type="email"
                      value={senderEmailHbs}
                      onChange={(e) => setSenderEmailHbs(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Safe Sending Quota & Delays */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>3. Rate Limiting & Safety Pacing</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Rate Limit (Emails / Minute)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={rateLimitPerMinute}
                    onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Recommended: 5-10 per minute to prevent mailbox blacklisting.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Daily Cap (Emails / Day)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Hostinger standard business accounts allow 200-500 emails/day.</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Save All Settings</span>
              </button>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Live Test Mail Tool */}
          <div className="space-y-6">
            
            {/* Live Test Sender Tool */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Send Live Test Email</span>
              </h3>
              <p className="text-xs text-slate-500">
                Apna personal email daal ke check karo ki Hostinger se live email deliver ho raha hai ya nahi:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Brand Sender
                </label>
                <select
                  value={testBrand}
                  onChange={(e) => setTestBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                >
                  <option value="hipro">HiPRO (Hindustan Projects)</option>
                  <option value="hbs">Hind Build (HiBUILD)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTest || !testRecipient}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Test Email Now</span>
              </button>
            </div>

            {/* Quick Hostinger Help Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Hostinger Email Setup Guide</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-500">
                <li>Hostinger hPanel me <strong>Emails &gt; Email Accounts</strong> par jao.</li>
                <li>Waha jo email created hai (jaise info@hindustanprojects.in) uska password daalo.</li>
                <li>Port hamesha <strong>465 (SSL)</strong> select rakho.</li>
                <li>Agar Hostinger me 2-Factor Authentication on hai toh App Password generate karo.</li>
              </ul>
            </div>
          </div>

        </form>
      )}
    </div>
  );
}
