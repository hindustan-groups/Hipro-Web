/**
 * Reusable Schema.org JSON-LD generation utilities
 * Follows schema.org standards for BreadcrumbList and Service.
 * Uses verified HiPRO business and domain information.
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
}

export function generateServiceSchema({
  name,
  description,
  url,
  image,
}: {
  name: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "url": url,
    ...(image ? { "image": image } : {}),
    "provider": {
      "@type": "LocalBusiness",
      "@id": "https://www.hindustanprojects.in/#organization",
      "name": "Hindustan Projects",
    },
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Bhilwara",
      },
      {
        "@type": "AdministrativeArea",
        "name": "Rajasthan",
      },
    ],
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function generateFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

