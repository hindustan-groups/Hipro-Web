"use client";

import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Building,
  Plus,
  X,
  Tag,
  ExternalLink,
  Globe,
  User,
  UserCheck,
  Ruler,
  Compass,
  CheckCircle,
  Sliders,
  Briefcase,
} from "lucide-react";

export interface ProjectSpecificationsData {
  client: string;
  owner: string;
  area: string;
  services: string[];
  location: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  targetLocation: string;
  latitude: string | number;
  longitude: string | number;
  googleMapsUrl: string;
  date: string;
  completionDate: string;
}

interface ProjectSpecificationsTabProps {
  formData: ProjectSpecificationsData & {
    category?: string;
    status?: "active" | "ongoing" | "completed" | "archived";
    title?: string;
  };
  onChange: (fields: Partial<ProjectSpecificationsData>) => void;
}

const COMMON_SERVICES = [
  "General Contracting",
  "Pre-Engineered Building (PEB)",
  "Industrial Turnkey Solutions",
  "Civil Construction",
  "Structural Steel Fabrication",
  "Interior Fit-Outs",
  "MEP & HVAC Systems",
  "Heavy Foundation Engineering",
];

export default function ProjectSpecificationsTab({
  formData,
  onChange,
}: ProjectSpecificationsTabProps) {
  const [serviceInput, setServiceInput] = useState("");

  const handleAddService = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!formData.services.includes(trimmed)) {
      onChange({ services: [...formData.services, trimmed] });
    }
    setServiceInput("");
  };

  const handleRemoveService = (serviceToRemove: string) => {
    onChange({
      services: formData.services.filter((s) => s !== serviceToRemove),
    });
  };

  const handleServiceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddService(serviceInput);
    }
  };

  const formattedGeoSummary = [
    formData.city,
    formData.district,
    formData.state,
    formData.country,
    formData.postalCode ? `PIN: ${formData.postalCode}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          SECTION A: CLIENT & OWNERSHIP
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-3.5 h-3.5 text-construction-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              02A · Client &amp; Ownership
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
            Stakeholders
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Client */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Client Organization</span>
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => onChange({ client: e.target.value })}
                placeholder="e.g. Sangam Group Ltd"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Primary commissioning client or contracting body.
              </p>
            </div>

            {/* Owner */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Project Principal / Owner</span>
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => onChange({ owner: e.target.value })}
                placeholder="e.g. Private / Rajasthan State Industrial Corp"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Ultimate facility owner or government agency.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B: PROJECT SCALE & SERVICES
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-3.5 h-3.5 text-construction-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              02B · Project Scale &amp; Scope of Services
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
            Metrics
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-slate-500" />
              <span>Gross Built-Up Area</span>
            </label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => onChange({ area: e.target.value })}
              placeholder="e.g. 150,000 sq.ft or 3.5 Acres"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Physical scale formatted with units (sq.ft, acres, meters, etc.).
            </p>
          </div>

          {/* Services */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Delivered Engineering Services
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {formData.services.length} Added
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={handleServiceKeyDown}
                placeholder="e.g. Turnkey Civil Works (Enter to add)"
                className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
              <button
                type="button"
                onClick={() => handleAddService(serviceInput)}
                className="bg-slate-900 hover:bg-construction-navy text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Preset quick pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-400 py-1 mr-1">Quick Select:</span>
              {COMMON_SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddService(s)}
                  disabled={formData.services.includes(s)}
                  className={`text-[10px] px-2 py-0.5 border transition-all cursor-pointer ${
                    formData.services.includes(s)
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400"
                  }`}
                >
                  + {s}
                </button>
              ))}
            </div>

            {formData.services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {formData.services.map((svc) => (
                  <span
                    key={svc}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-medium"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {svc}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(svc)}
                      className="text-slate-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C: LOCATION & GEO INTELLIGENCE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="w-3.5 h-3.5 text-construction-red" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              02C · Location &amp; GEO Intelligence
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
            Geographic Mapping
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* General Location Display String */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-construction-red" />
                <span>Site Location Display</span>
                <span className="text-construction-red font-bold">*</span>
              </label>
              <span className="text-[10px] font-mono font-bold uppercase text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
                Publish Required
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. RIICO Industrial Area, Bhilwara, Rajasthan"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
            />
            <p className="text-[11px] text-slate-500">
              Primary location label rendered on project cards and search listings.
            </p>
          </div>

          {/* Granular Geography */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                City / Town
              </label>
              <input
                type="text"
                value={formData.city || ""}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="e.g. Bhilwara"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                District
              </label>
              <input
                type="text"
                value={formData.district || ""}
                onChange={(e) => onChange({ district: e.target.value })}
                placeholder="e.g. Bhilwara District"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                State / Province
              </label>
              <input
                type="text"
                value={formData.state || ""}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="e.g. Rajasthan"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country || ""}
                onChange={(e) => onChange({ country: e.target.value })}
                placeholder="e.g. India"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Postal PIN Code
              </label>
              <input
                type="text"
                value={formData.postalCode || ""}
                onChange={(e) => onChange({ postalCode: e.target.value })}
                placeholder="e.g. 311001"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Target Location / Hub
              </label>
              <input
                type="text"
                value={formData.targetLocation || ""}
                onChange={(e) => onChange({ targetLocation: e.target.value })}
                placeholder="e.g. RIICO Phase 3"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>
          </div>

          {/* Coordinates & Maps URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Latitude (° N)
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude !== null && formData.latitude !== undefined ? formData.latitude : ""}
                onChange={(e) => onChange({ latitude: e.target.value })}
                placeholder="e.g. 25.3407"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Longitude (° E)
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude !== null && formData.longitude !== undefined ? formData.longitude : ""}
                onChange={(e) => onChange({ longitude: e.target.value })}
                placeholder="e.g. 74.6313"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Google Maps URL
              </label>
              <input
                type="url"
                value={formData.googleMapsUrl || ""}
                onChange={(e) => onChange({ googleMapsUrl: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
            </div>
          </div>

          {formData.googleMapsUrl && (
            <div className="pt-1">
              <a
                href={formData.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 hover:text-blue-800 uppercase"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Live Google Maps Link</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION D: TIMELINE & SCHEDULING
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-3.5 h-3.5 text-construction-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
              02D · Timeline &amp; Scheduling
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 border border-slate-200">
            Milestones
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Project Commencement Date / General Date */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Commencement / Project Date</span>
                  <span className="text-construction-red font-bold">*</span>
                </label>
                <span className="text-[10px] font-mono font-bold uppercase text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
                  Publish Required
                </span>
              </div>
              <input
                type="text"
                required
                value={formData.date}
                onChange={(e) => onChange({ date: e.target.value })}
                placeholder="e.g. Q2 2024 or May 2024"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Primary timeline label displayed on cards and case study ledger.
              </p>
            </div>

            {/* Handover / Completion Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Handover / Completion Date</span>
              </label>
              <input
                type="text"
                value={formData.completionDate}
                onChange={(e) => onChange({ completionDate: e.target.value })}
                placeholder="e.g. Q4 2025 or Completed Dec 2024"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Target commissioning milestone or physical handover date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
