import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Playfair_Display } from "next/font/google";
import AnalyticsLinkTracker from "@/components/AnalyticsLinkTracker";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hindustanprojects.in"),
  title: {
    default: "Hindustan Projects (HiPRO) | Engineering, Construction & Infrastructure",
    template: "%s | Hindustan Projects (HiPRO)",
  },
  description: "Hindustan Projects (HiPRO) is an engineering, turnkey construction, and infrastructure firm based in Bhilwara, Rajasthan, delivering residential, commercial, and industrial developments.",
  keywords: [
    "Hindustan Projects",
    "HiPRO",
    "Construction Company Bhilwara",
    "Civil Contractor Bhilwara",
    "Building Contractor Bhilwara",
    "Turnkey Construction Bhilwara",
    "Industrial Construction Bhilwara",
    "Civil Engineering Rajasthan",
    "Turnkey Construction",
    "Architectural Planning",
    "Infrastructure Development",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.hindustanprojects.in",
    siteName: "Hindustan Projects (HiPRO)",
    title: "Hindustan Projects (HiPRO) | Engineering, Construction & Infrastructure",
    description: "Engineering, turnkey construction, and infrastructure firm based in Bhilwara, Rajasthan. Delivering quality-first civil execution since 2019.",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 600,
        alt: "Hindustan Projects (HiPRO) Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Hindustan Projects (HiPRO) | Engineering, Construction & Infrastructure",
    description: "Engineering, turnkey construction, and infrastructure firm based in Bhilwara, Rajasthan.",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  other: {
    "geo.region": "IN-RJ",
    "geo.placename": "Bhilwara",
    "geo.position": "25.3510922;74.6330429",
    "ICBM": "25.3510922, 74.6330429",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        {gaId ? (
          <>
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics-init"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        ) : null}
        <AnalyticsLinkTracker />
        {children}
      </body>
    </html>
  );
}
