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
    <header className="h-16 shrink-0 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-white font-bold text-lg">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2 border border-gray-700 w-48">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[13px] text-gray-300 placeholder-gray-600 outline-none w-full"
          />
        </div>
        <button className="relative w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-gray-900" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
