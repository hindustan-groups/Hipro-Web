"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Mail, FileText, FolderOpen,
  Star, Users, BarChart2, HardHat, Settings, LogOut, LayoutTemplate, Link as LinkIcon, Briefcase, BookOpen, Info
} from "lucide-react";

const navItems = [
  { href: "/admin",           label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/hero",      label: "Hero Section", icon: LayoutTemplate },
  { href: "/admin/about",     label: "About Page",  icon: Info },
  { href: "/admin/contacts",  label: "Contacts",    icon: Mail },
  { href: "/admin/quotes",    label: "Quotes",      icon: FileText },
  { href: "/admin/projects",  label: "Projects",    icon: FolderOpen },
  { href: "/admin/services",  label: "Services",    icon: HardHat },
  { href: "/admin/testimonials", label: "Reviews",  icon: Star },
  { href: "/admin/team",        label: "Team",        icon: Users },
  { href: "/admin/newsletter",label: "Newsletter",  icon: Mail },
  { href: "/admin/blogs",     label: "Blogs",       icon: BookOpen },
  { href: "/admin/stats",     label: "Stats",       icon: BarChart2 },
  { href: "/admin/applications", label: "Applications", icon: Briefcase },
  { href: "/admin/jobs", label: "Job Postings", icon: Briefcase },
];

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  let userPermissions: string[] = [];
  try {
    userPermissions = user?.permissions ? JSON.parse(user?.permissions) : [];
  } catch (e) {
    userPermissions = [];
  }

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-admin-sidebar", handleToggle);
  }, []);

  // Close sidebar on route change in mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
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
          
          // Check permissions
          const sectionKey = href.split("/")[2] || "dashboard";
          const hasAccess = isAdmin || sectionKey === "dashboard" || userPermissions.includes(sectionKey);
          
          if (!hasAccess) return null;

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
        {isAdmin && (
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-none text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all group">
            <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> Users & Roles
          </Link>
        )}
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
    </>
  );
}
