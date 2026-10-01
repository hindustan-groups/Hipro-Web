/**
 * Central CTA Management System
 * ---------------------------------
 * Types, default CTA registry, and resolver utilities.
 * Admin page: /admin/cta-management
 * CTAs are stored inside Settings.pageContent as { ctas: CTAConfig[] }
 */

export type CTAActionType =
  | "internal"
  | "external"
  | "phone"
  | "whatsapp"
  | "email"
  | "anchor"
  | "modal";

export type CTAStyle =
  | "primary"
  | "danger"
  | "secondary"
  | "ghost"
  | "whatsapp"
  | "text";

export interface CTAConfig {
  key: string;
  label: string;
  actionType: CTAActionType;
  destination: string;
  style: CTAStyle;
  icon?: string;
  openNewTab?: boolean;
  enabled?: boolean;
  location?: string;
  section?: string;
  description?: string;
  usedIn?: string[];
}

export const DEFAULT_CTAS: CTAConfig[] = [
  {
    key: "navbar_primary",
    label: "Get a Quote",
    actionType: "internal",
    destination: "/contact",
    style: "primary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Global Header",
    section: "Navbar (Desktop & Mobile)",
    description: "Top-right high-priority quote consultation button in navbar and mobile menu drawer",
    usedIn: ["Top Navbar (Desktop & Tablet)", "Mobile Drawer Navigation Menu"],
  },
  {
    key: "home_hero_primary",
    label: "Start Your Project",
    actionType: "internal",
    destination: "/contact",
    style: "danger",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Home Page",
    section: "Hero Slider",
    description: "Primary red action button displayed on all hero slides on the homepage",
    usedIn: ["Home (/) → Hero Slider Primary Button"],
  },
  {
    key: "home_hero_secondary",
    label: "View Portfolio",
    actionType: "internal",
    destination: "/projects",
    style: "ghost",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Home Page",
    section: "Hero Slider",
    description: "Secondary glass outline button displayed on all hero slides on the homepage",
    usedIn: ["Home (/) → Hero Slider Secondary Button"],
  },
  {
    key: "home_about_primary",
    label: "Discover Our Story",
    actionType: "internal",
    destination: "/about",
    style: "primary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Home Page",
    section: "About Section",
    description: "Primary button navigating to the About page from the homepage corporate summary",
    usedIn: ["Home (/) → About Hindustan Projects Section"],
  },
  {
    key: "home_about_secondary",
    label: "Explore Capabilities",
    actionType: "internal",
    destination: "/services",
    style: "secondary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Home Page",
    section: "About Section",
    description: "Secondary button navigating to services from the homepage corporate summary",
    usedIn: ["Home (/) → About Hindustan Projects Section"],
  },
  {
    key: "home_services_view_all",
    label: "View All Services",
    actionType: "internal",
    destination: "/services",
    style: "secondary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Home Page",
    section: "Services Section",
    description: "Header action button navigating to full services listing from homepage services section",
    usedIn: ["Home (/) → Construction Services Section Strip"],
  },
  {
    key: "home_projects_view_all",
    label: "View Full Portfolio",
    actionType: "internal",
    destination: "/projects",
    style: "secondary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Home Page",
    section: "Projects Section",
    description: "Top-right link navigating to portfolio from homepage projects showcase",
    usedIn: ["Home (/) → Landmarks In The Making Header Strip"],
  },
  {
    key: "home_cta_primary",
    label: "Get Free Estimate",
    actionType: "internal",
    destination: "/contact",
    style: "primary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Global / Home",
    section: "Ready To Build Banner",
    description: "Primary navy quote button in full-width consultation banner at bottom of homepage & about page",
    usedIn: ["Home (/) → Ready To Build Banner", "About (/about) → Bottom Consultation Banner"],
  },
  {
    key: "home_cta_phone",
    label: "Call Us",
    actionType: "phone",
    destination: "+917597000601",
    style: "secondary",
    icon: "Phone",
    openNewTab: false,
    enabled: true,
    location: "Global / Home",
    section: "Ready To Build Banner",
    description: "Direct phone call action button in full-width consultation banner",
    usedIn: ["Home (/) → Ready To Build Banner", "About (/about) → Bottom Consultation Banner"],
  },
  {
    key: "home_cta_whatsapp",
    label: "WhatsApp Us",
    actionType: "whatsapp",
    destination: "917597000601",
    style: "whatsapp",
    icon: "MessageSquare",
    openNewTab: true,
    enabled: true,
    location: "Global / Home",
    section: "Ready To Build Banner",
    description: "Instant WhatsApp messaging button in full-width consultation banner",
    usedIn: ["Home (/) → Ready To Build Banner", "About (/about) → Bottom Consultation Banner"],
  },
  {
    key: "about_hero_primary",
    label: "Explore Capabilities",
    actionType: "internal",
    destination: "/services",
    style: "danger",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "About Page",
    section: "Hero Header",
    description: "Primary red button in the hero section of the About page",
    usedIn: ["About (/about) → Hero Header Primary Button"],
  },
  {
    key: "about_hero_secondary",
    label: "Estimate Build Cost",
    actionType: "internal",
    destination: "/cost-estimator",
    style: "secondary",
    icon: "Calculator",
    openNewTab: false,
    enabled: true,
    location: "About Page",
    section: "Hero Header",
    description: "Secondary cost calculator button in the hero section of the About page",
    usedIn: ["About (/about) → Hero Header Secondary Button"],
  },
  {
    key: "about_contact_primary",
    label: "Connect With Our Bhilwara Office",
    actionType: "internal",
    destination: "/contact",
    style: "primary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "About Page",
    section: "Regional Focus Section",
    description: "Contact button in the regional headquarters section of the About page",
    usedIn: ["About (/about) → Headquartered in Bhilwara Section"],
  },
  {
    key: "services_hero_primary",
    label: "Consult Technical Team",
    actionType: "internal",
    destination: "/contact",
    style: "primary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Services Page",
    section: "Hero Header",
    description: "Primary consultation button in hero banner of /services",
    usedIn: ["Services (/services) → Hero Header Primary Button"],
  },
  {
    key: "services_hero_secondary",
    label: "Estimate Project Cost",
    actionType: "internal",
    destination: "/cost-estimator",
    style: "secondary",
    icon: "Calculator",
    openNewTab: false,
    enabled: true,
    location: "Services Page",
    section: "Hero Header",
    description: "Cost calculator button in hero banner of /services",
    usedIn: ["Services (/services) → Hero Header Secondary Button"],
  },
  {
    key: "services_bottom_primary",
    label: "Contact Technical Team",
    actionType: "internal",
    destination: "/contact",
    style: "danger",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Services Page",
    section: "Bottom CTA Banner",
    description: "Full-width call to action at the bottom of /services",
    usedIn: ["Services (/services) → Ready To Launch Your Next Build Banner"],
  },
  {
    key: "service_detail_primary",
    label: "Get a Free Quote",
    actionType: "internal",
    destination: "/contact",
    style: "danger",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Service Detail Pages",
    section: "Bottom Consultation Banner",
    description: "Primary quote button on individual service pages (/services/[slug])",
    usedIn: ["Service Detail (/services/[slug]) → Need Expert Assistance Banner"],
  },
  {
    key: "service_detail_secondary",
    label: "Calculate Cost",
    actionType: "internal",
    destination: "/cost-estimator",
    style: "primary",
    icon: "Calculator",
    openNewTab: false,
    enabled: true,
    location: "Service Detail Pages",
    section: "Bottom Consultation Banner",
    description: "Estimator button on individual service pages (/services/[slug])",
    usedIn: ["Service Detail (/services/[slug]) → Need Expert Assistance Banner"],
  },
  {
    key: "projects_hero_primary",
    label: "Explore Portfolio",
    actionType: "anchor",
    destination: "#projects-list",
    style: "primary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Projects Page",
    section: "Hero Header",
    description: "Scroll anchor button in hero header of /projects",
    usedIn: ["Projects (/projects) → Hero Header Portfolio Scroll Anchor"],
  },
  {
    key: "projects_hero_secondary",
    label: "Discuss Your Project",
    actionType: "internal",
    destination: "/contact",
    style: "secondary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Projects Page",
    section: "Hero Header",
    description: "Contact button in hero header of /projects",
    usedIn: ["Projects (/projects) → Hero Header Secondary Button"],
  },
  {
    key: "projects_bottom_primary",
    label: "Start Project Discussion",
    actionType: "internal",
    destination: "/contact",
    style: "primary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Projects Page",
    section: "Bottom CTA Banner",
    description: "Full-width consultation banner at bottom of /projects",
    usedIn: ["Projects (/projects) → Ready To Engineer Landmark Banner"],
  },
  {
    key: "project_detail_primary",
    label: "Inquire About Similar Project",
    actionType: "internal",
    destination: "/contact",
    style: "primary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Project Detail Pages",
    section: "Sidebar Consultation Card",
    description: "Sidebar inquiry button on individual project case study pages (/projects/[slug])",
    usedIn: ["Project Detail (/projects/[slug]) → Sidebar Consultation Card"],
  },
  {
    key: "project_detail_bottom_primary",
    label: "Initiate Project Consultation",
    actionType: "internal",
    destination: "/contact",
    style: "danger",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Project Detail Pages",
    section: "Bottom Action Banner",
    description: "Primary consultation button in bottom banner of project case study pages",
    usedIn: ["Project Detail (/projects/[slug]) → Bottom Consultation Banner"],
  },
  {
    key: "project_detail_bottom_secondary",
    label: "Browse All Projects",
    actionType: "internal",
    destination: "/projects",
    style: "secondary",
    icon: "FolderOpen",
    openNewTab: false,
    enabled: true,
    location: "Project Detail Pages",
    section: "Bottom Action Banner",
    description: "Secondary link navigating to full projects grid from project detail bottom",
    usedIn: ["Project Detail (/projects/[slug]) → Bottom Consultation Banner"],
  },
  {
    key: "footer_estimator",
    label: "Instant Cost Estimator",
    actionType: "internal",
    destination: "/cost-estimator",
    style: "danger",
    icon: "Calculator",
    openNewTab: false,
    enabled: true,
    location: "Global Footer",
    section: "Pre-Footer Banner Strip",
    description: "Red cost estimator button in the pre-footer strip across all pages",
    usedIn: ["Global Footer (All Pages) → Pre-Footer Banner Strip"],
  },
  {
    key: "footer_whatsapp",
    label: "WhatsApp Quote",
    actionType: "whatsapp",
    destination: "917597000601",
    style: "ghost",
    icon: "MessageSquare",
    openNewTab: true,
    enabled: true,
    location: "Global Footer",
    section: "Pre-Footer Banner Strip",
    description: "WhatsApp quote button in the pre-footer strip across all pages",
    usedIn: ["Global Footer (All Pages) → Pre-Footer Banner Strip"],
  },
  {
    key: "blogs_cta_primary",
    label: "Consult an Engineer",
    actionType: "internal",
    destination: "/contact?service=General%20Inquiry",
    style: "primary",
    icon: "ArrowRight",
    openNewTab: false,
    enabled: true,
    location: "Blogs Page",
    section: "Bottom Consultation Strip",
    description: "Consultation button at the bottom of the insights and blog articles index",
    usedIn: ["Blogs (/blogs) → Bottom Engineering Consultation Strip"],
  },
  {
    key: "blogs_cta_secondary",
    label: "Use Cost Estimator",
    actionType: "internal",
    destination: "/cost-estimator",
    style: "secondary",
    icon: "Calculator",
    openNewTab: false,
    enabled: true,
    location: "Blogs Page",
    section: "Bottom Consultation Strip",
    description: "Cost estimator button at the bottom of the insights and blog articles index",
    usedIn: ["Blogs (/blogs) → Bottom Engineering Consultation Strip"],
  },
];

export function resolveCTAHref(cta: CTAConfig): string {
  switch (cta.actionType) {
    case "phone":
      return `tel:${cta.destination.replace(/\s+/g, "")}`;
    case "whatsapp": {
      const clean = cta.destination.replace(/[^0-9]/g, "");
      return `https://wa.me/${clean}`;
    }
    case "email":
      return `mailto:${cta.destination.trim()}`;
    default:
      return cta.destination || "#";
  }
}

export function getCTAStyleClasses(style: CTAStyle): string {
  switch (style) {
    case "danger":
      return "bg-construction-red hover:bg-red-700 text-white border border-transparent shadow-lg shadow-red-600/20";
    case "primary":
      return "bg-construction-navy hover:bg-slate-900 text-white border border-transparent shadow-md";
    case "secondary":
      return "bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs";
    case "ghost":
      return "bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm";
    case "whatsapp":
      return "bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent shadow-md";
    case "text":
      return "bg-transparent text-construction-navy hover:text-construction-red border-b border-construction-navy hover:border-construction-red px-0 py-1";
    default:
      return "bg-construction-navy text-white";
  }
}

export function mergeCTAsWithDefaults(cmsCtas: CTAConfig[]): CTAConfig[] {
  const merged = DEFAULT_CTAS.map((d) => {
    const override = cmsCtas.find((c) => c.key === d.key);
    return override ? { ...d, ...override } : d;
  });
  const defaultKeys = new Set(DEFAULT_CTAS.map((d) => d.key));
  for (const c of cmsCtas) {
    if (!defaultKeys.has(c.key)) merged.push(c);
  }
  return merged;
}

export function getCTAsFromSettings(settings: any): CTAConfig[] {
  try {
    const raw = settings?.pageContent;
    const pc: any = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
    if (Array.isArray(pc?.ctas) && pc.ctas.length > 0) {
      return mergeCTAsWithDefaults(pc.ctas as CTAConfig[]);
    }
  } catch { /* silent */ }
  return [...DEFAULT_CTAS];
}

export function resolveCTA(settings: any, key: string): CTAConfig | null {
  const ctas = getCTAsFromSettings(settings);
  return ctas.find((c) => c.key === key) ?? DEFAULT_CTAS.find((c) => c.key === key) ?? null;
}
