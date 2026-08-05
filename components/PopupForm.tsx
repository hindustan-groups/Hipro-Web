"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function PopupForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Check if the user has already seen the popup
    const hasSeenPopup = localStorage.getItem("hasSeenConsultationPopup");
    
    if (!hasSeenPopup) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenConsultationPopup", "true");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, handle form submission here
    handleClose();
    alert("Thank you! We will contact you shortly.");
  };

  // Don't render anything on server to prevent hydration mismatch
  if (!hasMounted) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Container */}
      <div 
        className="relative flex w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-white/80 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Image (hidden on mobile) */}
        <div className="hidden md:block md:w-5/12 relative bg-gray-100">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80" 
            alt="Family outside dream home" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Add a subtle gradient overlay to match the curved edge style somewhat, though Tailwind doesn't do complex curves easily without SVGs */}
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
          <h2 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-tight mb-6 font-display">
            Your Dream Home <br className="hidden sm:block" /> Awaits!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <input 
                type="text" 
                placeholder="Name" 
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E85D35] focus:border-transparent transition-all text-sm text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Phone Input */}
            <div className="relative flex items-center">
              <div className="absolute left-0 inset-y-0 flex items-center pl-4 pr-3 border-r border-gray-300">
                <span className="text-sm font-medium text-gray-700">+1</span>
              </div>
              <input 
                type="tel" 
                placeholder="Phone Number" 
                required
                className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E85D35] focus:border-transparent transition-all text-sm text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Location Select */}
            <div className="relative">
              <select 
                required
                defaultValue=""
                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E85D35] focus:border-transparent transition-all text-sm text-gray-900 appearance-none bg-white"
              >
                <option value="" disabled>Location of your Plot - City*</option>
                <option value="new-york">New York</option>
                <option value="los-angeles">Los Angeles</option>
                <option value="chicago">Chicago</option>
                <option value="houston">Houston</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full mt-2 bg-[#E85D35] hover:bg-[#d64f2a] text-white font-medium py-3.5 rounded-xl text-[15px] transition-colors shadow-lg shadow-orange-500/20"
            >
              Book FREE Consultation
            </button>
          </form>

          {/* Privacy Policy Note */}
          <p className="mt-5 text-[11px] text-gray-500 leading-relaxed text-center sm:text-left">
            By submitting, you agree to our <a href="#" className="text-[#E85D35] hover:underline">privacy policy</a>, allowing us to use your information as outlined.
          </p>
        </div>
      </div>
    </div>
  );
}
