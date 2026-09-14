import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Playfair_Display } from "next/font/google";
import AnalyticsLinkTracker from "@/components/AnalyticsLinkTracker";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
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

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.hindustanprojects.in/#website",
    url: "https://www.hindustanprojects.in/",
    name: "Hindustan Projects (HiPRO)",
    description: "Engineering · Construction · Infrastructure firm based in Bhilwara, Rajasthan.",
    publisher: {
      "@id": "https://www.hindustanprojects.in/#organization",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": "https://www.hindustanprojects.in/#organization",
    name: "Hindustan Projects (HiPRO)",
    legalName: "Hindustan Projects",
    url: "https://www.hindustanprojects.in/",
    logo: "https://www.hindustanprojects.in/logo.jpg",
    image: "https://www.hindustanprojects.in/logo.jpg",
    description: "Engineering · Construction · Infrastructure firm based in Bhilwara, Rajasthan. Specializing in turnkey civil engineering, architectural planning, and infrastructure development.",
    foundingDate: "2019",
    founder: {
      "@type": "Person",
      name: "Yogesh Kharol",
      jobTitle: "Founder & Director",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj",
      addressLocality: "Bhilwara",
      addressRegion: "Rajasthan",
      postalCode: "311001",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 25.3510922,
      longitude: 74.6330429,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Bhilwara",
      },
      {
        "@type": "AdministrativeArea",
        name: "Rajasthan",
      },
    ],
    telephone: "+917597000601",
    email: "info@hindustanprojects.in",
    sameAs: [
      "https://www.instagram.com/hindustan_projects/",
      "https://www.facebook.com/people/Hindustan-Projects",
      "https://linkedin.com/company/hindustanprojects",
      "https://pin.it/5OlMWwi2w",
    ],
  },
];

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        {gaId ? (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics-init"
              strategy="afterInteractive"
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
