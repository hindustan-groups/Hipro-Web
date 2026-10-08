"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function AdminAccessWrapper({ user, children }: { user: any, children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Lock outer browser window scroll so admin header and sidebar never scroll off-screen
    window.scrollTo(0, 0);
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  if (user?.role === "admin") {
    return <>{children}</>;
  }

  let userPermissions: string[] = [];
  if (Array.isArray(user?.permissions)) {
    userPermissions = user.permissions;
  } else if (typeof user?.permissions === "string") {
    try {
      userPermissions = JSON.parse(user.permissions);
    } catch (e) {
      userPermissions = [];
    }
  }

  const segments = pathname.split("/");
  const sectionKey = segments[2] || "dashboard";
  const subKey = segments[2] === "hbs" && segments[3] ? `hbs-${segments[3]}` : null;

  const hasAccess =
    sectionKey === "dashboard" ||
    (sectionKey === "hbs" && (
      userPermissions.includes("hbs") ||
      (subKey && userPermissions.includes(subKey))
    )) ||
    userPermissions.includes(sectionKey) ||
    (sectionKey === "projects-hero" && (
      userPermissions.includes("projects-hero") ||
      userPermissions.includes("projects") ||
      userPermissions.includes("hero")
    )) ||
    (sectionKey === "cost-estimator" && (
      userPermissions.includes("cost-estimator") ||
      userPermissions.includes("settings")
    )) ||
    (sectionKey === "leads" && (
      userPermissions.includes("leads") ||
      userPermissions.includes("contacts") ||
      userPermissions.includes("quotes") ||
      userPermissions.includes("applications")
    )) ||
    (sectionKey === "automail" && (
      userPermissions.includes("automail") ||
      userPermissions.includes("leads") ||
      userPermissions.includes("newsletter")
    ));

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 max-w-md">
          You do not have permission to view or manage the {sectionKey} section. 
          Please contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
