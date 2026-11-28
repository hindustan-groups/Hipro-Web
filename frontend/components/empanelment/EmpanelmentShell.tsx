"use client";

import React, { useEffect } from "react";
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/vendor-sw.js", { scope: "/empanelment" }).catch(() => {
        navigator.serviceWorker.register("/vendor-sw.js").catch(() => {});
      });
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).__hiproDeferredInstallPrompt = e;
      window.dispatchEvent(new Event("hipro-pwa-prompt-ready"));
    };

    const onAppInstalled = () => {
      (window as any).__hiproDeferredInstallPrompt = null;
      window.dispatchEvent(new Event("hipro-pwa-installed"));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

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
