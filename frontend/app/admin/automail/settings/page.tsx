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
  Globe,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function AutoMailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);

  // Delivery Method ("hostinger_api" recommended for Render cloud hosting)
  const [deliveryMethod, setDeliveryMethod] = useState<"hostinger_api" | "smtp">("hostinger_api");

  // Hostinger Mail API State
  const [hostingerApiToken, setHostingerApiToken] = useState("");
  const [hostingerApiTokenConfigured, setHostingerApiTokenConfigured] = useState(false);
  const [hostingerMailboxId, setHostingerMailboxId] = useState("");
  const [connectedMailboxes, setConnectedMailboxes] = useState<Array<{ resourceId: string; address: string }>>([]);
  const [fetchingMailboxes, setFetchingMailboxes] = useState(false);

  // SMTP Form State
  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState("info@hindustanprojects.in");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpPassConfigured, setSmtpPassConfigured] = useState(false);

  // Brand Senders & Limits
  const [senderNameHipro, setSenderNameHipro] = useState("Hindustan Projects");
  const [senderEmailHipro, setSenderEmailHipro] = useState("info@hindustanprojects.in");
  const [senderNameHbs, setSenderNameHbs] = useState("Hind Building Solutions");
  const [senderEmailHbs, setSenderEmailHbs] = useState("hbs@hindustanprojects.in");
  const [dailyLimit, setDailyLimit] = useState(200);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(5);
  const [replyTo, setReplyTo] = useState("info@hindustanprojects.in");

  // Test states
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; mailboxes?: Array<{ resourceId: string; address: string }> } | null>(null);
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
        setDeliveryMethod(s.deliveryMethod || "hostinger_api");
        setHostingerApiToken("");
        setHostingerApiTokenConfigured(Boolean(s.hostingerApiTokenConfigured));
        setHostingerMailboxId(s.hostingerMailboxId || "");
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

        // If API token is configured, load connected mailboxes preview
        if (s.hostingerApiTokenConfigured) {
          fetchMailboxes();
        }
      }
    } catch {
      setToast({ message: "Failed to load current settings from server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchMailboxes = async () => {
    setFetchingMailboxes(true);
    try {
      const res = await fetch("/api/automail/mailboxes");
      const data = await res.json();
      if (data.success && Array.isArray(data.mailboxes)) {
        setConnectedMailboxes(data.mailboxes);
      }
    } catch {
      // Ignore background discovery failure
    } finally {
      setFetchingMailboxes(false);
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
    const effectiveToken = hostingerApiToken.trim() || (hostingerApiTokenConfigured ? "••••••••••••" : "");

    try {
      const res = await fetch("/api/automail/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          hostingerApiToken: effectiveToken,
          hostingerMailboxId,
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
        setHostingerApiTokenConfigured(Boolean(data.settings?.hostingerApiTokenConfigured));
        setSmtpPass("");
        setHostingerApiToken("");
        if (data.settings?.hostingerApiTokenConfigured) {
          fetchMailboxes();
        }
      } else {
        setToast({ message: data.error || "Failed to save settings", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Test Connection Handshake
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const effectivePass = smtpPass.trim() || (smtpPassConfigured ? "••••••••••••" : "");
    const effectiveToken = hostingerApiToken.trim() || (hostingerApiTokenConfigured ? "••••••••••••" : "");

    try {
      const res = await fetch("/api/automail/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          hostingerApiToken: effectiveToken,
          hostingerMailboxId,
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpUser,
          smtpPass: effectivePass,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success && data.mailboxes) {
        setConnectedMailboxes(data.mailboxes);
      }
    } catch {
      setTestResult({
        success: false,
        message: "Network error trying to verify mail server handshake.",
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
    const effectiveToken = hostingerApiToken.trim() || (hostingerApiTokenConfigured ? "••••••••••••" : "");

    try {
      const res = await fetch("/api/automail/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testRecipient,
          subject: "Hostinger AutoMail Delivery Verification",
          htmlBody: `<div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 16px; border-radius: 8px; color: #ffffff; margin-bottom: 16px;">
              <h2 style="margin: 0; font-size: 20px;">🎉 Hindustan Projects AutoMail Verified!</h2>
              <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Enterprise Delivery Engine Active</p>
            </div>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              This test email confirms that your email engine is 100% operational and delivering without any firewall or port issues.
            </p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Protocol:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${deliveryMethod === "hostinger_api" ? "Hostinger Mail API (HTTPS Port 443 — Render Safe)" : `Hostinger SMTP (${smtpHost}:${smtpPort})`}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Sender Identity:</td>
                <td style="padding: 6px 0; color: #0f172a;">${testBrand === "hipro" ? `${senderNameHipro} (${senderEmailHipro})` : `${senderNameHbs} (${senderEmailHbs})`}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Timestamp:</td>
                <td style="padding: 6px 0; color: #0f172a;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 16px;">
              Hindustan Projects • Hind Building Solutions • Automated Delivery System
            </p>
          </div>`,
          brand: testBrand,
          deliveryMethod,
          hostingerApiToken: effectiveToken,
          hostingerMailboxId,
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

  const isConfigured = deliveryMethod === "hostinger_api" ? hostingerApiTokenConfigured : smtpPassConfigured;

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
              <span>Hostinger AutoMail & Delivery Engine Settings</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure Hostinger Mail API (Port 443 — Recommended for Render cloud), SMTP credentials, and multi-brand identities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isConfigured
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {isConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{deliveryMethod === "hostinger_api" ? "Hostinger API Active" : "SMTP Active"}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Credentials Missing (Enter Below)</span>
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
              <span>Test Connection</span>
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
            <div className="space-y-1">
              <p className="font-extrabold">{testResult.success ? "Connection Verified!" : "Connection Failed"}</p>
              <p className="font-normal text-[11px]">{testResult.message}</p>
              {testResult.mailboxes && testResult.mailboxes.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {testResult.mailboxes.map((mb) => (
                    <span key={mb.resourceId} className="px-2 py-0.5 bg-white border border-emerald-300 rounded text-[10px] text-emerald-800 font-mono">
                      ✓ {mb.address}
                    </span>
                  ))}
                </div>
              )}
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
          
          {/* LEFT 2 COLUMNS: Delivery Mode & Credentials */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* DELIVERY PROTOCOL SELECTOR */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>1. Delivery Protocol Selection</span>
                </h3>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Render Safe Architecture
                </span>
              </div>

              {/* Protocol Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hostinger Mail API Option (Recommended) */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("hostinger_api")}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    deliveryMethod === "hostinger_api"
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-blue-900 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Hostinger Mail API
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">HTTPS Port 443 (Zero Timeout)</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Render free tier blocks SMTP ports 465 & 587. Hostinger Mail API runs over secure HTTPS Port 443 with 100% instant delivery.
                  </p>
                </button>

                {/* Hostinger SMTP Option */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("smtp")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    deliveryMethod === "smtp"
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase">
                      <Server className="w-3.5 h-3.5 text-slate-500" />
                      Hostinger SMTP
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Legacy / Local
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">SMTP Port 465 (SSL) / 587</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Standard SMTP protocol for localhost development or VPS servers without outbound firewall port blocking.
                  </p>
                </button>
              </div>

              {/* HOSTINGER MAIL API INPUTS */}
              {deliveryMethod === "hostinger_api" && (
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4 mt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-600" />
                      <span>Hostinger Mail API Access Token</span>
                    </label>
                    {hostingerApiTokenConfigured && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        ✓ Saved in Database
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showApiToken ? "text" : "password"}
                      value={hostingerApiToken}
                      onChange={(e) => setHostingerApiToken(e.target.value)}
                      placeholder={hostingerApiTokenConfigured ? "•••••••••••• (Saved in DB — Leave blank to keep)" : "Paste your Hostinger API Token here"}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiToken(!showApiToken)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showApiToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Connected Mailboxes Detected Preview */}
                  {connectedMailboxes.length > 0 && (
                    <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-1.5">
                      <p className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Connected Hostinger Mailbox(es):</span>
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {connectedMailboxes.map((mb) => (
                          <span
                            key={mb.resourceId}
                            className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono font-medium text-emerald-900"
                          >
                            ✉️ {mb.address}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* How to get API Token Guide */}
                  <div className="p-3.5 bg-blue-50/50 border border-blue-200/60 rounded-xl text-xs text-blue-950 space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        Hostinger API Token Kaise Nikale:
                      </span>
                      <a
                        href="https://hpanel.hostinger.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Open hPanel <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
                      <li>Hostinger hPanel (<code className="text-blue-700">hpanel.hostinger.com</code>) me login karo.</li>
                      <li><strong>Emails</strong> par click karo aur apna domain <strong>hindustanprojects.in</strong> select karo.</li>
                      <li>Left sidebar me <strong>API Access</strong> (ya <strong>Agentic Mail / API Access</strong>) par jao.</li>
                      <li><strong>Create Access Token</strong> click karo, mailboxes select karo aur token copy karke upar paste karo.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* HOSTINGER SMTP INPUTS */}
              {deliveryMethod === "smtp" && (
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4 mt-3">
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
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value={465}>465 (SSL / TLS - Hostinger Default)</option>
                        <option value={587}>587 (STARTTLS)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">Hostinger recommended: 465</p>
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
                          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
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
                          className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                  <p className="text-[10px] text-slate-400 mt-1">Recommended: 5-15 per minute to protect sender reputation.</p>
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
                  <p className="text-[10px] text-slate-400 mt-1">Hostinger business accounts allow 200-500 emails/day.</p>
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
                <span>Save All Settings Permanently</span>
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
                Apna personal email daal ke check karo ki Hostinger se live test email deliver ho raha hai ya nahi:
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
                  <option value="hipro">HiPRO ({senderNameHipro})</option>
                  <option value="hbs">Hind Build ({senderNameHbs})</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span className="font-bold text-slate-800">
                    {deliveryMethod === "hostinger_api" ? "Hostinger Mail API (HTTPS 443)" : `Hostinger SMTP (${smtpPort})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender:</span>
                  <span className="font-mono text-slate-700">
                    {testBrand === "hipro" ? senderEmailHipro : senderEmailHbs}
                  </span>
                </div>
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
                <span>Hostinger Mail Setup Help</span>
              </div>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-500">
                <li>
                  <strong className="text-slate-700">Render Free Tier Users:</strong> Hostinger Mail API use karein. Isme SMTP ports timeout nahi hota.
                </li>
                <li>
                  <strong className="text-slate-700">Hostinger hPanel:</strong> Emails &gt; API Access par Token banayein.
                </li>
                <li>
                  <strong className="text-slate-700">Persistent:</strong> Sabhi credentials PostgreSQL database me safe save hote hain aur restart par gayab nahi hote.
                </li>
              </ul>
            </div>
          </div>

        </form>
      )}
    </div>
  );
}
