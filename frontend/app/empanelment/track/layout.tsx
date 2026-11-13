import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Empanelment Application | Hindustan Projects",
  description: "Track status of vendor empanelment application and verification with Hindustan Projects.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

