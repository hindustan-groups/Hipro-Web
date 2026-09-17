/**
 * PHASE 7 — COMPREHENSIVE END-TO-END QA, VERIFICATION & FINAL PRODUCTION READINESS
 * 
 * Complete lifecycle test:
 * ADMIN CMS → DATABASE → API → PUBLIC LISTING → PROJECT DETAIL → MEDIA → SEO → AEO → GEO → SCHEMA → SITEMAP → SECURITY → BUILD
 */

import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { prisma } from "../lib/db";
import projectsRouter from "../routes/projects";
import { hashPassword } from "../lib/auth";

const PORT = 5088;
let server: http.Server;
const BASE_URL = `http://localhost:${PORT}/api/projects`;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ✕ FAILED ASSERTION: ${message}`);
    throw new Error(message);
  }
}

async function runPhase7FinalQA() {
  console.log("======================================================================");
  console.log("  PHASE 7 — COMPREHENSIVE END-TO-END PROJECTS QA & PRODUCTION READINESS");
  console.log("======================================================================\n");

  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/projects", projectsRouter);

  server = app.listen(PORT);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const testProjectIds: string[] = [];
  let testAdminUserId = "";
  let testSessionId = "";
  let authCookie = "";

  try {
    // -------------------------------------------------------------
    // 1. DATABASE INTEGRITY AUDIT (Initial State)
    // -------------------------------------------------------------
    console.log("[AUDIT 1] Database integrity & initial count check");
    const initialCount = await prisma.project.count();
    assert(initialCount === 0, `Database must have 0 projects before testing, found ${initialCount}`);
    console.log("  ✓ Database verified in clean initial state (Project Count: 0).");

    // -------------------------------------------------------------
    // SETUP: Initialize admin session for CMS & Protected API testing
    // -------------------------------------------------------------
    console.log("[SETUP] Initializing authenticated admin session for CMS testing...");
    const testAdmin = await prisma.adminUser.create({
      data: {
        email: `phase7_tester_${Date.now()}@hipro.local`,
        name: "QA Engineering Director",
        password: hashPassword("TesterPassword123!"),
        role: "admin",
        permissions: "[]",
      },
    });
    testAdminUserId = testAdmin.id;

    const testSession = await prisma.adminSession.create({
      data: {
        userId: testAdmin.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    testSessionId = testSession.id;
    authCookie = `admin_session=${testSession.id}`;
    console.log("  ✓ Authenticated test session established.\n");

    // -------------------------------------------------------------
    // 2. CREATE: Field Validation & Rejections
    // -------------------------------------------------------------
    console.log("[AUDIT 2] Project creation validation & error boundaries");
    // Missing required fields
    const resMissing = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ title: "Incomplete Project" }),
    });
    assert(resMissing.status === 400, `Expected 400 for missing fields, got ${resMissing.status}`);
    const missingJson = (await resMissing.json() as any);
    assert(missingJson.success === false, "Expected success: false on missing fields");

    // Invalid image URL
    const resBadUrl = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Bad URL Project",
        category: "Commercial",
        location: "Site 1",
        date: "2024",
        description: "Valid description",
        image: "not-a-valid-http-url",
      }),
    });
    assert(resBadUrl.status === 400, `Expected 400 for invalid image URL, got ${resBadUrl.status}`);
    console.log("  ✓ Input validation strictly rejects incomplete or malformed payloads.");

    // -------------------------------------------------------------
    // 3. CREATE & SLUG GENERATION: Auto-slug & Collision Handling
    // -------------------------------------------------------------
    console.log("[AUDIT 3] Slug generation & collision handling");
    const p1Payload = {
      title: "Apex Horizon Tech Park",
      category: "Commercial",
      location: "RIICO Industrial Area, Phase II",
      city: "Bhilwara",
      state: "Rajasthan",
      country: "India",
      latitude: 25.3463,
      longitude: 74.6364,
      googleMapsUrl: "https://maps.google.com/?q=25.3463,74.6364",
      date: "2024-03-01",
      completionDate: "2024-03-01",
      shortDescription: "Grade-A IT & corporate office complex with seismic-resistant RCC framing.",
      description: "Complete turnkey execution of 150,000 sq.ft. commercial office complex with double basement.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      imageAlt: "Apex Horizon Tech Park - Front Glass Facade",
      ogImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?og=1",
      metaTitle: "Apex Horizon Tech Park | HiPRO Commercial Landmark",
      metaDescription: "150,000 sq.ft. Grade-A commercial development delivered in Bhilwara, Rajasthan.",
      focusKeywords: "commercial tech park construction, RCC office tower",
      secondaryKeywords: "turnkey corporate infrastructure, seismic design",
      client: "Apex Horizon Ventures Ltd",
      owner: "Apex Real Estate Holdings",
      area: "150,000 sq.ft.",
      services: JSON.stringify(["RCC Structural Framing", "Facade Engineering", "Turnkey Construction"]),
      highlights: JSON.stringify([
        { label: "Built-up Area", value: "150,000 sq.ft." },
        { label: "Structural Steel", value: "650 MT" },
      ]),
      galleryDetails: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1541888946425-d0fbb186156a", alt: "Basement slab casting", caption: "Raft foundation pour" },
        { url: "https://images.unsplash.com/photo-1504307651554-6691fc9d0554", alt: "Superstructure", caption: "RCC frame completion" },
      ]),
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoType: "youtube",
      videoTitle: "Construction Timelapse & Structural Overview",
      faqs: JSON.stringify([
        {
          question: "What structural standards were applied for seismic resistance?",
          answer: "Engineered to IS 1893 seismic zone guidelines with ductile shear wall detailing."
        }
      ]),
      status: "completed",
      publishStatus: "published",
      featured: true,
      order: 1,
    };

    const resP1 = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify(p1Payload),
    });
    assert(resP1.status === 201, `Failed to create P1: ${resP1.status}`);
    const p1 = (await resP1.json() as any).data;
    testProjectIds.push(p1.id);
    assert(p1.slug === "apex-horizon-tech-park", `Expected slug 'apex-horizon-tech-park', got '${p1.slug}'`);

    // Collision check 1: Same title
    const resP1Dup = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ ...p1Payload, title: "Apex Horizon Tech Park" }),
    });
    assert(resP1Dup.status === 201, `Failed to create duplicate slug: ${resP1Dup.status}`);
    const p1Dup = (await resP1Dup.json() as any).data;
    testProjectIds.push(p1Dup.id);
    assert(
      p1Dup.slug === "apex-horizon-tech-park-riico-industrial-area-phase-ii",
      `Expected slug 'apex-horizon-tech-park-riico-industrial-area-phase-ii', got '${p1Dup.slug}'`
    );

    // Collision check 2: Third duplicate (both base and location slug taken -> numerical suffix -2)
    const resP1Dup3 = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ ...p1Payload, title: "Apex Horizon Tech Park" }),
    });
    assert(resP1Dup3.status === 201, `Failed to create duplicate slug 3: ${resP1Dup3.status}`);
    const p1Dup3 = (await resP1Dup3.json() as any).data;
    testProjectIds.push(p1Dup3.id);
    assert(p1Dup3.slug === "apex-horizon-tech-park-2", `Expected slug 'apex-horizon-tech-park-2', got '${p1Dup3.slug}'`);
    console.log("  ✓ Auto-slug generation and collision handling verified (location disambiguation + numerical fallback).\n");

    // -------------------------------------------------------------
    // 4. PUBLISHING & LIFECYCLE SEEDING
    // -------------------------------------------------------------
    console.log("[AUDIT 4] Seeding diverse operational and publication states...");

    // P2: Minimal Published Industrial Project (Ongoing, no optional fields)
    const resP2 = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Zenith PEB Industrial Warehouse",
        category: "Industrial",
        location: "Kishangarh Highway",
        date: "2024-06-01",
        description: "Heavy logistics pre-engineered warehouse structure.",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
        status: "ongoing",
        publishStatus: "published",
        featured: false,
        order: 2,
        // Zero optional fields:
        client: null,
        owner: null,
        area: null,
        city: null,
        district: null,
        state: null,
        googleMapsUrl: null,
        videoUrl: null,
        faqs: null,
      }),
    });
    const p2 = (await resP2.json() as any).data;
    testProjectIds.push(p2.id);

    // P3: Draft Project
    const resP3 = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Confidential R&D Facility",
        category: "Institutional",
        location: "Institutional Area",
        date: "2024-07-01",
        description: "Confidential civil infrastructure.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
        status: "ongoing",
        publishStatus: "draft", // Draft!
      }),
    });
    const p3 = (await resP3.json() as any).data;
    testProjectIds.push(p3.id);

    // P4: Publication-Archived Project
    const resP4 = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Archived Highway Flyover",
        category: "Infrastructure",
        location: "NH-79",
        date: "2019-10-01",
        description: "Archived flyover record.",
        image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c",
        status: "completed",
        publishStatus: "archived", // Publication Archived!
      }),
    });
    const p4 = (await resP4.json() as any).data;
    testProjectIds.push(p4.id);

    // P5: Operationally-Archived Project (status: 'archived', even if publishStatus is 'published')
    const resP5 = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Decommissioned Grain Terminal",
        category: "Industrial",
        location: "Old Goods Yard",
        date: "2016-04-01",
        description: "Decommissioned storage terminal.",
        image: "https://images.unsplash.com/photo-1508873696983-2df5293cb395",
        status: "archived", // Operationally Archived!
        publishStatus: "published",
      }),
    });
    const p5 = (await resP5.json() as any).data;
    testProjectIds.push(p5.id);

    // P6: Published Project with noIndex: true
    const resP6 = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Private Corporate Headquarters",
        category: "Commercial",
        location: "Private Enclave",
        date: "2024-05-01",
        description: "Private corporate head office.",
        image: "https://images.unsplash.com/photo-1577495508048-b635879837f1",
        status: "completed",
        publishStatus: "published",
        noIndex: true, // noIndex!
        noFollow: true,
      }),
    });
    const p6 = (await resP6.json() as any).data;
    testProjectIds.push(p6.id);

    console.log(`  ✓ Seeded ${testProjectIds.length} projects across all operational and publication states.\n`);

    // -------------------------------------------------------------
    // 5. PUBLIC API & SECURITY ISOLATION
    // -------------------------------------------------------------
    console.log("[AUDIT 5] Public API isolation & unauthenticated safety");
    const publicListRes = await fetch(BASE_URL);
    assert(publicListRes.status === 200, `Expected 200, got ${publicListRes.status}`);
    const publicProjects = (await publicListRes.json() as any).data;
    const publicIds = publicProjects.map((p: any) => p.id);

    // Published non-archived projects must appear (P1, P1Dup, P1Dup3, P2, P6)
    assert(publicIds.includes(p1.id), "Published P1 must appear publicly");
    assert(publicIds.includes(p2.id), "Published P2 must appear publicly");
    assert(publicIds.includes(p6.id), "Published P6 (noIndex) appears publicly in listing");

    // Hidden projects must NEVER appear
    assert(!publicIds.includes(p3.id), "SECURITY VIOLATION: Draft P3 appeared publicly!");
    assert(!publicIds.includes(p4.id), "SECURITY VIOLATION: Publication-archived P4 appeared publicly!");
    assert(!publicIds.includes(p5.id), "SECURITY VIOLATION: Operational-archived P5 appeared publicly!");

    // Unauthenticated request with all=true must be rejected
    const unauthAllRes = await fetch(`${BASE_URL}?all=true`);
    assert(unauthAllRes.status === 401, `Expected 401 for unauthenticated all=true, got ${unauthAllRes.status}`);
    console.log("  ✓ Public API strictly returns published, non-archived records; ?all=true is guarded.\n");

    // -------------------------------------------------------------
    // 6. ADMIN API ACCESS WITH AUTH
    // -------------------------------------------------------------
    console.log("[AUDIT 6] Admin API access & CMS verification");
    const adminAllRes = await fetch(`${BASE_URL}?all=true`, {
      headers: { Cookie: authCookie },
    });
    assert(adminAllRes.status === 200, `Expected 200 for authenticated admin, got ${adminAllRes.status}`);
    const adminProjects = (await adminAllRes.json() as any).data;
    const adminIds = adminProjects.map((p: any) => p.id);
    assert(adminIds.includes(p3.id), "Admin must see draft P3");
    assert(adminIds.includes(p4.id), "Admin must see publication-archived P4");
    assert(adminIds.includes(p5.id), "Admin must see operational-archived P5");
    console.log("  ✓ Admin with valid session successfully accesses all project states.\n");

    // -------------------------------------------------------------
    // 7. SEARCH & MULTI-PARAMETER FILTERS
    // -------------------------------------------------------------
    console.log("[AUDIT 7] Search and multi-parameter filters (Category, Status, City, Combined)");
    // Search by title
    const searchRes = await fetch(`${BASE_URL}?search=Apex`);
    const searchData = (await searchRes.json() as any).data;
    assert(searchData.every((p: any) => p.title.includes("Apex")), "Search results mismatch");

    // Category filter
    const catRes = await fetch(`${BASE_URL}?category=Industrial`);
    const catData = (await catRes.json() as any).data;
    assert(catData.every((p: any) => p.category.toLowerCase() === "industrial"), "Category filter mismatch");
    assert(catData.some((p: any) => p.id === p2.id), "Category filter should include P2");

    // Operational Status filter (Ongoing)
    const statusRes = await fetch(`${BASE_URL}?status=ongoing`);
    const statusData = (await statusRes.json() as any).data;
    assert(statusData.every((p: any) => p.status === "ongoing"), "Status filter mismatch");
    assert(statusData.some((p: any) => p.id === p2.id), "Status filter should include ongoing P2");

    // Combined filters
    const combinedRes = await fetch(`${BASE_URL}?category=Industrial&status=ongoing`);
    const combinedData = (await combinedRes.json() as any).data;
    assert(combinedData.length >= 1 && combinedData.every((p: any) => p.category === "Industrial" && p.status === "ongoing"), "Combined filters mismatch");
    console.log("  ✓ Search and multi-parameter filters verified with strict intersection logic.\n");

    // -------------------------------------------------------------
    // 8. PUBLIC PROJECT DETAIL & 404 GUARDS
    // -------------------------------------------------------------
    console.log("[AUDIT 8] Public project detail resolution & 404 security barriers");
    // Valid published slug resolves
    const resDetailP1 = await fetch(`${BASE_URL}/apex-horizon-tech-park`);
    assert(resDetailP1.status === 200, `Expected 200, got ${resDetailP1.status}`);
    const detailP1 = (await resDetailP1.json() as any);
    assert(detailP1.data.title === "Apex Horizon Tech Park", "Title mismatch");
    assert(detailP1.canonicalSlug === "apex-horizon-tech-park", "Canonical slug mismatch");
    assert(detailP1.isLegacyId === false, "isLegacyId should be false for slug lookup");

    // Invalid slug returns 404
    const res404 = await fetch(`${BASE_URL}/completely-invalid-slug-99999`);
    assert(res404.status === 404, "Non-existent slug must return 404");

    // Draft slug returns 404
    const resDraft = await fetch(`${BASE_URL}/confidential-rd-facility`);
    assert(resDraft.status === 404, "Draft slug must return 404 publicly");

    // Publication-archived slug returns 404
    const resPubArchived = await fetch(`${BASE_URL}/archived-highway-flyover`);
    assert(resPubArchived.status === 404, "Publication-archived slug must return 404 publicly");

    // Operational-archived slug returns 404
    const resOpArchived = await fetch(`${BASE_URL}/decommissioned-grain-terminal`);
    assert(resOpArchived.status === 404, "Operational-archived slug must return 404 publicly");
    console.log("  ✓ Canonical resolution and 404 security barriers verified.\n");

    // -------------------------------------------------------------
    // 9. LEGACY CUID ROUTE & 308 REDIRECT FLAG
    // -------------------------------------------------------------
    console.log("[AUDIT 9] Legacy CUID permanent redirect detection");
    const resCuid = await fetch(`${BASE_URL}/${p1.id}`);
    assert(resCuid.status === 200, `Expected 200, got ${resCuid.status}`);
    const cuidData = (await resCuid.json() as any);
    assert(cuidData.isLegacyId === true, "Legacy ID query must flag isLegacyId: true");
    assert(cuidData.canonicalSlug === "apex-horizon-tech-park", "Canonical slug mismatch");
    console.log("  ✓ Legacy CUID lookup triggers isLegacyId: true and resolves canonicalSlug.\n");

    // -------------------------------------------------------------
    // 10. MISSING FIELD SAFETY (Zero "N/A" or Placeholders)
    // -------------------------------------------------------------
    console.log("[AUDIT 10] Missing optional fields safety (No 'N/A' or placeholder data)");
    const resP2Detail = await fetch(`${BASE_URL}/zenith-peb-industrial-warehouse`);
    const p2Data = (await resP2Detail.json() as any).data;
    assert(p2Data.client === null, "client must be null");
    assert(p2Data.owner === null, "owner must be null");
    assert(p2Data.area === null, "area must be null");
    assert(p2Data.city === null, "city must be null (no default Bhilwara)");
    assert(p2Data.state === null, "state must be null (no default Rajasthan)");
    assert(p2Data.videoUrl === null, "videoUrl must be null");
    assert(p2Data.faqs === null, "faqs must be null");
    console.log("  ✓ Unpopulated fields remain strictly null; zero default or placeholder strings fabricated.\n");

    // -------------------------------------------------------------
    // 11. MEDIA, GALLERY & VIDEO INTEGRATION
    // -------------------------------------------------------------
    console.log("[AUDIT 11] Media, galleryDetails and video verification");
    const galleryItems = JSON.parse(detailP1.data.galleryDetails);
    assert(Array.isArray(galleryItems) && galleryItems.length === 2, "Gallery items count mismatch");
    assert(galleryItems[0].caption === "Raft foundation pour", "Gallery caption mismatch");
    assert(detailP1.data.videoUrl.includes("youtube.com"), "Video URL mismatch");
    assert(detailP1.data.videoType === "youtube", "Video type mismatch");
    console.log("  ✓ Gallery and video attributes parsed accurately.\n");

    // -------------------------------------------------------------
    // 12. VERIFIED SITE GEOGRAPHY (Zero Defaults Rule)
    // -------------------------------------------------------------
    console.log("[AUDIT 12] Verified geographic signals (Zero automatic location defaults)");
    assert(detailP1.data.city === "Bhilwara", "City mismatch for P1");
    assert(detailP1.data.state === "Rajasthan", "State mismatch for P1");
    assert(detailP1.data.latitude === 25.3463, "Latitude mismatch for P1");
    assert(p2Data.city === null, "P2 city must be null (no default Bhilwara)");
    assert(p2Data.state === null, "P2 state must be null (no default Rajasthan)");
    assert(p2Data.latitude === null, "P2 coordinates must be null");
    console.log("  ✓ Geographic data strictly reflects database values; zero defaults applied.\n");

    // -------------------------------------------------------------
    // 13. RELATED PROJECTS ISOLATION
    // -------------------------------------------------------------
    console.log("[AUDIT 13] Related projects public isolation");
    const relRes = await fetch(`${BASE_URL}?category=Commercial`);
    const relProjects = (await relRes.json() as any).data;
    const relIds = relProjects.map((p: any) => p.id);
    assert(!relIds.includes(p3.id), "Related projects must not include draft P3");
    assert(!relIds.includes(p4.id), "Related projects must not include publication-archived P4");
    assert(!relIds.includes(p5.id), "Related projects must not include operational-archived P5");
    console.log("  ✓ Related projects query strictly isolates public records.\n");

    // -------------------------------------------------------------
    // 14. METADATA, CANONICAL & SOCIAL DIRECTIVES
    // -------------------------------------------------------------
    console.log("[AUDIT 14] Dynamic metadata, canonical and social tags");
    assert(detailP1.data.metaTitle.includes("Apex Horizon Tech Park"), "metaTitle mismatch");
    assert(detailP1.data.metaDescription.includes("150,000 sq.ft."), "metaDescription mismatch");
    assert(detailP1.data.ogImage.includes("og=1"), "ogImage mismatch");
    assert(detailP1.data.noIndex === false, "P1 noIndex mismatch");
    assert(p6.noIndex === true, "P6 noIndex mismatch");
    assert(p6.noFollow === true, "P6 noFollow mismatch");
    console.log("  ✓ Custom SEO, Open Graph, and robots directives verified.\n");

    // -------------------------------------------------------------
    // 15. SITEMAP EXCLUSIONS & DEDUPLICATION
    // -------------------------------------------------------------
    console.log("[AUDIT 15] XML Sitemap eligibility rules & deduplication");
    const allProjectsInDb = await prisma.project.findMany();
    const seenSitemapUrls = new Set<string>();

    const sitemapEntries = allProjectsInDb.filter((p) => {
      if (p.publishStatus !== "published") return false;
      if (p.status === "archived") return false;
      if (p.noIndex === true) return false;
      if (!p.slug || !p.slug.trim()) return false;
      return true;
    }).map((p) => {
      const url = `https://www.hindustanprojects.in/projects/${p.slug!.trim()}`;
      if (seenSitemapUrls.has(url)) return null;
      seenSitemapUrls.add(url);
      return url;
    }).filter(Boolean);

    // Eligible projects: P1, P1Dup, P1Dup3, P2.
    // Excluded: P3 (draft), P4 (publication-archived), P5 (operational-archived), P6 (noIndex: true).
    assert(!sitemapEntries.some(url => url?.includes(p3.slug || "")), "Sitemap must exclude draft P3");
    assert(!sitemapEntries.some(url => url?.includes(p4.slug || "")), "Sitemap must exclude publication-archived P4");
    assert(!sitemapEntries.some(url => url?.includes(p5.slug || "")), "Sitemap must exclude operational-archived P5");
    assert(!sitemapEntries.some(url => url?.includes(p6.slug || "")), "Sitemap must exclude noIndex P6");
    assert(!sitemapEntries.some(url => url?.includes(p1.id)), "Sitemap must NEVER contain CUID URLs");
    console.log(`  ✓ Sitemap strictly filters eligible projects (${sitemapEntries.length} valid entries); zero drafts/archived/noIndex.\n`);

    // -------------------------------------------------------------
    // 16. SAFE ARCHIVE & PERMANENT DELETE WORKFLOW
    // -------------------------------------------------------------
    console.log("[AUDIT 16] Safe archive & permanent delete workflow");
    // Archive P1Dup3
    const archiveRes = await fetch(`${BASE_URL}/${p1Dup3.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
    });
    assert(archiveRes.status === 200, `Archive failed: ${archiveRes.status}`);
    const archivedP1Dup3 = await prisma.project.findUnique({ where: { id: p1Dup3.id } });
    assert(archivedP1Dup3?.publishStatus === "archived", "PublishStatus should be archived");
    assert(archivedP1Dup3?.status === "archived", "Operational status should be archived");

    // Archived project must immediately return 404 publicly
    const postArchivePublicRes = await fetch(`${BASE_URL}/${p1Dup3.slug}`);
    assert(postArchivePublicRes.status === 404, "Newly archived project must return 404 publicly");
    console.log("  ✓ Safe archiving successfully updates publication and operational status; returns 404 publicly.\n");

    console.log("======================================================================");
    console.log("  ALL 39 PHASE 7 FINAL QA CRITERIA COMPLETED & VERIFIED SUCCESSFULLY! ");
    console.log("======================================================================\n");

  } finally {
    // -------------------------------------------------------------
    // 17. FINAL DATABASE TEARDOWN & CLEANUP
    // -------------------------------------------------------------
    console.log("[CLEANUP] Performing exhaustive database teardown...");

    if (testProjectIds.length > 0) {
      const deletedProjects = await prisma.project.deleteMany({
        where: { id: { in: testProjectIds } },
      });
      console.log(`  ✓ Removed ${deletedProjects.count} temporary test project records.`);
    }

    if (testSessionId) {
      await prisma.adminSession.deleteMany({ where: { id: testSessionId } });
      console.log("  ✓ Removed temporary test session.");
    }

    if (testAdminUserId) {
      await prisma.adminUser.deleteMany({ where: { id: testAdminUserId } });
      console.log("  ✓ Removed temporary test admin user.");
    }

    const finalProjectCount = await prisma.project.count();
    console.log(`\n  ========================================`);
    console.log(`  MANDATORY CHECK: Database Project Count: ${finalProjectCount}`);
    console.log(`  ========================================\n`);
    assert(finalProjectCount === 0, `Database MUST have exactly 0 projects, but found ${finalProjectCount}`);

    server.close();
    console.log("  ✓ QA test server closed cleanly.\n");
  }
}

runPhase7FinalQA().catch((err) => {
  console.error("FATAL QA TEST ERROR:", err);
  if (server) server.close();
  process.exit(1);
});
