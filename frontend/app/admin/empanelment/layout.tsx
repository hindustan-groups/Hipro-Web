import React from "react";

export default function EmpanelmentAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {children}
    </div>
  );
}
