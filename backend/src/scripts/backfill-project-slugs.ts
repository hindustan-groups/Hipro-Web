import { prisma } from "../lib/db";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function backfillProjectSlugs() {
  console.log("=== RUNNING PURE SLUG BACKFILL ===");

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, location: true, slug: true },
  });

  console.log(`Total projects in database: ${projects.length}`);

  if (projects.length === 0) {
    console.log("No projects found to backfill. Done.");
    return { total: 0, generated: 0, skipped: 0 };
  }

  // Set of all non-empty existing slugs
  const existingSlugs = new Set(
    projects
      .map((p) => p.slug)
      .filter((s): s is string => Boolean(s && s.trim().length > 0))
  );

  let generatedCount = 0;
  let skippedCount = 0;

  for (const project of projects) {
    // Idempotent: If project already has a slug, skip it
    if (project.slug && project.slug.trim().length > 0) {
      skippedCount++;
      continue;
    }

    // 1. Generate base slug from title
    let base = slugify(project.title || "");

    // Deterministic fallback if title yields an empty slug
    if (!base) {
      base = `project-${project.id.slice(-6).toLowerCase()}`;
    }

    let candidate = base;

    // 2. Deterministic collision resolution using verified location if available
    if (existingSlugs.has(candidate) && project.location && project.location.trim()) {
      const locSlug = slugify(project.location.trim());
      if (locSlug) {
        const withLocation = `${base}-${locSlug}`;
        if (!existingSlugs.has(withLocation)) {
          candidate = withLocation;
        }
      }
    }

    // 3. Numerical increment fallback if collision persists
    let counter = 2;
    while (existingSlugs.has(candidate)) {
      candidate = `${base}-${counter}`;
      counter++;
    }

    // PURE UPDATE: ONLY updates the slug column. Zero other fields are touched.
    await prisma.project.update({
      where: { id: project.id },
      data: {
        slug: candidate,
      },
    });

    existingSlugs.add(candidate);
    generatedCount++;
    console.log(`[Slug Backfill] Assigned slug "${candidate}" to project ID: ${project.id}`);
  }

  console.log(`=== PURE SLUG BACKFILL COMPLETE ===`);
  console.log(`Total: ${projects.length} | Generated: ${generatedCount} | Skipped: ${skippedCount}`);

  return { total: projects.length, generated: generatedCount, skipped: skippedCount };
}

if (require.main === module) {
  backfillProjectSlugs()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      prisma.$disconnect();
    });
}
