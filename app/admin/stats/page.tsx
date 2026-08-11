"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import DynamicIcon from "@/components/DynamicIcon";

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string;
  order: number;
}

export default function AdminStats() {
  const [stats, setStats]   = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<string | null>(null);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/stats");
      const json = await res.json();
      if (json.success) setStats(json.data);
      else setError(json.error || "Failed to load stats");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const handleChange = (id: string, field: keyof Stat, value: string) => {
    setStats((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const updateStat = async (stat: Stat) => {
    setSaving(stat.id);
    setSuccess("");
    try {
      const res  = await fetch("/api/stats", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(stat),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(`Updated "${stat.label}"`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(json.error || "Failed to update stat");
      }
    } catch {
      setError("Network error");
    }
    setSaving(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Site Statistics</h1>
          <p className="text-slate-500 text-sm">Manage key performance indicators and numbers displayed on the homepage and about page.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-none-none text-xs font-medium disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error   && <div className="p-4 rounded-none-none bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
      {success && <div className="p-4 rounded-none-none bg-green-50 border border-green-100 text-green-700 text-sm font-medium">✓ {success}</div>}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white border border-slate-200 shadow-sm rounded-none-none" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-none-none p-5 transition-shadow">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-none-none bg-red-50 border border-red-100 flex items-center justify-center text-construction-red">
                    <DynamicIcon name={s.icon || "HelpCircle"} className="w-4 h-4" />
                  </div>
                  <span className="text-slate-900 text-xs font-bold uppercase tracking-wider">{s.label || "Stat"}</span>
                </div>
                <span className="text-slate-400 text-xs font-medium">Order: {s.order}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) => handleChange(s.id, "label", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleChange(s.id, "value", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">
                    Icon Name (Lucide)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={s.icon}
                      onChange={(e) => handleChange(s.id, "icon", e.target.value)}
                      placeholder="e.g. Trophy, Users, CheckCircle"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-mono"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-none-none bg-slate-100 border border-slate-200 flex items-center justify-center text-construction-navy pointer-events-none shadow-sm">
                      <DynamicIcon name={s.icon || "HelpCircle"} className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => updateStat(s)}
                disabled={saving === s.id}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-construction-navy hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-none-none transition-colors shadow-md shadow-blue-900/20"
              >
                {saving === s.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saving === s.id ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
