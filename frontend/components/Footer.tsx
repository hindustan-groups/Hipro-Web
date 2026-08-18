import Link from "next/link";
import { HardHat, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { findAll } from "@/lib/db";
import type { Settings, Service } from "@/lib/types";

export default async function Footer() {
  const [settingsData, servicesData] = await Promise.all([
    findAll<Settings>("settings"),
    findAll<Service>("services")
  ]);
  
  const settings = settingsData[0] || {};
  
  const address = settings.companyAddress || "101 Executive Tower, Infrastructure Complex, New Delhi, India";
  const phone = settings.companyPhone || "+91 98765 43210";
  const email = settings.companyEmail || "contact@hindustanprojects.com";
  
  let socials: any = {};
  try {
    if (settings.socialLinks) socials = JSON.parse(settings.socialLinks);
  } catch { /* silent */ }

  const activeServices = servicesData
    .filter(s => s.active !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99))
    .slice(0, 6);

  const capabilities = activeServices.length > 0
    ? activeServices.map(s => ({
        label: s.title,
        href: "/services"
      }))
    : [
        { label: "Residential Construction", href: "/services" },
        { label: "Commercial Development", href: "/services" },
        { label: "Industrial Facilities", href: "/services" },
        { label: "Renovation & Remodeling", href: "/services" },
        { label: "Project Management", href: "/services" },
        { label: "Turnkey Design Build", href: "/services" }
      ];
  return (
    <footer className="bg-black text-slate-400 relative overflow-hidden border-t border-slate-800">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl mb-6">
              <img 
                src="/logo.jpg" 
                alt="HiPRO Logo" 
                className="h-10 md:h-12 w-auto object-contain mix-blend-multiply" 
              />
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
            <p className="text-xs text-slate-400 font-light leading-relaxed mb-6">
              Building sustainable infrastructure and delivering innovative engineering solutions across residential, commercial, and industrial sectors since 1999.
            </p>
            <div className="flex gap-2.5">
              {[
                { icon: Facebook, url: socials.facebook },
                { icon: Twitter, url: socials.twitter },
                { icon: Instagram, url: socials.instagram },
                { icon: Linkedin, url: socials.linkedin }
              ].map(({ icon: Icon, url }, i) => (
                <a
                  key={i}
                  href={url || "#"}
                  target={url ? "_blank" : undefined}
                  rel={url ? "noreferrer" : undefined}
                  className="w-9 h-9 rounded-none bg-white/5 border border-white/10 flex items-center justify-center hover:bg-construction-red hover:border-construction-red transition-all duration-200 group shadow-sm"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
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
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-none bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-construction-red" />
                </div>
                <span>{email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-light">
          <div className="flex items-center gap-2">
            <span suppressHydrationWarning>© {new Date().getFullYear()} Hindustan Projects. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Quality Policy"].map((item) => (
              <Link key={item} href="#" className="hover:text-slate-300 transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
