"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Menu, LogOut } from "lucide-react";

const titles: Record<string, string> = {
  "/admin":             "Dashboard",
  "/admin/hero":         "Hero Section",
  "/admin/about":        "About Page Content",
  "/admin/contacts":    "Contacts",
  "/admin/quotes":      "Quote Requests",
  "/admin/projects":    "Projects",
  "/admin/testimonials":"Testimonials",
  "/admin/newsletter":  "Newsletter",
  "/admin/stats":       "Site Stats",
  "/admin/settings":    "Settings",
};

export default function AdminHeader({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin-login";
  };
  const title = titles[pathname] ?? "Admin";

  return (
    <header className="h-[72px] shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 md:px-8 z-20 sticky top-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-slate-900 font-bold text-lg md:text-xl tracking-tight line-clamp-1">{title}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
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
      </div>
    </header>
  );
}
