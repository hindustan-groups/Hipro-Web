import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Award,
  Clock,
  Wrench,
  Building2,
  ChevronRight,
  HardHat,
  MessageSquare,
  Phone,
} from "lucide-react";
import { fetchHbsContent } from "@/lib/hbsData";

export const revalidate = 60;

export async function generateMetadata() {
  const content = await fetchHbsContent();
  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const canonicalUrl = isSubdomain
    ? "https://hindbuilding.hindustanprojects.in/about"
    : "https://www.hindustanprojects.in/hbs/about";
  const baseUrl = isSubdomain
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in/hbs";

  return {
    title: "About Hind Build | Specialized Building Repair & Civil Protection",
    description:
      content.metaDescription ||
      "Learn about Hind Build, an engineering-driven civil and building maintenance division of Hindustan Projects (HiPRO) delivering turnkey repairs, diagnostics, and written warranties across Rajasthan.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: "About Hind Build | Engineering-Grade Building Solutions",
      description:
        "Learn about Hind Build, an engineering-driven civil division under Hindustan Projects (HiPRO).",
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: content.ogDefaultImage || `${baseUrl}/hbs-og-default.svg`,
          width: 1200,
          height: 630,
          alt: "About Hind Build",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "About Hind Build | Civil & Building Maintenance Division",
      description:
        "Learn about Hind Build, an engineering-driven civil division under Hindustan Projects (HiPRO).",
    },
  };
}

export default async function HbsAboutPage() {
  const content = await fetchHbsContent();

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const phoneRaw = content.phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

  let teamItems = [];
  try {
    if (content.team) teamItems = JSON.parse(content.team);
  } catch {}

  let whyChooseItems = [];
  try {
    if (content.whyChoosePoints) {
      whyChooseItems = JSON.parse(content.whyChoosePoints);
    } else if (content.whyChooseUs) {
      whyChooseItems = JSON.parse(content.whyChooseUs);
    }
  } catch {}

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO SECTION (Dark Industrial Composition with Grid Backdrop)
      ───────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="about-hero-heading"
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium"
          >
            <Link href={homeHref} className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-bold">About Hind Build</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Heading, Value Prop, CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Specialized Division of Hindustan Projects (HiPRO)</span>
              </div>

              <div className="space-y-3">
                <h1
                  id="about-hero-heading"
                  className="text-3xl sm:text-5xl lg:text-5xl font-black uppercase font-display tracking-tight text-white leading-tight"
                >
                  Engineering Heritage &amp;{" "}
                  <span className="text-amber-400">About Hind Build</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  Bridging the gap between unorganized local handymen and large-scale civil
                  contractors with turnkey engineering discipline, non-destructive diagnostic
                  testing, itemized BOQs, and written warranties across Rajasthan.
                </p>
              </div>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href={`${prefix}/contact`}
                  className="hbs-btn-primary min-h-[48px] px-6 text-xs font-black uppercase tracking-wider shadow-md"
                >
                  <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>Book Site Evaluation</span>
                </Link>

                <Link
                  href={`${prefix}/services`}
                  className="hbs-btn-secondary min-h-[48px] px-6 text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  <span>Explore 19 Services</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                </Link>

                <a
                  href={`tel:${phoneRaw}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[48px] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-mono font-semibold transition-colors"
                  aria-label="Call Hind Build Office"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{content.phone}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Key Engineering Fact Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 space-y-2">
                <span className="text-amber-400 font-mono text-2xl font-black block">
                  HiPRO
                </span>
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-200">
                  Parent Oversight
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Supervised under senior engineering governance and quality benchmarks.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 space-y-2">
                <span className="text-amber-400 font-mono text-2xl font-black block">
                  19 Trades
                </span>
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-200">
                  Turnkey Solutions
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Single window accountability for waterproofing, cracks, and restoration.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 space-y-2">
                <span className="text-amber-400 font-mono text-2xl font-black block">
                  NDT First
                </span>
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-200">
                  Diagnosis Origin
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Electronic moisture scanners to identify root cause before treatment.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 space-y-2">
                <span className="text-amber-400 font-mono text-2xl font-black block">
                  Written
                </span>
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-200">
                  Documented Warranty
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Formal certificate issued with post-execution quality test sign-off.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          2. STORY & PHILOSOPHY (Clear Engineering Rationale)
      ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-amber-700 font-mono text-xs uppercase tracking-widest font-bold block">
              Engineering Heritage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase font-display tracking-tight">
              Why We Founded Hind Build
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {content.aboutStory ||
                "Hind Build was founded under Hindustan Projects (HiPRO) to bridge the massive gap between informal local handymen and large civil contractors. Modern buildings represent substantial investments, yet minor moisture ingress, foundation settlements, and electrical wear frequently turn into catastrophic structural hazards. Hind Build brings certified engineering discipline, non-destructive diagnosis, and turnkey accountability to building maintenance across Rajasthan."}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Every site inspection is carried out with digital moisture sensors, thermal imaging,
              and acoustic scanners to treat root causes rather than superficial cosmetic
              cover-ups.
            </p>

            <div className="p-4 bg-slate-900 text-white border-l-4 border-amber-500 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Parent Company Supervision</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operating with the rigorous technical standards, vendor procurement power, and
                engineering oversight of Hindustan Projects (HiPRO).
              </p>
            </div>
          </div>

          {/* Right Column: Mission & Vision Cards */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 border border-amber-200">
                Corporate Mission
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase font-display">
                Extend Structural Longevity &amp; Protect Investments
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {content.mission ||
                  "To extend the functional life, aesthetic dignity, and structural safety of every residential, commercial, and industrial property through dependable, engineering-grade maintenance."}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-2.5 py-1 border border-slate-200">
                Corporate Vision
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase font-display">
                Rajasthan&apos;s Most Dependable Single-Window Brand
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {content.vision ||
                  "To be Rajasthan's most trusted single-window building maintenance and protection brand, synonymous with integrity, speed, and lasting craftsmanship."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          3. WHY CHOOSE HIND BUILD (Value Proposition Grid)
      ───────────────────────────────────────────────────────────────── */}
      {whyChooseItems.length > 0 && (
        <section className="bg-slate-950 text-white py-16 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12 space-y-2">
              <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold block">
                The Engineering Standard
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase font-display tracking-tight text-white">
                Core Guiding Principles
              </h2>
              <p className="text-sm text-slate-400">
                Built on engineering accuracy, certified materials, and institutional accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChooseItems.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 p-6 space-y-3 hover:border-amber-500/40 transition-colors"
                >
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-sm">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-white uppercase font-display">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          4. TEAM / SUPERVISORY STRUCTURE (Rendered only when CMS contains team)
      ───────────────────────────────────────────────────────────────── */}
      {teamItems.length > 0 && (
        <section className="bg-slate-100 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-amber-700 font-mono text-xs uppercase tracking-wider font-bold block mb-1">
                Operational Backbone
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display">
                Execution &amp; Supervisory Standards
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamItems.map((member: any, idx: number) => (
                <div key={idx} className="bg-white p-6 border border-slate-200 space-y-2 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 uppercase font-display">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-amber-700 uppercase font-mono">
                    {member.role}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {member.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          5. CALL TO ACTION (Direct Site Evaluation Action)
      ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-l-amber-500 border border-slate-800 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-xl sm:text-3xl font-black uppercase font-display">
              Have Questions About A Repair or Renovation?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Speak directly with a Hind Build engineer or request a non-destructive site evaluation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href={`${prefix}/contact`}
              className="hbs-btn-primary min-h-[48px] px-6 text-xs font-black uppercase tracking-wider shadow-md"
            >
              <Wrench className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Book Site Evaluation</span>
            </Link>
            <a
              href={`https://wa.me/${whatsappRaw}?text=Hello%20Hind%20Build,%20I%20have%20a%20question%20about%20your%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hbs-btn-whatsapp min-h-[48px] px-5 text-xs font-bold uppercase tracking-wider shadow-md"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
