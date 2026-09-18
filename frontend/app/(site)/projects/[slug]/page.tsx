import type { Metadata } from "next";
import { notFound, redirect, RedirectType } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Layers,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Compass,
  Ruler,
  Briefcase,
  Play,
  FileText,
  UserCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type { Project, ProjectGalleryItem, ProjectHighlight, ProjectFaq } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";
import ProjectGalleryLightbox, { GalleryImageItem } from "@/components/projects/ProjectGalleryLightbox";
import {
  generateProjectBreadcrumbs,
  generateProjectJsonLd,
  generateProjectFaqSchema,
} from "@/lib/projectSchema";

export const revalidate = 60;

function getBackendUrl(): string {
  let rawUrl = process.env.BACKEND_API_URL || "https://hipro-backend-749v.onrender.com";
  if (rawUrl.startsWith("https:") && !rawUrl.startsWith("https://")) {
    rawUrl = rawUrl.replace(/^https:?\/*/, "https://");
  } else if (rawUrl.startsWith("http:") && !rawUrl.startsWith("http://")) {
    rawUrl = rawUrl.replace(/^http:?\/*/, "http://");
  } else if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    rawUrl = `https://${rawUrl}`;
  }
  return rawUrl.replace(/\/+$/, "");
}

interface ProjectLookupResult {
  project: Project;
  isLegacyId: boolean;
  canonicalSlug: string;
}

async function getProjectData(slugOrId: string): Promise<ProjectLookupResult | null> {
  const backendUrl = getBackendUrl();
  try {
    const res = await fetch(`${backendUrl}/api/projects/${encodeURIComponent(slugOrId)}`, {
      next: { revalidate: 60, tags: ["projects", `project-${slugOrId}`] },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      return null;
    }

    const project: Project = json.data;

    // Strict public visibility check (defense-in-depth)
    if (project.publishStatus !== "published" || project.status === "archived") {
      return null;
    }

    return {
      project,
      isLegacyId: Boolean(json.isLegacyId),
      canonicalSlug: json.canonicalSlug || project.slug || project.id || slugOrId,
    };
  } catch (err) {
    console.error(`[Project Detail] Error fetching project ${slugOrId}:`, err);
    return null;
  }
}

async function getRelatedProjects(currentProjectId: string, category: string): Promise<Project[]> {
  const backendUrl = getBackendUrl();
  try {
    const res = await fetch(
      `${backendUrl}/api/projects?category=${encodeURIComponent(category)}`,
      {
        next: { revalidate: 60, tags: ["projects"] },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) return [];
    const json = await res.json();
    const projects: Project[] = Array.isArray(json.data) ? json.data : [];

    return projects
      .filter((p) => p.id !== currentProjectId && p.publishStatus === "published" && p.status !== "archived")
      .slice(0, 3);
  } catch (err) {
    console.error("[Project Detail] Error fetching related projects:", err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getProjectData(decodeURIComponent(params.slug));
  if (!data || !data.project) {
    return {
      title: "Project Case Study | Hindustan Projects (HiPRO)",
      description: "Engineering and infrastructure project portfolio by Hindustan Projects.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const p = data.project;
  const baseUrl = "https://www.hindustanprojects.in";
  const canonicalUrl =
    p.canonicalUrl && (p.canonicalUrl.startsWith("http://") || p.canonicalUrl.startsWith("https://"))
      ? p.canonicalUrl
      : `${baseUrl}/projects/${p.slug || params.slug}`;

  const pageTitle =
    p.metaTitle?.trim() || `${p.title} | ${p.category} Case Study | Hindustan Projects`;
  const pageDescription =
    p.metaDescription?.trim() ||
    p.shortDescription?.trim() ||
    (p.description
      ? p.description.slice(0, 160).trim()
      : `Executed ${p.category.toLowerCase()} civil engineering and turnkey infrastructure project by Hindustan Projects (HiPRO).`);

  const ogImageUrl = p.ogImage?.trim() || p.image?.trim() || undefined;

  // Keywords (only if explicitly populated)
  const keywordsList: string[] = [];
  if (p.focusKeywords && p.focusKeywords.trim()) keywordsList.push(p.focusKeywords.trim());
  if (p.secondaryKeywords && p.secondaryKeywords.trim()) keywordsList.push(p.secondaryKeywords.trim());

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywordsList.length > 0 ? keywordsList : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !p.noIndex,
      follow: !p.noFollow,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: "Hindustan Projects",
      locale: "en_IN",
      type: "article",
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              alt: p.imageAlt || `${p.title} - Hindustan Projects Execution Record`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

// Helper to safely parse JSON strings or arrays
function parseJsonSafe<T>(raw: any, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === "object") return raw as T;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

// Extract clean YouTube embed URL
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.replace("/embed/", "");
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.replace("/shorts/", "");
      }
    } else if (parsed.hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1);
    }

    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : null;
  } catch {
    return null;
  }
}

// Extract Vimeo embed URL
function getVimeoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("vimeo.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const videoId = parts[parts.length - 1];
      if (/^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const rawParam = decodeURIComponent(params.slug);
  const data = await getProjectData(rawParam);

  if (!data || !data.project) {
    return notFound();
  }

  const { project, isLegacyId, canonicalSlug } = data;

  // Canonical Slug Redirect:
  // If the user accessed via a legacy CUID id or an outdated identifier, permanently redirect to canonical slug
  if (isLegacyId || (project.slug && rawParam !== project.slug)) {
    redirect(`/projects/${project.slug}`, RedirectType.replace);
  }

  // Related projects
  const relatedProjects = await getRelatedProjects(project.id || "", project.category);

  // Parse Gallery Images
  const galleryItems: GalleryImageItem[] = [];
  const seenUrls = new Set<string>();

  // 1. Check galleryDetails
  const detailedGallery = parseJsonSafe<ProjectGalleryItem[]>(project.galleryDetails, []);
  if (Array.isArray(detailedGallery)) {
    detailedGallery.forEach((item) => {
      if (item && item.url && !seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        galleryItems.push({
          url: item.url,
          alt: item.alt || `${project.title} - Architectural View`,
          caption: item.caption,
        });
      }
    });
  }

  // 2. Check legacy images string
  if (project.images) {
    let rawImagesList: string[] = [];
    try {
      if (project.images.trim().startsWith("[")) {
        rawImagesList = JSON.parse(project.images);
      } else {
        rawImagesList = project.images.split("\n").map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      rawImagesList = project.images.split("\n").map((s) => s.trim()).filter(Boolean);
    }

    rawImagesList.forEach((url, i) => {
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        galleryItems.push({
          url,
          alt: `${project.title} - Execution Plate ${i + 1}`,
        });
      }
    });
  }

  // 3. Fallback: Include cover image if gallery has no separate images
  if (galleryItems.length === 0 && project.image) {
    galleryItems.push({
      url: project.image,
      alt: project.imageAlt || `${project.title} - Primary Perspective`,
      caption: project.imageCaption || undefined,
    });
  }

  // Parse Highlights
  const highlightsList = parseJsonSafe<ProjectHighlight[]>(project.highlights, []);

  // Parse Services (can be array or string)
  let servicesList: string[] = [];
  if (Array.isArray(project.services)) {
    servicesList = project.services.filter(Boolean);
  } else if (typeof project.services === "string" && project.services.trim()) {
    try {
      const parsed = JSON.parse(project.services);
      if (Array.isArray(parsed)) {
        servicesList = parsed.filter(Boolean);
      } else {
        servicesList = project.services.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      servicesList = project.services.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  // Parse Video
  const hasVideo = Boolean(project.videoUrl && project.videoUrl.trim() && project.videoType !== "none");
  let youtubeEmbedUrl: string | null = null;
  let vimeoEmbedUrl: string | null = null;
  if (hasVideo && project.videoUrl) {
    if (project.videoType === "youtube" || project.videoUrl.includes("youtube") || project.videoUrl.includes("youtu.be")) {
      youtubeEmbedUrl = getYouTubeEmbedUrl(project.videoUrl);
    } else if (project.videoType === "vimeo" || project.videoUrl.includes("vimeo")) {
      vimeoEmbedUrl = getVimeoEmbedUrl(project.videoUrl);
    }
  }

  // Verified Location Details (zero defaults, strictly what exists in record)
  const geoDetails: { label: string; value: string }[] = [];
  if (project.city && project.city.trim()) geoDetails.push({ label: "City", value: project.city.trim() });
  if (project.district && project.district.trim()) geoDetails.push({ label: "District", value: project.district.trim() });
  if (project.state && project.state.trim()) geoDetails.push({ label: "State", value: project.state.trim() });
  if (project.country && project.country.trim()) geoDetails.push({ label: "Country", value: project.country.trim() });
  if (project.postalCode && project.postalCode.trim()) geoDetails.push({ label: "Postal Code", value: project.postalCode.trim() });

  const hasVerifiedGeo = geoDetails.length > 0 || Boolean(project.googleMapsUrl) || (Boolean(project.latitude) && Boolean(project.longitude));

  // Executive Facts Ledger items (ONLY displayed if non-empty)
  const factsLedger: { label: string; value: string; icon: any }[] = [];
  if (project.client && project.client.trim()) {
    factsLedger.push({ label: "Client Organization", value: project.client.trim(), icon: Briefcase });
  }
  if (project.owner && project.owner.trim()) {
    factsLedger.push({ label: "Project Principal / Owner", value: project.owner.trim(), icon: UserCheck });
  }
  if (project.area && project.area.trim()) {
    factsLedger.push({ label: "Gross Built-Up Area", value: project.area.trim(), icon: Ruler });
  }
  if (project.category && project.category.trim()) {
    factsLedger.push({ label: "Sector Classification", value: project.category.trim(), icon: Building2 });
  }
  if (project.completionDate && project.completionDate.trim()) {
    factsLedger.push({ label: "Handover / Completion", value: project.completionDate.trim(), icon: Calendar });
  } else if (project.date && project.date.trim()) {
    factsLedger.push({ label: "Project Date", value: project.date.trim(), icon: Calendar });
  }
  if (project.location && project.location.trim()) {
    factsLedger.push({ label: "Site Location", value: project.location.trim(), icon: MapPin });
  }

  // Parse FAQs (ONLY if valid)
  const rawFaqs = parseJsonSafe<ProjectFaq[]>(project.faqs, []);
  const validFaqs: ProjectFaq[] = Array.isArray(rawFaqs)
    ? rawFaqs.filter(
        (f) =>
          f &&
          typeof f.question === "string" &&
          f.question.trim().length > 0 &&
          typeof f.answer === "string" &&
          f.answer.trim().length > 0
      )
    : [];

  const baseUrl = "https://www.hindustanprojects.in";
  const canonicalUrl =
    project.canonicalUrl && (project.canonicalUrl.startsWith("http://") || project.canonicalUrl.startsWith("https://"))
      ? project.canonicalUrl
      : `${baseUrl}/projects/${project.slug || rawParam}`;

  const breadcrumbJsonLd = generateProjectBreadcrumbs(project.title, project.slug || rawParam);
  const projectJsonLd = generateProjectJsonLd(project, canonicalUrl);
  const faqJsonLd = generateProjectFaqSchema(validFaqs);

  const isOngoing = project.status === "active" || project.status === "ongoing";

  return (
    <article className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* ─────────────────────────────────────────────────────────────
          STRUCTURED DATA / JSON-LD (Strictly Factual)
      ───────────────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {/* ─────────────────────────────────────────────────────────────
          1. PREMIUM HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <header className="relative w-full pt-28 pb-16 md:pt-36 md:pb-24 border-b border-slate-800/80 overflow-hidden">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(to right, #f59e0b 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs Navigation */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-400 mb-8">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/projects" className="hover:text-amber-400 transition-colors">
              Projects
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 truncate max-w-[240px] sm:max-w-md font-semibold">
              {project.title}
            </span>
          </nav>

          {/* Badges & Back Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {project.category}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider ${
                  isOngoing
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {isOngoing ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Ongoing Site</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Completed & Handed Over</span>
                  </>
                )}
              </span>
            </div>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              Back to Portfolio
            </Link>
          </div>

          {/* Primary Semantic H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display uppercase tracking-tight text-white max-w-5xl leading-[1.1] mb-6">
            {project.title}
          </h1>

          {/* Hero Quick Location/Date Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-medium">
            {project.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-slate-200">{project.location}</span>
              </span>
            )}
            {(project.completionDate || project.date) && (
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-slate-200">{project.completionDate || project.date}</span>
              </span>
            )}
          </div>
        </div>

        {/* Primary Cover Image Hero Showcase */}
        {project.image && (
          <div className="mt-10 sm:mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <figure className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[560px] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <Image
                src={project.image}
                alt={project.imageAlt || `${project.title} - Architectural Engineering Execution Perspective`}
                fill
                priority
                sizes="100vw"
                unoptimized={!isOptimizableImage(project.image)}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              {project.imageCaption && (
                <figcaption className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-xs text-slate-300 font-mono tracking-wide bg-black/75 backdrop-blur-sm p-3 border-l-2 border-amber-500 max-w-2xl">
                  {project.imageCaption}
                </figcaption>
              )}
            </figure>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. EXECUTIVE PROJECT FACTS LEDGER & MAIN CONTENT
      ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* MAIN NARRATIVE COLUMN (8 COLS) */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Executive Summary Brief (if exists) */}
            {project.shortDescription && (
              <section aria-labelledby="executive-summary-heading" className="p-6 md:p-8 bg-slate-900/80 border-l-4 border-amber-500 border-y border-r border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span id="executive-summary-heading">Executive Brief</span>
                </div>
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-light">
                  {project.shortDescription}
                </p>
              </section>
            )}

            {/* Case Study Narrative */}
            {project.description && (
              <section aria-labelledby="project-narrative-heading">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-800">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h2 id="project-narrative-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white">
                    Project Execution & Engineering Narrative
                  </h2>
                </div>
                <div className="prose prose-invert prose-slate max-w-none text-slate-300 text-base leading-relaxed font-light whitespace-pre-line space-y-4">
                  {project.description}
                </div>
              </section>
            )}

            {/* Project Highlights (Rendered ONLY if non-empty) */}
            {highlightsList.length > 0 && (
              <section aria-labelledby="project-highlights-heading">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-800">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 id="project-highlights-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white">
                    Key Execution Highlights
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {highlightsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors"
                    >
                      {item.label && (
                        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-1">
                          {item.label}
                        </span>
                      )}
                      <p className="text-sm font-medium text-slate-200">
                        {item.value || (typeof item === "string" ? item : "")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Services Deployed (Rendered ONLY if non-empty) */}
            {servicesList.length > 0 && (
              <section aria-labelledby="project-services-heading">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-800">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <h2 id="project-services-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white">
                    Engineering Disciplines & Services Deployed
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {servicesList.map((svc, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono uppercase tracking-wider hover:border-amber-500/50 transition-colors"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Video Showcase (Rendered ONLY if videoUrl exists) */}
            {hasVideo && (
              <section aria-labelledby="project-video-heading">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-800">
                  <Play className="w-5 h-5 text-amber-400" />
                  <h2 id="project-video-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white">
                    {project.videoTitle || "Execution Video Showcase"}
                  </h2>
                </div>

                {project.videoDescription && (
                  <p className="text-sm text-slate-400 font-light mb-4">
                    {project.videoDescription}
                  </p>
                )}

                <div className="relative aspect-video w-full bg-black border border-slate-800 overflow-hidden shadow-2xl">
                  {youtubeEmbedUrl ? (
                    <iframe
                      src={youtubeEmbedUrl}
                      title={project.videoTitle || `${project.title} Video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : vimeoEmbedUrl ? (
                    <iframe
                      src={vimeoEmbedUrl}
                      title={project.videoTitle || `${project.title} Video`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video
                      controls
                      poster={project.videoPoster || undefined}
                      preload="metadata"
                      className="w-full h-full object-cover"
                    >
                      <source src={project.videoUrl || ""} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </section>
            )}

            {/* Project Gallery & Execution Plates (Rendered ONLY if images exist) */}
            {galleryItems.length > 0 && (
              <section aria-labelledby="project-gallery-heading">
                <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <h2 id="project-gallery-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white">
                      Field Execution & Architectural Gallery
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {galleryItems.length} {galleryItems.length === 1 ? "Record" : "Records"}
                  </span>
                </div>

                <ProjectGalleryLightbox images={galleryItems} projectTitle={project.title} />
              </section>
            )}

            {/* Verified Location & Map Section (Rendered ONLY if verified data exists) */}
            {hasVerifiedGeo && (
              <section aria-labelledby="project-location-heading">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-800">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <h2 id="project-location-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white">
                    Verified Site Geography
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {geoDetails.map((geo, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                        {geo.label}
                      </span>
                      <p className="text-sm font-semibold text-slate-200">{geo.value}</p>
                    </div>
                  ))}
                </div>

                {project.googleMapsUrl && (
                  <div className="mt-4">
                    {project.googleMapsUrl.includes("embed") ? (
                      <div className="aspect-[21/9] w-full bg-slate-900 border border-slate-800 overflow-hidden">
                        <iframe
                          src={project.googleMapsUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`${project.title} Site Map`}
                        />
                      </div>
                    ) : (
                      <a
                        href={project.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-black text-white text-xs font-mono uppercase tracking-wider border border-slate-800 hover:border-amber-500 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span>Open Verified Coordinates in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Project Technical & Execution Q&A (Rendered ONLY if valid faqs exist) */}
            {validFaqs.length > 0 && (
              <section aria-labelledby="project-faq-heading">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-800">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <h2 id="project-faq-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white">
                    Project Technical &amp; Execution Q&amp;A
                  </h2>
                </div>
                <div className="space-y-4">
                  {validFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors"
                    >
                      <h3 className="text-base font-bold text-amber-400 mb-2 font-display">
                        {faq.question}
                      </h3>
                      <p className="text-sm font-light text-slate-300 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* SIDEBAR COLUMN (4 COLS): FACTS LEDGER & INQUIRY CTA */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Executive Facts Ledger */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 sticky top-28 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-800">
                <Building2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-white">
                  Executive Project Ledger
                </h3>
              </div>

              {/* Specifications List (Strictly Omit Null/Empty) */}
              {factsLedger.length > 0 ? (
                <ul className="space-y-5">
                  {factsLedger.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <li key={idx} className="border-b border-slate-800/60 pb-4 last:border-0 last:pb-0">
                        <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                          <Icon className="w-3.5 h-3.5 text-amber-400" />
                          {item.label}
                        </span>
                        <p className="text-sm font-medium text-slate-100 pl-5">
                          {item.value}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 font-mono">
                  Standard architectural ledger verified.
                </p>
              )}

              {/* Physical Status Indicator */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Structural Commissioning
                </span>
                <div
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider ${
                    isOngoing
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isOngoing ? "text-amber-400" : "text-emerald-400"}`} />
                  <span>{isOngoing ? "Active Construction Site" : "Completed & Verified Asset"}</span>
                </div>
              </div>

              {/* Consultation / Quote Action */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                  Planning a commercial development, civil facility, or industrial structure with similar engineering parameters?
                </p>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/10"
                >
                  <span>Inquire About Similar Project</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. RELATED PROJECTS SECTION (Only if published projects exist)
      ───────────────────────────────────────────────────────────── */}
      {relatedProjects.length > 0 && (
        <section aria-labelledby="related-projects-heading" className="border-t border-slate-800/80 bg-slate-900/40 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block mb-2">
                  Portfolio Cross-Reference
                </span>
                <h2 id="related-projects-heading" className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-white">
                  Related {project.category} Projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 hover:text-white transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View Full Portfolio</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((rel) => {
                const relSlug = rel.slug || rel.id;
                const relIsOngoing = rel.status === "active" || rel.status === "ongoing";

                return (
                  <Link
                    key={rel.id}
                    href={`/projects/${relSlug}`}
                    className="group flex flex-col bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 overflow-hidden shadow-lg"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
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
                        <div className="w-full h-full flex items-center justify-center text-slate-700 font-mono text-xs">
                          HiPRO Execution
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-amber-400 border border-amber-500/30">
                          {rel.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-2">
                          <span className={relIsOngoing ? "text-amber-400" : "text-emerald-400"}>
                            ● {relIsOngoing ? "Ongoing" : "Completed"}
                          </span>
                          {rel.location && (
                            <>
                              <span>•</span>
                              <span className="truncate">{rel.location}</span>
                            </>
                          )}
                        </div>

                        <h3 className="text-base font-bold font-display uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                          {rel.title}
                        </h3>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-semibold text-slate-400 group-hover:text-white transition-colors">
                        <span>Review Case Study</span>
                        <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. FINAL ARCHITECTURAL INQUIRY CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-slate-800 bg-black py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(to right, #f59e0b 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 mb-6">
            <Building2 className="w-3.5 h-3.5" />
            Direct Consultation
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display uppercase tracking-tight text-white mb-6">
            Consult With Our Engineering Directors
          </h2>

          <p className="text-base sm:text-lg text-slate-400 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Planning a heavy industrial superstructure, commercial landmark, or residential development? Leverage Hindustan Projects&apos; verified civil engineering expertise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20"
            >
              Initiate Project Consultation
            </Link>
            <Link
              href="/projects"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-widest border border-slate-800 hover:border-slate-700 transition-all"
            >
              Browse All Projects
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
