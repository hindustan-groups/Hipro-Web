"use client";

import React, { useState } from "react";
import { X, Plus, Briefcase, Calendar, MapPin, IndianRupee, ShieldCheck } from "lucide-react";

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
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Publish New Tender Package</h2>
              <p className="text-[11px] text-slate-500 font-medium">Bids will be accepted from verified empanelled partners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Tender Title / Work Package *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Structural RCC & Masonry Works — Tower C"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Tender Reference Number
              </label>
              <input
                type="text"
                value={formData.tenderNumber}
                onChange={(e) => setFormData({ ...formData, tenderNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Trade Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="Civil Construction">Civil Construction</option>
                <option value="Electrical & MEP">Electrical & MEP</option>
                <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
                <option value="Fabrication & PEB">Fabrication & PEB</option>
                <option value="Flooring & Finishing">Flooring & Finishing</option>
                <option value="Material Supply">Material Supply</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Estimated Value (₹)
              </label>
              <input
                type="text"
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                placeholder="e.g. ₹45,00,000"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Site Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Mansarovar, Jaipur"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Bid Submission Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                Required Minimum Tier
              </label>
              <select
                value={formData.requiredTier}
                onChange={(e) => setFormData({ ...formData, requiredTier: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="ALL">Open to All Empanelled</option>
                <option value="TIER_A">Tier A Only (&gt; ₹2 Cr)</option>
                <option value="TIER_B">Tier B & Above</option>
                <option value="TIER_C">Tier C & Above</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Detailed Scope of Work & BOQ Highlights
            </label>
            <textarea
              rows={3}
              value={formData.scopeOfWork}
              onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
              placeholder="Outline work specifications, material grades, completion timeline, warranty clauses..."
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end gap-2">
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
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-md shadow-violet-600/20 transition-all"
            >
              {saving ? "Publishing..." : "Publish Tender"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
