import Link from "next/link";
import { HardHat, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 relative overflow-hidden">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      {/* Background blobs */}
      <div className="blob w-96 h-96 bg-blue-900/40 top-0 right-0" />
      <div className="blob w-80 h-80 bg-red-900/20 bottom-0 left-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-glow-red">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-[15px] font-display">
                Hindustan <span className="text-gradient-red">Projects</span>
              </span>
            </div>
            <p className="text-[13px] text-gray-500 font-light leading-relaxed mb-6">
              Building excellence since 1999. Your trusted partner for residential, commercial, and industrial construction projects.
            </p>
            <div className="flex gap-2.5">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-[13px] mb-4 uppercase tracking-widest">Company</h3>
            <ul className="space-y-2.5 text-[13px]">
              {[["About Us", "/about"], ["Services", "/services"], ["Projects", "/projects"], ["Contact", "/contact"], ["Careers", "#"]].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-[13px] mb-4 uppercase tracking-widest">Services</h3>
            <ul className="space-y-2.5 text-[13px]">
              {["Residential", "Commercial", "Industrial", "Renovation", "Design Build"].map((item) => (
                <li key={item}>
                  <Link href="/services" className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-[13px] mb-4 uppercase tracking-widest">Contact</h3>
            <ul className="space-y-3 text-[13px]">
              <li className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                </div>
                <span>123 Construction Ave<br />Building District, BD 12345</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                </div>
                <span>info@hindustanprojects.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <HardHat className="w-3 h-3 text-white" />
            </div>
            <span>© {new Date().getFullYear()} Hindustan Projects. All rights reserved.</span>
          </div>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <Link key={item} href="#" className="hover:text-gray-400 transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
