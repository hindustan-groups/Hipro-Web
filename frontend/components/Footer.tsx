import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, MessageSquare, ArrowUpRight } from "lucide-react";
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

export default async function Footer() {
  const [settingsData, servicesData] = await Promise.all([
    findAll<Settings>("settings"),
    findAll<Service>("services")
  ]);
  
  const settings = settingsData[0] || {};
  
  const address = settings.companyAddress || COMPANY_INFO.address;
  const phone = settings.companyPhone || COMPANY_INFO.formattedPhone;
  const email = settings.companyEmail || COMPANY_INFO.email;
  const telLink = `tel:${(settings.companyPhone || COMPANY_INFO.phone).replace(/\s+/g, '')}`;
  const mailtoLink = `mailto:${email}`;
  const whatsappLink = COMPANY_INFO.whatsappLink;
  
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
        { label: "Professional Construction Services", href: "/services/professional-construction-services" },
        { label: "Surveying & Site Measurements", href: "/services/surveying-site-measurements" },
        { label: "Interior & Exterior Design", href: "/services/interior-exterior-design" },
        { label: "Water Treatment Plant Construction", href: "/services/water-treatment-plant-construction" },
        { label: "Project Management & Consultancy", href: "/services/project-management-consultancy" }
      ];

  const socialLinks = [
    { icon: Instagram, url: instagramUrl, name: "Instagram" },
    { icon: Facebook, url: facebookUrl, name: "Facebook" },
    { icon: Linkedin, url: linkedinUrl, name: "LinkedIn" },
    { icon: PinterestIcon, url: pinterestUrl, name: "Pinterest" }
  ];

  return (
    <footer className="bg-black text-slate-400 relative overflow-hidden border-t border-slate-800">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl mb-6">
              <Image src="/logo.jpg" alt="HiPRO Logo" width={48} height={48} className="h-10 md:h-12 w-auto object-contain mix-blend-multiply" />
              <div className="w-[1px] h-10 bg-slate-200"></div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-[17px] leading-tight tracking-[0.08em] text-construction-red font-display uppercase">
                  Hindustan
                </span>
                <span className="font-bold text-[13px] leading-tight tracking-[0.1em] text-construction-navy font-display uppercase">
                  Projects
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-300 font-light leading-relaxed mb-6">
              Building sustainable infrastructure and delivering innovative engineering solutions across residential, commercial, and industrial sectors since 2019.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map(({ icon: Icon, url, name }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Hindustan Projects on ${name}`}
                  className="w-9 h-9 rounded-none bg-white/5 border border-white/10 flex items-center justify-center hover:bg-construction-red hover:border-construction-red transition-all duration-200 group shadow-sm"
                >
                  <Icon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-xs mb-5 uppercase tracking-widest font-display">Company</h3>
            <ul className="space-y-3 text-xs">
              {[["About Us", "/about"], ["Why Hindustan Projects", "/why-us"], ["Services", "/services"], ["Projects", "/projects"], ["Contact", "/contact"], ["Cost Estimator", "/cost-estimator"]].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white transition-colors inline-flex items-center gap-1 group font-medium">
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-construction-red" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-xs mb-5 uppercase tracking-widest font-display">Capabilities</h3>
            <ul className="space-y-3 text-xs">
              {capabilities.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors inline-flex items-center gap-1 group font-medium">
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-construction-red" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-xs mb-5 uppercase tracking-widest font-display">Headquarters</h3>
            <ul className="space-y-4 text-xs">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-none bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-construction-red" />
                </div>
                <span className="leading-relaxed">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-none bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-construction-red" />
                </div>
                <a href={telLink} className="hover:text-white transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-none bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-construction-red" />
                </div>
                <a href={mailtoLink} className="hover:text-white transition-colors">{email}</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-none bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors text-emerald-400 font-medium">
                  WhatsApp: {COMPANY_INFO.whatsappNumber}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300 font-light">
          <div className="flex items-center gap-2">
            <span suppressHydrationWarning>© {new Date().getFullYear()} Hindustan Projects. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-slate-300 hover:text-white transition-colors underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-300 hover:text-white transition-colors underline-offset-4 hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
