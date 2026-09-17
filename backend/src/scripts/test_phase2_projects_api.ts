import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "../lib/db";
import projectsRouter from "../routes/projects";
import { hashPassword } from "../lib/auth";

async function runTests() {
  console.log("=================================================");
  console.log("  PHASE 2 PROJECTS BACKEND/API VERIFICATION TEST  ");
  console.log("=================================================\n");

  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/projects", projectsRouter);

  const PORT = 5059;
  const server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}/api/projects`;

  const createdProjectIds: string[] = [];
  let testAdminUserId = "";
  let testSessionId = "";
  let authCookie = "";

  try {
    // 0. Setup test admin user and session
    console.log("[SETUP] Creating temporary test admin user and session...");
    const testAdmin = await prisma.adminUser.create({
      data: {
        email: `phase2_tester_${Date.now()}@hipro.local`,
        name: "Phase 2 Tester",
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
    console.log("  ✓ Test session established\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Authorization Guards
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 1] Authorization Guards");
    const unauthPost = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Test" }),
    });
    if (unauthPost.status !== 401) throw new Error(`POST unauth expected 401, got ${unauthPost.status}`);
    console.log("  ✓ POST /api/projects correctly rejects unauthorized request (401)");

    const unauthPatch = await fetch(`${BASE_URL}/some-id`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Test" }),
    });
    if (unauthPatch.status !== 401) throw new Error(`PATCH unauth expected 401, got ${unauthPatch.status}`);
    console.log("  ✓ PATCH /api/projects/:id correctly rejects unauthorized request (401)");

    const unauthDelete = await fetch(`${BASE_URL}/some-id`, {
      method: "DELETE",
    });
    if (unauthDelete.status !== 401) throw new Error(`DELETE unauth expected 401, got ${unauthDelete.status}`);
    console.log("  ✓ DELETE /api/projects/:id correctly rejects unauthorized request (401)\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Input Validation & Error Handling
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 2] Input Validation & Error Handling");

    // Missing required fields
    const missingRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ title: "Incomplete Project" }),
    });
    const missingJson: any = await missingRes.json();
    if (missingRes.status !== 400 || !missingJson.error.includes("Missing required fields")) {
      throw new Error(`Expected 400 for missing fields, got: ${JSON.stringify(missingJson)}`);
    }
    console.log("  ✓ Correctly rejects missing required fields (400)");

    // Invalid URL
    const invalidUrlRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Bad URL Project",
        category: "Industrial",
        location: "Jaipur",
        date: "2025",
        description: "Valid description",
        image: "not-a-valid-http-url",
      }),
    });
    const invalidUrlJson: any = await invalidUrlRes.json();
    if (invalidUrlRes.status !== 400 || !invalidUrlJson.error.includes("cover image URL")) {
      throw new Error(`Expected 400 for invalid cover image URL, got: ${JSON.stringify(invalidUrlJson)}`);
    }
    console.log("  ✓ Correctly rejects invalid cover image URL (400)");

    // Invalid videoType
    const invalidVideoRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Bad Video Project",
        category: "Commercial",
        location: "Ajmer",
        date: "2025",
        description: "Valid description",
        videoType: "dailymotion",
      }),
    });
    const invalidVideoJson: any = await invalidVideoRes.json();
    if (invalidVideoRes.status !== 400 || !invalidVideoJson.error.includes("videoType")) {
      throw new Error(`Expected 400 for invalid videoType, got: ${JSON.stringify(invalidVideoJson)}`);
    }
    console.log("  ✓ Correctly rejects invalid videoType (400)");

    // Invalid JSON field structure (highlights without value)
    const invalidJsonRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Bad Highlights Project",
        category: "Commercial",
        location: "Ajmer",
        date: "2025",
        description: "Valid description",
        highlights: JSON.stringify([{ label: "Area" }]), // missing "value"
      }),
    });
    const invalidJsonData: any = await invalidJsonRes.json();
    if (invalidJsonRes.status !== 400 || !invalidJsonData.error.includes("highlights")) {
      throw new Error(`Expected 400 for invalid highlights JSON structure, got: ${JSON.stringify(invalidJsonData)}`);
    }
    console.log("  ✓ Correctly rejects malformed highlights JSON structure (400)");

    // Invalid slug characters
    const invalidSlugRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Bad Slug Project",
        category: "Commercial",
        location: "Ajmer",
        date: "2025",
        description: "Valid description",
        slug: "Invalid Slug With Spaces & Special!@#",
      }),
    });
    const invalidSlugJson: any = await invalidSlugRes.json();
    if (invalidSlugRes.status !== 400 || !invalidSlugJson.error.includes("Slug must contain")) {
      throw new Error(`Expected 400 for invalid slug format, got: ${JSON.stringify(invalidSlugJson)}`);
    }
    console.log("  ✓ Correctly rejects invalid slug format (400)\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Create Draft Project (with Auth)
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 3] Create Draft Project (with Auth)");
    const draftPayload = {
      title: "Test Modern Logistics Hub",
      category: "Industrial",
      location: "Bhilwara Industrial Area",
      date: "2025-2026",
      description: "A comprehensive industrial logistics warehouse facility.",
      publishStatus: "draft",
      shortDescription: "Industrial warehouse facility",
      highlights: JSON.stringify([{ label: "Built-up Area", value: "85,000 sq.ft" }]),
      galleryDetails: JSON.stringify([
        { url: "https://example.com/gallery1.jpg", alt: "Facade", isCover: true },
        { url: "https://example.com/gallery2.jpg", alt: "Interior" },
      ]),
      faqs: JSON.stringify([{ question: "What is the floor capacity?", answer: "Heavy-duty 8 ton/sq.m" }]),
      videoUrl: "https://youtube.com/watch?v=sample123",
      videoType: "youtube",
      city: "Bhilwara",
      state: "Rajasthan",
      country: "India",
      featured: false,
    };

    const draftRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify(draftPayload),
    });
    const draftJson: any = await draftRes.json();
    if (draftRes.status !== 201 || !draftJson.success || !draftJson.data?.id) {
      throw new Error(`Draft creation failed: ${JSON.stringify(draftJson)}`);
    }
    const draftProject = draftJson.data;
    createdProjectIds.push(draftProject.id);

    if (draftProject.publishStatus !== "draft") throw new Error("Expected publishStatus 'draft'");
    if (draftProject.slug !== "test-modern-logistics-hub") {
      throw new Error(`Expected slug 'test-modern-logistics-hub', got '${draftProject.slug}'`);
    }
    // Verify legacy `images` synchronization from galleryDetails
    const parsedImages = JSON.parse(draftProject.images);
    if (!Array.isArray(parsedImages) || parsedImages.length !== 2 || parsedImages[0] !== "https://example.com/gallery1.jpg") {
      throw new Error(`Legacy images field synchronization failed: ${draftProject.images}`);
    }
    console.log(`  ✓ Draft project created successfully (id: ${draftProject.id}, slug: ${draftProject.slug})`);
    console.log("  ✓ Auto-generated human-readable slug matches title");
    console.log("  ✓ Legacy 'images' array automatically synced from galleryDetails\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Create Published Project (with Auth)
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 4] Create Published Project (with Auth)");
    const publishedPayload = {
      title: "Test Royal Commercial Plaza",
      slug: "test-royal-commercial-plaza",
      category: "Commercial",
      location: "City Center, Jaipur",
      date: "2024",
      description: "A premier commercial complex.",
      publishStatus: "published",
      status: "completed",
      city: "Jaipur",
      state: "Rajasthan",
      featured: true,
      metaTitle: "Royal Commercial Plaza | Commercial Projects in Jaipur",
      metaDescription: "Explore the premier commercial building project in Jaipur.",
    };

    const pubRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify(publishedPayload),
    });
    const pubJson: any = await pubRes.json();
    if (pubRes.status !== 201 || !pubJson.success || !pubJson.data?.id) {
      throw new Error(`Published creation failed: ${JSON.stringify(pubJson)}`);
    }
    const pubProject = pubJson.data;
    createdProjectIds.push(pubProject.id);

    if (pubProject.publishStatus !== "published") throw new Error("Expected publishStatus 'published'");
    if (!pubProject.publishedAt) throw new Error("Expected publishedAt to be auto-populated for published project");
    console.log(`  ✓ Published project created (id: ${pubProject.id}, publishedAt: ${pubProject.publishedAt})\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Create Archived Project (with Auth)
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 5] Create Archived Project (with Auth)");
    const archivedPayload = {
      title: "Test Old Industrial Warehouse",
      category: "Industrial",
      location: "Udaipur",
      date: "2019",
      description: "An older decommissioned warehouse.",
      publishStatus: "archived",
      status: "archived",
    };

    const archRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify(archivedPayload),
    });
    const archJson: any = await archRes.json();
    if (archRes.status !== 201 || !archJson.success || !archJson.data?.id) {
      throw new Error(`Archived creation failed: ${JSON.stringify(archJson)}`);
    }
    const archProject = archJson.data;
    createdProjectIds.push(archProject.id);
    console.log(`  ✓ Archived project created (id: ${archProject.id})\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Public Read Safety (Unauthenticated)
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 6] Public Read Safety (Unauthenticated)");

    // List query without auth
    const publicListRes = await fetch(BASE_URL);
    const publicListJson: any = await publicListRes.json();
    const publicProjects: any[] = publicListJson.data || [];

    const foundDraft = publicProjects.find((p) => p.id === draftProject.id);
    const foundArchived = publicProjects.find((p) => p.id === archProject.id);
    const foundPublished = publicProjects.find((p) => p.id === pubProject.id);

    if (foundDraft) throw new Error("SECURITY VIOLATION: Draft project appeared in public list!");
    if (foundArchived) throw new Error("SECURITY VIOLATION: Archived project appeared in public list!");
    if (!foundPublished) throw new Error("Published project was not returned in public list!");
    console.log("  ✓ Public GET /api/projects excludes drafts and archived projects completely");
    console.log("  ✓ Public GET /api/projects includes published project");

    // Single item query without auth on Draft -> MUST 404
    const draftPublicGet = await fetch(`${BASE_URL}/${draftProject.slug}`);
    if (draftPublicGet.status !== 404) {
      throw new Error(`Public GET on draft project expected 404, got ${draftPublicGet.status}`);
    }
    console.log("  ✓ Public GET /api/projects/:slug on draft returns 404 Not Found");

    // Single item query without auth on Archived -> MUST 404
    const archPublicGet = await fetch(`${BASE_URL}/${archProject.slug}`);
    if (archPublicGet.status !== 404) {
      throw new Error(`Public GET on archived project expected 404, got ${archPublicGet.status}`);
    }
    console.log("  ✓ Public GET /api/projects/:slug on archived returns 404 Not Found");

    // Single item query without auth on Published -> MUST 200
    const pubPublicGet = await fetch(`${BASE_URL}/${pubProject.slug}`);
    if (pubPublicGet.status !== 200) {
      throw new Error(`Public GET on published project expected 200, got ${pubPublicGet.status}`);
    }
    console.log("  ✓ Public GET /api/projects/:slug on published returns 200 OK\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 7: Admin Read Access (Authenticated)
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 7] Admin Read Access (Authenticated)");

    // Unauthenticated attempt to query ?all=true -> MUST 401
    const unauthAllRes = await fetch(`${BASE_URL}?all=true`);
    if (unauthAllRes.status !== 401) {
      throw new Error(`Expected 401 when fetching ?all=true without auth, got ${unauthAllRes.status}`);
    }
    console.log("  ✓ Unauthenticated GET /api/projects?all=true correctly rejected (401)");

    // Authenticated admin list with ?all=true
    const adminListRes = await fetch(`${BASE_URL}?all=true`, {
      headers: { Cookie: authCookie },
    });
    const adminListJson: any = await adminListRes.json();
    const adminProjects: any[] = adminListJson.data || [];

    const adminFoundDraft = adminProjects.find((p) => p.id === draftProject.id);
    const adminFoundArchived = adminProjects.find((p) => p.id === archProject.id);
    const adminFoundPublished = adminProjects.find((p) => p.id === pubProject.id);

    if (!adminFoundDraft || !adminFoundArchived || !adminFoundPublished) {
      throw new Error("Admin ?all=true query failed to return all project publication states");
    }
    console.log("  ✓ Admin GET /api/projects?all=true successfully returns draft, published, and archived projects");

    // Authenticated admin single item query on draft
    const adminDraftGet = await fetch(`${BASE_URL}/${draftProject.slug}`, {
      headers: { Cookie: authCookie },
    });
    if (adminDraftGet.status !== 200) {
      throw new Error(`Admin single GET on draft expected 200, got ${adminDraftGet.status}`);
    }
    console.log("  ✓ Authenticated admin can view draft project details via /api/projects/:slug (200)\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 8: Slug Disambiguation & Duplicate Rejection
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 8] Slug Disambiguation & Duplicate Rejection");

    // Explicit duplicate custom slug -> MUST 409 Conflict
    const dupRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Another Commercial Plaza",
        slug: pubProject.slug, // Duplicate of existing slug
        category: "Commercial",
        location: "Jaipur",
        date: "2025",
        description: "Trying to take an existing slug",
      }),
    });
    const dupJson: any = await dupRes.json();
    if (dupRes.status !== 409 || !dupJson.error.includes("already in use")) {
      throw new Error(`Expected 409 Conflict for duplicate custom slug, got ${dupRes.status}: ${JSON.stringify(dupJson)}`);
    }
    console.log("  ✓ Explicit duplicate slug rejected with 409 Conflict");

    // Auto-generated slug collision handling
    const collideRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Test Royal Commercial Plaza", // Identical title to pubProject
        location: "Kota Location", // Different location
        category: "Commercial",
        date: "2025",
        description: "Auto slug should disambiguate",
      }),
    });
    const collideJson: any = await collideRes.json();
    if (collideRes.status !== 201 || !collideJson.data?.slug) {
      throw new Error(`Collision creation failed: ${JSON.stringify(collideJson)}`);
    }
    const disambiguatedProject = collideJson.data;
    createdProjectIds.push(disambiguatedProject.id);

    if (disambiguatedProject.slug === pubProject.slug) {
      throw new Error("Slug collision was not disambiguated!");
    }
    console.log(`  ✓ Auto-generated collision safely disambiguated to: '${disambiguatedProject.slug}'\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 9: Dual Lookup & Legacy CUID Redirect Metadata
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 9] Dual Lookup & Legacy CUID Redirect Metadata");

    // Lookup via slug
    const slugLookupRes = await fetch(`${BASE_URL}/${pubProject.slug}`);
    const slugLookupJson: any = await slugLookupRes.json();
    if (slugLookupJson.isLegacyId !== false || slugLookupJson.canonicalSlug !== pubProject.slug) {
      throw new Error(`Slug lookup metadata unexpected: ${JSON.stringify(slugLookupJson)}`);
    }
    console.log("  ✓ Lookup by slug returns isLegacyId: false with canonicalSlug");

    // Lookup via legacy ID (CUID)
    const idLookupRes = await fetch(`${BASE_URL}/${pubProject.id}`);
    const idLookupJson: any = await idLookupRes.json();
    if (idLookupJson.isLegacyId !== true || idLookupJson.canonicalSlug !== pubProject.slug) {
      throw new Error(`Legacy ID lookup metadata unexpected: ${JSON.stringify(idLookupJson)}`);
    }
    console.log("  ✓ Lookup by legacy ID returns isLegacyId: true with canonicalSlug for 301 redirect\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 10: Update Project (PATCH) & Field Whitelisting
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 10] Update Project (PATCH) & Field Whitelisting");

    const patchPayload = {
      title: "Updated Modern Logistics Hub Phase 2",
      client: "Reliance Retail Ltd",
      city: "Bhilwara",
      district: "Bhilwara",
      state: "Rajasthan",
      targetLocation: "Bhilwara Express Highway",
      latitude: 25.3463,
      longitude: 74.6364,
      googleMapsUrl: "https://maps.google.com/?q=25.3463,74.6364",
      unwhitelistedExploitField: "SHOULD_BE_STRIPPED",
    };

    const patchRes = await fetch(`${BASE_URL}/${draftProject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify(patchPayload),
    });
    const patchJson: any = await patchRes.json();
    if (patchRes.status !== 200 || !patchJson.success) {
      throw new Error(`PATCH failed: ${JSON.stringify(patchJson)}`);
    }
    const patchedProject = patchJson.data;
    if (patchedProject.client !== "Reliance Retail Ltd") throw new Error("Client field not updated");
    if (patchedProject.latitude !== 25.3463) throw new Error("Latitude field not updated");
    if ((patchedProject as any).unwhitelistedExploitField !== undefined) {
      throw new Error("Unwhitelisted field was passed through to database!");
    }
    console.log("  ✓ PATCH /api/projects/:id successfully updated whitelisted fields");
    console.log("  ✓ Arbitrary unwhitelisted fields are strictly stripped and discarded\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 11: Delete / Safe Archive & Permanent Delete
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 11] Delete / Safe Archive & Permanent Delete");

    // Default DELETE -> Safe archive
    const archiveDeleteRes = await fetch(`${BASE_URL}/${draftProject.id}`, {
      method: "DELETE",
      headers: { Cookie: authCookie },
    });
    const archiveDeleteJson: any = await archiveDeleteRes.json();
    if (archiveDeleteRes.status !== 200 || !archiveDeleteJson.success) {
      throw new Error(`Safe archive delete failed: ${JSON.stringify(archiveDeleteJson)}`);
    }

    // Verify record still exists in DB but is marked archived
    const checkDbRecord = await prisma.project.findUnique({ where: { id: draftProject.id } });
    if (!checkDbRecord || checkDbRecord.publishStatus !== "archived" || checkDbRecord.status !== "archived") {
      throw new Error("Safe archive did not set publishStatus: 'archived' and status: 'archived'");
    }
    console.log("  ✓ Default DELETE safely archives project without destroying DB record");

    // Permanent DELETE -> Hard delete from DB
    const permDeleteRes = await fetch(`${BASE_URL}/${draftProject.id}?permanent=true`, {
      method: "DELETE",
      headers: { Cookie: authCookie },
    });
    const permDeleteJson: any = await permDeleteRes.json();
    if (permDeleteRes.status !== 200 || !permDeleteJson.success) {
      throw new Error(`Permanent delete failed: ${JSON.stringify(permDeleteJson)}`);
    }

    const checkPermDeleted = await prisma.project.findUnique({ where: { id: draftProject.id } });
    if (checkPermDeleted) {
      throw new Error("Permanent delete failed to remove record from DB");
    }
    console.log("  ✓ DELETE ?permanent=true successfully hard-deletes project from DB\n");

    console.log("=================================================");
    console.log("  ALL PHASE 2 API VERIFICATION TESTS PASSED!    ");
    console.log("=================================================");
  } finally {
    // Clean up test data
    console.log("\n[CLEANUP] Cleaning up all test records...");
    if (createdProjectIds.length > 0) {
      await prisma.project.deleteMany({
        where: { id: { in: createdProjectIds } },
      });
      console.log(`  ✓ Removed ${createdProjectIds.length} temporary test projects`);
    }
    if (testSessionId) {
      await prisma.adminSession.deleteMany({ where: { id: testSessionId } });
      console.log("  ✓ Removed temporary test admin session");
    }
    if (testAdminUserId) {
      await prisma.adminUser.deleteMany({ where: { id: testAdminUserId } });
      console.log("  ✓ Removed temporary test admin user");
    }
    server.close();
    console.log("  ✓ Test HTTP server closed cleanly.");
  }
}

runTests().catch((err) => {
  console.error("\n❌ PHASE 2 VERIFICATION TEST FAILED:", err);
  process.exit(1);
});
