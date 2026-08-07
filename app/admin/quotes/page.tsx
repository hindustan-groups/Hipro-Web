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
        <div className="flex gap-2 p-1 bg-slate-100 rounded-full border border-slate-200 overflow-x-auto">
          {["all", "pending", "reviewed", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${filter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchQuotes} disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50 transition-colors shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5 font-semibold">Client</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Type</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Budget</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded-lg" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-slate-500 py-16">No quotes found</td></tr>
                ) : (
                  filtered.map((q) => (
                    <tr key={q.id} className={`hover:bg-slate-50 transition-colors cursor-pointer ${selected?.id === q.id ? "bg-slate-50 border-l-2 border-l-construction-navy" : "border-l-2 border-l-transparent"}`}
                      onClick={() => setSelected(q)}>
                      <td className="px-5 py-4">
                        <p className="text-slate-900 font-semibold">{q.name}</p>
                        <p className="text-slate-500 text-xs">{q.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{q.projectType}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{q.budget}</td>
                      <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={q.status} /></td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => updateStatus(q.id, "reviewed")} title="Review"
                            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center transition-colors shadow-sm">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus(q.id, "approved")} title="Approve"
                            className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 flex items-center justify-center transition-colors shadow-sm">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus(q.id, "rejected")} title="Reject"
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 flex items-center justify-center transition-colors shadow-sm">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 h-fit sticky top-24">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-slate-900 font-bold text-lg">Quote Details</h3>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Name",        value: selected.name },
                  { label: "Email",       value: selected.email },
                  { label: "Phone",       value: selected.phone },
                  { label: "Project",     value: selected.projectType },
                  { label: "Budget",      value: selected.budget },
                  { label: "Location",    value: selected.location },
                  { label: "Timeline",    value: selected.timeline },
                ].map(({ label, value }) => (
                  <div key={label} className={label === "Email" || label === "Location" ? "col-span-2" : ""}>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">{label}</p>
                    <p className="text-slate-900 text-sm font-medium">{value || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Description</p>
                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{selected.description}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => updateStatus(selected.id, "approved")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm shadow-green-900/20">
                  Approve Quote
                </button>
                <button onClick={() => updateStatus(selected.id, "rejected")}
                  className="flex-1 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm">
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
              <Eye className="w-10 h-10 mb-3 text-slate-300" />
              <p className="text-sm font-medium">Select a quote to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
