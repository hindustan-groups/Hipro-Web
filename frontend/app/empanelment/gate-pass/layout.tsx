import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Gate Pass Generator | Hindustan Projects",
  description: "Daily construction site gate pass generator for authorized workers and contractors.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function GatePassLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

