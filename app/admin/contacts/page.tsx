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
        <div className="flex gap-2">
          {["all", "new", "read", "replied"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filter === s ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchContacts} disabled={loading}
          className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-left px-5 py-3 font-semibold">Service</th>
                <th className="text-left px-5 py-3 font-semibold">Message</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-left px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded-lg" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-16">No contacts found</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4 text-white font-medium whitespace-nowrap">{c.name}</td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{c.email}</td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{c.service || "—"}</td>
                    <td className="px-5 py-4 text-gray-400 max-w-xs"><p className="truncate">{c.message}</p></td>
                    <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateStatus(c.id, "read")} title="Mark read"
                          className="w-7 h-7 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 flex items-center justify-center transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => updateStatus(c.id, "replied")} title="Mark replied"
                          className="w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
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
    </div>
  );
}
