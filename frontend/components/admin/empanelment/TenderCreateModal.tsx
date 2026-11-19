"use client";

import React, { useState } from "react";
import { X, Plus, Briefcase, Calendar, MapPin, IndianRupee, ShieldCheck, Loader2 } from "lucide-react";

interface TenderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (tender: any) => void;
}

export default function TenderCreateModal({ isOpen, onClose, onCreated }: TenderCreateModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    tenderNumber: `HP-TND-${Math.floor(1000 + Math.random() * 9000)}`,
    category: "Civil Construction",
    scopeOfWork: "",
    location: "Jaipur, Rajasthan",
    estimatedBudget: "",
    deadline: "",
    requiredTier: "ALL",
    status: "ACTIVE",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/empanelment/admin/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create tender");
      }

      onCreated(json.tender);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to publish tender");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20 shadow-2xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Publish New Tender Package</h2>
              <p className="text-[11px] text-slate-500 font-medium">Bids will be accepted from verified empanelled partners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
              Tender Title / Work Package *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Structural RCC &amp; Masonry Works — Tower C"
              className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.tenderNumber}
                onChange={(e) => setFormData({ ...formData, tenderNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                Trade Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="Civil Construction">Civil Construction</option>
                <option value="Electrical & MEP">Electrical &amp; MEP</option>
                <option value="Plumbing & Sanitation">Plumbing &amp; Sanitation</option>
                <option value="Fabrication & PEB">Fabrication &amp; PEB</option>
                <option value="Flooring & Finishing">Flooring &amp; Finishing</option>
                <option value="Material Supply">Material Supply</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                Estimated Value (₹)
              </label>
              <input
                type="text"
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                placeholder="e.g. ₹45,00,000"
                className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                Site Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Mansarovar, Jaipur"
                className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                Submission Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                Required Minimum Tier
              </label>
              <select
                value={formData.requiredTier}
                onChange={(e) => setFormData({ ...formData, requiredTier: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="ALL">Open to All Empanelled</option>
                <option value="TIER_A">Tier A Only (&gt; ₹2 Cr)</option>
                <option value="TIER_B">Tier B &amp; Above</option>
                <option value="TIER_C">Tier C &amp; Above</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
              Detailed Scope of Work &amp; BOQ Highlights
            </label>
            <textarea
              rows={3}
              value={formData.scopeOfWork}
              onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
              placeholder="Outline work specifications, material grades, completion timeline, warranty clauses..."
              className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs transition-all active:scale-[0.99] flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{saving ? "Publishing..." : "Publish Tender"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
