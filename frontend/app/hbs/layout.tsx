import type { Metadata } from "next";
import HbsNavbar from "@/components/hbs/HbsNavbar";
import HbsFooter from "@/components/hbs/HbsFooter";
import HbsMobileBar from "@/components/hbs/HbsMobileBar";
import { fetchHbsContent, fetchHbsServices, DEFAULT_HBS_CONTENT } from "@/lib/hbsData";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchHbsContent();

  return {
    metadataBase: new URL("https://hindbuilding.hindustanprojects.in"),
    title: {
      default: content.metaTitle || "Hind Building Solutions (HBS) | Building Repair, Maintenance & Protection",
      template: "%s | Hind Building Solutions (HBS)",
    },
    description: content.metaDescription || "Professional building repair, waterproofing, painting, termite control, electrical, and facility maintenance services by Hind Building Solutions, a Hindustan Projects company.",
    alternates: {
      canonical: "/hbs",
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "https://hindbuilding.hindustanprojects.in",
      siteName: "Hind Building Solutions (HBS)",
      title: content.metaTitle || "Hind Building Solutions (HBS) | Building Repair, Maintenance & Protection",
      description: content.metaDescription || "Specialized building repair, waterproofing, termite control and maintenance division under Hindustan Projects.",
      images: [
        {
          url: content.ogImage || "/logo.jpg",
          width: 1200,
          height: 630,
          alt: "Hind Building Solutions Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle || "Hind Building Solutions (HBS)",
      description: content.metaDescription || "Specialized building repair and maintenance division.",
      images: [content.ogImage || "/logo.jpg"],
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

  const hbsJsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness", "RoofingContractor"],
    "@id": "https://hindbuilding.hindustanprojects.in/#organization",
    name: "Hind Building Solutions",
    alternateName: "HBS",
    parentOrganization: {
      "@type": "Organization",
      name: "Hindustan Projects (HiPRO)",
      url: "https://www.hindustanprojects.in/",
    },
    url: "https://hindbuilding.hindustanprojects.in/",
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
          url: `https://hindbuilding.hindustanprojects.in/services#${s.slug}`,
        },
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white font-sans">
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
