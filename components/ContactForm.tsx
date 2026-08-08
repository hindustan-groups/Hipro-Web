"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", service: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: "", email: "", phone: "", service: "", message: "" });
        }, 5000);
      } else {
        setError(data.error || "Failed to submit message");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 rounded-none bg-red-50 border border-red-100 text-construction-red flex items-center justify-center shadow-md">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xl font-bold text-black font-display uppercase tracking-tight">Message Received!</p>
        <p className="text-sm text-slate-500 font-light">Our senior project engineers will respond within 24 business hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name *</label>
          <input
            type="text" name="name" value={formData.name} onChange={handleChange} required
            placeholder="John Doe"
            className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address *</label>
          <input
            type="email" name="email" value={formData.email} onChange={handleChange} required
            placeholder="john@company.com"
            className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
          <input
            type="tel" name="phone" value={formData.phone} onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Service Category</label>
          <select
            name="service" value={formData.service} onChange={handleChange}
            className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all"
          >
            <option value="">Select a service category</option>
            <option value="residential">Residential Construction</option>
            <option value="commercial">Commercial Development</option>
            <option value="industrial">Industrial Facilities</option>
            <option value="renovation">Renovation & Remodeling</option>
            <option value="design-build">Design Build Turnkey</option>
            <option value="management">Project Management</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Project Details *</label>
        <textarea
          name="message" value={formData.message} onChange={handleChange} required rows={4}
          placeholder="Specify project scope, location, timeline, and estimated plot area..."
          className="w-full px-4 py-3.5 rounded-none border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-construction-red/30 focus:border-construction-red transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-construction-red hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-none text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all"
      >
        {loading ? "Sending..." : "Submit Project Inquiry"}
      </button>
    </form>
  );
}
