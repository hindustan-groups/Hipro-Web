"use client";

import { useState, useEffect } from "react";
import { 
  Bell, Send, Users, Sparkles, CheckCircle2, AlertCircle, 
  ExternalLink, Smartphone, Monitor, ShieldCheck, RefreshCw 
} from "lucide-react";

export default function AdminNotificationsPage() {
  const [subscribersCount, setSubscribersCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [sending, setSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Composer Form
  const [title, setTitle] = useState("🏗️ New Project Milestone Handed Over!");
  const [body, setBody] = useState("Explore our latest turnkey civil engineering development in Pune with precision structural design.");
  const [url, setUrl] = useState("/projects");
  const [image, setImage] = useState("");

  const fetchSubscribersCount = async () => {
    setLoadingCount(true);
    try {
      const res = await fetch("/api/notifications/subscribers-count");
      const data = await res.json();
      if (data.success) {
        setSubscribersCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch count:", err);
    } finally {
      setLoadingCount(false);
    }
  };

  useEffect(() => {
    fetchSubscribersCount();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setResultMessage({ type: "error", text: "Please enter both a title and message body." });
      return;
    }

    setSending(true);
    setResultMessage(null);

    try {
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          url: url || "/",
          image: image || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResultMessage({
          type: "success",
          text: `🎉 Successfully sent notification to ${data.sent} subscriber(s)!`
        });
        fetchSubscribersCount();
      } else {
        setResultMessage({ type: "error", text: data.error || "Failed to broadcast notification." });
      }
    } catch (err: any) {
      setResultMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (tTitle: string, tBody: string, tUrl: string) => {
    setTitle(tTitle);
    setBody(tBody);
    setUrl(tUrl);
    setResultMessage(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-construction-red font-bold text-xs uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" /> Web Push Notification Center
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tight">
            Broadcast Push Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Send instant desktop and mobile notifications to visitors who subscribed on your website.
          </p>
        </div>

        <button
          onClick={fetchSubscribersCount}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingCount ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-construction-red">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Subscribers</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">
              {loadingCount ? "..." : (subscribersCount ?? 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Active devices registered</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-construction-navy">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">VAPID Protocol</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">Standard W3C</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">End-to-end encrypted</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center text-yellow-600">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Supported Devices</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">Desktop &amp; Mobile</h3>
            <p className="text-[11px] text-slate-500 mt-1">Chrome, Edge, Safari &amp; Firefox</p>
          </div>
        </div>
      </div>

      {/* Main Composer & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Broadcast Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight">
                Compose Push Notification
              </h2>
              <span className="text-xs font-semibold text-construction-navy bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                Broadcast Mode
              </span>
            </div>

            {/* Quick Templates */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                Quick Template Presets
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate(
                    "🏗️ New Luxury Landmark Project Launched!",
                    "Explore our newly unveiled commercial and residential development with world-class amenities.",
                    "/projects"
                  )}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-red-50 hover:text-construction-red border border-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  🚀 New Project
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate(
                    "💰 Instant Construction Cost Estimator Ready!",
                    "Calculate realistic package costs for your new home or villa build in seconds.",
                    "/cost-estimator"
                  )}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-red-50 hover:text-construction-red border border-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  📊 Cost Calculator
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate(
                    "📰 New Construction Insights & Trends",
                    "Read our latest editorial on structural engineering benchmarks and smart architectures.",
                    "/blogs"
                  )}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-red-50 hover:text-construction-red border border-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  📰 New Blog Post
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate(
                    "🤝 Free Engineering Consultation Available",
                    "Connect with our senior technical directors for a complimentary feasibility analysis.",
                    "/contact"
                  )}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-red-50 hover:text-construction-red border border-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  📞 Consultation Offer
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleBroadcast} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Notification Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 🏗️ Special Construction Milestone"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-red focus:border-transparent text-sm font-semibold text-slate-900 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Message Body *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  placeholder="Write a clear and engaging message..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-red focus:border-transparent text-sm text-slate-800 shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Target Click URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g. /projects or /contact"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-red focus:border-transparent text-sm text-slate-800 shadow-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Where the user is taken when they tap the alert.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Large Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-red focus:border-transparent text-sm text-slate-800 shadow-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Rich expanded banner preview image.</p>
                </div>
              </div>

              {resultMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
                  resultMessage.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {resultMessage.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <span>{resultMessage.text}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending || (subscribersCount === 0)}
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-construction-navy hover:bg-black active:scale-[0.99] text-white font-bold py-4 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className={`w-4 h-4 text-construction-red ${sending ? "animate-spin" : ""}`} />
                  {sending ? "Broadcasting to Subscribers..." : `Broadcast to ${subscribersCount ?? 0} Subscriber(s)`}
                </button>
                {subscribersCount === 0 && (
                  <p className="text-xs text-amber-600 mt-2 text-center font-medium">
                    No active subscribers yet. Enable notifications from the website homepage to test.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Live Preview Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-construction-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Mobile &amp; Desktop Preview
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Push Payload</span>
            </div>

            {/* Mobile Lockscreen Notification Mockup */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src="/logo.jpg" alt="Logo" className="w-4 h-4 rounded-full object-contain bg-white" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Hindustan Projects
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">now</span>
              </div>

              <h4 className="text-sm font-bold text-white mb-1 leading-snug">
                {title || "Notification Title Here"}
              </h4>
              <p className="text-xs text-slate-300 font-light leading-relaxed mb-3 line-clamp-3">
                {body || "Notification message body will appear here..."}
              </p>

              {image && (
                <div className="mb-3 rounded-lg overflow-hidden h-32 w-full bg-slate-900 border border-slate-700">
                  <img src={image} alt="Banner" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-construction-red font-semibold pt-2 border-t border-slate-700/60">
                <span>Action: Open {url || "/"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-yellow-400" />
                How Push Notifications Work
              </div>
              <p className="text-slate-400 leading-relaxed">
                When a visitor visits your website and allows push notifications, their device receives an encrypted token. When you click <strong>Broadcast</strong>, the notification is delivered directly to their operating system even if their browser tab is closed.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
