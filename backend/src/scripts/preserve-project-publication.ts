import { prisma } from "../lib/db";

export async function preserveProjectPublication() {
  console.log("=== PRESERVING EXISTING PROJECT PUBLICATION STATES ===");

  try {
    // 1. Preserve active/completed projects as published
    const publishedResult = await prisma.project.updateMany({
      where: {
        status: { in: ["active", "completed", "ongoing"] },
        publishStatus: "draft"
      },
      data: {
        publishStatus: "published",
      }
    });
    console.log(`Updated ${publishedResult.count} active/completed projects to publishStatus: 'published'.`);

    // 2. Preserve archived projects as archived (never publish)
    const archivedResult = await prisma.project.updateMany({
      where: {
        status: "archived",
      },
      data: {
        publishStatus: "archived",
        publishedAt: null,
      }
    });
    console.log(`Preserved ${archivedResult.count} archived projects to publishStatus: 'archived'.`);

    console.log("Publication preservation complete.");
  } catch (error) {
    console.error("Error during publication preservation:", error);
  }
}

if (require.main === module) {
  preserveProjectPublication()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      prisma.$disconnect();
    });
}
