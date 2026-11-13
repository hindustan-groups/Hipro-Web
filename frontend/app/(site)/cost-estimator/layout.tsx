import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "House Construction Cost Calculator in Bhilwara",
  description: "Calculate indicative house construction costs in Bhilwara and Rajasthan. Get package-wise estimates for residential construction from ₹1,680/sqft by Hindustan Projects.",
  alternates: {
    canonical: "/cost-estimator",
  },
  openGraph: {
    title: "House Construction Cost Calculator in Bhilwara | HiPRO",
    description: "Calculate indicative house construction costs in Bhilwara and Rajasthan. Get package-wise estimates for residential construction from ₹1,680/sqft by Hindustan Projects.",
    url: "https://www.hindustanprojects.in/cost-estimator",
    siteName: "Hindustan Projects (HiPRO)",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "HiPRO House Construction Cost Calculator Bhilwara",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "House Construction Cost Calculator in Bhilwara | HiPRO",
    description: "Calculate indicative house construction costs in Bhilwara and Rajasthan. Get package-wise estimates for residential construction from ₹1,680/sqft by Hindustan Projects.",
    images: ["/og-banner.jpg"],
  },
};

export default function CostEstimatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
