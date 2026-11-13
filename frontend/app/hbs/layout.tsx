import type { Metadata } from "next";
import Script from "next/script";
import HbsNavbar from "@/components/hbs/HbsNavbar";
import HbsFooter from "@/components/hbs/HbsFooter";
import HbsMobileBar from "@/components/hbs/HbsMobileBar";
import { fetchHbsContent, fetchHbsServices, DEFAULT_HBS_CONTENT } from "@/lib/hbsData";
import {
  getHbsBaseUrl,
  getHbsCanonicalUrl,
  resolveHbsOgImage,
  HBS_SEO_KEYWORDS,
  HBS_DEFAULT_TITLE,
  HBS_DEFAULT_DESCRIPTION,
} from "@/lib/hbsSeo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchHbsContent();
  const baseUrl = getHbsBaseUrl();
  const canonicalUrl = getHbsCanonicalUrl();

  const title = content.metaTitle || HBS_DEFAULT_TITLE;
  const description = content.metaDescription || HBS_DEFAULT_DESCRIPTION;

  const hbsFavicon = content.favicon || "/hbs-favicon.ico";
  const hbsAppleIcon = content.logoMark || "/hbs-icon.jpg";

  const customOg = content.ogImage || content.ogDefaultImage;
  const ogImages = resolveHbsOgImage(customOg, "Hind Build — Complete Building Repair, Maintenance & Protection");

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | Hind Build",
    },
    description,
    keywords: HBS_SEO_KEYWORDS,
    applicationName: "Hind Build",
    authors: [{ name: "Hind Build (Hindustan Projects)", url: baseUrl }],
    creator: "Hind Build",
    publisher: "Hindustan Projects (HiPRO)",
    icons: {
      icon: [
        { url: hbsFavicon, sizes: "32x32", type: hbsFavicon.endsWith(".ico") ? "image/x-icon" : "image/jpeg" },
      ],
      shortcut: hbsFavicon,
      apple: [
        { url: hbsAppleIcon, sizes: "180x180", type: "image/jpeg" },
      ],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonicalUrl,
      siteName: "Hind Build | Hindustan Projects",
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImages[0].url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "geo.region": "IN-RJ",
      "geo.placename": "Bhilwara",
      "geo.position": "25.3510922;74.6330429",
      "ICBM": "25.3510922, 74.6330429",
    },
  };
}

export default async function HbsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, services] = await Promise.all([
    fetchHbsContent(),
    fetchHbsServices(),
  ]);

  const baseUrl = getHbsBaseUrl();
  const canonicalHome = getHbsCanonicalUrl();

  const hbsJsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness", "RoofingContractor", "GeneralContractor"],
    "@id": `${canonicalHome}#organization`,
    name: "Hind Build",
    alternateName: ["Hind Build", "Hind Building Solutions", "HiBUILD"],
    description: content.metaDescription || HBS_DEFAULT_DESCRIPTION,
    image: `${baseUrl}/hbs-og-banner.jpg`,
    logo: `${baseUrl}/hbs-logo.jpg`,
    parentOrganization: {
      "@type": "Organization",
      name: "Hindustan Projects (HiPRO)",
      url: "https://www.hindustanprojects.in/",
    },
    url: canonicalHome,
    telephone: content.phone || "+91 75970 00601",
    email: content.email || "hbs@hindustanprojects.in",
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
    areaServed: [
      { "@type": "City", name: "Bhilwara" },
      { "@type": "AdministrativeArea", name: "Rajasthan" },
      { "@type": "City", name: "Jaipur" },
      { "@type": "City", name: "Udaipur" },
      { "@type": "City", name: "Ajmer" },
      { "@type": "City", name: "Kota" },
    ],
    currenciesAccepted: "INR",
    priceRange: "₹₹",
    sameAs: [
      "https://www.instagram.com/hindustan_projects/",
      "https://linkedin.com/company/hindustanprojects",
      "https://pin.it/5OlMWwi2w",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Building Repair & Maintenance Services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.shortDescription || undefined,
          url: getHbsCanonicalUrl(`services/${s.slug}`),
        },
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white font-sans hbs-shell">
      {/* ── Direct Google Fonts CDN Link for Hind Build (Guarantees exact font match on mobile devices) ── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700;1,800;1,900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        /* Guarantee 100% exact Montserrat desktop font rendering across all mobile browsers */
        .hbs-shell,
        .hbs-shell * {
          font-family: 'Montserrat', var(--font-montserrat), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        .hbs-shell h1,
        .hbs-shell h2,
        .hbs-shell h3,
        .hbs-shell h4,
        .hbs-shell h5,
        .hbs-shell h6,
        .hbs-shell .font-display {
          font-family: 'Montserrat', var(--font-montserrat), system-ui, -apple-system, sans-serif !important;
          letter-spacing: -0.02em;
        }
        .hbs-shell .font-mono,
        .hbs-shell [class*="font-mono"] {
          font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }
        .hbs-shell .font-serif,
        .hbs-shell .font-accent,
        .hbs-shell .headline-accent,
        .hbs-shell .font-accent-word {
          font-family: 'Playfair Display', Georgia, serif !important;
        }
      `}</style>
      {/* GA4 Analytics Integration (via CMS or NEXT_PUBLIC_HBS_GA_MEASUREMENT_ID) */}
      {(content.gaMeasurementId || process.env.NEXT_PUBLIC_HBS_GA_MEASUREMENT_ID) && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${content.gaMeasurementId || process.env.NEXT_PUBLIC_HBS_GA_MEASUREMENT_ID}`}
          />
          <Script
            id="hbs-google-analytics"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${content.gaMeasurementId || process.env.NEXT_PUBLIC_HBS_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hbsJsonLd) }}
      />
      <HbsNavbar content={content} />
      <main className="flex-1 w-full">{children}</main>
      <HbsMobileBar phone={content.phone} whatsapp={content.whatsapp} />
      <HbsFooter content={content} services={services} />
    </div>
  );
}
