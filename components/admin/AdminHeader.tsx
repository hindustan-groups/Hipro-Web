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
        <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-none px-3 py-2.5 border border-slate-200 w-64 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[13px] text-slate-900 placeholder-slate-400 outline-none w-full"
          />
        </div>
        <button className="relative w-10 h-10 rounded-none bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm text-slate-500">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button onClick={handleLogout} className="relative w-10 h-10 rounded-none bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm text-slate-500">
          <LogOut className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-10 h-10 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-[13px] font-bold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
