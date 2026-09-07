import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "House Construction Cost Calculator",
  description: "Calculate realistic house construction cost estimates in India. Package-wise pricing based on plot size, floors, and specifications by Hindustan Projects (HiPRO).",
  alternates: {
    canonical: "/cost-estimator",
  },
};

export default function CostEstimatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
