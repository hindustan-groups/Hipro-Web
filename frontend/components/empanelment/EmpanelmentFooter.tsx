import React from "react";
import Link from "next/link";
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink } from "lucide-react";

export default function EmpanelmentFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-900 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-wide text-sm">HINDUSTAN PROJECTS</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Official Vendor & Contractor Empanelment Portal. Transparent onboarding, KYC validation, digital commercial bidding, and 24-hr daily site gate passes.
            </p>
          </div>

          {/* Col 2: Vendor Portals */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
              Contractor Hub / वेंडर सेवा
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  New Vendor Registration (नया पंजीकरण)
                </Link>
              </li>
              <li>
                <Link href="/empanelment/track" className="hover:text-white transition-colors">
                  Application Status & Smart ID (स्थिति जांचें)
                </Link>
              </li>
              <li>
                <Link href="/empanelment/tenders" className="hover:text-white transition-colors">
                  Active Site Tenders (चालू टेंडर)
                </Link>
              </li>
              <li>
                <Link href="/empanelment/gate-pass" className="hover:text-white transition-colors">
                  Daily 24-Hr Site Gate Pass (डेली गेट पास)
                </Link>
              </li>
              <li>
                <Link href="/empanelment/verify-pass" className="hover:text-white transition-colors">
                  Site Security Guard Verification (गार्ड चेकिंग)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Group Portals */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
              Group Portals / मुख्य साइट्स
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="https://www.hindustanprojects.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>HiPRO Master Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://hindbuilding.hindustanprojects.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>Hind Build Solutions (HBS)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.snaptech.digital" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>SnapTech Digital</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <Link href="/admin/empanelment" className="hover:text-white transition-colors">
                  Staff & Admin Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Procurement Contact */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
              Procurement Desk / संपर्क
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Head Office: Mansarovar, Jaipur, Rajasthan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>+91 98290 00000 (Tender & KYC Helpline)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>empanelment@hindustanprojects.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Hindustan Projects Group. All Rights Reserved.</p>
          <p>ISO 9001:2015 Quality & Safety Compliant Construction Registry.</p>
        </div>
      </div>
    </footer>
  );
}
