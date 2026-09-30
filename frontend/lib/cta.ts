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
  description?: string;
}

export const DEFAULT_CTAS: CTAConfig[] = [
  { key: "navbar_primary", label: "Get a Quote", actionType: "internal", destination: "/contact", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Navbar", description: "Top-right CTA button in the navbar" },
  { key: "home_hero_primary", label: "Start Your Project", actionType: "internal", destination: "/contact", style: "danger", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Home — Hero Slider", description: "Primary CTA on hero slides" },
  { key: "home_hero_secondary", label: "View Portfolio", actionType: "internal", destination: "/projects", style: "ghost", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Home — Hero Slider", description: "Secondary CTA on hero slides" },
  { key: "home_about_primary", label: "Discover Our Story", actionType: "internal", destination: "/about", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Home — About Section", description: "Primary CTA in home about section" },
  { key: "home_about_secondary", label: "Explore Capabilities", actionType: "internal", destination: "/services", style: "secondary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Home — About Section", description: "Secondary CTA in home about section" },
  { key: "home_services_view_all", label: "View All Services", actionType: "internal", destination: "/services", style: "secondary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Home — Services Section", description: "View all services button" },
  { key: "home_projects_view_all", label: "View Full Portfolio", actionType: "internal", destination: "/projects", style: "secondary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Home — Projects Section", description: "View portfolio button" },
  { key: "home_cta_primary", label: "Get Free Estimate", actionType: "internal", destination: "/contact", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Home — CTA Section", description: "Primary CTA in home bottom CTA strip" },
  { key: "home_cta_phone", label: "Call Us", actionType: "phone", destination: "+917597000601", style: "secondary", icon: "Phone", openNewTab: false, enabled: true, location: "Home — CTA Section", description: "Phone CTA in home CTA section" },
  { key: "home_cta_whatsapp", label: "WhatsApp Us", actionType: "whatsapp", destination: "917597000601", style: "whatsapp", icon: "MessageSquare", openNewTab: true, enabled: true, location: "Home — CTA Section", description: "WhatsApp CTA in home CTA section" },
  { key: "about_hero_primary", label: "Explore Capabilities", actionType: "internal", destination: "/services", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "About — Hero", description: "Primary CTA in About hero" },
  { key: "about_hero_secondary", label: "Estimate Build Cost", actionType: "internal", destination: "/cost-estimator", style: "secondary", icon: "Calculator", openNewTab: false, enabled: true, location: "About — Hero", description: "Secondary CTA in About hero" },
  { key: "about_contact_primary", label: "Connect With Our Bhilwara Office", actionType: "internal", destination: "/contact", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "About — Contact Section", description: "CTA at bottom of About page" },
  { key: "services_hero_primary", label: "Consult Technical Team", actionType: "internal", destination: "/contact", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Services — Hero", description: "Primary CTA in /services hero" },
  { key: "services_hero_secondary", label: "Estimate Project Cost", actionType: "internal", destination: "/cost-estimator", style: "secondary", icon: "Calculator", openNewTab: false, enabled: true, location: "Services — Hero", description: "Secondary CTA in /services hero" },
  { key: "services_bottom_primary", label: "Contact Technical Team", actionType: "internal", destination: "/contact", style: "danger", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Services — Bottom CTA", description: "Primary CTA in /services bottom strip" },
  { key: "service_detail_primary", label: "Get a Free Quote", actionType: "internal", destination: "/contact", style: "danger", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Service Detail — CTA", description: "Primary CTA on service detail pages" },
  { key: "service_detail_secondary", label: "Calculate Cost", actionType: "internal", destination: "/cost-estimator", style: "primary", icon: "Calculator", openNewTab: false, enabled: true, location: "Service Detail — CTA", description: "Secondary CTA on service detail pages" },
  { key: "projects_hero_primary", label: "Explore Portfolio", actionType: "anchor", destination: "#projects-list", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Projects — Hero", description: "Primary CTA in /projects hero (scrolls to list)" },
  { key: "projects_hero_secondary", label: "Discuss Your Project", actionType: "internal", destination: "/contact", style: "secondary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Projects — Hero", description: "Secondary CTA in /projects hero" },
  { key: "projects_bottom_primary", label: "Start Project Discussion", actionType: "internal", destination: "/contact", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Projects — Bottom CTA", description: "Primary CTA in /projects bottom strip" },
  { key: "project_detail_primary", label: "Inquire About Similar Project", actionType: "internal", destination: "/contact", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Project Detail — Sidebar", description: "CTA in project detail sidebar" },
  { key: "project_detail_bottom_primary", label: "Initiate Project Consultation", actionType: "internal", destination: "/contact", style: "danger", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Project Detail — Bottom CTA", description: "Primary CTA in project detail bottom strip" },
  { key: "project_detail_bottom_secondary", label: "Browse All Projects", actionType: "internal", destination: "/projects", style: "secondary", icon: "FolderOpen", openNewTab: false, enabled: true, location: "Project Detail — Bottom CTA", description: "Secondary CTA in project detail bottom strip" },
  { key: "footer_estimator", label: "Instant Cost Estimator", actionType: "internal", destination: "/cost-estimator", style: "danger", icon: "Calculator", openNewTab: false, enabled: true, location: "Footer — Pre-footer Strip", description: "Red CTA in footer pre-footer strip" },
  { key: "footer_whatsapp", label: "WhatsApp Quote", actionType: "whatsapp", destination: "917597000601", style: "ghost", icon: "MessageSquare", openNewTab: true, enabled: true, location: "Footer — Pre-footer Strip", description: "WhatsApp CTA in footer pre-footer strip" },
  { key: "blogs_cta_primary", label: "Consult an Engineer", actionType: "internal", destination: "/contact?service=General%20Inquiry", style: "primary", icon: "ArrowRight", openNewTab: false, enabled: true, location: "Blogs — Sidebar CTA", description: "Primary CTA in blog sidebar" },
  { key: "blogs_cta_secondary", label: "Use Cost Estimator", actionType: "internal", destination: "/cost-estimator", style: "secondary", icon: "Calculator", openNewTab: false, enabled: true, location: "Blogs — Sidebar CTA", description: "Secondary CTA in blog sidebar" },
];

export function resolveCTAHref(cta: CTAConfig): string {
  switch (cta.actionType) {
    case "phone": return `tel:${cta.destination.replace(/\s+/g, "")}`;
    case "whatsapp": return `https://wa.me/${cta.destination.replace(/[^0-9]/g, "")}`;
    case "email": return `mailto:${cta.destination}`;
    default: return cta.destination;
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
