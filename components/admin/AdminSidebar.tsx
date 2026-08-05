"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Mail, FileText, FolderOpen,
  Star, Users, BarChart2, HardHat, Settings, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin",           label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/contacts",  label: "Contacts",    icon: Mail },
  { href: "/admin/quotes",    label: "Quotes",      icon: FileText },
  { href: "/admin/projects",  label: "Projects",    icon: FolderOpen },
  { href: "/admin/testimonials", label: "Reviews",  icon: Star },
  { href: "/admin/newsletter",label: "Newsletter",  icon: Users },
  { href: "/admin/stats",     label: "Stats",       icon: BarChart2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
          <HardHat className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-[14px] leading-tight">Hindustan</p>
          <p className="text-gray-400 text-[11px]">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-3">Menu</p>
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
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-0.5">
        <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
          <LogOut className="w-4 h-4" /> View Site
        </Link>
      </div>
    </aside>
  );
}
