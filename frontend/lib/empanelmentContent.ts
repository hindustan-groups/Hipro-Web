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

  // Advanced Portal Announcement Ticker Bar
  noticeAlertBanner?: string | null;
  noticeAlertActive?: boolean;

  // Feature Flag: Site / Gate Pass Module
  gatePassEnabled?: boolean;

  // Section Visibility Toggles (JSON encoded)
  sectionVisibility?: string | null;

  // Advanced SEO & Meta Management
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImageUrl?: string | null;
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
      title: "Civil Construction",
      description: "RCC structural works, masonry, plastering and site civil execution",
      imageUrl: "/images/empanelment/cat-civil-structural.jpg",
      linkUrl: "/empanelment/apply?category=civil-construction",
    },
    {
      id: "c2",
      title: "Electrical & MEP",
      description: "HT/LT electrical installations, substations, panels and cabling",
      imageUrl: "/images/empanelment/cat-electrical-plumbing.jpg",
      linkUrl: "/empanelment/apply?category=electrical-mep",
    },
    {
      id: "c3",
      title: "Plumbing & Sanitation",
      description: "CPVC/PPR water supply, sewerage piping, fixtures and waterproofing",
      imageUrl: "/images/empanelment/cat-electrical-plumbing.jpg",
      linkUrl: "/empanelment/apply?category=plumbing-sanitation",
    },
    {
      id: "c4",
      title: "Fabrication & PEB",
      description: "Pre-engineered buildings (PEB), heavy structural steel and railings",
      imageUrl: "/images/empanelment/cat-civil-structural.jpg",
      linkUrl: "/empanelment/apply?category=fabrication-peb",
    },
    {
      id: "c5",
      title: "Flooring & Finishing",
      description: "Tiles, granite, marble, epoxy flooring, painting and false ceilings",
      imageUrl: "/images/empanelment/cat-interior-finishing.jpg",
      linkUrl: "/empanelment/apply?category=flooring-finishing",
    },
    {
      id: "c6",
      title: "Material Supply",
      description: "Bulk cement, TMT rebars, bricks, AAC blocks, aggregates and sand",
      imageUrl: "/images/empanelment/cat-building-materials.jpg",
      linkUrl: "/empanelment/apply?category=material-supply",
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
      title: "Verify Mobile OTP",
      description: "Enter your 10-digit mobile number and verify instantly with a 4-digit OTP.",
      iconName: "UserPlus",
    },
    {
      step: "02",
      title: "Contact & Work Details",
      description: "Choose Worker, Team, or Business, add your address, work category, experience, and team size.",
      iconName: "Briefcase",
    },
    {
      step: "03",
      title: "Upload Aadhaar & PAN",
      description: "Upload Aadhaar Card (Front & Back) and PAN Card (optional for individual workers), then preview and submit.",
      iconName: "FileUp",
    },
    {
      step: "04",
      title: "Portal Access & Approval",
      description: "Log in anytime using your Mobile Number + OTP to track status and bid on tenders once approved.",
      iconName: "CheckCircle",
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
      title: "Active Mobile Number",
      description: "10-digit mobile number for OTP verification and portal login",
      iconName: "FileCheck",
    },
    {
      id: "d2",
      title: "Aadhaar Card (Front & Back)",
      description: "Clear photo or PDF of both sides of your Aadhaar Card",
      iconName: "CreditCard",
    },
    {
      id: "d3",
      title: "PAN Card (If Available)",
      description: "PAN number and card photo; optional for individual workers",
      iconName: "Building2",
    },
    {
      id: "d4",
      title: "Work & Team Details",
      description: "Your trade category, years of experience, team size, and project scale",
      iconName: "Briefcase",
    },
  ]),

  // FAQs
  faqBadge: "FREQUENTLY ASKED QUESTIONS",
  faqTitle: "Quick Answers",
  faqSubtitle:
    "Find answers to common questions about vendor registration, login, and working with Hindustan Projects.",
  faqsList: JSON.stringify([
    {
      id: "f1",
      question: "Who can register as a vendor or contractor?",
      answer:
        "Individual workers, trade contractors with teams, material suppliers, and registered businesses/firms can all register. You do not need a registered company or GSTIN to apply.",
    },
    {
      id: "f2",
      question: "What documents are required for registration?",
      answer:
        "You only need an active mobile number for OTP verification and your Aadhaar Card (Front & Back). PAN Card is required if you have one, and optional for individual workers.",
    },
    {
      id: "f3",
      question: "How do I log in to the Vendor Portal?",
      answer:
        "There is no password to remember. After submitting your registration, you are logged in automatically, and anytime later you can log in using your registered Mobile Number and a 4-digit OTP.",
    },
    {
      id: "f4",
      question: "When can I view and bid on active tenders?",
      answer:
        "Once our procurement team reviews your profile and marks your application as Approved, active tenders matching your trade category and bidding access unlock inside your Vendor Portal.",
    },
    {
      id: "f5",
      question: "Is there any registration fee?",
      answer:
        "No. Vendor registration on Hindustan Projects is 100% free of charge.",
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

  // Advanced Portal Announcement Ticker Bar
  noticeAlertBanner:
    "📢 FY 2026-27 Vendor & Contractor Empanelment is now open for Civil, MEP, Plant & Raw Material suppliers across Rajasthan.",
  noticeAlertActive: true,
  gatePassEnabled: false,

  // Section Visibility Toggles (JSON encoded)
  sectionVisibility: JSON.stringify({
    showHeroPills: true,
    showStats: true,
    showCategories: true,
    showProcess: true,
    showBenefits: true,
    showImpact: true,
    showDocs: true,
    showFaqs: true,
    showCta: true,
    showTendersNotice: true,
  }),

  // Advanced SEO & Meta Management
  metaTitle: "Vendor & Contractor Empanelment Portal | Hindustan Projects",
  metaDescription:
    "Official contractor empanelment, live construction tenders, and daily site access pass portal for Hindustan Projects across Rajasthan.",
  metaKeywords:
    "construction vendor registration, rajasthan contractor empanelment, CPWD vendor portal, live civil tenders jaipur",
  ogImageUrl: "/images/empanelment/hero-engineers-perfect.jpg",
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
  if (!raw || (typeof raw === "string" && (raw.trim() === "" || raw.trim() === "[]" || raw.trim() === "null"))) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && fallback.length > 0 && Array.isArray(parsed) && parsed.length === 0) {
      return fallback;
    }
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}
