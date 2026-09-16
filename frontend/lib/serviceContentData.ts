/**
 * VERIFIED SERVICE CONTENT DATA FOR HINDUSTAN PROJECTS (HiPRO)
 * Source of truth for Phase 20F-B service page content expansion.
 * All content strictly grounded in verified company and engineering facts.
 * Absolutely NO unverified software, equipment, concrete/steel brands, certifications, or guarantees.
 */

import { safeJsonParse } from "./blogUtils";
import type { Service } from "./types";

export interface ServiceFeatureDetail {
  title: string;
  description: string;
  points?: string[];
}

export interface ServiceApplication {
  title: string;
  description: string;
}

export interface ServiceStage {
  step: string;
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceDetailContent {
  canonicalSlug: string;
  aliases: string[];
  serviceTitle: string;
  badge: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  overviewHeading: string;
  overviewParagraphs: string[];
  detailedCapabilities: ServiceFeatureDetail[];
  applicationsHeading: string;
  applications: ServiceApplication[];
  stagesHeading: string;
  stages: ServiceStage[];
  deliverablesHeading: string;
  deliverables: string[];
  whyChooseHeading: string;
  whyChoosePoints: { title: string; description: string }[];
  faqs: ServiceFaq[];
  indicativeRatesNotice?: {
    heading: string;
    description: string;
    tiers: { name: string; rate: string; highlight: string }[];
  };
}

export const SERVICE_CONTENT_MAP: Record<string, ServiceDetailContent> = {
  "architecture-planning": {
    canonicalSlug: "architecture-planning",
    aliases: ["architcture-planning", "architecture-planning"],
    serviceTitle: "Architecture & Planning",
    badge: "Architectural & Structural Engineering",
    tagline: "Integrated Spatial Layouts, 3D Master Planning & Structural Coordination",
    metaTitle: "Architectural Planning & Structural Design Services in Bhilwara | HiPRO",
    metaDescription: "Comprehensive architectural planning, 3D site master layouts, and structural engineering designs for residential, commercial, and industrial builds in Bhilwara and Rajasthan.",
    overviewHeading: "Architectural Blueprinting Grounded in Structural Feasibility",
    overviewParagraphs: [
      "Hindustan Projects delivers integrated architectural planning and structural design coordination across Bhilwara and the wider Rajasthan region. Every successful build begins with disciplined spatial analysis—balancing functional circulation, structural safety, climate orientation, and regional municipal development norms.",
      "Whether planning an independent residential villa, a commercial complex, or an industrial warehousing shed, our in-house engineering team translates owner requirements into synchronized, buildable blueprints. Because our engineers also oversee on-site civil construction, our architectural documentation directly eliminates the ambiguities, contractor clashes, and expensive rework that often occur during field execution."
    ],
    detailedCapabilities: [
      {
        title: "Master Site Planning & 3D Spatial Modeling",
        description: "Evaluating plot dimensions, approach road levels, natural sun orientation, and ground contours to engineer cohesive master layouts. We produce dimensioned 2D floor plans alongside detailed 3D architectural perspectives so property owners can evaluate spatial proportions, daylight penetration, and exterior rooflines before construction begins.",
        points: [
          "Micro-climate analysis optimizing natural airflow and daylight in Rajasthan's climate",
          "Functional space zoning separating private, social, and service areas cleanly",
          "Photorealistic 3D elevations visualizing materials, colors, and massing"
        ]
      },
      {
        title: "Structural Engineering & RCC Load Analysis",
        description: "Architectural aesthetics must rest upon mathematical structural stability. Our civil engineering team calculates complete reinforced cement concrete (RCC) frames, column-beam networks, footing depths, and slab thickness schedules engineered to withstand combined dead loads, live loads, and regional seismic considerations.",
        points: [
          "Foundation sizing calculated according to local soil bearing conditions",
          "Balanced column-beam layouts eliminating awkward structural obstructions within rooms",
          "Reinforcement bar-bending and structural placement schedules ensuring structural durability"
        ]
      },
      {
        title: "Sanction Blueprints & Technical Documentation",
        description: "Preparing complete technical blueprint packages aligned with local Rajasthan municipal bylaws and development authority guidelines. We generate coordinated working drawing sets covering detailed wall dimensions, door and window schedules, staircase geometry, and integrated utility conduits.",
        points: [
          "Compliance with local ground coverage, floor-area ratios, and mandatory boundary setbacks",
          "Coordinated architectural sections detailing floor-to-floor heights and parapet levels",
          "Integrated electrical conduit and plumbing piping route coordination"
        ]
      }
    ],
    applicationsHeading: "Project Types We Plan",
    applications: [
      {
        title: "Residential Homes & Villas",
        description: "Modern independent bungalows, duplex residences, and joint-family houses planned for privacy, natural ventilation, and long-term utility."
      },
      {
        title: "Commercial & Retail Complexes",
        description: "Multi-story retail hubs, office spaces, and mixed-use commercial properties optimized for customer circulation, parking, and fire safety."
      },
      {
        title: "Industrial Warehouses & Sheds",
        description: "Factory floor layouts, industrial sheds, and logistical warehousing designed with clear spans, loading docks, and utility distribution."
      }
    ],
    stagesHeading: "Coordinated Planning Stages",
    stages: [
      {
        step: "01",
        title: "Site Assessment & Spatial Brief",
        description: "Evaluating property dimensions, road access, and owner requirements to define project scope and municipal setback boundaries."
      },
      {
        step: "02",
        title: "Conceptual Floor Planning",
        description: "Drafting optimized floor layouts prioritizing room connectivity, natural light, cross-ventilation, and structural grid alignment."
      },
      {
        step: "03",
        title: "3D Elevation & Massing Design",
        description: "Developing exterior perspectives, parapet profiles, and surface finish palettes for owner review and refinement."
      },
      {
        step: "04",
        title: "Structural Engineering Detailing",
        description: "Producing complete RCC structural frame schedules, footing reinforcement details, and slab specifications."
      },
      {
        step: "05",
        title: "Working Drawing Issue",
        description: "Issuing complete, dimensioned construction-ready blueprint packages for on-site execution and contractor coordination."
      }
    ],
    deliverablesHeading: "Confirmed Planning Deliverables",
    deliverables: [
      "Dimensioned 2D Architectural Floor Plans & Sections",
      "Exterior 3D Architectural Elevation Perspectives",
      "Complete Structural RCC Working Drawings & Schedules",
      "Door, Window, and Surface Opening Schedules",
      "Coordinated Electrical & Plumbing (MEP) Schematic Layouts",
      "Submission-Ready Municipal Sanction Drawing Sets"
    ],
    whyChooseHeading: "Why HiPRO for Architectural Planning",
    whyChoosePoints: [
      {
        title: "Seamless Design-to-Construction Handoff",
        description: "Unlike standalone creative studios, HiPRO is an active construction firm. We design structures that can be practically, safely, and economically built on-site."
      },
      {
        title: "Deep Rajasthan Building Context",
        description: "Based in Bhilwara, our engineers possess hands-on familiarity with local soil profiles, regional climate conditions, and municipal building norms."
      },
      {
        title: "Integrated Service Coordination",
        description: "Pre-planning electrical and plumbing conduits into structural drawings prevents damaging concrete beam chipping during later construction phases."
      }
    ],
    faqs: [
      {
        question: "What drawings are included in an architectural planning package?",
        answer: "Our complete planning package includes dimensioned floor plans, sectional elevations, 3D exterior perspectives, door/window schedules, structural RCC drawings (footings, columns, beams, slabs), and coordinated electrical and plumbing conduit schematics."
      },
      {
        question: "How does structural engineering coordination protect our construction investment?",
        answer: "Professional structural analysis mathematically sizes columns, beams, and foundation depths based on actual building loads. This eliminates hazardous under-engineering while avoiding wasteful, costly over-engineering of steel and concrete."
      },
      {
        question: "Can Hindustan Projects handle both architectural design and turnkey construction?",
        answer: "Yes. As an engineering and infrastructure firm, HiPRO bridges the gap between architectural blueprints and on-site civil execution, offering single-point accountability from concept to final handover."
      },
      {
        question: "What information is needed to begin architectural planning for a plot?",
        answer: "To start, our team requires plot dimensions (or a digital survey map), road access details, your list of required spaces (number of bedrooms, floors, parking needs), and approximate budget goals."
      }
    ]
  },

  "professional-construction-services": {
    canonicalSlug: "professional-construction-services",
    aliases: ["professional-construction-services", "construction"],
    serviceTitle: "Professional Construction Services",
    badge: "Turnkey Civil Construction",
    tagline: "Turnkey Civil Execution, Heavy Structural RCC & Quality-Controlled Building",
    metaTitle: "Turnkey Construction Services in Bhilwara & Rajasthan | Hindustan Projects",
    metaDescription: "Professional civil construction services, heavy RCC structural works, and turnkey commercial and residential execution in Bhilwara and across Rajasthan.",
    overviewHeading: "Engineered Construction Delivering Enduring Structural Integrity",
    overviewParagraphs: [
      "Hindustan Projects provides turnkey civil construction services across Bhilwara and Rajasthan, delivering residential villas, commercial complexes, and industrial infrastructure built to endure. Backed by 8+ years of engineering experience and over 150 completed projects, our construction division combines structured milestone management with rigorous on-site trade supervision.",
      "From deep foundation excavation and reinforced cement concrete (RCC) framework to precision masonry, plastering, and weather-resistant finishes, we execute the entire civil construction lifecycle under unified accountability. We eliminate contractor fragmentation, keeping your project strictly on schedule and within verified financial parameters."
    ],
    detailedCapabilities: [
      {
        title: "Heavy RCC & Structural Steel Works",
        description: "Precision casting of reinforced concrete foundations, plinth beams, columns, and floor slabs. For commercial and industrial facilities, our structural teams assemble heavy steel framework, portal trusses, and composite assemblies with millimeter alignment to ensure lifetime stability.",
        points: [
          "Carefully managed concrete casting minimizing cold joints and honeycombing",
          "Accurate reinforcement rebar tying according to approved structural drawings",
          "Mandatory water curing schedules maintained for full structural strength"
        ]
      },
      {
        title: "Turnkey Residential & Commercial Execution",
        description: "Complete building delivery encompassing solid masonry, external sand-face and internal smooth plastering, waterproofing of wet areas, flooring installation, and concealed MEP line integration. The asset is delivered fully finished and ready for occupancy.",
        points: [
          "High-grade brick and block masonry ensuring straight, plumb wall lines",
          "Multi-layer moisture barrier waterproofing across roofs, basements, and wet areas",
          "Concealed electrical and plumbing piping pressure-tested before wall plastering"
        ]
      },
      {
        title: "On-Site Material Assurance & Trade Supervision",
        description: "Uncompromising inspection of every batch of raw materials entering the site. Our civil engineers verify cement freshness, sand silt ratios, aggregate cleanliness, and rebar dimensions before work commences, enforcing strict workmanship across all masonry, steel, and concrete trades.",
        points: [
          "Inspection of incoming sand, coarse aggregate, and cement before mixing",
          "Supervised concrete mixing and placement ensuring proper compaction",
          "Daily site logbooks tracking labor deployment, material usage, and milestone progress"
        ]
      }
    ],
    applicationsHeading: "Construction Sectors We Deliver",
    applications: [
      {
        title: "Turnkey Residential Homes & Villas",
        description: "Single and multi-floor residences engineered with robust foundation depth, moisture-resistant masonry, and premium architectural finishing."
      },
      {
        title: "Commercial & Institutional Complexes",
        description: "Multi-story retail hubs, office complexes, and educational buildings designed for high footfall durability and safety compliance."
      },
      {
        title: "Industrial Facilities & Compounds",
        description: "Heavy equipment foundations, factory sheds, reinforced concrete shop floors, and secure perimeter infrastructure."
      }
    ],
    stagesHeading: "Sequential Construction Stages",
    stages: [
      {
        step: "01",
        title: "Substructure & Foundation",
        description: "Site clearance, excavation, anti-termite ground treatment, PCC base bed, foundation reinforcement, and plinth beam casting."
      },
      {
        step: "02",
        title: "Superstructure RCC Framing",
        description: "Sturdy formwork shuttering, structural steel rebar tying, concrete pouring, and systematic monitored water curing."
      },
      {
        step: "03",
        title: "Masonry & Structural Enclosure",
        description: "Brick and block wall construction for exterior envelopes and interior partitions with proper lintel bond beams."
      },
      {
        step: "04",
        title: "Concealed Utilities & Plastering",
        description: "Channeling electrical conduits and plumbing lines into walls before applying smooth internal and protective external plaster."
      },
      {
        step: "05",
        title: "Finishes, Flooring & Handover",
        description: "Waterproofing application, vitrified tile or stone flooring, fixture mounting, final quality snag-list audit, and client handover."
      }
    ],
    deliverablesHeading: "What Our Turnkey Clients Receive",
    deliverables: [
      "Completed Structural RCC Frame & Load-Bearing Masonry",
      "Smooth Internal Plaster & Weather-Shield External Sand-Face Plaster",
      "Pressure-Tested Concealed Plumbing & Conduit Electrical Infrastructure",
      "Multi-Layer Waterproofing Across Wet Areas & Roof Terraces",
      "High-Precision Flooring, Door Framing, and Sanitary Ware Installations",
      "Milestone-Verified Handover Documentation & Inspection Punch-Lists"
    ],
    whyChooseHeading: "Why HiPRO for Civil Construction",
    whyChoosePoints: [
      {
        title: "8+ Years & 150+ Completed Projects",
        description: "A proven execution track record delivering residential, commercial, and industrial developments throughout Bhilwara and Rajasthan."
      },
      {
        title: "Milestone-Based Financial Transparency",
        description: "Construction expenditures are tied directly to verifiable physical milestones on-site, giving property owners complete budget visibility."
      },
      {
        title: "30+ Dedicated Technical Specialists",
        description: "Our in-house team of civil engineers and site supervisors remains on-site daily to inspect curing times, mortar ratios, and alignment."
      }
    ],
    indicativeRatesNotice: {
      heading: "Indicative Residential Construction Rates",
      description: "Our online Cost Estimator provides indicative package planning rates for residential projects in Rajasthan. Final quotations reflect site-specific blueprints, soil conditions, and custom finish choices.",
      tiers: [
        { name: "Basic", rate: "₹1,680 / sqft", highlight: "Essential structural RCC, red brick masonry, and durable standard tile finishes." },
        { name: "Classic", rate: "₹1,840 / sqft", highlight: "Upgraded vitrified tile flooring, enhanced door framing, and branded sanitary ware." },
        { name: "Premium", rate: "₹2,110 / sqft", highlight: "Superior architectural finishes, designer bathroom fittings, and textured elevation." },
        { name: "Royale", rate: "₹2,270 / sqft", highlight: "Luxury execution with marble flooring options, false ceiling, and exterior facade detailing." }
      ]
    },
    faqs: [
      {
        question: "What does turnkey construction include at Hindustan Projects?",
        answer: "Turnkey construction covers the entire civil process from initial excavation and foundation casting to RCC framework, masonry, internal/external plastering, concealed plumbing and electrical conduits, tile flooring, and final finishes ready for occupancy."
      },
      {
        question: "How does HiPRO maintain quality control on construction sites?",
        answer: "Our full-time site engineers verify rebar spacing before every concrete pour, inspect raw cement and aggregate quality, check wall plumbness, and enforce mandatory 14 to 21-day water curing schedules on all structural concrete."
      },
      {
        question: "Are the package rates on the Cost Estimator fixed for every project?",
        answer: "Rates shown on our Cost Estimator (₹1,680–₹2,270/sqft) are indicative planning benchmarks for residential builds. An accurate, binding project estimate is prepared after reviewing your architectural drawings, soil conditions, and specific material selections."
      },
      {
        question: "Can HiPRO build on a plot if blueprints were drawn by an independent architect?",
        answer: "Yes. Our construction division regularly executes builds based on client-provided blueprints. We conduct a preliminary engineering review to verify structural buildability before site mobilization."
      }
    ]
  },

  "surveying-site-measurements": {
    canonicalSlug: "surveying-site-measurements",
    aliases: ["surveying", "surveying-site-measurements"],
    serviceTitle: "Surveying & Site Measurements",
    badge: "Site Engineering & Geospatial Measurements",
    tagline: "High-Precision Digital Land Surveying, Contour Mapping & Boundary Demarcation",
    metaTitle: "Land Surveying & Site Measurement Services in Bhilwara | HiPRO",
    metaDescription: "High-precision digital land surveying, topographic contour mapping, and GPS boundary demarcations for construction planning in Bhilwara and Rajasthan.",
    overviewHeading: "Accurate Geospatial Data to Anchor Your Construction Planning",
    overviewParagraphs: [
      "Hindustan Projects provides high-precision digital land surveying and site measurement services across Bhilwara and Rajasthan. Commencing architectural planning or construction without verified topographical data invites serious risks: boundary disputes with neighbors, unexpected earthwork costs, improper plinth levels, and chronic drainage issues.",
      "Utilizing electronic Total Station equipment and digital GPS positioning instruments, our engineering surveyors map legal property boundaries, elevation spot levels, and natural contour gradients. We deliver clean, millimeter-accurate digital terrain data that gives property owners, developers, and architects complete confidence before ground is broken."
    ],
    detailedCapabilities: [
      {
        title: "Topographic & Contour Surveys",
        description: "Mapping surface elevation variations, natural slope gradients, spot levels, and contours at specified intervals across your plot. This critical data guides building plinth heights, foundation step designs, and natural gravity-based stormwater runoff planning.",
        points: [
          "Spot level mapping relative to permanent municipal road benchmarks",
          "Detailed contour elevation intervals identifying low-lying depression zones",
          "Location mapping of existing physical features including utility poles, trees, and adjoining walls"
        ]
      },
      {
        title: "Total Station & GPS Boundary Demarcation",
        description: "Pinpointing legal perimeter boundaries, corner angles, road centerlines, and municipal setback offsets with electronic digital accuracy. We eliminate ambiguous tape measurements, providing clear on-ground pegging that secures your property lines.",
        points: [
          "Precision coordinate recording tied to permanent physical reference points",
          "Verification of on-ground boundary dimensions against title deed measurements",
          "Corner coordinate tables preventing encroachment and boundary ambiguity"
        ]
      },
      {
        title: "Volumetric & Earthwork Calculations",
        description: "Calculating precise cut-and-fill quantities for plot leveling, basement excavations, and foundation trenches. Our digital 3D terrain models provide verifiable earthwork volume figures, preventing contractor over-billing on excavation and soil transport.",
        points: [
          "Pre-excavation baseline ground level recording across a dense grid",
          "Mathematical cut-and-fill volume computation for site grading and leveling",
          "Transparent volume audit sheets supporting fair earthwork contractor billing"
        ]
      }
    ],
    applicationsHeading: "Surveying Scenarios We Support",
    applications: [
      {
        title: "Pre-Purchase & Pre-Design Plot Validation",
        description: "Verifying actual physical plot dimensions and road frontage before purchasing land or commissioning architectural floor plans."
      },
      {
        title: "Residential Plots & Large Farmhouses",
        description: "Establishing natural drainage slopes, driveway grades, and perimeter fencing lines across undulating residential acreages."
      },
      {
        title: "Industrial & Factory Campuses",
        description: "Grid leveling, heavy machinery foundation leveling, and internal roadway alignment across multi-acre industrial plots."
      }
    ],
    stagesHeading: "Our Digital Surveying Process",
    stages: [
      {
        step: "01",
        title: "Benchmark Establishment",
        description: "Establishing stable temporary benchmarks (TBM) tied to permanent local road crowns or physical landmarks."
      },
      {
        step: "02",
        title: "Digital Field Data Capture",
        description: "Capturing boundary corners, spot levels, existing structures, and utility alignments using electronic Total Station instruments."
      },
      {
        step: "03",
        title: "Coordinate Geometry Processing",
        description: "Processing raw field observations through coordinate geometry software to verify mathematical polygon closure accuracy."
      },
      {
        step: "04",
        title: "Contour & Terrain Modeling",
        description: "Interpolating elevation points into digital contour models highlighting natural surface gradients and drainage channels."
      },
      {
        step: "05",
        title: "CAD Drawing Delivery & Pegging",
        description: "Issuing complete CAD drawings with coordinate tables alongside physical on-ground corner pegging."
      }
    ],
    deliverablesHeading: "Confirmed Survey Deliverables",
    deliverables: [
      "Digital Topographic Survey CAD Drawing (DWG / PDF)",
      "Detailed Contour Map with Spot Level Grid",
      "Dimensioned Boundary Perimeter Plan with Corner Coordinate Table",
      "Earthwork Cut-and-Fill Volumetric Calculation Summary (upon request)",
      "Physical On-Site Boundary Pegging and Corner Alignment"
    ],
    whyChooseHeading: "Why HiPRO for Land Surveying",
    whyChoosePoints: [
      {
        title: "Civil Engineering Perspective",
        description: "Because our core business includes construction, our surveyors understand exactly what data architects and civil engineers need to plan foundations and drainage."
      },
      {
        title: "Rapid Local Mobilization in Rajasthan",
        description: "Based in Bhilwara, our survey crews mobilize quickly across residential plots, industrial corridors, and rural acreages in Rajasthan."
      },
      {
        title: "Digital Electronic Accuracy",
        description: "We utilize electronic Total Station instruments that replace error-prone rope-and-chain techniques with digital coordinate precision."
      }
    ],
    faqs: [
      {
        question: "Why is a digital Total Station survey necessary before building?",
        answer: "A digital survey reveals exact boundary lengths, corner angles, and elevation slopes. Without it, architects cannot plan accurate foundations, and contractors cannot calculate true earthwork excavation costs, often leading to costly disputes."
      },
      {
        question: "What instruments does HiPRO use for land measurements?",
        answer: "Our survey teams utilize electronic Total Station instruments, digital optical levels, and high-precision GPS positioning equipment to record millimeter-accurate angles, distances, and elevations."
      },
      {
        question: "How long does it take to survey a standard residential plot?",
        answer: "Field measurements for a standard residential or commercial plot are typically completed in a single day, with processed CAD contour maps and boundary drawings delivered within 24 to 48 hours."
      },
      {
        question: "Can HiPRO calculate soil excavation volumes for basement work?",
        answer: "Yes. By conducting pre-excavation and post-excavation level surveys, our team generates digital 3D terrain models that calculate the exact volume of soil removed, providing transparent documentation for contractor settlement."
      }
    ]
  },

  "interior-exterior-design": {
    canonicalSlug: "interior-exterior-design",
    aliases: ["interior-exterior-design", "interior-exterior"],
    serviceTitle: "Interior & Exterior Design",
    badge: "Architectural Interiors & Facade Engineering",
    tagline: "Modern Interior Fitouts, Structural Facade Engineering & Contemporary Finishes",
    metaTitle: "Interior & Exterior Design Services in Bhilwara | HiPRO",
    metaDescription: "Contemporary architectural interior fitouts, modern facade engineering, and exterior elevation design for residential and commercial spaces in Rajasthan.",
    overviewHeading: "Aesthetic Spatial Design Rooted in Structural Practicality",
    overviewParagraphs: [
      "Hindustan Projects designs and executes contemporary residential interiors, corporate fitouts, and architectural exterior facades across Bhilwara and Rajasthan. We approach interior and exterior styling through an engineering lens—ensuring that aesthetic ambitions harmonize with structural integrity, thermal efficiency, lighting quality, and long-term maintenance.",
      "From functional modular kitchens, custom millwork, and false ceiling lighting in private residences to dynamic commercial retail spaces and modern building elevations, our team coordinates material selection, utility alignments, and skilled craftsmanship to deliver spaces that are as durable as they are visually striking."
    ],
    detailedCapabilities: [
      {
        title: "Corporate & Residential Interior Fitouts",
        description: "Space-efficient interior planning for modern residences, executive offices, and retail showrooms. We coordinate modular cabinetry, custom millwork, internal partitions, ergonomic workstations, and luxury surface treatments tailored to the occupant's daily flow.",
        points: [
          "Optimized storage integration and modular cabinetry planning",
          "Space-saving room layouts designed for natural movement and light",
          "Durable, easy-to-clean material curation suited to everyday living"
        ]
      },
      {
        title: "Modern Facade & Elevation Engineering",
        description: "Transforming building exteriors through engineered elevation features, contemporary parapet treatments, geometric cladding profiles, and architectural accent lighting. Our facade engineering enhances curb appeal while protecting the exterior building envelope against Rajasthan's intense sunlight.",
        points: [
          "Contemporary architectural elevation profiles and geometric fins",
          "Weather-resistant exterior plaster textures and protective coatings",
          "Integrated exterior facade lighting highlighting architectural massing at night"
        ]
      },
      {
        title: "Lighting, False Ceiling & Material Styling",
        description: "Designing layered ambient, task, and accent lighting layouts integrated into sleek gypsum false ceilings. We curate cohesive material palettes—pairing vitrified tiles, natural stones, durable laminates, and textured wall finishes that withstand daily wear.",
        points: [
          "Reflected ceiling plans aligning lighting fixtures with furniture placement",
          "Concealed LED cove lighting and focused task spotlighting coordination",
          "Harmonious color palettes, door framing, and surface finish schedules"
        ]
      }
    ],
    applicationsHeading: "Spaces We Transform",
    applications: [
      {
        title: "Luxury Homes & Bungalows",
        description: "Living rooms, modular kitchens, master suites, and entertainment areas designed for comfort, warmth, and family living."
      },
      {
        title: "Corporate Offices & Workspaces",
        description: "Executive cabins, conference rooms with sound buffering, and reception lobbies projecting professional excellence."
      },
      {
        title: "Commercial Showrooms & Retail",
        description: "Strategic display walls, customer circulation paths, highlight lighting, and high-traffic durable commercial flooring."
      }
    ],
    stagesHeading: "Design-to-Execution Workflow",
    stages: [
      {
        step: "01",
        title: "Spatial Brief & Lifestyle Study",
        description: "Understanding client storage needs, lighting preferences, functional priorities, and aesthetic tastes."
      },
      {
        step: "02",
        title: "2D Layout & Furniture Planning",
        description: "Drafting dimensioned furniture arrangements, partition walls, and circulation clearances."
      },
      {
        step: "03",
        title: "3D Visual Perspectives & Material Boards",
        description: "Generating realistic 3D interior views and physical material sample combinations for owner approval."
      },
      {
        step: "04",
        title: "Ceiling & Electrical Coordination",
        description: "Aligning false ceiling drops with fan hooks, spotlights, and air conditioning line routes."
      },
      {
        step: "05",
        title: "Supervised Trade Execution",
        description: "Overseeing skilled carpenters, ceiling installers, painters, and electricians to ensure faithful execution of approved drawings."
      }
    ],
    deliverablesHeading: "Confirmed Interior & Facade Deliverables",
    deliverables: [
      "Dimensioned 2D Interior Space Planning & Furniture Layout Drawings",
      "Photorealistic 3D Interior & Exterior Elevation Perspective Views",
      "Reflected Ceiling Plans (RCP) with Complete Electrical & Lighting Coordinates",
      "Detailed Millwork, Wardrobe, and Cabinetry Working Drawings",
      "Comprehensive Paint Shade, Tile, and Material Specification Schedules"
    ],
    whyChooseHeading: "Why HiPRO for Interior & Exterior Styling",
    whyChoosePoints: [
      {
        title: "Architectural & Structural Grounding",
        description: "Because we are civil engineers, we never recommend interior modifications that compromise structural columns, load-bearing walls, or vital plumbing lines."
      },
      {
        title: "Turnkey Execution Coordination",
        description: "We bridge the gap between creative visualizers and on-site craftsmen, ensuring that finished rooms accurately reflect the approved 3D renders."
      },
      {
        title: "Climate-Smart Material Selection",
        description: "Our material selections factor in Rajasthan's high summer temperatures, dust conditions, and intense sunlight for enduring quality."
      }
    ],
    faqs: [
      {
        question: "Does Hindustan Projects handle both interior design and exterior facade work?",
        answer: "Yes. Our team designs both internal living/working spaces and external architectural elevations, ensuring that the building's exterior street presence and interior ambience form a unified aesthetic statement."
      },
      {
        question: "Can interior electrical and plumbing points be customized during civil construction?",
        answer: "Yes. Coordinating interior layouts during the civil construction stage allows electrical conduits and plumbing lines to be concealed within walls before plastering, preventing messy wall cutting later."
      },
      {
        question: "What types of properties does HiPRO design interiors for?",
        answer: "We deliver interior design and fitout solutions for residential bungalows, modern apartments, corporate offices, retail showrooms, and healthcare spaces across Rajasthan."
      },
      {
        question: "How does 3D visualization assist clients during the design process?",
        answer: "3D modeling allows property owners to review realistic representations of room colors, furniture proportions, ceiling lighting, and material combinations before purchasing materials or beginning carpentry."
      }
    ]
  },

  "water-treatment-plant-construction": {
    canonicalSlug: "water-treatment-plant-construction",
    aliases: ["water-treatment-plant", "water-treatment-plant-construction"],
    serviceTitle: "Water Treatment Plant Construction",
    badge: "Environmental Civil Engineering & Hydraulic Infrastructure",
    tagline: "Specialized Civil Execution for ETP & STP Facilities, Hydraulic Tanks & Industrial Piping",
    metaTitle: "Water Treatment Plant Civil Construction in Rajasthan | HiPRO",
    metaDescription: "Specialized civil engineering, reinforced concrete hydraulic tanks, and piping infrastructure for ETP and STP water treatment facilities in Rajasthan.",
    overviewHeading: "Specialized Heavy Civil Engineering for Hydraulic Facilities",
    overviewParagraphs: [
      "Hindustan Projects executes specialized civil engineering and reinforced concrete infrastructure for water and effluent treatment facilities across Rajasthan. Industrial centers such as Bhilwara require dependable environmental infrastructure to manage process wastewater, recover usable water, and comply with state environmental standards.",
      "Our engineering team constructs the critical civil backbone of Effluent Treatment Plants (ETP) and Sewage Treatment Plants (STP)—building watertight reinforced concrete tanks, aeration basins, clarifier civil structures, and heavy equipment foundations engineered to resist chemical deterioration and continuous hydrostatic pressure."
    ],
    detailedCapabilities: [
      {
        title: "Industrial ETP & STP Civil Structures",
        description: "Engineering heavy-duty reinforced concrete civil structures for industrial effluent and municipal sewage treatment. We construct screening chambers, oil and grease traps, aeration tanks, secondary settling basins, and sludge drying beds with monolithic concrete integrity.",
        points: [
          "High-density concrete casting resisting water permeability and chemical migration",
          "Continuous construction planning minimizing unplanned cold joints in tank walls",
          "Heavy RCC machine foundations designed to absorb vibration from blowers and pumps"
        ]
      },
      {
        title: "Hydraulic Tanks & Pipeline Integration",
        description: "Building leak-proof underground, semi-underground, and overhead hydraulic holding reservoirs. We integrate pipe sleeves, puddle flanges, drainage trenches, and overflow channels during the structural casting phase to ensure watertight pipeline connections.",
        points: [
          "Precision casting of puddle flanges and wall sleeves preventing seam leaks",
          "Interconnecting concrete flumes, weir channels, and distribution launders",
          "Reinforced retaining walls designed to counter external saturated soil pressures"
        ]
      },
      {
        title: "Structural Durability & Environmental Safety",
        description: "Enforcing dense concrete mix designs, chemical-resistant protective surface coatings, continuous water-stops in construction joints, and structural wall thicknesses calculated to withstand hydrostatic loads under both full and empty tank conditions.",
        points: [
          "Continuous PVC and swellable water-stops along all construction joints",
          "Calculated structural reinforcement resisting bending moments from fluid pressure",
          "Protective surface coatings safeguarding concrete from acidic and alkaline wastewater"
        ]
      }
    ],
    applicationsHeading: "Water Infrastructure Applications",
    applications: [
      {
        title: "Industrial Effluent Treatment (ETP) Civil Works",
        description: "Heavy concrete containment structures for industrial processing units requiring compliant wastewater treatment and recovery."
      },
      {
        title: "Sewage Treatment Plants (STP) for Townships",
        description: "Sewage treatment civil facilities for residential colonies, educational campuses, hospitals, and commercial developments."
      },
      {
        title: "Industrial Water Storage Reservoirs",
        description: "Raw water collection sumps, treated water reservoirs, and dedicated industrial fire-fighting concrete tanks."
      }
    ],
    stagesHeading: "Civil Execution Stages for Hydraulic Plants",
    stages: [
      {
        step: "01",
        title: "Geotechnical & Soil Study",
        description: "Assessing soil bearing capacity and groundwater table levels to prevent structural settlement and uplift pressure on empty tanks."
      },
      {
        step: "02",
        title: "Hydraulic & Structural RCC Design",
        description: "Designing tank walls, base rafts, and baffle partitions to counter internal hydrostatic loads and external soil pressure."
      },
      {
        step: "03",
        title: "Precision Shuttering & Water-Stopping",
        description: "Installing continuous water-stops along all construction seams and positioning puddle flanges before concrete placement."
      },
      {
        step: "04",
        title: "High-Density Concrete Casting & Curing",
        description: "Supervised concrete pouring with thorough compaction, followed by extended water curing to maximize concrete impermeability."
      },
      {
        step: "05",
        title: "Hydrostatic Testing & Handover",
        description: "Filling completed holding structures with water for monitored hydrostatic leakage testing before facility handover."
      }
    ],
    deliverablesHeading: "Confirmed Hydraulic Civil Deliverables",
    deliverables: [
      "Structural RCC Engineering Working Drawings for Tanks, Rafts & Baffle Walls",
      "Foundation Schedules for Pumps, Blowers & Heavy Mechanical Equipment",
      "Construction Joint & Water-Stop Installation Layout Details",
      "Wall Sleeve & Hydraulic Pipe Penetration Coordinate Drawings",
      "Certified On-Site Hydrostatic Leakage Test Documentation"
    ],
    whyChooseHeading: "Why HiPRO for Water Treatment Civil Construction",
    whyChoosePoints: [
      {
        title: "Specialized Hydraulic Engineering Knowledge",
        description: "We understand that hydraulic civil engineering requires specialized crack-width control, continuous water-stops, and high-density concrete mixes fundamentally different from standard buildings."
      },
      {
        title: "Regional Industrial Context in Rajasthan",
        description: "Rooted in Bhilwara's industrial corridor, our civil engineers design containment structures accounting for regional soil characteristics and aggressive wastewater chemistry."
      },
      {
        title: "Long-Term Structural Durability",
        description: "Quality-first concrete placement and protective coatings safeguard the client's environmental capital investment from premature chemical erosion."
      }
    ],
    faqs: [
      {
        question: "What is HiPRO's specific scope in water treatment projects?",
        answer: "Hindustan Projects specializes in the civil engineering and structural construction of treatment facilities—including RCC holding tanks, aeration basins, clarifier civil structures, pump foundations, and pipe integration trenches."
      },
      {
        question: "How does HiPRO prevent leakage in concrete water treatment tanks?",
        answer: "We utilize high-density concrete mixes, integrate continuous water-stops in all construction joints, eliminate cold joints through planned pours, and perform mandatory hydrostatic water retention tests prior to facility handover."
      },
      {
        question: "Can HiPRO construct sewage treatment plants for residential complexes and commercial hubs?",
        answer: "Yes. We construct both compact underground STPs for commercial developments and large-capacity reinforced concrete sewage facilities for residential townships and institutions."
      },
      {
        question: "How is chemical erosion prevented in industrial ETP concrete tanks?",
        answer: "Depending on the chemical nature of the industrial effluent, our engineers specify sulfate-resistant cement blends, increased concrete cover over steel rebar, and protective chemical-resistant coatings across internal tank surfaces."
      }
    ]
  },

  "project-management-consultancy": {
    canonicalSlug: "project-management-consultancy",
    aliases: ["project-management-consultancy"],
    serviceTitle: "Project Management & Consultancy",
    badge: "Engineering Advisory & Construction Oversight",
    tagline: "Independent Quality Auditing, Milestone Optimization & Budget Supervision",
    metaTitle: "Project Management Consultancy (PMC) in Bhilwara & Rajasthan | HiPRO",
    metaDescription: "End-to-end project management consultancy, milestone scheduling, material cost auditing, and independent on-site quality supervision across Rajasthan.",
    overviewHeading: "Independent Engineering Governance Protecting Owner Capital",
    overviewParagraphs: [
      "Hindustan Projects provides independent Project Management Consultancy (PMC) services across Bhilwara and Rajasthan, acting as the property owner's trusted technical representative on complex construction sites. Building projects frequently encounter schedule slippage, contractor disputes, unverified material substitutions, and budget inflation.",
      "Our senior engineering consultants enforce structured project governance—overseeing contractor scheduling, auditing material consumption, verifying measurement sheets before payment approvals, and inspecting on-site workmanship. We ensure projects finish on time, within budget, and to specified engineering standards."
    ],
    detailedCapabilities: [
      {
        title: "Milestone Scheduling & Timeline Optimization",
        description: "Developing realistic critical-path master schedules that coordinate civil trades, electrical teams, plumbing contractors, and finishing crews. We track weekly progress milestones, identify potential site bottlenecks early, and deploy recovery plans to prevent costly completion delays.",
        points: [
          "Master project timeline development defining critical path milestones",
          "Weekly progress tracking against scheduled baseline targets",
          "Early detection of material supply or trade labor bottlenecks on-site"
        ]
      },
      {
        title: "Budget Auditing & Material Estimation",
        description: "Protecting owner capital through rigorous scrutiny of contractor measurement sheets, bar bending schedules, and material invoices. We cross-verify billed quantities against approved construction drawings, stopping contractor over-measurement and material wastage.",
        points: [
          "Independent verification of contractor running bills before payment release",
          "Physical on-site measurement checks of completed masonry, concrete, and plaster",
          "Material reconciliation auditing comparing delivered quantities with actual work"
        ]
      },
      {
        title: "Independent Site Quality & Safety Supervision",
        description: "Enforcing structural standards without compromise. Our site representatives conduct surprise inspections of steel placement, concrete pouring, mortar mixes, and waterproofing applications, while ensuring worker safety protocols are maintained on the job site.",
        points: [
          "Pre-pour structural rebar inspections ensuring compliance with engineering blueprints",
          "Supervision of concrete curing schedules and mortar mix ratios",
          "Job site safety oversight ensuring standard safety gear and secure scaffolding"
        ]
      }
    ],
    applicationsHeading: "Project Types Benefiting from PMC",
    applications: [
      {
        title: "Private Residential & Villa Builds",
        description: "Protecting individual homeowners from contractor overcharges, substandard material substitutions, and chronic handover delays."
      },
      {
        title: "Commercial & Office Developments",
        description: "Ensuring strict timeline compliance for commercial properties where delays directly translate into lost rental revenue."
      },
      {
        title: "Industrial Builds & Multi-Contractor Facilities",
        description: "Managing multi-disciplinary industrial builds requiring synchronized structural, civil, and utility contractor handoffs."
      }
    ],
    stagesHeading: "Our PMC Governance Framework",
    stages: [
      {
        step: "01",
        title: "Pre-Construction Drawing & BOQ Audit",
        description: "Scrutinizing architectural drawings, structural schedules, Bill of Quantities (BOQ), and contractor agreement terms."
      },
      {
        step: "02",
        title: "Baseline Scheduling & Milestone Setup",
        description: "Defining verifiable project milestones, procurement lead times, and trade mobilization schedules."
      },
      {
        step: "03",
        title: "Daily & Weekly Site Inspections",
        description: "Conducting continuous physical site checks to enforce workmanship quality, concrete curing, and safety compliance."
      },
      {
        step: "04",
        title: "Measurement Auditing & Bill Certification",
        description: "Physically measuring executed site work before certifying contractor running account bills for client payment."
      },
      {
        step: "05",
        title: "Snag-List & Handover Management",
        description: "Conducting rigorous final punch-list audits, verifying utility operations, and securing as-built documentation."
      }
    ],
    deliverablesHeading: "Confirmed PMC Deliverables",
    deliverables: [
      "Master Project Schedule & Milestone Tracking Dashboard",
      "Certified Contractor Bill Verification & Quantity Measurement Audit Reports",
      "Weekly / Monthly On-Site Quality Inspection & Progress Reports",
      "Material Reconciliation & Consumption Audit Summaries",
      "Final Handover Defect Punch-List and Rectification Reports"
    ],
    whyChooseHeading: "Why HiPRO for Project Management Consultancy",
    whyChoosePoints: [
      {
        title: "Hands-On Construction Expertise",
        description: "Unlike purely theoretical management consultants, HiPRO's engineers build structures every day. We understand contractor shortcuts, material variations, and site delay tactics."
      },
      {
        title: "Uncompromising Owner Advocacy",
        description: "We operate with complete independence from third-party trade contractors, ensuring that the property owner's financial and quality interests are exclusively safeguarded."
      },
      {
        title: "Local Trade & Material Insight",
        description: "Comprehensive knowledge of prevailing Rajasthan material prices and labor productivity rates ensures that your project budget reflects realistic market values."
      }
    ],
    faqs: [
      {
        question: "What is the primary benefit of hiring a Project Management Consultant (PMC)?",
        answer: "A PMC acts as the property owner's expert advocate on site. By inspecting contractor work, verifying physical measurements before payment, and tracking timelines, a PMC routinely saves owners far more money in prevented wastage and delays than the consultancy fee."
      },
      {
        question: "Can Hindustan Projects supervise projects being built by other contractors?",
        answer: "Yes. Our PMC division operates independently of our turnkey construction division, providing unbiased third-party technical supervision for projects built by client-selected contractors."
      },
      {
        question: "How does PMC oversight prevent construction budget overruns?",
        answer: "We audit the contractor's Bill of Quantities (BOQ), verify steel bar bending schedules, check concrete volume deliveries, and physically measure executed masonry and plaster before any payment invoice is approved."
      },
      {
        question: "What reports do clients receive during PMC management?",
        answer: "Clients receive regular milestone progress reports, including dated site photographs, quality inspection notes, bill certification summaries, and look-ahead schedules highlighting upcoming critical tasks."
      }
    ]
  }
};

/**
 * Helper to retrieve rich service content by raw title or slug
 */
export function getServiceDetailContent(slugOrTitle: string = ""): ServiceDetailContent | null {
  if (!slugOrTitle) return null;
  const normalized = slugOrTitle.toLowerCase().replace(/ & /g, "-").replace(/&/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
  
  // Direct canonical match
  if (SERVICE_CONTENT_MAP[normalized]) {
    return SERVICE_CONTENT_MAP[normalized];
  }

  // Check aliases
  for (const key in SERVICE_CONTENT_MAP) {
    const item = SERVICE_CONTENT_MAP[key];
    if (item.aliases.includes(normalized) || item.canonicalSlug === normalized) {
      return item;
    }
  }

  return null;
}

/**
 * Merges a database service record with static fallback definitions, prioritizing database CMS edits.
 */
export function resolveServiceDetail(service: Partial<Service> | null | undefined, paramSlug: string = ""): ServiceDetailContent | null {
  if (!service) return null;
  const cleanTitle = service.title || "";
  const staticRich = getServiceDetailContent(paramSlug) || getServiceDetailContent(cleanTitle);

  const parsedOverviewParagraphs = safeJsonParse<string[]>(service.overviewParagraphs, staticRich?.overviewParagraphs || []);
  const parsedCapabilities = safeJsonParse<ServiceFeatureDetail[]>(service.detailedCapabilities, staticRich?.detailedCapabilities || []);
  const parsedApplications = safeJsonParse<ServiceApplication[]>(service.applications, staticRich?.applications || []);
  const parsedStages = safeJsonParse<ServiceStage[]>(service.stages, staticRich?.stages || []);
  const parsedDeliverables = safeJsonParse<string[]>(service.deliverables, staticRich?.deliverables || []);
  const parsedWhyChoose = safeJsonParse<{ title: string; description: string }[]>(service.whyChoosePoints, staticRich?.whyChoosePoints || []);
  const parsedFaqs = safeJsonParse<ServiceFaq[]>(service.faqs, staticRich?.faqs || []);
  const parsedRates = safeJsonParse<any>(service.indicativeRatesNotice, staticRich?.indicativeRatesNotice || undefined);

  return {
    canonicalSlug: staticRich?.canonicalSlug || paramSlug || "",
    aliases: staticRich?.aliases || [],
    serviceTitle: cleanTitle || staticRich?.serviceTitle || "",
    badge: service.badge || staticRich?.badge || "Engineering & Construction",
    tagline: service.tagline || staticRich?.tagline || service.description || "",
    metaTitle: service.metaTitle || staticRich?.metaTitle || `${cleanTitle} | Hindustan Projects (HiPRO)`,
    metaDescription: service.metaDescription || staticRich?.metaDescription || service.description || "",
    overviewHeading: service.overviewHeading || staticRich?.overviewHeading || "Engineering Overview & Technical Scope",
    overviewParagraphs: parsedOverviewParagraphs.length > 0 ? parsedOverviewParagraphs : (service.description ? [service.description] : []),
    detailedCapabilities: parsedCapabilities,
    applicationsHeading: service.applicationsHeading || staticRich?.applicationsHeading || "Applications & Sectors",
    applications: parsedApplications,
    stagesHeading: service.stagesHeading || staticRich?.stagesHeading || "Workflow & Execution Stages",
    stages: parsedStages,
    deliverablesHeading: service.deliverablesHeading || staticRich?.deliverablesHeading || "Project Deliverables & Handover",
    deliverables: parsedDeliverables,
    whyChooseHeading: service.whyChooseHeading || staticRich?.whyChooseHeading || "Why Choose Hindustan Projects",
    whyChoosePoints: parsedWhyChoose,
    faqs: parsedFaqs,
    indicativeRatesNotice: parsedRates,
  };
}

