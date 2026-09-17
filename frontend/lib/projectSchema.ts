import type { Project, ProjectFaq } from "@/lib/types";

export interface ProjectBreadcrumbJsonLd {
  "@context": string;
  "@type": string;
  itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Generates Schema.org BreadcrumbList structured data using canonical slug route
 */
export function generateProjectBreadcrumbs(title: string, slug: string): ProjectBreadcrumbJsonLd {
  const baseUrl = "https://www.hindustanprojects.in";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${baseUrl}/projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${baseUrl}/projects/${slug}`,
      },
    ],
  };
}

/**
 * Generates Schema.org Article / Project Case Study structured data
 * containing ONLY populated, factual fields. Zero fake ratings, reviews, or prices.
 */
export function generateProjectJsonLd(project: Project, canonicalUrl: string): Record<string, any> {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    author: {
      "@type": "Organization",
      "@id": "https://www.hindustanprojects.in/#organization",
      name: "Hindustan Projects",
      url: "https://www.hindustanprojects.in",
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://www.hindustanprojects.in/#organization",
      name: "Hindustan Projects",
      url: "https://www.hindustanprojects.in",
      logo: {
        "@type": "ImageObject",
        url: "https://www.hindustanprojects.in/logo.jpg",
      },
    },
  };

  // Narrative description
  const desc =
    project.shortDescription ||
    project.metaDescription ||
    (project.description ? project.description.slice(0, 200) : null);
  if (desc && desc.trim()) {
    schema.description = desc.trim();
  }

  // Cover image
  if (project.image && project.image.trim()) {
    schema.image = [project.image.trim()];
  }

  // Publication dates
  if (project.publishedAt) {
    const pub = new Date(project.publishedAt);
    if (!isNaN(pub.getTime())) {
      schema.datePublished = pub.toISOString();
    }
  }
  if (project.updatedAt) {
    const upd = new Date(project.updatedAt);
    if (!isNaN(upd.getTime())) {
      schema.dateModified = upd.toISOString();
    }
  }

  // Sector Category
  if (project.category && project.category.trim()) {
    schema.articleSection = project.category.trim();
  }

  // Focus & Secondary Keywords (only if explicitly entered)
  const keywordsList: string[] = [];
  if (project.focusKeywords && project.focusKeywords.trim()) {
    keywordsList.push(project.focusKeywords.trim());
  }
  if (project.secondaryKeywords && project.secondaryKeywords.trim()) {
    keywordsList.push(project.secondaryKeywords.trim());
  }
  if (keywordsList.length > 0) {
    schema.keywords = keywordsList.join(", ");
  }

  // Client Organization (only if entered)
  if (project.client && project.client.trim()) {
    schema.sponsor = {
      "@type": "Organization",
      name: project.client.trim(),
    };
  }

  // Verified Geography & Spatial Coverage (Zero defaults, only what is present in DB)
  const hasVerifiedGeo = Boolean(
    (project.location && project.location.trim()) ||
    (project.city && project.city.trim()) ||
    (project.district && project.district.trim()) ||
    (project.state && project.state.trim()) ||
    (project.country && project.country.trim()) ||
    (project.latitude && project.longitude)
  );

  if (hasVerifiedGeo) {
    const place: Record<string, any> = {
      "@type": "Place",
    };

    if (project.location && project.location.trim()) {
      place.name = project.location.trim();
    }

    const hasPostalAddress = Boolean(
      (project.city && project.city.trim()) ||
      (project.district && project.district.trim()) ||
      (project.state && project.state.trim()) ||
      (project.country && project.country.trim()) ||
      (project.postalCode && project.postalCode.trim())
    );

    if (hasPostalAddress) {
      const address: Record<string, any> = {
        "@type": "PostalAddress",
      };
      if (project.city && project.city.trim()) address.addressLocality = project.city.trim();
      if (project.state && project.state.trim()) address.addressRegion = project.state.trim();
      if (project.country && project.country.trim()) address.addressCountry = project.country.trim();
      if (project.postalCode && project.postalCode.trim()) address.postalCode = project.postalCode.trim();
      place.address = address;
    }

    if (project.latitude && project.longitude) {
      place.geo = {
        "@type": "GeoCoordinates",
        latitude: project.latitude,
        longitude: project.longitude,
      };
    }

    if (project.googleMapsUrl && project.googleMapsUrl.trim()) {
      place.hasMap = project.googleMapsUrl.trim();
    }

    schema.contentLocation = place;
  }

  return schema;
}

/**
 * Generates Schema.org FAQPage structured data ONLY if valid FAQs exist.
 * Returns null if no valid FAQs are present.
 */
export function generateProjectFaqSchema(faqs: ProjectFaq[]): Record<string, any> | null {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;

  const validFaqs = faqs.filter(
    (f) =>
      f &&
      typeof f.question === "string" &&
      f.question.trim().length > 0 &&
      typeof f.answer === "string" &&
      f.answer.trim().length > 0
  );

  if (validFaqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map((f) => ({
      "@type": "Question",
      name: f.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer.trim(),
      },
    })),
  };
}
