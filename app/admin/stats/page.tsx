"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Save } from "lucide-react";

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
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const updateStat = async (stat: Stat) => {
    setSaving(stat.id);
    setSuccess("");
    try {
      const res  = await fetch("/api/stats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: stat.id, value: stat.value, label: stat.label }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(`"${stat.label}" updated successfully`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(json.error || "Update failed");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (id: string, field: "value" | "label", val: string) => {
    setStats((prev) => prev.map((s) => s.id === id ? { ...s, [field]: val } : s));
  };

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm font-medium">Edit the numbers shown on the public website.</p>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error   && <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
      {success && <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium">✓ {success}</div>}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white border border-slate-200 shadow-sm rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-2xl p-5 transition-shadow">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">{s.icon}</span>
                <span className="text-slate-400 text-xs font-medium">Order: {s.order}</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) => handleChange(s.id, "label", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
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
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => updateStat(s)}
                disabled={saving === s.id}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-construction-navy hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-blue-900/20"
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
