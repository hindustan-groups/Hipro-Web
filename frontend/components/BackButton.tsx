"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show on home page
  if (pathname === "/") return null;

  return (
    <button
      onClick={() => router.back()}
      className="fixed top-20 left-4 sm:left-6 lg:left-8 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-md hover:shadow-lg text-slate-700 hover:text-construction-red transition-all duration-200 group"
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      <span className="text-sm font-semibold uppercase tracking-wider hidden sm:inline">Back</span>
    </button>
  );
}
