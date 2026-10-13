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

export interface EmpanelmentTier {
  code: string;
  title: string;
  turnover: string;
  capacity: string;
  validity: string;
  scope: string;
  color?: string;
  border?: string;
  bg?: string;
}

export interface EmpanelmentStatutoryDoc {
  id: string;
  title: string;
  authority: string;
  requiredFor: string;
  desc: string;
}

export interface EmpanelmentSafetyStandard {
  id: string;
  title: string;
  codeRef: string;
  desc: string;
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

  // Guidelines & Capacity Standards
  guidelinesBadge: string;
  guidelinesTitle: string;
  guidelinesSubtitle: string;
  guidelinesTiers?: string | null;
  guidelinesStatutoryDocs?: string | null;
  guidelinesSafetyStandards?: string | null;

  // Tenders Radar Notice & Policies
  tendersNoticeBadge: string;
  tendersNoticeTitle: string;
  tendersNoticeText?: string | null;
  tendersSubmissionRules?: string | null;
  tendersHelplinePhone?: string | null;
  tendersHelplineEmail?: string | null;

  // Site Gate Pass Instructions & Terms
  gatePassInstructions?: string | null;
  gatePassTerms?: string | null;
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

  // Guidelines & Capacity Standards
  guidelinesBadge: "PROCUREMENT & ELIGIBILITY",
  guidelinesTitle: "Contractor Empanelment Standards",
  guidelinesSubtitle:
    "Official procurement criteria, CPWD-aligned capacity tiers, and statutory compliance framework for infrastructure execution.",
  guidelinesTiers: JSON.stringify([
    {
      code: "CLASS_A",
      title: "Class 'A' Prime Partner",
      turnover: "₹ 5.00 Crore+ (Per Annum)",
      capacity: "Single Work Order Up to ₹ 10.00 Cr",
      validity: "3 Years",
      color: "from-amber-500 to-amber-700",
      border: "border-amber-300",
      bg: "bg-amber-50/50",
      scope:
        "Mega Industrial Sheds, Turnkey PEB Structures, Multi-Storey Commercial Complexes, Infrastructure Highways & Bridges.",
    },
    {
      code: "CLASS_B",
      title: "Class 'B' Major Contractor",
      turnover: "₹ 1.00 Crore – ₹ 5.00 Crore",
      capacity: "Single Work Order Up to ₹ 2.50 Cr",
      validity: "2 Years",
      color: "from-blue-600 to-indigo-700",
      border: "border-blue-200",
      bg: "bg-blue-50/50",
      scope:
        "Industrial RCC Foundations, Plinth & Structure Masonry, MEP Firefighting & HVAC, Heavy Fabrication & Roofing.",
    },
    {
      code: "CLASS_C",
      title: "Class 'C' Specialized Subcontractor",
      turnover: "₹ 25 Lakhs – ₹ 1.00 Crore",
      capacity: "Single Work Order Up to ₹ 50 Lakhs",
      validity: "2 Years",
      color: "from-emerald-600 to-teal-700",
      border: "border-emerald-200",
      bg: "bg-emerald-50/50",
      scope:
        "Trimix Industrial Flooring, Waterproofing & Grouting, Aluminum & Glass Glazing, Boundary Walls, Specialized Finishing.",
    },
    {
      code: "CLASS_D",
      title: "Class 'D' Provisional / Local Trades",
      turnover: "Under ₹ 25 Lakhs / New MSME",
      capacity: "Single Work Order Up to ₹ 15 Lakhs",
      validity: "1 Year",
      color: "from-slate-600 to-slate-800",
      border: "border-slate-200",
      bg: "bg-slate-50/50",
      scope:
        "Labor Supply, Formwork & Shuttering, Earthwork Excavation, Local Aggregate / Sand Suppliers, Electrical Conduit Wiring.",
    },
  ]),
  guidelinesStatutoryDocs: JSON.stringify([
    {
      id: "doc1",
      title: "Permanent Account Number (PAN)",
      authority: "Income Tax Department",
      requiredFor: "All Entities",
      desc: "Mandatory corporate or individual PAN card copy linked with bank account.",
    },
    {
      id: "doc2",
      title: "Goods & Services Tax (GSTIN)",
      authority: "GST Network (Govt of India)",
      requiredFor: "Class A, B, C (Optional for Class D)",
      desc: "Valid 15-digit GST registration certificate. Must be filed active for last 2 quarters.",
    },
    {
      id: "doc3",
      title: "CA Certified Turnover / Audited Balances",
      authority: "Chartered Accountant (ICAI)",
      requiredFor: "Class A & B",
      desc: "Audited balance sheet and profit & loss statements for last 3 financial years with UDIN.",
    },
    {
      id: "doc4",
      title: "Bank Solvency & Cancelled Cheque",
      authority: "Scheduled Commercial Bank",
      requiredFor: "All Entities",
      desc: "Cancelled cheque showing account holder name, IFS code, and bank branch for RTGS transfers.",
    },
    {
      id: "doc5",
      title: "EPFO & ESIC Registration",
      authority: "Ministry of Labour & Employment",
      requiredFor: "Class A & B (Labor Deployments)",
      desc: "Active PF code and ESIC sub-code compliance certificate for on-site workforce safety.",
    },
  ]),
  guidelinesSafetyStandards: JSON.stringify([
    {
      id: "safe1",
      title: "National Building Code (NBC 2016) Compliance",
      codeRef: "Part 7: Construction Management & Safety",
      desc: "Mandatory site helmets (IS 2925), steel-toe safety footwear (IS 15298), fall protection harnesses for heights above 2.0m.",
    },
    {
      id: "safe2",
      title: "Zero Tolerance Drug & Alcohol Policy",
      codeRef: "Hindustan Projects Site Safety Byelaws",
      desc: "Strict sobriety checks at security turnstiles. Immediate cancellation of gate pass upon non-compliance.",
    },
    {
      id: "safe3",
      title: "Contractor All Risk (CAR) & Workmen Compensation Insurance",
      codeRef: "Labour Welfare & Insurance Mandate",
      desc: "Comprehensive third-party liability and workmen compensation policy covering all deployed personnel.",
    },
  ]),

  // Tenders Radar Notice & Policies
  tendersNoticeBadge: "NOTICE BOARD",
  tendersNoticeTitle: "Procurement Directorate Bulletin",
  tendersNoticeText:
    "E-Bidding window opens at 10:00 AM IST on all working days. EMD submission is accepted via RTGS/NEFT only. Verified Class A & B contractors enjoy fast-track commercial evaluation.",
  tendersSubmissionRules: JSON.stringify([
    "Only empanelled contractors with active tracking IDs can submit commercial bids.",
    "Bids must include rate inclusive of GST, freight, and unloading at site.",
    "EMD (Earnest Money Deposit) reference must be entered during bid submission.",
    "Bids once submitted cannot be retracted without written notice to procurement directorate.",
  ]),
  tendersHelplinePhone: "+91 98765 43210",
  tendersHelplineEmail: "procurement@hindustanprojects.in",

  // Site Gate Pass Instructions & Terms
  gatePassInstructions:
    "Gate passes are issued exclusively to verified and approved vendor contractors. Ensure vehicle registration numbers and accurate worker counts are submitted for smooth security clearance.",
  gatePassTerms:
    "Pass holder must comply with Hindustan Projects on-site safety guidelines, wear prescribed PPE, and present physical or digital pass QR code at gate checkpoint upon entry.",
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
