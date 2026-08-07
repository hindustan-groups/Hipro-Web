"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { TeamMember } from "@/lib/types";

const EMPTY: Omit<TeamMember, "id" | "createdAt" | "updatedAt"> = {
  name: "", role: "", img: "", order: 99, active: true,
};

export default function AdminTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchTeam = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/team");
      const json = await res.json();
      if (json.success) setTeam(json.data);
      else setError(json.error || "Failed to load team");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { setShowForm(false); setForm(EMPTY); fetchTeam(); }
      else setError(json.error || "Failed to save");
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    try {
      await fetch(`/api/team/${id}`, {
        method: "DELETE",
      });
      fetchTeam();
    } catch { /* silent */ }
  };

  const toggleActive = async (m: TeamMember) => {
    await fetch(`/api/team/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !m.active }),
    });
    fetchTeam();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={fetchTeam} disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50 transition-colors shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-blue-900/20">
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          <h3 className="text-slate-900 font-bold text-lg">New Team Member</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {(["name", "role"] as const).map((field) => (
              <div key={field}>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">{field}</label>
                <input required value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
              </div>
            ))}
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Profile Image</label>
              <ImageUpload value={form.img} onChange={(url) => setForm((p) => ({ ...p, img: url }))} />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Order Index (Low = First)</label>
              <input type="number" required value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 99 }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20">
              {saving ? "Saving..." : "Save Member"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 font-semibold">Image</th>
                <th className="text-left px-5 py-3.5 font-semibold">Name & Role</th>
                <th className="text-left px-5 py-3.5 font-semibold">Order</th>
                <th className="text-left px-5 py-3.5 font-semibold">Active</th>
                <th className="text-left px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded-lg" /></td>
                    ))}
                  </tr>
                ))
              ) : team.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-500 py-16">No team members yet. Click &quot;Add Team Member&quot; to create one.</td></tr>
              ) : (
                team.map((m) => (
                  <tr key={m.id} className={`transition-colors ${m.active === false ? "opacity-50 bg-slate-50/50" : "hover:bg-slate-50"}`}>
                    <td className="px-5 py-4">
                      {m.img ? <img src={m.img} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" /> : <div className="w-10 h-10 rounded-full bg-slate-200" />}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-900 font-semibold">{m.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{m.role}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{m.order}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleActive(m)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${m.active !== false ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700"}`}>
                        {m.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => deleteMember(m.id)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 flex items-center justify-center transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium">{team.length} members</div>
      </div>
    </div>
  );
}
