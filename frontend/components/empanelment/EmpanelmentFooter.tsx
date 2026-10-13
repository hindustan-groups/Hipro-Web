"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  ShieldCheck,
  FileText,
  Search,
  QrCode,
} from "lucide-react";
import {
  EmpanelmentContent,
  DEFAULT_EMPANELMENT_CONTENT,
} from "@/lib/empanelmentContent";

export default function EmpanelmentFooter() {
  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);

  useEffect(() => {
    async function loadCms() {
      try {
        const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const cleanUrl = rawUrl.replace(/\/+$/, "");
        const res = await fetch(`${cleanUrl}/api/empanelment/content`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content) {
            setContent({ ...DEFAULT_EMPANELMENT_CONTENT, ...json.content });
          }
        }
      } catch (_e) {}
    }
    loadCms();
  }, []);

  const phoneClean = (content.phone || "+919876543210").replace(/\s+/g, "");

  return (
    <footer id="contact" className="bg-[#0b101b] text-slate-300 pt-12 sm:pt-16 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-slate-800/80">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-col">
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                HINDUSTAN&nbsp;<span className="text-[#dc2626]">PROJECTS</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-slate-400 uppercase mt-0.5">
                {content.tagline || "Engineering – Construction – Infrastructure"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Partnering with local suppliers, specialized contractors and MSMEs to build robust industrial and civil infrastructure across Rajasthan and North India.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com/company/hindustanprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#dc2626] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/hindustanprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#dc2626] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/hindustan_projects"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#dc2626] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@hindustanprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#dc2626] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Procurement & Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
              <li>
                <Link href="/empanelment" className="hover:text-white transition-colors">
                  Home (पोर्टल होम)
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  Vendor Registration (नया पंजीकरण)
                </Link>
              </li>
              <li>
                <Link href="/empanelment/tenders" className="hover:text-white transition-colors">
                  Active Tenders Radar (चालू टेंडर)
                </Link>
              </li>
              <li>
                <Link href="/empanelment/track" className="hover:text-white transition-colors">
                  Track Application Status (आवेदन स्थिति)
                </Link>
              </li>
              <li>
                <Link href="/empanelment/gate-pass" className="hover:text-white transition-colors">
                  Daily Site Gate Pass (साइट गेट पास)
                </Link>
              </li>
              <li>
                <Link href="/empanelment/guidelines" className="hover:text-white transition-colors">
                  Capacity Guidelines (पात्रता व क्लास)
                </Link>
              </li>
              <li>
                <Link href="/empanelment#faqs" className="hover:text-white transition-colors">
                  Vendor FAQs (प्रश्न व उत्तर)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Sourcing Categories */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Core Categories
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  Civil Construction
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  Structural Steel & PEB
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  Cement & TMT Supplies
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  Electrical & MEP Works
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  Plant & Machinery
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  Finishing & Flooring
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Procurement Desk
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
                <span>{content.address || "Hindustan Projects, Bhilwara, Rajasthan, India"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
                <a href={`tel:${phoneClean}`} className="hover:text-white transition-colors font-mono font-bold">
                  {content.phone || "+91 98765 43210"}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
                <a href={`mailto:${content.email}`} className="hover:text-white transition-colors font-mono">
                  {content.email || "procurement@hindustanprojects.in"}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/empanelment/apply"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold px-4 py-3 rounded-lg transition-all shadow-sm group"
              >
                <span>Register as a Vendor</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © 2026 {content.portalName || "Hindustan Projects"}. All Rights Reserved.
          </div>
          <div className="flex items-center gap-5 text-[11px]">
            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/admin/empanelment" className="hover:text-slate-300 font-semibold transition-colors">
              Staff Workspace ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
