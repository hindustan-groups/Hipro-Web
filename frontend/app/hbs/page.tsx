import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  CheckCircle,
  Phone,
  MessageSquare,
  ArrowRight,
  Clock,
  Sparkles,
  Droplets,
  Building2,
  Cpu,
  Award,
  Layers,
  Star
} from "lucide-react";
import { fetchHbsContent, fetchHbsServices, fetchHbsProjects, fetchHbsTestimonials } from "@/lib/hbsData";

export const revalidate = 60;

export default async function HbsHomePage() {
  const [content, services, projects, testimonials] = await Promise.all([
    fetchHbsContent(),
    fetchHbsServices(),
    fetchHbsProjects(),
    fetchHbsTestimonials(),
  ]);

  const phoneRaw = content.phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  // Parse JSON configs safely
  let whyChooseItems = [];
  try {
    if (content.whyChooseUs) whyChooseItems = JSON.parse(content.whyChooseUs);
  } catch {}

  let statsItems = [];
  try {
    if (content.stats) statsItems = JSON.parse(content.stats);
  } catch {}

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        {/* Subtle Engineering Grid Backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 sm:pt-20 sm:pb-28 relative z-10">
          <div className="max-w-3xl space-y-6">
            {/* Heritage Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs font-mono uppercase tracking-wider text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>A Specialized Division of <strong>Hindustan Projects (HiPRO)</strong></span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-display leading-[1.1]">
              Complete Building <span className="text-amber-500">Repair</span>, Maintenance & <span className="text-slate-300">Protection</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
              {content.heroSubtitle || "Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions for homes, commercial complexes, and institutions across Rajasthan."}
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Non-Destructive Testing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Written Work Warranty</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>19 Specialized Services</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <Link
                href={`${prefix}/contact`}
                className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all"
              >
                <Wrench className="w-4 h-4 text-slate-950" />
                <span>Book Free Site Inspection</span>
              </Link>

              <Link
                href={`${prefix}/services`}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider font-bold transition-all"
              >
                <span>Explore All 19 Services</span>
                <ArrowRight className="w-4 h-4 text-amber-500" />
              </Link>
            </div>
          </div>
        </div>

        {/* Emergency Repair Strip */}
        <div className="bg-amber-500 text-slate-950 px-4 py-3 border-t border-amber-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <Clock className="w-4 h-4 shrink-0" />
              <span>CRITICAL STRUCTURAL CRACK OR ACTIVE SEEPAGE? EMERGENCY INSPECTION DISPATCH AVAILABLE IN BHILWARA</span>
            </div>
            <a
              href={`tel:${phoneRaw}`}
              className="inline-flex items-center gap-1.5 bg-slate-950 text-white px-3 py-1 text-[11px] uppercase tracking-wider hover:bg-slate-900 transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Call +91 75970 00601</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. ALL 19 SERVICES CATALOG SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              Full Spectrum Portfolio
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase font-display tracking-tight">
              Our 19 Specialized <span className="text-amber-600">Building Services</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Turnkey repair, preventative protection, and mechanical maintenance. Engineered for homes, housing societies, retail showrooms, and industrial plants.
            </p>
          </div>

          <Link
            href={`${prefix}/services`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800 shrink-0"
          >
            <span>Detailed Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 19 Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            let featuresArray: string[] = [];
            try {
              if (service.features) {
                featuresArray = typeof service.features === "string" ? JSON.parse(service.features) : service.features;
              }
            } catch {}

            return (
              <div
                key={service.id || index}
                id={service.slug}
                className="bg-white border border-slate-200 hover:border-amber-500 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group relative"
              >
                {/* Service Top: Number & Titles */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-200">
                      {service.serviceNumber || String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">
                      HBS CERTIFIED
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 uppercase font-display tracking-tight group-hover:text-amber-600 transition-colors">
                    {service.title}
                  </h3>

                  {service.hindiTitle && (
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {service.hindiTitle}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {service.shortDescription || "Specialized engineering maintenance, repair, and diagnostic care."}
                  </p>

                  {/* Bullet features */}
                  {featuresArray.length > 0 && (
                    <ul className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                      {featuresArray.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold shrink-0">✓</span>
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 group-hover:text-amber-600 transition-colors"
                  >
                    <span>Get Free Estimate</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(`Hello HBS, I need assistance with: ${service.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    title={`WhatsApp inquiry for ${service.title}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. WHY CHOOSE US / ENGINEERING STANDARDS */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-amber-500 font-mono text-xs uppercase tracking-widest font-bold block mb-2">
              Engineering Over Handymen
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase font-display tracking-tight text-white">
              Why Choose <span className="text-amber-500">Hind Building Solutions</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Traditional contractors fix symptoms temporarily. We diagnose root causes with scientific equipment and certified civil engineering methodologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseItems.length > 0 ? (
              whyChooseItems.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-6 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white uppercase font-display">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))
            ) : (
              <>
                <div className="bg-slate-950 p-6 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white uppercase font-display">
                    HiPRO Engineering Supervision
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Direct oversight by civil engineers from Hindustan Projects ensuring safe, durable execution.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white uppercase font-display">
                    Non-Destructive Testing
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Moisture detection meters and pipeline cameras identify leaks without breaking intact tiles and walls.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white uppercase font-display">
                    Written Work Warranty
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clear documented warranties on structural rehabilitation, waterproofing membranes, and pest barriers.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white uppercase font-display">
                    Rapid Response Fleet
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Field vans and rapid diagnostic technicians stationed across Bhilwara for fast turnaround.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Stats Bar */}
          {statsItems.length > 0 && (
            <div className="mt-14 pt-10 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {statsItems.map((stat: any, idx: number) => (
                <div key={idx}>
                  <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-semibold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. WORK & CASE STUDIES SHOWCASE */}
      {projects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-amber-600 font-mono text-xs uppercase tracking-wider font-bold block mb-1">
                Verified Site Execution
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase font-display tracking-tight">
                Recent Repair & Protection Projects
              </h2>
            </div>
            <Link
              href={`${prefix}/projects`}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{p.location || "Bhilwara, Rajasthan"}</span>
                    <span className="text-amber-700 font-bold uppercase">{p.serviceCategory || "Repair"}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 uppercase font-display">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-3">
                    {p.description || "Comprehensive site rehabilitation and moisture protection execution."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. TESTIMONIALS (If any) */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-amber-600 font-mono text-xs uppercase tracking-wider font-bold block mb-1">
              Client Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display">
              What Building Owners Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase">{t.name}</span>
                  <span className="text-slate-500">{t.designation || "Property Owner"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-12 border-l-8 border-amber-500 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
              Engineering Support On Call
            </span>
            <h3 className="text-2xl sm:text-4xl font-black uppercase font-display leading-tight">
              Ready for a Non-Destructive Site Inspection?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Book an assessment for active leakages, structural fractures, electrical faults, or turnkey property renovation. Transparent itemized quotes with zero hidden charges.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href={`${prefix}/contact`}
              className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-6 py-3.5 text-xs uppercase tracking-wider shadow-md transition-colors"
            >
              <Wrench className="w-4 h-4 text-slate-950" />
              <span>Book Site Inspection</span>
            </Link>

            <a
              href={`https://wa.me/${whatsappRaw}?text=Hello%20HBS,%20I%20would%20like%20to%20schedule%20a%20site%20inspection.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 text-xs uppercase tracking-wider shadow-md transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
