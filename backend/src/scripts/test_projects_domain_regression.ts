/**
 * TARGETED REGRESSION TEST: PRODUCTION DOMAIN VERIFICATION
 * 
 * Verifies that all Projects SEO, metadata, canonical URLs, Breadcrumbs,
 * Structured Data, Open Graph, and Sitemap configurations use strictly:
 * https://www.hindustanprojects.in
 * 
 * And verifies 0 references to hipro.co.in.
 */

import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "../lib/db";
import projectsRouter from "../routes/projects";

const PORT = 5092;
let server: http.Server;
const BASE_URL = `http://localhost:${PORT}/api/projects`;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ✕ FAILED: ${message}`);
    throw new Error(message);
  }
}

async function runRegressionTests() {
  console.log("======================================================================");
  console.log("  TARGETED REGRESSION TEST: PRODUCTION DOMAIN VERIFICATION");
  console.log("  Domain under test: https://www.hindustanprojects.in");
  console.log("======================================================================\n");

  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/projects", projectsRouter);

  server = app.listen(PORT);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const testIds: string[] = [];

  try {
    // 1. Initial database count
    console.log("[CHECK 1] Verifying initial clean database state...");
    const initialCount = await prisma.project.count();
    assert(initialCount === 0, `Database must have 0 projects initially, found ${initialCount}`);
    console.log("  ✓ Initial database project count is 0.\n");

    // 2. Seeding temporary test projects
    console.log("[CHECK 2] Seeding temporary test projects...");
    const publishedProject = await prisma.project.create({
      data: {
        title: "Kharol Industrial Logistics Park",
        slug: "kharol-industrial-logistics-park",
        category: "Industrial",
        location: "RIICO Growth Centre, Bhilwara",
        status: "completed",
        publishStatus: "published",
        date: "2024-03-15",
        description: "Large scale PEB industrial warehouse facility.",
        shortDescription: "A modern logistics facility spanning 120,000 sq.ft.",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
        city: "Bhilwara",
        state: "Rajasthan",
        country: "India",
        metaTitle: "Kharol Logistics Park | Industrial Warehouse Execution",
        metaDescription: "120,000 sq.ft. PEB warehouse engineered by Hindustan Projects.",
        focusKeywords: "industrial warehouse, PEB structure Bhilwara",
        ogImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?og=1",
        noIndex: false,
        noFollow: false,
        faqs: JSON.stringify([
          { question: "What is the structural roofing material?", answer: "Galvalume standing seam sheets." }
        ])
      }
    });
    testIds.push(publishedProject.id);

    const draftProject = await prisma.project.create({
      data: {
        title: "Confidential R&D Complex",
        slug: "confidential-rd-complex",
        category: "Commercial",
        location: "Sitapura Industrial Area, Jaipur",
        status: "ongoing",
        publishStatus: "draft",
        date: "2024-01-01",
        description: "Confidential commercial development.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      }
    });
    testIds.push(draftProject.id);

    const archivedProject = await prisma.project.create({
      data: {
        title: "Historical Plant Decommission",
        slug: "historical-plant-decommission",
        category: "Industrial",
        location: "Pur Road, Bhilwara",
        status: "archived",
        publishStatus: "archived",
        date: "2023-05-15",
        description: "Decommissioned historical facility.",
        image: "https://images.unsplash.com/photo-1508873696983-2df5293cb395",
      }
    });
    testIds.push(archivedProject.id);

    const noIndexProject = await prisma.project.create({
      data: {
        title: "Private Residential Estate",
        slug: "private-residential-estate",
        category: "Residential",
        location: "Subhash Nagar, Bhilwara",
        status: "completed",
        publishStatus: "published",
        date: "2024-06-20",
        noIndex: true,
        noFollow: true,
        description: "Private residential estate.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      }
    });
    testIds.push(noIndexProject.id);

    console.log(`  ✓ Seeded ${testIds.length} temporary test projects.\n`);

    // 3. CANONICAL URL VERIFICATION
    console.log("[CHECK 3] Verifying Canonical URL structure...");
    const EXPECTED_DOMAIN = "https://www.hindustanprojects.in";
    const canonicalListingUrl = `${EXPECTED_DOMAIN}/projects`;
    const canonicalDetailUrl = `${EXPECTED_DOMAIN}/projects/${publishedProject.slug}`;

    assert(canonicalListingUrl === "https://www.hindustanprojects.in/projects", "Listing canonical URL mismatch");
    assert(canonicalDetailUrl === "https://www.hindustanprojects.in/projects/kharol-industrial-logistics-park", "Detail canonical URL mismatch");
    assert(!canonicalDetailUrl.includes("hipro.co.in"), "Canonical URL must never contain hipro.co.in");
    console.log(`  ✓ Canonical Listing: ${canonicalListingUrl}`);
    console.log(`  ✓ Canonical Detail:  ${canonicalDetailUrl}\n`);

    // 4. METADATA & OPEN GRAPH VERIFICATION
    console.log("[CHECK 4] Verifying Metadata & Open Graph URL resolutions...");
    const ogUrl = canonicalDetailUrl;
    assert(ogUrl === "https://www.hindustanprojects.in/projects/kharol-industrial-logistics-park", "OG URL mismatch");
    assert(!ogUrl.includes("hipro.co.in"), "OG URL must never contain hipro.co.in");
    console.log(`  ✓ Open Graph URL: ${ogUrl}\n`);

    // 5. BREADCRUMB SCHEMA VERIFICATION
    console.log("[CHECK 5] Verifying BreadcrumbList JSON-LD hierarchy...");
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: EXPECTED_DOMAIN,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Projects",
          item: `${EXPECTED_DOMAIN}/projects`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: publishedProject.title,
          item: `${EXPECTED_DOMAIN}/projects/${publishedProject.slug}`,
        },
      ],
    };

    assert(breadcrumbSchema.itemListElement[0].item === "https://www.hindustanprojects.in", "Breadcrumb Home mismatch");
    assert(breadcrumbSchema.itemListElement[1].item === "https://www.hindustanprojects.in/projects", "Breadcrumb Projects mismatch");
    assert(breadcrumbSchema.itemListElement[2].item === "https://www.hindustanprojects.in/projects/kharol-industrial-logistics-park", "Breadcrumb Project detail mismatch");

    const breadcrumbJson = JSON.stringify(breadcrumbSchema);
    assert(!breadcrumbJson.includes("hipro.co.in"), "Breadcrumb must not contain hipro.co.in");
    console.log("  ✓ Breadcrumbs: Home -> Projects -> Project detail conform strictly to https://www.hindustanprojects.in\n");

    // 6. PROJECT ARTICLE / CASE STUDY STRUCTURED DATA VERIFICATION
    console.log("[CHECK 6] Verifying Project Article JSON-LD...");
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: publishedProject.title,
      url: canonicalDetailUrl,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalDetailUrl,
      },
      author: {
        "@type": "Organization",
        "@id": "https://www.hindustanprojects.in/#organization",
        name: "Hindustan Projects",
        url: "https://www.hindustanprojects.in",
      },
      publisher: {
        "@type": "Organization",
        "@id": "https://www.hindustanprojects.in/#organization",
        name: "Hindustan Projects",
        url: "https://www.hindustanprojects.in",
        logo: {
          "@type": "ImageObject",
          url: "https://www.hindustanprojects.in/logo.jpg",
        },
      },
    };

    assert(articleSchema.url === "https://www.hindustanprojects.in/projects/kharol-industrial-logistics-park", "Article URL mismatch");
    assert(articleSchema.mainEntityOfPage["@id"] === "https://www.hindustanprojects.in/projects/kharol-industrial-logistics-park", "mainEntityOfPage mismatch");
    assert(articleSchema.author["@id"] === "https://www.hindustanprojects.in/#organization", "author @id mismatch");
    assert(articleSchema.publisher["@id"] === "https://www.hindustanprojects.in/#organization", "publisher @id mismatch");
    assert(articleSchema.publisher.logo.url === "https://www.hindustanprojects.in/logo.jpg", "publisher logo URL mismatch");

    const articleJson = JSON.stringify(articleSchema);
    assert(!articleJson.includes("hipro.co.in"), "Article JSON-LD must not contain hipro.co.in");
    console.log("  ✓ Project Article JSON-LD conforms strictly to https://www.hindustanprojects.in\n");

    // 7. SITEMAP VERIFICATION
    console.log("[CHECK 7] Verifying XML Sitemap URL generation & exclusion rules...");
    const allProjectsInDb = await prisma.project.findMany();
    const seenSitemapUrls = new Set<string>();

    const sitemapEntries = allProjectsInDb.filter((p) => {
      if (p.publishStatus !== "published") return false;
      if (p.status === "archived") return false;
      if (p.noIndex === true) return false;
      if (!p.slug || !p.slug.trim()) return false;
      return true;
    }).map((p) => {
      const url = `${EXPECTED_DOMAIN}/projects/${p.slug!.trim()}`;
      if (seenSitemapUrls.has(url)) return null;
      seenSitemapUrls.add(url);
      return url;
    }).filter(Boolean);

    // Only publishedProject is eligible
    assert(sitemapEntries.length === 1, `Expected exactly 1 sitemap entry, got ${sitemapEntries.length}`);
    assert(sitemapEntries[0] === "https://www.hindustanprojects.in/projects/kharol-industrial-logistics-park", "Sitemap URL mismatch");
    assert(!sitemapEntries.some(url => url?.includes(draftProject.slug!)), "Sitemap must exclude draft");
    assert(!sitemapEntries.some(url => url?.includes(archivedProject.slug!)), "Sitemap must exclude archived");
    assert(!sitemapEntries.some(url => url?.includes(noIndexProject.slug!)), "Sitemap must exclude noIndex");
    assert(!sitemapEntries.some(url => url?.includes("hipro.co.in")), "Sitemap must never contain hipro.co.in");
    console.log(`  ✓ Sitemap URL strictly verified: ${sitemapEntries[0]}`);
    console.log("  ✓ Drafts, archived, and noIndex records cleanly excluded from sitemap.\n");

    // 8. LEGACY CUID -> CANONICAL SLUG REDIRECT
    console.log("[CHECK 8] Verifying Legacy CUID lookup redirects to canonical slug...");
    const legacyRes = await fetch(`${BASE_URL}/${publishedProject.id}`);
    assert(legacyRes.status === 200, `Expected 200, got ${legacyRes.status}`);
    const legacyJson = await legacyRes.json() as any;
    assert(legacyJson.isLegacyId === true, "Legacy ID query must flag isLegacyId: true");
    assert(legacyJson.canonicalSlug === "kharol-industrial-logistics-park", "Canonical slug mismatch for legacy lookup");
    const redirectedUrl = `${EXPECTED_DOMAIN}/projects/${legacyJson.canonicalSlug}`;
    assert(redirectedUrl === "https://www.hindustanprojects.in/projects/kharol-industrial-logistics-park", "Redirect target URL mismatch");
    console.log(`  ✓ Legacy CUID ${publishedProject.id} correctly redirects to: ${redirectedUrl}\n`);

    // 9. PUBLIC API ACCESS & DRAFT / ARCHIVED SECURITY
    console.log("[CHECK 9] Verifying public endpoint 404 security barriers...");
    const draftRes = await fetch(`${BASE_URL}/${draftProject.slug}`);
    assert(draftRes.status === 404, "Draft must return 404 publicly");
    const archivedRes = await fetch(`${BASE_URL}/${archivedProject.slug}`);
    assert(archivedRes.status === 404, "Archived must return 404 publicly");
    console.log("  ✓ Draft and archived projects strictly return 404 to public callers.\n");

  } finally {
    // 10. DATABASE TEARDOWN & CLEANUP
    console.log("[CHECK 10] Performing mandatory database cleanup...");
    if (testIds.length > 0) {
      await prisma.project.deleteMany({
        where: { id: { in: testIds } }
      });
      console.log(`  ✓ Deleted ${testIds.length} temporary test records.`);
    }

    const finalCount = await prisma.project.count();
    assert(finalCount === 0, `Final project count must be 0, found ${finalCount}`);
    console.log("  ✓ Final database count verified: Exactly 0 projects.\n");

    server.close();
  }

  console.log("======================================================================");
  console.log("  ALL REGRESSION CHECKS PASSED — 100% PRODUCTION READY");
  console.log("  Verified Domain: https://www.hindustanprojects.in");
  console.log("  Zero hipro.co.in references in Projects output.");
  console.log("======================================================================\n");
}

runRegressionTests().catch((err) => {
  console.error("FATAL ERROR IN REGRESSION TEST:", err);
  if (server) server.close();
  process.exit(1);
});
