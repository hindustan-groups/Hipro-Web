"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
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
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          message: formData.message,
        }),
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

  const contactItems = [
    { icon: MapPin, label: "Headquarters", value: "101 Executive Tower, Infrastructure Complex\nNew Delhi, India", accent: "red" },
    { icon: Phone, label: "Direct Phone", value: "+91 98765 43210\n+91 11 2345 6789", accent: "navy" },
    { icon: Mail, label: "Official Email", value: "contact@hindustanprojects.com\nprojects@hindustanprojects.com", accent: "red" },
    { icon: Clock, label: "Business Hours", value: "Mon–Fri: 9:00 AM – 6:00 PM\nSat: 9:00 AM – 2:00 PM", accent: "navy" },
  ];

  return (
    <>
      {/* Header */}
      <section className="bg-white pt-36 pb-20 px-4 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-red-50 border border-red-100 text-construction-red mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-none bg-construction-red animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Engineering Inquiry</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-5 font-display uppercase tracking-tight">
            Get In <span className="text-construction-red">Touch</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto font-light leading-relaxed">
            Connect with our technical engineering team for project quotes, site evaluations, or partnership inquiries.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12">

          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-5">
            {contactItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-6 rounded-none border border-slate-200/80 bg-slate-50/50 flex items-start gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-none flex items-center justify-center shrink-0 bg-red-50 border border-red-100 text-construction-red">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                    {item.value.split("\n").map((line, li) => (
                      <p key={li} className="text-sm font-semibold text-black">{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-none border border-slate-200/80 bg-white p-8 md:p-12 shadow-xl shadow-slate-900/5">
              <h2 className="text-2xl font-bold text-black mb-1 font-display uppercase tracking-tight">Send Us A Message</h2>
              <p className="text-sm text-slate-500 font-light mb-8">Fill out your project specifications and our technical leads will reach out within 24 hours.</p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-14 h-14 rounded-none bg-red-50 border border-red-100 text-construction-red flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-black font-display uppercase tracking-tight">Message Received!</p>
                  <p className="text-sm text-slate-500 font-light">Our senior project engineers will respond within 24 business hours.</p>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-80 bg-gray-100 border-t border-gray-100">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878428698!3d40.74076684379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sGoogle!5e0!3m2!1sen!2sus!4v1558489041815!5m2!1sen!2sus"
          width="100%" height="100%"
          style={{ border: 0 }}
          allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
        />
      </section>
    </>
  );
}
