import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  MessageSquare,
  Phone,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  MapPin,
  Calendar,
  Layers,
  Award,
  AlertTriangle,
  Lightbulb,
  Building,
  Maximize2,
  FolderKanban,
  CheckCircle2,
  Share2
} from "lucide-react";
import {
  fetchHbsContent,
  fetchHbsProjects,
  fetchHbsProjectBySlug,
  fetchHbsServices
} from "@/lib/hbsData";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await fetchHbsProjects();
  return projects
    .filter((p) => Boolean(p.slug))
    .map((p) => ({ slug: p.slug as string }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [project, content] = await Promise.all([
    fetchHbsProjectBySlug(slug),
    fetchHbsContent(),
  ]);

  if (!project) {
    return {
      title: "Project Not Found | Hind Build",
    };
  }

  const isSubdomainActive = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const baseUrl = isSubdomainActive
    ? "https://hindbuilding.hindustanprojects.in"
    : "https://www.hindustanprojects.in";
  const canonicalUrl = `${baseUrl}/projects/${project.slug}`;

  const title = project.metaTitle || `${project.title} | Case Study | Hind Build`;
  const description =
    project.metaDescription ||
    project.description ||
    `Verified engineering case study: ${project.title}. Executed in ${project.location || "Rajasthan"} by Hind Build, specialized building maintenance and repair division under Hindustan Projects.`;

  // Determine OG image safely - NEVER fall back to parent HiPRO /logo.jpg
  const imagesList = parseImages(project.images);
  const heroImage = imagesList[0] || null;
  const ogImage =
    (project as any).ogImage ||
    heroImage ||
    content.ogDefaultImage ||
    content.logoPrimary ||
    "/hbs-og-default.svg";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "Hind Build",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${project.title} - Hind Build Case Study`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// Helpers for safe array parsing
function parseImages(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter((item) => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
  }
  return [];
}

function parseBeforeAfter(val: any): Array<{ before?: string; after?: string; title?: string }> {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

function parseScopeOfWork(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter((item) => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      return val
        .split("\n")
        .map((s) => s.trim().replace(/^[-*•]\s*/, ""))
        .filter((s) => s.length > 0);
    }
  }
  return [];
}

export default async function HbsProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, content, allServices, allProjects] = await Promise.all([
    fetchHbsProjectBySlug(slug),
    fetchHbsContent(),
    fetchHbsServices(),
    fetchHbsProjects(),
  ]);

  // Strict: unknown project slug must call notFound()
  if (!project) {
    notFound();
  }

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const phoneRaw = content.phone.replace(/[^\d+]/g, "") || "+917597000601";
  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

  // Parse structured data safely
  const images = parseImages(project.images);
  const beforeAfterImages = parseBeforeAfter(project.beforeAfterImages);
  const scopeItems = parseScopeOfWork(project.scopeOfWork);

  const heroImage = images.length > 0 ? images[0] : null;
  const galleryImages = images.length > 1 ? images.slice(1) : [];

  // Find matching service if serviceCategory matches an existing HBS service
  const matchedService = allServices.find(
    (s) =>
      project.serviceCategory &&
      (s.title.toLowerCase().includes(project.serviceCategory.toLowerCase()) ||
        s.slug.toLowerCase().includes(project.serviceCategory.toLowerCase()) ||
        project.serviceCategory.toLowerCase().includes(s.title.toLowerCase()))
  );

  // Other related projects
  const otherProjects = allProjects
    .filter((p) => p.slug && p.slug !== project.slug)
    .slice(0, 3);

  // Schema.org Structured Data
  const projectUrl = isSubdomain
    ? `https://hindbuilding.hindustanprojects.in/projects/${project.slug}`
    : `https://www.hindustanprojects.in/hbs/projects/${project.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.description || undefined,
    image: heroImage || undefined,
    datePublished: project.createdAt ? new Date(project.createdAt).toISOString() : undefined,
    dateModified: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
    author: {
      "@type": "Organization",
      name: "Hind Build",
      url: isSubdomain
        ? "https://hindbuilding.hindustanprojects.in"
        : "https://www.hindustanprojects.in/hbs",
    },
    publisher: {
      "@type": "Organization",
      name: "Hind Build",
      url: isSubdomain
        ? "https://hindbuilding.hindustanprojects.in"
        : "https://www.hindustanprojects.in/hbs",
      logo: {
        "@type": "ImageObject",
        url: content.logoPrimary || "https://hindbuilding.hindustanprojects.in/hbs-og-default.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": projectUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: isSubdomain
          ? "https://hindbuilding.hindustanprojects.in"
          : "https://www.hindustanprojects.in/hbs",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: isSubdomain
          ? "https://hindbuilding.hindustanprojects.in/projects"
          : "https://www.hindustanprojects.in/hbs/projects",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: projectUrl,
      },
    ],
  };

  // Compile available metadata entries (do not invent missing values)
  const metaDetails: Array<{ label: string; value: string; icon: any }> = [];
  if (project.clientType) {
    metaDetails.push({ label: "Client / Property Type", value: project.clientType, icon: Building });
  }
  if (project.serviceCategory) {
    metaDetails.push({ label: "Specialization", value: project.serviceCategory, icon: FolderKanban });
  }
  if (project.location) {
    metaDetails.push({ label: "Project Location", value: project.location, icon: MapPin });
  }
  if (project.areaTreated) {
    metaDetails.push({ label: "Area Treated", value: project.areaTreated, icon: Maximize2 });
  }
  if (project.durationDays && project.durationDays > 0) {
    metaDetails.push({
      label: "Execution Duration",
      value: `${project.durationDays} Days`,
      icon: Clock,
    });
  }
  if (project.date) {
    metaDetails.push({ label: "Completion Date", value: project.date, icon: Calendar });
  }
  if (project.status) {
    metaDetails.push({
      label: "Project Status",
      value: project.status === "completed" ? "Successfully Completed & Warranty Active" : project.status,
      icon: CheckCircle2,
    });
  }

  return (
    <>
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="min-h-screen pb-16">
        {/* A. BREADCRUMB NAVIGATION */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-slate-200 bg-slate-50/75 py-3 text-xs"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ol className="flex items-center flex-wrap gap-2 text-slate-500 font-medium">
              <li>
                <Link
                  href={homeHref}
                  className="hover:text-amber-700 transition-colors py-1 inline-flex items-center"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li>
                <Link
                  href={`${prefix}/projects`}
                  className="hover:text-amber-700 transition-colors py-1 inline-flex items-center"
                >
                  Projects & Case Studies
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li className="text-slate-900 font-bold truncate max-w-[220px] sm:max-w-md">
                {project.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* B. HERO SECTION */}
        <header className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Case Study Title & Context */}
              <div className="lg:col-span-7 space-y-5">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Verified Field Case Study</span>
                  </span>

                  {project.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                      <Award className="w-3 h-3" />
                      <span>Featured Execution</span>
                    </span>
                  )}

                  {project.serviceCategory && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono uppercase">
                      {project.serviceCategory}
                    </span>
                  )}
                </div>

                {/* H1 Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white font-display leading-[1.1]">
                  {project.title}
                </h1>

                {/* Short Description */}
                {project.description && (
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
                    {project.description}
                  </p>
                )}

                {/* Quick Meta Chips */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
                  {project.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{project.location}</span>
                    </div>
                  )}
                  {project.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{project.date}</span>
                    </div>
                  )}
                  {project.areaTreated && (
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{project.areaTreated}</span>
                    </div>
                  )}
                </div>

                {/* Hero Actions */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`${prefix}/contact?project=${encodeURIComponent(project.title)}`}
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 text-xs uppercase tracking-wider transition-colors shadow-lg min-h-[44px]"
                  >
                    <Wrench className="w-4 h-4 text-slate-950" />
                    <span>Inquire Similar Site Work</span>
                  </Link>

                  <a
                    href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
                      `Hello Hind Build, I am interested in your project: "${project.title}". Can you provide an inspection for a similar issue at my property?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3.5 text-xs uppercase tracking-wider transition-colors min-h-[44px]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Discuss on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Hero / Featured Project Image */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] w-full bg-slate-900 border-2 border-slate-800 shadow-2xl overflow-hidden group">
                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={project.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 500px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                      <FolderKanban className="w-12 h-12 text-slate-600" />
                      <p className="text-xs uppercase tracking-wider font-mono text-slate-400">
                        Hind Build Field Execution
                      </p>
                      <span className="text-[11px] text-slate-500">
                        Bhilwara, Rajasthan
                      </span>
                    </div>
                  )}

                  {/* Corner Watermark */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono uppercase text-slate-300 border border-slate-700 pointer-events-none">
                    Verified Execution
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 space-y-12">
          {/* D. CLIENT & PROJECT INFORMATION GRID (Render only available CMS data) */}
          {metaDetails.length > 0 && (
            <section
              aria-labelledby="project-parameters-heading"
              className="bg-white border border-slate-200 shadow-xs p-6 sm:p-8"
            >
              <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold block">
                    Execution Profile
                  </span>
                  <h2
                    id="project-parameters-heading"
                    className="text-lg sm:text-xl font-bold uppercase font-display text-slate-900"
                  >
                    Project Information & Parameters
                  </h2>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>On-Site Logged</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {metaDetails.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200/80 space-y-1"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Icon className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 12-COL CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT 8 COLS: CASE STUDY NARRATIVE (C, E, F, G, H, I) */}
            <div className="lg:col-span-8 space-y-10">
              {/* C. PROJECT OVERVIEW */}
              {project.description && (
                <section
                  aria-labelledby="overview-heading"
                  className="bg-white border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold block">
                      Case Study
                    </span>
                    <h2
                      id="overview-heading"
                      className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                    >
                      Project Overview
                    </h2>
                  </div>
                  <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
                    <p>{project.description}</p>
                  </div>
                </section>
              )}

              {/* E. PROBLEM STATEMENT (Render only when populated) */}
              {project.problemStatement && (
                <section
                  aria-labelledby="problem-statement-heading"
                  className="bg-white border-l-4 border-l-amber-600 border border-slate-200 p-6 sm:p-8 space-y-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 text-amber-800">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Initial Site Diagnostics
                    </span>
                  </div>
                  <h2
                    id="problem-statement-heading"
                    className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                  >
                    The Problem & Structural Challenges
                  </h2>
                  <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line pt-2">
                    {project.problemStatement}
                  </div>
                </section>
              )}

              {/* F. SCOPE OF WORK (Render only when populated) */}
              {scopeItems.length > 0 && (
                <section
                  aria-labelledby="scope-heading"
                  className="bg-white border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold block">
                      Engineering Deliverables
                    </span>
                    <h2
                      id="scope-heading"
                      className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                    >
                      Scope of Work Executed
                    </h2>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {scopeItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* G. SOLUTION STATEMENT (Render only when populated) */}
              {project.solutionStatement && (
                <section
                  aria-labelledby="solution-heading"
                  className="bg-white border-l-4 border-l-slate-900 border border-slate-200 p-6 sm:p-8 space-y-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 text-slate-900">
                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Technical Remediation
                    </span>
                  </div>
                  <h2
                    id="solution-heading"
                    className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                  >
                    Engineered Solution & Methodology
                  </h2>
                  <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line pt-2">
                    {project.solutionStatement}
                  </div>
                </section>
              )}

              {/* H. RESULTS STATEMENT (Render only when populated) */}
              {project.resultStatement && (
                <section
                  aria-labelledby="results-heading"
                  className="bg-emerald-950 text-white border-l-4 border-emerald-500 p-6 sm:p-8 space-y-3 shadow-md"
                >
                  <div className="flex items-center gap-2.5 text-emerald-400">
                    <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Outcome & Handover
                    </span>
                  </div>
                  <h2
                    id="results-heading"
                    className="text-xl sm:text-2xl font-black uppercase font-display text-white"
                  >
                    Results & Warranty Documentation
                  </h2>
                  <div className="text-sm sm:text-base text-emerald-100 leading-relaxed whitespace-pre-line pt-2">
                    {project.resultStatement}
                  </div>
                </section>
              )}

              {/* I. BEFORE / AFTER IMAGE COMPARISONS (If available in CMS) */}
              {beforeAfterImages.length > 0 && (
                <section
                  aria-labelledby="before-after-heading"
                  className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
                >
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold block">
                      Visual Proof
                    </span>
                    <h2
                      id="before-after-heading"
                      className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                    >
                      Before & After Documentation
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {beforeAfterImages.map((pair, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-200 p-4 bg-slate-50 space-y-3"
                      >
                        {pair.title && (
                          <h3 className="text-sm font-bold uppercase font-display text-slate-900">
                            {pair.title}
                          </h3>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {pair.before && (
                            <div className="space-y-1.5">
                              <span className="inline-block text-[10px] font-mono uppercase font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5">
                                Before Treatment
                              </span>
                              <div className="relative aspect-[4/3] w-full bg-slate-200 overflow-hidden border border-slate-300">
                                <Image
                                  src={pair.before}
                                  alt={`Before treatment - ${project.title}`}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 400px"
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                          {pair.after && (
                            <div className="space-y-1.5">
                              <span className="inline-block text-[10px] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                                After Remediation
                              </span>
                              <div className="relative aspect-[4/3] w-full bg-slate-200 overflow-hidden border border-slate-300">
                                <Image
                                  src={pair.after}
                                  alt={`After remediation - ${project.title}`}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 400px"
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* I. PROJECT GALLERY (Render project images from CMS) */}
              {galleryImages.length > 0 && (
                <section
                  aria-labelledby="gallery-heading"
                  className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
                >
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold block">
                      Site Photography
                    </span>
                    <h2
                      id="gallery-heading"
                      className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                    >
                      Execution Photo Gallery
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-[4/3] w-full bg-slate-100 border border-slate-200 overflow-hidden group shadow-xs"
                      >
                        <Image
                          src={imgUrl}
                          alt={`${project.title} - Site photograph ${idx + 2}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT 4 COLS: STICKY SIDEBAR (J. CTA, Matched Service, Related Projects) */}
            <aside className="lg:col-span-4 space-y-6">
              {/* J. STRONG CTA CARD (Using HBS global settings) */}
              <div className="bg-slate-900 text-white p-6 sm:p-7 border-t-4 border-amber-500 shadow-xl space-y-5">
                <div>
                  <span className="text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider block">
                    Immediate Engineering Dispatch
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold uppercase font-display text-white mt-1">
                    Have A Similar Property Issue?
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Schedule a non-destructive site evaluation. Our engineers assess structural cracks, basement dampness, terrace leakage, and electrical distribution.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Link
                    href={`${prefix}/contact?project=${encodeURIComponent(project.title)}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-3.5 text-xs uppercase tracking-wider transition-colors min-h-[44px]"
                  >
                    <Wrench className="w-4 h-4 text-slate-950" />
                    <span>Book Site Inspection</span>
                  </Link>

                  <a
                    href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
                      `Hello Hind Build, I am looking for a quote similar to your case study: "${project.title}".`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3.5 text-xs uppercase tracking-wider transition-colors min-h-[44px]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Quotation</span>
                  </a>

                  <a
                    href={`tel:${phoneRaw}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-4 py-3 text-xs uppercase tracking-wider transition-colors border border-slate-700 min-h-[44px]"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Call: {content.phone}</span>
                  </a>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Transparent Itemized Billing</span>
                  <span className="text-amber-400 font-bold">Zero Hidden Fees</span>
                </div>
              </div>

              {/* 12. INTERNAL LINKING: CONNECTED SERVICE CARD (If serviceCategory matches) */}
              {matchedService && (
                <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-amber-700" />
                    <span>Related Hind Build Service</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 uppercase font-display">
                    {matchedService.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {matchedService.shortDescription ||
                      "Engineered solution providing specialized application, certified chemical barriers, and written work guarantee."}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`${prefix}/services/${matchedService.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800"
                    >
                      <span>Explore Service Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* 12. INTERNAL LINKING: EXPLORE ALL SERVICES */}
              <div className="bg-slate-50 border border-slate-200 p-6 space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  Full Spectrum Maintenance
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hind Build delivers 19 specialized engineering trades for residential, commercial, and industrial facilities.
                </p>
                <div className="pt-1">
                  <Link
                    href={`${prefix}/services`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800"
                  >
                    <span>Browse All 19 Services</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* OTHER RECENT CASE STUDIES */}
              {otherProjects.length > 0 && (
                <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                      More Case Studies
                    </h4>
                    <Link
                      href={`${prefix}/projects`}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 uppercase"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {otherProjects.map((op) => (
                      <Link
                        key={op.id}
                        href={`${prefix}/projects/${op.slug}`}
                        className="block p-3 border border-slate-100 hover:border-amber-300 hover:bg-slate-50/50 transition-colors"
                      >
                        <span className="text-[10px] font-mono text-amber-700 uppercase font-bold block mb-0.5">
                          {op.location || "Rajasthan"}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 uppercase font-display line-clamp-1">
                          {op.title}
                        </h5>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
