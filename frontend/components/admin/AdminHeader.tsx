"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Menu, LogOut } from "lucide-react";

const titles: Record<string, string> = {
  "/admin":             "Dashboard",
  "/admin/stats":       "Site Stats & Analytics",
  "/admin/leads":       "Leads Hub",
  "/admin/quotes":      "Quote Requests",
  "/admin/contacts":    "Contact Inquiries",
  "/admin/applications":"Job Applications",
  "/admin/newsletter":  "Newsletter Subscribers",
  "/admin/projects":    "Projects Portfolio",
  "/admin/services":    "Services Management",
  "/admin/blogs":       "Blog Articles",
  "/admin/testimonials":"Client Reviews",
  "/admin/team":        "Team Members",
  "/admin/hero":        "Hero Section CMS",
  "/admin/about":       "About Page CMS",
  "/admin/contact-page":"Contact Page CMS",
  "/admin/cost-estimator": "Cost Estimator CMS",
  "/admin/jobs":        "Job Openings",
  "/admin/cta-management": "CTA Management",
  "/admin/navigation":  "Navigation Menus",
  "/admin/users":       "Users & Roles",
  "/admin/settings":    "Site Settings",
  "/admin/hbs":             "Hind Build Dashboard",
  "/admin/hbs/home":        "Hind Build · Homepage CMS",
  "/admin/hbs/about":       "Hind Build · About Page CMS",
  "/admin/hbs/why-choose-us":"Hind Build · Why Choose Us",
  "/admin/hbs/services":    "Hind Build · Services Catalog",
  "/admin/hbs/projects":    "Hind Build · Projects & Case Studies",
  "/admin/hbs/testimonials":"Hind Build · Testimonials",
  "/admin/hbs/leads":       "Hind Build · Leads & Quotes",
  "/admin/hbs/branding":    "Hind Build · Branding & Logos",
  "/admin/hbs/media":       "Hind Build · Media Library",
  "/admin/hbs/seo":         "Hind Build · SEO & Metadata",
  "/admin/hbs/settings":    "Hind Build · Settings",
};

export default function AdminHeader({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin-login";
  };
  const getTitle = () => {
    if (!pathname) return "Admin Panel";
    if (titles[pathname]) return titles[pathname];
    const match = Object.entries(titles).find(
      ([key]) => key !== "/admin" && pathname?.startsWith(key)
    );
    return match ? match[1] : "Admin Panel";
  };
  const title = getTitle();

  return (
    <header className="h-[70px] shrink-0 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8 z-30 sticky top-0 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pathname?.startsWith("/admin/hbs") ? "/hibuild-brand-logo.png" : "/logo.jpg"}
            alt="Brand Logo"
            className="h-7 w-auto object-contain md:hidden mix-blend-multiply"
          />
          <h1 className="text-slate-900 font-bold text-lg md:text-xl tracking-tight line-clamp-1">
            {pathname?.startsWith("/admin/hbs") ? (
              <>
                <span className="md:hidden">Hind Build Admin</span>
                <span className="hidden md:inline">{title}</span>
              </>
            ) : (
              title
            )}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {pathname?.startsWith("/admin/hbs") ? (
          <>
            {/* Apple Status Pill */}
            <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>HiBUILD CMS · Online</span>
            </div>

            {/* Apple Spotlight Capsule Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100/70 hover:bg-slate-100/90 rounded-full px-3.5 py-1.5 border border-slate-200/60 w-60 focus-within:w-72 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-400 transition-all duration-200 backdrop-blur-md">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search CMS..."
                className="bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none w-full"
              />
            </div>

            {/* Notification Apple Glass Pill */}
            <button className="relative w-9 h-9 rounded-xl bg-white/80 hover:bg-white border border-slate-200/70 flex items-center justify-center hover:text-slate-900 transition-all text-slate-500 shadow-2xs">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Logout Apple Glass Pill */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="relative w-9 h-9 rounded-xl bg-white/80 hover:bg-red-50 border border-slate-200/70 hover:border-red-200 flex items-center justify-center hover:text-red-600 transition-all text-slate-500 shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Apple Avatar Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/60">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase tracking-wider shadow-xs ring-1 ring-black/5">
                {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || user?.email || "Admin"}</p>
                <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider font-mono">HiBUILD Staff</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-none px-3 py-2 border border-slate-200 w-64 focus-within:border-construction-navy transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none w-full"
              />
            </div>
            <button className="relative w-9 h-9 rounded-none bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-construction-navy transition-colors text-slate-500">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-construction-red rounded-full" />
            </button>
            <button onClick={handleLogout} title="Logout" className="relative w-9 h-9 rounded-none bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-construction-red transition-colors text-slate-500">
              <LogOut className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
              <div className="w-9 h-9 rounded-none bg-construction-navy text-white flex items-center justify-center font-bold text-xs uppercase tracking-wider">
                {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || user?.email || "Admin"}</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">{user?.role || "admin"}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
