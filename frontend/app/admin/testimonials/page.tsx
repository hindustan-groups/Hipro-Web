"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CheckCircle,
  Trash2,
  Star,
  Plus,
  ArrowLeft,
  MessageSquare,
  Search,
  X,
  Check,
  Building2,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import ImageUpload from "@/components/admin/ImageUpload";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image?: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  name: "",
  role: "",
  text: "",
  rating: 5,
  image: "",
  approved: true,
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/testimonials?all=true&t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) setTestimonials(json.data);
      else setError(json.error || "Failed to load testimonials");
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const triggerRevalidation = async () => {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tag: "testimonials", path: "/" }),
      });
    } catch {
      // Revalidation best-effort
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        setForm(EMPTY_FORM);
        await triggerRevalidation();
        fetchTestimonials();
      } else {
        setError(json.error || "Failed to add testimonial");
      }
    } catch {
      setError("Network error adding testimonial");
    } finally {
      setSaving(false);
    }
  };

  const approve = async (id: string) => {
    try {
      const res = await fetch("/api/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, approved: true }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await triggerRevalidation();
        fetchTestimonials();
      } else {
        setError(json.error || "Failed to approve testimonial");
      }
    } catch {
      setError("Network error while approving testimonial");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch("/api/testimonials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await triggerRevalidation();
        fetchTestimonials();
      } else {
        setError(json.error || "Failed to delete testimonial");
      }
    } catch {
      setError("Network error while deleting testimonial");
    }
  };

  const stats = useMemo(() => {
    const total = testimonials.length;
    const approved = testimonials.filter((t) => t.approved).length;
    const pending = testimonials.filter((t) => !t.approved).length;
    const avgRating =
      total > 0
        ? (
            testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / total
          ).toFixed(1)
        : "5.0";
    return { total, approved, pending, avgRating };
  }, [testimonials]);

  const filtered = useMemo(() => {
    return testimonials.filter((t) => {
      const matchFilter =
        filter === "all"
          ? true
          : filter === "approved"
          ? t.approved
          : !t.approved;

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.role?.toLowerCase().includes(q) ||
        t.text?.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [testimonials, filter, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* ── Top Header Glass Breadcrumb ───────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.03)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider border border-amber-200/80 shadow-2xs">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                Verified Client Endorsements
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Client Testimonials &amp; Reviews CMS
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
              Manage executive testimonials, client ratings, and quotes published on the public landing page.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0F2C59] hover:bg-blue-900 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-300" />
              <span>Add Review</span>
            </button>
            <button
              onClick={fetchTestimonials}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-600" : "text-slate-500"}`} />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Summary Bento Bar ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Reviews", count: stats.total, filterKey: "all" },
          { label: "Approved & Live", count: stats.approved, filterKey: "approved" },
          { label: "Pending Approval", count: stats.pending, filterKey: "pending" },
          { label: "Average Rating", count: `${stats.avgRating} ★`, filterKey: "all" },
        ].map((s, idx) => {
          const isActive = idx < 3 && filter === s.filterKey;
          return (
            <button
              key={s.label}
              onClick={() => idx < 3 && setFilter(s.filterKey)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                idx < 3 ? "cursor-pointer" : "cursor-default"
              } ${
                isActive
                  ? "bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-sm"
                  : "bg-white/80 hover:bg-white border-slate-200/70 shadow-2xs"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {s.label}
              </p>
              <p className="text-xl font-black text-slate-900 font-display mt-0.5">
                {s.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar: Search & Filter Tabs ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by client or company..."
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

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 overflow-x-auto w-full sm:w-auto">
          {["all", "approved", "pending"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                filter === s
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
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

      {/* ── Add Review Cupertino Drawer/Form ──────────────────── */}
      {showForm && (
        <form
          onSubmit={handleAddSubmit}
          className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 p-6 md:p-8 space-y-5 shadow-2xl animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono">
                CMS Content Studio
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Add New Client Testimonial
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
                Client Full Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Ramesh Chandra Sharma"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
                Role &amp; Organization *
              </label>
              <input
                required
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Managing Director, Horizon Infra"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
                Rating (1 - 5 Stars) *
              </label>
              <select
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Exceptional)</option>
                <option value={4}>⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                <option value={3}>⭐⭐⭐ 3 Stars (Satisfactory)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
                Avatar Image (Optional)
              </label>
              <ImageUpload value={form.image} onChange={(url) => setForm((p) => ({ ...p, image: url }))} />
            </div>
          </div>

          <div>
            <label className="text-slate-500 text-xs font-bold font-mono uppercase tracking-wider block mb-1">
              Testimonial Copy *
            </label>
            <textarea
              required
              rows={3}
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              placeholder="Write the client endorsement quote regarding project execution, structural excellence, or turnkey delivery..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {saving ? "Publishing Review..." : "Publish Testimonial"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Testimonial Cards Grid ────────────────────────────── */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-white/70 border border-slate-200/70 rounded-3xl shadow-2xs" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-20 bg-white/70 border border-slate-200/70 rounded-3xl shadow-2xs">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">No testimonials found</p>
          <p className="text-xs text-slate-400 mt-1">Click &ldquo;Add Review&rdquo; to add a new client quote.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 shadow-[0_4px_30px_rgba(15,23,42,0.03)] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars & Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, si) => (
                      <Star
                        key={si}
                        className={`w-3.5 h-3.5 ${
                          si < (t.rating || 5)
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-200 fill-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${
                      t.approved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {t.approved ? "Live on Site" : "Pending Review"}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-slate-700 text-xs leading-relaxed italic line-clamp-4 mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div>
                {/* Author Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  {t.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200/80 shadow-2xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0F2C59] to-blue-700 flex items-center justify-center text-white font-bold text-xs uppercase shadow-2xs">
                      {t.name ? t.name.charAt(0) : "C"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{t.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{t.role}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  {!t.approved && (
                    <button
                      onClick={() => approve(t.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200/80 transition-all cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                  <button
                    onClick={() => remove(t.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold border border-slate-200 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
