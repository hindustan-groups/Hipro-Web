"use client";

import React from "react";
import { usePathname } from "next/navigation";
import EmpanelmentNavbar from "@/components/empanelment/EmpanelmentNavbar";
import EmpanelmentFooter from "@/components/empanelment/EmpanelmentFooter";
import EmpanelmentSupportWidget from "@/components/empanelment/EmpanelmentSupportWidget";

export default function EmpanelmentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPortalRoute = pathname?.startsWith("/empanelment/portal");
  const isApplyRoute = pathname?.startsWith("/empanelment/apply") || pathname === "/apply";

  // Portal dashboard has its own full sidebar & header shell.
  // Do not wrap with marketing header, footer, or floating WhatsApp widget.
  if (isPortalRoute) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-900 selection:bg-red-500 selection:text-white relative">
      <EmpanelmentNavbar />
      <main className="flex-1">{children}</main>
      <div className={isApplyRoute ? "hidden md:block" : undefined}>
        <EmpanelmentFooter />
      </div>
      <div className={isApplyRoute ? "hidden md:block" : undefined}>
        <EmpanelmentSupportWidget />
      </div>
    </div>
  );
}
