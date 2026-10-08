import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HBS_SERVICES_SEED = [
  {
    serviceNumber: "01",
    title: "Structure Repair",
    hindiTitle: "संरचना मरम्मत एवं मजबूतीकरण",
    slug: "structure-repair",
    shortDescription: "Specialized crack injection, RCC column strengthening, structural restoration, and beam reinforcement for residential and commercial structures.",
    fullDescription: "Hind Building Solutions provides advanced structural diagnostics and rehabilitation services. Using industrial-grade epoxy injection, polymer-modified mortars, and micro-concreting, we restore load-bearing capacities and structural integrity to weathered or distressed concrete frames.",
    icon: "ShieldAlert",
    features: JSON.stringify([
      "RCC Column & Beam Strengthening",
      "Epoxy & Polyurethane Crack Injection",
      "Rebar Anti-Corrosion Treatment",
      "Structural Load & Integrity Audits"
    ]),
    order: 1,
  },
  {
    serviceNumber: "02",
    title: "Water Leakage Solution",
    hindiTitle: "वाटर लीकेज एवं सीलन समाधान",
    slug: "water-leakage-solution",
    shortDescription: "Permanent waterproofing and moisture barrier solutions for roofs, basements, wet walls, and bathrooms without destructive breaking.",
    fullDescription: "Eliminate dampness, efflorescence (shora), and persistent ceiling drips permanently. HBS utilizes elastomeric polyurethane coatings, crystalline penetration barriers, and pressure grouting to seal positive and negative side leakages.",
    icon: "Droplets",
    features: JSON.stringify([
      "Terrace Waterproofing Membranes",
      "Wall Seepage & Dampness Elimination",
      "Basement Pressure Grouting",
      "Bathroom & Sunken Slab Sealing"
    ]),
    order: 2,
  },
  {
    serviceNumber: "03",
    title: "Plumbing & Electrical",
    hindiTitle: "प्लंबिंग एवं इलेक्ट्रिकल कार्य",
    slug: "plumbing-and-electrical",
    shortDescription: "Concealed pipeline leak detection, CPVC/UPVC pipe repairs, sanitization fixtures, and comprehensive sanitary maintenance.",
    fullDescription: "From acoustic pipe leak pinpointing to complete bathroom drainage overhauls and water pressure boosting systems, our certified plumbers resolve recurring plumbing failures with high-grade fittings.",
    icon: "Wrench",
    features: JSON.stringify([
      "Concealed Pipe Leak Detection",
      "Pressure Booster Pump Maintenance",
      "Drainage & Sewage Line Restoration",
      "Sanitary Fixture Replacements"
    ]),
    order: 3,
  },
  {
    serviceNumber: "04",
    title: "Painting & Wall Repair",
    hindiTitle: "पेंटिंग एवं वॉल रिपेयर",
    slug: "painting-and-wall-repair",
    shortDescription: "Weatherproof exterior elastomeric coatings, anti-fungal interior luxury finishes, and plaster crack remediation.",
    fullDescription: "Premium painting services engineered for longevity in high-heat and monsoon conditions. Includes surface preparation, putty skimming, moisture-resistant primers, and branded weather-shield applications.",
    icon: "Paintbrush",
    features: JSON.stringify([
      "Exterior Weatherproof Emulsions",
      "Anti-Fungal Interior Luxury Coatings",
      "Plaster Crack Leveling & Skimming",
      "Texture & Protective Wall Finishes"
    ]),
    order: 4,
  },
  {
    serviceNumber: "05",
    title: "Terrace & Bird Protection",
    hindiTitle: "छत एवं पक्षी सुरक्षा",
    slug: "terrace-and-bird-protection",
    shortDescription: "UV-stabilized anti-bird netting, pigeon spikes, solar panel bird guards, and heat-reflective terrace floor treatments.",
    fullDescription: "Prevent structural fouling, respiratory hazards, and balcony damage from pigeons and birds. We install heavy-duty UV-stabilized nylon netting and stainless steel spikes that preserve aesthetics without harming birds.",
    icon: "Bird",
    features: JSON.stringify([
      "Balcony & Duct Bird Netting",
      "Stainless Steel Bird Spikes",
      "Solar Panel Underside Mesh",
      "Terrace Heat-Reflective Sealants"
    ]),
    order: 5,
  },
  {
    serviceNumber: "06",
    title: "Termite Control",
    hindiTitle: "दीमक एवं कीट नियंत्रण",
    slug: "termite-control",
    shortDescription: "Pre-construction & post-construction drill-and-fill chemical termite barriers with comprehensive warranty guarantees.",
    fullDescription: "Defend wooden fixtures, doors, and foundation perimeters from subterranean termite devastation. HBS deploys odorless, government-approved termiticides injected into foundation perimeters and woodwork.",
    icon: "Bug",
    features: JSON.stringify([
      "Post-Construction Drill-Inject-Seal",
      "Door Frame & Woodwork Protection",
      "Chemical Perimeter Soil Treatment",
      "Long-Term Warranty Coverage"
    ]),
    order: 6,
  },
  {
    serviceNumber: "07",
    title: "Tile Work",
    hindiTitle: "टाइल एवं फ्लोरिंग कार्य",
    slug: "tile-work",
    shortDescription: "Hollow tile regrouting, broken tile replacements, epoxy grouting, vitrified flooring, and anti-skid bathroom solutions.",
    fullDescription: "Precision floor and wall tiling for residences, industrial kitchens, and terraces. Our master tile masons fix loose or sounding tiles, apply chemical-resistant epoxy grout, and level irregular substrates.",
    icon: "Layers",
    features: JSON.stringify([
      "Epoxy Grout Application",
      "Hollow & Cracked Tile Restoration",
      "Anti-Skid Bathroom & Kitchen Tiling",
      "Large-Format Slab Installation"
    ]),
    order: 7,
  },
  {
    serviceNumber: "08",
    title: "AC, Lift & Solar",
    hindiTitle: "एसी, लिफ्ट एवं सोलर सिस्टम",
    slug: "ac-lift-and-solar",
    shortDescription: "Rooftop solar panel maintenance, HVAC/AC chemical coil cleaning, elevator safety inspection, and duct services.",
    fullDescription: "Integrated electro-mechanical servicing covering rooftop solar panel output cleaning, split/cassette AC servicing and gas charging, as well as elevator preventative maintenance coordination.",
    icon: "Sun",
    features: JSON.stringify([
      "Solar Rooftop Cleaning & Inverter Checks",
      "AC Deep Chemical Wash & Refrigerant Care",
      "Elevator Mechanical Maintenance",
      "Energy Efficiency Audits"
    ]),
    order: 8,
  },
  {
    serviceNumber: "09",
    title: "Electrical & Machine Work",
    hindiTitle: "इलेक्ट्रिकल एवं मशीन वर्क",
    slug: "electrical-and-machine-work",
    shortDescription: "Three-phase load balancing, short-circuit diagnostics, MCB/DB upgrades, diesel generator & motor maintenance.",
    fullDescription: "Certified electricians equipped with thermal imagers to identify overloaded circuits, faulty distribution boards, loose cabling, and motor vibration anomalies before catastrophic failure occurs.",
    icon: "Zap",
    features: JSON.stringify([
      "Distribution Board (DB) Overhaul",
      "Short-Circuit & Earth Fault Diagnostics",
      "Motor & Water Pump Servicing",
      "Industrial & Residential Rewiring"
    ]),
    order: 9,
  },
  {
    serviceNumber: "10",
    title: "Safety & Compliance",
    hindiTitle: "सुरक्षा एवं अनुपालन",
    slug: "safety-and-compliance",
    shortDescription: "Fire extinguisher servicing, smoke detection systems, fire exit compliance, lightning arrester testing, and structural audits.",
    fullDescription: "Ensure your commercial complex or residential building complies with state safety codes. We inspect fire protection infrastructure, refill cylinders, test earthing resistance, and provide safety compliance certificates.",
    icon: "ShieldCheck",
    features: JSON.stringify([
      "Fire Extinguisher Refilling & Audits",
      "Smoke & Heat Detector Maintenance",
      "Lightning Arrester & Earthing Testing",
      "Emergency Exit Signage & Lighting"
    ]),
    order: 10,
  },
  {
    serviceNumber: "11",
    title: "Gardening",
    hindiTitle: "गार्डनिंग एवं लैंडस्केप रखरखाव",
    slug: "gardening",
    shortDescription: "Lawn grooming, vertical gardens, automatic drip irrigation repair, organic fertilization, and seasonal pruning.",
    fullDescription: "Maintain lush, healthy gardens and rooftop terrace greens. Our horticulturists handle tree pruning, soil nourishment, seasonal pest defense, and smart drip irrigation system installation.",
    icon: "Flower2",
    features: JSON.stringify([
      "Lawn Mowing & Turf Renovation",
      "Automatic Drip Irrigation Repair",
      "Vertical Garden & Terrace Planting",
      "Organic Pest Control & Fertilization"
    ]),
    order: 11,
  },
  {
    serviceNumber: "12",
    title: "Cleaning Services",
    hindiTitle: "गहरी सफाई एवं सैनिटाइजेशन",
    slug: "cleaning-services",
    shortDescription: "Post-construction deep cleaning, mechanized floor scrubbing, overhead water tank sanitization, and facade washing.",
    fullDescription: "Industrial-grade sanitation and deep hygiene solutions for properties before move-in or during seasonal turnover. Includes high-pressure water jet washing and UV tank sterilization.",
    icon: "Sparkles",
    features: JSON.stringify([
      "Underground & Overhead Tank Cleaning",
      "Mechanized Single-Disc Floor Polishing",
      "Post-Renovation Dust Extraction",
      "Kitchen & Bathroom Sterilization"
    ]),
    order: 12,
  },
  {
    serviceNumber: "13",
    title: "Packers & Movers",
    hindiTitle: "पैकर्स एवं मूवर्स",
    slug: "packers-and-movers",
    shortDescription: "Safe residential relocation, office shifting, professional multi-layer packaging, and transit insurance support.",
    fullDescription: "Hassle-free moving managed by trained relocation handlers. We use bubble wrap, corrugated sheets, and heavy-duty corner guards to guarantee zero damage to fragile furniture and appliances.",
    icon: "Truck",
    features: JSON.stringify([
      "Multi-Layer Protective Packing",
      "Careful Heavy Furniture Dismantling",
      "Dedicated Enclosed Transport",
      "Unpacking & Room Arrangement"
    ]),
    order: 13,
  },
  {
    serviceNumber: "14",
    title: "CCTV & Security",
    hindiTitle: "सीसीटीवी एवं सुरक्षा प्रणाली",
    slug: "cctv-and-security",
    shortDescription: "High-definition IP surveillance, DVR/NVR maintenance, biometric access control, and video intercom installations.",
    fullDescription: "Protect residents and commercial assets with reliable 24/7 security tech. We handle camera alignment, remote mobile app streaming setup, cabling replacement, and gate access automation.",
    icon: "Camera",
    features: JSON.stringify([
      "IP & HD CCTV Camera Installation",
      "DVR/NVR Storage & Remote View Setup",
      "Video Door Phone & Intercom",
      "Biometric & RFID Access Gates"
    ]),
    order: 14,
  },
  {
    serviceNumber: "15",
    title: "Smart Home Automation",
    hindiTitle: "स्मार्ट होम ऑटोमेशन",
    slug: "smart-home-automation",
    shortDescription: "Smart lighting modules, voice-activated controls, automated curtain motors, and smartphone security integration.",
    fullDescription: "Upgrade existing buildings into connected smart environments without disruptive wall hacking. Control lights, air conditioning, motorized curtains, and main door locks from anywhere in the world.",
    icon: "Smartphone",
    features: JSON.stringify([
      "Retrofit Smart Touch Switches",
      "Smartphone & Voice Assistant Control",
      "Motorized Curtains & Blinds",
      "Smart Water Tank Level Automation"
    ]),
    order: 15,
  },
  {
    serviceNumber: "16",
    title: "Furniture Work",
    hindiTitle: "फर्नीचर एवं काष्ठ कार्य",
    slug: "furniture-work",
    shortDescription: "Cabinet repair, wooden door realignment, modular kitchen refurbishment, lock replacements, and custom carpentry.",
    fullDescription: "Skilled carpenters resolve swollen doors, squeaking hinges, damaged modular kitchen tracks, loose laminates, and sagging wardrobes with high-precision hardware.",
    icon: "Armchair",
    features: JSON.stringify([
      "Modular Kitchen Track & Hinge Repair",
      "Door Shaving & Lock Replacement",
      "Laminate Pasting & Edge-Banding",
      "Custom Wardrobe & Storage Adjustments"
    ]),
    order: 16,
  },
  {
    serviceNumber: "17",
    title: "Wall Decor & Wallpaper",
    hindiTitle: "वॉल डेकोर एवं वॉलपेपर",
    slug: "wall-decor-and-wallpaper",
    shortDescription: "Custom wallpaper installation, 3D fluted wall panels, louvers, acoustic padding, and designer accent wall styling.",
    fullDescription: "Elevate interior spaces with seamless designer wallpaper and modern wall paneling. We fix peeling borders, seal background moisture, and install seamless geometric or textured wall coverings.",
    icon: "LayoutGrid",
    features: JSON.stringify([
      "Seamless Imported Wallpaper Pasting",
      "Charcoal & WPC Louver Wall Paneling",
      "Acoustic & Fabric Accent Walls",
      "Moisture-Isolated Wall Liners"
    ]),
    order: 17,
  },
  {
    serviceNumber: "18",
    title: "Facade Work (ACP & Glass)",
    hindiTitle: "फसाड वर्क (एसीपी एवं ग्लास)",
    slug: "facade-work-acp-glass",
    shortDescription: "ACP sheet cladding replacement, spider glass repair, silicone weather sealing, and high-rise facade cleaning.",
    fullDescription: "Architectural facade repair and revitalisation for commercial towers and showrooms. We repair loose ACP panels, replace broken toughened glass, and reseal silicone joints against monsoon ingress.",
    icon: "Building2",
    features: JSON.stringify([
      "ACP Sheet Repair & Re-Alignment",
      "Toughened Glass & Glazing Fixes",
      "Silicone Weather Sealing Grouting",
      "Rope-Access High-Rise Facade Care"
    ]),
    order: 18,
  },
  {
    serviceNumber: "19",
    title: "Fabrication Work",
    hindiTitle: "फेब्रिकेशन एवं मेटल वर्क",
    slug: "fabrication-work",
    shortDescription: "Mild steel (MS) & stainless steel (SS) railings, safety gates, shed fabrication, welding repairs, and laser-cut screens.",
    fullDescription: "Sturdy, rust-protected metalwork for safety and architecture. Our welding technicians build and repair terrace shed structures, balcony railings, security grilles, and automated sliding gates.",
    icon: "Hammer",
    features: JSON.stringify([
      "SS & MS Balcony Railings",
      "Security Grilles & Main Entry Gates",
      "Rooftop Shed & Polycarbonate Canopy",
      "On-Site Arc & Gas Welding Repairs"
    ]),
    order: 19,
  },
];

const DEFAULT_HBS_CONTENT = {
  id: "singleton",
  brandName: "Hind Building Solutions",
  logo: "/logo.jpg",
  tagline: "Complete Building Repair, Maintenance, Protection & Services",
  phone: "+91 75970 00601",
  whatsapp: "+91 75970 00601",
  email: "hbs@hindustanprojects.in",
  address: "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001",
  businessHours: "Mon - Sat: 9:00 AM - 7:00 PM (Emergency Repair on Call)",
  socialLinks: JSON.stringify({
    instagram: "https://www.instagram.com/hindustan_projects/",
    facebook: "",
    linkedin: "https://linkedin.com/company/hindustanprojects",
    pinterest: "https://pin.it/5OlMWwi2w"
  }),
  ctaSettings: JSON.stringify({
    primaryButtonText: "Book Inspection / Get Quote",
    secondaryButtonText: "WhatsApp Us",
    phone: "7597000601",
    urgentNotice: "Emergency water leakage or structural distress? Call directly for priority technician dispatch."
  }),
  heroTitle: "Complete Building Repair, Maintenance & Protection",
  heroSubtitle: "Engineering-grade repair, waterproofing, electrical, pest control, and building maintenance solutions for homes, commercial complexes, and institutions across Rajasthan.",
  heroImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop",
  heroCtas: JSON.stringify([
    { label: "Book Free Inspection", link: "/hbs/contact", variant: "primary" },
    { label: "View All Services", link: "/hbs/services", variant: "secondary" }
  ]),
  whyChooseUs: JSON.stringify([
    { title: "Parent Company Engineering Oversight", description: "Backed by Hindustan Projects (HiPRO) civil engineers and certified site supervisors.", icon: "ShieldCheck" },
    { title: "Non-Destructive Modern Diagnosis", description: "Advanced moisture meters and pipe leak scanners prevent unnecessary breaking.", icon: "Cpu" },
    { title: "Guaranteed Work & Verified Materials", description: "Only industrial-grade chemicals, certified sealants, and premium hardware used.", icon: "Award" },
    { title: "Rapid Turnaround Across Rajasthan", description: "Dedicated quick-response technicians stationed in Bhilwara and central regions.", icon: "Clock" }
  ]),
  stats: JSON.stringify([
    { label: "Repair Services", value: "Turnkey" },
    { label: "Buildings Protected", value: "350+" },
    { label: "Customer Satisfaction", value: "98%" },
    { label: "Engineering Heritage", value: "Since 2019" }
  ]),
  homeFinalCta: JSON.stringify({
    heading: "Does Your Building Suffer From Leakage, Cracks, or Aging Fixtures?",
    subheading: "Schedule a non-destructive site inspection with Hind Building Solutions today. Get transparent estimations without hidden charges.",
    buttonText: "Schedule Inspection",
    phone: "+91 75970 00601"
  }),
  aboutStory: "Hind Building Solutions (HBS) was founded under Hindustan Projects (HiPRO) to bridge the massive gap between informal local handymen and large civil contractors. Modern buildings represent substantial investments, yet minor moisture ingress, foundation settlements, and electrical wear frequently turn into catastrophic structural hazards. HBS brings certified engineering discipline, non-destructive diagnosis, and turnkey accountability to building maintenance and protection across Rajasthan.",
  mission: "To extend the functional life, aesthetic dignity, and structural safety of every residential, commercial, and industrial property through dependable, engineering-grade maintenance.",
  vision: "To be Rajasthan's most trusted single-window building maintenance and protection brand, synonymous with integrity, speed, and lasting craftsmanship.",
  team: JSON.stringify([
    { name: "Civil Engineering Core", role: "Structural & Diagnostic Oversight", desc: "Supervised by Hindustan Projects senior engineering team." },
    { name: "Specialized Field Technicians", role: "Waterproofing & Mechanical", desc: "Certified applicators for Dr. Fixit, Fosroc, and Sika chemical systems." },
    { name: "Rapid Service Response", role: "Customer Operations & Dispatch", desc: "Ensuring timely inspections and transparent digital estimates." }
  ]),
  whyChoosePoints: JSON.stringify([
    { title: "Single-Window Convenience", desc: "No need to juggle 5 different unverified contractors. All specialized building services under one trusted brand." },
    { title: "Written Work Guarantee", desc: "Documented warranty on waterproofing, structural rehabilitation, and pest control treatments." },
    { title: "Transparent Pricing", desc: "Itemized estimations with clear material specifications before any work begins." }
  ]),
  aboutImages: JSON.stringify([
    "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop"
  ]),
  metaTitle: "Hind Building Solutions (HBS) | Building Repair, Maintenance & Protection",
  metaDescription: "Professional building repair, waterproofing, painting, termite control, electrical, and facility maintenance services by Hind Building Solutions (HBS), a Hindustan Projects company.",
  canonicalUrl: "https://hindbuilding.hindustanprojects.in",
  ogImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop"
};

async function seed() {
  console.log("Seeding Hind Building Solutions (HBS) data locally...");

  // 1. Seed or update HbsContent singleton
  await prisma.hbsContent.upsert({
    where: { id: "singleton" },
    update: DEFAULT_HBS_CONTENT,
    create: DEFAULT_HBS_CONTENT,
  });
  console.log("✔ HBS Content Singleton initialized.");

  // 2. Seed all 19 HBS Services
  for (const s of HBS_SERVICES_SEED) {
    await prisma.hbsService.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`✔ All ${HBS_SERVICES_SEED.length} HBS Services seeded successfully.`);
}

seed()
  .catch((e) => {
    console.error("HBS Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
