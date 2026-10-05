import { COMPANY_INFO } from "@/lib/companyData";

const verifiedSocials = Object.values(COMPANY_INFO.socials).filter(Boolean);

export const HIPRO_JSON_LD = [
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
