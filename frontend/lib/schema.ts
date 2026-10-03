import { COMPANY_INFO } from "./companyData";

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
  serviceType,
}: {
  name: string;
  description: string;
  url: string;
  image?: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "url": url,
    ...(serviceType ? { "serviceType": serviceType } : {}),
    ...(image ? { "image": image } : {}),
    "provider": {
      "@type": ["LocalBusiness", "GeneralContractor"],
      "@id": "https://www.hindustanprojects.in/#organization",
      "name": COMPANY_INFO.brandName,
      "telephone": COMPANY_INFO.formattedPhone,
      "email": COMPANY_INFO.email,
      "url": "https://www.hindustanprojects.in/",
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Bhilwara",
      },
      {
        "@type": "AdministrativeArea",
        "name": "Bhilwara District",
      },
      {
        "@type": "AdministrativeArea",
        "name": "Rajasthan",
      },
    ],
  };
}

export function generateContactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": "https://www.hindustanprojects.in/contact#webpage",
    "url": "https://www.hindustanprojects.in/contact",
    "name": "Contact Hindustan Projects — Engineering & Construction Office in Bhilwara",
    "description": "Contact Hindustan Projects (HiPRO) for construction inquiries, turnkey civil contracting, architectural planning, and site evaluations in Bhilwara, Rajasthan.",
    "mainEntity": {
      "@id": "https://www.hindustanprojects.in/#organization",
    },
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


