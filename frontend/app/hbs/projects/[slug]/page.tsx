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
import { cleanTelNumber, getProjectWhatsAppUrl } from "@/lib/hbsWhatsApp";
import HbsHomePreFooterCta from "@/components/hbs/HbsHomePreFooterCta";

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
    title: { absolute: title },
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

  const phoneRaw = cleanTelNumber(content.phone);
  const projectWaUrl = getProjectWhatsAppUrl(content.whatsapp, project.title);

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

      <article className="min-h-screen pb-0">
        {/* A. BREADCRUMB NAVIGATION */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xs py-3.5 text-xs"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <ol className="flex items-center flex-wrap gap-2 text-slate-500 font-medium">
              <li>
                <Link
                  href={homeHref}
                  className="hover:text-red-600 transition-colors py-1 inline-flex items-center"
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
                  className="hover:text-red-600 transition-colors py-1 inline-flex items-center"
                >
                  Projects &amp; Case Studies
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

        {/* B. HERO SECTION (Light Architectural Composition) */}
        <header className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200/80 text-slate-900 overflow-hidden pt-8 sm:pt-14 pb-10 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Case Study Title & Context */}
              <div className="lg:col-span-7 space-y-5">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200/80 text-red-600 text-xs font-mono font-bold uppercase tracking-wider rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                    <span>Verified Field Case Study</span>
                  </span>

                  {project.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-md">
                      <Award className="w-3 h-3" />
                      <span>Featured Execution</span>
                    </span>
                  )}

                  {project.serviceCategory && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-[#0D2D5E]/10 text-[#0D2D5E] border border-[#0D2D5E]/20 text-xs font-mono font-bold uppercase rounded-md">
                      {project.serviceCategory}
                    </span>
                  )}
                </div>

                {/* H1 Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900 font-display leading-[1.12]">
                  {project.title}
                </h1>

                {/* Short Description */}
                {project.description && (
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-2xl">
                    {project.description}
                  </p>
                )}

                {/* Quick Meta Chips */}
                <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
                  {project.location && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs font-mono">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{project.location}</span>
                    </div>
                  )}
                  {project.date && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#0D2D5E] shrink-0" />
                      <span>{project.date}</span>
                    </div>
                  )}
                  {project.areaTreated && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs font-mono">
                      <Maximize2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{project.areaTreated}</span>
                    </div>
                  )}
                </div>

                {/* Hero Actions */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <Link
                    href={`${prefix}/contact?project=${encodeURIComponent(project.title)}`}
                    data-hbs-cta="quote"
                    className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 text-xs uppercase tracking-wider transition-all duration-200 shadow-md min-h-[46px] rounded-xl active:scale-[0.98]"
                  >
                    <Wrench className="w-4 h-4 text-white" />
                    <span>Discuss Your Project</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" aria-hidden="true" />
                  </Link>

                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    aria-label={`Call Hind Build at ${content.phone}`}
                    className="inline-flex items-center justify-center gap-2 bg-[#0D2D5E] hover:bg-[#0A2349] text-white font-bold px-5 py-3.5 text-xs uppercase tracking-wider transition-all duration-200 shadow-xs min-h-[46px] rounded-xl active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4 text-white" />
                    <span>Call Hind Build</span>
                  </a>

                  <a
                    href={projectWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hbs-cta="whatsapp"
                    className="inline-flex items-center justify-center gap-2 border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 font-bold px-5 py-3.5 text-xs uppercase tracking-wider transition-all duration-200 shadow-xs min-h-[46px] rounded-xl active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Hero / Featured Project Image */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] w-full bg-slate-100 border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden group">
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
                      <FolderKanban className="w-12 h-12 text-slate-400" />
                      <p className="text-xs uppercase tracking-wider font-mono text-slate-600 font-bold">
                        Hind Build Field Execution
                      </p>
                      <span className="text-[11px] text-slate-500">
                        Rajasthan Engineering Site
                      </span>
                    </div>
                  )}

                  {/* Corner Watermark */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-[10px] font-mono uppercase text-slate-200 border border-slate-700 pointer-events-none">
                    Verified Execution
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
          {/* D. CLIENT & PROJECT INFORMATION GRID (Render only available CMS data) */}
          {metaDetails.length > 0 && (
            <section
              aria-labelledby="project-parameters-heading"
              className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 sm:p-8"
            >
              <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 font-bold block">
                    Execution Profile
                  </span>
                  <h2
                    id="project-parameters-heading"
                    className="text-lg sm:text-xl font-bold uppercase font-display text-slate-900"
                  >
                    Project Information &amp; Parameters
                  </h2>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-mono font-semibold rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>On-Site Logged</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {metaDetails.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-1.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
                        <Icon className="w-4 h-4 text-red-600 shrink-0" />
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
            <div className="lg:col-span-8 space-y-8 sm:space-y-10">
              {/* C. PROJECT OVERVIEW */}
              {project.description && (
                <section
                  aria-labelledby="overview-heading"
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 font-bold block">
                      Case Study Overview
                    </span>
                    <h2
                      id="overview-heading"
                      className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                    >
                      Project Overview
                    </h2>
                  </div>
                  <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed space-y-4 font-sans">
                    <p>{project.description}</p>
                  </div>
                </section>
              )}

              {/* E. PROBLEM STATEMENT (Render only when populated) */}
              {project.problemStatement && (
                <section
                  aria-labelledby="problem-statement-heading"
                  className="bg-white border-l-4 border-l-red-600 border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 text-red-700">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Initial Site Diagnostics
                    </span>
                  </div>
                  <h2
                    id="problem-statement-heading"
                    className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                  >
                    The Problem &amp; Structural Challenges
                  </h2>
                  <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line pt-2 font-sans">
                    {project.problemStatement}
                  </div>
                </section>
              )}

              {/* F. SCOPE OF WORK (Render only when populated) */}
              {scopeItems.length > 0 && (
                <section
                  aria-labelledby="scope-heading"
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 font-bold block">
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
                        className="flex items-start gap-3 p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs sm:text-sm text-slate-800 font-medium"
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
                  className="bg-white border-l-4 border-l-[#0D2D5E] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 text-[#0D2D5E]">
                    <Lightbulb className="w-5 h-5 text-red-600 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Technical Remediation
                    </span>
                  </div>
                  <h2
                    id="solution-heading"
                    className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                  >
                    Engineered Solution &amp; Methodology
                  </h2>
                  <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line pt-2 font-sans">
                    {project.solutionStatement}
                  </div>
                </section>
              )}

              {/* H. RESULTS STATEMENT (Render only when populated) */}
              {project.resultStatement && (
                <section
                  aria-labelledby="results-heading"
                  className="bg-[#064e3b] text-white border-l-4 border-emerald-400 rounded-2xl p-6 sm:p-8 space-y-3 shadow-md"
                >
                  <div className="flex items-center gap-2.5 text-emerald-300">
                    <Award className="w-5 h-5 text-emerald-300 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      Outcome &amp; Handover
                    </span>
                  </div>
                  <h2
                    id="results-heading"
                    className="text-xl sm:text-2xl font-black uppercase font-display text-white"
                  >
                    Results &amp; Warranty Documentation
                  </h2>
                  <div className="text-sm sm:text-base text-emerald-100 leading-relaxed whitespace-pre-line pt-2 font-sans">
                    {project.resultStatement}
                  </div>
                </section>
              )}

              {/* I. BEFORE / AFTER IMAGE COMPARISONS (If available in CMS) */}
              {beforeAfterImages.length > 0 && (
                <section
                  aria-labelledby="before-after-heading"
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 font-bold block">
                      Visual Proof
                    </span>
                    <h2
                      id="before-after-heading"
                      className="text-xl sm:text-2xl font-black uppercase font-display text-slate-900"
                    >
                      Before &amp; After Documentation
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {beforeAfterImages.map((pair, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-200/80 rounded-xl p-4 sm:p-5 bg-slate-50/70 space-y-3"
                      >
                        {pair.title && (
                          <h3 className="text-sm font-bold uppercase font-display text-slate-900">
                            {pair.title}
                          </h3>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {pair.before && (
                            <div className="space-y-1.5">
                              <span className="inline-block text-[10px] font-mono uppercase font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                                Before Treatment
                              </span>
                              <div className="relative aspect-[4/3] w-full bg-slate-200 rounded-xl overflow-hidden border border-slate-300">
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
                              <span className="inline-block text-[10px] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                After Remediation
                              </span>
                              <div className="relative aspect-[4/3] w-full bg-slate-200 rounded-xl overflow-hidden border border-slate-300">
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
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 font-bold block">
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
                        className="relative aspect-[4/3] w-full bg-slate-100 border border-slate-200/70 rounded-xl overflow-hidden group shadow-2xs"
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
              {/* J. STRONG CTA CARD (Architectural Navy Contrast) */}
              <div className="bg-[#0D2D5E] text-white rounded-2xl p-6 sm:p-7 shadow-lg border-t-4 border-t-red-600 space-y-5">
                <div>
                  <span className="text-red-400 font-mono text-[10px] uppercase font-bold tracking-wider block">
                    Immediate Engineering Dispatch
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold uppercase font-display text-white mt-1">
                    Have A Similar Property Issue?
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Schedule a non-destructive site evaluation. Our engineers assess structural cracks, basement dampness, terrace leakage, and electrical distribution.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <Link
                    href={`${prefix}/contact?project=${encodeURIComponent(project.title)}`}
                    data-hbs-cta="quote"
                    className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3.5 text-xs uppercase tracking-wider transition-all duration-200 min-h-[44px] rounded-xl shadow-md active:scale-[0.98]"
                  >
                    <Wrench className="w-4 h-4 text-white" />
                    <span>Discuss Your Project</span>
                  </Link>

                  <a
                    href={projectWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hbs-cta="whatsapp"
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3.5 text-xs uppercase tracking-wider transition-all duration-200 min-h-[44px] rounded-xl active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    aria-label={`Call Hind Build at ${content.phone}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 text-xs uppercase tracking-wider transition-all duration-200 border border-white/20 min-h-[44px] rounded-xl active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4 text-red-400" />
                    <span>Call: {content.phone || "+91 94625 77757"}</span>
                  </a>
                </div>

                <div className="pt-3 border-t border-white/15 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Transparent Itemized Billing</span>
                  <span className="text-red-400 font-bold">Zero Hidden Fees</span>
                </div>
              </div>

              {/* 12. INTERNAL LINKING: CONNECTED SERVICE CARD (If serviceCategory matches) */}
              {matchedService && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-red-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-red-600" />
                    <span>Related Hind Build Service</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 uppercase font-display">
                    {matchedService.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {matchedService.shortDescription ||
                      "Engineered solution providing specialized application, certified chemical barriers, and written work guarantee."}
                  </p>
                  <div className="pt-1">
                    <Link
                      href={`${prefix}/services/${matchedService.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700"
                    >
                      <span>Explore Service Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* 12. INTERNAL LINKING: EXPLORE ALL SERVICES */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-6 space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  Full Spectrum Maintenance
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Hind Build delivers 19 specialized engineering trades for residential, commercial, and industrial facilities.
                </p>
                <div className="pt-1">
                  <Link
                    href={`${prefix}/services`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700"
                  >
                    <span>Browse All 19 Services</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* OTHER RECENT CASE STUDIES */}
              {otherProjects.length > 0 && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                      More Case Studies
                    </h4>
                    <Link
                      href={`${prefix}/projects`}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 uppercase"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {otherProjects.map((op) => (
                      <Link
                        key={op.id}
                        href={`${prefix}/projects/${op.slug}`}
                        className="block p-3 border border-slate-200/70 rounded-xl hover:border-red-300 hover:bg-red-50/20 transition-all"
                      >
                        <span className="text-[10px] font-mono text-red-600 uppercase font-bold block mb-0.5">
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

        {/* UNIFIED HIND BUILD PRE-FOOTER CTA */}
        <div className="mt-16 sm:mt-20">
          <HbsHomePreFooterCta
            content={content}
            isSubdomain={isSubdomain}
          />
        </div>
      </article>
    </>
  );
}
