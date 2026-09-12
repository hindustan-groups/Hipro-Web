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

/**
 * STRUCTURED ABOUT PAGE DATA FOR HINDUSTAN PROJECTS (HiPRO)
 * Source of truth for About page redesign.
 * Grounded strictly in verified facts. Zero unsupported claims.
 */
export const ABOUT_PAGE_DATA = {
  hero: {
    badge: "Engineering · Construction · Infrastructure · Est. 2019",
    headingPrefix: "Engineering",
    headingAccent: "Precision.",
    headingSuffix: "Built for Execution.",
    description: "Hindustan Projects (HiPRO) is an engineering, construction, and infrastructure firm headquartered in Bhilwara, Rajasthan. We deliver integrated architectural planning, digital surveying, turnkey civil construction, and project management designed around structural stability, disciplined coordination, and long-term value.",
    operationalHighlights: [
      { label: "Established", value: "2019" },
      { label: "Headquarters", value: "Bhilwara, Rajasthan" },
      { label: "Core Focus", value: "Engineering · Construction · Infrastructure" },
      { label: "Disciplines", value: "6 Verified Practice Areas" },
    ],
  },
  executiveStatement: {
    leaderName: "Yogesh Kharol",
    leaderRole: "Founder & Director",
    company: "Hindustan Projects (HiPRO)",
    badge: "Executive Leadership",
    title: "Committed to Engineering Discipline & Responsible Site Execution",
    statement: [
      "At Hindustan Projects, our work begins with the understanding that every structure represents a long-term commitment to safety, capital responsibility, and client trust.",
      "From our headquarters in Bhilwara, we prioritize transparent coordination, disciplined on-site supervision, and close alignment between architectural planning and field construction.",
      "By integrating land surveying, structural coordination, civil execution, and project consultancy under one cohesive team, we ensure projects proceed with clarity from initial assessment to milestone handover."
    ],
  },
  companyAtAGlance: [
    { label: "Legal / Brand Name", value: "Hindustan Projects (HiPRO)" },
    { label: "Year Established", value: "2019" },
    { label: "Corporate Headquarters", value: "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001" },
    { label: "Primary Operating Region", value: "Bhilwara, Mewar Region & Rajasthan" },
    { label: "Core Industry Focus", value: "Civil Engineering, Turnkey Construction & Infrastructure" },
    { label: "Core Engineering Disciplines", value: "6 Verified Practice Areas (Planning, Civil, Surveying, Interiors, ETP/STP, PMC)" },
    { label: "Project Delivery Model", value: "Turnkey Civil Execution, Architectural Planning & Project Management Consultancy" },
    { label: "Corporate Ecosystem", value: "Hindustan Projects, Hindustan Empanelment, HiPro IT Services, HiPro Marketing" },
  ],
  missionVision: {
    mission: {
      tag: "Corporate Mission",
      title: "Engineered For Durability",
      description: "To deliver structurally sound, meticulously planned, and enduring construction and infrastructure projects through disciplined engineering, practical site coordination, and transparent client communication."
    },
    vision: {
      tag: "Corporate Vision",
      title: "Trusted Regional Partner",
      description: "To serve as Rajasthan's premier, dependable engineering and turnkey construction partner, recognized for uncompromising structural reliability, professional ethics, and execution excellence."
    },
    principles: [
      {
        title: "Engineering-Led Planning",
        desc: "Every project is grounded in rigorous spatial assessment and structural analysis before groundwork commences."
      },
      {
        title: "Quality-Conscious Construction",
        desc: "Maintaining systematic site supervision, strict material evaluation, and structural discipline at every construction phase."
      },
      {
        title: "Transparent Coordination",
        desc: "Clear documentation, milestone-based communication, and open operational tracking throughout project lifecycles."
      },
      {
        title: "Practical Project Planning",
        desc: "Designing buildable, realistic architectural and civil solutions tailored to local site conditions and regional requirements."
      },
      {
        title: "Responsible Site Execution",
        desc: "Prioritizing on-site responsibility, structured team coordination, and dedicated supervisory attention."
      },
      {
        title: "Long-Term Structural Value",
        desc: "Constructing residential, commercial, and industrial structures engineered for durability and enduring performance."
      }
    ]
  },
  executionStages: [
    {
      step: "01",
      title: "Survey & Site Measurements",
      desc: "Topographic assessment, precise boundary demarcations, contour mapping, and site level evaluations.",
      serviceName: "Surveying & Site Measurements",
      serviceSlug: "surveying-site-measurements"
    },
    {
      step: "02",
      title: "Architecture & Engineering Coordination",
      desc: "Detailed spatial layouts, 3D architectural perspectives, structural load coordination, and municipal sanction drawings.",
      serviceName: "Architecture & Planning",
      serviceSlug: "architecture-planning"
    },
    {
      step: "03",
      title: "Construction & Project Execution",
      desc: "Heavy RCC framework execution, brickwork, civil masonry, structural fabrication, and milestone-tracked site works.",
      serviceName: "Professional Construction Services",
      serviceSlug: "professional-construction-services"
    },
    {
      step: "04",
      title: "Finishing, Coordination & Handover",
      desc: "Facade treatments, interior fit-outs, MEP integration, quality inspections, and milestone handover.",
      serviceName: "Interior & Exterior Design",
      serviceSlug: "interior-exterior-design"
    }
  ],
  capabilitiesAndSectors: [
    {
      sector: "Commercial Developments",
      description: "Corporate office spaces, multi-storey commercial complexes, and retail developments built for functional flow and durability.",
      services: ["Architecture & Planning", "Professional Construction Services"],
      primarySlug: "professional-construction-services"
    },
    {
      sector: "Industrial & Water Infrastructure",
      description: "Factory floor layouts, industrial warehousing sheds, and specialized civil structures for effluent and sewage water treatment plants (ETP/STP).",
      services: ["Water Treatment Plant Construction", "Professional Construction Services"],
      primarySlug: "water-treatment-plant-construction"
    },
    {
      sector: "Residential Construction",
      description: "Turnkey residential bungalows, independent villas, and luxury residential interior/exterior finishing engineered for modern living.",
      services: ["Architecture & Planning", "Interior & Exterior Design"],
      primarySlug: "interior-exterior-design"
    },
    {
      sector: "Engineering Consultancy & Surveying",
      description: "Precision digital land surveying, contour mapping, project management consultancy (PMC), cost estimation, and technical advisory.",
      services: ["Surveying & Site Measurements", "Project Management & Consultancy"],
      primarySlug: "surveying-site-measurements"
    }
  ],
  qualityCommitment: [
    {
      title: "Planned Execution",
      desc: "Structured scheduling and phase-wise coordination ensure predictable milestone delivery without haphazard site shortcuts."
    },
    {
      title: "Supervised Quality",
      desc: "Dedicated on-site supervision oversees material handling, structural reinforcement, and concrete placement standards."
    },
    {
      title: "Systematic Material Verification",
      desc: "Checking steel grades, cement freshness, aggregate quality, and mix proportions at every execution phase."
    },
    {
      title: "Accountable Communication",
      desc: "Regular status reporting and transparent site coordination keep project owners informed from groundwork to handover."
    }
  ],
  regionalFocus: {
    city: "Bhilwara",
    region: "Mewar Region & Rajasthan",
    state: "Rajasthan",
    address: "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001, India",
    description: "Headquartered in the vibrant industrial center of Bhilwara, Hindustan Projects brings deep familiarity with Rajasthan's soil variations, local building bylaws, and regional material supply chains. Our central location enables responsive on-site coordination and close project supervision across the Mewar region and surrounding districts.",
  }
};
