"use client";

import { X, Check, ShieldCheck } from "lucide-react";
import { TIERS } from "./constants";
import { PackageTierId } from "./types";

interface SpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: PackageTierId;
  onSelectTier: (tier: PackageTierId) => void;
}

export default function SpecificationModal({
  isOpen,
  onClose,
  selectedTier,
  onSelectTier,
}: SpecificationModalProps) {
  if (!isOpen) return null;

  const tiersList: PackageTierId[] = ["Silver", "Gold", "Platinum", "Royale"];

  const specCategories = [
    { label: "Steel / TMT Rebar", key: "steel" as const },
    { label: "Structural Cement", key: "cement" as const },
    { label: "Masonry & Plaster", key: "masonry" as const },
    { label: "Flooring & Tiles", key: "flooring" as const },
    { label: "Bathroom & Sanitary", key: "bathroom" as const },
    { label: "Electrical & Switches", key: "electrical" as const },
    { label: "Doors & Frames", key: "doors" as const },
    { label: "Windows & Glazing", key: "windows" as const },
    { label: "Painting & Putty", key: "paint" as const },
    { label: "Exterior Elevation", key: "elevation" as const },
    { label: "Floor-to-Ceiling Height", key: "ceilingHeight" as const },
    { label: "Warranty & Support", key: "warranty" as const },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-6xl max-h-[90vh] rounded-none shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F2C59] text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#D9232A] text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                Side-by-Side Matrix
              </span>
              <span className="text-slate-300 text-xs font-medium">Hindustan Projects Verified Packages</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white">
              Package Specifications & Material Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable comparison table */}
        <div className="overflow-x-auto overflow-y-auto p-4 sm:p-6">
          <table className="w-full border-collapse text-left min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3 bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider w-1/5 sticky left-0 z-10 border-r border-slate-200">
                  Feature / Material
                </th>
                {tiersList.map((tierId) => {
                  const t = TIERS[tierId];
                  const isCurrent = selectedTier === tierId;
                  return (
                    <th
                      key={tierId}
                      className={`p-4 text-center w-1/5 border-r border-slate-200 last:border-r-0 transition-colors ${
                        isCurrent ? "bg-red-50/60" : "bg-white"
                      }`}
                    >
                      {t.popular && (
                        <span className="inline-block bg-[#D9232A] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mb-1.5">
                          Most Popular
                        </span>
                      )}
                      <div className="text-lg font-bold text-slate-900 font-display">{t.name}</div>
                      <div className="text-2xl font-extrabold text-[#D9232A] my-1">
                        ₹{t.rate.toLocaleString("en-IN")}<span className="text-xs text-slate-500 font-normal">/sqft</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTier(tierId);
                          onClose();
                        }}
                        className={`mt-2 w-full py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-[#0F2C59] text-white shadow-sm"
                            : "border border-slate-300 text-slate-700 hover:border-[#D9232A] hover:text-[#D9232A]"
                        }`}
                      >
                        {isCurrent ? "Selected Tier" : `Choose ${t.name}`}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {specCategories.map((cat, idx) => (
                <tr
                  key={cat.key}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                >
                  <td className="p-3 text-xs font-bold text-slate-800 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                    {cat.label}
                  </td>
                  {tiersList.map((tierId) => {
                    const t = TIERS[tierId];
                    const val = t.specs[cat.key];
                    const isCurrent = selectedTier === tierId;
                    return (
                      <td
                        key={tierId}
                        className={`p-3 text-xs text-slate-600 border-r border-slate-200 last:border-r-0 leading-relaxed ${
                          isCurrent ? "bg-red-50/20 font-medium text-slate-900" : ""
                        }`}
                      >
                        {cat.key === "warranty" ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{val}</span>
                          </div>
                        ) : (
                          val
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All packages include certified structural design, soil testing, and 140+ quality checklist audits.</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-700 font-bold uppercase tracking-wider hover:text-black text-xs"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
