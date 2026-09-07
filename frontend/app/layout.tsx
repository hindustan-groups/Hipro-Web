import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
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
  telephone: "+917597000601",
  email: "info@hindustanprojects.in",
  sameAs: [
    "https://www.instagram.com/hindustan_projects/",
    "https://www.facebook.com/people/Hindustan-Projects",
    "https://linkedin.com/company/hindustanprojects",
    "https://pin.it/5OlMWwi2w",
  ],
  priceRange: "₹₹₹",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        {children}
      </body>
    </html>
  );
}
