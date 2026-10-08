"use client";

import { useState } from "react";
import { X, Wrench, Phone, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface HbsQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
  services?: Array<{ title: string; serviceNumber?: string | null }>;
}

export default function HbsQuoteModal({
  isOpen,
  onClose,
  defaultService = "Structure Repair",
  services = [],
}: HbsQuoteModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedService, setSelectedService] = useState(defaultService);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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
          source: "hbs_quote_modal",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.error || "Unable to send quote request. Please call directly.");
      }
    } catch {
      setError("Network connection error. Please call +91 75970 00601.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white shadow-2xl border-t-4 border-amber-600 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hbs-icon.jpg"
              alt="Hind Build"
              className="w-8 h-8 rounded-sm object-contain bg-white p-0.5 shadow-xs"
            />
            <div>
              <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider font-display">
                Request Free Inspection & Quote
              </h3>
              <p className="text-[11px] text-slate-400">
                Hind Build · Engineering Site Care
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle className="w-14 h-14 text-emerald-600 mx-auto animate-in zoom-in-75 duration-300" />
              <div className="space-y-1.5">
                <h4 className="text-xl font-black text-slate-900 uppercase font-display">
                  Inspection Request Received!
                </h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <strong className="text-slate-900">{name}</strong>. Our senior repair supervisor for <span className="font-semibold text-amber-700">{selectedService}</span> will contact you within 2 hours.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Service Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Required Service *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600 font-medium"
                  required
                >
                  {services.length > 0 ? (
                    services.map((s, idx) => (
                      <option key={idx} value={s.title}>
                        {s.title}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Structure Repair">Structure Repair</option>
                      <option value="Water Leakage Solution">Water Leakage Solution</option>
                      <option value="Plumbing & Electrical">Plumbing & Electrical</option>
                      <option value="Painting & Wall Repair">Painting & Wall Repair</option>
                      <option value="Terrace & Bird Protection">Terrace & Bird Protection</option>
                      <option value="Termite Control">Termite Control</option>
                      <option value="Tile Work">Tile Work</option>
                      <option value="AC, Lift & Solar">AC, Lift & Solar</option>
                      <option value="Electrical & Machine Work">Electrical & Machine Work</option>
                      <option value="Safety & Compliance">Safety & Compliance</option>
                      <option value="Gardening">Gardening</option>
                      <option value="Cleaning Services">Cleaning Services</option>
                      <option value="Packers & Movers">Packers & Movers</option>
                      <option value="CCTV & Security">CCTV & Security</option>
                      <option value="Smart Home Automation">Smart Home Automation</option>
                      <option value="Furniture Work">Furniture Work</option>
                      <option value="Wall Decor & Wallpaper">Wall Decor & Wallpaper</option>
                      <option value="Facade Work (ACP & Glass)">Facade Work (ACP & Glass)</option>
                      <option value="Fabrication Work">Fabrication Work</option>
                    </>
                  )}
                </select>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number *
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2.5 px-3 text-xs focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Problem Description / Location Details
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue (e.g. 2nd floor bathroom ceiling seepage, terrace bird netting required in Shastri Nagar...)"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 py-2 px-3 text-xs focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider py-3 shadow-xs transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Request...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 text-white" />
                    <span>Submit Inspection Request</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-slate-500">
                <Phone className="w-3 h-3 text-amber-600" />
                <span>Need urgent assistance? Call <strong>+91 75970 00601</strong> directly.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
