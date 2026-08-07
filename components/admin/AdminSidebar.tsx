"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Mail, FileText, FolderOpen,
  Star, Users, BarChart2, HardHat, Settings, LogOut, LayoutTemplate
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
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-xl shadow-slate-900/20 z-10">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 rounded-full bg-white border-2 border-slate-700/50 flex items-center justify-center shadow-lg">
          <span className="text-construction-red font-black text-sm tracking-tighter">Hi</span>
          <span className="text-construction-navy font-black text-xs tracking-tighter">PRO</span>
        </div>
        <div>
          <p className="text-white font-bold text-[14px] leading-tight uppercase tracking-tight">Hindustan</p>
          <p className="text-slate-400 font-semibold text-[11px] leading-tight uppercase tracking-widest">Projects</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-4">Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                active
                  ? "bg-slate-800/80 text-white shadow-inner border border-slate-700/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-5 border-t border-slate-800/60 space-y-1 bg-slate-900/50">
        <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent">
          <LogOut className="w-4 h-4" /> View Site
        </Link>
      </div>
    </aside>
  );
}
