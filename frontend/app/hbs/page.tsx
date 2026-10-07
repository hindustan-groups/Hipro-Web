import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Phone,
  CheckCircle2,
  Star,
  Quote,
  ShieldCheck,
  Building,
  Building2,
  Factory,
  Home,
  Check,
  Award,
  Users,
  Clock,
  Sparkles,
  Wrench,
  Layers,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import {
  fetchHbsContent,
  fetchHbsServices,
  fetchHbsProjects,
  fetchHbsTestimonials,
} from "@/lib/hbsData";
import { cleanTelNumber, getHomeWhatsAppUrl } from "@/lib/hbsWhatsApp";
import HbsHero from "@/components/hbs/HbsHero";
import HbsHomeServicesShowcase from "@/components/hbs/HbsHomeServicesShowcase";
import HbsHomeProjectsShowcase from "@/components/hbs/HbsHomeProjectsShowcase";
import HbsHomeQuoteForm from "@/components/hbs/HbsHomeQuoteForm";
import HbsHomeTestimonialsShowcase from "@/components/hbs/HbsHomeTestimonialsShowcase";
import HbsHomePreFooterCta from "@/components/hbs/HbsHomePreFooterCta";
import type { HbsHeroConfig } from "@/lib/types";

export const revalidate = 60;

export default async function HbsHomePage() {
  const [content, services, projects, testimonials] = await Promise.all([
    fetchHbsContent(),
    fetchHbsServices(),
    fetchHbsProjects(),
    fetchHbsTestimonials(),
  ]);

  const phoneRaw = cleanTelNumber(content.phone || "+919462577757");
  const homeWaUrl = getHomeWhatsAppUrl(content.whatsapp || "919462577757");

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  let heroConfig: HbsHeroConfig = {
    enabled: true,
    displayMode: "TEXT_AND_IMAGE",
    badge: "COMPLETE CARE FOR YOUR BUILDING",
    primaryCtaLabel: "Get a Free Site Visit",
    primaryCtaUrl: "/contact",
    secondaryCtaLabel: "Our Services",
    secondaryCtaUrl: "/services",
  };
  if (content.heroCtas) {
    try {
      const parsed = typeof content.heroCtas === "string" ? JSON.parse(content.heroCtas) : content.heroCtas;
      heroConfig = { ...heroConfig, ...parsed };
    } catch {}
  }

  // Parse 4 counter stats dynamically from CMS (zero fake claims!)
  let statsList = [
    { value: "8+", label: "Years Experience" },
    { value: "500+", label: "Projects Completed" },
    { value: "1000+", label: "Happy Clients" },
    { value: "50+", label: "Expert Team Members" },
  ];
  if (content.stats) {
    try {
      const parsedStats = typeof content.stats === "string" ? JSON.parse(content.stats) : content.stats;
      if (Array.isArray(parsedStats) && parsedStats.length > 0) {
        statsList = parsedStats.map((st: any) => ({
          value: st.value || "0",
          label: st.label || "",
        }));
      }
    } catch {}
  }

  // Parse 6 benefits dynamically from CMS
  const DEFAULT_BENEFITS = [
    {
      icon: "Users",
      title: "Skilled Professionals",
      desc: "Trained & background-verified technicians",
    },
    {
      icon: "Award",
      title: "Quality Materials",
      desc: "Branded ISI-grade products with warranty",
    },
    {
      icon: "Clock",
      title: "On-Time Delivery",
      desc: "Strict milestone tracking & fast turnaround",
    },
    {
      icon: "ShieldCheck",
      title: "Transparent Pricing",
      desc: "Itemized written quotes, zero hidden fees",
    },
    {
      icon: "CheckCircle2",
      title: "Safety First",
      desc: "Strict site safety protocols followed",
    },
    {
      icon: "Sparkles",
      title: "After-Service Support",
      desc: "Free rework guarantee & dedicated support",
    },
  ];

  let benefitsList = DEFAULT_BENEFITS;
  if (content.whyChooseUs) {
    try {
      const parsedWhy = typeof content.whyChooseUs === "string" ? JSON.parse(content.whyChooseUs) : content.whyChooseUs;
      if (Array.isArray(parsedWhy) && parsedWhy.length > 0) {
        benefitsList = parsedWhy.map((b: any, idx: number) => ({
          icon: b.icon || DEFAULT_BENEFITS[idx % DEFAULT_BENEFITS.length].icon,
          title: b.title || "",
          desc: b.description || b.desc || "",
        }));
      } else if (parsedWhy && typeof parsedWhy === "object" && Array.isArray(parsedWhy.homepageBenefits) && parsedWhy.homepageBenefits.length > 0) {
        benefitsList = parsedWhy.homepageBenefits.map((b: any, idx: number) => ({
          icon: b.icon || DEFAULT_BENEFITS[idx % DEFAULT_BENEFITS.length].icon,
          title: b.title || "",
          desc: b.description || b.desc || "",
        }));
      }
    } catch {}
  }

  // Parse About section copy & 4 features
  let aboutTitle = "Your Building, Our Responsibility";
  let aboutDesc = "Hind Building Solutions (HiBUILD) is a specialized maintenance and repair brand under Hindustan Projects. We provide reliable, professional and cost-effective building care services for residential, commercial and industrial properties.";
  let aboutFeatures = [
    "Trained & Experienced Team",
    "Modern Tools & Technology",
    "Safe & Quality Materials",
    "Timely Project Completion",
  ];

  if (content.aboutStory) {
    try {
      const parsedStory = typeof content.aboutStory === "string" ? JSON.parse(content.aboutStory) : content.aboutStory;
      if (typeof parsedStory === "object" && parsedStory !== null) {
        if (parsedStory.title) aboutTitle = parsedStory.title;
        if (parsedStory.description) aboutDesc = parsedStory.description;
        if (Array.isArray(parsedStory.features) && parsedStory.features.length > 0) {
          aboutFeatures = parsedStory.features;
        }
      } else if (typeof parsedStory === "string" && parsedStory.trim()) {
        aboutDesc = parsedStory;
      }
    } catch {
      if (typeof content.aboutStory === "string" && content.aboutStory.trim()) {
        aboutDesc = content.aboutStory;
      }
    }
  }

  return (
    <div className="bg-white text-slate-900 selection:bg-red-100 selection:text-red-900 overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO — CLEAN LIGHT ARCHITECTURAL SHOWCASE
      ───────────────────────────────────────────────────────────────── */}
      <HbsHero
        content={content}
        heroConfig={heroConfig}
        prefix={prefix}
        phoneRaw={phoneRaw}
        homeWaUrl={homeWaUrl}
      />

      {/* ─────────────────────────────────────────────────────────────────
          2. CATEGORY RIBBON — DEEP ELEGANT BLUE FULL-WIDTH BANNER
      ───────────────────────────────────────────────────────────────── */}
      <section aria-label="Building Categories" className="bg-[#0D2D5E] text-white py-5 sm:py-6 border-b border-black/15 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 items-center">
            {/* Category 1 */}
            <div className="flex items-center gap-3">
              <Home className="w-6 h-6 text-white shrink-0 stroke-[1.8]" />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">Residential</h3>
                <p className="text-[11px] text-slate-200 truncate">Homes &amp; Apartments</p>
              </div>
            </div>

            {/* Category 2 */}
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-white shrink-0 stroke-[1.8]" />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">Commercial</h3>
                <p className="text-[11px] text-slate-200 truncate">Offices &amp; Showrooms</p>
              </div>
            </div>

            {/* Category 3 */}
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-white shrink-0 stroke-[1.8]" />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">Societies</h3>
                <p className="text-[11px] text-slate-200 truncate">Apartments &amp; Gated Communities</p>
              </div>
            </div>

            {/* Category 4 */}
            <div className="flex items-center gap-3">
              <Factory className="w-6 h-6 text-white shrink-0 stroke-[1.8]" />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">Industrial</h3>
                <p className="text-[11px] text-slate-200 truncate">Factories &amp; Warehouses</p>
              </div>
            </div>

            {/* Category 5 */}
            <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
              <Home className="w-6 h-6 text-white shrink-0 stroke-[1.8]" />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">Independent House</h3>
                <p className="text-[11px] text-slate-200 truncate">From Repair to Renovation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          3. OUR SERVICES — 16-CARD 4x4 COLORFUL BADGED SHOWCASE
      ───────────────────────────────────────────────────────────────── */}
      <HbsHomeServicesShowcase
        services={services}
        prefix={prefix}
        whatsappNumber={content.whatsapp}
        phoneNumber={content.phone}
      />

      {/* ─────────────────────────────────────────────────────────────────
          4. ABOUT SECTION — "YOUR BUILDING, OUR RESPONSIBILITY"
      ───────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="about-heading" className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Bento Photo Collage */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3.5 sm:gap-4">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900 group">
                <Image
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop"
                  alt="Technician inspecting building repair"
                  fill
                  sizes="(max-width: 1024px) 50vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="space-y-3.5 sm:space-y-4 flex flex-col justify-between">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 group">
                  <Image
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop"
                    alt="Structural inspection"
                    fill
                    sizes="(max-width: 1024px) 50vw, 250px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 group">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop"
                    alt="Modern protected architecture"
                    fill
                    sizes="(max-width: 1024px) 50vw, 250px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Right: Narrative & 4 Feature Badges */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-7">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-red-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                    ABOUT HiBUILD
                  </span>
                </div>
                <h2
                  id="about-heading"
                  className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display"
                >
                  {aboutTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  {aboutDesc}
                </p>
              </div>

              {/* 2x2 Feature Check Grid with Blue Rounded Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {aboutFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Red CTA Button */}
              <div className="pt-2">
                <Link
                  href={`${prefix}/about`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <span>Know More About Us</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Big Counter Stats Bar */}
          <div className="pt-6 border-t border-slate-200/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {statsList.map((st, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl sm:text-4xl font-black text-blue-700 font-display">{st.value}</div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{st.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          5. WHY CHOOSE HiBUILD & FREE SITE VISIT FORM — ARCHITECTURAL DEEP BLUE
      ───────────────────────────────────────────────────────────────── */}
      <section id="why-choose-us" aria-labelledby="why-heading" className="py-16 sm:py-24 bg-gradient-to-br from-[#091E42] via-[#0D2D5E] to-[#06152F] text-white relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Why Choose HiBUILD 6 Benefits Grid (7 cols) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-0.75 bg-red-500 rounded-full" />
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-red-400">
                    WHY CHOOSE HiBUILD
                  </span>
                </div>
                <h2
                  id="why-heading"
                  className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white font-display leading-[1.18]"
                >
                  Professional Team for Reliable Work
                </h2>
                <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-xl">
                  From specialized structural repairs to complete home maintenance, our certified in-house engineering team ensures durable workmanship with warranty and zero hassle.
                </p>
              </div>

              {/* 6 Benefits Cards (2 cols x 3 rows with luxury glassmorphic style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {benefitsList.map((item, idx) => {
                  let IconComponent = Sparkles;
                  if (item.icon === "Users") IconComponent = Users;
                  else if (item.icon === "Award") IconComponent = Award;
                  else if (item.icon === "Clock") IconComponent = Clock;
                  else if (item.icon === "ShieldCheck") IconComponent = ShieldCheck;
                  else if (item.icon === "CheckCircle2") IconComponent = CheckCircle2;

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md border border-white/15 hover:border-white/30 transition-all duration-300 shadow-sm group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-red-600 group-hover:border-red-500 transition-all shadow-inner">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-white">{item.title}</h3>
                        <p className="text-[11px] text-blue-100/85 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Trust Micro-Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-blue-100/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Licensed Structural Engineers</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Up to 10 Years Warranty</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Rajasthan Wide Service</span>
                </span>
              </div>
            </div>

            {/* Right: Elevated White Free Site Visit & Quote Card (5 cols) */}
            <div className="lg:col-span-5">
              <HbsHomeQuoteForm services={services} phoneRaw={phoneRaw} whatsappUrl={homeWaUrl} />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          6. OUR RECENT WORK (PROJECTS) — 5-CARD FILTERABLE GRID
      ───────────────────────────────────────────────────────────────── */}
      <HbsHomeProjectsShowcase projects={projects} prefix={prefix} />

      {/* ─────────────────────────────────────────────────────────────────
          7. CLIENT TESTIMONIALS — DYNAMIC AUTOPLAY CAROUSEL
      ───────────────────────────────────────────────────────────────── */}
      <HbsHomeTestimonialsShowcase testimonials={testimonials} />

      {/* ─────────────────────────────────────────────────────────────────
          8. PRE-FOOTER CTA — ARCHITECTURAL CONVERSION MASTER CARD
      ───────────────────────────────────────────────────────────────── */}
      <HbsHomePreFooterCta
        phoneRaw={phoneRaw}
        phoneDisplay={content.phone || "+91 94625 77757"}
        whatsappNumber={content.whatsapp || "919462577757"}
        prefix={prefix}
      />
    </div>
  );
}
