import { NextResponse } from "next/server";
import { fetchHbsServices, fetchHbsProjects } from "@/lib/hbsData";

export const dynamic = "force-dynamic";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return new Date().toISOString().split("T")[0];
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
}

export async function GET() {
  const baseUrl = "https://hindbuilding.hindustanprojects.in";
  const nowStr = new Date().toISOString().split("T")[0];

  const staticEntries: Array<{ url: string; lastmod: string; changefreq: string; priority: string }> = [
    { url: `${baseUrl}`, lastmod: nowStr, changefreq: "weekly", priority: "1.0" },
    { url: `${baseUrl}/about`, lastmod: nowStr, changefreq: "monthly", priority: "0.8" },
    { url: `${baseUrl}/services`, lastmod: nowStr, changefreq: "weekly", priority: "0.9" },
    { url: `${baseUrl}/projects`, lastmod: nowStr, changefreq: "weekly", priority: "0.8" },
    { url: `${baseUrl}/why-choose-us`, lastmod: nowStr, changefreq: "monthly", priority: "0.8" },
    { url: `${baseUrl}/contact`, lastmod: nowStr, changefreq: "monthly", priority: "0.8" },
    { url: `${baseUrl}/privacy-policy`, lastmod: nowStr, changefreq: "monthly", priority: "0.3" },
    { url: `${baseUrl}/terms`, lastmod: nowStr, changefreq: "monthly", priority: "0.3" },
  ];

  let serviceEntries: Array<{ url: string; lastmod: string; changefreq: string; priority: string }> = [];
  try {
    const services = await fetchHbsServices();
    serviceEntries = services
      .filter((s): s is typeof s & { slug: string } => s.active !== false && typeof s.slug === "string" && s.slug.trim().length > 0)
      .map((s) => ({
        url: `${baseUrl}/services/${encodeURIComponent(s.slug.trim())}`,
        lastmod: formatDate(s.updatedAt || s.createdAt),
        changefreq: "weekly",
        priority: "0.8",
      }));
  } catch (error) {
    console.error("HBS Sitemap: Failed to fetch services", error);
  }

  let projectEntries: Array<{ url: string; lastmod: string; changefreq: string; priority: string }> = [];
  try {
    const projects = await fetchHbsProjects();
    projectEntries = projects
      .filter((p): p is typeof p & { slug: string } => p.active !== false && typeof p.slug === "string" && p.slug.trim().length > 0)
      .map((p) => ({
        url: `${baseUrl}/projects/${encodeURIComponent(p.slug.trim())}`,
        lastmod: formatDate(p.updatedAt || p.createdAt),
        changefreq: "monthly",
        priority: "0.7",
      }));
  } catch (error) {
    console.error("HBS Sitemap: Failed to fetch projects", error);
  }

  // Deduplicate entries by url
  const seenUrls = new Set<string>();
  const allEntries = [...staticEntries, ...serviceEntries, ...projectEntries].filter((entry) => {
    if (seenUrls.has(entry.url)) return false;
    seenUrls.add(entry.url);
    return true;
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (e) => `  <url>
    <loc>${escapeXml(e.url)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
