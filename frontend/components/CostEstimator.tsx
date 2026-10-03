"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Check, Sparkles } from "lucide-react";

export default function CostEstimator() {
  const [selectedSqft, setSelectedSqft] = useState(1500);
  const [selectedFloor, setSelectedFloor] = useState<"g" | "g+1" | "g+2">("g+1");

  // Dynamic estimate teaser for homepage
  const teaserEstimate = useMemo(() => {
    const floorMultipliers = { g: 0.82, "g+1": 1.68, "g+2": 2.52 };
    const builtUp = Math.round(selectedSqft * floorMultipliers[selectedFloor] + 185);
    const cost = builtUp * 1850; // Gold package rate
    if (cost >= 10000000) {
      return `₹${(cost / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(cost / 100000).toFixed(2)} Lakhs`;
  }, [selectedSqft, selectedFloor]);

  return (
    <section className="py-20 sm:py-24 relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Container */}
        <div className="bg-[#0F2C59] rounded-2xl md:rounded-[2rem] overflow-hidden relative flex flex-col lg:flex-row items-center justify-between shadow-2xl shadow-blue-950/20 border border-white/10">
          
          {/* Decorative Background curve */}
          <div className="absolute bottom-0 right-0 w-full md:w-[60%] h-full z-0 overflow-hidden pointer-events-none">
            <svg 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none" 
              className="absolute bottom-0 right-0 w-full h-full text-[#14386b] fill-current opacity-60"
            >
              <path d="M0,100 C40,100 50,0 100,0 L100,100 Z" />
            </svg>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-transparent to-[#0F2C59]" />
          </div>

          {/* Left Text & Interactive Chips Content */}
          <div className="p-8 sm:p-10 md:p-14 lg:p-16 relative z-10 w-full lg:w-[58%] flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 text-[#D9232A] text-xs font-bold uppercase tracking-widest mb-4">
              <Calculator className="w-3.5 h-3.5 text-white" />
              <span className="text-white">Free Interactive Tool</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-display tracking-tight leading-[1.15]">
              Estimate Your <span className="font-serif italic font-normal text-[#D9232A] normal-case">Construction Cost</span> Instantly
            </h2>

            <p className="text-slate-300 text-sm sm:text-base mb-6 font-light max-w-lg leading-relaxed">
              Calculate house construction budgets across Bhilwara & Rajasthan. Test live plot sizes below or open the full 3D BOQ engine:
            </p>

            {/* Quick Interactive Selector */}
            <div className="w-full max-w-lg bg-white/5 border border-white/10 p-4 mb-8 text-left">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                1. Select Plot Size (Gaj / Sq. Ft):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { label: "100 Gaj", sqft: 900 },
                  { label: "139 Gaj", sqft: 1250 },
                  { label: "167 Gaj", sqft: 1500 },
                  { label: "200 Gaj", sqft: 1800 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={`Select ${item.label} (${item.sqft} sq ft)`}
                    onClick={() => setSelectedSqft(item.sqft)}
                    className={`p-2 text-center text-xs font-bold border transition-all cursor-pointer ${
                      selectedSqft === item.sqft
                        ? "bg-[#D9232A] border-[#D9232A] text-white shadow-sm"
                        : "bg-white/5 border-white/15 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                2. Select Floors:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "g" as const, label: "Ground Only" },
                  { id: "g+1" as const, label: "G + 1 Floor" },
                  { id: "g+2" as const, label: "G + 2 Floors" },
                ].map((fl) => (
                  <button
                    key={fl.id}
                    type="button"
                    aria-label={`Select ${fl.label}`}
                    onClick={() => setSelectedFloor(fl.id)}
                    className={`p-2 text-center text-xs font-bold border transition-all cursor-pointer ${
                      selectedFloor === fl.id
                        ? "bg-[#D9232A] border-[#D9232A] text-white shadow-sm"
                        : "bg-white/5 border-white/15 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {fl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Link to Full Estimator */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                href={`/cost-estimator?area=${selectedSqft}&floors=${encodeURIComponent(selectedFloor)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D9232A] hover:bg-red-700 active:scale-95 text-white font-bold px-8 py-4 text-sm sm:text-base transition-all shadow-xl shadow-red-600/30 uppercase tracking-wider z-20 cursor-pointer"
              >
                <span>Open Full 3D Estimator & BOQ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {/* Right Image/Interactive Preview Calculator */}
          <div className="relative z-10 w-full lg:w-[42%] flex items-center justify-center p-6 sm:p-8 lg:p-12">
            
            {/* Custom 3D-styled CSS Calculator showing REAL live teaser result */}
            <Link
              href={`/cost-estimator?area=${selectedSqft}&floors=${encodeURIComponent(selectedFloor)}`}
              className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] flex items-center justify-center hover:scale-105 transition-transform duration-500 cursor-pointer group"
              title="Click to open full cost estimator tool"
            >
              <div className="w-full h-full bg-[#1A1C23] rounded-3xl p-5 shadow-[20px_20px_60px_rgba(0,0,0,0.6),-5px_-5px_20px_rgba(255,255,255,0.05)] border-t border-l border-white/10 flex flex-col transform rotate-[8deg] group-hover:rotate-[2deg] transition-all duration-500">
                
                {/* Calculator Screen displaying live dynamic calculation */}
                <div className="h-24 bg-[#0F1115] rounded-xl mb-4 shadow-inner border border-black/50 p-3 flex flex-col justify-between items-end relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  <div className="text-[10px] text-slate-400 font-mono tracking-wider w-full flex justify-between">
                    <span>{selectedSqft} sqft · {selectedFloor.toUpperCase()}</span>
                    <span className="text-emerald-400">ESTIMATE</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-[#D9232A]">
                    {teaserEstimate}
                  </span>
                </div>

                {/* Calculator Grid */}
                <div className="grid grid-cols-4 gap-2 flex-1">
                  {['PLOT', 'SQFT', 'BOQ', '%'].map((btn, i) => (
                    <div key={'r1'+i} className="bg-[#2A2D35] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {btn}
                    </div>
                  ))}
                  {['7', '8', '9', '₹'].map((btn, i) => (
                    <div key={'r2'+i} className="bg-[#22242B] rounded-md flex items-center justify-center text-xs font-bold text-white">
                      {btn}
                    </div>
                  ))}
                  {['4', '5', '6', '×'].map((btn, i) => (
                    <div key={'r3'+i} className="bg-[#22242B] rounded-md flex items-center justify-center text-xs font-bold text-white">
                      {btn}
                    </div>
                  ))}
                  {['1', '2', '3', '-'].map((btn, i) => (
                    <div key={'r4'+i} className="bg-[#22242B] rounded-md flex items-center justify-center text-xs font-bold text-white">
                      {btn}
                    </div>
                  ))}
                  <div className="col-span-2 bg-[#22242B] rounded-md flex items-center justify-center text-xs font-bold text-white">
                    CALCULATE
                  </div>
                  <div className="col-span-2 bg-[#D9232A] group-hover:bg-red-700 rounded-md flex items-center justify-center text-xs font-bold text-white">
                    OPEN →
                  </div>
                </div>
              </div>

              {/* Floating rupee coins decoration */}
              <div className="absolute bottom-6 -left-6 w-14 h-14 bg-[#0F2C59] rounded-full border-4 border-[#1e4a87] flex items-center justify-center shadow-2xl shadow-black/50 transform -rotate-[15deg]">
                <span className="text-white font-bold text-xl">₹</span>
              </div>
              <div className="absolute top-1/4 -right-4 w-10 h-10 bg-[#0F2C59] rounded-full border-4 border-[#1e4a87] flex items-center justify-center shadow-xl shadow-black/40 transform rotate-[20deg]">
                <span className="text-white font-bold text-sm">₹</span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
