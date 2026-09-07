/**
 * VERIFIED COMPANY DATA FOR HINDUSTAN PROJECTS (HiPRO)
 * Source of truth for Phase 1 homepage upgrade.
 * All information strictly grounded in verified facts.
 */

export const COMPANY_INFO = {
  name: "Hindustan Projects",
  brandName: "Hindustan Projects (HiPRO)",
  tagline: "Engineering · Construction · Infrastructure",
  foundedYear: 2019,
  founder: "Yogesh Kharol — Founder / Director",
  experienceYears: "8+",
  
  // Contacts
  phone: "7597000601",
  formattedPhone: "+91 75970 00601",
  phoneTel: "tel:+917597000601",
  whatsappNumber: "7597000601",
  whatsappLink: "https://wa.me/917597000601",
  email: "info@hindustanprojects.in",
  emailMailto: "mailto:info@hindustanprojects.in",
  
  // Address
  address: "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001, India",
  city: "Bhilwara",
  state: "Rajasthan",
  pincode: "311001",
  country: "India",

  // Verified Stats
  stats: {
    experience: "8+",
    projects: "150+",
    clients: "200+",
    team: "30+",
    awards: "10+",
    satisfaction: "85%",
  },

  // Social Links (Verified only - YouTube not available)
  socials: {
    instagram: "https://www.instagram.com/hindustan_projects/",
    facebook: "https://www.facebook.com/people/Hindustan-Projects",
    linkedin: "https://linkedin.com/company/hindustanprojects",
    pinterest: "https://pin.it/5OlMWwi2w",
  },

  // Group Companies / Ecosystem
  groupCompanies: [
    {
      name: "Hindustan Projects",
      category: "Architecture & Infrastructure",
      description: "Core Architecture, Turnkey Civil Construction & Infrastructure Execution.",
      url: "https://www.hindustanprojects.in/",
      isExternal: false,
      status: "Flagship",
    },
    {
      name: "HiPro Marketing",
      category: "Brand & Commercial Solutions",
      description: "Marketing and brand solutions under the Hindustan Group.",
      url: null,
      isExternal: false,
      status: "Coming Soon",
    },
    {
      name: "HiPro IT Services",
      category: "Digital & Technology",
      description: "Digital solutions and technology services under the Hindustan Group.",
      url: "https://www.itservices.hindustanprojects.in/",
      isExternal: true,
      status: "Live Portal",
    },
    {
      name: "Hindustan Empanelment",
      category: "Institutional Empanelment",
      description: "Contractor, Vendor & Institutional Empanelment Services.",
      url: "https://empanelment.hindustanprojects.in/",
      isExternal: true,
      status: "Live Portal",
    },
  ],

  // Verified Core Services
  services: [
    "Architecture & Planning",
    "Professional Construction Services",
    "Surveying & Site Measurements",
    "Interior & Exterior Design",
    "Water Treatment Plant Construction",
    "Project Management & Consultancy",
  ],
};

/**
 * Normalizes and cleans service titles to fix known typo/spacing issues:
 * e.g. "architcture planning" -> "Architecture & Planning"
 *      "Interior  & Exterior" -> "Interior & Exterior"
 */
export function cleanServiceTitle(title: string = ""): string {
  if (!title) return "";
  const trimmed = title.trim();
  const lower = trimmed.toLowerCase().replace(/\s+/g, " ");

  if (lower.includes("architcture") || lower.includes("architecture")) {
    return "Architecture & Planning";
  }
  if (lower.includes("interior") && (lower.includes("exterior") || lower.includes("design"))) {
    return "Interior & Exterior Design";
  }
  if (lower.includes("surveying")) {
    return "Surveying & Site Measurements";
  }
  if (lower.includes("water treatment")) {
    return "Water Treatment Plant Construction";
  }
  if (lower.includes("project management")) {
    return "Project Management & Consultancy";
  }
  if (lower.includes("professional construction") || lower === "construction") {
    return "Professional Construction Services";
  }

  // Generic typo replacements
  return trimmed
    .replace(/architcture\s*planning/gi, "Architecture & Planning")
    .replace(/Interior\s+&\s+Exterior/gi, "Interior & Exterior")
    .replace(/constrution/gi, "construction")
    .replace(/povide/gi, "provide");
}

/**
 * Normalizes text content for typos like "IDEA TO EXCUTION", "constrution", etc.
 */
export function cleanContentTypos(text: string = ""): string {
  if (!text) return "";
  return text
    .replace(/IDEA TO EXCUTION/gi, "IDEA TO EXECUTION")
    .replace(/EXCUTION/gi, "EXECUTION")
    .replace(/all services provide by us/gi, "Engineering · Construction · Infrastructure")
    .replace(/we povide all constrution services/gi, "We provide turnkey civil construction, surveying, and architectural services")
    .replace(/constrution/gi, "construction")
    .replace(/povide/gi, "provide");
}

/**
 * Converts service titles to URL slug format consistently.
 */
export function getServiceSlug(title: string = ""): string {
  return title
    .toLowerCase()
    .replace(/ & /g, "-")
    .replace(/&/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}
