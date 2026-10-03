import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Playfair_Display } from "next/font/google";
import AnalyticsLinkTracker from "@/components/AnalyticsLinkTracker";
import { COMPANY_INFO } from "@/lib/companyData";
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

const verifiedSocials = Object.values(COMPANY_INFO.socials).filter(Boolean);

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.hindustanprojects.in/#website",
    url: "https://www.hindustanprojects.in/",
    name: COMPANY_INFO.brandName,
    description: "Engineering · Construction · Infrastructure firm based in Bhilwara, Rajasthan.",
    publisher: {
      "@id": "https://www.hindustanprojects.in/#organization",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "GeneralContractor"],
    "@id": "https://www.hindustanprojects.in/#organization",
    name: COMPANY_INFO.brandName,
    legalName: COMPANY_INFO.name,
    url: "https://www.hindustanprojects.in/",
    logo: "https://www.hindustanprojects.in/logo.jpg",
    image: "https://www.hindustanprojects.in/logo.jpg",
    description: "Engineering, turnkey civil construction, and infrastructure firm based in Bhilwara, Rajasthan. Specializing in turnkey civil construction, building contracting, architectural planning, and infrastructure development.",
    foundingDate: String(COMPANY_INFO.foundedYear),
    priceRange: "₹₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Cheque, Bank Transfer, Online",
    founder: {
      "@type": "Person",
      "@id": "https://www.hindustanprojects.in/#founder",
      name: "Yogesh Kharol",
      jobTitle: "Founder & Director",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj",
      addressLocality: COMPANY_INFO.city,
      addressRegion: COMPANY_INFO.state,
      postalCode: COMPANY_INFO.pincode,
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
    telephone: COMPANY_INFO.formattedPhone,
    email: COMPANY_INFO.email,
    sameAs: verifiedSocials,
    knowsAbout: [
      "Civil Construction",
      "Turnkey Construction",
      "Commercial Construction",
      "Industrial Construction",
      "Architectural Planning",
      "Land Surveying",
      "Construction Cost Estimation",
      "Building Contracting",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Construction & Engineering Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Professional Construction Services",
            url: "https://www.hindustanprojects.in/services/professional-construction-services",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Architecture & Planning",
            url: "https://www.hindustanprojects.in/services/architecture-planning",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Surveying & Site Measurements",
            url: "https://www.hindustanprojects.in/services/surveying-site-measurements",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Interior & Exterior Design",
            url: "https://www.hindustanprojects.in/services/interior-exterior-design",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Water Treatment Plant Construction",
            url: "https://www.hindustanprojects.in/services/water-treatment-plant-construction",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Project Management & Consultancy",
            url: "https://www.hindustanprojects.in/services/project-management-consultancy",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Construction Cost Estimation",
            url: "https://www.hindustanprojects.in/cost-estimator",
          },
        },
      ],
    },
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
