"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { TeamMember } from "@/lib/types";

const EMPTY: Omit<TeamMember, "id" | "createdAt" | "updatedAt"> = {
  name: "", role: "", img: "", bio: "", 
  isFounder: false, instagram: "", linkedin: "", facebook: "",
  order: 99, active: true,
};

export default function AdminTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

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

  const handleStartAdd = () => {
    setEditingMemberId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const handleEdit = (m: TeamMember) => {
    setEditingMemberId(m.id);
    setForm({
      name: m.name,
      role: m.role,
      img: m.img || "",
      bio: m.bio || "",
      isFounder: m.isFounder || false,
      instagram: m.instagram || "",
      linkedin: m.linkedin || "",
      facebook: m.facebook || "",
      order: m.order,
      active: m.active
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = editingMemberId ? `/api/team/${editingMemberId}` : "/api/team";
      const method = editingMemberId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { setShowForm(false); setForm(EMPTY); setEditingMemberId(null); fetchTeam(); }
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
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-none text-xs font-medium disabled:opacity-50 transition-colors shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
        <button onClick={handleStartAdd}
          className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-4 py-2 rounded-none text-sm font-semibold transition-colors shadow-md shadow-blue-900/20">
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {error && <div className="p-4 rounded-none bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-none p-6 space-y-4">
          <h3 className="text-slate-900 font-bold text-lg">{editingMemberId ? "Edit Team Member" : "New Team Member"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {(["name", "role"] as const).map((field) => (
              <div key={field}>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">{field}</label>
                <input required value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
              </div>
            ))}
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Profile Image</label>
              <ImageUpload value={form.img} onChange={(url) => setForm((p) => ({ ...p, img: url }))} />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Order Index (Low = First)</label>
              <input type="number" required value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 99 }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-4 bg-amber-50/50 border border-amber-200 rounded-none">
            <input 
              type="checkbox" 
              id="isFounder"
              checked={form.isFounder} 
              onChange={(e) => setForm((p) => ({ ...p, isFounder: e.target.checked }))}
              className="w-4 h-4 text-construction-navy border-slate-300 rounded focus:ring-construction-navy"
            />
            <label htmlFor="isFounder" className="text-sm font-bold text-slate-900 cursor-pointer">
              Is Founder / Featured Executive Profile
            </label>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(["instagram", "linkedin", "facebook"] as const).map((field) => (
              <div key={field}>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">{field} URL</label>
                <input value={form[field] || ""} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Biography (Optional)</label>
            <textarea rows={4} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2 rounded-none text-sm font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20">
              {saving ? "Saving..." : (editingMemberId ? "Update Member" : "Save Member")}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingMemberId(null); setForm(EMPTY); }}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-2 rounded-none text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
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
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded-none" /></td>
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
                      <p className="text-slate-900 font-semibold flex items-center gap-2">
                        {m.name}
                        {m.isFounder && <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-none border border-amber-200">Founder</span>}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{m.role}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{m.order}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleActive(m)} className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors ${m.active !== false ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700"}`}>
                        {m.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(m)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white border border-slate-200 hover:bg-slate-50 hover:text-construction-navy hover:border-slate-300 text-slate-600 font-semibold transition-all shadow-sm">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => deleteMember(m.id)}
                          className="w-8 h-8 rounded-none bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 flex items-center justify-center transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
