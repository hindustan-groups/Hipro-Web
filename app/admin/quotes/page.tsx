"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, XCircle, Eye } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Quote {
  id: string; name: string; email: string; phone: string;
  projectType: string; budget: string; location: string;
  description: string; timeline: string; status: string; createdAt: string;
}

export default function AdminQuotes() {
  const [quotes, setQuotes]   = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState<Quote | null>(null);

  const fetchQuotes = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/quote");
      const json = await res.json();
      if (json.success) setQuotes(json.data);
      else setError(json.error || "Failed to load quotes");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/quote", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchQuotes();
      if (selected?.id === id) setSelected(null);
    } catch { /* silent */ }
  };

  const filtered = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {["all", "pending", "reviewed", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filter === s ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchQuotes} disabled={loading}
          className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Client</th>
                  <th className="text-left px-5 py-3 font-semibold">Type</th>
                  <th className="text-left px-5 py-3 font-semibold">Budget</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded-lg" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-500 py-16">No quotes found</td></tr>
                ) : (
                  filtered.map((q) => (
                    <tr key={q.id} className={`hover:bg-gray-800/40 transition-colors cursor-pointer ${selected?.id === q.id ? "bg-blue-600/10" : ""}`}
                      onClick={() => setSelected(q)}>
                      <td className="px-5 py-4">
                        <p className="text-white font-medium">{q.name}</p>
                        <p className="text-gray-500 text-xs">{q.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{q.projectType}</td>
                      <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{q.budget}</td>
                      <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={q.status} /></td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => updateStatus(q.id, "reviewed")} title="Review"
                            className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => updateStatus(q.id, "approved")} title="Approve"
                            className="w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => updateStatus(q.id, "rejected")} title="Reject"
                            className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-800 text-gray-500 text-xs">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Quote Details</h3>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 text-xs">✕</button>
              </div>
              {[
                { label: "Name",        value: selected.name },
                { label: "Email",       value: selected.email },
                { label: "Phone",       value: selected.phone },
                { label: "Project",     value: selected.projectType },
                { label: "Budget",      value: selected.budget },
                { label: "Location",    value: selected.location },
                { label: "Timeline",    value: selected.timeline },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-0.5">{label}</p>
                  <p className="text-gray-200 text-sm">{value || "—"}</p>
                </div>
              ))}
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-0.5">Description</p>
                <p className="text-gray-200 text-sm leading-relaxed">{selected.description}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateStatus(selected.id, "approved")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-xl transition-colors">
                  Approve
                </button>
                <button onClick={() => updateStatus(selected.id, "rejected")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl transition-colors">
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-600">
              <Eye className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Click a row to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
