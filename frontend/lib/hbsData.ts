import type { HbsContent, HbsService, HbsProject, HbsTestimonial } from "./types";

let rawUrl = process.env.BACKEND_API_URL || "https://hipro-backend-749v.onrender.com";
if (rawUrl.includes("hipro-web-1.onrender.com")) {
  rawUrl = "https://hipro-backend-749v.onrender.com";
}
if (rawUrl.startsWith("https:") && !rawUrl.startsWith("https://")) {
  rawUrl = rawUrl.replace(/^https:?\/*/, "https://");
} else if (rawUrl.startsWith("http:") && !rawUrl.startsWith("http://")) {
  rawUrl = rawUrl.replace(/^http:?\/*/, "http://");
} else if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  rawUrl = `https://${rawUrl}`;
}
const BACKEND_URL = rawUrl.replace(/\/+$/, "");

export const DEFAULT_HBS_CONTENT: HbsContent = {
  id: "singleton",
  brandName: "Hind Building Solutions",
  logo: "/hbs-logo.jpg",
  logoPrimary: "/hbs-logo.jpg",
  logoDark: "/hbs-logo.jpg",
  logoMark: "/hbs-icon.jpg",
  logoMobile: "/hbs-logo.jpg",
  favicon: "/hbs-favicon.jpg",
  ogDefaultImage: "/hbs-og-default.svg",
  privacyPolicyUrl: "/privacy-policy",
  termsUrl: "/terms",
  tagline: "Complete Building Repair, Maintenance, Protection & Services",
  phone: "+91 75970 00601",
  whatsapp: "+91 75970 00601",
  email: "hbs@hindustanprojects.in",
  address: "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001",
  businessHours: "Mon - Sat: 9:00 AM - 7:00 PM",
  socialLinks: JSON.stringify({
    instagram: "https://www.instagram.com/hindustan_projects/",
    linkedin: "https://linkedin.com/company/hindustanprojects",
    pinterest: "https://pin.it/5OlMWwi2w"
  }),
  ctaSettings: JSON.stringify({
    primaryButtonText: "Book Inspection / Get Quote",
    secondaryButtonText: "WhatsApp Us",
    phone: "7597000601",
    urgentNotice: "Emergency water leakage or structural distress? Call directly for priority technician dispatch."
  }),
  heroTitle: "Complete Building Repair, Maintenance & Protection",
  heroSubtitle: "Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions for homes, commercial complexes, and institutions across Rajasthan.",
  heroImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop",
  heroCtas: JSON.stringify({
    enabled: true,
    badge: "A Specialized Division of Hindustan Projects (HiPRO)",
    displayMode: "TEXT_AND_IMAGE",
    imagePosition: "right",
    imageFit: "cover",
    primaryCtaLabel: "Book Site Inspection",
    primaryCtaUrl: "/hbs/contact",
    secondaryCtaLabel: "Chat on WhatsApp",
    secondaryCtaUrl: "https://wa.me/917597000601?text=Hello%20Hind%20Build,%20I%20would%20like%20to%20schedule%20a%20site%20inspection.",
    tertiaryCtaLabel: "Services Catalog",
    tertiaryCtaUrl: "/hbs/services"
  }),
  whyChooseUs: JSON.stringify([
    { title: "Parent Company Engineering Oversight", description: "Backed by Hindustan Projects (HiPRO) civil engineers and certified site supervisors.", icon: "ShieldCheck" },
    { title: "Non-Destructive Modern Diagnosis", description: "Advanced moisture meters and pipe leak scanners prevent unnecessary breaking.", icon: "Cpu" },
    { title: "Guaranteed Work & Verified Materials", description: "Only industrial-grade chemicals, certified sealants, and premium hardware used.", icon: "Award" },
    { title: "Rapid Turnaround Across Rajasthan", description: "Dedicated quick-response technicians stationed in Bhilwara and central regions.", icon: "Clock" }
  ]),
  stats: JSON.stringify([
    { label: "Repair Services", value: "Turnkey" },
    { label: "Buildings Protected", value: "350+" },
    { label: "Customer Satisfaction", value: "98%" },
    { label: "Engineering Heritage", value: "Since 2019" }
  ]),
  guaranteeSection: JSON.stringify({
    enabled: true,
    eyebrow: "Diagnostic Principle",
    heading: "Most building repairs fail because surface symptoms are patched while the water pathway stays active.",
    description: "Plastering over dampness or applying generic cement offers only temporary cosmetic relief. Without identifying hydrostatic pressure points or hairline slab fractures, moisture continues to corrode embedded rebar from within.",
    rightMode: "CARD",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Hind Build diagnostic site inspection and moisture tracing",
    imageCaption: "Site Inspection & Non-Destructive Scanning",
    approachBadge: "The Hind Build Engineering Approach",
    approachDescription: "We deploy non-destructive electronic moisture detection, industrial-grade chemical barrier membranes, and calibrated crack injection polymers. Root causes are systematically eliminated before finishing layers are applied.",
    features: [
      "Non-invasive moisture tracing",
      "Certified industrial sealants",
      "Turnkey single-point warranty",
      "Senior engineering sign-off"
    ],
    footerNote: "Backed by Hindustan Projects (HiPRO)",
    ctaLabel: "Book Site Diagnosis",
    ctaUrl: "/contact"
  }),
  homeFinalCta: JSON.stringify({
    heading: "Does Your Building Suffer From Leakage, Cracks, or Aging Fixtures?",
    subheading: "Schedule a non-destructive site inspection with Hind Build today. Get transparent estimations without hidden charges.",
    buttonText: "Schedule Inspection",
    phone: "+91 75970 00601"
  }),
  aboutStory: "Hind Build was founded under Hindustan Projects (HiPRO) to bridge the massive gap between informal local handymen and large civil contractors. Modern buildings represent substantial investments, yet minor moisture ingress, foundation settlements, and electrical wear frequently turn into catastrophic structural hazards. Hind Build brings certified engineering discipline, non-destructive diagnosis, and turnkey accountability to building maintenance and protection across Rajasthan.",
  mission: "To extend the functional life, aesthetic dignity, and structural safety of every residential, commercial, and industrial property through dependable, engineering-grade maintenance.",
  vision: "To be Rajasthan's most trusted single-window building maintenance and protection brand, synonymous with integrity, speed, and lasting craftsmanship.",
  team: JSON.stringify([
    { name: "Civil Engineering Core", role: "Structural & Diagnostic Oversight", desc: "Supervised by Hindustan Projects senior engineering team." },
    { name: "Specialized Field Technicians", role: "Waterproofing & Mechanical", desc: "Certified applicators for Dr. Fixit, Fosroc, and Sika chemical systems." },
    { name: "Rapid Service Response", role: "Customer Operations & Dispatch", desc: "Ensuring timely inspections and transparent digital estimates." }
  ]),
  whyChoosePoints: JSON.stringify([
    { title: "Single-Window Convenience", desc: "No need to juggle multiple unverified contractors. All specialized building services under one trusted brand." },
    { title: "Written Work Guarantee", desc: "Documented warranty on waterproofing, structural rehabilitation, and pest control treatments." },
    { title: "Transparent Pricing", desc: "Itemized estimations with clear material specifications before any work begins." }
  ]),
  aboutImages: JSON.stringify([
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop"
  ]),
  metaTitle: "Hind Build | Building Repair, Maintenance & Protection",
  metaDescription: "Professional building repair, waterproofing, painting, termite control, electrical, and facility maintenance services by Hind Build, a Hindustan Projects company.",
  canonicalUrl: "https://hindbuilding.hindustanprojects.in",
  ogImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop"
};

let backendOfflineUntil = 0;

function isBackendCircuitOpen(): boolean {
  return Date.now() < backendOfflineUntil;
}

function tripBackendCircuit(): void {
  // If backend is down or unreachable, bypass further fetches for 5 seconds
  backendOfflineUntil = Date.now() + 5000;
}

export async function fetchHbsContent(): Promise<HbsContent> {
  if (isBackendCircuitOpen()) {
    return DEFAULT_HBS_CONTENT;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/content`, {
      next: { revalidate: process.env.NODE_ENV === "development" ? 0 : 60, tags: ["hbs-content"] },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    tripBackendCircuit();
  }
  return DEFAULT_HBS_CONTENT;
}

export const DEFAULT_HBS_SERVICES: HbsService[] = [
  {
    id: "srv-01",
    serviceNumber: "01",
    title: "Structure Repair",
    hindiTitle: "संरचनात्मक मरम्मत",
    slug: "structure-repair",
    shortDescription: "RCC column strengthening, foundation crack repair, and rebar passivation.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 1,
  },
  {
    id: "srv-02",
    serviceNumber: "02",
    title: "Water Leakage Solution",
    hindiTitle: "पानी लीकेज का समाधान",
    slug: "water-leakage-solution",
    shortDescription: "PU injection grouting and seepage defense without breaking tiles.",
    image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 2,
  },
  {
    id: "srv-03",
    serviceNumber: "03",
    title: "Plumbing & Electrical",
    hindiTitle: "प्लंबिंग और बिजली का कार्य",
    slug: "plumbing-electrical",
    shortDescription: "Concealed pipeline detection, sanitary fittings, and main panel cabling.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 3,
  },
  {
    id: "srv-04",
    serviceNumber: "04",
    title: "Painting & Wall Repair",
    hindiTitle: "पेंटिंग और वॉल रिपेयर",
    slug: "painting-wall-repair",
    shortDescription: "Waterproof exterior emulsions, damp-proof putty, and luxury interior finishes.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 4,
  },
  {
    id: "srv-05",
    serviceNumber: "05",
    title: "Terrace & Roof Protection",
    hindiTitle: "छत का वाटर और सुरक्षा",
    slug: "terrace-roof-protection",
    shortDescription: "UV-reflective elastomeric polyurethane membranes with ponding test.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 5,
  },
  {
    id: "srv-06",
    serviceNumber: "06",
    title: "Termite Control",
    hindiTitle: "दीमक नियंत्रण",
    slug: "termite-control",
    shortDescription: "Post-construction chemical perimeter barrier and wood borers eradication.",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 6,
  },
  {
    id: "srv-07",
    serviceNumber: "07",
    title: "Tile Work",
    hindiTitle: "टाइल वर्क",
    slug: "tile-work",
    shortDescription: "Precision floor laying, epoxy grouting, and anti-skid terrace pavers.",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 7,
  },
  {
    id: "srv-08",
    serviceNumber: "08",
    title: "AC, Lift & Solar",
    hindiTitle: "एसी, लिफ्ट और सोलर",
    slug: "ac-lift-solar",
    shortDescription: "HVAC piping insulation, solar rooftop anchors, and elevator shaft care.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 8,
  },
  {
    id: "srv-09",
    serviceNumber: "09",
    title: "Electric & Machine Work",
    hindiTitle: "इलेक्ट्रिक व मशीन कार्य",
    slug: "electric-machine-work",
    shortDescription: "Motor pump rewinding, generator earthing, and industrial 3-phase wiring.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 9,
  },
  {
    id: "srv-10",
    serviceNumber: "10",
    title: "Safety & Compliance",
    hindiTitle: "सुरक्षा और नियम पालन",
    slug: "safety-compliance",
    shortDescription: "Fire extinguisher lines, lightning arresters, and building safety audit.",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 10,
  },
  {
    id: "srv-11",
    serviceNumber: "11",
    title: "Gardening",
    hindiTitle: "गार्डनिंग सेवा",
    slug: "gardening",
    shortDescription: "Landscape maintenance, terrace garden root-barriers, and turf care.",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 11,
  },
  {
    id: "srv-12",
    serviceNumber: "12",
    title: "Cleaning Services",
    hindiTitle: "क्लीनिंग सेवाएं",
    slug: "cleaning-services",
    shortDescription: "Deep floor scrubbing, water tank disinfection, and glass facade wash.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 12,
  },
  {
    id: "srv-13",
    serviceNumber: "13",
    title: "Packers & Movers",
    hindiTitle: "पैकर्स और मूवर्स",
    slug: "packers-movers",
    shortDescription: "Safe household shifting, heavy machinery transport, and warehouse logistics.",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 13,
  },
  {
    id: "srv-14",
    serviceNumber: "14",
    title: "CCTV & Security",
    hindiTitle: "सीसीटीवी और सुरक्षा",
    slug: "cctv-security",
    shortDescription: "IP camera surveillance, biometric entry locks, and perimeter sensors.",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 14,
  },
  {
    id: "srv-15",
    serviceNumber: "15",
    title: "Smart Home Automation",
    hindiTitle: "स्मार्ट होम ऑटोमेशन",
    slug: "smart-home-automation",
    shortDescription: "Touch switches, IoT sensor alerts, and smart water tank controllers.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 15,
  },
  {
    id: "srv-16",
    serviceNumber: "16",
    title: "Furniture Work",
    hindiTitle: "फर्नीचर का काम",
    slug: "furniture-work",
    shortDescription: "Modular cabinetry repair, laminate touchups, and termite-proof polish.",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=800&auto=format&fit=crop",
    active: true,
    order: 16,
  },
];

export async function fetchHbsServices(): Promise<HbsService[]> {
  if (isBackendCircuitOpen()) {
    return DEFAULT_HBS_SERVICES;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/services`, {
      next: { revalidate: process.env.NODE_ENV === "development" ? 0 : 60, tags: ["hbs-services"] },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    }
  } catch {
    tripBackendCircuit();
  }
  return DEFAULT_HBS_SERVICES;
}

export const DEFAULT_HBS_PROJECTS: HbsProject[] = [
  {
    id: "proj-1",
    slug: "terrace-waterproofing-udaipur",
    title: "Terrace Waterproofing",
    location: "Udaipur, Rajasthan",
    serviceCategory: "Waterproofing",
    clientType: "Residential Villa",
    description: "Permanent positive-side waterproofing with elastomeric PU membrane and 48-hour ponding test.",
    problemStatement: "Persistent monsoon water seepage through parapet joints and hairline concrete shrinkage cracks resulting in severe ceiling dampness in upper-floor residential suites.",
    scopeOfWork: [
      "Surface grinding & high-pressure cleaning",
      "V-groove chase cutting along thermal cracks",
      "Polymer modified mortar (PMM) levelling",
      "Dual-coat aliphatic polyurethane elastomeric membrane application",
      "Non-woven geotextile scrim reinforcement",
      "48-hour continuous flood ponding test"
    ],
    solutionStatement: "Executed systematic positive-side waterproofing system using elastomeric PU waterproofing membrane with tensile reinforcement. Finished with protective UV-resistant topcoat and certified 7-year performance warranty.",
    resultStatement: "Complete elimination of dampness and seepage. Zero ponding water penetration verified across a strict 48-hour inspection audit. Full technical warranty certificate issued to property owner.",
    areaTreated: "4,200 sq.ft",
    durationDays: 6,
    images: ["https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=1200&auto=format&fit=crop"],
    date: "August 2026",
    featured: true,
    status: "completed",
  },
  {
    id: "proj-2",
    slug: "building-repair-bhilwara",
    title: "Building Repair",
    location: "Bhilwara, Rajasthan",
    serviceCategory: "Repair",
    clientType: "Commercial Complex",
    description: "Non-destructive rebound hammer survey, high-tensile rebar rust passivation, and structural micro-concreting.",
    problemStatement: "Carbonation-induced rebar corrosion and concrete spalling across 12 ground-level structural load-bearing columns, compromising structural integrity.",
    scopeOfWork: [
      "Non-destructive rebound hammer & ultrasonic pulse velocity survey",
      "Selective chipping and concrete surface preparation",
      "Zinc-rich rust inhibitor passivation on exposed reinforcement",
      "Shear anchor installation and supplementary high-yield steel ties",
      "Shrinkage-compensated polymer micro-concrete column jacketing",
      "Anti-carbonation protective elastomeric coating"
    ],
    solutionStatement: "Implemented structural micro-concreting and column jacketing using high-early-strength shrinkage-compensated repair mortars. Restored structural load ratings in compliance with IS 456 & IS 15988 codes.",
    resultStatement: "Structural compression load restored to 100% design capacity. Non-destructive post-cure testing confirmed zero internal voids and total adhesion integrity.",
    areaTreated: "12 Columns",
    durationDays: 14,
    images: ["https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop"],
    date: "July 2026",
    featured: true,
    status: "completed",
  },
  {
    id: "proj-3",
    slug: "exterior-painting-jaipur",
    title: "Exterior Painting",
    location: "Jaipur, Rajasthan",
    serviceCategory: "Painting",
    clientType: "Residential Society",
    description: "Weather-proof acrylic silicone paint with crack bridging and anti-fungal barrier.",
    problemStatement: "Extensive facade paint peeling, hairline plaster weathering, and algae colonization due to harsh thermal cycles and high solar irradiance.",
    scopeOfWork: [
      "Rotary pressure wash and fungicidal biocidal wash",
      "High-elasticity acrylic crack bridging filler application",
      "Silane-siloxane hydrophobic penetration primer coat",
      "Dual-coat silicone-modified 100% pure acrylic exterior coating",
      "Architectural groove detailing and window perimeter seal"
    ],
    solutionStatement: "Applied multi-tier weather-resistant exterior paint system featuring silicone-acrylic polymer technology. Provides UV resistance, breathability, and low-dirt pickup.",
    resultStatement: "Uniform, radiant architectural exterior finish with exceptional rainwater repellence and 5-year anti-fading durability.",
    areaTreated: "8,500 sq.ft",
    durationDays: 10,
    images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop"],
    date: "September 2026",
    status: "completed",
  },
  {
    id: "proj-4",
    slug: "plumbing-work-ajmer",
    title: "Plumbing Work",
    location: "Ajmer, Rajasthan",
    serviceCategory: "Plumbing",
    clientType: "Hospital Complex",
    description: "Concealed pipeline pressure testing, CPVC pipeline redesign, and zero-breakage leak isolation.",
    problemStatement: "Concealed shaft riser corrosion and pressure fluctuations resulting in intermittent structural dampness in multi-storey hospital facility.",
    scopeOfWork: [
      "Acoustic electronic leak detection across vertical shafts",
      "Hydrostatic pneumatic pressure testing",
      "Replacement of corroded GI risers with SDR-11 chlorinated polyvinyl chloride (CPVC)",
      "Vibration-damped acoustic pipe clamps & thermal expansion loops",
      "Full shaft fire-stop barrier sealing and civil reinstatement"
    ],
    solutionStatement: "Engineered turnkey pipe redesign utilizing high-grade CPVC and industrial copper manifold distribution. Zero-breakage diagnostic isolation prevented disruption to operational wards.",
    resultStatement: "Normalized system operating pressure to 4.2 bar with zero leakage. Shaft moisture dropped to ambient levels within 72 hours.",
    areaTreated: "3 Floors",
    durationDays: 5,
    images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop"],
    date: "June 2026",
    status: "completed",
  },
  {
    id: "proj-5",
    slug: "office-renovation-kota",
    title: "Office Renovation",
    location: "Kota, Rajasthan",
    serviceCategory: "Renovation",
    clientType: "Corporate Office",
    description: "Turnkey interior and civil renovation, acoustic drywall partitioning, and electrical wiring.",
    problemStatement: "Aging commercial floor layout with inadequate acoustic isolation, inefficient spatial planning, and obsolete electrical conduits.",
    scopeOfWork: [
      "Demolition of non-load bearing partitions and debris removal",
      "Drywall framing with sound-attenuating mineral wool insulation",
      "Concealed FRLS electrical wiring and modular LED lighting grid",
      "Vitrified porcelain floor tiling and commercial carpet tiles",
      "High-durability washable interior wall finishes and glazing"
    ],
    solutionStatement: "Turnkey civil and interior transformation adhering to commercial ergonomic and acoustic benchmarks. Delivered on an accelerated 12-day schedule.",
    resultStatement: "Handed over modernized corporate office environment with 38 dB acoustic isolation, energy-efficient lighting, and full itemized BOQ sign-off.",
    areaTreated: "3,200 sq.ft",
    durationDays: 12,
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"],
    date: "May 2026",
    status: "completed",
  },
];

export const DEFAULT_HBS_TESTIMONIALS: HbsTestimonial[] = [
  {
    id: "test-1",
    name: "Rajesh Sharma",
    designation: "Home Owner",
    location: "Bhilwara",
    rating: 5,
    content: "Excellent service and professional team. Our terrace leakage issue was completely resolved. Highly recommended!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    serviceCategory: "Terrace Waterproofing",
  },
  {
    id: "test-2",
    name: "Priya Mehta",
    designation: "Apartment Society",
    location: "Udaipur",
    rating: 5,
    content: "Very reliable and timely work. Painting and repairs were done with great quality. Thank you, HiBUILD!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    serviceCategory: "Painting & Repairs",
  },
  {
    id: "test-3",
    name: "Amit Verma",
    designation: "Business Owner",
    location: "Jaipur",
    rating: 5,
    content: "Professional team, transparent pricing and good after-service. Will definitely work with them again.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    serviceCategory: "Civil Maintenance",
  },
];

export async function fetchHbsProjects(): Promise<HbsProject[]> {
  if (isBackendCircuitOpen()) {
    return DEFAULT_HBS_PROJECTS;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/projects`, {
      next: { revalidate: process.env.NODE_ENV === "development" ? 0 : 60, tags: ["hbs-projects"] },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    }
  } catch {
    tripBackendCircuit();
  }
  return DEFAULT_HBS_PROJECTS;
}

export async function fetchHbsTestimonials(): Promise<HbsTestimonial[]> {
  if (isBackendCircuitOpen()) {
    return DEFAULT_HBS_TESTIMONIALS;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/testimonials`, {
      next: { revalidate: process.env.NODE_ENV === "development" ? 0 : 60, tags: ["hbs-testimonials"] },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    }
  } catch {
    tripBackendCircuit();
  }
  return DEFAULT_HBS_TESTIMONIALS;
}

export async function fetchHbsServiceBySlug(slug: string): Promise<HbsService | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/services/${encodeURIComponent(slug)}`, {
      next: { revalidate: process.env.NODE_ENV === "development" ? 0 : 60, tags: [`hbs-service-${slug}`, "hbs-services"] },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
    const all = await fetchHbsServices();
    return all.find((s) => s.slug === slug || s.id === slug) || null;
  } catch (err) {
    console.warn(`fetchHbsServiceBySlug fallback for ${slug}:`, err);
    try {
      const all = await fetchHbsServices();
      return all.find((s) => s.slug === slug || s.id === slug) || null;
    } catch {
      return null;
    }
  }
}

export async function fetchHbsProjectBySlug(slug: string): Promise<HbsProject | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/projects/${encodeURIComponent(slug)}`, {
      next: { revalidate: process.env.NODE_ENV === "development" ? 0 : 60, tags: [`hbs-project-${slug}`, "hbs-projects"] },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
    const all = await fetchHbsProjects();
    return all.find((p) => p.slug === slug || p.id === slug) || null;
  } catch (err) {
    console.warn(`fetchHbsProjectBySlug fallback for ${slug}:`, err);
    try {
      const all = await fetchHbsProjects();
      return all.find((p) => p.slug === slug || p.id === slug) || null;
    } catch {
      return null;
    }
  }
}


