import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { findAll } from "@/lib/db";
import type { Service, Settings, Stats, Project } from "@/lib/types";
import * as Icons from "lucide-react";
import DynamicIcon from "@/components/DynamicIcon";
import { cleanServiceTitle, cleanContentTypos, getServiceSlug } from "@/lib/companyData";
import { isOptimizableImage } from "@/lib/imageUtils";
import { generateBreadcrumbSchema, generateServiceSchema, generateFaqSchema } from "@/lib/schema";
import { getServiceDetailContent, resolveServiceDetail } from "@/lib/serviceContentData";
import { resolveCTA, resolveCTAHref } from "@/lib/cta";

export const revalidate = 60;

const defaultServices: Service[] = [
  {
    id: "1",
    title: "Architecture & Planning",
    description: "Integrated architectural layouts, structural design, and 3D master planning tailored for modern construction.",
    category: "Design & Planning",
    icon: "Compass",
    features: [
      "Master Site Planning & 3D Modeling",
      "Structural Engineering Analysis",
      "Regulatory Approvals & Blueprinting"
    ],
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=75",
    order: 1,
    active: true,
  },
  {
    id: "2",
    title: "Professional Construction Services",
    description: "Turnkey civil construction, heavy structural RCC work, and durable residential and commercial execution.",
    category: "Civil Construction",
    icon: "HardHat",
    features: [
      "Heavy RCC & Steel Structural Works",
      "Commercial & Residential Complexes",
      "Quality Testing & Material Assurance"
    ],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=75",
    order: 2,
    active: true,
  },
  {
    id: "3",
    title: "Surveying & Site Measurements",
    description: "High-precision digital land surveying, contour mapping, and boundary demarcations using advanced equipment.",
    category: "Site Engineering",
    icon: "Ruler",
    features: [
      "Topographic & Contour Surveys",
      "Total Station & GPS Boundary Demarcation",
      "Volumetric & Earthwork Calculations"
    ],
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=75",
    order: 3,
    active: true,
  },
  {
    id: "4",
    title: "Interior & Exterior Design",
    description: "Premium architectural interiors, structural facade treatments, and turnkey aesthetic finishes for luxury spaces.",
    category: "Architecture & Interiors",
    icon: "Paintbrush",
    features: [
      "Corporate & Residential Interior Fitouts",
      "Modern Facade & Elevation Engineering",
      "Acoustic, Lighting & Material Styling"
    ],
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=75",
    order: 4,
    active: true,
  },
  {
    id: "5",
    title: "Water Treatment Plant Construction",
    description: "Specialized civil execution and piping infrastructure for effluent and water treatment facilities.",
    category: "Civil Engineering",
    icon: "Droplets",
    features: [
      "Industrial ETP & STP Civil Structures",
      "Hydraulic Tanks & Pipeline Integration",
      "Environmental Compliance & Safety"
    ],
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=75",
    order: 5,
    active: true,
  },
  {
    id: "6",
    title: "Project Management & Consultancy",
    description: "Comprehensive project oversight, cost auditing, procurement advisory, and milestone tracking.",
    category: "Consultancy",
    icon: "Briefcase",
    features: [
      "Milestone & Timeline Optimization",
      "Budget Auditing & Material Estimation",
      "Site Quality & Safety Supervision"
    ],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=75",
    order: 6,
    active: true,
  },
];

const defaultProjects: Project[] = [
  {
    id: "proj-1",
    slug: "projects-adani-gas-chamber-shinghpur",
    title: "Adani Gas Chamber",
    description: "Heavy industrial RCC civil structure, safety blast perimeter engineering, and precision equipment foundations.",
    shortDescription: "Specialized industrial civil structure with reinforced concrete engineering and heavy foundation execution.",
    category: "Industrial Construction",
    services: ["Construction", "Civil Execution", "Industrial Infrastructure"],
    location: "Shinghpur, Chittorgarh, Rajasthan",
    client: "Adani Gas Chamber",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    date: "2024",
    status: "completed",
    publishStatus: "published",
  },
  {
    id: "proj-2",
    slug: "expansion-of-weav-projects-expansion-of-weaving-department-airjet-ajay-syntexing-department-airjet-ajay-syntex-pvt-ltd",
    title: "Expansion of Weaving Department (Airjet) – Ajay Syntex Pvt. Ltd.",
    description: "Comprehensive industrial plant expansion, heavy structural PEB framing, and full turnkey civil execution.",
    shortDescription: "Turnkey industrial expansion covering large-span heavy PEB shed fabrication and civil infrastructure.",
    category: "Industrial Construction",
    services: ["Project Management & Consultancy", "Construction", "Turnkey Civil"],
    location: "Guwardi, Chittorgarh Road, Bhilwara, Rajasthan",
    client: "Ajay Syntex Pvt. Ltd.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    date: "2024",
    status: "completed",
    publishStatus: "published",
  },
  {
    id: "proj-3",
    slug: "highway-hotel-contemporary-exterior-elevation",
    title: "Highway Hotel – Contemporary Exterior Elevation",
    description: "Modern commercial facade engineering, 3D architectural styling, and exterior elevation detailing.",
    shortDescription: "Contemporary commercial elevation featuring modern geometric louvers, textured finishes, and architectural lighting.",
    category: "Designing and Planning",
    services: ["Interior & Exterior Design", "Exterior Elevation Design", "3D Architecture"],
    location: "Karnataka / Rajasthan Corridor",
    client: "Aroma Hotel",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    date: "2023",
    status: "completed",
    publishStatus: "published",
  },
  {
    id: "proj-4",
    slug: "jai-ambe-nagar-gateway-masuda",
    title: "Jai Ambe Nagar Gateway – Masuda",
    description: "Civic entrance landmark, structural blueprinting, and 3D architectural master planning.",
    shortDescription: "Monumental gateway structure combining classic arches, reinforced concrete detailing, and perimeter alignment.",
    category: "Designing and Planning",
    services: ["Architecture & Planning", "Entrance Gate 3D Design", "Master Planning"],
    location: "Jai Ambe Nagar, Masuda, Beawar, Rajasthan",
    client: "Jai Ambe Nagar Society",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
    date: "2023",
    status: "completed",
    publishStatus: "published",
  },
];

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const allServices = await findAll<Service>("services");
  const paramSlug = decodeURIComponent(params.slug).toLowerCase().trim();
  const servicesList = allServices && allServices.length > 0 ? allServices : defaultServices;
  
  const service = servicesList.find(s => {
    if (!s || !s.title) return false;
    const rawSlug = s.title.toLowerCase().replace(/ & /g, '-').replace(/&/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
    const cleanTitle = cleanServiceTitle(s.title);
    const cleanSlug = cleanTitle.toLowerCase().replace(/ & /g, '-').replace(/&/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
    return rawSlug === paramSlug || cleanSlug === paramSlug;
  });

  if (!service) {
    return {
      title: "Service Details",
    };
  }

  const cleanTitle = cleanServiceTitle(service.title);
  const cleanDesc = cleanContentTypos(service.description);
  const canonicalSlug = getServiceSlug(cleanTitle);
  const richContent = resolveServiceDetail(service, canonicalSlug) || resolveServiceDetail(service, paramSlug);

  const title = richContent ? richContent.metaTitle : `${cleanTitle} | Hindustan Projects (HiPRO)`;
  const description = richContent ? richContent.metaDescription : cleanDesc;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `/services/${canonicalSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.hindustanprojects.in/services/${canonicalSlug}`,
      images: service.image ? [{ url: service.image }] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const [allServices, settingsData, statsData, allProjects] = await Promise.all([
    findAll<Service>("services"),
    findAll<Settings>("settings"),
    findAll<Stats>("stats"),
    findAll<Project>("projects"),
  ]);

  const projectStat = statsData?.find((s) => /project/i.test(s.label))?.value || "150+";
  const expStat = statsData?.find((s) => /experience|year/i.test(s.label))?.value || "8+";

  const settings = settingsData[0] || {};
  const ctaDetailPrimary = resolveCTA(settings, "service_detail_primary");
  const ctaDetailSecondary = resolveCTA(settings, "service_detail_secondary");
  const phone = settings.companyPhone || "+91 75970 00601";
  const paramSlug = decodeURIComponent(params.slug).toLowerCase().trim();
  const servicesList = allServices && allServices.length > 0 ? allServices : defaultServices;
  
  const service = servicesList.find(s => {
    if (!s || !s.title) return false;
    const rawSlug = s.title.toLowerCase().replace(/ & /g, '-').replace(/&/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
    const cleanTitle = cleanServiceTitle(s.title);
    const cleanSlug = cleanTitle.toLowerCase().replace(/ & /g, '-').replace(/&/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
    return rawSlug === paramSlug || cleanSlug === paramSlug;
  });

  if (!service || !service.active) {
    notFound();
  }

  const displayTitle = cleanServiceTitle(service.title);
  const displayDescription = cleanContentTypos(service.description);

  let fallbackFeatures: string[] = [];
  try {
    fallbackFeatures = typeof service.features === 'string' ? JSON.parse(service.features) : (Array.isArray(service.features) ? service.features : []);
  } catch {
    fallbackFeatures = [];
  }

  const serviceSlug = getServiceSlug(displayTitle);
  const canonicalUrl = `https://www.hindustanprojects.in/services/${serviceSlug}`;
  const richContent = resolveServiceDetail(service, serviceSlug) || resolveServiceDetail(service, paramSlug);

  const supplementaryImages = [
    service.image,
    ...allServices.filter(s => s.id !== service.id).map(s => s.image)
  ].filter(Boolean);

  // Strict Public Visibility Filter for Projects with default fallback
  const rawPublishedProjects = (allProjects || []).filter(
    (p) => p && p.publishStatus === "published" && p.status !== "archived"
  );
  const publishedProjects = rawPublishedProjects.length > 0 ? rawPublishedProjects : defaultProjects;

  // Helper to extract service tags array from project
  const parseProjectServices = (pServices?: string | string[] | null): string[] => {
    if (!pServices) return [];
    if (Array.isArray(pServices)) return pServices.filter(Boolean);
    try {
      const parsed = JSON.parse(pServices);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // ignore
    }
    return String(pServices)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // Intelligent Related Projects Matching for this capability
  const relatedProjects = (() => {
    if (!publishedProjects || publishedProjects.length === 0) return [];

    const servTitle = displayTitle.toLowerCase();
    const servCat = (service.category || "").toLowerCase();

    // Map semantic keywords for each service archetype
    const serviceKeywordsMap: Record<string, string[]> = {
      "architecture-and-planning": ["architecture", "architectural", "planning", "master plan", "designing and planning", "3d", "layout", "elevation", "gateway", "evacuation"],
      "architecture-planning": ["architecture", "architectural", "planning", "master plan", "designing and planning", "3d", "layout", "elevation", "gateway", "evacuation"],
      "professional-construction-services": ["construction", "civil", "rcc", "industrial construction", "structure", "gas chamber", "expansion", "superstructure", "building"],
      "surveying-site-measurements": ["survey", "surveying", "measurement", "contour", "mapping", "demarcation", "topographic", "site"],
      "surveying-and-site-measurements": ["survey", "surveying", "measurement", "contour", "mapping", "demarcation", "topographic", "site"],
      "interior-exterior-design": ["interior", "exterior", "elevation", "facade", "bedroom", "rooftop", "restaurant", "decor", "finish", "gate"],
      "interior-and-exterior-design": ["interior", "exterior", "elevation", "facade", "bedroom", "rooftop", "restaurant", "decor", "finish", "gate"],
      "water-treatment-plant-construction": ["water", "treatment", "etp", "stp", "effluent", "pipeline", "tank", "industrial"],
      "project-management-consultancy": ["project management", "consultancy", "pmc", "supervision", "audit", "coordination"],
      "project-management-and-consultancy": ["project management", "consultancy", "pmc", "supervision", "audit", "coordination"]
    };

    const keywords = serviceKeywordsMap[serviceSlug] || serviceKeywordsMap[paramSlug] || [servTitle];

    const scored = publishedProjects.map((proj) => {
      let score = 0;
      const pTitle = (proj.title || "").toLowerCase();
      const pCat = (proj.category || "").toLowerCase();
      const pDesc = (proj.description || "").toLowerCase();
      const pServices = parseProjectServices(proj.services).map((s) => s.toLowerCase());

      // 1. Exact or partial match on service tags
      for (const s of pServices) {
        if (s === servTitle || servTitle.includes(s) || s.includes(servTitle)) score += 10;
        for (const kw of keywords) {
          if (s.includes(kw)) score += 5;
        }
      }

      // 2. Category match
      if (pCat === servCat || (pCat.includes("design") && servTitle.includes("design")) || (pCat.includes("construction") && servTitle.includes("construction"))) {
        score += 4;
      }

      // 3. Keyword matches in Title & Description
      for (const kw of keywords) {
        if (pTitle.includes(kw)) score += 3;
        if (pDesc.includes(kw)) score += 1;
      }

      // 4. Boost featured projects slightly
      if (proj.featured) score += 2;

      return { proj, score };
    });

    // Sort by highest score first, then date/order
    scored.sort((a, b) => b.score - a.score);

    // Pick top matching projects (score > 0)
    const directMatches = scored.filter((item) => item.score > 0).map((item) => item.proj);

    // Backfill with other published projects up to 3 so the section always has impressive evidence
    const finalSelection: Project[] = [...directMatches];
    for (const p of publishedProjects) {
      if (finalSelection.length >= 3) break;
      if (!finalSelection.some((item) => item.id === p.id)) {
        finalSelection.push(p);
      }
    }

    return finalSelection.slice(0, 3);
  })();

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.hindustanprojects.in" },
    { name: "Services", url: "https://www.hindustanprojects.in/services" },
    { name: displayTitle, url: canonicalUrl },
  ]);

  const serviceJsonLd = generateServiceSchema({
    name: displayTitle,
    description: richContent?.metaDescription || displayDescription,
    url: canonicalUrl,
    image: service.image,
  });

  const faqJsonLd = richContent?.faqs && richContent.faqs.length > 0 
    ? generateFaqSchema(richContent.faqs) 
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <div className="bg-white min-h-screen">
        
        {/* 1. Hero Section */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-slate-50 border-b border-slate-200/60">
          <div className="absolute inset-0 z-0">
            {service.image && (
              <Image 
                src={service.image} 
                alt={service.title} 
                fill
                sizes="100vw"
                unoptimized={!isOptimizableImage(service.image)}
                className="object-cover opacity-10"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
            <Link href="/services" className="inline-flex items-center text-slate-600 hover:text-construction-navy mb-6 transition-colors text-xs font-bold uppercase tracking-wider group bg-white hover:bg-slate-100 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Icons.ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Capabilities
            </Link>
            
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 bg-construction-red flex items-center justify-center text-white shadow-md rounded-full">
                <DynamicIcon name={service.icon || "Wrench"} className="w-6 h-6" />
              </div>
            </div>

            {richContent?.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none bg-red-50 border border-red-100 text-construction-red text-[11px] font-bold uppercase tracking-wider mb-4 shadow-sm">
                <Icons.Sparkles className="w-3.5 h-3.5" />
                <span>{richContent.badge}</span>
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-construction-navy mb-5 font-display uppercase tracking-tight max-w-4xl mx-auto">
              {displayTitle}
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
              {richContent?.tagline || displayDescription}
            </p>
          </div>
        </section>

        {/* 2. Detailed Overview Section */}
        {richContent?.overviewParagraphs && richContent.overviewParagraphs.length > 0 && (
          <section className="py-16 bg-white border-b border-slate-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border-l-4 border-construction-red pl-5 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-display uppercase tracking-tight">
                  {richContent.overviewHeading}
                </h2>
              </div>
              <div className="space-y-4 text-slate-600 text-base md:text-[17px] leading-relaxed font-light">
                {richContent.overviewParagraphs.map((para, pi) => (
                  <p key={pi}>
                    {para
                      .replace(/8\+\s*years/gi, `${expStat} years`)
                      .replace(/over 150 completed projects/gi, `over ${projectStat.replace(/\+$/, '')} completed projects`)
                      .replace(/150\+\s*projects/gi, `${projectStat} projects`)
                    }
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3. Detailed Core Capabilities */}
        <section className="py-20 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-construction-red uppercase tracking-widest block mb-2">Technical Execution</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight">
                Core Engineering Capabilities
              </h2>
              <p className="text-sm text-slate-500 font-light mt-2">
                Delivering disciplined craftsmanship and technical precision across every project phase.
              </p>
            </div>

            <div className="space-y-20">
              {richContent?.detailedCapabilities && richContent.detailedCapabilities.length > 0 ? (
                richContent.detailedCapabilities.map((cap, ci) => {
                  const isEven = ci % 2 === 0;
                  const imgSrc = supplementaryImages[ci % supplementaryImages.length];

                  return (
                    <div key={ci} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                      {/* Text Side */}
                      <div className="flex-1 space-y-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider shadow-sm">
                          <span className="text-construction-red font-black">0{ci + 1}</span>
                          <span>Capability</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 font-display uppercase tracking-tight leading-snug">
                          {cap.title}
                        </h3>
                        <p className="text-slate-600 text-sm md:text-base font-light leading-relaxed">
                          {cap.description}
                        </p>
                        {cap.points && cap.points.length > 0 && (
                          <ul className="space-y-2.5 pt-2">
                            {cap.points.map((pt, pti) => (
                              <li key={pti} className="flex items-start gap-3 text-xs md:text-sm text-slate-700 font-medium">
                                <Icons.CheckCircle className="w-4 h-4 text-construction-red shrink-0 mt-0.5" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Image Side */}
                      <div className="flex-1 w-full">
                        <div className="relative h-[280px] sm:h-[340px] w-full rounded-none overflow-hidden shadow-xl border border-slate-200">
                          {imgSrc && (
                            <Image 
                              src={imgSrc} 
                              alt={cap.title} 
                              fill
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              unoptimized={!isOptimizableImage(imgSrc)}
                              className="object-cover"
                            />
                          )}
                          <div className={`absolute top-1/2 -translate-y-1/2 ${isEven ? '-left-4' : '-right-4'} w-8 h-20 bg-construction-red hidden lg:block`} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback for database records without rich content */
                fallbackFeatures.map((f: string, fi: number) => {
                  const isEven = fi % 2 === 0;
                  const imgSrc = supplementaryImages[fi % supplementaryImages.length];
                  return (
                    <div key={fi} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                      <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-red-50 border border-red-100 text-construction-red text-xs font-bold uppercase tracking-wider">
                          <span>Capability 0{fi + 1}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 font-display uppercase tracking-tight">
                          {f}
                        </h3>
                      </div>
                      <div className="flex-1 w-full">
                        <div className="relative h-[280px] w-full shadow-lg border border-slate-200">
                          {imgSrc && (
                            <Image 
                              src={imgSrc} 
                              alt={f} 
                              fill
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              unoptimized={!isOptimizableImage(imgSrc)}
                              className="object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* 4. Applications & Sectors */}
        {richContent?.applications && richContent.applications.length > 0 && (
          <section className="py-20 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mb-12">
                <span className="text-xs font-bold text-construction-red uppercase tracking-widest block mb-2">Sectors &amp; Typologies</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight">
                  {richContent.applicationsHeading}
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {richContent.applications.map((app, ai) => (
                  <div key={ai} className="bg-slate-50 border border-slate-200/80 p-7 hover:border-slate-300 transition-colors shadow-sm">
                    <div className="w-10 h-10 bg-construction-navy text-white flex items-center justify-center font-bold text-xs mb-4">
                      0{ai + 1}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
                      {app.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 font-light leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. Process / Coordinated Stages */}
        {richContent?.stages && richContent.stages.length > 0 && (
          <section className="py-20 bg-slate-50 border-b border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mb-12">
                <span className="text-xs font-bold text-construction-red uppercase tracking-widest block mb-2">Workflow &amp; Coordination</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight">
                  {richContent.stagesHeading}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {richContent.stages.map((stg, si) => (
                  <div key={si} className="bg-white border border-slate-200 p-5 flex flex-col justify-between shadow-sm relative">
                    <div>
                      <span className="text-xs font-black text-construction-red uppercase tracking-widest block mb-2">Step {stg.step}</span>
                      <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
                        {stg.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-light leading-relaxed">
                        {stg.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. Confirmed Deliverables */}
        {richContent?.deliverables && richContent.deliverables.length > 0 && (
          <section className="py-20 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-slate-900 text-white p-8 md:p-12 border border-slate-800 shadow-xl">
                <div className="max-w-3xl mb-8">
                  <span className="text-xs font-black text-construction-red uppercase tracking-[0.2em] block mb-2">Project Handover</span>
                  <h2 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-tight">
                    {richContent.deliverablesHeading}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 font-light mt-2">
                    Every HiPRO engagement concludes with verified documentation, technical schedules, and physical deliverables.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  {richContent.deliverables.map((deliv, di) => (
                    <div key={di} className="flex items-start gap-3 bg-white/5 border border-white/10 p-4">
                      <Icons.CheckCircle className="w-4 h-4 text-construction-red shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-slate-200 leading-snug">{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 7. Indicative Package Rates (Construction Only) */}
        {richContent?.indicativeRatesNotice && (
          <section className="py-16 bg-slate-50 border-b border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white border border-slate-200 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <span className="text-xs font-bold text-construction-red uppercase tracking-widest block mb-1">Budget Planning</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-display uppercase tracking-tight">
                      {richContent.indicativeRatesNotice.heading}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-600 font-light mt-2 max-w-2xl">
                      {richContent.indicativeRatesNotice.description}
                    </p>
                  </div>
                  <Link
                    href="/cost-estimator"
                    className="inline-flex items-center gap-2 bg-construction-navy hover:bg-blue-900 text-white font-bold px-6 py-3 text-xs uppercase tracking-wider shrink-0 transition-colors shadow-md"
                  >
                    <span>Use Cost Estimator</span>
                    <Icons.ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {richContent.indicativeRatesNotice.tiers.map((tier, ti) => (
                    <div key={ti} className="border border-slate-200 p-5 bg-slate-50/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{tier.name}</span>
                          <span className="text-sm font-black text-construction-red">{tier.rate}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-light leading-relaxed">{tier.highlight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 8. Why Choose HiPRO */}
        {richContent?.whyChoosePoints && richContent.whyChoosePoints.length > 0 && (
          <section className="py-20 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mb-12">
                <span className="text-xs font-bold text-construction-red uppercase tracking-widest block mb-2">Technical Distinction</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight">
                  {richContent.whyChooseHeading}
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {richContent.whyChoosePoints.map((pt, pi) => (
                  <div key={pi} className="border border-slate-200 p-7 bg-slate-50">
                    <div className="w-10 h-10 bg-construction-red text-white flex items-center justify-center font-bold text-xs mb-4">
                      <Icons.ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
                      {pt.title
                        .replace(/8\+\s*Years/gi, `${expStat} Years`)
                        .replace(/150\+\s*Completed Projects/gi, `${projectStat} Completed Projects`)
                      }
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 font-light leading-relaxed">
                      {pt.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 9. Related Projects & Executed Case Studies */}
        {relatedProjects.length > 0 && (
          <section
            aria-labelledby="service-related-projects-heading"
            className="py-20 lg:py-24 bg-slate-50 border-b border-slate-200/80 relative overflow-hidden"
          >
            {/* Architectural Blueprint Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(#0F2C59 1px, transparent 1px), linear-gradient(to right, #0F2C59 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-200">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 text-construction-red text-[11px] font-bold uppercase tracking-widest mb-3 shadow-sm">
                    <Icons.Building2 className="w-3.5 h-3.5" />
                    <span>Proven Track Record &amp; Case Studies</span>
                  </div>
                  <h2
                    id="service-related-projects-heading"
                    className="text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight"
                  >
                    Featured Projects Delivered in{" "}
                    <span className="text-construction-red">{displayTitle}</span>
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 font-light mt-3 max-w-2xl leading-relaxed">
                    Explore real-world commercial, industrial, and turnkey landmarks engineered and supervised by Hindustan Projects across Rajasthan and India.
                  </p>
                </div>

                <Link
                  href="/projects"
                  className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-construction-navy hover:text-construction-red transition-colors bg-white hover:bg-slate-100 border border-slate-200 px-5 py-3 shadow-sm group shrink-0"
                >
                  <span>View All {publishedProjects.length > 0 ? `${publishedProjects.length}+ ` : ""}Projects</span>
                  <Icons.ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.map((rel) => {
                  const relSlug = rel.slug || rel.id;
                  const relIsOngoing = rel.status === "active" || rel.status === "ongoing";
                  const relServices = parseProjectServices(rel.services);

                  return (
                    <Link
                      key={rel.id}
                      href={`/projects/${relSlug}`}
                      className="group flex flex-col bg-white border border-slate-200 hover:border-slate-400 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl relative"
                    >
                      {/* Project Image */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 border-b border-slate-100">
                        {rel.image ? (
                          <Image
                            src={rel.image}
                            alt={rel.imageAlt || `${rel.title} - Hindustan Projects Case Study`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={!isOptimizableImage(rel.image)}
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-construction-navy text-slate-400 p-6 text-center">
                            <Icons.Building2 className="w-8 h-8 text-construction-red mb-2 opacity-80" />
                            <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-300">
                              HiPRO Execution
                            </span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-white/95 text-construction-navy border border-slate-200 shadow-sm backdrop-blur-sm">
                            {rel.category || "Civil Engineering"}
                          </span>
                          <span
                            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm ${
                              relIsOngoing
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300"
                            }`}
                          >
                            ● {relIsOngoing ? "Ongoing Site" : "Completed"}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          {/* Location & Client Meta */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 mb-2.5">
                            {rel.location && (
                              <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                                <Icons.MapPin className="w-3 h-3 text-construction-red shrink-0" />
                                <span className="truncate">{rel.location}</span>
                              </span>
                            )}
                            {rel.client && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[160px] text-slate-600 font-semibold">
                                  {rel.client}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-tight text-slate-900 group-hover:text-construction-navy transition-colors line-clamp-2 leading-snug">
                            {rel.title}
                          </h3>

                          {/* Short Description */}
                          {(rel.shortDescription || rel.description) && (
                            <p className="text-xs text-slate-600 font-light line-clamp-2 mt-2 leading-relaxed">
                              {rel.shortDescription || rel.description}
                            </p>
                          )}

                          {/* Scope / Service Pills */}
                          {relServices.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                              {relServices.slice(0, 2).map((srv, si) => (
                                <span
                                  key={si}
                                  className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono uppercase tracking-wide border border-slate-200/80"
                                >
                                  {srv}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Action Link */}
                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-construction-navy group-hover:text-construction-red transition-colors">
                          <span>Explore Case Study</span>
                          <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile View All Projects Link */}
              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 w-full text-xs font-bold uppercase tracking-wider text-construction-navy hover:text-construction-red transition-colors bg-white hover:bg-slate-100 border border-slate-200 px-6 py-3.5 shadow-sm"
                >
                  <span>Explore Full Projects Portfolio ({publishedProjects.length}+)</span>
                  <Icons.ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Consultation Callout Beneath Cards */}
              <div className="mt-12 bg-white border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <span className="text-[11px] font-bold text-construction-red uppercase tracking-widest block mb-1">
                    Custom Project Execution
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 font-display uppercase tracking-tight">
                    Planning a project under {displayTitle}?
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 font-light mt-1 max-w-2xl leading-relaxed">
                    Our civil engineers and project managers can conduct an initial site assessment and provide a detailed structural quote.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                  <Link
                    href="/projects"
                    className="flex-1 sm:flex-none text-center text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-5 py-3 transition-colors"
                  >
                    All Projects
                  </Link>
                  <Link
                    href={
                      ctaDetailPrimary
                        ? resolveCTAHref(ctaDetailPrimary)
                        : `/contact?service=${encodeURIComponent(service.title)}`
                    }
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-construction-red hover:bg-red-700 px-5 py-3 shadow-md shadow-red-600/20 transition-colors"
                  >
                    <span>Request Quotation</span>
                    <Icons.ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 10. Frequently Asked Questions */}
        {richContent?.faqs && richContent.faqs.length > 0 && (
          <section className="py-20 bg-white border-b border-slate-200/80">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-construction-red uppercase tracking-widest block mb-2">Client Guidance</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs md:text-sm text-slate-500 font-light mt-2">
                  Key technical details and execution guidelines regarding our {displayTitle.toLowerCase()} services.
                </p>
              </div>

              <div className="space-y-4">
                {richContent.faqs.map((faq, fqi) => (
                  <div key={fqi} className="bg-slate-50 border border-slate-200/90 p-6 shadow-sm hover:border-slate-300 transition-colors">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2 flex items-start gap-2.5">
                      <span className="text-construction-red font-black text-sm shrink-0 mt-0.5">Q{fqi + 1}.</span>
                      <span>{faq.question}</span>
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 font-light leading-relaxed pl-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 11. CTA & Contextual Navigation Section */}
        <section className="bg-white py-20 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-construction-navy mb-6 font-display uppercase tracking-tight">
              Need Expert Assistance with <span className="text-construction-red">{displayTitle}</span>?
            </h2>
            <p className="text-slate-600 mb-10 text-base md:text-lg font-light leading-relaxed">
              Our engineering and technical teams are ready to mobilize across Bhilwara and Rajasthan. Contact us today for a comprehensive consultation and project estimate.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {ctaDetailPrimary?.enabled !== false && (
                <Link
                  href={ctaDetailPrimary ? resolveCTAHref(ctaDetailPrimary) : `/contact?service=${encodeURIComponent(service.title)}`}
                  target={ctaDetailPrimary?.openNewTab ? "_blank" : undefined}
                  rel={ctaDetailPrimary?.openNewTab ? "noopener noreferrer" : undefined}
                  className="bg-construction-red hover:bg-red-700 text-white font-bold px-8 py-4 text-sm transition-all uppercase tracking-wider shadow-lg shadow-red-600/20"
                >
                  {ctaDetailPrimary?.label ?? "Get a Free Quote"}
                </Link>
              )}
              {ctaDetailSecondary?.enabled !== false && (
                <Link
                  href={ctaDetailSecondary ? resolveCTAHref(ctaDetailSecondary) : "/cost-estimator"}
                  target={ctaDetailSecondary?.openNewTab ? "_blank" : undefined}
                  rel={ctaDetailSecondary?.openNewTab ? "noopener noreferrer" : undefined}
                  className="bg-construction-navy hover:bg-blue-900 text-white font-bold px-8 py-4 text-sm transition-all uppercase tracking-wider shadow-md"
                >
                  {ctaDetailSecondary?.label ?? "Calculate Cost"}
                </Link>
              )}
              <a 
                href={`tel:${phone.replace(/\s+/g, '')}`} 
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-8 py-4 text-sm transition-all uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <Icons.Phone className="w-4 h-4 text-construction-red" /> Call Us Directly
              </a>
            </div>

            {/* Contextual Navigation to Other Services */}
            <div className="mt-12 pt-8 border-t border-slate-200/80">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Explore Complementary Engineering Capabilities
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {servicesList
                  .filter(s => s.id !== service.id && s.active !== false)
                  .slice(0, 3)
                  .map(relService => {
                    const relTitle = cleanServiceTitle(relService.title);
                    const relSlug = getServiceSlug(relTitle);
                    return (
                      <Link
                        key={relService.id}
                        href={`/services/${relSlug}`}
                        className="text-xs font-semibold text-slate-600 hover:text-construction-navy bg-white hover:bg-slate-100 px-4 py-2 border border-slate-200 uppercase tracking-wider transition-colors"
                      >
                        {relTitle} →
                      </Link>
                    );
                  })}
                <Link
                  href="/services"
                  className="text-xs font-bold text-construction-navy hover:text-construction-red bg-slate-50 hover:bg-slate-100 px-4 py-2 border border-construction-navy/30 uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                >
                  View More Services →
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

