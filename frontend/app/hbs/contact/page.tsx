"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Phone, Mail, MapPin, MessageSquare, Clock, Wrench, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const HBS_SERVICES_LIST = [
  "01. Structure Repair",
  "02. Water Leakage Solution",
  "03. Plumbing & Electrical",
  "04. Painting & Wall Repair",
  "05. Terrace & Bird Protection",
  "06. Termite Control",
  "07. Tile Work",
  "08. AC, Lift & Solar",
  "09. Electrical & Machine Work",
  "10. Safety & Compliance",
  "11. Gardening",
  "12. Cleaning Services",
  "13. Packers & Movers",
  "14. CCTV & Security",
  "15. Smart Home Automation",
  "16. Furniture Work",
  "17. Wall Decor & Wallpaper",
  "18. Facade Work (ACP & Glass)",
  "19. Fabrication Work",
  "Turnkey Property Maintenance",
  "Other Repair Inquiry"
];

function HbsContactForm() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") || "01. Structure Repair";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedService, setSelectedService] = useState(initialService);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/hbs/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          selectedService,
          message,
          source: "hbs_contact_page",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.error || "Unable to submit request. Please call directly.");
      }
    } catch {
      setError("Network connection issue. Please contact us via phone or WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 sm:p-10 shadow-xs">
      {success ? (
        <div className="py-12 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto animate-in zoom-in-75 duration-300" />
          <h3 className="text-2xl font-black text-slate-900 uppercase font-display">
            Inspection Request Confirmed!
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Thank you, <strong className="text-slate-900">{name}</strong>. Your inquiry regarding{" "}
            <span className="font-semibold text-amber-700">{selectedService}</span> has been assigned to our senior site supervisor. We will call you at <span className="font-mono font-bold text-slate-900">{phone}</span> shortly.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setSuccess(false);
                setName("");
                setPhone("");
                setEmail("");
                setMessage("");
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <span className="text-amber-700 font-mono text-xs font-bold uppercase tracking-wider block mb-1">
              Direct Dispatch
            </span>
            <h3 className="text-2xl font-black text-slate-900 uppercase font-display">
              Schedule Free Site Inspection
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Fill out the details below. Our field engineering team will coordinate an on-site evaluation.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Service Required *
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-3 px-3 text-xs focus:outline-none focus:border-amber-600 font-medium"
              required
            >
              {HBS_SERVICES_LIST.map((srv, idx) => (
                <option key={idx} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rakesh Agarwal"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Contact Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600 font-mono"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rakesh@example.com"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Message / Issue Details */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Issue Location & Problem Details *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Ground floor dampness on exterior walls, peeling paint, or pigeon netting required for 3 balconies in Azad Nagar, Bhilwara..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 p-3 text-xs focus:outline-none focus:border-amber-600 resize-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 shadow-xs transition-colors disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting Request...</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 text-white" />
                <span>Book Site Inspection</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function HbsContactPage() {
  return (
    <div className="space-y-12 sm:space-y-16 py-12">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-slate-200 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            Quick Response Helpdesk
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase font-display tracking-tight">
            Contact & <span className="text-amber-600">Get A Quote</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Need urgent repair diagnosis or a comprehensive maintenance estimate? Contact our centralized helpdesk or submit your requirements below for rapid technician scheduling.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading form...</div>}>
              <HbsContactForm />
            </Suspense>
          </div>

          {/* Right Column: Contact Details & Office */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Card */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-6 border-t-4 border-amber-500 shadow-xs">
              <h3 className="text-lg font-bold uppercase font-display border-b border-slate-800 pb-3">
                Central Helpdesk & Booking
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      Direct Phone
                    </span>
                    <a href="tel:+917597000601" className="text-white hover:text-amber-400 font-bold text-sm">
                      +91 75970 00601
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      WhatsApp Quick Help
                    </span>
                    <a
                      href="https://wa.me/917597000601?text=Hello%20HBS,%20I%20would%20like%20to%20schedule%20an%20inspection."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-bold text-sm"
                    >
                      +91 75970 00601 (Click to Chat)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      Email Inquiries
                    </span>
                    <a href="mailto:hbs@hindustanprojects.in" className="text-white hover:text-amber-400 font-semibold">
                      hbs@hindustanprojects.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      Registered Office
                    </span>
                    <p className="text-slate-300 leading-snug">
                      Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      Working Hours
                    </span>
                    <p className="text-slate-300 leading-snug">
                      Monday to Saturday: 9:00 AM – 7:00 PM<br />
                      <span className="text-amber-400 font-semibold">Emergency repair response on call</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent company attribution card */}
            <div className="bg-amber-50 border border-amber-200 p-5 text-xs text-amber-900 space-y-1.5">
              <span className="font-bold uppercase tracking-wider block">
                Corporate Entity
              </span>
              <p className="leading-relaxed">
                Hind Building Solutions (HBS) is an official engineering sub-brand under{" "}
                <strong>Hindustan Projects (HiPRO)</strong>, registered and operating in Rajasthan since 2019.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
