import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "House Construction Cost Calculator in Bhilwara | HiPRO",
  description: "Calculate indicative house construction costs in Bhilwara and Rajasthan. Get package-wise estimates for residential construction from ₹1,680/sqft by Hindustan Projects.",
  alternates: {
    canonical: "https://www.hindustanprojects.in/cost-estimator",
  },
};

export default function CostEstimatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
