"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";

export default function CostEstimatorPage() {
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user has already entered their phone number (via cookie)
    const hasCookie = document.cookie.includes("cost_estimator_unlocked=true");
    if (!hasCookie) {
      setShowModal(true);
    } else {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Prevent flashing of the page content before the check completes
  if (!isUnlocked && !showModal) return <div className="min-h-screen bg-white" />;

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen relative">
      <PhoneCaptureModal 
        isOpen={showModal} 
        onClose={() => router.push("/")} 
        onSuccess={() => {
           setShowModal(false);
           setIsUnlocked(true);
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
                <div className="text-3xl md:text-4xl font-bold text-construction-red mb-2 font-display">10,000+</div>
                <div className="text-gray-600 text-sm">Homes built</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-construction-red mb-2 font-display">470+</div>
                <div className="text-gray-600 text-sm">Quality checks completed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-construction-red mb-2 font-display">1,000+</div>
                <div className="text-gray-600 text-sm">Pincodes served</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-[17px] text-gray-600 leading-relaxed mb-10">
              Use our house construction cost calculator to get free, package-wise estimates instantly. 
              Residential construction in India costs ₹1,940–₹3,990 per sqft depending on your city and 
              package tier. A 30×40 ft plot with G+1 construction typically runs ₹33L–₹53L at Basic to 
              Classic rates. Every estimate is backed by our fixed-price contracts and ESCROW-secured 
              milestone payments.
            </p>

            {/* Indicative Rates Widget */}
            <div className="bg-white border border-gray-100 rounded-none p-6 shadow-sm mb-12">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-5">
                Indicative Rates Per Sqft
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="border border-gray-100 rounded-none p-4 text-center hover:border-orange-200 transition-colors cursor-pointer bg-gray-50/50 hover:bg-orange-50/30">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Basic</div>
                  <div className="text-construction-red font-bold">₹1,680</div>
                </div>
                <div className="border border-gray-100 rounded-none p-4 text-center hover:border-orange-200 transition-colors cursor-pointer bg-gray-50/50 hover:bg-orange-50/30">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Classic</div>
                  <div className="text-construction-red font-bold">₹1,840</div>
                </div>
                <div className="border border-gray-100 rounded-none p-4 text-center hover:border-orange-200 transition-colors cursor-pointer bg-gray-50/50 hover:bg-orange-50/30">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Premium</div>
                  <div className="text-construction-red font-bold">₹2,110</div>
                </div>
                <div className="border border-gray-100 rounded-none p-4 text-center hover:border-orange-200 transition-colors cursor-pointer bg-gray-50/50 hover:bg-orange-50/30">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Royale</div>
                  <div className="text-construction-red font-bold">₹2,270</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-5">
                Rates vary by city and site conditions.
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
                <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-none flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-display">Estimate Generated!</h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    Based on your inputs, our experts are generating a customized package breakdown. We will contact you shortly with your detailed quote.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-construction-red font-semibold hover:underline"
                  >
                    Calculate another estimate
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Plot</label>
                    <select className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent">
                      <option value="other">Other</option>
                      <option value="square">Square</option>
                      <option value="rectangular">Rectangular</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Plot Area (sqft)</label>
                    <input 
                      type="number" 
                      defaultValue="1000"
                      className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red bg-transparent text-gray-900 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">City</label>
                      <select className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent">
                        <option value="pune">Pune</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="delhi">Delhi</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Floors</label>
                      <select className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent">
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
                    <span className="text-[10px] text-gray-400">Indicative rates: ₹1,680 - ₹2,270/sqft</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Parking</label>
                      <select className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="0">None</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500 font-medium">Balcony</label>
                      <select className="w-full h-14 px-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red appearance-none bg-transparent">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
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
                    className="w-full bg-construction-red hover:bg-red-700 text-white font-bold py-4 rounded-none text-[16px] transition-all uppercase tracking-wider shadow-lg shadow-red-600/30"
                  >
                    Calculate Your Cost
                  </button>

                  <p className="text-[11px] text-gray-500 leading-relaxed pt-2">
                    By submitting this form, I confirm that I have read and agreed to accept our <a href="#" className="text-construction-red hover:underline">privacy policy</a>.
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
