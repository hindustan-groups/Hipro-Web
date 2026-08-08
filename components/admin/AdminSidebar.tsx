"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Mail, FileText, FolderOpen,
  Star, Users, BarChart2, HardHat, Settings, LogOut, LayoutTemplate, Link as LinkIcon, Briefcase
} from "lucide-react";

const navItems = [
  { href: "/admin",           label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/hero",      label: "Hero Section", icon: LayoutTemplate },
  { href: "/admin/contacts",  label: "Contacts",    icon: Mail },
  { href: "/admin/quotes",    label: "Quotes",      icon: FileText },
  { href: "/admin/projects",  label: "Projects",    icon: FolderOpen },
  { href: "/admin/services",  label: "Services",    icon: HardHat },
  { href: "/admin/testimonials", label: "Reviews",  icon: Star },
  { href: "/admin/team",        label: "Team",        icon: Users },
  { href: "/admin/newsletter",label: "Newsletter",  icon: Mail },
  { href: "/admin/stats",     label: "Stats",       icon: BarChart2 },
  { href: "/admin/applications", label: "Applications", icon: Briefcase },
  { href: "/admin/jobs", label: "Job Postings", icon: Briefcase },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10">
      {/* Brand */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 shrink-0 rounded-none bg-transparent border-2 border-construction-red flex items-center justify-center shadow-sm">
          <span className="text-construction-red font-black text-sm tracking-tighter">Hi</span>
        </div>
        <div>
          <p className="text-slate-900 font-bold text-[14px] leading-tight uppercase tracking-tight">Hindustan</p>
          <p className="text-slate-500 font-semibold text-[11px] leading-tight uppercase tracking-widest">Projects</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-4">Main Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-none text-[14px] font-medium transition-all group ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                {label}
              </div>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-slate-100 space-y-1.5 bg-slate-50/50">
        <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-none text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all group">
          <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> Settings
        </Link>
        <Link href="/admin/navigation" className="flex items-center gap-3 px-3 py-2.5 rounded-none text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all group">
          <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> Navigation
        </Link>
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-none text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all group">
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> View Site
        </Link>
      </div>
    </aside>
  );
}
