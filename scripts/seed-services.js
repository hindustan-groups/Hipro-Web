const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const services = [
  { 
    title: "Architecture Planning", 
    icon: "PencilRuler", 
    description: "Delivering visionary architectural blueprints that perfectly balance aesthetic brilliance with structural pragmatism. Our master planners utilize advanced BIM technology to design sustainable, future-ready spaces.", 
    features: JSON.stringify(["Feasibility & Master Planning", "3D Building Information Modeling (BIM)", "Sustainable & Green Design (LEED)", "Municipal Permitting & Compliance", "Concept & Schematic Design"]),
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Structure Analysis", 
    icon: "Activity", 
    description: "Ensuring absolute safety and longevity through rigorous structural engineering. We employ cutting-edge finite element analysis to guarantee that every foundation and framework can withstand extreme environmental demands.", 
    features: JSON.stringify(["Finite Element Analysis (FEA)", "Seismic & Wind Load Testing", "Foundation & Soil Interaction", "Structural Integrity Diagnostics", "Retrofitting & Strengthening"]),
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Interior & Exterior", 
    icon: "Home", 
    description: "Crafting compelling environments inside and out. From high-performance exterior facades that define city skylines to ergonomic, premium interior fit-outs that inspire productivity and comfort.", 
    features: JSON.stringify(["Curtain Wall & Facade Engineering", "Premium Commercial Fit-outs", "Ergonomic Space Optimization", "Lighting & Acoustic Design", "Bespoke Material Sourcing"]),
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Construction Services", 
    icon: "HardHat", 
    description: "Best-in-class general contracting and turnkey execution. Our seasoned site engineers and project managers ensure that every brick is laid with uncompromising quality, strictly adhering to global safety standards.", 
    features: JSON.stringify(["Turnkey General Contracting", "Heavy Equipment & Machinery", "On-site Safety Management", "Supply Chain & Procurement", "Quality Control Inspections"]),
    image: "https://images.unsplash.com/photo-1541888081622-15cb2a21e422?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Property Developer", 
    icon: "Building2", 
    description: "Shaping the future of urban landscapes through strategic real estate development. We manage the entire property lifecycle, from strategic land acquisition to delivering high-yield commercial and residential assets.", 
    features: JSON.stringify(["Strategic Land Acquisition", "Market & Feasibility Studies", "Project Finance & Structuring", "Asset Lifecycle Management", "Sales & Marketing Strategy"]),
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Surveying", 
    icon: "Map", 
    description: "Precision topographical mapping and land surveying to form the bedrock of accurate engineering. Utilizing state-of-the-art GPS and drone technology to map terrains with millimeter-level accuracy.", 
    features: JSON.stringify(["Drone-based Aerial Mapping", "Topographic & Boundary Surveys", "Subsurface Utility Engineering", "3D Laser Scanning", "Geodetic Control Surveys"]),
    image: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Estimation", 
    icon: "Calculator", 
    description: "Data-driven cost engineering and robust financial planning. Our expert estimators deliver precise Bills of Quantities (BOQs) and value engineering solutions to maximize ROI without compromising quality.", 
    features: JSON.stringify(["Detailed Bill of Quantities (BOQ)", "Value Engineering & Cost Optimization", "Market Material Pricing Analysis", "Tender Document Preparation", "Lifecycle Costing"]),
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Civil Structure Testing", 
    icon: "TestTube", 
    description: "Unyielding quality assurance through state-of-the-art material testing. Our certified laboratories conduct exhaustive non-destructive testing to verify the strength and compliance of concrete, steel, and soil.", 
    features: JSON.stringify(["Non-Destructive Testing (NDT)", "Concrete Compressive Strength", "Soil Bearing Capacity Analysis", "Steel Tensile Testing", "Environmental Impact Audits"]),
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Project Management", 
    icon: "Briefcase", 
    description: "Flawless execution driven by proactive risk management and timeline optimization. We act as the central nervous system of your build, aligning stakeholders and accelerating delivery milestones.", 
    features: JSON.stringify(["Critical Path Method (CPM) Scheduling", "Risk Mitigation & Safety Audits", "Multi-stakeholder Coordination", "Budget Tracking & Variance Analysis", "Agile Milestone Delivery"]),
    image: "https://images.unsplash.com/photo-1504307651254-35680f356f12?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    title: "Water Treatment Plant", 
    icon: "Droplets", 
    description: "Designing and constructing highly efficient water and wastewater infrastructure. We deliver sustainable environmental engineering solutions that ensure clean water distribution and safe industrial effluent treatment.", 
    features: JSON.stringify(["Reverse Osmosis (RO) Plant Design", "Industrial Effluent Treatment", "Municipal Pumping Stations", "Pipeline Network Engineering", "Environmental Compliance Verification"]),
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
