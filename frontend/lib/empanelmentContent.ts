export interface EmpanelmentStat {
  id: string;
  value: string;
  label: string;
  iconName: string;
}

export interface EmpanelmentCategory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export interface EmpanelmentProcessStep {
  step: string;
  title: string;
  description: string;
  iconName: string;
}

export interface EmpanelmentBenefit {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface EmpanelmentDocument {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface EmpanelmentFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface EmpanelmentImpactPillar {
  id: string;
  title: string;
  iconName: string;
}

export interface EmpanelmentHeroPill {
  id: string;
  title: string;
  iconName: string;
}

export interface EmpanelmentContent {
  id: string;
  portalName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  supportWhatsapp: string;
  socialLinks?: string | null;

  // Hero Section
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroRegisterBtnText: string;
  heroLoginBtnText: string;
  heroImageUrl?: string | null;
  heroOverlayBadge: string;
  heroPills?: string | null;

  // Stats Counter Bar
  stats?: string | null;

  // Categories Section
  categoriesBadge: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
  categoriesList?: string | null;

  // Process / How It Works
  processBadge: string;
  processTitle: string;
  processSubtitle: string;
  processSteps?: string | null;

  // Benefits
  benefitsBadge: string;
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefitsList?: string | null;

  // Dark Impact Section
  impactBadge: string;
  impactTitle: string;
  impactSubtitle: string;
  impactBtnText: string;
  impactPillars?: string | null;
  impactImageUrl?: string | null;

  // Documents Required
  docsBadge: string;
  docsTitle: string;
  docsSubtitle: string;
  docsList?: string | null;

  // FAQs
  faqBadge: string;
  faqTitle: string;
  faqSubtitle: string;
  faqsList?: string | null;

  // Bottom Red CTA Banner
  ctaBadge: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaBtnText: string;
}

export const DEFAULT_EMPANELMENT_CONTENT: EmpanelmentContent = {
  id: "singleton",
  portalName: "Hindustan Projects",
  tagline: "Engineering – Construction – Infrastructure",
  phone: "+91 98765 43210",
  email: "procurement@hindustanprojects.in",
  address: "Hindustan Projects, Bhilwara, Rajasthan, India",
  supportWhatsapp: "+91 98765 43210",
  socialLinks: JSON.stringify({
    linkedin: "https://linkedin.com/company/hindustanprojects",
    facebook: "https://facebook.com/hindustanprojects",
    instagram: "https://instagram.com/hindustan_projects",
    youtube: "https://youtube.com/@hindustanprojects",
  }),

  // Hero
  heroBadge: "VENDOR PORTAL",
  heroTitlePrefix: "Partner with",
  heroTitleHighlight: "Hindustan Projects",
  heroSubtitle:
    "Join our local vendor network for construction materials, services and project opportunities across Rajasthan and beyond.",
  heroRegisterBtnText: "Register as a Vendor",
  heroLoginBtnText: "Vendor Login",
  heroImageUrl: "/images/empanelment/hero-engineers-perfect.jpg",
  heroOverlayBadge: "Building Stronger Partnerships for a Better Rajasthan.",
  heroPills: JSON.stringify([
    { id: "p1", title: "Fair & Transparent Procurement", iconName: "Handshake" },
    { id: "p2", title: "Local Business Opportunities", iconName: "Users" },
    { id: "p3", title: "Long-Term Partnerships", iconName: "Building2" },
    { id: "p4", title: "Quality & Compliance", iconName: "ShieldCheck" },
  ]),

  // Stats
  stats: JSON.stringify([
    { id: "s1", value: "200+", label: "Trusted Vendors", iconName: "Users" },
    { id: "s2", value: "150+", label: "Projects Supplied", iconName: "FileText" },
    { id: "s3", value: "15+", label: "Cities Across Rajasthan", iconName: "MapPin" },
    { id: "s4", value: "100%", label: "Transparent Process", iconName: "ShieldCheck" },
  ]),

  // Categories
  categoriesBadge: "CATEGORIES",
  categoriesTitle: "Supply to Our Construction Projects",
  categoriesSubtitle:
    "We source high-quality materials, services and solutions from trusted local vendors to support our construction and infrastructure projects across Rajasthan.",
  categoriesList: JSON.stringify([
    {
      id: "c1",
      title: "Building Materials",
      description: "Cement, steel, bricks, aggregates and more",
      imageUrl: "/images/empanelment/cat-building-materials.jpg",
      linkUrl: "/empanelment/apply?category=building-materials",
    },
    {
      id: "c2",
      title: "Civil & Structural Work",
      description: "Construction, fabrication and structural services",
      imageUrl: "/images/empanelment/cat-civil-structural.jpg",
      linkUrl: "/empanelment/apply?category=civil-structural",
    },
    {
      id: "c3",
      title: "Machinery & Equipment",
      description: "Construction machinery, plants and equipment rental/supply",
      imageUrl: "/images/empanelment/cat-machinery-equipment.jpg",
      linkUrl: "/empanelment/apply?category=machinery-equipment",
    },
    {
      id: "c4",
      title: "Electrical & Plumbing",
      description: "Electrical, plumbing and MEP materials & services",
      imageUrl: "/images/empanelment/cat-electrical-plumbing.jpg",
      linkUrl: "/empanelment/apply?category=electrical-plumbing",
    },
    {
      id: "c5",
      title: "Interior & Finishing",
      description: "Interior, flooring, painting and finishing work",
      imageUrl: "/images/empanelment/cat-interior-finishing.jpg",
      linkUrl: "/empanelment/apply?category=interior-finishing",
    },
    {
      id: "c6",
      title: "Logistics & Transportation",
      description: "Material transportation and logistics support work",
      imageUrl: "/images/empanelment/cat-logistics-transport.jpg",
      linkUrl: "/empanelment/apply?category=logistics-transport",
    },
  ]),

  // Process / How It Works
  processBadge: "HOW IT WORKS",
  processTitle: "Vendor Registration Process",
  processSubtitle:
    "Get registered in a few simple steps and become a part of Hindustan Projects' approved vendor network.",
  processSteps: JSON.stringify([
    {
      step: "01",
      title: "Create Profile",
      description: "Fill in your business details and category information.",
      iconName: "UserPlus",
    },
    {
      step: "02",
      title: "Submit Documents",
      description: "Upload required documents for verification.",
      iconName: "FileUp",
    },
    {
      step: "03",
      title: "Verification",
      description: "Our team will review your details and documents.",
      iconName: "CheckCircle",
    },
    {
      step: "04",
      title: "Get Listed",
      description: "Once approved, you will be listed in our vendor network and can receive opportunities.",
      iconName: "Award",
    },
  ]),

  // Benefits
  benefitsBadge: "WHY PARTNER WITH US",
  benefitsTitle: "Benefits for Our Vendors",
  benefitsSubtitle:
    "We believe in long-term relationships with our vendors and suppliers, creating value for both business and society.",
  benefitsList: JSON.stringify([
    {
      id: "b1",
      title: "Consistent Opportunities",
      description: "Regular procurement opportunities from ongoing and upcoming projects.",
      iconName: "Briefcase",
    },
    {
      id: "b2",
      title: "Transparent Process",
      description: "Fair, ethical and clear procurement procedures.",
      iconName: "ShieldCheck",
    },
    {
      id: "b3",
      title: "Timely Payments",
      description: "Reliable and timely payment system.",
      iconName: "IndianRupee",
    },
    {
      id: "b4",
      title: "Support for Local Businesses",
      description: "Priority to local vendors and MSMEs from Rajasthan.",
      iconName: "Users",
    },
    {
      id: "b5",
      title: "Long-Term Partnerships",
      description: "Opportunity to grow with us on future projects.",
      iconName: "Handshake",
    },
    {
      id: "b6",
      title: "Quality Standards",
      description: "Focus on quality, safety and compliance in every project.",
      iconName: "Award",
    },
  ]),

  // Dark Impact Section
  impactBadge: "OUR IMPACT",
  impactTitle: "Building a Stronger Rajasthan Together",
  impactSubtitle:
    "Empowering local businesses, creating opportunities and building a better Rajasthan through responsible and sustainable infrastructure development.",
  impactBtnText: "Join Our Vendor Network",
  impactImageUrl: "/images/empanelment/impact-skyline.jpg",
  impactPillars: JSON.stringify([
    { id: "ip1", title: "Local Economic Growth", iconName: "TrendingUp" },
    { id: "ip2", title: "Sustainable Infrastructure", iconName: "Building" },
    { id: "ip3", title: "Stronger Communities", iconName: "Users" },
    { id: "ip4", title: "A Better Rajasthan", iconName: "Landmark" },
  ]),

  // Documents Required
  docsBadge: "DOCUMENTS REQUIRED",
  docsTitle: "Get Ready for Registration",
  docsSubtitle:
    "Keep the following documents ready (as applicable) to complete your vendor registration smoothly.",
  docsList: JSON.stringify([
    {
      id: "d1",
      title: "GST Details",
      description: "GST registration certificate",
      iconName: "FileCheck",
    },
    {
      id: "d2",
      title: "PAN Details",
      description: "PAN card of the business",
      iconName: "CreditCard",
    },
    {
      id: "d3",
      title: "Bank Details",
      description: "Cancelled cheque or bank statement",
      iconName: "Building2",
    },
    {
      id: "d4",
      title: "Business Profile",
      description: "Company profile and work experience",
      iconName: "Briefcase",
    },
    {
      id: "d5",
      title: "Relevant Certifications",
      description: "Quality, safety or industry-specific certificates",
      iconName: "Award",
    },
    {
      id: "d6",
      title: "Other Documents",
      description: "Any additional documents as per category",
      iconName: "FolderOpen",
    },
  ]),

  // FAQs
  faqBadge: "FREQUENTLY ASKED QUESTIONS",
  faqTitle: "Quick Answers",
  faqSubtitle:
    "Find answers to common questions about vendor registration, procurement and working with Hindustan Projects.",
  faqsList: JSON.stringify([
    {
      id: "f1",
      question: "Who can register as a vendor?",
      answer:
        "Any registered manufacturer, authorized distributor, raw material supplier, civil/structural contractor, or plant equipment provider possessing valid GSTIN and business credentials can register.",
    },
    {
      id: "f2",
      question: "What documents are required for registration?",
      answer:
        "Standard documentation includes GST registration certificate, business PAN card, bank details (cancelled cheque), MSME/Udyam certificate (if applicable), and past work experience profile.",
    },
    {
      id: "f3",
      question: "How will I get procurement opportunities?",
      answer:
        "Once verified and empanelled into your respective category, you will receive real-time Request for Quotations (RFQs), site purchase intents, and tender invitations directly via SMS, WhatsApp, and portal notifications.",
    },
    {
      id: "f4",
      question: "What is the payment process?",
      answer:
        "Payments are disbursed transparently via direct RTGS/NEFT against verified measurement sheets and tax invoices, adhering strictly to agreed milestones and MSME statutory terms.",
    },
    {
      id: "f5",
      question: "Is there any registration fee?",
      answer:
        "No. Vendor registration on Hindustan Projects Empanelment Portal is 100% free of charge. We never charge any processing or registration fees.",
    },
  ]),

  // Bottom Red CTA Banner
  ctaBadge: "BE A PART OF OUR JOURNEY",
  ctaTitle: "Let's Build a Stronger, Self-Reliant Rajasthan.",
  ctaSubtitle:
    "Register as a vendor today and become a part of Hindustan Projects' growing network.",
  ctaBtnText: "Register Now",
};

export async function fetchEmpanelmentContent(): Promise<EmpanelmentContent> {
  try {
    const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const cleanUrl = rawUrl.replace(/\/+$/, "");
    const res = await fetch(`${cleanUrl}/api/empanelment/content`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      return DEFAULT_EMPANELMENT_CONTENT;
    }
    const data = await res.json();
    if (data.success && data.content) {
      return { ...DEFAULT_EMPANELMENT_CONTENT, ...data.content };
    }
  } catch (_e) {
    // Fallback to default
  }
  return DEFAULT_EMPANELMENT_CONTENT;
}

export function parseJsonField<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
