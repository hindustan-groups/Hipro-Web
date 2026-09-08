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
import { generateBreadcrumbSchema, generateServiceSchema, generateFaqSchema } from "@/lib/schema";
import { getServiceDetailContent } from "@/lib/serviceContentData";

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
  const richContent = getServiceDetailContent(canonicalSlug) || getServiceDetailContent(paramSlug) || getServiceDetailContent(cleanTitle);

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

  let fallbackFeatures: string[] = [];
  try {
    fallbackFeatures = typeof service.features === 'string' ? JSON.parse(service.features) : (Array.isArray(service.features) ? service.features : []);
  } catch {
    fallbackFeatures = [];
  }

  const serviceSlug = getServiceSlug(displayTitle);
  const canonicalUrl = `https://www.hindustanprojects.in/services/${serviceSlug}`;
  const richContent = getServiceDetailContent(serviceSlug) || getServiceDetailContent(paramSlug) || getServiceDetailContent(displayTitle);

  const supplementaryImages = [
    service.image,
    ...allServices.filter(s => s.id !== service.id).map(s => s.image)
  ].filter(Boolean);

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
                  <p key={pi}>{para}</p>
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
                      {pt.title}
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

        {/* 9. Frequently Asked Questions */}
        {richContent?.faqs && richContent.faqs.length > 0 && (
          <section className="py-20 bg-slate-50 border-b border-slate-200/80">
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
                  <div key={fqi} className="bg-white border border-slate-200 p-6 shadow-sm">
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

        {/* 10. CTA & Contextual Navigation Section */}
        <section className="bg-white py-20 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-construction-navy mb-6 font-display uppercase tracking-tight">
              Need Expert Assistance with <span className="text-construction-red">{displayTitle}</span>?
            </h2>
            <p className="text-slate-600 mb-10 text-base md:text-lg font-light leading-relaxed">
              Our engineering and technical teams are ready to mobilize across Bhilwara and Rajasthan. Contact us today for a comprehensive consultation and project estimate.
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

