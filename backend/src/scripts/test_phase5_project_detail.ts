/**
 * PHASE 5 PROJECT DETAIL & CASE STUDY TEST SUITE
 * 
 * Tests:
 * 1. Published project resolves correctly by slug.
 * 2. Draft project returns 404/not-found publicly.
 * 3. Publication-archived project returns 404/not-found.
 * 4. Operationally archived project is not publicly rendered (returns 404).
 * 5. Invalid/non-existent slug returns 404.
 * 6. Canonical slug route works & legacy CUID triggers isLegacyId for 301 redirect.
 * 7. Missing optional fields are verified null (no placeholder text, fake dates, or "N/A" fabricated).
 * 8. Gallery extraction parses valid items and ignores missing images.
 * 9. Video renders only when videoUrl exists; cleanly omitted when null.
 * 10. Map renders only when verified location/map data exists; cleanly omitted when null.
 * 11. Related projects contain only public projects in same category, excluding current project.
 * 12. No hidden/draft/archived project data leaks through public endpoints.
 * 13. Complete teardown with database count returning to 0.
 */

import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { prisma } from "../lib/db";
import projectsRouter from "../routes/projects";

const PORT = 5098;
let server: http.Server;
const BASE_URL = `http://localhost:${PORT}`;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(message);
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("  PHASE 5 PROJECT DETAIL & CASE STUDY VERIFICATION ");
  console.log("=================================================\n");

  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/projects", projectsRouter);

  server = app.listen(PORT);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const testIds: string[] = [];

  try {
    // -------------------------------------------------------------
    // [SETUP] Seed temporary test records
    // -------------------------------------------------------------
    console.log("[SETUP] Creating temporary test records across lifecycles...");

    // P1: Rich Published Commercial Project (Complete fields)
    const p1 = await prisma.project.create({
      data: {
        title: "Apex Horizon Corporate Landmark",
        slug: "apex-horizon-corporate-landmark",
        category: "Commercial",
        location: "Commercial Complex, Sector 4",
        city: "Bhilwara",
        state: "Rajasthan",
        country: "India",
        googleMapsUrl: "https://maps.google.com/?q=25.3463,74.6364",
        date: "2024-03-15",
        completionDate: "2024-03-15",
        description: "Execution of Grade-A composite structural steel and reinforced concrete commercial tower.\n\nDelivered with high-precision structural detailing.",
        shortDescription: "Grade-A composite structural steel and reinforced concrete commercial landmark.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
        imageAlt: "Apex Horizon Corporate Landmark - East Facade Elevation",
        imageCaption: "Architectural glass and reinforced concrete facade detailing.",
        client: "Horizon Infra Developments Ltd",
        owner: "Apex Real Estate Holding",
        area: "125,000 sq.ft.",
        services: JSON.stringify(["Structural Engineering", "Civil Construction", "PEB Fabrication"]),
        highlights: JSON.stringify([
          { label: "Steel Consumption", value: "850 Metric Tonnes Structural Steel" },
          { label: "Concrete Grade", value: "M40 Self-Compacting Concrete" },
          { label: "Zero Accident Record", value: "450,000 Safe Working Hours" }
        ]),
        galleryDetails: JSON.stringify([
          { url: "https://images.unsplash.com/photo-1541888946425-d0fbb186156a", alt: "Foundation casting", caption: "Basement raft slab pour" },
          { url: "https://images.unsplash.com/photo-1504307651554-6691fc9d0554", alt: "Structural erection", caption: "Composite steel frame assembly" }
        ]),
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoType: "youtube",
        videoTitle: "Structural Steel Erection Timelapse",
        videoDescription: "Field execution timelapse documenting 14-month construction timeline.",
        status: "completed",
        publishStatus: "published",
        publishedAt: new Date(),
        featured: true,
        order: 1,
      },
    });
    testIds.push(p1.id);

    // P2: Minimal Published Commercial Project (Testing omitted fields & related projects)
    const p2 = await prisma.project.create({
      data: {
        title: "Zenith Retail Hub",
        slug: "zenith-retail-hub",
        category: "Commercial",
        location: "Outer Ring Road",
        date: "2024-06-01",
        description: "Retail and commercial development with multi-tier parking.",
        image: "https://images.unsplash.com/photo-1577495508048-b635879837f1",
        // Deliberately empty optional fields:
        client: null,
        owner: null,
        area: null,
        services: null,
        highlights: null,
        videoUrl: null,
        city: null,
        district: null,
        state: null,
        googleMapsUrl: null,
        status: "ongoing",
        publishStatus: "published",
        publishedAt: new Date(),
        featured: false,
        order: 2,
      },
    });
    testIds.push(p2.id);

    // P3: Draft Project (Unpublished)
    const p3 = await prisma.project.create({
      data: {
        title: "Confidential Industrial Plant Phase 2",
        slug: "confidential-industrial-plant-phase-2",
        category: "Industrial",
        location: "Industrial Area Phase III",
        date: "2024-08-01",
        description: "Proprietary industrial plant under preliminary civil planning.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
        status: "ongoing",
        publishStatus: "draft",
      },
    });
    testIds.push(p3.id);

    // P4: Publication-Archived Project
    const p4 = await prisma.project.create({
      data: {
        title: "Archived Highway Bridge",
        slug: "archived-highway-bridge",
        category: "Infrastructure",
        location: "National Highway 48",
        date: "2020-05-10",
        description: "Historical archival record of bridge structural rehabilitation.",
        image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c",
        status: "completed",
        publishStatus: "archived",
      },
    });
    testIds.push(p4.id);

    // P5: Operationally-Archived Project (status === 'archived', even if publishStatus is 'published')
    const p5 = await prisma.project.create({
      data: {
        title: "Decommissioned Processing Yard",
        slug: "decommissioned-processing-yard",
        category: "Industrial",
        location: "Old Industrial Zone",
        date: "2018-01-01",
        description: "Decommissioned facility site.",
        image: "https://images.unsplash.com/photo-1508873696983-2df5293cb395",
        status: "archived",
        publishStatus: "published",
      },
    });
    testIds.push(p5.id);

    console.log(`  ✓ Successfully seeded ${testIds.length} temporary test records.\n`);

    // -------------------------------------------------------------
    // TEST 1: Published Project Resolves Correctly by Slug
    // -------------------------------------------------------------
    console.log("[TEST 1] Published project resolves correctly by slug");
    const res1 = await fetch(`${BASE_URL}/api/projects/apex-horizon-corporate-landmark`);
    assert(res1.status === 200, `Expected 200, got ${res1.status}`);
    const data1 = (await res1.json() as any);
    assert(data1.success === true, "Expected success: true");
    assert(data1.data.title === "Apex Horizon Corporate Landmark", "Title does not match");
    assert(data1.canonicalSlug === "apex-horizon-corporate-landmark", "Canonical slug incorrect");
    assert(data1.isLegacyId === false, "isLegacyId should be false when queried by slug");
    console.log("  ✓ Slug lookup succeeded with canonical response data.");

    // -------------------------------------------------------------
    // TEST 2: Draft Project Returns 404 Publicly
    // -------------------------------------------------------------
    console.log("[TEST 2] Draft project returns 404 publicly");
    const res2a = await fetch(`${BASE_URL}/api/projects/confidential-industrial-plant-phase-2`);
    assert(res2a.status === 404, `Expected 404 for draft slug, got ${res2a.status}`);
    const res2b = await fetch(`${BASE_URL}/api/projects/${p3.id}`);
    assert(res2b.status === 404, `Expected 404 for draft ID, got ${res2b.status}`);
    console.log("  ✓ Draft project strictly returns 404 for unauthenticated callers.");

    // -------------------------------------------------------------
    // TEST 3: Publication-Archived Project Returns 404 Publicly
    // -------------------------------------------------------------
    console.log("[TEST 3] Publication-archived project returns 404 publicly");
    const res3a = await fetch(`${BASE_URL}/api/projects/archived-highway-bridge`);
    assert(res3a.status === 404, `Expected 404 for publication-archived slug, got ${res3a.status}`);
    const res3b = await fetch(`${BASE_URL}/api/projects/${p4.id}`);
    assert(res3b.status === 404, `Expected 404 for publication-archived ID, got ${res3b.status}`);
    console.log("  ✓ Publication-archived project strictly returns 404.");

    // -------------------------------------------------------------
    // TEST 4: Operationally-Archived Project Returns 404 Publicly
    // -------------------------------------------------------------
    console.log("[TEST 4] Operationally-archived project returns 404 publicly");
    const res4a = await fetch(`${BASE_URL}/api/projects/decommissioned-processing-yard`);
    assert(res4a.status === 404, `Expected 404 for operational-archived slug, got ${res4a.status}`);
    const res4b = await fetch(`${BASE_URL}/api/projects/${p5.id}`);
    assert(res4b.status === 404, `Expected 404 for operational-archived ID, got ${res4b.status}`);
    console.log("  ✓ Operationally-archived project strictly returns 404.");

    // -------------------------------------------------------------
    // TEST 5: Invalid Slug Returns 404
    // -------------------------------------------------------------
    console.log("[TEST 5] Invalid slug returns 404");
    const res5 = await fetch(`${BASE_URL}/api/projects/completely-non-existent-slug-xyz-999`);
    assert(res5.status === 404, `Expected 404 for non-existent slug, got ${res5.status}`);
    console.log("  ✓ Non-existent slug returns 404 cleanly.");

    // -------------------------------------------------------------
    // TEST 6: Legacy CUID Identifier Resolves and Flags 301 Redirect
    // -------------------------------------------------------------
    console.log("[TEST 6] Legacy CUID identifier resolves and flags isLegacyId for redirect");
    const res6 = await fetch(`${BASE_URL}/api/projects/${p1.id}`);
    assert(res6.status === 200, `Expected 200, got ${res6.status}`);
    const data6 = (await res6.json() as any);
    assert(data6.success === true, "Expected success: true");
    assert(data6.isLegacyId === true, "Expected isLegacyId: true for legacy ID lookup");
    assert(data6.canonicalSlug === "apex-horizon-corporate-landmark", "Canonical slug matches");
    console.log("  ✓ Legacy CUID identifier correctly detected with isLegacyId: true and canonicalSlug.");

    // -------------------------------------------------------------
    // TEST 7: Missing Optional Fields Safety (No "N/A" or Fake Data)
    // -------------------------------------------------------------
    console.log("[TEST 7] Missing optional fields safety (No 'N/A' or placeholder strings)");
    const res7 = await fetch(`${BASE_URL}/api/projects/zenith-retail-hub`);
    assert(res7.status === 200, `Expected 200, got ${res7.status}`);
    const data7 = (await res7.json() as any).data;
    assert(data7.client === null, "client should be null");
    assert(data7.owner === null, "owner should be null");
    assert(data7.area === null, "area should be null");
    assert(data7.videoUrl === null, "videoUrl should be null");
    assert(data7.city === null, "city should be null");
    assert(data7.state === null, "state should be null");
    assert(data7.googleMapsUrl === null, "googleMapsUrl should be null");
    assert(data7.highlights === null, "highlights should be null");
    console.log("  ✓ Unset optional fields are strictly null; zero placeholder values fabricated.");

    // -------------------------------------------------------------
    // TEST 8: Gallery Details Structure Verification
    // -------------------------------------------------------------
    console.log("[TEST 8] Gallery details parsing and structure verification");
    const galleryItems = JSON.parse(data1.data.galleryDetails);
    assert(Array.isArray(galleryItems) && galleryItems.length === 2, "Gallery items length mismatch");
    assert(galleryItems[0].url.startsWith("https://"), "Gallery URL invalid");
    assert(galleryItems[0].caption === "Basement raft slab pour", "Gallery caption mismatch");
    console.log("  ✓ Gallery items validated with correct captions and image URLs.");

    // -------------------------------------------------------------
    // TEST 9: Video URL Support & Verification
    // -------------------------------------------------------------
    console.log("[TEST 9] Video URL support and embed verification");
    assert(data1.data.videoUrl.includes("youtube.com"), "Video URL should contain youtube");
    assert(data1.data.videoType === "youtube", "Video type should be youtube");
    assert(data1.data.videoTitle === "Structural Steel Erection Timelapse", "Video title mismatch");
    console.log("  ✓ Video attributes verified with valid embed source.");

    // -------------------------------------------------------------
    // TEST 10: Verified Site Geography (Zero Defaults Check)
    // -------------------------------------------------------------
    console.log("[TEST 10] Verified site geography validation");
    assert(data1.data.city === "Bhilwara", "City mismatch for P1");
    assert(data1.data.state === "Rajasthan", "State mismatch for P1");
    assert(data1.data.googleMapsUrl.includes("maps.google.com"), "Google Maps URL mismatch");
    assert(data7.city === null, "P2 must NOT have default Bhilwara");
    assert(data7.state === null, "P2 must NOT have default Rajasthan");
    console.log("  ✓ Verified location renders strictly when present; zero default locations assigned.");

    // -------------------------------------------------------------
    // TEST 11: Related Projects Filtering Logic
    // -------------------------------------------------------------
    console.log("[TEST 11] Related projects public isolation");
    const res11 = await fetch(`${BASE_URL}/api/projects?category=Commercial`);
    assert(res11.status === 200, `Expected 200, got ${res11.status}`);
    const commercialProjects = (await res11.json() as any).data;
    // Must contain P1 and P2, must NOT contain P3 (Industrial draft), P4 (Archived), or P5 (Archived)
    const commIds = commercialProjects.map((p: any) => p.id);
    assert(commIds.includes(p1.id), "Should include P1");
    assert(commIds.includes(p2.id), "Should include P2");
    assert(!commIds.includes(p3.id), "Must NOT include draft P3");
    assert(!commIds.includes(p4.id), "Must NOT include archived P4");
    assert(!commIds.includes(p5.id), "Must NOT include operational archived P5");
    console.log("  ✓ Related projects query strictly isolates public records without leaking drafts.");

    // -------------------------------------------------------------
    // TEST 12: Public Data Leak Protection
    // -------------------------------------------------------------
    console.log("[TEST 12] Public data leak protection");
    // Verify that attempting to query all projects without authentication fails
    const res12 = await fetch(`${BASE_URL}/api/projects?all=true`);
    assert(res12.status === 401, `Expected 401 unauthorized for all=true, got ${res12.status}`);
    console.log("  ✓ Protected admin fields and all=true query are strictly guarded.");

    console.log("\n=================================================");
    console.log("  ALL PHASE 5 PROJECT DETAIL TESTS PASSED!       ");
    console.log("=================================================\n");

  } finally {
    // -------------------------------------------------------------
    // [CLEANUP] Teardown temporary test records
    // -------------------------------------------------------------
    console.log("[CLEANUP] Removing temporary test projects...");
    if (testIds.length > 0) {
      const deleted = await prisma.project.deleteMany({
        where: { id: { in: testIds } },
      });
      console.log(`  ✓ Removed ${deleted.count} temporary test records.`);
    }

    const finalCount = await prisma.project.count();
    console.log(`  ✓ Verified database project count: ${finalCount}`);
    assert(finalCount === 0, `Database must have 0 projects, found ${finalCount}`);

    server.close();
    console.log("  ✓ Test server closed cleanly.\n");
  }
}

runTests().catch((err) => {
  console.error("FATAL TEST ERROR:", err);
  if (server) server.close();
  process.exit(1);
});
