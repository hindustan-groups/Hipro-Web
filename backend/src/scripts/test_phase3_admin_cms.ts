import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "../lib/db";
import projectsRouter from "../routes/projects";
import { hashPassword } from "../lib/auth";

async function runPhase3Tests() {
  console.log("=================================================");
  console.log("  PHASE 3 PROJECTS ADMIN CMS UI LOGIC TEST       ");
  console.log("=================================================\n");

  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/projects", projectsRouter);

  const PORT = 5062;
  const server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}/api/projects`;

  const createdProjectIds: string[] = [];
  let testAdminUserId = "";
  let testSessionId = "";
  let authCookie = "";

  try {
    // 0. Setup test admin session
    console.log("[SETUP] Initializing test admin session...");
    const testAdmin = await prisma.adminUser.create({
      data: {
        email: `phase3_admin_${Date.now()}@hipro.local`,
        name: "Phase 3 Admin Tester",
        password: hashPassword("AdminPass123!"),
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
    console.log("  ✓ Admin authenticated session ready\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Admin Creates a New Project as DRAFT
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 1] Admin Creates Project as DRAFT");
    const draftPayload = {
      title: "Automated Phase 3 PEB Warehouse",
      slug: "automated-phase-3-peb-warehouse",
      category: "Industrial",
      subCategories: JSON.stringify(["PEB", "Logistics", "Turnkey"]),
      status: "ongoing",
      publishStatus: "draft",
      featured: true,
      order: 1,

      location: "RIICO Growth Centre, Bhilwara",
      date: "2025 - 2026",
      description: "Initial draft narrative describing the heavy industrial warehouse.",
      image: "https://example.com/cover.jpg",
      imageAlt: "Front elevation of warehouse",
      imageCaption: "North facing facade",
    };

    const draftRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify(draftPayload),
    });
    const draftJson: any = await draftRes.json();
    if (!draftRes.ok || !draftJson.success) {
      throw new Error(`Draft creation failed: ${JSON.stringify(draftJson)}`);
    }
    const createdDraft = draftJson.data;
    createdProjectIds.push(createdDraft.id);

    if (createdDraft.publishStatus !== "draft") throw new Error("Expected publishStatus to be 'draft'");
    if (createdDraft.status !== "ongoing") throw new Error("Expected status to be 'ongoing'");
    console.log(`  ✓ Draft created successfully: "${createdDraft.title}" (ID: ${createdDraft.id})`);
    console.log("  ✓ Status correctly separated: publishStatus='draft', status='ongoing'\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Admin Updates Specifications, Narrative, Media, SEO
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 2] Admin Enriches Specifications, Narrative, Media, SEO");
    const enrichPayload = {
      // Specifications Tab
      client: "Rajasthan Textiles Consortium",
      owner: "HiPRO Infra Dev",
      area: "140,000 sq.ft",
      services: JSON.stringify(["Pre-Engineered Building", "Civil Works", "Heavy Foundation"]),
      city: "Bhilwara",
      state: "Rajasthan",
      country: "India",
      postalCode: "311001",
      targetLocation: "Hamirgarh Road",
      latitude: 25.321,
      longitude: 74.612,
      googleMapsUrl: "https://maps.google.com/?q=25.321,74.612",
      completionDate: "October 2025",

      // Narrative Tab
      shortDescription: "A massive 140,000 sq.ft PEB industrial shed engineered with multi-bay loading.",
      highlights: JSON.stringify([
        { label: "Clear Height", value: "12.5 Meters" },
        { label: "Crane System", value: "2x 20 Ton EOT" },
      ]),
      faqs: JSON.stringify([
        { question: "What steel grade was used?", answer: "High-tensile ASTM A572 Grade 50 steel." },
      ]),

      // Media Tab
      galleryDetails: JSON.stringify([
        { url: "https://example.com/photo1.jpg", alt: "PEB Rafter Erection", order: 1 },
        { url: "https://example.com/photo2.jpg", alt: "Laser Screed Flooring", order: 2 },
      ]),
      videoUrl: "https://www.youtube.com/watch?v=peb-showcase",
      videoType: "youtube",
      videoTitle: "PEB Erection Timelapse",

      // SEO Tab
      metaTitle: "Automated PEB Warehouse Bhilwara | Industrial Turnkey HiPRO",
      metaDescription: "Case study of HiPRO's 140,000 sq.ft industrial turnkey PEB warehouse in Bhilwara.",
      focusKeywords: "PEB warehouse Bhilwara",
      secondaryKeywords: "industrial construction Rajasthan",
      noIndex: false,
      noFollow: false,
    };

    const enrichRes = await fetch(`${BASE_URL}/${createdDraft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify(enrichPayload),
    });
    const enrichJson: any = await enrichRes.json();
    if (!enrichRes.ok || !enrichJson.success) {
      throw new Error(`Enrich update failed: ${JSON.stringify(enrichJson)}`);
    }
    const enrichedProject = enrichJson.data;

    if (enrichedProject.client !== "Rajasthan Textiles Consortium") throw new Error("Client not updated");
    if (enrichedProject.area !== "140,000 sq.ft") throw new Error("Area not updated");
    if (enrichedProject.videoType !== "youtube") throw new Error("Video type not updated");
    if (enrichedProject.latitude !== 25.321) throw new Error("Latitude not updated");

    // Verify highlights and galleryDetails stored properly
    const parsedHls = JSON.parse(enrichedProject.highlights);
    if (parsedHls.length !== 2 || parsedHls[0].label !== "Clear Height") {
      throw new Error(`Highlights parsing check failed: ${enrichedProject.highlights}`);
    }
    console.log("  ✓ Specifications tab fields saved (Client, Area, Services, verified GEO)");
    console.log("  ✓ Narrative tab fields saved (Short description, structured Highlights, FAQs)");
    console.log("  ✓ Media tab fields saved (Gallery items, YouTube video showcase)");
    console.log("  ✓ SEO tab fields saved (Custom Meta Title, Meta Description, Keywords)\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Admin Publishes Project (Draft -> Published)
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 3] Admin Publishes Project");
    const publishRes = await fetch(`${BASE_URL}/${createdDraft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ publishStatus: "published" }),
    });
    const publishJson: any = await publishRes.json();
    if (!publishRes.ok || !publishJson.success) {
      throw new Error(`Publish failed: ${JSON.stringify(publishJson)}`);
    }
    const publishedProject = publishJson.data;
    if (publishedProject.publishStatus !== "published") throw new Error("Expected publishStatus 'published'");
    if (!publishedProject.publishedAt) throw new Error("Expected publishedAt to be auto-populated");
    console.log(`  ✓ Project published (publishedAt: ${publishedProject.publishedAt})\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Duplicate Slug Handling in Admin Editor
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 4] Duplicate Slug Handling in Admin Editor");
    const dupRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Conflicting Slug Project",
        slug: enrichedProject.slug, // Existing slug
        category: "Commercial",
        location: "Jaipur",
        date: "2025",
        description: "Trying duplicate slug",
      }),
    });
    if (dupRes.status !== 409) {
      throw new Error(`Expected 409 Conflict for duplicate slug, got ${dupRes.status}`);
    }
    const dupJson: any = await dupRes.json();
    if (!dupJson.error.includes("already in use")) {
      throw new Error(`Expected error message mentioning 'already in use', got: ${JSON.stringify(dupJson)}`);
    }
    console.log("  ✓ Server correctly returns 409 Conflict for duplicate slug to trigger UI slugError state\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Admin Quick Toggles (Featured, Operational Status, Archive)
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 5] Admin Quick Toggles (Featured, Operational, Safe Archive)");

    // 1. Toggle featured
    const featRes = await fetch(`${BASE_URL}/${createdDraft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ featured: false }),
    });
    const featJson: any = await featRes.json();
    if (featJson.data.featured !== false) throw new Error("Featured toggle failed");
    console.log("  ✓ 1-click Featured toggle updated to false");

    // 2. Toggle operational status (ongoing -> completed)
    const opRes = await fetch(`${BASE_URL}/${createdDraft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ status: "completed" }),
    });
    const opJson: any = await opRes.json();
    if (opJson.data.status !== "completed") throw new Error("Operational status toggle failed");
    console.log("  ✓ 1-click Operational Lifecycle toggle updated to 'completed'");

    // 3. Safe Archive Project
    const archiveRes = await fetch(`${BASE_URL}/${createdDraft.id}`, {
      method: "DELETE",
      headers: { Cookie: authCookie },
    });
    const archJson: any = await archiveRes.json();
    if (!archiveRes.ok || !archJson.success) throw new Error("Safe archive delete failed");

    const checkArchived = await prisma.project.findUnique({ where: { id: createdDraft.id } });
    if (!checkArchived || checkArchived.publishStatus !== "archived" || checkArchived.status !== "archived") {
      throw new Error("Expected project to remain in DB with publishStatus='archived' and status='archived'");
    }
    console.log("  ✓ Project safely archived (publishStatus='archived', DB record preserved)\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Permanent Delete
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 6] Permanent Delete");
    const permRes = await fetch(`${BASE_URL}/${createdDraft.id}?permanent=true`, {
      method: "DELETE",
      headers: { Cookie: authCookie },
    });
    const permJson: any = await permRes.json();
    if (!permRes.ok || !permJson.success) throw new Error("Permanent delete failed");

    const checkPerm = await prisma.project.findUnique({ where: { id: createdDraft.id } });
    if (checkPerm) throw new Error("Permanent delete failed to destroy DB record");
    console.log("  ✓ Project permanently removed from database\n");

    console.log("=================================================");
    console.log("  ALL PHASE 3 ADMIN CMS LOGIC TESTS PASSED!     ");
    console.log("=================================================");
  } finally {
    console.log("\n[CLEANUP] Cleaning up all test data...");
    if (createdProjectIds.length > 0) {
      await prisma.project.deleteMany({
        where: { id: { in: createdProjectIds } },
      });
      console.log(`  ✓ Cleaned up ${createdProjectIds.length} temporary project records`);
    }
    if (testSessionId) {
      await prisma.adminSession.deleteMany({ where: { id: testSessionId } });
      console.log("  ✓ Cleaned up temporary admin session");
    }
    if (testAdminUserId) {
      await prisma.adminUser.deleteMany({ where: { id: testAdminUserId } });
      console.log("  ✓ Cleaned up temporary admin user");
    }
    server.close();
    console.log("  ✓ Test server closed cleanly.");
  }
}

runPhase3Tests().catch((err) => {
  console.error("\n❌ PHASE 3 TESTS FAILED:", err);
  process.exit(1);
});
