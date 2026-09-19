import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  ArrowUpRight, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Compass,
  Laptop,
  FileCheck,
  Megaphone
} from "lucide-react";
import { findAll } from "@/lib/db";
import type { Settings, Service } from "@/lib/types";
import { COMPANY_INFO, cleanServiceTitle } from "@/lib/companyData";

function PinterestIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.373-.053.224-.174.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026l.032-.026z" />
    </svg>
  );
}

const defaultEcosystemCompanies = [
  {
    name: "Empanelment",
    description: "Vendor, contractor & institutional registration portal.",
    website: "https://empanelment.hindustanprojects.in/",
    status: "Live Portal",
    active: true,
    order: 1,
  },
  {
    name: "HiPro IT Services",
    description: "Enterprise software, web development & digital solutions.",
    website: "https://www.itservices.hindustanprojects.in/",
    status: "Live Portal",
    active: true,
    order: 2,
  },
  {
    name: "HiPro Marketing",
    description: "Brand strategy & commercial solutions.",
    website: "",
    status: "Upcoming",
    active: true,
    order: 3,
  },
];

function getCompanyVisuals(name: string = "", category: string = "") {
  const text = `${name} ${category}`.toLowerCase();
  if (text.includes("empanel") || text.includes("vendor") || text.includes("contract")) {
    return {
      Icon: FileCheck,
      iconColor: "text-construction-red",
      hoverBorder: "hover:border-construction-red/70",
      badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
    };
  }
  if (text.includes("market") || text.includes("brand") || text.includes("media")) {
    return {
      Icon: Megaphone,
      iconColor: "text-yellow-500",
      hoverBorder: "hover:border-yellow-500/70",
      badgeColor: "text-yellow-400 bg-yellow-950/60 border-yellow-500/30",
    };
  }
  if (/\bit\b/i.test(text) || text.includes("tech") || text.includes("digital") || text.includes("software")) {
    return {
      Icon: Laptop,
      iconColor: "text-blue-400",
      hoverBorder: "hover:border-blue-500/70",
      badgeColor: "text-blue-400 bg-blue-950/60 border-blue-500/30",
    };
  }
  return {
    Icon: Building2,
    iconColor: "text-construction-red",
    hoverBorder: "hover:border-construction-red/70",
    badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
  };
}

export default async function Footer({
  pageContent: propPageContent,
}: {
  pageContent?: any;
} = {}) {
  const [settingsData, servicesData] = await Promise.all([
    findAll<Settings>("settings"),
    findAll<Service>("services")
  ]);
  
  const settings = settingsData[0] || {};
  const rawPageContent = propPageContent || settings.pageContent;
  let resolvedPageContent: any = rawPageContent;
  if (typeof rawPageContent === "string") {
    try {
      resolvedPageContent = JSON.parse(rawPageContent);
    } catch {
      resolvedPageContent = {};
    }
  }

  const isCurrentSite = (c: any) => {
    const name = (c.name || "").toLowerCase().trim();
    const url = (c.website || c.url || "").trim();
    const status = (c.status || c.statusText || "").toLowerCase().trim();
    return (
      status === "flagship" ||
      name === "hindustan projects" ||
      url === "https://www.hindustanprojects.in" ||
      url === "https://www.hindustanprojects.in/" ||
      url === "/"
    );
  };

  const rawGroupCompanies = resolvedPageContent?.groupCompanies;
  let dynamicEcosystemCompanies: any[] = [];

  if (Array.isArray(rawGroupCompanies) && rawGroupCompanies.length > 0) {
    dynamicEcosystemCompanies = rawGroupCompanies
      .filter((c: any) => c && c.active !== false && !isCurrentSite(c))
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  }

  const ecosystemCompanies = dynamicEcosystemCompanies.length > 0
    ? dynamicEcosystemCompanies
    : defaultEcosystemCompanies;
  
  const address = settings.companyAddress || COMPANY_INFO.address;
  const phone = settings.companyPhone || COMPANY_INFO.formattedPhone;
  const email = settings.companyEmail || COMPANY_INFO.email;
  const telLink = `tel:${(settings.companyPhone || COMPANY_INFO.phone).replace(/\s+/g, '')}`;
  const mailtoLink = `mailto:${email}`;
  const whatsappLink = COMPANY_INFO.whatsappLink;
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  
  let socials: any = {};
  try {
    if (settings.socialLinks) socials = JSON.parse(settings.socialLinks);
  } catch { /* silent */ }

  const instagramUrl = socials.instagram || COMPANY_INFO.socials.instagram;
  const facebookUrl = socials.facebook || COMPANY_INFO.socials.facebook;
  const linkedinUrl = socials.linkedin || COMPANY_INFO.socials.linkedin;
  const pinterestUrl = socials.pinterest || COMPANY_INFO.socials.pinterest;

  const activeServices = servicesData
    .filter(s => s.active !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99))
    .slice(0, 6);

  const capabilities = activeServices.length > 0
    ? activeServices.map(s => {
        const cleanTitle = cleanServiceTitle(s.title);
        const slug = (cleanTitle || "").toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
        return {
          label: cleanTitle,
          href: `/services/${slug}`
        };
      })
    : [
        { label: "Architecture & Planning", href: "/services/architecture-planning" },
        { label: "Professional Construction", href: "/services/professional-construction-services" },
        { label: "Surveying & Site Measurements", href: "/services/surveying-site-measurements" },
        { label: "Interior & Exterior Design", href: "/services/interior-exterior-design" },
        { label: "Water Treatment Plant Execution", href: "/services/water-treatment-plant-construction" },
        { label: "Project Management & PMC", href: "/services/project-management-consultancy" }
      ];

  const socialLinks = [
    { icon: Instagram, url: instagramUrl, name: "Instagram" },
    { icon: Facebook, url: facebookUrl, name: "Facebook" },
    { icon: Linkedin, url: linkedinUrl, name: "LinkedIn" },
    { icon: PinterestIcon, url: pinterestUrl, name: "Pinterest" }
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 relative overflow-hidden border-t border-slate-800">
      
      {/* Background Subtle Engineering Grid Accent */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 1. PRE-FOOTER QUICK ACTION STRIP */}
      <div className="relative z-10 border-b border-slate-800/80 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-construction-red text-[11px] font-bold uppercase tracking-widest mb-2">
                <span className="w-2 h-2 rounded-full bg-construction-red animate-pulse" />
                Engineering Consultation &amp; Estimation
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-display uppercase tracking-tight">
                Ready to Build Your Project or Estimate Construction Costs?
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm font-light mt-1">
                Consult with our civil engineers in Bhilwara for transparent BOQ calculations and architectural blueprints.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3.5 shrink-0 w-full sm:w-auto">
              <Link
                href="/cost-estimator"
                className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-construction-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest px-5 py-3.5 shadow-md shadow-red-950/30 transition-all duration-200"
              >
                <Calculator className="w-4 h-4 text-white" />
                <span>Instant Cost Estimator</span>
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 font-bold text-xs uppercase tracking-widest px-5 py-3.5 transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Quote</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT COLUMNS (5 COLUMNS) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-16">

          {/* COLUMN 1: BRAND IDENTITY & CREDENTIALS (3 cols on lg) */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              {/* Brand Logo Container */}
              <Link href="/" className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl mb-6 shadow-md shadow-black/40 hover:opacity-95 transition-opacity">
                <Image 
                  src="/logo.jpg" 
                  alt="HiPRO Logo" 
                  width={48} 
                  height={48} 
                  className="h-10 md:h-11 w-auto object-contain mix-blend-multiply" 
                />
                <div className="w-[1px] h-9 bg-slate-200" />
                <div className="flex flex-col justify-center">
                  <span className="font-bold text-[16px] leading-tight tracking-[0.08em] text-construction-red font-display uppercase">
                    Hindustan
                  </span>
                  <span className="font-bold text-[12px] leading-tight tracking-[0.1em] text-construction-navy font-display uppercase">
                    Projects
                  </span>
                </div>
              </Link>

              <p className="text-xs text-slate-300 font-light leading-relaxed mb-6 max-w-sm">
                Engineering landmarks and turnkey civil solutions across residential, commercial, and industrial developments in Rajasthan since 2019.
              </p>

              {/* Verified Trust Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                  <Building2 className="w-3 h-3 text-construction-red" />
                  Est. 2019 · Bhilwara
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Turnkey Execution
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                  <Compass className="w-3 h-3 text-yellow-500" />
                  Licensed Planning
                </span>
              </div>
            </div>

            {/* Social Icons Strip */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Connect With Us
              </span>
              <div className="flex gap-2.5">
                {socialLinks.map(({ icon: Icon, url, name }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit Hindustan Projects on ${name}`}
                    className="w-9 h-9 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-construction-red hover:border-construction-red transition-all duration-200 group shadow-sm"
                  >
                    <Icon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: COMPANY (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-xs mb-5 uppercase tracking-widest font-display flex items-center gap-2">
              <span className="w-2 h-0.5 bg-construction-red" />
              Company
            </h3>
            <ul className="space-y-2.5 text-xs">
              {[
                ["About HiPRO", "/about"],
                ["Why Choose Us", "/why-us"],
                ["Projects Portfolio", "/projects"],
                ["Blogs & Insights", "/blogs"],
                ["Career Openings", "/careers"],
                ["Cost Estimator", "/cost-estimator"],
                ["Contact Office", "/contact"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link 
                    href={href} 
                    className="hover:text-white transition-colors inline-flex items-center gap-1 group font-medium py-0.5"
                  >
                    <span>{label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-construction-red" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: CAPABILITIES (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-xs mb-5 uppercase tracking-widest font-display flex items-center gap-2">
              <span className="w-2 h-0.5 bg-construction-red" />
              Capabilities
            </h3>
            <ul className="space-y-2.5 text-xs">
              {capabilities.map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href} 
                    className="hover:text-white transition-colors inline-flex items-center gap-1 group font-medium py-0.5"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-construction-red" />
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/services"
                  className="text-construction-red hover:text-red-400 font-bold uppercase tracking-wider text-[11px] inline-flex items-center gap-1 group"
                >
                  All Capabilities
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: GROUP ECOSYSTEM (IT, EMPANELMENT & MARKETING) (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-xs mb-5 uppercase tracking-widest font-display flex items-center gap-2">
              <span className="w-2 h-0.5 bg-construction-red" />
              Ecosystem
            </h3>
            <div className="space-y-3 text-xs">
              {ecosystemCompanies.map((c: any, i: number) => {
                const url = (c.website || c.url || "").trim();
                const name = c.name || "Ecosystem Portal";
                const category = c.category || "";
                const description = c.description || (category ? `${category} solutions.` : "");
                const visuals = getCompanyVisuals(name, category);
                const rawBadge = c.status || c.statusText;
                const badgeText = url
                  ? (rawBadge ? (rawBadge.includes("↗") ? rawBadge : `${rawBadge} ↗`) : "Live Portal ↗")
                  : (rawBadge || "Upcoming");

                if (url) {
                  return (
                    <a
                      key={c.name || i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group block p-3 bg-white/5 border border-white/10 ${visuals.hoverBorder} hover:bg-white/10 transition-all rounded-none`}
                    >
                      <div className="flex items-center justify-between text-slate-200 font-bold text-[11px] uppercase tracking-wider group-hover:text-white mb-1">
                        <span className="flex items-center gap-1.5 text-white">
                          <visuals.Icon className={`w-3.5 h-3.5 ${visuals.iconColor}`} />
                          {name}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-construction-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      {description && (
                        <p className="text-[10px] text-slate-400 font-normal leading-relaxed">
                          {description}
                        </p>
                      )}
                      <span className={`inline-block mt-2 text-[9px] font-bold ${visuals.badgeColor} px-2 py-0.5 uppercase tracking-wider`}>
                        {badgeText}
                      </span>
                    </a>
                  );
                }

                return (
                  <div
                    key={c.name || i}
                    className="p-3 bg-white/5 border border-white/10 rounded-none opacity-85"
                  >
                    <div className="flex items-center justify-between text-slate-300 font-bold text-[11px] uppercase tracking-wider mb-1">
                      <span className="flex items-center gap-1.5">
                        <visuals.Icon className={`w-3.5 h-3.5 ${visuals.iconColor}`} />
                        {name}
                      </span>
                      <span className="text-[9px] bg-white/10 text-slate-400 px-1.5 py-0.5 font-bold uppercase tracking-wider">
                        {badgeText}
                      </span>
                    </div>
                    {description && (
                      <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 5: HEADQUARTERS & CONTACT (3 cols on lg) */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-xs mb-5 uppercase tracking-widest font-display flex items-center gap-2">
              <span className="w-2 h-0.5 bg-construction-red" />
              Headquarters
            </h3>
            
            <ul className="space-y-3 text-xs">
              {/* Address with Google Maps link */}
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-construction-red" />
                </div>
                <div>
                  <span className="leading-relaxed block text-slate-300">{address}</span>
                  <a 
                    href={mapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-construction-red hover:underline font-bold mt-1 uppercase tracking-wider"
                  >
                    Get Directions <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-construction-red" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Direct Hotline</span>
                  <a href={telLink} className="hover:text-white font-medium text-slate-200 transition-colors">{phone}</a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-construction-red" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Correspondence</span>
                  <a href={mailtoLink} className="hover:text-white font-medium text-slate-200 transition-colors">{email}</a>
                </div>
              </li>

              {/* WhatsApp Quick Chat */}
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Direct WhatsApp</span>
                  <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-emerald-300 transition-colors text-emerald-400 font-semibold"
                  >
                    +91 {COMPANY_INFO.whatsappNumber}
                  </a>
                </div>
              </li>

              {/* Office Hours */}
              <li className="flex items-start gap-3 pt-1">
                <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-[11px] leading-relaxed text-slate-400">
                  <span className="font-semibold text-slate-300 block">Working Hours:</span>
                  <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
                  <span className="block text-slate-500 text-[10px]">Sunday: By Prior Appointment</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. BOTTOM SUB-FOOTER LEGAL BAR */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-light">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span suppressHydrationWarning>
              © {new Date().getFullYear()} Hindustan Projects (HiPRO). All rights reserved.
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Engineered with precision in Bhilwara, Rajasthan</span>
              <span>🇮🇳</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <Link 
              href="/privacy-policy" 
              className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
            <Link 
              href="/sitemap.xml" 
              className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Sitemap
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
