"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", service: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactItems = [
    { icon: MapPin, label: "Address", value: "123 Construction Ave\nBuilding District, BD 12345", accent: "red" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567\n+1 (555) 765-4321", accent: "blue" },
    { icon: Mail, label: "Email", value: "info@hindustanprojects.com\nprojects@hindustanprojects.com", accent: "red" },
    { icon: Clock, label: "Hours", value: "Mon–Fri: 8:00 AM – 6:00 PM\nSat: 9:00 AM – 2:00 PM", accent: "blue" },
  ];

  return (
    <>
      {/* Header */}
      <section className="bg-white pt-36 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[12px] text-gray-600 font-medium">Free Consultation</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5">
            Get in <span className="text-blue-600">Touch</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto font-light">
            Talk to our team about your construction project. We'll get back within 24 hours.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="pb-24 bg-white px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">

          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            {contactItems.map((item, i) => {
              const Icon = item.icon;
              const isRed = item.accent === "red";
              return (
                <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/60 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isRed ? "bg-red-50" : "bg-blue-50"}`}>
                    <Icon className={`w-4 h-4 ${isRed ? "text-red-600" : "text-blue-600"}`} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                    {item.value.split("\n").map((line, li) => (
                      <p key={li} className="text-[14px] text-gray-700 font-light">{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-gray-100 bg-gray-50/40 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Send a Message</h2>
              <p className="text-[14px] text-gray-500 font-light mb-8">Fill out the form and our team will reach out to you shortly.</p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[16px] font-semibold text-gray-900">Message Sent!</p>
                  <p className="text-[13px] text-gray-500">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Full Name *</label>
                      <input
                        type="text" name="name" value={formData.name} onChange={handleChange} required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Email *</label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange} required
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Phone</label>
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Service</label>
                      <select
                        name="service" value={formData.service} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select a service</option>
                        <option value="residential">Residential Construction</option>
                        <option value="commercial">Commercial Construction</option>
                        <option value="industrial">Industrial Projects</option>
                        <option value="renovation">Renovation & Restoration</option>
                        <option value="design-build">Design Build Services</option>
                        <option value="management">Project Management</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Project Details *</label>
                    <textarea
                      name="message" value={formData.message} onChange={handleChange} required rows={5}
                      placeholder="Tell us about your project — scope, timeline, budget..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-full text-[14px] transition-colors"
                  >
                    Send Message
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
