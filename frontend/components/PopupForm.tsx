"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const defaultIndianStates = [
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", 
  "Telangana", "Uttar Pradesh", "Haryana", "Rajasthan", "West Bengal", 
  "Punjab", "Madhya Pradesh", "Kerala", "Andhra Pradesh"
];

const defaultDistrictsByState: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi"],
  "Karnataka": ["Bengaluru Urban", "Mysuru", "Mangaluru", "Hubballi-Dharwad", "Belagavi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Ghaziabad", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"]
};

export default function PopupForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Check if the user has already seen the popup
    try {
      const hasSeenPopup = localStorage.getItem("hasSeenConsultationPopup");
      if (!hasSeenPopup) {
        // Show popup after 3 seconds
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may be disabled
    }
  }, []);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [states, setStates] = useState<string[]>(defaultIndianStates);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch("/api/locations/states");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setStates(json.data);
        }
      } catch (err) {
        // Fallback to default states
      }
    };
    if (isOpen) {
      fetchStates();
    }
  }, [isOpen]);

  const handleStateChange = async (stateName: string) => {
    setSelectedState(stateName);
    setSelectedDistrict("");
    const fallbackList = defaultDistrictsByState[stateName] || ["City Center", "North District", "South District", "East District", "West District"];
    setDistricts(fallbackList);
    try {
      const res = await fetch(`/api/locations/districts?state=${encodeURIComponent(stateName)}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setDistricts(json.data);
      }
    } catch (err) {
      // Keep fallback districts
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenConsultationPopup", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedState || !selectedDistrict) {
      setError("Please select both State and District");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: `${selectedDistrict}, ${selectedState}`,
          projectType: "Consultation Request",
          budget: "Not Specified",
          description: "Requested a free consultation via website popup.",
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(data.error || "Failed to submit request");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything on server to prevent hydration mismatch
  if (!hasMounted) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Container */}
      <div 
        className="relative flex w-full max-w-4xl bg-white rounded-none overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-white/80 hover:bg-gray-100 rounded-none text-gray-500 transition-colors"
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

          {success ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p className="text-xl font-bold text-gray-900">Request Received!</p>
              <p className="text-gray-500 text-sm">We will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}
            {/* Name Input */}
            <div>
              <input 
                type="text" 
                placeholder="Name" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3.5 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all text-sm text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Email Input */}
            <div>
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all text-sm text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Phone Input */}
            <div className="relative flex items-center">
              <div className="absolute left-0 inset-y-0 flex items-center pl-4 pr-3 border-r border-gray-300">
                <span className="text-sm font-medium text-gray-700">+91</span>
              </div>
              <input 
                type="tel" 
                placeholder="Phone Number" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-16 pr-4 py-3.5 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all text-sm text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* State Select */}
            <div className="relative">
              <select 
                required
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all text-sm text-gray-900 appearance-none bg-white"
              >
                <option value="" disabled>Select State*</option>
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* District Select */}
            <div className="relative">
              <select 
                required
                disabled={!selectedState}
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-4 py-3.5 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all text-sm text-gray-900 appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="" disabled>Select District*</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-construction-navy btn-sweep text-white font-bold py-3.5 px-4 rounded-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-md shadow-blue-900/20"
            >
              {loading ? "Submitting..." : "Book FREE Consultation"}
            </button>
          </form>
          )}

          {/* Privacy Policy Note */}
          <p className="mt-5 text-[11px] text-gray-500 leading-relaxed text-center sm:text-left">
            By submitting, you agree to our <a href="#" className="text-construction-red hover:underline font-semibold">privacy policy</a>, allowing us to use your information as outlined.
          </p>
        </div>
      </div>
    </div>
  );
}
