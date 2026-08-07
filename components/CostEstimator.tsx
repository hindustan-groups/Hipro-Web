"use client";

import Link from "next/link";

export default function CostEstimator() {
  return (
    <section className="py-24 relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Container */}
        <div className="bg-[#11243E] rounded-3xl md:rounded-[2.5rem] overflow-hidden relative flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-blue-900/10">
          
          {/* Decorative Background curve */}
          <div className="absolute bottom-0 right-0 w-full md:w-[60%] h-full z-0 overflow-hidden pointer-events-none">
            <svg 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none" 
              className="absolute bottom-0 right-0 w-full h-full text-[#183152] fill-current"
            >
              <path d="M0,100 C40,100 50,0 100,0 L100,100 Z" />
            </svg>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-transparent to-[#11243E]" />
          </div>

          {/* Left Text Content */}
          <div className="p-10 md:p-16 lg:p-20 relative z-10 w-full md:w-[55%]">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-display tracking-tight leading-[1.15]">
              Estimate Your Construction Cost Instantly
            </h2>
            <p className="text-slate-300 text-lg mb-10 font-light max-w-lg leading-relaxed">
              Quickly calculate how much it will cost to build your home with our detailed, reliable estimation tool.
            </p>
            <Link 
              href="/cost-estimator"
              className="inline-flex items-center justify-center bg-[#F36B2B] hover:bg-[#d5591f] text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg shadow-orange-600/20 text-base md:text-lg"
            >
              Calculate Cost Instantly
            </Link>
          </div>
          
          {/* Right Image/Illustration Area */}
          <div className="relative z-10 w-full md:w-[45%] h-64 md:h-auto flex items-center justify-center p-8 md:p-10 lg:p-0 lg:-mr-10">
            {/* Custom 3D-styled CSS Calculator */}
            <div className="relative w-full max-w-[280px] md:max-w-[320px] aspect-[3/4] flex items-center justify-center hover:scale-105 transition-transform duration-700 z-10">
              
              <div className="w-full h-full bg-[#1A1C23] rounded-3xl p-5 shadow-[20px_20px_60px_rgba(0,0,0,0.6),-5px_-5px_20px_rgba(255,255,255,0.05)] border-t border-l border-white/10 flex flex-col transform rotate-[12deg]">
                
                {/* Calculator Screen */}
                <div className="h-24 bg-[#0F1115] rounded-xl mb-6 shadow-inner border border-black/50 p-4 flex flex-col justify-end items-end relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  <span className="text-white text-5xl font-light tracking-wider font-mono">0</span>
                </div>

                {/* Calculator Grid */}
                <div className="grid grid-cols-4 gap-3 flex-1">
                  {/* Row 1 */}
                  {['MM', 'M+', 'M-', '%'].map((btn, i) => (
                    <div key={'r1'+i} className="bg-[#2A2D35] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {btn}
                    </div>
                  ))}
                  {/* Row 2 */}
                  {['7', '8', '9', 'GC'].map((btn, i) => (
                    <div key={'r2'+i} className="bg-[#22242B] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-sm font-bold text-white">
                      {btn}
                    </div>
                  ))}
                  {/* Row 3 */}
                  {['4', '5', '6', '×'].map((btn, i) => (
                    <div key={'r3'+i} className="bg-[#22242B] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-sm font-bold text-white">
                      {btn}
                    </div>
                  ))}
                  {/* Row 4 */}
                  {['1', '2', '3', '-'].map((btn, i) => (
                    <div key={'r4'+i} className="bg-[#22242B] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-sm font-bold text-white">
                      {btn}
                    </div>
                  ))}
                  {/* Row 5 */}
                  <div className="col-span-2 bg-[#22242B] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-sm font-bold text-white">
                    0
                  </div>
                  <div className="bg-[#22242B] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-sm font-bold text-white">
                    .
                  </div>
                  <div className="bg-[#F36B2B] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-sm font-bold text-white">
                    =
                  </div>
                </div>
              </div>

              {/* Upward Arrow Graphic (Behind Calculator) */}
              <div className="absolute -right-8 top-12 w-24 h-24 transform rotate-12 -z-10 opacity-80">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2A476D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
              {/* Floating rupee coins decoration */}
              <div className="absolute bottom-10 -left-6 w-16 h-16 bg-[#183152] rounded-full border-4 border-[#2A476D] flex items-center justify-center shadow-2xl shadow-black/50 transform -rotate-[15deg] animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="text-white font-bold text-2xl">₹</span>
              </div>
              <div className="absolute top-1/3 -left-10 w-12 h-12 bg-[#183152] rounded-full border-4 border-[#2A476D] flex items-center justify-center shadow-xl shadow-black/40 transform rotate-[25deg] animate-bounce" style={{ animationDuration: '4s' }}>
                <span className="text-white font-bold text-lg">₹</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
