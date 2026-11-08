/**
 * HiPRO Project URL & Slug Normalization Utility (TASK-P0-2B)
 *
 * Provides authoritative, unified URL generation and slug sanitization
 * across all project consumers (Metadata, Canonical tags, OpenGraph,
 * Schema.org JSON-LD, XML Sitemap, and internal project cards).
 */

export const HIPRO_BASE_URL = "https://www.hindustanprojects.in";

/**
 * Normalizes a raw project slug or route parameter.
 *
 * Rules:
 * - Accepts string, null, or undefined
 * - Trims whitespace
 * - Strips single, multiple, leading, and trailing slashes
 * - Repeatedly strips any leading "projects/" or "projects" prefix (case-insensitive)
 * - Rejects malformed values (path traversal '..', spaces, control chars, HTML/script injections)
 * - Preserves existing valid canonical slugs
 * - Returns empty string "" for invalid/empty input to prevent generating malformed URLs
 */
export function normalizeProjectSlug(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") {
    return "";
  }

  let s = raw.trim();
  if (!s) {
    return "";
  }

  // Strip leading and trailing slashes repeatedly
  s = s.replace(/^\/+|\/+$/g, "");

  // Repeatedly strip any leading "projects/" or "projects" prefix (case-insensitive)
  while (/^projects(\/|$)/i.test(s)) {
    s = s.replace(/^projects\/?/i, "").replace(/^\/+|\/+$/g, "");
  }

  if (!s) {
    return "";
  }

  // Reject path traversal, script injection, and invalid URI characters
  if (s.includes("..") || /[<>\"\'`\\^~|{}[\]\s]/.test(s)) {
    return "";
  }

  return s.toLowerCase();
}

/**
 * Checks if a string is a valid, clean project slug.
 */
export function isValidProjectSlug(slug: string | null | undefined): boolean {
  if (!slug || typeof slug !== "string") return false;
  const normalized = normalizeProjectSlug(slug);
  return normalized.length > 0 && normalized === slug.toLowerCase();
}

/**
 * Constructs an absolute canonical URL for a project.
 *
 * Returns null if the slug is missing or malformed to prevent
 * emitting bare `https://www.hindustanprojects.in/projects/` as a canonical URL.
 */
export function buildProjectCanonicalUrl(rawSlugOrId: string | null | undefined): string | null {
  const cleanSlug = normalizeProjectSlug(rawSlugOrId);
  if (!cleanSlug) {
    return null;
  }
  return `${HIPRO_BASE_URL}/projects/${cleanSlug}`;
}

/**
 * Constructs a safe internal navigation href for a project card.
 *
 * Falls back to project ID if slug is empty, and returns null if both are invalid.
 */
export function buildProjectHref(
  rawSlug: string | null | undefined,
  fallbackId?: string | null | undefined
): string | null {
  const cleanSlug = normalizeProjectSlug(rawSlug);
  if (cleanSlug) {
    return `/projects/${cleanSlug}`;
  }
  const cleanId = normalizeProjectSlug(fallbackId);
  if (cleanId) {
    return `/projects/${cleanId}`;
  }
  return null;
}
