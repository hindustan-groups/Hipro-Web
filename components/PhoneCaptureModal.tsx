"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Phone } from "lucide-react";

export default function PhoneCaptureModal({ 
  isOpen, 
  onClose,
  onSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send the captured phone number to the admin panel via the Quote API
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Estimator User",
          email: "Not provided",
          phone: phone,
          location: "Not provided",
          projectType: "Cost Estimator Access",
          budget: "Not provided",
          description: "User entered their phone number to access the Cost Estimator.",
        }),
      });

      // Set a cookie so the user can access the page
      document.cookie = "cost_estimator_unlocked=true; path=/; max-age=86400"; // 24 hours
      
      // We can also store the phone number in localStorage if needed later
      localStorage.setItem("user_phone", phone);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to the calculator
        router.push("/cost-estimator");
        onClose();
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white w-full max-w-md rounded-xl shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="w-12 h-12 bg-red-50 text-construction-red rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
            <Phone className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-tight text-black mb-2">
            Cost Estimator
          </h2>
          <p className="text-slate-500 text-sm">
            Please enter your phone number to access our advanced construction cost calculator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ''));
                setError("");
              }}
              placeholder="Enter your 10-digit number"
              className="w-full px-4 py-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-red focus:border-transparent transition-all shadow-sm"
              maxLength={15}
            />
            {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-construction-navy hover:bg-black text-white font-bold uppercase tracking-widest text-sm py-4 rounded-md transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Proceed to Calculator"}
          </button>
        </form>
      </div>
    </div>
  );
}
