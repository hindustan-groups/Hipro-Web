"use client";

import React, { useState } from "react";
import { MapPin, Globe, Calendar, Building, User, Ruler, Wrench, Plus, X, Tag } from "lucide-react";

interface ProjectSpecificationsTabProps {
  formData: {
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
  };
  onChange: (fields: Partial<ProjectSpecificationsTabProps["formData"]>) => void;
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

  return (
    <div className="space-y-6">
      {/* Client, Owner & Scale */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-construction-navy" /> Client & Scale Specifications
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Key stakeholder and scale metrics. All optional fields remain empty unless verified.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Client Name
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => onChange({ client: e.target.value })}
              placeholder="e.g. Sangam Group Ltd"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Owner / Developer
            </label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => onChange({ owner: e.target.value })}
              placeholder="e.g. Hindustan Projects Infra Pvt Ltd"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Built-up Area / Scale
            </label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => onChange({ area: e.target.value })}
              placeholder="e.g. 120,000 sq.ft / 4.5 Acres"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>
        </div>
      </div>

      {/* Services Involved */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-construction-navy" /> Engineering & Construction Services
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Select or add services executed on this project for AEO & service cross-linking.
        </p>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onKeyDown={handleServiceKeyDown}
              placeholder="Type custom service and press Enter..."
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
            <button
              type="button"
              onClick={() => handleAddService(serviceInput)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Service
            </button>
          </div>

          {/* Quick Select Pill Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-xs text-slate-400 py-0.5">Suggestions:</span>
            {COMMON_SERVICES.map((s) => {
              const active = formData.services.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => (active ? handleRemoveService(s) : handleAddService(s))}
                  className={`text-xs px-2.5 py-0.5 border rounded-none transition-colors ${
                    active
                      ? "bg-blue-600 text-white border-blue-600 font-medium"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {active ? `✓ ${s}` : `+ ${s}`}
                </button>
              );
            })}
          </div>

          {/* Active Tag Pills */}
          {formData.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {formData.services.map((svc) => (
                <span
                  key={svc}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-construction-navy text-xs font-semibold"
                >
                  <Tag className="w-3 h-3 text-blue-600" />
                  {svc}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(svc)}
                    className="text-slate-400 hover:text-red-600 transition-colors ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dates & Timeline */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-construction-navy" /> Project Timeline
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Timeline representation displayed in project header and meta summaries.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Project Date / Timeline Display <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.date}
              onChange={(e) => onChange({ date: e.target.value })}
              placeholder="e.g. 2024 - 2025 or June 2024"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
            <p className="text-[11px] text-slate-500">
              Legacy and display string used on project cards and filters.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Official Completion Date (Optional)
            </label>
            <input
              type="text"
              value={formData.completionDate}
              onChange={(e) => onChange({ completionDate: e.target.value })}
              placeholder="e.g. March 2025"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
            <p className="text-[11px] text-slate-500">
              Structured date string for Schema.org and AEO facts.
            </p>
          </div>
        </div>
      </div>

      {/* Geographic Data (Zero Defaults) */}
      <div className="pt-4 border-t border-slate-100">
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-construction-navy" /> Location & Geographic Precision
          </h4>
          <p className="text-xs text-slate-500">
            Enter verified geographic details. Zero defaults applied — enter only what is verified.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              General Location Display <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. RIICO Industrial Area, Bhilwara"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="e.g. Bhilwara"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              District
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => onChange({ district: e.target.value })}
              placeholder="e.g. Bhilwara"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => onChange({ state: e.target.value })}
              placeholder="e.g. Rajasthan"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="e.g. India"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Postal Code (PIN)
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => onChange({ postalCode: e.target.value })}
              placeholder="e.g. 311001"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Target Local Area
            </label>
            <input
              type="text"
              value={formData.targetLocation}
              onChange={(e) => onChange({ targetLocation: e.target.value })}
              placeholder="e.g. Growth Centre Extension"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              GPS Latitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.latitude ?? ""}
              onChange={(e) => onChange({ latitude: e.target.value })}
              placeholder="e.g. 25.3463"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              GPS Longitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.longitude ?? ""}
              onChange={(e) => onChange({ longitude: e.target.value })}
              placeholder="e.g. 74.6364"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Google Maps URL
            </label>
            <input
              type="url"
              value={formData.googleMapsUrl}
              onChange={(e) => onChange({ googleMapsUrl: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
