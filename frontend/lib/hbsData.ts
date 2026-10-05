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
  logo: "/logo.jpg",
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
  heroCtas: JSON.stringify([
    { label: "Book Free Inspection", link: "/hbs/contact", variant: "primary" },
    { label: "View All 19 Services", link: "/hbs/services", variant: "secondary" }
  ]),
  whyChooseUs: JSON.stringify([
    { title: "Parent Company Engineering Oversight", description: "Backed by Hindustan Projects (HiPRO) civil engineers and certified site supervisors.", icon: "ShieldCheck" },
    { title: "Non-Destructive Modern Diagnosis", description: "Advanced moisture meters and pipe leak scanners prevent unnecessary breaking.", icon: "Cpu" },
    { title: "Guaranteed Work & Verified Materials", description: "Only industrial-grade chemicals, certified sealants, and premium hardware used.", icon: "Award" },
    { title: "Rapid Turnaround Across Rajasthan", description: "Dedicated quick-response technicians stationed in Bhilwara and central regions.", icon: "Clock" }
  ]),
  stats: JSON.stringify([
    { label: "Repair Services", value: "19+" },
    { label: "Buildings Protected", value: "350+" },
    { label: "Customer Satisfaction", value: "98%" },
    { label: "Engineering Heritage", value: "Since 2019" }
  ]),
  homeFinalCta: JSON.stringify({
    heading: "Does Your Building Suffer From Leakage, Cracks, or Aging Fixtures?",
    subheading: "Schedule a non-destructive site inspection with Hind Building Solutions today. Get transparent estimations without hidden charges.",
    buttonText: "Schedule Inspection",
    phone: "+91 75970 00601"
  }),
  aboutStory: "Hind Building Solutions (HBS) was founded under Hindustan Projects (HiPRO) to bridge the massive gap between informal local handymen and large civil contractors. Modern buildings represent substantial investments, yet minor moisture ingress, foundation settlements, and electrical wear frequently turn into catastrophic structural hazards. HBS brings certified engineering discipline, non-destructive diagnosis, and turnkey accountability to building maintenance and protection across Rajasthan.",
  mission: "To extend the functional life, aesthetic dignity, and structural safety of every residential, commercial, and industrial property through dependable, engineering-grade maintenance.",
  vision: "To be Rajasthan's most trusted single-window building maintenance and protection brand, synonymous with integrity, speed, and lasting craftsmanship.",
  team: JSON.stringify([
    { name: "Civil Engineering Core", role: "Structural & Diagnostic Oversight", desc: "Supervised by Hindustan Projects senior engineering team." },
    { name: "Specialized Field Technicians", role: "Waterproofing & Mechanical", desc: "Certified applicators for Dr. Fixit, Fosroc, and Sika chemical systems." },
    { name: "Rapid Service Response", role: "Customer Operations & Dispatch", desc: "Ensuring timely inspections and transparent digital estimates." }
  ]),
  whyChoosePoints: JSON.stringify([
    { title: "Single-Window Convenience", desc: "No need to juggle 5 different unverified contractors. All 19 building services under one trusted brand." },
    { title: "Written Work Guarantee", desc: "Documented warranty on waterproofing, structural rehabilitation, and pest control treatments." },
    { title: "Transparent Pricing", desc: "Itemized estimations with clear material specifications before any work begins." }
  ]),
  aboutImages: JSON.stringify([
    "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop"
  ]),
  metaTitle: "Hind Building Solutions (HBS) | Building Repair, Maintenance & Protection",
  metaDescription: "Professional building repair, waterproofing, painting, termite control, electrical, and facility maintenance services by Hind Building Solutions (HBS), a Hindustan Projects company.",
  canonicalUrl: "https://hindbuilding.hindustanprojects.in",
  ogImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop"
};

export async function fetchHbsContent(): Promise<HbsContent> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/content`, {
      next: { revalidate: 60, tags: ["hbs-content"] },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return DEFAULT_HBS_CONTENT;
    const json = await res.json();
    return json.data || DEFAULT_HBS_CONTENT;
  } catch (err) {
    console.warn("fetchHbsContent fallback:", err);
    return DEFAULT_HBS_CONTENT;
  }
}

export async function fetchHbsServices(): Promise<HbsService[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/services`, {
      next: { revalidate: 60, tags: ["hbs-services"] },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchHbsServices fallback:", err);
    return [];
  }
}

export async function fetchHbsProjects(): Promise<HbsProject[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/projects`, {
      next: { revalidate: 60, tags: ["hbs-projects"] },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchHbsProjects fallback:", err);
    return [];
  }
}

export async function fetchHbsTestimonials(): Promise<HbsTestimonial[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hbs/testimonials`, {
      next: { revalidate: 60, tags: ["hbs-testimonials"] },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn("fetchHbsTestimonials fallback:", err);
    return [];
  }
}
