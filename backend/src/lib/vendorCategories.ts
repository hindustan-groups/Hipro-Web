export interface CanonicalSubcategory {
  slug: string;
  name: string;
  nameHindi: string;
  description: string;
  sortOrder: number;
}

export interface CanonicalCategory {
  slug: string;
  name: string;
  nameHindi: string;
  description: string;
  icon: string;
  sortOrder: number;
  subcategories: CanonicalSubcategory[];
}

/**
 * 6 Canonical Master Categories and 30 Approved Subcategories
 * Approved in Phase 2C.1 Database Foundation Architecture Report.
 */
export const CANONICAL_VENDOR_CATEGORIES: CanonicalCategory[] = [
  {
    slug: "civil-construction",
    name: "Civil Construction",
    nameHindi: "आरसीसी एवं चिनाई",
    description: "RCC structural works, masonry, and general civil construction",
    icon: "hard-hat",
    sortOrder: 1,
    subcategories: [
      {
        slug: "rcc-foundations-footings",
        name: "RCC Foundations & Footings",
        nameHindi: "आरसीसी नींव एवं फुटिंग",
        description: "Excavation, footings, raft, and foundation RCC works",
        sortOrder: 1,
      },
      {
        slug: "masonry-brickwork",
        name: "Masonry & Brickwork",
        nameHindi: "चिनाई एवं ईंट कार्य",
        description: "Red brick, AAC block, and stone masonry works",
        sortOrder: 2,
      },
      {
        slug: "shuttering-scaffolding",
        name: "Shuttering & Scaffolding",
        nameHindi: "शटरिंग एवं पाड़",
        description: "Formwork, shuttering plates, and scaffolding systems",
        sortOrder: 3,
      },
      {
        slug: "structural-concrete-works",
        name: "Structural Concrete Works",
        nameHindi: "संरचनात्मक कंक्रीट कार्य",
        description: "Columns, beams, slabs, and shear wall structural concreting",
        sortOrder: 4,
      },
      {
        slug: "plastering-civil-finishing",
        name: "Plastering & Civil Finishing",
        nameHindi: "प्लास्टर एवं फिनिशिंग",
        description: "Internal/external cement sand plaster and civil touchups",
        sortOrder: 5,
      },
    ],
  },
  {
    slug: "electrical-mep",
    name: "Electrical & MEP",
    nameHindi: "विद्युत एवं सबस्टेशन",
    description: "Electrical power distribution, substations, lighting, and MEP",
    icon: "zap",
    sortOrder: 2,
    subcategories: [
      {
        slug: "electrical-installation",
        name: "Electrical Installation",
        nameHindi: "विद्युत स्थापना कार्य",
        description: "Internal wiring, conduit piping, and electrical fittings",
        sortOrder: 1,
      },
      {
        slug: "substation-transformer-works",
        name: "Substation & Transformer Works",
        nameHindi: "सबस्टेशन एवं ट्रांसफॉर्मर",
        description: "HT/LT substation installation, transformers, and switchyards",
        sortOrder: 2,
      },
      {
        slug: "ht-lt-panel-cabling",
        name: "HT/LT Panel & Cabling",
        nameHindi: "एचटी/एलटी पैनल एवं केबलिंग",
        description: "Distribution boards, busbars, and power cable laying",
        sortOrder: 3,
      },
      {
        slug: "lighting-systems",
        name: "Lighting Systems",
        nameHindi: "प्रकाश व्यवस्था प्रणाली",
        description: "High-bay industrial lights, street lighting, and floodlights",
        sortOrder: 4,
      },
      {
        slug: "fire-alarm-electrical-safety",
        name: "Fire Alarm & Electrical Safety",
        nameHindi: "फायर अलार्म एवं विद्युत सुरक्षा",
        description: "Fire smoke detection systems, earthing, and lightning arresters",
        sortOrder: 5,
      },
    ],
  },
  {
    slug: "plumbing-sanitation",
    name: "Plumbing & Sanitation",
    nameHindi: "प्लंबिंग कार्य",
    description: "Water supply piping, drainage, industrial plumbing, and sanitary systems",
    icon: "wrench",
    sortOrder: 3,
    subcategories: [
      {
        slug: "water-supply-systems",
        name: "Water Supply Systems",
        nameHindi: "जल आपूर्ति प्रणाली",
        description: "CPVC/GI water supply line piping, tanks, and valves",
        sortOrder: 1,
      },
      {
        slug: "sewerage-drainage",
        name: "Sewerage & Drainage",
        nameHindi: "सीवरेज एवं ड्रेनेज",
        description: "SWR drainage pipelines, chamber construction, and manholes",
        sortOrder: 2,
      },
      {
        slug: "sanitary-installation",
        name: "Sanitary Installation",
        nameHindi: "सैनिटरी फिटिंग स्थापना",
        description: "Sanitaryware fixtures, faucets, and bathroom fittings",
        sortOrder: 3,
      },
      {
        slug: "industrial-plumbing",
        name: "Industrial Plumbing",
        nameHindi: "औद्योगिक प्लंबिंग",
        description: "Effluent treatment piping, chilled water lines, and compressed air pipes",
        sortOrder: 4,
      },
      {
        slug: "pumping-systems",
        name: "Pumping Systems",
        nameHindi: "पंपिंग स्टेशन एवं प्रणाली",
        description: "Hydro-pneumatic pumps, submersible pumps, and booster systems",
        sortOrder: 5,
      },
    ],
  },
  {
    slug: "fabrication-peb",
    name: "Fabrication & PEB",
    nameHindi: "फैब्रिकेशन एवं स्टील",
    description: "Pre-engineered buildings, structural steel fabrication, and sheds",
    icon: "building-2",
    sortOrder: 4,
    subcategories: [
      {
        slug: "structural-steel-fabrication",
        name: "Structural Steel Fabrication",
        nameHindi: "स्ट्रक्चरल स्टील फैब्रिकेशन",
        description: "Heavy section fabrication, built-up beams, and columns",
        sortOrder: 1,
      },
      {
        slug: "pre-engineered-buildings",
        name: "Pre-Engineered Buildings",
        nameHindi: "प्री-इंजीनियर्ड भवन - PEB",
        description: "Turnkey PEB shed design, fabrication, and site assembly",
        sortOrder: 2,
      },
      {
        slug: "industrial-sheds",
        name: "Industrial Sheds",
        nameHindi: "औद्योगिक शेड निर्माण",
        description: "Factory sheds, warehouse enclosures, and canopies",
        sortOrder: 3,
      },
      {
        slug: "steel-erection-installation",
        name: "Steel Erection & Installation",
        nameHindi: "स्टील इरेक्शन एवं स्थापना",
        description: "Crane erection, alignment, torque tightening, and grouting",
        sortOrder: 4,
      },
      {
        slug: "welding-metal-works",
        name: "Welding & Metal Works",
        nameHindi: "वेल्डिंग एवं मेटल वर्क्स",
        description: "MIG/TIG welding, staircases, handrails, and rolling shutters",
        sortOrder: 5,
      },
    ],
  },
  {
    slug: "flooring-finishing",
    name: "Flooring & Finishing",
    nameHindi: "फ्लोरिंग एवं फिनिशिंग",
    description: "Industrial flooring, wall finishing, glazing, and waterproofing",
    icon: "paintbrush",
    sortOrder: 5,
    subcategories: [
      {
        slug: "industrial-flooring",
        name: "Industrial Flooring",
        nameHindi: "औद्योगिक ट्रिमिक्स एवं एपॉक्सी फ्लोरिंग",
        description: "Tremix / VDF flooring, epoxy coatings, and floor hardeners",
        sortOrder: 1,
      },
      {
        slug: "tile-stone-flooring",
        name: "Tile & Stone Flooring",
        nameHindi: "टाइल्स एवं कोटा स्टोन फ्लोरिंग",
        description: "Vitrified tiles, Kota stone, granite, and marble laying",
        sortOrder: 2,
      },
      {
        slug: "waterproofing",
        name: "Waterproofing",
        nameHindi: "वाटरप्रूफिंग समाधान",
        description: "Basement, terrace, and sunken slab waterproofing systems",
        sortOrder: 3,
      },
      {
        slug: "painting-coating",
        name: "Painting & Coating",
        nameHindi: "पेंटिंग एवं वेदरकोट कोटिंग",
        description: "Internal emulsion, external weather-proof, and anti-corrosive paint",
        sortOrder: 4,
      },
      {
        slug: "interior-exterior-finishing",
        name: "Interior & Exterior Finishing",
        nameHindi: "आंतरिक एवं बाहरी फिनिशिंग",
        description: "False ceiling, aluminum partition, structural glazing, and cladding",
        sortOrder: 5,
      },
    ],
  },
  {
    slug: "material-supply",
    name: "Material Supply",
    nameHindi: "निर्माण सामग्री",
    description: "Supply of cement, structural steel, aggregates, bricks, and raw materials",
    icon: "truck",
    sortOrder: 6,
    subcategories: [
      {
        slug: "cement-concrete-materials",
        name: "Cement & Concrete Materials",
        nameHindi: "सीमेंट एवं रेडी-मिक्स कंक्रीट",
        description: "OPC/PPC bagged cement and bulk Ready-Mix Concrete (RMC)",
        sortOrder: 1,
      },
      {
        slug: "steel-tmt-supply",
        name: "Steel & TMT Supply",
        nameHindi: "स्टील एवं टीएमटी सरिया",
        description: "Fe-550D TMT rebar, binding wire, and MS sections supply",
        sortOrder: 2,
      },
      {
        slug: "bricks-blocks",
        name: "Bricks & Blocks",
        nameHindi: "ईंटें एवं फ्लाई ऐश ब्लॉक्स",
        description: "Fly-ash blocks, red clay bricks, and paver blocks",
        sortOrder: 3,
      },
      {
        slug: "sand-aggregates",
        name: "Sand & Aggregates",
        nameHindi: "रेत एवं गिट्टी एग्रीगेट",
        description: "Washed river/crushed sand, 10mm/20mm/40mm coarse aggregates",
        sortOrder: 4,
      },
      {
        slug: "electrical-plumbing-materials",
        name: "Electrical & Plumbing Materials",
        nameHindi: "विद्युत एवं प्लंबिंग सामग्री",
        description: "Pipes, conduits, cables, switches, and valves bulk supply",
        sortOrder: 5,
      },
    ],
  },
];
