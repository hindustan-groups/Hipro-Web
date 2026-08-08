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
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 rounded-none px-3 py-2.5 border border-slate-200 w-64 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
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
        <div className="w-10 h-10 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          A
        </div>
      </div>
    </header>
  );
}
