import type { Metadata } from "next";
import EmpanelmentShell from "@/components/empanelment/EmpanelmentShell";

export const metadata: Metadata = {
  title: "Vendor & Contractor Empanelment Portal | Hindustan Projects",
  manifest: "/vendor-manifest.json",
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
  return <EmpanelmentShell>{children}</EmpanelmentShell>;
}
