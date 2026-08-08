"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, Clock, Eye, Trash2 } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Contact {
  id: string; name: string; email: string; phone: string;
  service: string; message: string; status: string; createdAt: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("all");

  const fetchContacts = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/contact");
      const json = await res.json();
      if (json.success) setContacts(json.data);
      else setError(json.error || "Failed to load contacts");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchContacts();
    } catch { /* silent */ }
  };

  const filtered = filter === "all" ? contacts : contacts.filter((c) => c.status === filter);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-full border border-slate-200">
          {["all", "new", "read", "replied"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchContacts} disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-none text-xs font-medium transition-colors disabled:opacity-50 shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && <div className="p-4 rounded-none bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 font-semibold">Name</th>
                <th className="text-left px-5 py-3.5 font-semibold">Email</th>
                <th className="text-left px-5 py-3.5 font-semibold">Service</th>
                <th className="text-left px-5 py-3.5 font-semibold">Message</th>
                <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold">Date</th>
                <th className="text-left px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded-none" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-500 py-16">No contacts found</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-slate-900 font-semibold whitespace-nowrap">{c.name}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{c.email}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{c.service || "—"}</td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs"><p className="truncate">{c.message}</p></td>
                    <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateStatus(c.id, "read")} title="Mark read"
                          className="w-8 h-8 rounded-none bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-600 flex items-center justify-center transition-colors shadow-sm">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateStatus(c.id, "replied")} title="Mark replied"
                          className="w-8 h-8 rounded-none bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 flex items-center justify-center transition-colors shadow-sm">
                          <CheckCircle className="w-4 h-4" />
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
    </div>
  );
}
