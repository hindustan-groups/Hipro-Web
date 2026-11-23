"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Users,
  Search,
  X,
  Building2,
  Award,
} from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";
import type { TeamMember } from "@/lib/types";

const EMPTY: Omit<TeamMember, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  role: "",
  img: "",
  bio: "",
  isFounder: false,
  instagram: "",
  linkedin: "",
  facebook: "",
  order: 1,
  active: true,
};

export default function AdminTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const revalidateTeamCache = async () => {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tags: ["team", "about"],
          paths: ["/about", "/"],
        }),
      });
    } catch {
      /* silent */
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const fetchTeam = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/team?all=true");
      const json = await res.json();
      if (json.success) setTeam(json.data);
      else setError(json.error || "Failed to load team");
    } catch {
      setError("Network error connecting to team service");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleStartAdd = () => {
    setEditingMemberId(null);
    setForm({
      ...EMPTY,
      order: team.length ? Math.max(...team.map((t) => t.order || 0)) + 1 : 1,
    });
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
      order: m.order ?? 1,
      active: m.active,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editingMemberId ? `/api/team/${editingMemberId}` : "/api/team";
      const method = editingMemberId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        setForm(EMPTY);
        setEditingMemberId(null);
        await revalidateTeamCache();
        showNotification(
          editingMemberId ? "Team member updated successfully." : "New team member added."
        );
        fetchTeam();
      } else {
        setError(json.error || "Failed to save team member");
      }
    } catch {
      setError("Network error while saving team member");
    }
    setSaving(false);
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        await revalidateTeamCache();
        showNotification("Team member deleted.");
        fetchTeam();
      } else {
        setError(json.error || "Failed to delete team member");
      }
    } catch {
      setError("Network error");
    }
  };

  const toggleActive = async (m: TeamMember) => {
    const newActive = m.active === false ? true : false;
    try {
      const res = await fetch(`/api/team/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active: newActive }),
      });
      const json = await res.json();
      if (json.success) {
        await revalidateTeamCache();
        showNotification(
          newActive
            ? `${m.name} is now Live on site!`
            : `${m.name} deactivated (hidden from public site).`
        );
        fetchTeam();
      } else {
        setError(json.error || "Failed to toggle status");
      }
    } catch {
      setError("Network error");
    }
  };

  const stats = useMemo(() => {
    const total = team.length;
    const active = team.filter((m) => m.active !== false).length;
    const hidden = total - active;
    const founders = team.filter((m) => m.isFounder).length;
    return { total, active, hidden, founders };
  }, [team]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return team;
    return team.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q)
    );
  }, [team, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* ── Top Header Glass Breadcrumb ───────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.03)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                href="/admin/hipro"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-all shadow-2xs group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to HiPRO Overview</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-200/80 shadow-2xs">
                <Users className="w-3 h-3 text-blue-600" />
                Executive Leadership Roster
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Leadership &amp; Technical Engineers CMS
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
              Manage Founder statements, lead architects, and civil engineering directors displayed on the public website.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            <a
              href="/about#leadership-statement"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>View Public Section</span>
            </a>
            <button
              onClick={handleStartAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0F2C59] hover:bg-blue-900 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-300" />
              <span>Add Member</span>
            </button>
            <button
              onClick={fetchTeam}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Summary Bento Bar ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Profiles", count: stats.total },
          { label: "Active on Site", count: stats.active },
          { label: "Hidden / Inactive", count: stats.hidden },
          { label: "Founder / Executive", count: stats.founders },
        ].map((s) => (
          <div
            key={s.label}
            className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/70 shadow-2xs"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {s.label}
            </p>
            <p className="text-xl font-black text-slate-900 font-display mt-0.5">
              {s.count}
            </p>
          </div>
        ))}
      </div>

      {/* ── Search Bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team member by name or role..."
            className="w-full bg-white/90 border border-slate-200/80 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-sm flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs uppercase font-bold text-red-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Add / Edit Form Cupertino Container ────────────────── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 p-6 md:p-8 space-y-5 shadow-2xl animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                Team Member Profile Studio
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {editingMemberId ? "Edit Leadership Profile" : "Add New Team Member"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingMemberId(null);
                setForm(EMPTY);
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
                Full Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Er. Mohit Sharma"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
                Role / Designation *
              </label>
              <input
                required
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                placeholder="e.g. Chief Structural Engineer"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
                Display Order *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.order ?? 1}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    order: e.target.value === "" ? 1 : parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
                Profile Photo
              </label>
              <ImageUpload value={form.img} onChange={(url) => setForm((p) => ({ ...p, img: url }))} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="isFounder"
                checked={form.isFounder}
                onChange={(e) => setForm((p) => ({ ...p, isFounder: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
              />
              <div>
                <label htmlFor="isFounder" className="text-xs font-bold text-slate-900 cursor-pointer block">
                  Is Founder / Featured Director Profile
                </label>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  When enabled, this profile represents the Executive Director in the Leadership Statement section of the About page.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(["linkedin", "instagram", "facebook"] as const).map((field) => (
              <div key={field}>
                <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
                  {field} URL (Optional)
                </label>
                <input
                  value={form[field] || ""}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
              Biography &amp; Engineering Credentials
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Brief professional background, engineering degrees, and domain leadership..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {saving ? "Saving Profile..." : editingMemberId ? "Update Member" : "Save Member"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingMemberId(null);
                setForm(EMPTY);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Table Glass Container ─────────────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_30px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/70 text-slate-500 text-[11px] font-mono uppercase tracking-wider">
                <th className="px-5 py-3.5 font-bold">Photo</th>
                <th className="px-5 py-3.5 font-bold">Name &amp; Role</th>
                <th className="px-5 py-3.5 font-bold">Order</th>
                <th className="px-5 py-3.5 font-bold text-center">Status</th>
                <th className="px-5 py-3.5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded-xl w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-500 py-16">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No team members found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {search ? "Try adjusting your search query." : "Click \"Add Member\" to create a team profile."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      m.active === false ? "opacity-60 bg-slate-50/40" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <td className="px-5 py-4">
                      {m.img ? (
                        <Image
                          src={m.img}
                          alt={m.name}
                          width={44}
                          height={44}
                          unoptimized
                          className="w-11 h-11 object-cover rounded-2xl border border-slate-200/80 shadow-2xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0F2C59] to-blue-700 flex items-center justify-center font-bold text-white text-xs uppercase shadow-2xs">
                          {m.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                        {m.isFounder && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200/80">
                            <Award className="w-3 h-3 text-amber-600" />
                            Founder
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 font-medium truncate max-w-sm">
                        {m.role}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-mono font-bold text-xs">
                      #{m.order}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleActive(m)}
                        title={
                          m.active !== false
                            ? "Click to hide from website"
                            : "Click to publish to website"
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer shadow-2xs ${
                          m.active !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {m.active !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Live on Site</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(m)}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                          title="Edit Profile"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMember(m.id)}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200/70 bg-slate-50/50 text-slate-500 text-xs font-medium flex items-center justify-between">
          <span className="font-mono text-[11px]">{filtered.length} team profiles shown</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {stats.active} active on website • {stats.hidden} hidden • {stats.founders} founders
          </span>
        </div>
      </div>
    </div>
  );
}
