import { findAll, insertOne } from "./lib/db";
import type { Project } from "./lib/types";

const dummyProjects: Omit<Project, "id">[] = [
  {
    title: "The Grand Horizon Luxury Villas",
    category: "Residential",
    location: "Worli, South Mumbai, Maharashtra",
    date: "2024",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85"
    ]),
    description: "Ultra-luxury gated community with 18 bespoke sea-facing villas, private infinity pools, and LEED Platinum certified sustainable architectural engineering.",
    featured: true,
    status: "completed"
  },
  {
    title: "Apex Nexus Commercial IT Tower",
    category: "Commercial",
    location: "Hitec City, Hyderabad, Telangana",
    date: "2024",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85"
    ]),
    description: "32-story state-of-the-art tech campus with glass-curtain facade, seismic vibration isolators, and energy-efficient BMS automation.",
    featured: true,
    status: "completed"
  },
  {
    title: "Zenith Global Logistics & Warehousing Hub",
    category: "Industrial",
    location: "Chakan Industrial Zone, Pune, Maharashtra",
    date: "2023",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1200&q=85"
    ]),
    description: "Spanning 450,000 sq.ft of pre-engineered industrial warehousing with heavy-load laser-screed flooring and automated loading docks.",
    featured: false,
    status: "completed"
  },
  {
    title: "Metro Riverfront Elevated Viaduct & Bridge",
    category: "Infrastructure",
    location: "Sabarmati Riverfront, Ahmedabad, Gujarat",
    date: "2024",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&q=85",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=85"
    ]),
    description: "Heavy civil infrastructure project comprising 6.2 km of prestressed concrete elevated transit viaduct and aesthetic cable-stayed river span.",
    featured: true,
    status: "ongoing"
  },
  {
    title: "Emerald Heights Eco-Residences",
    category: "Residential",
    location: "Whitefield, Bengaluru, Karnataka",
    date: "2023",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85",
    images: JSON.stringify([]),
    description: "Twin 28-floor high-rise residential towers equipped with rainwater harvesting, rooftop solar parks, and landscaped sky gardens.",
    featured: false,
    status: "completed"
  },
  {
    title: "The Pavilion High-Street Retail Galleria",
    category: "Commercial",
    location: "Golf Course Extension Road, Gurugram, Haryana",
    date: "2024",
    image: "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1200&q=85",
    images: JSON.stringify([]),
    description: "Modern open-concept commercial plaza featuring premium retail outlets, sunken amphitheater, and multi-tier subterranean parking.",
    featured: true,
    status: "ongoing"
  }
];

async function seed() {
  const existing = await findAll<Project>("projects");
  console.log(`Current projects count in DB: ${existing.length}`);
  
  for (const p of dummyProjects) {
    const duplicate = existing.find(e => e.title === p.title);
    if (!duplicate) {
      const doc = await insertOne<Project>("projects", {
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Added project: "${p.title}" (ID: ${doc.id})`);
    } else {
      console.log(`Skipped existing: "${p.title}"`);
    }
  }

  const updatedList = await findAll<Project>("projects");
  console.log(`Total projects in DB now: ${updatedList.length}`);
}

seed().catch(err => {
  console.error("Error seeding projects:", err);
  process.exit(1);
});
