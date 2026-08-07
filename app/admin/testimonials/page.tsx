"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, Trash2, Star } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

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

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [filter, setFilter]             = useState("all");

  const fetchTestimonials = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/testimonials?all=true");
      const json = await res.json();
      if (json.success) setTestimonials(json.data);
      else setError(json.error || "Failed to load testimonials");
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const approve = async (id: string) => {
    try {
      await fetch("/api/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: true }),
      });
      fetchTestimonials();
    } catch { /* silent */ }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await fetch("/api/testimonials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchTestimonials();
    } catch { /* silent */ }
  };

  const filtered =
    filter === "all"
      ? testimonials
      : filter === "approved"
      ? testimonials.filter((t) => t.approved)
      : testimonials.filter((t) => !t.approved);

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-full border border-slate-200">
          {["all", "approved", "pending"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                filter === s
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={fetchTestimonials}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Cards grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white border border-slate-200 rounded-2xl shadow-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-24">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>No testimonials found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 rounded-2xl p-5 transition-all flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, si) => (
                  <Star
                    key={si}
                    className={`w-4 h-4 ${
                      si < t.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-slate-200 fill-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 text-[13px] leading-relaxed flex-1 line-clamp-4">
                &quot;{t.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-construction-navy to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {t.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-slate-900 text-[13px] font-semibold">{t.name}</p>
                  <p className="text-slate-500 text-[11px]">{t.role}</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={t.approved ? "approved" : "pending"} />
                </div>
              </div>

              {/* Date */}
              <p className="text-slate-500 text-[11px]">
                {new Date(t.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                {!t.approved && (
                  <button
                    onClick={() => approve(t.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-xs font-semibold py-2 rounded-xl transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}
                <button
                  onClick={() => remove(t.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold py-2 rounded-xl transition-colors shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <p className="text-slate-500 text-xs text-right font-medium">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          {" · "}
          {testimonials.filter((t) => t.approved).length} approved
          {" · "}
          {testimonials.filter((t) => !t.approved).length} pending
        </p>
      )}
    </div>
  );
}
