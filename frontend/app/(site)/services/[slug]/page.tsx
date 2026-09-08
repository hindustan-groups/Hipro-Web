import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { findAll } from "@/lib/db";
import type { Service, Settings } from "@/lib/types";
import * as Icons from "lucide-react";
import DynamicIcon from "@/components/DynamicIcon";
import { cleanServiceTitle, cleanContentTypos, getServiceSlug } from "@/lib/companyData";
import { isOptimizableImage } from "@/lib/imageUtils";
import { generateBreadcrumbSchema, generateServiceSchema } from "@/lib/schema";

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

  return {
    title: cleanTitle,
    description: cleanDesc,
    alternates: {
      canonical: `/services/${canonicalSlug}`,
    },
    openGraph: {
      title: `${cleanTitle} | Hindustan Projects (HiPRO)`,
      description: cleanDesc,
      url: `https://www.hindustanprojects.in/services/${canonicalSlug}`,
      images: service.image ? [{ url: service.image }] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const [allServices, settingsData] = await Promise.all([
    findAll<Service>("services"),
    findAll<Settings>("settings"),
  ]);

  const settings = settingsData[0] || {};
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

  let features: string[] = [];
  try {
    features = typeof service.features === 'string' ? JSON.parse(service.features) : (Array.isArray(service.features) ? service.features : []);
  } catch {
    features = [];
  }

  // Dynamically create supplementary images from other services so it's not hardcoded
  const supplementaryImages = [
    service.image,
    ...allServices.filter(s => s.id !== service.id).map(s => s.image)
  ].filter(Boolean);

  const serviceSlug = getServiceSlug(displayTitle);
  const canonicalUrl = `https://www.hindustanprojects.in/services/${serviceSlug}`;

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.hindustanprojects.in" },
    { name: "Services", url: "https://www.hindustanprojects.in/services" },
    { name: displayTitle, url: canonicalUrl },
  ]);

  const serviceJsonLd = generateServiceSchema({
    name: displayTitle,
    description: displayDescription,
    url: canonicalUrl,
    image: service.image,
  });

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
      <div className="bg-white min-h-screen">
        
        {/* 1. Standard Hero Section */}
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
          
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-construction-red flex items-center justify-center text-white shadow-md rounded-full">
              <DynamicIcon name={service.icon || "Wrench"} className="w-6 h-6" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-construction-navy mb-6 font-display uppercase tracking-tight max-w-4xl mx-auto">
            {displayTitle}
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            {displayDescription}
          </p>
        </div>
      </section>

      {/* 2. Visual Zig-Zag Features */}
      {Array.isArray(features) && features.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
            
            {features.map((f: string, fi: number) => {
              const isEven = fi % 2 === 0;
              const imgSrc = supplementaryImages[fi % supplementaryImages.length];

              return (
                <div key={fi} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                  
                  {/* Text Content */}
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-red-50 border border-red-100 text-construction-red shadow-sm">
                      <span className="text-xs font-bold uppercase tracking-wider">Capability 0{fi + 1}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight leading-tight">
                      {f}
                    </h2>
                  </div>

                  {/* Image Content */}
                  <div className="flex-1 w-full">
                    <div className="relative h-[300px] lg:h-[350px] w-full shadow-2xl">
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
                      {/* Decorative Element */}
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isEven ? '-left-6' : '-right-6'} w-12 h-24 bg-construction-red hidden lg:block`} />
                    </div>
                  </div>
                  
                </div>
              );
            })}

          </div>
        </section>
      )}

      {/* 3. CTA Section */}
      <section className="bg-slate-50 py-20 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-construction-navy mb-6 font-display uppercase tracking-tight">
            Need Expert Assistance with <span className="text-construction-red">{displayTitle}</span>?
          </h2>
          <p className="text-slate-600 mb-10 text-lg font-light leading-relaxed">
            Our engineering and management teams are ready to deploy. Reach out today for a comprehensive consultation and project estimate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/contact?service=${encodeURIComponent(service.title)}`}
              className="bg-construction-red hover:bg-red-700 text-white font-bold px-8 py-4 text-sm transition-all uppercase tracking-wider shadow-lg shadow-red-600/20"
            >
              Get a Free Quote
            </Link>
            <Link
              href="/cost-estimator"
              className="bg-construction-navy hover:bg-blue-900 text-white font-bold px-8 py-4 text-sm transition-all uppercase tracking-wider shadow-md"
            >
              Calculate Cost
            </Link>
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
            </div>
          </div>
        </div>
      </section>

      </div>
    </>
  );
}
