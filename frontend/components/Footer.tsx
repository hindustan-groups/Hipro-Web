import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUpRight, 
  ArrowRight,
  Calculator, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Layers,
  Laptop,
  Wrench,
  ChevronRight,
  Youtube,
  Calendar,
} from "lucide-react";
import { findAll } from "@/lib/db";
import type { Settings, Service } from "@/lib/types";
import { COMPANY_INFO, cleanServiceTitle } from "@/lib/companyData";
import { resolveCTA, resolveCTAHref } from "@/lib/cta";

// ── Official Pinterest SVG Icon ─────────────────────────────────────────────
function PinterestIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.373-.053.224-.174.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026l.032-.026z" />
    </svg>
  );
}

// ── Official WhatsApp SVG Icon ──────────────────────────────────────────────
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Decorative Architectural Skyline & Construction Crane SVG ────────────────
function SkylineIllustration({ className = "w-full h-16 text-slate-300" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 1200 90" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      {/* Horizontal Baseline rule */}
      <line x1="0" y1="88" x2="1200" y2="88" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" opacity="0.35" />
      <line x1="120" y1="88" x2="1080" y2="88" stroke="currentColor" strokeWidth="1.2" opacity="0.75" />
      
      {/* LEFT BUILDINGS CLUSTER (x=300 to 520) */}
      {/* Building L1: Low-rise office */}
      <rect x="310" y="60" width="35" height="28" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <line x1="318" y1="67" x2="318" y2="73" stroke="currentColor" strokeWidth="1" />
      <line x1="326" y1="67" x2="326" y2="73" stroke="currentColor" strokeWidth="1" />
      <line x1="334" y1="67" x2="334" y2="73" stroke="currentColor" strokeWidth="1" />
      <line x1="318" y1="78" x2="318" y2="84" stroke="currentColor" strokeWidth="1" />
      <line x1="326" y1="78" x2="326" y2="84" stroke="currentColor" strokeWidth="1" />
      <line x1="334" y1="78" x2="334" y2="84" stroke="currentColor" strokeWidth="1" />

      {/* Building L2: Stepped corporate tower */}
      <rect x="350" y="40" width="42" height="48" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <rect x="356" y="32" width="30" height="8" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <line x1="371" y1="20" x2="371" y2="32" stroke="currentColor" strokeWidth="1" />
      {/* Windows */}
      <line x1="358" y1="46" x2="384" y2="46" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="358" y1="54" x2="384" y2="54" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="358" y1="62" x2="384" y2="62" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="358" y1="70" x2="384" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="358" y1="78" x2="384" y2="78" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />

      {/* Building L3: Medium tower with pitched crown */}
      <rect x="398" y="48" width="36" height="40" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <polygon points="398,48 416,36 434,48" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <line x1="406" y1="56" x2="426" y2="56" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="406" y1="66" x2="426" y2="66" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="406" y1="76" x2="426" y2="76" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />

      {/* Building L4: Skyscraper next to crane */}
      <rect x="440" y="24" width="46" height="64" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <rect x="448" y="16" width="30" height="8" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <line x1="463" y1="6" x2="463" y2="16" stroke="currentColor" strokeWidth="1" />
      {/* Grid windows */}
      <line x1="448" y1="32" x2="478" y2="32" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="448" y1="42" x2="478" y2="42" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="448" y1="52" x2="478" y2="52" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="448" y1="62" x2="478" y2="62" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="448" y1="72" x2="478" y2="72" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="448" y1="80" x2="478" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />

      {/* Building L5: Transitional lower building */}
      <rect x="492" y="52" width="28" height="36" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <line x1="498" y1="60" x2="514" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="498" y1="68" x2="514" y2="68" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="498" y1="76" x2="514" y2="76" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />

      {/* CENTER CONSTRUCTION TOWER CRANE (x=530 to 628) */}
      {/* Crane Mast */}
      <line x1="560" y1="18" x2="560" y2="88" stroke="currentColor" strokeWidth="1.6" />
      <line x1="568" y1="18" x2="568" y2="88" stroke="currentColor" strokeWidth="1.6" />
      {/* Lattice diagonal bracing */}
      <line x1="560" y1="88" x2="568" y2="78" stroke="currentColor" strokeWidth="0.9" />
      <line x1="568" y1="78" x2="560" y2="68" stroke="currentColor" strokeWidth="0.9" />
      <line x1="560" y1="68" x2="568" y2="58" stroke="currentColor" strokeWidth="0.9" />
      <line x1="568" y1="58" x2="560" y2="48" stroke="currentColor" strokeWidth="0.9" />
      <line x1="560" y1="48" x2="568" y2="38" stroke="currentColor" strokeWidth="0.9" />
      <line x1="568" y1="38" x2="560" y2="28" stroke="currentColor" strokeWidth="0.9" />
      <line x1="560" y1="28" x2="568" y2="18" stroke="currentColor" strokeWidth="0.9" />
      {/* Horizontal bracing rungs */}
      <line x1="560" y1="78" x2="568" y2="78" stroke="currentColor" strokeWidth="1" />
      <line x1="560" y1="58" x2="568" y2="58" stroke="currentColor" strokeWidth="1" />
      <line x1="560" y1="38" x2="568" y2="38" stroke="currentColor" strokeWidth="1" />
      <line x1="560" y1="18" x2="568" y2="18" stroke="currentColor" strokeWidth="1" />

      {/* Crane Peak / Apex A-frame */}
      <polygon points="560,18 564,6 568,18" stroke="currentColor" strokeWidth="1.4" fill="white" />
      
      {/* Crane Horizontal Jib (Boom) */}
      <line x1="518" y1="18" x2="628" y2="18" stroke="currentColor" strokeWidth="1.6" />
      <line x1="518" y1="21" x2="624" y2="21" stroke="currentColor" strokeWidth="1" />
      {/* Jib diagonals */}
      <line x1="568" y1="18" x2="578" y2="21" stroke="currentColor" strokeWidth="0.8" />
      <line x1="578" y1="21" x2="588" y2="18" stroke="currentColor" strokeWidth="0.8" />
      <line x1="588" y1="18" x2="598" y2="21" stroke="currentColor" strokeWidth="0.8" />
      <line x1="598" y1="21" x2="608" y2="18" stroke="currentColor" strokeWidth="0.8" />
      <line x1="608" y1="18" x2="618" y2="21" stroke="currentColor" strokeWidth="0.8" />

      {/* Pendants (Stay cables from apex to jib) */}
      <line x1="564" y1="6" x2="605" y2="18" stroke="currentColor" strokeWidth="0.9" />
      <line x1="564" y1="6" x2="530" y2="18" stroke="currentColor" strokeWidth="0.9" />
      
      {/* Counter-weight on rear jib */}
      <rect x="522" y="19" width="12" height="9" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
      
      {/* Operator Cabin */}
      <rect x="568" y="21" width="8" height="9" stroke="currentColor" strokeWidth="1.2" fill="white" />
      
      {/* Hoist Trolley, Cable and Suspended I-Beam */}
      <rect x="600" y="17" width="6" height="5" stroke="currentColor" strokeWidth="1" fill="currentColor" />
      <line x1="603" y1="22" x2="603" y2="44" stroke="currentColor" strokeWidth="1" />
      {/* Hook */}
      <path d="M603,44 Q601,48 603,50 Q605,48 605,46" stroke="currentColor" strokeWidth="1" fill="none" />
      {/* Suspended Steel Beam */}
      <line x1="590" y1="51" x2="616" y2="51" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />

      {/* RIGHT BUILDINGS CLUSTER (x=635 to 890) */}
      {/* Building R1: Modern office next to crane */}
      <rect x="635" y="44" width="34" height="44" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <polygon points="635,44 652,34 669,44" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <line x1="643" y1="52" x2="661" y2="52" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
      <line x1="643" y1="62" x2="661" y2="62" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
      <line x1="643" y1="72" x2="661" y2="72" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />

      {/* Building R2: High-rise geometric tower */}
      <rect x="675" y="26" width="44" height="62" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <rect x="683" y="18" width="28" height="8" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <line x1="697" y1="10" x2="697" y2="18" stroke="currentColor" strokeWidth="1" />
      {/* Windows columns */}
      <line x1="685" y1="34" x2="709" y2="34" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="685" y1="44" x2="709" y2="44" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="685" y1="54" x2="709" y2="54" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="685" y1="64" x2="709" y2="64" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="685" y1="74" x2="709" y2="74" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />

      {/* Building R3: Medium commercial building */}
      <rect x="725" y="38" width="38" height="50" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <line x1="733" y1="46" x2="755" y2="46" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="733" y1="56" x2="755" y2="56" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="733" y1="66" x2="755" y2="66" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="733" y1="76" x2="755" y2="76" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />

      {/* Building R4: Low-rise residential/commercial */}
      <rect x="769" y="56" width="32" height="32" stroke="currentColor" strokeWidth="1.2" fill="white" />
      <line x1="775" y1="64" x2="795" y2="64" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="775" y1="72" x2="795" y2="72" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="775" y1="80" x2="795" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
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

  // ── Contact & Verified Data Resolution ──────────────────────────────────
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
  const facebookUrl = socials.facebook || COMPANY_INFO.socials.facebook || "https://www.facebook.com/people/Hindustan-Projects";
  const linkedinUrl = socials.linkedin || COMPANY_INFO.socials.linkedin;
  const pinterestUrl = socials.pinterest || COMPANY_INFO.socials.pinterest;

  // ── CTA CMS resolution ──────────────────────────────────────────────────
  const ctaEstimator = resolveCTA(settings, "footer_estimator");
  const ctaWhatsapp  = resolveCTA(settings, "footer_whatsapp");
  const estimatorHref = ctaEstimator ? resolveCTAHref(ctaEstimator) : "/cost-estimator";
  const whatsappHref  = ctaWhatsapp ? resolveCTAHref(ctaWhatsapp) : COMPANY_INFO.whatsappLink;

  // ── Capabilities Resolution ─────────────────────────────────────────────
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
        { label: "Professional Construction Services", href: "/services/professional-construction-services" },
        { label: "Surveying & Site Measurements", href: "/services/surveying-site-measurements" },
        { label: "Interior & Exterior Design", href: "/services/interior-exterior-design" },
        { label: "Water Treatment Plant Construction", href: "/services/water-treatment-plant-construction" },
        { label: "Project Management & Consultancy", href: "/services/project-management-consultancy" }
      ];

  // ── Social Media Channels ───────────────────────────────────────────────
  const socialLinks = [
    { icon: Instagram, url: instagramUrl, name: "Instagram" },
    { icon: Facebook, url: facebookUrl, name: "Facebook" },
    { icon: Linkedin, url: linkedinUrl, name: "LinkedIn" },
    { icon: Youtube, url: "https://www.youtube.com/@hindustanprojects", name: "YouTube" },
    { icon: PinterestIcon, url: pinterestUrl, name: "Pinterest" },
  ];

  return (
    <footer className="w-full relative overflow-hidden bg-white text-slate-700">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP CONSULTATION BANNER (DARK NAVY WITH ARCHITECTURAL SHOWCASE)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative bg-[#071326] text-white border-b border-slate-200 overflow-hidden">
        {/* Background Subtle Grid Accent */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Right Architectural Image Showcase with Multi-stop Gradient Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 lg:w-5/12 hidden md:block pointer-events-none select-none overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            alt="HiPRO Architectural Engineering Showcase"
            fill
            sizes="(max-width: 1024px) 50vw, 40vw"
            priority={false}
            className="object-cover object-center"
          />
          {/* Multi-stop gradient overlay to ensure text contrast and flawless fade */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071326] via-[#071326]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071326]/60 via-transparent to-transparent" />
        </div>

        {/* Banner Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-orange-400 text-[11px] font-bold uppercase tracking-widest font-mono mb-3">
              <span className="w-5 h-0.5 bg-orange-500 rounded-full" aria-hidden="true" />
              <span>Engineering Consultation &amp; Estimation</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight leading-tight mb-3">
              Ready to Build Your Project or Estimate Construction Costs?
            </h2>

            {/* Description */}
            <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed mb-8 max-w-xl">
              Consult with our civil engineers in Bhilwara for transparent BOQ calculations, planning and architectural blueprints.
            </p>

            {/* Dual CTA Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {/* Primary: Get Free Estimate */}
              {ctaEstimator?.enabled !== false && (
                <Link
                  href={estimatorHref}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg shadow-orange-950/40 transition-all cursor-pointer group"
                >
                  <Calculator className="w-4 h-4 text-white" />
                  <span>Get Free Estimate</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              {/* Secondary: WhatsApp Quote */}
              {ctaWhatsapp?.enabled !== false && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-bold text-xs sm:text-sm rounded-lg border border-slate-200 shadow-md transition-all cursor-pointer group"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Quote</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN FOOTER CONTENT — 5 COLUMNS ON CLEAN WHITE BACKGROUND
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white text-slate-700 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-12 sm:pb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-8">
            
            {/* COLUMN 1: COMPANY IDENTITY (lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col justify-between">
              <div>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-3 mb-5 hover:opacity-90 transition-opacity"
                  aria-label="Hindustan Projects Home"
                >
                  <Image 
                    src="/logo.jpg" 
                    alt="HiPRO Logo" 
                    width={48} 
                    height={48} 
                    className="h-10 sm:h-11 w-auto object-contain" 
                  />
                  <div className="w-[1px] h-8 bg-slate-200" />
                  <div className="flex flex-col justify-center">
                    <span className="font-extrabold text-[15px] sm:text-[16px] leading-tight tracking-[0.08em] text-construction-red font-display uppercase">
                      Hindustan
                    </span>
                    <span className="font-black text-[12px] sm:text-[13px] leading-tight tracking-[0.1em] text-construction-navy font-display uppercase">
                      Projects
                    </span>
                  </div>
                </Link>

                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mb-6 max-w-sm">
                  Engineering landmarks and turnkey civil solutions across residential, commercial, and industrial developments in Rajasthan since 2019.
                </p>

                {/* 3 Trust Badges */}
                <div className="space-y-2.5 max-w-xs">
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Est. 2019 · Bhilwara
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Turnkey Execution
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Licensed Planning
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: COMPANY (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <h3 className="text-slate-900 font-bold text-sm sm:text-base mb-4 font-display">
                Company
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
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
                      className="group flex items-center justify-between py-1 text-slate-600 hover:text-construction-navy font-medium transition-colors"
                    >
                      <span>{label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-construction-red group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: CAPABILITIES (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <h3 className="text-slate-900 font-bold text-sm sm:text-base mb-4 font-display">
                Capabilities
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                {capabilities.map((item) => (
                  <li key={item.label}>
                    <Link 
                      href={item.href} 
                      className="group flex items-center justify-between py-1 text-slate-600 hover:text-construction-navy font-medium transition-colors"
                    >
                      <span className="line-clamp-1">{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-construction-red group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link
                    href="/services"
                    className="text-orange-600 hover:text-orange-700 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 group transition-colors"
                  >
                    <span>All Capabilities</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 4: ECOSYSTEM (lg:col-span-2) */}
            <div className="lg:col-span-2">
              <h3 className="text-slate-900 font-bold text-sm sm:text-base mb-4 font-display">
                Ecosystem
              </h3>
              <div className="space-y-3">
                {/* 1. Hindustan Empanelment */}
                <a
                  href="https://empanelment.hindustanprojects.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-3 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-construction-red transition-colors">
                        Hindustan Empanelment
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-construction-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-tight mb-2">
                    Contractor, Vendor &amp; Institutional Empanelment Services
                  </p>
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                    Live Portal ↗
                  </span>
                </a>

                {/* 2. Snaptech Digital */}
                <a
                  href="https://www.snaptech.digital/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-3 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Laptop className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Snaptech Digital
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-tight mb-2">
                    Technology solutions and IT services for businesses
                  </p>
                  <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full">
                    Live Portal ↗
                  </span>
                </a>

                {/* 3. Hind Build Solutions */}
                <Link
                  href="/hbs"
                  className="group block p-3 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-construction-red transition-colors">
                        Hind Build Solutions
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-construction-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal leading-tight mb-2">
                    Building Repair, Maintenance &amp; Protection Services
                  </p>
                  <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                    Live Portal ↗
                  </span>
                </Link>
              </div>
            </div>

            {/* COLUMN 5: HEADQUARTERS (lg:col-span-3) */}
            <div className="lg:col-span-3">
              <div>
                <h3 className="text-slate-900 font-bold text-sm sm:text-base font-display">
                  Headquarters
                </h3>
                <div className="w-8 h-1 bg-orange-500 mt-1 mb-4 rounded-full" />
              </div>

              <ul className="space-y-3.5 text-xs">
                {/* Address */}
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="leading-relaxed block text-slate-700 text-xs">
                      {address}
                    </span>
                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-orange-600 hover:text-orange-700 font-bold mt-0.5 transition-colors"
                    >
                      Get Directions <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </li>

                {/* Direct Hotline */}
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Direct Hotline
                    </span>
                    <a href={telLink} className="hover:text-construction-navy font-bold text-slate-900 text-xs transition-colors">
                      {phone}
                    </a>
                  </div>
                </li>

                {/* Email Correspondence */}
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Email Correspondence
                    </span>
                    <a href={mailtoLink} className="hover:text-construction-navy font-bold text-slate-900 text-xs transition-colors">
                      {email}
                    </a>
                  </div>
                </li>

                {/* Direct WhatsApp */}
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Direct WhatsApp
                    </span>
                    <a 
                      href={whatsappLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-emerald-700 font-bold text-slate-900 text-xs transition-colors"
                    >
                      +91 {COMPANY_INFO.whatsappNumber}
                    </a>
                  </div>
                </li>

                {/* Working Hours */}
                <li className="flex items-start gap-3 pt-0.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Working Hours
                    </span>
                    <span className="font-semibold text-slate-800 block">Mon – Sat: 9:00 AM – 7:00 PM</span>
                    <span className="text-slate-500 text-[11px] block">Sunday: By Prior Appointment</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. DECORATIVE ARCHITECTURAL SKYLINE & CRANE ILLUSTRATION
            ───────────────────────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden border-t border-slate-100 pt-2 pb-0 flex items-end justify-center">
          <SkylineIllustration className="w-full max-w-5xl h-14 sm:h-18 md:h-20 text-slate-300" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM DARK NAVY BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0B1528] text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-light">
            
            {/* Left: Connect With Us & Social Icons */}
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-xs uppercase tracking-wider">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                {socialLinks.map(({ icon: Icon, url, name }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit Hindustan Projects on ${name}`}
                    className="w-8 h-8 rounded-md bg-white/10 hover:bg-orange-500 hover:text-white text-slate-300 flex items-center justify-center transition-all shadow-xs"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Center: Copyright & Engineered with precision */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-center text-[11px] text-slate-400">
              <span suppressHydrationWarning>
                © {new Date().getFullYear()} Hindustan Projects (HiPRO). All rights reserved.
              </span>
              <span className="hidden md:inline text-slate-600">|</span>
              <span className="flex items-center gap-1.5">
                <span>Engineered with precision in Bhilwara, Rajasthan.</span>
                <span>🇮🇳</span>
              </span>
              <span className="hidden md:inline text-slate-600">|</span>
              <span>
                Designed &amp; Developed by{" "}
                <a
                  href="https://www.snaptech.digital/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white font-semibold underline-offset-4 hover:underline transition-colors"
                >
                  SnapTech Digital
                </a>
              </span>
            </div>

            {/* Right: Legal & Sitemap */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
              <Link 
                href="/privacy-policy" 
                className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              <span className="text-slate-700">|</span>
              <Link 
                href="/cookie-policy" 
                className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                Cookie Policy
              </Link>
              <span className="text-slate-700">|</span>
              <Link 
                href="/terms" 
                className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                Terms of Service
              </Link>
              <span className="text-slate-700">|</span>
              <Link 
                href="/sitemap.xml" 
                className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                Sitemap
              </Link>
            </div>

          </div>
        </div>
      </div>

    </footer>
  );
}
