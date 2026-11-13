import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contractor Empanelment Application | Hindustan Projects",
  description: "Vendor and contractor registration application form for Hindustan Projects.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

