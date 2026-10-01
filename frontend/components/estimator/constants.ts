import { CityOption, FloorOption, PackageTier, PackageTierId } from "./types";

export const CITIES: CityOption[] = [
  { name: "Bhilwara", multiplier: 1.00, tag: "Headquarters · Direct Material Hub" },
  { name: "Jaipur", multiplier: 1.03, tag: "State Capital · Standard Metro Index" },
  { name: "Udaipur", multiplier: 1.04, tag: "Terrain & Transit Index" },
  { name: "Kota", multiplier: 1.02, tag: "Southeastern Corridor" },
  { name: "Jodhpur", multiplier: 1.03, tag: "Western Region Logistics" },
  { name: "Ajmer", multiplier: 1.02, tag: "Central Rajasthan Logistics" },
  { name: "Chittorgarh", multiplier: 1.00, tag: "Cement & Stone Belt" },
  { name: "Rajsamand", multiplier: 1.00, tag: "Marble Belt Zone" },
  { name: "Other Rajasthan", multiplier: 1.02, tag: "Regional Site Logistics" },
];

export const POPULAR_PRESETS = [
  { label: "100 Gaj", dim: "20 × 45 ft", sqft: 900, gaj: 100, desc: "Standard Compact Home" },
  { label: "139 Gaj", dim: "25 × 50 ft", sqft: 1250, gaj: 139, desc: "Classic Family House" },
  { label: "167 Gaj", dim: "30 × 50 ft", sqft: 1500, gaj: 167, desc: "Most Popular 3BHK Plot" },
  { label: "200 Gaj", dim: "30 × 60 ft", sqft: 1800, gaj: 200, desc: "Spacious Duplex Plot" },
  { label: "267 Gaj", dim: "40 × 60 ft", sqft: 2400, gaj: 267, desc: "Luxury Villa Plot" },
  { label: "333 Gaj", dim: "50 × 60 ft", sqft: 3000, gaj: 333, desc: "Grand Bungalow Plot" },
];

export const FLOOR_CONFIGS: { id: FloorOption; label: string; desc: string; multiplier: number }[] = [
  { id: "g", label: "Ground Only", desc: "Single Storey Cottage / Independent Unit", multiplier: 0.82 },
  { id: "g+1", label: "G + 1 Floor", desc: "Most Popular Duplex / Two Family Unit", multiplier: 1.68 },
  { id: "g+2", label: "G + 2 Floors", desc: "Triplex or Rental Floors + Residence", multiplier: 2.52 },
  { id: "g+3", label: "G + 3 Floors", desc: "Multi-Storey Residential Complex", multiplier: 3.36 },
  { id: "stilt+2", label: "Stilt + 2", desc: "Ground Parking + 2 Upper Residential Floors", multiplier: 2.65 },
  { id: "stilt+3", label: "Stilt + 3", desc: "Ground Stilt Parking + 3 Upper Floors", multiplier: 3.50 },
];

export const TIERS: Record<PackageTierId, PackageTier> = {
  Silver: {
    id: "Silver",
    name: "Silver",
    subtitle: "Standard Quality",
    rate: 1680,
    tagline: "Strong, reliable construction engineered with essential branded materials",
    popular: false,
    color: "from-slate-700 to-slate-900",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
    specs: {
      steel: "Fe550 Grade Branded TMT (Kamdhenu / Moira / Equivalent)",
      cement: "OPC / PPC 43 Grade (Shree / Wonder / JK Laxmi)",
      masonry: "Class-I Kiln-Burned Red Bricks or 8-inch High-Density AAC Blocks",
      flooring: "2×2 ft Double Charge Glazed Vitrified Tiles (₹45–₹50/sqft)",
      bathroom: "Cera / Hindware Sanitaryware with Chrome-Plated Brass Fittings",
      electrical: "Anchor / Polycab FRLS Copper Wires & Anchor Roma Modular Switches",
      doors: "Hardwood Door Frames with Laminated Flush Doors & SS Hardware",
      windows: "Powder-Coated 2-Track Aluminium Sliding Windows with 5mm Glass",
      paint: "Asian Paints Tractor Emulsion (Interior) & Apex Weatherproof (Exterior)",
      elevation: "Modern Plaster Grooves with Dual-Tone Weather-Shield Coating",
      ceilingHeight: "10.0 Feet clear floor-to-ceiling height",
      warranty: "5-Year Structural Integrity Warranty",
    }
  },
  Gold: {
    id: "Gold",
    name: "Gold (Classic)",
    subtitle: "Most Popular Choice",
    rate: 1850,
    tagline: "Top-tier national brands, seismic ductile design & superior architectural craftsmanship",
    popular: true,
    color: "from-amber-600 to-amber-800",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-300",
    specs: {
      steel: "Tata Tiscon / Jindal Panther Fe550D Primary TMT",
      cement: "UltraTech / Ambuja 53 Grade High-Strength Structural Cement",
      masonry: "High-density Red Bricks with RCC Lintel & Sill Bands for Crack-Resistance",
      flooring: "4×2 ft High-Gloss Glazed Vitrified Tiles (Kajaria / Somany, ₹70–₹80/sqft)",
      bathroom: "Jaquar Continental / Essco Wall-Hung Concealed WC with Diverters",
      electrical: "Havells / Polycab Flame-Retardant + Legrand / Crabtree Modular Plates",
      doors: "Teak-Finish Designer Engineered Main Door + Flush Internal Doors",
      windows: "UPVC 2.5-Track Windows with SS Mosquito Wire Mesh (Fenesta Profile)",
      paint: "Asian Paints Royale Luxury Emulsion (Interior) + Apex Ultima Weatherproof",
      elevation: "3D Elevation with Stone Cladding, CNC Metal Jali & Profile Grooves",
      ceilingHeight: "10.5 Feet spacious floor-to-ceiling height",
      warranty: "10-Year Structural Guarantee + 1-Year Free Maintenance Handover",
    }
  },
  Platinum: {
    id: "Platinum",
    name: "Platinum (Premium)",
    subtitle: "Architectural Luxury",
    rate: 2150,
    tagline: "Architect-designed luxury with Italian finishes, acoustic glazing & concealed luxury fixtures",
    popular: false,
    color: "from-blue-700 to-indigo-950",
    badgeColor: "bg-blue-50 text-blue-900 border-blue-300",
    specs: {
      steel: "Tata Tiscon 550D Super Ductile (High-Seismic Earthquake Resistance)",
      cement: "UltraTech Super / ACC Concrete Plus Anti-Efflorescence Grade",
      masonry: "Aerated Precision AAC Blocks / Wire-cut Sound-Insulated Red Bricks",
      flooring: "6×4 ft Large Format Polished Vitrified Slabs / Select Indian Royal Marble",
      bathroom: "Kohler / Grohe Concealed Diverters, Rain Showers & Soft-Close Wall-Hung WC",
      electrical: "Schneider Electric / Legrand Arteor Smart-Ready Wiring & RCCB Protection",
      doors: "Solid Teak Wood 8ft Grand Entry Door + Flush Teak Veneer for all bedrooms",
      windows: "Heavy-Duty Schuco / Fenesta UPVC Acoustic Double-Glazed Noise-Proof Glass",
      paint: "Asian Paints Royale Aspira (Teflon-Coated) + Exterior Natural Stone Cladding",
      elevation: "High-End Villa Elevation with HPL Cladding, WPC Louvers & Indirect LED",
      ceilingHeight: "11.0 Feet grand floor-to-ceiling luxury height",
      warranty: "10-Year Structural Guarantee + 2-Year Comprehensive Support",
    }
  },
  Royale: {
    id: "Royale",
    name: "Royale (Signature)",
    subtitle: "Ultra Luxury Estate",
    rate: 2450,
    tagline: "Bespoke palatial finishes, imported Italian marble, smart automation & cantilever architecture",
    popular: false,
    color: "from-rose-900 to-black",
    badgeColor: "bg-purple-50 text-purple-900 border-purple-300",
    specs: {
      steel: "Tata Tiscon 550D SD + Anti-Corrosive Epoxy Coated Basement/Footings",
      cement: "UltraTech WeatherShield / Micro-Silica Modified High-Strength Mix",
      masonry: "Acoustic Cavity Walls / Precision High-Performance Insulation Blocks",
      flooring: "Imported Natural Italian Marble (Dyna / Statuario / Botticino) in Living & Master",
      bathroom: "Grohe SmartControl Thermostatic Showers & Geberit Concealed Cisterns",
      electrical: "Full Smart Home Automation Conduit + Lutron / Havells Fabio Touch Controls",
      doors: "Handcrafted 8.5ft Burma Teak Doors with Biometric Smart Digital Yale Locks",
      windows: "Slim-Line Thermal-Break Aluminium Architectural Glass Systems",
      paint: "PU Italian Stucco Finishes + Natural Jodhpur Sandstone & Corten Steel Elevation",
      elevation: "Signature Cantilever Design with Vertical Landscaping & Facade Illumination",
      ceilingHeight: "11.5–12.0 Feet majestic estate height",
      warranty: "15-Year Structural Integrity Warranty + 3-Year Concierge Maintenance",
    }
  }
};

export const ADDONS_LIST = [
  {
    id: "modularKitchen" as const,
    title: "Designer Modular Kitchen",
    subtitle: "Marine-ply carcass, acrylic/PU shutters, quartz/granite top, soft-close Blum/Hettich fittings",
    baseCost: 210000,
    tag: "Interior"
  },
  {
    id: "falseCeiling" as const,
    title: "Designer False Ceiling & Ambient Lighting",
    subtitle: "Saint-Gobain Gyproc false ceiling with Philips/Havells warm white LED COB downlights & cove lighting",
    perSqftRate: 75,
    tag: "Interior"
  },
  {
    id: "waterSumpSeptic" as const,
    title: "10,000L RCC Sump & Septic Tank",
    subtitle: "Heavy RCC underground rainwater/municipal storage tank + 3-chamber biological septic tank",
    baseCost: 135000,
    tag: "Civil Works"
  },
  {
    id: "boundaryGate" as const,
    title: "Boundary Wall & Designer Gate",
    subtitle: "Plastered 9-inch brick boundary wall with coping + heavy MS laser-cut designer main gate",
    baseCost: 145000,
    tag: "Civil Works"
  },
  {
    id: "solarRooftop" as const,
    title: "3kW On-Grid Rooftop Solar Power",
    subtitle: "Tier-1 Mono PERC half-cut solar panels + grid-tie inverter + net-metering liaisoning assistance",
    baseCost: 185000,
    tag: "Energy"
  }
];

export const STAGE_DISTRIBUTIONS = [
  { name: "Foundation & Substructure", pct: 15, desc: "Excavation, Anti-termite treatment, PCC, RCC Footings & Plinth Beams" },
  { name: "RCC Superstructure", pct: 24, desc: "Columns, Beams, Reinforced Slabs, Staircases & Structural Concrete" },
  { name: "Brick Masonry & Plastering", pct: 16, desc: "Class-I Brick walls, Internal sand-face plaster, Waterproofing membranes" },
  { name: "Flooring & Tiling", pct: 12, desc: "Vitrified tiles / Natural marble, skirting, bathroom anti-skid tiles & wall dado" },
  { name: "Plumbing, Sanitary & MEP", pct: 12, desc: "Concealed CPVC/UPVC water lines, drainage shafts, electrical conduit & DBs" },
  { name: "Doors, Windows & Railings", pct: 10, desc: "Door frames, pre-hung flush doors, UPVC/Aluminium windows, SS/Glass railings" },
  { name: "Painting & Exterior Facade", pct: 8, desc: "Waterproof putty, primer coats, interior luxury emulsion, exterior elevation finish" },
  { name: "Final QC & Handover", pct: 3, desc: "Chemical tile cleaning, 140+ point snags audit, fixture commissioning & keys handover" },
];

export const PAYMENT_MILESTONES = [
  { milestone: "Booking & Architectural Planning", percentage: 5, stage: "Soil testing, Vastu 2D/3D floor layouts, structural CAD designs" },
  { milestone: "Excavation & Foundation Footing", percentage: 10, stage: "Site leveling, PCC bed, rebar reinforcement and column starters" },
  { milestone: "Plinth Level & Anti-Termite", percentage: 10, stage: "Plinth beam casting, gravel backfilling, chemical termite barrier" },
  { milestone: "Ground Floor Slab Casting", percentage: 15, stage: "Centering, shuttering, electrical conduit laying & machine-mixed concrete" },
  { milestone: "Upper Floor(s) Slab Casting", percentage: 15, stage: "Upper columns, cantilever beams, slab casting & rooftop parapet" },
  { milestone: "Brick Masonry & Plastering", percentage: 15, stage: "Internal & external brickwork, door frames fixing, internal plaster" },
  { milestone: "Flooring, Electrical & Plumbing", percentage: 15, stage: "Tiles/marble laying, concealed wiring, bathroom sanitaryware fitting" },
  { milestone: "Painting & Elevation Completion", percentage: 10, stage: "Putty coats, interior/exterior paint, exterior elevation cladding" },
  { milestone: "Quality Audit & Final Handover", percentage: 5, stage: "Deep cleaning, final snag inspection, warranty certificate & handover" },
];
