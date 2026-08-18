"use client";

import { useState } from "react";
import { X, Send, CheckCircle2, Loader2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleTitle: string;
}

export default function JobApplicationModal({ isOpen, onClose, roleTitle }: JobApplicationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    cvUrl: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: roleTitle,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit application");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-none flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display uppercase">Apply for Position</h3>
            <p className="text-sm font-semibold text-construction-red mt-1 uppercase tracking-wider">{roleTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {status === "success" ? (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 font-display uppercase mb-2">Application Received</h4>
              <p className="text-slate-600 mb-8 max-w-xs mx-auto">
                Thank you for applying to Hindustan Projects. Our talent team will review your profile and contact you soon.
              </p>
              <button 
                onClick={onClose}
                className="bg-black text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 text-sm font-semibold border border-red-100">
                  {errorMessage}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 p-3 text-sm focus:border-construction-navy focus:ring-1 focus:ring-construction-navy outline-none bg-slate-50"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="w-full border border-slate-200 p-3 text-sm focus:border-construction-navy focus:ring-1 focus:ring-construction-navy outline-none bg-slate-50"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="w-full border border-slate-200 p-3 text-sm focus:border-construction-navy focus:ring-1 focus:ring-construction-navy outline-none bg-slate-50"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Years of Experience *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Years"
                  className="w-full border border-slate-200 p-3 text-sm focus:border-construction-navy focus:ring-1 focus:ring-construction-navy outline-none bg-slate-50"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Resume / CV *</label>
                <FileUpload 
                  value={formData.cvUrl} 
                  onChange={(url) => setFormData({ ...formData, cvUrl: url })} 
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full mt-6 bg-construction-red hover:bg-red-700 text-white font-bold px-6 py-4 flex items-center justify-center gap-2 uppercase tracking-wider transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
              >
                {status === "submitting" ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Application</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
