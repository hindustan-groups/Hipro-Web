const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const services = [
  { 
    title: "Architecture Planning", 
    icon: "PencilRuler", 
    description: "Comprehensive architectural design and space planning solutions.", 
    features: JSON.stringify(["Site Evaluation", "Concept Design", "Permit Drawings"]),
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Structure Analysis", 
    icon: "Activity", 
    description: "In-depth structural analysis ensuring safety, stability, and durability.", 
    features: JSON.stringify(["Load Testing", "Seismic Analysis", "Structural Integrity"]),
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Interior & Exterior", 
    icon: "Home", 
    description: "Beautifully crafted interiors and resilient exterior facades for any project.", 
    features: JSON.stringify(["Facade Design", "Interior Layouts", "Material Selection"]),
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Construction Services", 
    icon: "HardHat", 
    description: "End-to-end construction execution from foundation to finishing.", 
    features: JSON.stringify(["General Contracting", "Site Management", "Quality Assurance"]),
    image: "https://images.unsplash.com/photo-1541888081622-15cb2a21e422?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Property Developer", 
    icon: "Building2", 
    description: "Real estate development strategies and property lifecycle management.", 
    features: JSON.stringify(["Land Acquisition", "Feasibility Studies", "Project Finance"]),
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Surveying", 
    icon: "Map", 
    description: "Accurate land surveying and topographical mapping for precision building.", 
    features: JSON.stringify(["Topographic Surveys", "Boundary Marking", "GPS Mapping"]),
    image: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Estimation", 
    icon: "Calculator", 
    description: "Detailed Bill of Quantities (BOQ) and cost estimation services.", 
    features: JSON.stringify(["Cost Planning", "Material Takeoffs", "Value Engineering"]),
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Civil Structure Testing", 
    icon: "TestTube", 
    description: "Rigorous testing of materials and civil structures for compliance.", 
    features: JSON.stringify(["Concrete Testing", "Soil Analysis", "Non-Destructive Testing"]),
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Project Management", 
    icon: "Briefcase", 
    description: "Expert oversight to ensure projects are delivered on time and on budget.", 
    features: JSON.stringify(["Timeline Planning", "Resource Allocation", "Risk Management"]),
    image: "https://images.unsplash.com/photo-1504307651254-35680f356f12?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Water Treatment Plant", 
    icon: "Droplets", 
    description: "Specialized engineering and construction for water treatment facilities.", 
    features: JSON.stringify(["Plant Design", "Pipeline Installation", "Environmental Compliance"]),
    image: "https://images.unsplash.com/photo-1520112702656-7871b563462a?auto=format&fit=crop&q=80&w=1200" 
  },
];

async function main() {
  console.log("Seeding services...");
  
  await prisma.service.deleteMany({});
  console.log("Cleared existing services.");

  let order = 1;
  for (const s of services) {
    await prisma.service.create({
      data: {
        ...s,
        active: true,
        order: order++,
      }
    });
    console.log(`Created service: ${s.title}`);
  }
  console.log("Done.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
