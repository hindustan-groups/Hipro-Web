"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Save,
  RotateCcw,
  ExternalLink,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  MapPin,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  Wrench,
  TrendingUp,
  Coins,
  FileText,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import type { CostEstimatorCMSConfig, PackageTierId, CityOption } from "@/components/estimator/types";
import {
  DEFAULT_ESTIMATOR_CMS_CONFIG,
  mergeEstimatorConfig,
} from "@/components/estimator/configDefaults";
import { TIERS } from "@/components/estimator/constants";

export default function AdminCostEstimatorCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  const [activeTab, setActiveTab] = useState<"general" | "packages" | "cities" | "addons">("general");
  const [selectedTierTab, setSelectedTierTab] = useState<PackageTierId>("Gold");

  // Config State
  const [config, setConfig] = useState<CostEstimatorCMSConfig>(DEFAULT_ESTIMATOR_CMS_CONFIG);
  const [rawPageContent, setRawPageContent] = useState<any>({});

  // New city form inputs
  const [newCityName, setNewCityName] = useState("");
  const [newCityMultiplier, setNewCityMultiplier] = useState("1.00");
  const [newCityTag, setNewCityTag] = useState("");

  // Load from /api/settings
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          let pc: any = {};
          try {
            pc = data.data.pageContent
              ? typeof data.data.pageContent === "string"
                ? JSON.parse(data.data.pageContent)
                : data.data.pageContent
              : {};
          } catch {
            pc = {};
          }
          setRawPageContent(pc);

          if (pc.costEstimator) {
            setConfig(mergeEstimatorConfig(pc.costEstimator));
          } else {
            setConfig(DEFAULT_ESTIMATOR_CMS_CONFIG);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setConfig(DEFAULT_ESTIMATOR_CMS_CONFIG);
        setLoading(false);
      });
  }, []);

  // Save changes to /api/settings
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: "", type: "" });

    try {
      const updatedPageContent = {
        ...rawPageContent,
        costEstimator: config,
      };

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageContent: JSON.stringify(updatedPageContent),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRawPageContent(updatedPageContent);
        // Trigger instant Next.js revalidation
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/cost-estimator"], tags: ["settings"] }),
          });
        } catch {
          // ignore
        }

        setStatusMessage({
          text: "Cost Estimator rates and CMS settings successfully saved! Live site updated.",
          type: "success",
        });
      } else {
        setStatusMessage({
          text: json.error || "Failed to save settings. Please try again.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "Network error while saving settings.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to Engineering Defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all rates, packages, and city multipliers to official Rajasthan engineering defaults?"
      )
    ) {
      setConfig({ ...DEFAULT_ESTIMATOR_CMS_CONFIG });
      setStatusMessage({
        text: "Reset to engineering defaults in editor. Click 'Save All Changes' to apply to live site.",
        type: "success",
      });
    }
  };

  // Tier helper updates
  const handleTierChange = (
    tierId: PackageTierId,
    field: string,
    value: any
  ) => {
    setConfig((prev) => ({
      ...prev,
      tiers: {
        ...prev.tiers!,
        [tierId]: {
          ...prev.tiers![tierId],
          [field]: value,
        },
      },
    }));
  };

  const handleTierSpecChange = (
    tierId: PackageTierId,
    specKey: string,
    value: string
  ) => {
    setConfig((prev) => ({
      ...prev,
      tiers: {
        ...prev.tiers!,
        [tierId]: {
          ...prev.tiers![tierId],
          specs: {
            ...prev.tiers![tierId].specs,
            [specKey]: value,
          },
        },
      },
    }));
  };

  // City handlers
  const handleCityMultiplierChange = (cityName: string, newMult: number) => {
    setConfig((prev) => ({
      ...prev,
      cities: prev.cities!.map((c) =>
        c.name === cityName ? { ...c, multiplier: Math.max(0.5, Math.min(2.5, newMult)) } : c
      ),
    }));
  };

  const handleCityTagChange = (cityName: string, newTag: string) => {
    setConfig((prev) => ({
      ...prev,
      cities: prev.cities!.map((c) => (c.name === cityName ? { ...c, tag: newTag } : c)),
    }));
  };

  const handleDeleteCity = (cityName: string) => {
    if (config.cities!.length <= 1) {
      alert("At least one city must remain configured.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      cities: prev.cities!.filter((c) => c.name !== cityName),
    }));
  };

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCityName.trim();
    if (!trimmed) return;
    if (config.cities!.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("This city already exists.");
      return;
    }

    const mult = parseFloat(newCityMultiplier) || 1.0;
    const newCity: CityOption = {
      name: trimmed,
      multiplier: mult,
      tag: newCityTag.trim() || "Regional Site Logistics",
    };

    setConfig((prev) => ({
      ...prev,
      cities: [...prev.cities!, newCity],
    }));

    setNewCityName("");
    setNewCityMultiplier("1.00");
    setNewCityTag("");
  };

  // Addon handler
  const handleAddonChange = (
    addonKey: keyof NonNullable<CostEstimatorCMSConfig["addons"]>,
    field: string,
    value: any
  ) => {
    setConfig((prev) => ({
      ...prev,
      addons: {
        ...prev.addons!,
        [addonKey]: {
          ...prev.addons![addonKey],
          [field]: value,
        },
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-[#0F2C59] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Loading Cost Estimator CMS...</p>
      </div>
    );
  }

  const currentTier = config.tiers?.[selectedTierTab] || TIERS[selectedTierTab];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner / Actions */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-8 h-8 bg-[#0F2C59] text-white flex items-center justify-center rounded-none font-bold">
              <Calculator className="w-4 h-4 text-white" />
            </span>
            <h1 className="text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
              Cost Estimator CMS & Pricing Engine
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live /cost-estimator
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Manage ₹/sq.ft construction rates, package tiers (Silver, Gold, Platinum, Royale),
            Rajasthan city multipliers, turnkey add-ons, and free calculations limit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/cost-estimator"
            target="_blank"
            className="px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </Link>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#D9232A] hover:bg-red-700 active:scale-95 flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer transition-all"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage.text && (
        <div
          className={`p-4 border flex items-center justify-between gap-3 text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage({ text: "", type: "" })}
            className="text-xs uppercase font-bold tracking-wider hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white">
        {[
          { id: "general" as const, label: "1. General & Lead Capture", icon: ShieldCheck },
          { id: "packages" as const, label: "2. Package Rates & Specs", icon: Layers },
          { id: "cities" as const, label: "3. Rajasthan Cities (Logistics)", icon: MapPin },
          { id: "addons" as const, label: "4. Turnkey Add-ons", icon: Wrench },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 px-4 text-center font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isActive
                  ? "border-[#D9232A] text-[#D9232A] bg-red-50/20"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: General & Lead Gate Settings */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold font-display uppercase tracking-tight text-slate-900">
                Freemium Gate & Lead Generation Controls
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure how many calculations users can perform for free before the lead capture modal unlocks unlimited access.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free calculations limit */}
              <div className="p-4 bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                  Free Calculations Limit (Before Lead Gate)
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={config.freeCalculationsLimit ?? 2}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        freeCalculationsLimit: Math.max(0, parseInt(e.target.value, 10) || 0),
                      }))
                    }
                    className="w-24 px-3 py-2 border border-slate-300 font-bold text-slate-900 text-center text-lg focus:outline-none focus:border-[#D9232A]"
                  />
                  <div className="text-xs text-slate-500">
                    <strong>Default: 2 free calculations.</strong> Set to <strong>2</strong> to let user test 2 plot sizes/packages before prompting WhatsApp lead unlock.
                  </div>
                </div>
              </div>

              {/* WhatsApp routing number */}
              <div className="p-4 bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                  WhatsApp Inquiries & Quote Routing Number
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300">
                    +91
                  </span>
                  <input
                    type="text"
                    value={config.whatsappNumber || "7597000601"}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                    }
                    placeholder="7597000601"
                    className="flex-1 px-3 py-2 border border-slate-300 font-bold text-slate-900 text-sm focus:outline-none focus:border-[#D9232A]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Clients clicking &quot;WhatsApp Quote&quot; or requesting BOQs are directed to this number.
                </p>
              </div>
            </div>

            {/* Hero Section Copy */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Hero Banner Headlines & Description
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Hero Eyebrow / Badge Text
                  </label>
                  <input
                    type="text"
                    value={config.heroBadge || ""}
                    onChange={(e) => setConfig((prev) => ({ ...prev, heroBadge: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D9232A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Main Title (Prefix)
                  </label>
                  <input
                    type="text"
                    value={config.heroTitle || ""}
                    onChange={(e) => setConfig((prev) => ({ ...prev, heroTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D9232A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Title Accent (Red Text)
                  </label>
                  <input
                    type="text"
                    value={config.heroAccent || ""}
                    onChange={(e) => setConfig((prev) => ({ ...prev, heroAccent: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D9232A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Hero Subtitle / Description Paragraph
                </label>
                <textarea
                  rows={2}
                  value={config.heroDescription || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, heroDescription: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D9232A]"
                />
              </div>
            </div>

            {/* Lead Modal Copy */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Lead Gate Modal Notice Copy (When 2 Calcs Reached)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Modal Headline
                  </label>
                  <input
                    type="text"
                    value={config.leadModal?.limitReachedTitle || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        leadModal: { ...prev.leadModal, limitReachedTitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D9232A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Modal Description
                  </label>
                  <input
                    type="text"
                    value={config.leadModal?.limitReachedSubtitle || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        leadModal: { ...prev.leadModal, limitReachedSubtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D9232A]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Construction Packages & Rates */}
      {activeTab === "packages" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 md:p-8">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-base font-bold font-display uppercase tracking-tight text-slate-900">
                Package Pricing & Material Specifications (₹/sq.ft)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set base rates per square foot and brand specifications for each tier. These directly calculate the live estimate and generate the engineering BOQ.
              </p>
            </div>

            {/* Package Sub-tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
              {(["Silver", "Gold", "Platinum", "Royale"] as PackageTierId[]).map((tierId) => {
                const t = config.tiers?.[tierId] || TIERS[tierId];
                const isSelected = selectedTierTab === tierId;
                return (
                  <button
                    key={tierId}
                    type="button"
                    onClick={() => setSelectedTierTab(tierId)}
                    className={`p-3.5 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#D9232A] bg-red-50/30 ring-2 ring-[#D9232A]/20 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                      {t.popular && (
                        <span className="px-1.5 py-0.5 bg-[#D9232A] text-white text-[9px] font-black uppercase">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-black text-[#D9232A]">
                      ₹{t.rate.toLocaleString("en-IN")}{" "}
                      <span className="text-[10px] text-slate-400 font-normal">/ sqft</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Tier Editor Form */}
            <div className="space-y-6 border-t border-slate-100 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Package Display Name
                  </label>
                  <input
                    type="text"
                    value={currentTier.name}
                    onChange={(e) => handleTierChange(selectedTierTab, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#D9232A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Base Rate (₹ per Sq. Ft)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={currentTier.rate}
                      onChange={(e) =>
                        handleTierChange(
                          selectedTierTab,
                          "rate",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 text-sm font-black text-[#D9232A] focus:outline-none focus:border-[#D9232A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Subtitle / Badge
                  </label>
                  <input
                    type="text"
                    value={currentTier.subtitle}
                    onChange={(e) => handleTierChange(selectedTierTab, "subtitle", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#D9232A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tagline / Description
                  </label>
                  <input
                    type="text"
                    value={currentTier.tagline}
                    onChange={(e) => handleTierChange(selectedTierTab, "tagline", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#D9232A]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 sm:pt-0">
                  <input
                    type="checkbox"
                    id="isPopularCheck"
                    checked={currentTier.popular}
                    onChange={(e) =>
                      handleTierChange(selectedTierTab, "popular", e.target.checked)
                    }
                    className="w-4 h-4 accent-[#D9232A]"
                  />
                  <label
                    htmlFor="isPopularCheck"
                    className="text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
                  >
                    Highlight with &quot;Most Popular&quot; Ribbon
                  </label>
                </div>
              </div>

              {/* Detailed Technical Specs Matrix */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Technical Brand Specifications for {selectedTierTab}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "steel", label: "Structural Steel (TMT)" },
                    { key: "cement", label: "Structural Cement (Grade & Brand)" },
                    { key: "masonry", label: "Brick Masonry & Blockwork" },
                    { key: "flooring", label: "Flooring & Tiles Brand / Size" },
                    { key: "bathroom", label: "Sanitaryware & Bath Fittings" },
                    { key: "electrical", label: "Electrical Conduit, Wires & Switches" },
                    { key: "doors", label: "Doors & Hardware Specifications" },
                    { key: "windows", label: "Windows & Glazing Profile" },
                    { key: "paint", label: "Interior & Exterior Paints" },
                    { key: "elevation", label: "Exterior Elevation & 3D Features" },
                    { key: "ceilingHeight", label: "Clear Ceiling Height" },
                    { key: "warranty", label: "Official Warranty Period" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={(currentTier.specs as any)[field.key] || ""}
                        onChange={(e) =>
                          handleTierSpecChange(selectedTierTab, field.key, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#D9232A]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Rajasthan City Multipliers */}
      {activeTab === "cities" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 md:p-8">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-base font-bold font-display uppercase tracking-tight text-slate-900">
                Rajasthan Cities & Material Logistics Multipliers
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust regional multipliers to reflect local aggregate, sand transport, and labor indices across Rajasthan districts.
                Bhilwara is 1.00 (Headquarters base).
              </p>
            </div>

            {/* City Table */}
            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F2C59] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">City / District</th>
                    <th className="p-3">Cost Multiplier</th>
                    <th className="p-3">Variance</th>
                    <th className="p-3">Logistics / Hub Tag</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  {config.cities!.map((c) => {
                    const variancePct = Math.round((c.multiplier - 1.0) * 100);
                    return (
                      <tr key={c.name} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 text-sm">
                          {c.name}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 w-32">
                            <input
                              type="number"
                              step="0.01"
                              min="0.80"
                              max="1.50"
                              value={c.multiplier}
                              onChange={(e) =>
                                handleCityMultiplierChange(
                                  c.name,
                                  parseFloat(e.target.value) || 1.0
                                )
                              }
                              className="w-20 px-2 py-1 border border-slate-300 text-xs font-bold text-slate-900 text-right focus:outline-none focus:border-[#D9232A]"
                            />
                            <span className="text-slate-400 font-bold">×</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-none ${
                              variancePct === 0
                                ? "bg-slate-100 text-slate-700"
                                : variancePct > 0
                                ? "bg-red-50 text-red-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {variancePct === 0
                              ? "Baseline (0%)"
                              : variancePct > 0
                              ? `+${variancePct}%`
                              : `${variancePct}%`}
                          </span>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={c.tag}
                            onChange={(e) => handleCityTagChange(c.name, e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-[#D9232A]"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteCity(c.name)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            title="Delete City"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add New City Form */}
            <form
              onSubmit={handleAddCity}
              className="mt-6 p-4 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-end gap-3"
            >
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  City Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bikaner"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#D9232A]"
                />
              </div>

              <div className="w-full sm:w-32">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Multiplier
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.80"
                  max="1.50"
                  value={newCityMultiplier}
                  onChange={(e) => setNewCityMultiplier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-bold text-slate-900 bg-white text-right focus:outline-none focus:border-[#D9232A]"
                />
              </div>

              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Logistics Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Northern Desert Corridor"
                  value={newCityTag}
                  onChange={(e) => setNewCityTag(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#D9232A]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-[#0F2C59] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shrink-0 h-[38px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add City</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: Turnkey Add-ons */}
      {activeTab === "addons" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 md:p-8">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-base font-bold font-display uppercase tracking-tight text-slate-900">
                Optional Turnkey Add-on Upgrades
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set fixed lump-sum costs or per-sq.ft rates for specialized civil & architectural additions.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "modularKitchen" as const,
                  label: "Modular Kitchen",
                  rateType: "fixed",
                  costKey: "cost",
                },
                {
                  id: "falseCeiling" as const,
                  label: "Designer False Ceiling",
                  rateType: "sqft",
                  costKey: "perSqftRate",
                },
                {
                  id: "waterSumpSeptic" as const,
                  label: "RCC Underground Sump & Septic",
                  rateType: "fixed",
                  costKey: "cost",
                },
                {
                  id: "boundaryGate" as const,
                  label: "Boundary Wall & Gate",
                  rateType: "fixed",
                  costKey: "cost",
                },
                {
                  id: "solarRooftop" as const,
                  label: "On-Grid Solar Rooftop Plant",
                  rateType: "fixed",
                  costKey: "cost",
                },
              ].map((addon) => {
                const item = (config.addons as any)?.[addon.id] || {};
                return (
                  <div
                    key={addon.id}
                    className="p-5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                          {addon.label} — Title
                        </label>
                        <input
                          type="text"
                          value={item.title || ""}
                          onChange={(e) =>
                            handleAddonChange(addon.id, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#D9232A]"
                        />
                      </div>

                      <div className="w-full sm:w-48">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                          {addon.rateType === "fixed" ? "Fixed Cost (₹)" : "Rate (₹ / sq.ft)"}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={item[addon.costKey] || 0}
                            onChange={(e) =>
                              handleAddonChange(
                                addon.id,
                                addon.costKey,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-full pl-7 pr-3 py-2 border border-slate-300 text-xs font-black text-[#D9232A] bg-white focus:outline-none focus:border-[#D9232A]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Subtitle / Specifications Summary
                      </label>
                      <input
                        type="text"
                        value={item.subtitle || ""}
                        onChange={(e) =>
                          handleAddonChange(addon.id, "subtitle", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#D9232A]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar when scrolled */}
      <div className="sticky bottom-4 z-40 bg-[#0F2C59] text-white p-4 shadow-xl border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Cost Estimator Pricing & Specifications Engine</span>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="px-6 py-2.5 bg-[#D9232A] hover:bg-red-700 active:scale-95 text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all"
        >
          {saving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save All Changes</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
