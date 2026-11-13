import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Gate Pass | Hindustan Projects",
  description: "Security checkpoint verification portal for site entry gate passes.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function VerifyPassLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

