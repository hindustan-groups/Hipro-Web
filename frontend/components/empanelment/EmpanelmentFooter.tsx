"use client";

import React from "react";
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
} from "lucide-react";

export default function EmpanelmentFooter() {
  return (
    <footer id="contact" className="bg-[#0b101b] text-slate-300 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-slate-800/80">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-col">
              <div className="text-xl font-black tracking-tight text-white flex items-center">
                HINDUSTAN&nbsp;<span className="text-[#dc2626]">PROJECTS</span>
              </div>
              <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase mt-0.5">
                Engineering – Construction – Infrastructure
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Partnering with local businesses to build quality infrastructure and a stronger,
              sustainable Rajasthan.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com/company/hindustanprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#dc2626] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/hindustanprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#dc2626] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/hindustan_projects"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#dc2626] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@hindustanprojects"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#dc2626] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
              <li>
                <Link href="/empanelment" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/empanelment/guidelines" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  Vendor Registration
                </Link>
              </li>
              <li>
                <Link href="/empanelment/tenders" className="hover:text-white transition-colors">
                  Procurement
                </Link>
              </li>
              <li>
                <Link href="/empanelment/guidelines" className="hover:text-white transition-colors">
                  Guidelines
                </Link>
              </li>
              <li>
                <a href="/empanelment#faqs" className="hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
              <li>
                <Link href="/empanelment/apply?category=building-materials" className="hover:text-white transition-colors">
                  Building Materials
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply?category=civil-structural" className="hover:text-white transition-colors">
                  Civil & Structural Work
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply?category=machinery-equipment" className="hover:text-white transition-colors">
                  Machinery & Equipment
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply?category=electrical-plumbing" className="hover:text-white transition-colors">
                  Electrical & Plumbing
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply?category=interior-finishing" className="hover:text-white transition-colors">
                  Interior & Finishing
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply?category=logistics-transport" className="hover:text-white transition-colors">
                  Logistics & Transportation
                </Link>
              </li>
              <li>
                <Link href="/empanelment/apply" className="hover:text-white transition-colors">
                  Other Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Contact Us
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
                <span>Hindustan Projects, Bhilwara, Rajasthan, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
                <span>procurement@hindustanprojects.in</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/empanelment/apply"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold px-4 py-3 rounded-md transition-all shadow-sm group"
              >
                <span>Register as a Vendor</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 Hindustan Projects. All Rights Reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/sitemap" className="hover:text-slate-400 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
