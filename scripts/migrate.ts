import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), "data");

function readJSON(filename: string) {
  try {
    const file = path.join(DATA_DIR, filename);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
  }
  return [];
}

async function main() {
  console.log("Starting migration from JSON to SQLite...");

  // 1. Settings
  const settingsData = readJSON("settings.json");
  if (settingsData.length > 0) {
    for (const setting of settingsData) {
      await prisma.settings.create({
        data: {
          id: setting.id || "global",
          cloudinaryCloudName: setting.cloudinaryCloudName || "",
          cloudinaryUploadPreset: setting.cloudinaryUploadPreset || "",
        },
      });
    }
    console.log(`Migrated ${settingsData.length} settings.`);
  }

  // 2. Hero Slides
  const heroData = readJSON("hero.json");
  for (const slide of heroData) {
    await prisma.heroSlide.create({
      data: {
        id: slide.id,
        image: slide.image,
        tagline: slide.tagline,
        title: slide.title,
        subtitle: slide.subtitle,
        order: slide.order || 0,
        active: slide.active !== false,
      },
    });
  }
  console.log(`Migrated ${heroData.length} hero slides.`);

  // 3. Projects
  const projectsData = readJSON("projects.json");
  for (const proj of projectsData) {
    await prisma.project.create({
      data: {
        id: proj.id,
        title: proj.title,
        category: proj.category,
        location: proj.location,
        date: proj.date,
        image: proj.image,
        description: proj.description,
        featured: proj.featured || false,
        status: proj.status || "active",
      },
    });
  }
  console.log(`Migrated ${projectsData.length} projects.`);

  // 4. Services
  const servicesData = readJSON("services.json");
  for (const srv of servicesData) {
    await prisma.service.create({
      data: {
        id: srv.id,
        title: srv.title,
        description: srv.description,
        icon: srv.icon,
        features: JSON.stringify(srv.features || []),
        image: srv.image,
        order: srv.order || 0,
        active: srv.active !== false,
      },
    });
  }
  console.log(`Migrated ${servicesData.length} services.`);

  // 5. Testimonials
  const testimonialsData = readJSON("testimonials.json");
  for (const t of testimonialsData) {
    await prisma.testimonial.create({
      data: {
        id: t.id,
        name: t.name,
        role: t.role,
        image: t.image || null,
        rating: t.rating || 5,
        text: t.text,
        approved: t.approved !== false,
      },
    });
  }
  console.log(`Migrated ${testimonialsData.length} testimonials.`);

  // 6. Stats
  const statsData = readJSON("stats.json");
  for (const s of statsData) {
    await prisma.stats.create({
      data: {
        id: s.id,
        label: s.label,
        value: s.value,
        icon: s.icon,
        order: s.order || 0,
      },
    });
  }
  console.log(`Migrated ${statsData.length} stats.`);

  // 7. Contacts
  const contactsData = readJSON("contacts.json");
  for (const c of contactsData) {
    await prisma.contactMessage.create({
      data: {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || null,
        service: c.service || null,
        message: c.message,
        status: c.status || "new",
      },
    });
  }
  console.log(`Migrated ${contactsData.length} contacts.`);

  // 8. Quotes
  const quotesData = readJSON("quotes.json");
  for (const q of quotesData) {
    await prisma.quoteRequest.create({
      data: {
        id: q.id,
        name: q.name,
        email: q.email,
        phone: q.phone,
        projectType: q.projectType,
        budget: q.budget,
        location: q.location,
        description: q.description,
        timeline: q.timeline || null,
        status: q.status || "pending",
      },
    });
  }
  console.log(`Migrated ${quotesData.length} quotes.`);

  // 9. Newsletter
  const newsletterData = readJSON("newsletter.json");
  for (const n of newsletterData) {
    await prisma.newsletterSubscriber.create({
      data: {
        id: n.id,
        email: n.email,
        active: n.active !== false,
      },
    });
  }
  console.log(`Migrated ${newsletterData.length} subscribers.`);

  console.log("Migration Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
