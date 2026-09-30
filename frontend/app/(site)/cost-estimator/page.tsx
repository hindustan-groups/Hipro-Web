"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";
import { trackEvent } from "@/lib/analytics";
import type { Stats as StatType } from "@/lib/types";

export default function CostEstimatorPage() {
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Classic");
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [siteStats, setSiteStats] = useState<StatType[]>([]);
  const [loading, setLoading] = useState(false);

  // Estimator Form States
  const [plotShape, setPlotShape] = useState("rectangular");
  const [plotArea, setPlotArea] = useState(1000);
  const [city, setCity] = useState("Bhilwara");
  const [floors, setFloors] = useState("g+1");
  const [parking, setParking] = useState("1");
  const [balcony, setBalcony] = useState("1");
  const [estimatedCostInfo, setEstimatedCostInfo] = useState<{
    totalCost: string;
    builtUpArea: number;
    ratePerSqft: number;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setSiteStats(json.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Check if the user has already entered their phone number (via cookie)
    const hasCookie = document.cookie.includes("cost_estimator_unlocked=true");
    if (hasCookie) {
      setShowModal(false);
      setIsUnlocked(true);
    }
  }, []);

  const triggerCalculate = async (tier?: string) => {
    const activeTier = tier || selectedTier || "Classic";
    setLoading(true);

    // Rates per sqft
    const tierRates: Record<string, number> = {
      Basic: 1680,
      Classic: 1840,
      Premium: 2110,
      Royale: 2350,
    };
    const rate = tierRates[activeTier] || 1840;

    // Floor multipliers
    const floorMultipliers: Record<string, number> = {
      "g+1": 1.8,
      "g+2": 2.6,
      "g+3": 3.4,
    };
    const mult = floorMultipliers[floors] || 1.8;

    const parkingArea = (parseInt(parking, 10) || 0) * 130;
    const balconyArea = (parseInt(balcony, 10) || 0) * 40;
    const totalBuiltUpArea = Math.round(plotArea * mult + parkingArea + balconyArea);
    const totalCost = totalBuiltUpArea * rate;

    // Format in Lakhs / Crores
    let costDisplay = "";
    if (totalCost >= 10000000) {
      costDisplay = `₹${(totalCost / 10000000).toFixed(2)} Cr`;
    } else {
      costDisplay = `₹${(totalCost / 100000).toFixed(2)} Lakhs`;
    }

    setEstimatedCostInfo({
      totalCost: costDisplay,
      builtUpArea: totalBuiltUpArea,
      ratePerSqft: rate,
    });

    // Track analytics event
    trackEvent("calculate_cost_estimate", {
      project_type: "Residential Construction",
      construction_tier: activeTier,
      city,
      plot_area: plotArea,
      floors,
    });

    // Persist calculation as a Quote Lead in the Database
    try {
      const userPhone = typeof window !== "undefined" ? localStorage.getItem("user_phone") || "" : "";
      const cleanPhone = userPhone.replace(/\D/g, "");
      const email = cleanPhone ? `lead-${cleanPhone}@hindustanprojects.in` : "estimator-user@hindustanprojects.in";

      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Cost Estimator Lead",
          email,
          phone: userPhone || "9999999999",
          location: `${city}, Rajasthan`,
          projectType: "Cost Estimator Access",
          budget: `${costDisplay} (${activeTier} Package)`,
          description: `House Construction Cost Calculation: Plot Shape: ${plotShape}, Plot Area: ${plotArea} sqft, City: ${city}, Floors: ${floors}, Parking: ${parking}, Balcony: ${balcony}, Package: ${activeTier}. Total estimated built-up area: ${totalBuiltUpArea} sqft, Total estimated cost: ${costDisplay} (@ ₹${rate}/sqft).`,
        }),
      });
    } catch (err) {
      console.warn("Failed to persist estimator lead:", err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUnlocked) {
      setPendingSubmit(true);
      setShowModal(true);
      return;
    }
    triggerCalculate();
  };

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen relative">
      <PhoneCaptureModal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setPendingSubmit(false);
        }} 
        onSuccess={() => {
           setShowModal(false);
           setIsUnlocked(true);
           if (pendingSubmit) {
             setPendingSubmit(false);
             triggerCalculate();
           }
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left Side: Content & Info */}
          <div className="w-full lg:w-7/12 flex flex-col pt-4">
            <h1 className="text-[40px] md:text-[56px] font-bold text-gray-900 leading-[1.1] mb-10 font-display">
              House Construction <br className="hidden sm:block" /> Cost Calculator
            </h1>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 md:gap-16 mb-10">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-construction-red mb-2 font-display">
                  {siteStats.find((s) => /project/i.test(s.label))?.value || "150+"}
                </div>
                <div className="text-gray-600 text-sm">
                  {siteStats.find((s) => /project/i.test(s.label))?.label || "Projects"}
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-construction-red mb-2 font-display">
                  {siteStats.find((s) => /year|experience/i.test(s.label))?.value || "8+"}
                </div>
                <div className="text-gray-600 text-sm">
                  {siteStats.find((s) => /year|experience/i.test(s.label))?.label || "Years Experience"}
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-construction-red mb-2 font-display">
                  {siteStats.find((s) => /team/i.test(s.label))?.value || "30+"}
                </div>
                <div className="text-gray-600 text-sm">
                  {siteStats.find((s) => /team/i.test(s.label))?.label || "Team Members"}
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-construction-red mb-2 font-display">
                  {siteStats.find((s) => /satisfaction/i.test(s.label))?.value || "85%"}
                </div>
                <div className="text-gray-600 text-sm">
                  {siteStats.find((s) => /satisfaction/i.test(s.label))?.label || "Client Satisfaction"}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-[17px] text-gray-600 leading-relaxed mb-10">
              Use our house construction cost calculator to get free, package-wise estimates instantly. 
              Residential construction in India costs ₹1,680–₹2,350 per sqft depending on your city and 
              package tier. A 30×40 ft plot with G+1 construction typically runs ₹33L–₹53L at Basic to 
              Classic rates. Every estimate is backed by our fixed-price contracts and milestone inspections.
            </p>

            {/* Indicative Rates Widget */}
            <div className="bg-white border border-gray-100 rounded-none p-6 shadow-sm mb-12">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                  Indicative Rates Per Sqft (Select Tier)
                </h3>
                <span className="text-xs text-construction-red font-bold uppercase tracking-wider">
                  Active: {selectedTier}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTier("Basic")}
                  className={`border rounded-none p-4 text-center transition-colors cursor-pointer ${
                    selectedTier === "Basic"
                      ? "border-construction-red bg-orange-50/50 shadow-sm"
                      : "border-gray-100 bg-gray-50/50 hover:bg-orange-50/30 hover:border-orange-200"
                  }`}
                >
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Basic</div>
                  <div className="text-construction-red font-bold">₹1,680</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier("Classic")}
                  className={`border rounded-none p-4 text-center transition-colors cursor-pointer ${
                    selectedTier === "Classic"
                      ? "border-construction-red bg-orange-50/50 shadow-sm"
                      : "border-gray-100 bg-gray-50/50 hover:bg-orange-50/30 hover:border-orange-200"
                  }`}
                >
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Classic</div>
                  <div className="text-construction-red font-bold">₹1,840</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier("Premium")}
                  className={`border rounded-none p-4 text-center transition-colors cursor-pointer ${
                    selectedTier === "Premium"
                      ? "border-construction-red bg-orange-50/50 shadow-sm"
                      : "border-gray-100 bg-gray-50/50 hover:bg-orange-50/30 hover:border-orange-200"
                  }`}
                >
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Premium</div>
                  <div className="text-construction-red font-bold">₹2,110</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTier("Royale")}
                  className={`border rounded-none p-4 text-center transition-colors cursor-pointer ${
                    selectedTier === "Royale"
                      ? "border-construction-red bg-orange-50/50 shadow-sm"
                      : "border-gray-100 bg-gray-50/50 hover:bg-orange-50/30 hover:border-orange-200"
                  }`}
                >
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Royale</div>
                  <div className="text-construction-red font-bold">₹2,350</div>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Rates vary by city and site conditions. Click a tier to set your desired package.
              </p>
            </div>
            
            {/* SEO Text Area */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">How are these rates estimated?</h2>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                Rates are based on city-level construction cost inputs such as plot size, number of floors, and the quality of materials selected. Our smart algorithm factors in local labor and material costs to give you the most accurate real-time estimate possible.
              </p>
            </div>
          </div>

          {/* Right Side: Form Card */}
          <div className="w-full lg:w-5/12">
            <div className="bg-white rounded-none shadow-3d-lg border border-gray-100 p-8 lg:p-10 sticky top-32">
              <h2 className="text-[28px] font-bold text-gray-900 mb-8 font-display">Calculate My Estimate</h2>
              
              {submitted ? (
                <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display uppercase tracking-tight">Estimate Generated!</h3>
                  
                  {estimatedCostInfo && (
                    <div className="w-full my-6 p-6 bg-slate-50 border border-slate-200 text-left space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Total Cost</span>
                        <span className="text-2xl font-black text-construction-red">{estimatedCostInfo.totalCost}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        <div>Built-up Area: <strong className="text-slate-900">{estimatedCostInfo.builtUpArea} sqft</strong></div>
                        <div>Package: <strong className="text-slate-900">{selectedTier}</strong></div>
                        <div>Indicative Rate: <strong className="text-slate-900">₹{estimatedCostInfo.ratePerSqft}/sqft</strong></div>
                        <div>Location: <strong className="text-slate-900">{city}</strong></div>
                      </div>
                    </div>
                  )}

                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Based on your inputs, our senior estimating engineers are reviewing site parameters. We will contact you shortly with a formal BOQ breakdown.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-construction-red font-semibold hover:underline text-sm uppercase tracking-wider"
                  >
                    Calculate another estimate
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Plot Shape</label>
                    <select
                      aria-label="Plot Shape"
                      value={plotShape}
                      onChange={(e) => setPlotShape(e.target.value)}
                      className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent"
                    >
                      <option value="rectangular">Rectangular</option>
                      <option value="square">Square</option>
                      <option value="other">Other / Irregular</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Plot Area (sqft)</label>
                    <input 
                      type="number" 
                      aria-label="Plot Area in sqft"
                      value={plotArea}
                      onChange={(e) => setPlotArea(Math.max(100, parseInt(e.target.value, 10) || 0))}
                      required
                      min={100}
                      className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red bg-transparent text-gray-900 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">City</label>
                      <select
                        aria-label="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent"
                      >
                        <option value="Bhilwara">Bhilwara</option>
                        <option value="Jaipur">Jaipur</option>
                        <option value="Udaipur">Udaipur</option>
                        <option value="Kota">Kota</option>
                        <option value="Jodhpur">Jodhpur</option>
                        <option value="Ajmer">Ajmer</option>
                        <option value="Other Rajasthan">Other Rajasthan</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Floors</label>
                      <select
                        aria-label="Floors"
                        value={floors}
                        onChange={(e) => setFloors(e.target.value)}
                        className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent"
                      >
                        <option value="g+1">G+1</option>
                        <option value="g+2">G+2</option>
                        <option value="g+3">G+3</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-1 mb-2">
                    <span className="text-[10px] text-gray-400">Indicative rates: ₹1,680 - ₹2,350/sqft</span>
                    <span className="text-[10px] font-semibold text-slate-500">Tier: <strong className="text-construction-red">{selectedTier}</strong></span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Parking</label>
                      <select
                        aria-label="Parking Units"
                        value={parking}
                        onChange={(e) => setParking(e.target.value)}
                        className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent"
                      >
                        <option value="1">1 Car</option>
                        <option value="2">2 Cars</option>
                        <option value="0">None</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Balcony</label>
                      <select
                        aria-label="Balcony Units"
                        value={balcony}
                        onChange={(e) => setBalcony(e.target.value)}
                        className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent"
                      >
                        <option value="1">1 Balcony</option>
                        <option value="2">2 Balconies</option>
                        <option value="3">3 Balconies</option>
                        <option value="0">None</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between px-1 mb-8">
                    <span className="text-[10px] text-gray-400">Assumed 130 sqft per unit</span>
                    <span className="text-[10px] text-gray-400">Assumed 40 sqft per unit</span>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-construction-red hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-none text-[16px] transition-all uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Calculating Estimate...</span>
                      </>
                    ) : (
                      <span>Calculate Your Cost</span>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-500 leading-relaxed pt-2">
                    By submitting this form, I confirm that I have read and agreed to accept our <Link href="/privacy-policy" className="text-construction-red hover:underline">privacy policy</Link>.
                  </p>
                </form>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
