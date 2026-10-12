import type { Metadata } from "next";
import EmpanelmentNavbar from "@/components/empanelment/EmpanelmentNavbar";
import EmpanelmentFooter from "@/components/empanelment/EmpanelmentFooter";

export const metadata: Metadata = {
  title: "Vendor & Contractor Empanelment Portal | Hindustan Projects",
  description:
    "Official vendor registration, KYC onboarding, capacity tiering, active construction tenders radar, and daily 24-hour site gate pass generator for Hindustan Projects.",
  keywords: [
    "vendor empanelment",
    "contractor registration jaipur",
    "hindustan projects vendors",
    "construction tenders rajasthan",
    "site gate pass generator",
    "pvc contractor smart card",
  ],
};

export default function EmpanelmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-900 selection:bg-amber-500 selection:text-white">
      <EmpanelmentNavbar />
      <main className="flex-1">{children}</main>
      <EmpanelmentFooter />
    </div>
  );
}
