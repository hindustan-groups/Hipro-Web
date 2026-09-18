"use client";

import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Building,
  Wrench,
  Plus,
  X,
  Tag,
  ExternalLink,
  Globe,
  User,
  UserCheck,
  Ruler,
  Building2,
  Compass,
  CheckCircle,
  Eye,
  Sliders,
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

  const isOngoing = formData.status === "ongoing" || formData.status === "active";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN (7 COLS): SPECIFICATION FORMS
          ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-7 space-y-8">
        {/* 1. Timeline & Dates */}
        <div className="bg-white border border-slate-200 shadow-xs">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
                01 · Project Timeline &amp; Dates
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Display &amp; Ledger
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span>Timeline / Date Display</span>
                    <span className="text-construction-red font-bold">*</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
                    Publish Mandatory
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => onChange({ date: e.target.value })}
                  placeholder="e.g. 2024 - 2025 or June 2024"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy transition-all"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Rendered on project cards, hero metadata, and directory filters.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Official Completion Date
                  </label>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Optional
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.completionDate}
                  onChange={(e) => onChange({ completionDate: e.target.value })}
                  placeholder="e.g. March 2025"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy transition-all"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Structured completion timestamp for Schema.org JSON-LD and facts ledger.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Location & Geographic Precision */}
        <div className="bg-white border border-slate-200 shadow-xs">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
                02 · Geographic Precision &amp; Site Location
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Local SEO / AEO Anchor
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <span>General Location Display</span>
                  <span className="text-construction-red font-bold">*</span>
                </label>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-construction-red bg-red-50 border border-red-200 px-2 py-0.5">
                  Publish Mandatory
                </span>
              </div>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => onChange({ location: e.target.value })}
                placeholder="e.g. RIICO Industrial Area, Bhilwara"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy focus:border-construction-navy transition-all"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                Primary location label visible on the portfolio card and hero section.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => onChange({ city: e.target.value })}
                  placeholder="e.g. Bhilwara"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => onChange({ district: e.target.value })}
                  placeholder="e.g. Bhilwara"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => onChange({ state: e.target.value })}
                  placeholder="e.g. Rajasthan"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => onChange({ country: e.target.value })}
                  placeholder="e.g. India"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Postal Code (PIN)
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => onChange({ postalCode: e.target.value })}
                  placeholder="e.g. 311001"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Target Local Area
                </label>
                <input
                  type="text"
                  value={formData.targetLocation}
                  onChange={(e) => onChange({ targetLocation: e.target.value })}
                  placeholder="e.g. Growth Centre"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>
            </div>

            {/* GPS Coordinates & Google Maps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  GPS Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude ?? ""}
                  onChange={(e) => onChange({ latitude: e.target.value })}
                  placeholder="e.g. 25.3463"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  GPS Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude ?? ""}
                  onChange={(e) => onChange({ longitude: e.target.value })}
                  placeholder="e.g. 74.6364"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                    Google Maps URL
                  </label>
                  {formData.googleMapsUrl && (
                    <a
                      href={formData.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 hover:text-construction-red font-bold uppercase tracking-wider flex items-center gap-0.5 transition-colors"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) => onChange({ googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs font-mono rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>
            </div>

            {/* Resolved Geo Display */}
            {formattedGeoSummary && (
              <div className="bg-slate-100/90 border border-slate-200 px-3.5 py-2 text-xs flex items-center gap-2 font-mono">
                <Globe className="w-3.5 h-3.5 text-construction-navy shrink-0" />
                <span className="text-slate-500 font-medium">Geo Resolved:</span>
                <span className="text-slate-900 font-bold">{formattedGeoSummary}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Stakeholders & Scale */}
        <div className="bg-white border border-slate-200 shadow-xs">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
                03 · Client, Developer &amp; Scale Specifications
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Ledger Metrics
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Client Organization
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => onChange({ client: e.target.value })}
                  placeholder="e.g. Sangam Group Ltd"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Owner / Developer
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => onChange({ owner: e.target.value })}
                  placeholder="e.g. Hindustan Projects Infra Pvt Ltd"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Built-Up Area / Scale
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => onChange({ area: e.target.value })}
                  placeholder="e.g. 120,000 sq.ft / 4.5 Acres"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Engineering & Construction Services */}
        <div className="bg-white border border-slate-200 shadow-xs">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-200">
                04 · Engineering &amp; Construction Services
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Capability Tagging
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={handleServiceKeyDown}
                placeholder="Type custom engineering service and press Enter..."
                className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 px-3.5 py-2 text-xs rounded-none focus:outline-none focus:ring-1 focus:ring-construction-navy"
              />
              <button
                type="button"
                onClick={() => handleAddService(serviceInput)}
                className="bg-slate-900 hover:bg-construction-navy text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Service
              </button>
            </div>

            {/* Suggestions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Standard HiPRO Engineering Capabilities:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SERVICES.map((s) => {
                  const active = formData.services.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => (active ? handleRemoveService(s) : handleAddService(s))}
                      className={`text-[11px] px-2.5 py-1 border rounded-none transition-colors cursor-pointer font-medium ${
                        active
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {active ? `✓ ${s}` : `+ ${s}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Services Tags */}
            {formData.services.length > 0 ? (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
                  Active Services ({formData.services.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((svc) => (
                    <span
                      key={svc}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-900 text-xs font-semibold rounded-none"
                    >
                      <Tag className="w-3 h-3 text-slate-500" />
                      {svc}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(svc)}
                        className="text-slate-400 hover:text-construction-red transition-colors ml-1 cursor-pointer"
                        title="Remove service"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                No engineering services selected yet. Click suggestions or type above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN (5 COLS): SYNCHRONIZED EXECUTIVE FACTS LEDGER
          (Faithfully Simulates The Live Public Detail Page Sidebar)
          ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-5 sticky top-6 space-y-6">
        <div className="bg-slate-950 text-slate-100 border border-slate-800 p-6 sm:p-7 shadow-xl rounded-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                Executive Project Ledger
              </h4>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400/90 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5">
              Live Preview
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-mono mb-5 leading-relaxed">
            Exact real-time rendering of the public facts sidebar on{" "}
            <span className="text-slate-300">/projects/[slug]</span>.
          </p>

          {/* Specifications List */}
          <ul className="space-y-4">
            {formData.client && formData.client.trim() && (
              <li className="border-b border-slate-800/80 pb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Client / Employer
                </span>
                <p className="text-sm font-medium text-slate-100 pl-5">
                  {formData.client.trim()}
                </p>
              </li>
            )}

            {formData.owner && formData.owner.trim() && (
              <li className="border-b border-slate-800/80 pb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  Project Principal / Owner
                </span>
                <p className="text-sm font-medium text-slate-100 pl-5">
                  {formData.owner.trim()}
                </p>
              </li>
            )}

            {formData.area && formData.area.trim() && (
              <li className="border-b border-slate-800/80 pb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" />
                  Gross Built-Up Area
                </span>
                <p className="text-sm font-medium text-slate-100 pl-5">
                  {formData.area.trim()}
                </p>
              </li>
            )}

            {formData.category && formData.category.trim() && (
              <li className="border-b border-slate-800/80 pb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Sector Classification
                </span>
                <p className="text-sm font-medium text-slate-100 pl-5">
                  {formData.category.trim()}
                </p>
              </li>
            )}

            {formData.completionDate && formData.completionDate.trim() ? (
              <li className="border-b border-slate-800/80 pb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Handover / Completion
                </span>
                <p className="text-sm font-medium text-slate-100 pl-5">
                  {formData.completionDate.trim()}
                </p>
              </li>
            ) : formData.date && formData.date.trim() ? (
              <li className="border-b border-slate-800/80 pb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Project Date
                </span>
                <p className="text-sm font-medium text-slate-100 pl-5">
                  {formData.date.trim()}
                </p>
              </li>
            ) : null}

            {formData.location && formData.location.trim() && (
              <li className="border-b border-slate-800/80 pb-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Site Location
                </span>
                <p className="text-sm font-medium text-slate-100 pl-5">
                  {formData.location.trim()}
                </p>
              </li>
            )}

            {/* If all facts empty */}
            {!formData.client &&
              !formData.owner &&
              !formData.area &&
              !formData.date &&
              !formData.location && (
                <li className="py-4 text-center">
                  <p className="text-xs text-slate-500 font-mono">
                    Fill in Timeline, Location, Client, or Scale to populate the ledger.
                  </p>
                </li>
              )}
          </ul>

          {/* Operational Status Box */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Execution Stage:
            </span>
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3">
              <span className="text-xs font-mono font-bold text-slate-300">
                {isOngoing ? "Active Engineering & Execution" : "Delivered & Commissioned"}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isOngoing ? "bg-amber-500 text-black" : "bg-emerald-600 text-white"
                }`}
              >
                {isOngoing ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" /> Ongoing
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3" /> Completed
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Geo Coordinates Preview */}
          {(formData.latitude || formData.longitude) && (
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Verified Coordinates:
              </span>
              <p className="text-xs font-mono text-amber-400">
                {formData.latitude || "--"}, {formData.longitude || "--"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
