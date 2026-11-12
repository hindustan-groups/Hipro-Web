/**
 * Hind Build (HBS) Centralized SEO, OpenGraph & Social Sharing Architecture
 *
 * Designed to ensure 100% compliant Open Graph, Twitter Cards, and search engine
 * indexing across WhatsApp, Facebook, LinkedIn, Twitter/X, Telegram, Slack, and Google.
 */

export function isHbsSubdomainActive(): boolean {
  return process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
}

export function getHbsBaseUrl(): string {
  return isHbsSubdomainActive()
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in";
}

/**
 * Returns the exact canonical URL for any Hind Build path.
 * When on subdomain: https://hindbuilding.hindustanprojects.in[/subpath]
 * When on primary domain: https://www.hindustanprojects.in/hbs[/subpath]
 */
export function getHbsCanonicalUrl(subpath: string = ""): string {
  const cleanPath = subpath.replace(/^\/+/, "");
  if (isHbsSubdomainActive()) {
    return cleanPath
      ? `https://hindbuilding.hindustanprojects.in/${cleanPath}`
      : "https://hindbuilding.hindustanprojects.in";
  }
  return cleanPath
    ? `https://www.hindustanprojects.in/hbs/${cleanPath}`
    : "https://www.hindustanprojects.in/hbs";
}

export const HBS_DEFAULT_TITLE =
  "Hind Build | Building Repair, Maintenance & Protection";

export const HBS_DEFAULT_DESCRIPTION =
  "Professional building repair, waterproofing, painting, termite control, electrical, and facility maintenance services by Hind Build, a Hindustan Projects company.";

export const HBS_SEO_KEYWORDS = [
  "Hind Build",
  "Hind Building Solutions",
  "Hindustan Projects Hind Build",
  "Building Repair Bhilwara",
  "Waterproofing Services Bhilwara",
  "Water Leakage Solution Rajasthan",
  "RCC Column Strengthening Bhilwara",
  "Structure Repair Rajasthan",
  "Anti Termite Treatment Bhilwara",
  "Civil Maintenance Rajasthan",
  "Industrial Building Maintenance Bhilwara",
  "Roof Waterproofing Rajasthan",
  "Commercial Facility Maintenance",
  "HiPRO Hind Build",
];

export interface HbsOgImageMeta {
  url: string;
  secureUrl?: string;
  width: number;
  height: number;
  type: string;
  alt: string;
}

export function getHbsDefaultOgImage(): HbsOgImageMeta {
  const baseUrl = getHbsBaseUrl();
  const bannerUrl = `${baseUrl}/hbs-og-banner.jpg`;
  return {
    url: bannerUrl,
    secureUrl: bannerUrl,
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: "Hind Build — Complete Building Repair, Maintenance & Protection",
  };
}

/**
 * Resolves an OpenGraph image to a valid, absolute, scrapable JPG/PNG URL.
 * Automatically excludes SVGs (which WhatsApp/Facebook reject) and guarantees fallback to the official 1200x630 banner.
 */
export function resolveHbsOgImage(
  customImage?: string | null,
  altText?: string
): [HbsOgImageMeta, ...HbsOgImageMeta[]] {
  const defaultImage = getHbsDefaultOgImage();

  if (
    !customImage ||
    typeof customImage !== "string" ||
    customImage.trim() === "" ||
    customImage.endsWith(".svg") ||
    customImage.includes("hbs-og-default.svg")
  ) {
    return [defaultImage];
  }

  const isAbsolute =
    customImage.startsWith("http://") || customImage.startsWith("https://");
  const fullUrl = isAbsolute
    ? customImage
    : `${getHbsBaseUrl()}${customImage.startsWith("/") ? "" : "/"}${customImage}`;

  const isPng = fullUrl.toLowerCase().endsWith(".png");
  const isWebp = fullUrl.toLowerCase().endsWith(".webp");
  const mimeType = isPng ? "image/png" : isWebp ? "image/webp" : "image/jpeg";

  const resolvedCustom: HbsOgImageMeta = {
    url: fullUrl,
    secureUrl: fullUrl.startsWith("https://") ? fullUrl : undefined,
    width: 1200,
    height: 630,
    type: mimeType,
    alt: altText || "Hind Build — Specialized Building Services",
  };

  return [resolvedCustom, defaultImage];
}
