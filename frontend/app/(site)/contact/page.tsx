import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { findAll } from "@/lib/db";
import type { Settings, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settingsData = await findAll<Settings>("settings");
  const settings = settingsData[0] || {};
  
  const address = settings.companyAddress || "101 Executive Tower, Infrastructure Complex\nNew Delhi, India";
  const phone = settings.companyPhone || "+91 98765 43210\n+91 11 2345 6789";
  const email = settings.companyEmail || "contact@hindustanprojects.com\nprojects@hindustanprojects.com";

  const servicesData = await findAll<Service>("services");
  const activeServices = servicesData.filter(s => s.active !== false).sort((a, b) => (a.order || 99) - (b.order || 99));

  const contactItems = [
    { icon: MapPin, label: "Headquarters", value: address, accent: "red" },
    { icon: Phone, label: "Direct Phone", value: phone, accent: "navy" },
    { icon: Mail, label: "Official Email", value: email, accent: "red" },
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
            Get In <span className="font-serif italic font-normal text-construction-red normal-case">Touch</span>
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

              <ContactForm services={activeServices} />
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
