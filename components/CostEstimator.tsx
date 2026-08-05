"use client";

import { ArrowRight, Calculator, PhoneCall, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CostEstimator() {

  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-50/50 to-orange-50/50 rounded-full blur-3xl opacity-70 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-3d-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
          
          {/* Left Content */}
          <div className="p-10 md:p-16 lg:w-1/2 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#E85D35] px-4 py-2 rounded-full text-sm font-semibold mb-6 w-max">
              <Calculator className="w-4 h-4" />
              <span>Cost Estimator</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display leading-[1.1]">
              Estimate Your Construction Cost <span className="text-[#1A5F8C]">Instantly</span>
            </h2>
            
            <p className="text-lg text-gray-500 mb-10 leading-relaxed font-light">
              Quickly calculate how much it will cost to build your home with our detailed, reliable estimation tool. Get a clear picture of your investment.
            </p>
            
            <Link 
              href="/cost-estimator"
              className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#1A5F8C] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-full text-[16px] transition-all shadow-glow-blue hover:shadow-3d-lg w-max"
            >
              Calculate Cost Instantly
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Content - Mockup Image */}
          <div className="lg:w-1/2 bg-gray-50 p-10 flex items-center justify-center relative overflow-hidden">
            {/* Abstract UI representation */}
            <div className="relative w-full max-w-md aspect-square">
              {/* Main App Card */}
              <div className="absolute inset-0 bg-white rounded-3xl shadow-3d-lg p-8 flex flex-col justify-between border border-gray-100 transform rotate-[-2deg] transition-transform duration-500 hover:rotate-0">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl mb-6 flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-[#1A5F8C]" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-3 w-1/3 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-3/4 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2 mt-8">
                      <div className="h-12 w-full bg-gray-50 border border-gray-100 rounded-xl"></div>
                      <div className="h-12 w-full bg-gray-50 border border-gray-100 rounded-xl"></div>
                      <div className="h-12 w-full bg-gray-50 border border-gray-100 rounded-xl"></div>
                    </div>
                  </div>
                </div>
                <div className="h-14 w-full bg-[#E85D35] rounded-xl opacity-90 mt-6"></div>
              </div>

              {/* Floating Element 1 */}
              <div className="absolute -right-8 top-12 bg-white p-4 rounded-2xl shadow-3d-md border border-gray-100 flex items-center gap-4 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">$</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Estimated</div>
                  <div className="font-bold text-gray-900 font-display">Accurate Pricing</div>
                </div>
              </div>

              {/* Floating Element 2 */}
              <div className="absolute -left-6 bottom-20 bg-white p-4 rounded-2xl shadow-3d-md border border-gray-100 flex items-center gap-4 animate-float" style={{ animationDelay: '2s' }}>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-[#E85D35]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Detailed</div>
                  <div className="font-bold text-gray-900 font-display">Material Breakdown</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
