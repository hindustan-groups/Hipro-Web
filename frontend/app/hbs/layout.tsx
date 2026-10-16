import type { Metadata } from "next";
import Script from "next/script";
import HbsNavbar from "@/components/hbs/HbsNavbar";
import HbsFooter from "@/components/hbs/HbsFooter";
import HbsMobileBar from "@/components/hbs/HbsMobileBar";
import { fetchHbsContent, fetchHbsServices, DEFAULT_HBS_CONTENT } from "@/lib/hbsData";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchHbsContent();
  const isSubdomainActive = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const baseUrl = isSubdomainActive
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in";
  const canonicalPath = isSubdomainActive ? "/" : "/hbs";

  const hbsOgImage =
    content.ogImage ||
    content.ogDefaultImage ||
    content.logoPrimary ||
    "/hbs-og-default.svg";

  const hbsTwitterImage =
    content.twitterImage ||
    hbsOgImage;

  const hbsFavicon =
    content.favicon ||
    "/hbs-favicon.jpg";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: content.metaTitle || "Hind Build | Building Repair, Maintenance & Protection",
      template: "%s | Hind Build",
    },
    description: content.metaDescription || "Professional building repair, waterproofing, painting, termite control, electrical, and facility maintenance services by Hind Build, a Hindustan Projects company.",
    icons: {
      icon: hbsFavicon,
      shortcut: hbsFavicon,
      apple: content.logoMark || hbsFavicon,
    },
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: isSubdomainActive ? "https://hindbuilding.hindustanprojects.in" : "https://www.hindustanprojects.in/hbs",
      siteName: "Hind Build",
      title: content.metaTitle || "Hind Build | Building Repair, Maintenance & Protection",
      description: content.metaDescription || "Specialized building repair, waterproofing, termite control and maintenance division under Hindustan Projects.",
      images: [
        {
          url: hbsOgImage,
          width: 1200,
          height: 630,
          alt: "Hind Build",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle || "Hind Build",
      description: content.metaDescription || "Specialized building repair and maintenance division.",
      images: [hbsTwitterImage],
    },
    robots: {
      index: true,
      follow: true,
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

  const isSubdomainActive = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const hbsBaseUrl = isSubdomainActive
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in/hbs";

  const hbsJsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness", "RoofingContractor"],
    "@id": `${hbsBaseUrl}#organization`,
    name: "Hind Build",
    alternateName: "Hind Build",
    parentOrganization: {
      "@type": "Organization",
      name: "Hindustan Projects (HiPRO)",
      url: "https://www.hindustanprojects.in/",
    },
    url: isSubdomainActive ? "https://hindbuilding.hindustanprojects.in/" : "https://www.hindustanprojects.in/hbs",
    telephone: content.phone,
    email: content.email,
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
    priceRange: "₹₹",
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
          url: `https://hindbuilding.hindustanprojects.in/services/${s.slug}`,
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
      {content.gaMeasurementId && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${content.gaMeasurementId}`}
          />
          <Script
            id="hbs-google-analytics"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${content.gaMeasurementId}', {
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
