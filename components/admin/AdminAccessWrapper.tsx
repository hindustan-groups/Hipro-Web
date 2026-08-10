"use client";

import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function AdminAccessWrapper({ user, children }: { user: any, children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (user?.role === "admin") {
    return <>{children}</>;
  }

  let userPermissions: string[] = [];
  try {
    userPermissions = user?.permissions ? JSON.parse(user?.permissions) : [];
  } catch (e) {
    userPermissions = [];
  }

  const sectionKey = pathname.split("/")[2] || "dashboard";
  const hasAccess = sectionKey === "dashboard" || userPermissions.includes(sectionKey);

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
