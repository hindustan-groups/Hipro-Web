// Server Component — no "use client" directive.
// Fetches HBS content + services in parallel, then renders the page
// with dynamic sidebar contact details and a dynamic service dropdown.

import { Suspense } from "react";
import { Loader2, Phone, Mail, MapPin, MessageSquare, Clock } from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";
import HbsContactForm from "./HbsContactForm";

export const metadata = {
  title: "Contact & Get A Quote | Hind Building Solutions",
  description:
    "Contact Hind Building Solutions for a free on-site inspection. We dispatch field engineers across Bhilwara for structural repair, waterproofing, and 19 specialized services.",
};

export default async function HbsContactPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  let content: HbsContent | null = null;
  let services: HbsService[] = [];

  try {
    const [contentRes, servicesRes] = await Promise.allSettled([
      fetch(`${API}/api/hbs/content`, {
        next: { revalidate: 60, tags: ["hbs-content"] },
      }),
      fetch(`${API}/api/hbs/services`, {
        next: { revalidate: 60, tags: ["hbs-services"] },
      }),
    ]);

    if (contentRes.status === "fulfilled" && contentRes.value.ok) {
      const json = await contentRes.value.json();
      if (json.success && json.data) content = json.data as HbsContent;
    }

    if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
      const json = await servicesRes.value.json();
      if (json.success && Array.isArray(json.data)) {
        services = (json.data as HbsService[]).filter((s) => s.active !== false);
      }
    }
  } catch {
    // Falls back to fallback list inside HbsContactForm
  }

  const phone = content?.phone || "+91 75970 00601";
  const whatsapp = content?.whatsapp || "+91 75970 00601";
  const whatsappRaw = whatsapp.replace(/[^\d]/g, "") || "917597000601";
  const email = content?.email || "hbs@hindustanprojects.in";
  const address =
    content?.address ||
    "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001";
  const workingHours =
    content?.businessHours || "Monday to Saturday: 9:00 AM – 7:00 PM";

  return (
    <div className="space-y-12 sm:space-y-16 py-12">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-slate-200 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            Quick Response Helpdesk
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase font-display tracking-tight">
            Contact &amp; <span className="text-amber-600">Get A Quote</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Need urgent repair diagnosis or a comprehensive maintenance estimate? Contact our
            centralized helpdesk or submit your requirements below for rapid technician scheduling.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <Suspense
              fallback={
                <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                  Loading form...
                </div>
              }
            >
              <HbsContactForm services={services} content={content} />
            </Suspense>
          </div>

          {/* Right Column: Contact Details & Office */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Card */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-6 border-t-4 border-amber-500 shadow-xs">
              <h3 className="text-lg font-bold uppercase font-display border-b border-slate-800 pb-3">
                Central Helpdesk &amp; Booking
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="min-w-[44px] min-h-[44px] w-11 h-11 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      Direct Phone
                    </span>
                    <a
                      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                      className="text-white hover:text-amber-400 font-bold text-sm transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <div className="min-w-[44px] min-h-[44px] w-11 h-11 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      WhatsApp Quick Help
                    </span>
                    <a
                      href={`https://wa.me/${whatsappRaw}?text=Hello%20HBS,%20I%20would%20like%20to%20schedule%20an%20inspection.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-bold text-sm transition-colors"
                    >
                      {whatsapp} (Click to Chat)
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="min-w-[44px] min-h-[44px] w-11 h-11 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      Email Inquiries
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="text-white hover:text-amber-400 font-semibold transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="min-w-[44px] min-h-[44px] w-11 h-11 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      Registered Office
                    </span>
                    <p className="text-slate-300 leading-snug">{address}</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <div className="min-w-[44px] min-h-[44px] w-11 h-11 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      Working Hours
                    </span>
                    <p className="text-slate-300 leading-snug">
                      {workingHours}
                      <br />
                      <span className="text-amber-400 font-semibold">
                        Emergency repair response on call
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent company attribution card */}
            <div className="bg-amber-50 border border-amber-200 p-5 text-xs text-amber-900 space-y-1.5">
              <span className="font-bold uppercase tracking-wider block">Corporate Entity</span>
              <p className="leading-relaxed">
                Hind Building Solutions (HBS) is an official engineering sub-brand under{" "}
                <strong>Hindustan Projects (HiPRO)</strong>, registered and operating in
                Rajasthan since 2019.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
