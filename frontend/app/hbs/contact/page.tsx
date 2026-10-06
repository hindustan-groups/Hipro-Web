// Server Component — no "use client" directive.
// Fetches HBS content + services in parallel, then renders the page
// with dynamic sidebar contact details and a dynamic multi-service form.

import { Suspense } from "react";
import Link from "next/link";
import {
  Loader2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ChevronRight,
  ShieldCheck,
  HardHat,
  Wrench,
} from "lucide-react";
import type { HbsContent, HbsService } from "@/lib/types";
import { fetchHbsContent } from "@/lib/hbsData";
import HbsContactForm from "./HbsContactForm";

export const revalidate = 60;

export async function generateMetadata() {
  const content = await fetchHbsContent();
  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const canonicalUrl = isSubdomain
    ? "https://hindbuilding.hindustanprojects.in/contact"
    : "https://www.hindustanprojects.in/hbs/contact";
  const baseUrl = isSubdomain
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in/hbs";

  return {
    title: "Contact & Book Site Inspection | Hind Build",
    description:
      content.metaDescription ||
      "Contact Hind Build for non-destructive site inspection and itemized repair estimates. Field engineers dispatched across Bhilwara for structural repair, waterproofing, and 19 specialized trades.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: "Contact & Book Inspection | Hind Build",
      description:
        "Schedule an engineering diagnosis or get an itemized quote for building repair, waterproofing, and specialized maintenance.",
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: content.ogDefaultImage || `${baseUrl}/hbs-og-default.svg`,
          width: 1200,
          height: 630,
          alt: "Contact Hind Build",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Contact & Book Inspection | Hind Build",
      description:
        "Schedule an engineering diagnosis or get an itemized quote for building repair.",
    },
  };
}

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

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const phone = content?.phone || "+91 75970 00601";
  const whatsapp = content?.whatsapp || "+91 75970 00601";
  const phoneRaw = phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = whatsapp.replace(/[^\d]/g, "") || "917597000601";
  const email = content?.email || "hbs@hindustanprojects.in";
  const address =
    content?.address ||
    "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001";
  const workingHours =
    content?.businessHours || "Monday to Saturday: 9:00 AM – 7:00 PM";

  return (
    <div className="space-y-12 sm:space-y-16 py-8 sm:py-12">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO SECTION (Dark Industrial Composition with Grid Backdrop)
      ───────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="contact-hero-heading"
        className="relative bg-slate-950 text-white border-b border-slate-800 -mt-8 sm:-mt-12 overflow-hidden"
      >
        {/* Subtle Engineering Grid Backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#f59e0b 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium"
          >
            <Link href={homeHref} className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-bold">Contact &amp; Quote</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <HardHat className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Rapid Field Engineering Helpdesk</span>
            </div>

            <h1
              id="contact-hero-heading"
              className="text-3xl sm:text-5xl font-black uppercase font-display tracking-tight text-white leading-tight"
            >
              Contact &amp; <span className="text-amber-400">Get A Quote</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Need urgent repair diagnosis, non-destructive moisture scanning, or an itemized BOQ
              estimate? Select your services below or contact our central engineering desk for rapid
              dispatch across Rajasthan.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          2. MAIN GRID (Multi-Service Form + Contact Helpdesk)
      ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <Suspense
              fallback={
                <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-700" />
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
              <h2 className="text-lg font-bold uppercase font-display border-b border-slate-800 pb-3">
                Central Helpdesk &amp; Dispatch
              </h2>

              <div className="space-y-4 text-xs text-slate-300">
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="min-w-[44px] min-h-[44px] w-11 h-11 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest block font-bold">
                      Direct Hotline
                    </span>
                    <a
                      href={`tel:${phoneRaw}`}
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
                      href={`https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Build,%20I%20would%20like%20to%20schedule%20an%20inspection.`}
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
                      Technical Email
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
                Hind Build is an official engineering brand under{" "}
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
