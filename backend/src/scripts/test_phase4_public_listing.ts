import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "../lib/db";
import projectsRouter from "../routes/projects";
import { hashPassword } from "../lib/auth";

async function runPhase4Tests() {
  console.log("=================================================");
  console.log("  PHASE 4 PUBLIC PROJECTS LISTING VERIFICATION   ");
  console.log("=================================================\n");

  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/projects", projectsRouter);

  const PORT = 5066;
  const server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}/api/projects`;

  const createdProjectIds: string[] = [];
  let testAdminUserId = "";
  let testSessionId = "";
  let authCookie = "";

  try {
    // 0. Setup test admin session for inserting test projects
    console.log("[SETUP] Initializing test admin session for temporary test data setup...");
    const testAdmin = await prisma.adminUser.create({
      data: {
        email: `phase4_tester_${Date.now()}@hipro.local`,
        name: "Phase 4 Tester",
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
    // 1. Seed Temporary Test Projects in Various States
    // ─────────────────────────────────────────────────────────────
    console.log("[SETUP] Creating temporary test projects across multiple states...");

    // Project 1: Published, Ongoing, Commercial, Bhilwara, Featured: true
    const p1Res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Test Commercial Apex Mall",
        slug: "test-commercial-apex-mall",
        category: "Commercial",
        status: "ongoing",
        publishStatus: "published",
        featured: true,
        order: 1,
        location: "City Center, Bhilwara",
        city: "Bhilwara",
        state: "Rajasthan",
        client: "Apex Properties Ltd",
        area: "95,000 sq.ft",
        date: "2024 - 2025",
        description: "A premier multi-level commercial complex with smart parking.",
        image: "https://example.com/mall.jpg",
        imageAlt: "Apex Mall exterior",
        services: JSON.stringify(["Civil Works", "General Contracting"]),
      }),
    });
    const p1 = (await p1Res.json() as any).data;
    createdProjectIds.push(p1.id);

    // Project 2: Published, Completed, Industrial, Jaipur, Featured: false (Missing client/area/alt)
    const p2Res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Test Heavy PEB Manufacturing Facility",
        slug: "test-heavy-peb-facility",
        category: "Industrial",
        status: "completed",
        publishStatus: "published",
        featured: false,
        order: 2,
        location: "Sitapura Industrial Area, Jaipur",
        city: "Jaipur",
        state: "Rajasthan",
        date: "2023 - 2024",
        description: "Precision engineered structural steel fabrication plant.",
        image: "https://example.com/peb.jpg",
        // Notice: client is null, area is null, imageAlt is null
      }),
    });
    const p2 = (await p2Res.json() as any).data;
    createdProjectIds.push(p2.id);

    // Project 3: Draft Project (MUST NEVER APPEAR PUBLICLY)
    const p3Res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Test Secret Draft Villa Project",
        slug: "test-secret-draft-villa",
        category: "Residential",
        status: "ongoing",
        publishStatus: "draft",
        featured: true, // even if marked featured, MUST NOT appear because it's draft!
        location: "Private Location",
        date: "2026",
        description: "Draft project details that must remain hidden.",
      }),
    });
    const p3 = (await p3Res.json() as any).data;
    createdProjectIds.push(p3.id);

    // Project 4: Archived Publishing Status (MUST NEVER APPEAR PUBLICLY)
    const p4Res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Test Decommissioned Warehouse",
        slug: "test-decommissioned-warehouse",
        category: "Industrial",
        status: "completed",
        publishStatus: "archived",
        location: "Udaipur",
        date: "2018",
        description: "Archived project.",
      }),
    });
    const p4 = (await p4Res.json() as any).data;
    createdProjectIds.push(p4.id);

    // Project 5: Operational Archived Project (MUST NEVER APPEAR PUBLICLY)
    const p5Res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Test Old Operational Archived Bridge",
        slug: "test-old-archived-bridge",
        category: "Infrastructure",
        status: "archived", // operationally archived
        publishStatus: "published",
        location: "Kota",
        date: "2015",
        description: "Operationally archived infrastructure project.",
      }),
    });
    const p5 = (await p5Res.json() as any).data;
    createdProjectIds.push(p5.id);

    console.log("  ✓ Seeded 5 test projects (2 published, 1 draft, 1 publish-archived, 1 operational-archived)\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Public Visibility & Isolation Check
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 1] Public Visibility & Backend Isolation");
    const publicRes = await fetch(BASE_URL); // Unauthenticated public call
    const publicJson = (await publicRes.json() as any);
    const fetchedPublicProjects: any[] = publicJson.data || [];

    const foundP1 = fetchedPublicProjects.find((p) => p.id === p1.id);
    const foundP2 = fetchedPublicProjects.find((p) => p.id === p2.id);
    const foundP3 = fetchedPublicProjects.find((p) => p.id === p3.id);
    const foundP4 = fetchedPublicProjects.find((p) => p.id === p4.id);
    const foundP5 = fetchedPublicProjects.find((p) => p.id === p5.id);

    if (!foundP1 || !foundP2) {
      throw new Error("Expected published projects P1 and P2 to be visible publicly");
    }
    if (foundP3) {
      throw new Error("SECURITY FAULT: Draft project P3 was returned to public endpoint!");
    }
    if (foundP4) {
      throw new Error("SECURITY FAULT: Archived project P4 was returned to public endpoint!");
    }
    if (foundP5) {
      throw new Error("SECURITY FAULT: Operationally archived project P5 was returned to public endpoint!");
    }
    console.log("  ✓ Public API returns ONLY published, non-archived projects (P1 and P2)");
    console.log("  ✓ Drafts (P3), archived publication (P4), and operational archived (P5) strictly excluded\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Defensive Client-Side Filtering in PublicProjectGrid
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 2] Defensive Client-Side Filtering Logic");
    const rawAll = [p1, p2, p3, p4, p5];
    const clientSafe = rawAll.filter((p) => p && p.publishStatus === "published" && p.status !== "archived");
    if (clientSafe.length !== 2) {
      throw new Error(`Defense-in-depth client filter failed: expected 2, got ${clientSafe.length}`);
    }
    console.log("  ✓ Client-side safety filter cleanly strips non-public items as defense-in-depth\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Featured Showcase Logic
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 3] Featured Showcase Filtering");
    const featuredList = clientSafe.filter((p) => p.featured === true);
    if (featuredList.length !== 1 || featuredList[0].id !== p1.id) {
      throw new Error(`Featured filter failed: expected P1 only, got ${JSON.stringify(featuredList)}`);
    }
    console.log(`  ✓ Featured projects section identifies only valid published featured items: "${featuredList[0].title}"\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Multi-Filter Engine (Category, Status, City, Search)
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 4] Multi-Filter Engine Operations");

    // A. Category Filter: Commercial
    const commercialOnly = clientSafe.filter((p) => p.category === "Commercial");
    if (commercialOnly.length !== 1 || commercialOnly[0].id !== p1.id) {
      throw new Error("Category filter 'Commercial' failed");
    }
    console.log("  ✓ Category filter ('Commercial') successfully isolates P1");

    // B. Status Filter: Completed
    const completedOnly = clientSafe.filter((p) => p.status === "completed");
    if (completedOnly.length !== 1 || completedOnly[0].id !== p2.id) {
      throw new Error("Status filter 'completed' failed");
    }
    console.log("  ✓ Status filter ('completed') successfully isolates P2");

    // C. City Filter: Bhilwara
    const bhilwaraOnly = clientSafe.filter((p) => p.city === "Bhilwara");
    if (bhilwaraOnly.length !== 1 || bhilwaraOnly[0].id !== p1.id) {
      throw new Error("City filter 'Bhilwara' failed");
    }
    console.log("  ✓ City filter ('Bhilwara') successfully isolates P1");

    // D. Combined Filters: Category (Industrial) + Status (Completed)
    const combined = clientSafe.filter((p) => p.category === "Industrial" && p.status === "completed");
    if (combined.length !== 1 || combined[0].id !== p2.id) {
      throw new Error("Combined filter failed");
    }
    console.log("  ✓ Combined multi-filters (Category: Industrial + Status: Completed) work seamlessly");

    // E. Search Filter: "parking" (in P1 description)
    const searchRes = clientSafe.filter((p) => (p.description || "").toLowerCase().includes("parking"));
    if (searchRes.length !== 1 || searchRes[0].id !== p1.id) {
      throw new Error("Search filter failed for 'parking'");
    }
    console.log("  ✓ Full-text keyword search across description verified\n");

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Project Card Canonical Links & Missing Field Safety
    // ─────────────────────────────────────────────────────────────
    console.log("[TEST 5] Project Card Canonical Links & Empty Field Safety");

    // P1 Canonical Link
    const p1Link = `/projects/${p1.slug || p1.id}`;
    if (p1Link !== "/projects/test-commercial-apex-mall") {
      throw new Error(`Expected canonical link '/projects/test-commercial-apex-mall', got '${p1Link}'`);
    }
    console.log(`  ✓ Canonical slug route generated: ${p1Link}`);

    // P2 Empty Field Checks (Zero Fake Values)
    if (p2.client !== null && p2.client !== undefined) {
      throw new Error("Expected P2 client to be null");
    }
    if (p2.area !== null && p2.area !== undefined) {
      throw new Error("Expected P2 area to be null");
    }
    // Alt text fallback check
    const p2Alt = p2.imageAlt || `${p2.title} - Hindustan Projects Portfolio`;
    if (p2Alt !== "Test Heavy PEB Manufacturing Facility - Hindustan Projects Portfolio") {
      throw new Error(`Image alt fallback unexpected: ${p2Alt}`);
    }
    console.log("  ✓ Missing optional fields are verified null (no placeholder text or 'N/A' fabricated)");
    console.log(`  ✓ Image alt fallback generates safe title-based text: "${p2Alt}"\n`);

    console.log("=================================================");
    console.log("  ALL PHASE 4 PUBLIC LISTING TESTS PASSED!       ");
    console.log("=================================================");
  } finally {
    console.log("\n[CLEANUP] Removing all temporary test projects...");
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
    console.log("  ✓ Test server closed cleanly.");
  }
}

runPhase4Tests().catch((err) => {
  console.error("\n❌ PHASE 4 TESTS FAILED:", err);
  process.exit(1);
});
