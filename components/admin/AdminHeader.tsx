"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const titles: Record<string, string> = {
  "/admin":             "Dashboard",
  "/admin/contacts":    "Contacts",
  "/admin/quotes":      "Quote Requests",
  "/admin/projects":    "Projects",
  "/admin/testimonials":"Testimonials",
  "/admin/newsletter":  "Newsletter",
  "/admin/stats":       "Site Stats",
  "/admin/settings":    "Settings",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Admin";

  return (
    <header className="h-[72px] shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 z-10 sticky top-0">
      <h1 className="text-slate-900 font-bold text-xl tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 w-48 focus-within:ring-2 focus-within:ring-construction-navy/20 focus-within:border-construction-navy transition-all">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[13px] text-slate-900 placeholder-slate-400 outline-none w-full"
          />
        </div>
        <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-construction-red rounded-full border border-white" />
        </button>
        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-slate-100 ring-offset-1 cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
