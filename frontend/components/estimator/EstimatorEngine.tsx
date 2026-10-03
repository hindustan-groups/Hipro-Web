"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Car,
  Layers,
  MapPin,
  Sparkles,
  Download,
  Share2,
  Calendar,
  ShieldCheck,
  Check,
  ChevronRight,
  HelpCircle,
  Clock,
  Coins,
  Wrench,
  Percent,
  Sliders,
  Maximize2,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import {
  CITIES,
  FLOOR_CONFIGS,
  POPULAR_PRESETS,
  TIERS,
  ADDONS_LIST,
} from "./constants";
import {
  EstimatorState,
  PackageTierId,
  FloorOption,
  BasementOption,
  PlotUnit,
  CostEstimatorCMSConfig,
} from "./types";
import { mergeEstimatorConfig } from "./configDefaults";
import {
  calculateEstimate,
  formatIndianCurrency,
  formatIndianNumber,
} from "./calculateEstimate";
import SpecificationModal from "./SpecificationModal";
import EstimatorLeadModal from "./EstimatorLeadModal";

interface EstimatorEngineProps {
  initialArea?: number;
  initialFloors?: FloorOption;
  initialTier?: PackageTierId;
  cmsConfig?: CostEstimatorCMSConfig;
}

export default function EstimatorEngine({
  initialArea = 1500,
  initialFloors = "g+1",
  initialTier = "Gold",
  cmsConfig,
}: EstimatorEngineProps) {
  const searchParams = useSearchParams();

  const activeConfig = useMemo(() => mergeEstimatorConfig(cmsConfig), [cmsConfig]);
  const activeTiers = activeConfig.tiers || TIERS;
  const activeCities = activeConfig.cities || CITIES;
  const freeLimit = activeConfig.freeCalculationsLimit ?? 2;

  // State
  const [unit, setUnit] = useState<PlotUnit>("sqft");
  const [plotArea, setPlotArea] = useState<number>(initialArea);
  const [floors, setFloors] = useState<FloorOption>(initialFloors);
  const [basement, setBasement] = useState<BasementOption>("none");
  const [parkingCars, setParkingCars] = useState<number>(1);
  const [balconies, setBalconies] = useState<number>(1);
  const [city, setCity] = useState<string>("Bhilwara");
  const [tier, setTier] = useState<PackageTierId>(initialTier);
  const [addons, setAddons] = useState({
    modularKitchen: false,
    falseCeiling: false,
    waterSumpSeptic: false,
    boundaryGate: false,
    solarRooftop: false,
  });

  // Freemium Calculation Tracking (2 Free Estimates Limit)
  const [calculationCount, setCalculationCount] = useState<number>(1);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [pendingChange, setPendingChange] = useState<(() => void) | null>(null);

  // Check if user already unlocked previously
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasCookie = document.cookie.includes("cost_estimator_unlocked=true");
    const hasPhone = localStorage.getItem("user_phone");
    if (hasCookie || hasPhone) {
      setIsUnlocked(true);
    } else {
      const stored = sessionStorage.getItem("hipro_calc_count");
      if (stored) {
        setCalculationCount(parseInt(stored, 10));
      }
    }
  }, []);

  // Sync from query parameters if present
  useEffect(() => {
    if (!searchParams) return;
    const areaParam = searchParams.get("area");
    const floorsParam = searchParams.get("floors");
    const tierParam = searchParams.get("tier");
    const cityParam = searchParams.get("city");

    if (areaParam) {
      const parsed = parseInt(areaParam, 10);
      if (!isNaN(parsed) && parsed > 0) setPlotArea(parsed);
    }
    if (floorsParam && ["g", "g+1", "g+2", "g+3", "stilt+2", "stilt+3"].includes(floorsParam)) {
      setFloors(floorsParam as FloorOption);
    }
    if (tierParam && ["Silver", "Gold", "Platinum", "Royale"].includes(tierParam)) {
      setTier(tierParam as PackageTierId);
    }
    if (cityParam && CITIES.some((c) => c.name.toLowerCase() === cityParam.toLowerCase())) {
      const matched = CITIES.find((c) => c.name.toLowerCase() === cityParam.toLowerCase());
      if (matched) setCity(matched.name);
    }
  }, [searchParams]);

  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useState<"stages" | "materials" | "milestones">("stages");
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [leadModalAction, setLeadModalAction] = useState<"pdf" | "whatsapp" | "consultation" | "limit_reached" | null>(null);

  // Display area depends on current unit
  const displayAreaValue = useMemo(() => {
    return unit === "gaj" ? Math.round(plotArea / 9) : plotArea;
  }, [plotArea, unit]);

  // Combined State Object
  const estimatorState: EstimatorState = useMemo(
    () => ({
      unit,
      plotArea,
      floors,
      basement,
      parkingCars,
      balconies,
      city,
      tier,
      addons,
    }),
    [unit, plotArea, floors, basement, parkingCars, balconies, city, tier, addons]
  );

  // Live Calculation Output
  const result = useMemo(
    () => calculateEstimate(estimatorState, activeConfig),
    [estimatorState, activeConfig]
  );

  // Gatekeeping interaction handler (Allows configured free calculations before prompting lead modal)
  const handleInteraction = (applyChange: () => void) => {
    if (isUnlocked) {
      applyChange();
      return;
    }

    if (calculationCount >= freeLimit) {
      // Free calculations limit reached! Trigger unlock lead modal
      setPendingChange(() => applyChange);
      setLeadModalAction("limit_reached");
      return;
    }

    // Within the free limit
    const nextCount = calculationCount + 1;
    setCalculationCount(nextCount);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hipro_calc_count", String(nextCount));
    }
    applyChange();
  };

  // Direct area change
  const handleAreaChange = (val: number, currentUnit: PlotUnit = unit) => {
    const numeric = Math.max(100, Math.min(20000, val || 0));
    if (currentUnit === "gaj") {
      setPlotArea(numeric * 9);
    } else {
      setPlotArea(numeric);
    }
  };

  const toggleAddon = (id: keyof typeof addons) => {
    setAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full">
      {/* Spec Comparison Modal */}
      <SpecificationModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        selectedTier={tier}
        onSelectTier={(selected) => handleInteraction(() => setTier(selected))}
      />

      {/* High-Intent Lead Capture Modal */}
      {leadModalAction && (
        <EstimatorLeadModal
          isOpen={true}
          onClose={() => {
            setLeadModalAction(null);
            setPendingChange(null);
          }}
          onSuccess={() => {
            setIsUnlocked(true);
            if (pendingChange) {
              pendingChange();
              setPendingChange(null);
            }
          }}
          actionType={leadModalAction}
          state={estimatorState}
          result={result}
          whatsappNumber={activeConfig.whatsappNumber}
          limitTitle={activeConfig.leadModal?.limitReachedTitle}
          limitSubtitle={activeConfig.leadModal?.limitReachedSubtitle}
        />
      )}

      {/* Main Grid: Left Controls (7 cols) + Right Live Dashboard (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: PARAMETER CONFIGURATOR (7 Cols)             */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* STEP 1: Plot Dimensions & Presets */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 bg-[#0F2C59] text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-tight text-slate-900">
                  Plot Area & Dimensions
                </h3>
              </div>

              {/* Unit Toggle: Sq.Ft vs Gaj */}
              <div className="flex items-center bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setUnit("sqft")}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    unit === "sqft"
                      ? "bg-white text-[#D9232A] shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sq. Ft
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("gaj")}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    unit === "gaj"
                      ? "bg-white text-[#D9232A] shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Gaj (Sq. Yards)
                </button>
              </div>
            </div>

            {/* Rajasthan Popular Plot Presets */}
            <div className="mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Popular Rajasthan Plot Sizes (Click to quick-select)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POPULAR_PRESETS.map((preset) => {
                  const isSelected =
                    Math.abs(plotArea - preset.sqft) < 10;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleInteraction(() => setPlotArea(preset.sqft))}
                      className={`p-2.5 text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#D9232A] bg-red-50/40 text-slate-900 shadow-xs"
                          : "border-slate-200 bg-slate-50/60 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">{preset.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D9232A]" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{preset.dim}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area Slider & Direct Number Input */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Custom Plot Area ({unit === "gaj" ? "Gaj" : "Sq. Ft."}):
                </label>
                <div className="flex items-center border border-slate-300 bg-white">
                  <input
                    type="number"
                    aria-label="Custom Plot Area"
                    min={unit === "gaj" ? 30 : 250}
                    max={unit === "gaj" ? 2200 : 20000}
                    value={displayAreaValue}
                    onChange={(e) =>
                      handleInteraction(() =>
                        handleAreaChange(parseInt(e.target.value, 10) || 0)
                      )
                    }
                    className="w-24 px-3 py-2 text-right font-bold text-slate-900 text-sm focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-slate-50 text-slate-500 text-xs font-semibold border-l border-slate-200">
                    {unit === "gaj" ? "Gaj" : "sqft"}
                  </span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                aria-label="Adjust Plot Area Slider"
                min={unit === "gaj" ? 50 : 450}
                max={unit === "gaj" ? 1000 : 9000}
                step={unit === "gaj" ? 5 : 50}
                value={displayAreaValue}
                onChange={(e) =>
                  handleInteraction(() =>
                    handleAreaChange(parseInt(e.target.value, 10) || 0)
                  )
                }
                className="w-full accent-[#D9232A] cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />

              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>{unit === "gaj" ? "50 Gaj (~450 sqft)" : "450 sqft (50 Gaj)"}</span>
                <span>{unit === "gaj" ? "500 Gaj (~4,500 sqft)" : "4,500 sqft (500 Gaj)"}</span>
                <span>{unit === "gaj" ? "1,000+ Gaj" : "9,000+ sqft"}</span>
              </div>
            </div>
          </div>

          {/* STEP 2: Floors & Space Configuration */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <span className="w-7 h-7 bg-[#0F2C59] text-white flex items-center justify-center text-xs font-black">
                2
              </span>
              <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-tight text-slate-900">
                Number of Floors & Structure
              </h3>
            </div>

            {/* Floor Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {FLOOR_CONFIGS.map((cfg) => {
                const isSelected = floors === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => handleInteraction(() => setFloors(cfg.id))}
                    className={`p-3 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#D9232A] bg-red-50/40 text-slate-900 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold">{cfg.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#D9232A]" />}
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      {cfg.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Basement, Parking & Balcony Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              {/* Basement Option */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Basement Floor
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 border border-slate-200">
                  {(["none", "half", "full"] as BasementOption[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleInteraction(() => setBasement(opt))}
                      className={`py-1.5 text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        basement === opt
                          ? "bg-white text-[#D9232A] shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {opt === "none" ? "None" : opt === "half" ? "Half" : "Full"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Covered Parking */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Covered Car Parking
                </label>
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 border border-slate-200">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleInteraction(() => setParkingCars(num))}
                      className={`py-1.5 text-center text-xs font-bold transition-all cursor-pointer ${
                        parkingCars === num
                          ? "bg-white text-[#D9232A] shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {num === 0 ? "0" : `${num}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Balconies */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Balconies & Sit-outs
                </label>
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 border border-slate-200">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleInteraction(() => setBalconies(num))}
                      className={`py-1.5 text-center text-xs font-bold transition-all cursor-pointer ${
                        balconies === num
                          ? "bg-white text-[#D9232A] shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {num === 0 ? "0" : `${num}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: City & Site Location */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 bg-[#0F2C59] text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-tight text-slate-900">
                  Project Location (Rajasthan)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Local Index: <strong>{result.cityMultiplier}×</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {activeCities.map((c) => {
                const isSelected = city === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleInteraction(() => setCity(c.name))}
                    className={`p-3 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#D9232A] bg-red-50/40 text-slate-900 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">{c.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D9232A]" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {c.tag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Package Tier Selection */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 bg-[#0F2C59] text-white flex items-center justify-center text-xs font-black">
                  4
                </span>
                <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-tight text-slate-900">
                  Construction Quality Package
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsSpecModalOpen(true)}
                className="text-xs font-bold text-[#D9232A] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <span>Compare Specs Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Package Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["Silver", "Gold", "Platinum", "Royale"] as PackageTierId[]).map((tierId) => {
                const t = activeTiers[tierId] || TIERS[tierId];
                const isSelected = tier === tierId;
                return (
                  <div
                    key={tierId}
                    onClick={() => handleInteraction(() => setTier(tierId))}
                    className={`p-5 border transition-all relative cursor-pointer ${
                      isSelected
                        ? "border-[#D9232A] ring-2 ring-[#D9232A]/20 bg-red-50/30 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {t.popular && (
                      <span className="absolute -top-3 right-4 bg-[#D9232A] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 shadow-xs">
                        Most Popular
                      </span>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-base font-bold text-slate-900 font-display">
                          {t.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {t.subtitle}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-[#D9232A]">
                          ₹{t.rate.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          per sq.ft
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                      {t.tagline}
                    </p>

                    {/* Highlights bullet list */}
                    <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate"><strong>Steel:</strong> {t.specs.steel.split("(")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate"><strong>Cement:</strong> {t.specs.cement.split("(")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate"><strong>Warranty:</strong> {t.specs.warranty}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 5: Optional Add-on Upgrades */}
          <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 bg-[#0F2C59] text-white flex items-center justify-center text-xs font-black">
                  5
                </span>
                <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-tight text-slate-900">
                  Optional Turnkey Add-ons
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {Object.values(addons).filter(Boolean).length} Selected
              </span>
            </div>

            <div className="space-y-3">
              {ADDONS_LIST.map((addon) => {
                const isChecked = addons[addon.id];
                const customAddon = activeConfig.addons?.[addon.id];
                const displayTitle = customAddon?.title || addon.title;
                const displaySubtitle = customAddon?.subtitle || addon.subtitle;
                const customCost = (customAddon as any)?.cost ?? addon.baseCost;
                const customRate = (customAddon as any)?.perSqftRate ?? addon.perSqftRate;
                const costDisplay = customCost
                  ? formatIndianCurrency(customCost)
                  : `₹${customRate}/sqft`;

                return (
                  <div
                    key={addon.id}
                    onClick={() => handleInteraction(() => toggleAddon(addon.id))}
                    className={`p-4 border transition-all flex items-start gap-3.5 cursor-pointer ${
                      isChecked
                        ? "border-[#D9232A] bg-red-50/20 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="pt-0.5">
                      <div
                        className={`w-5 h-5 flex items-center justify-center border transition-all ${
                          isChecked
                            ? "bg-[#D9232A] border-[#D9232A] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {addon.title}
                        </span>
                        <span className="text-xs font-bold text-[#0F2C59]">
                          +{costDisplay}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {addon.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: LIVE CALCULATION DASHBOARD (5 Cols)        */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          
          {/* Main Price Box */}
          <div className="bg-[#0F2C59] text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D9232A] bg-white px-2 py-0.5">
                Instant Estimate · Live
              </span>
              
              {!isUnlocked ? (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>
                    {calculationCount >= freeLimit
                      ? `${freeLimit}/${freeLimit} Free Used`
                      : `Free Calc ${calculationCount}/${freeLimit}`}
                  </span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/20 border border-emerald-400/30 px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  <span>Unlimited Unlocked</span>
                </span>
              )}
            </div>

            <div className="text-xs uppercase tracking-wider text-slate-300 mb-1">
              Estimated Total Construction Cost
            </div>

            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white tracking-tight">
              {formatIndianCurrency(result.totalCost)}
            </div>

            <div className="text-xs text-slate-300 mt-1 mb-6 flex items-center gap-1.5">
              <span>Indicative Budget Range:</span>
              <strong className="text-white">
                {formatIndianCurrency(result.costMin)} – {formatIndianCurrency(result.costMax)}
              </strong>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-white/5 border border-white/10 text-xs mb-6">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Built-Up Area</span>
                <strong className="text-white text-sm">{formatIndianNumber(result.builtUpArea)} sq.ft</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected Package</span>
                <strong className="text-white text-sm">{tier} (₹{result.baseRatePerSqft}/sqft)</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Effective Rate</span>
                <strong className="text-white text-sm">₹{result.effectiveRatePerSqft} / sq.ft</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Construction Timeline</span>
                <strong className="text-white text-sm">{result.timelineMonths}</strong>
              </div>
            </div>

            {/* High-Impact Action Triggers */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setLeadModalAction("pdf")}
                className="w-full py-4 bg-[#D9232A] hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs sm:text-sm transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Itemized BOQ (PDF)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLeadModalAction("whatsapp")}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp Quote</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadModalAction("consultation")}
                  className="py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Free Site Visit</span>
                </button>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-300">
              <div>
                <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                <span>10-Yr Structural Guarantee</span>
              </div>
              <div>
                <Coins className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                <span>Zero Cost Overrun Policy</span>
              </div>
              <div>
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <span>Escrow Stage Payments</span>
              </div>
            </div>
          </div>

          {/* Interactive Breakdown Tabs */}
          <div className="bg-white border border-slate-200 p-6 shadow-xs">
            {/* Tabs Selector */}
            <div className="flex border-b border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab("stages")}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                  activeTab === "stages"
                    ? "border-[#D9232A] text-[#D9232A]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Stage Costs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("materials")}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                  activeTab === "materials"
                    ? "border-[#D9232A] text-[#D9232A]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Materials BOM
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("milestones")}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                  activeTab === "milestones"
                    ? "border-[#D9232A] text-[#D9232A]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Safe Milestones
              </button>
            </div>

            {/* TAB 1: Stage Breakdown */}
            {activeTab === "stages" && (
              <div className="space-y-3.5">
                <div className="text-[11px] text-slate-500 mb-3">
                  Civil and architectural cost distributed by engineering stages:
                </div>
                {result.stages.map((st) => (
                  <div key={st.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{st.name}</span>
                      <span className="font-bold text-[#0F2C59]">
                        {formatIndianCurrency(st.amount)}{" "}
                        <span className="text-slate-400 font-normal">({st.percentage}%)</span>
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0F2C59] h-full rounded-full transition-all duration-500"
                        style={{ width: `${st.percentage * 3.5}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {st.description}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Materials BOM */}
            {activeTab === "materials" && (
              <div className="space-y-4">
                <div className="text-[11px] text-slate-500">
                  Approximate raw material consumption for {formatIndianNumber(result.builtUpArea)} sq.ft built-up area:
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Cement Bags</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ~{formatIndianNumber(result.materials.cementBags)}
                    </div>
                    <div className="text-[10px] text-slate-400">UltraTech / Ambuja Grade 53</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Steel Rebar (TMT)</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ~{result.materials.steelTonnes} MT
                    </div>
                    <div className="text-[10px] text-slate-400">Tata Tiscon / Jindal Fe550D</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Bricks / Blocks</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ~{formatIndianNumber(result.materials.bricksCount)}
                    </div>
                    <div className="text-[10px] text-slate-400">Class-I Clay / AAC Units</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Coarse Sand</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ~{formatIndianNumber(result.materials.sandCuFt)} cft
                    </div>
                    <div className="text-[10px] text-slate-400">Double-washed Zone-II</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Gravel / Aggregate</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ~{formatIndianNumber(result.materials.aggregateCuFt)} cft
                    </div>
                    <div className="text-[10px] text-slate-400">10mm & 20mm Granite</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Paint & Primers</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ~{formatIndianNumber(result.materials.paintLiters)} Ltr
                    </div>
                    <div className="text-[10px] text-slate-400">Asian Paints Royale/Apex</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Safe Payment Milestones */}
            {activeTab === "milestones" && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-500 mb-2">
                  100% Escrow-style safety: You only pay as each physical stage is certified on site.
                </div>
                {result.paymentMilestones.map((m, idx) => (
                  <div
                    key={m.milestone}
                    className="p-2.5 border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800">{m.milestone}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {m.stage}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#0F2C59]">{formatIndianCurrency(m.amount)}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{m.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Sticky Bar (Only visible on screens < lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F2C59] text-white px-4 py-3 border-t border-white/20 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider truncate">
            {tier} · {formatIndianNumber(result.builtUpArea)} sq.ft
          </div>
          <div className="text-xl font-black text-white font-display">
            {formatIndianCurrency(result.totalCost)}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setLeadModalAction("pdf")}
            className="px-4 py-2.5 bg-[#D9232A] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>BOQ PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setLeadModalAction("whatsapp")}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md cursor-pointer"
            aria-label="Share on WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
