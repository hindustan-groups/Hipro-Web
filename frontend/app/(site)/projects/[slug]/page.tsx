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
  if (rawUrl.includes("hipro-web-1.onrender.com")) {
    rawUrl = "https://hipro-backend-749v.onrender.com";
  }
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
    <article className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-amber-500 selection:text-slate-950">
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
      <header className="relative w-full pt-28 pb-16 md:pt-36 md:pb-24 bg-white border-b border-slate-200/80 overflow-hidden">
        {/* Architectural Drafting Blueprint Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0F2C59 1px, transparent 1px), linear-gradient(to bottom, #0F2C59 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
          aria-hidden="true"
        />

        {/* Ambient Subtle Accent Glows */}
        <div
          className="absolute -top-20 right-0 w-96 h-96 bg-slate-100/80 rounded-full blur-3xl pointer-events-none -z-0"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 left-0 w-80 h-80 bg-red-50/40 rounded-full blur-3xl pointer-events-none -z-0"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs Navigation */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-500 mb-8 flex-wrap">
            <Link href="/" className="hover:text-construction-navy transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/projects" className="hover:text-construction-navy transition-colors">
              Projects
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-construction-navy truncate max-w-[240px] sm:max-w-md font-bold">
              {project.title}
            </span>
          </nav>

          {/* Badges & Back Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2.5">
              {project.category && project.category.trim() !== "" && (
                <span className="px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest bg-slate-100 text-construction-navy border border-slate-200">
                  {project.category}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider ${
                  isOngoing
                    ? "bg-amber-50 text-amber-800 border border-amber-300"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-300"
                }`}
              >
                {isOngoing ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Ongoing Site</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed &amp; Handed Over</span>
                  </>
                )}
              </span>
            </div>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-600 hover:text-construction-navy transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-construction-red" />
              <span>Back to Portfolio</span>
            </Link>
          </div>

          {/* Primary Semantic H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display uppercase tracking-tight text-slate-950 max-w-5xl leading-[1.12] mb-6 break-words">
            {project.title}
          </h1>

          {/* Hero Quick Location/Date Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium">
            {project.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-construction-red" />
                <span className="text-slate-800 font-semibold">{project.location}</span>
              </span>
            )}
            {(project.completionDate || project.date) && (
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4 text-construction-navy" />
                <span className="text-slate-800 font-semibold">{project.completionDate || project.date}</span>
              </span>
            )}
          </div>
        </div>

        {/* Primary Cover Image Hero Showcase */}
        {project.image && (
          <div className="mt-10 sm:mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <figure className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[560px] overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
              <Image
                src={project.image}
                alt={project.imageAlt || `${project.title} - Architectural Engineering Execution Perspective`}
                fill
                priority
                sizes="100vw"
                unoptimized={!isOptimizableImage(project.image)}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
              {project.imageCaption && (
                <figcaption className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-xs text-slate-800 font-mono tracking-wide bg-white/95 backdrop-blur-sm p-3 border-l-4 border-construction-navy max-w-2xl shadow-sm">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* MAIN NARRATIVE COLUMN (8 COLS) */}
          <div className="lg:col-span-8 space-y-12 sm:space-y-16">
            
            {/* Executive Summary Brief (if exists) */}
            {project.shortDescription && (
              <section aria-labelledby="executive-summary-heading" className="p-6 md:p-8 bg-blue-50/60 border-l-4 border-construction-navy border-y border-r border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-construction-navy mb-3">
                  <ShieldCheck className="w-4 h-4 text-construction-navy" />
                  <span id="executive-summary-heading">Executive Brief</span>
                </div>
                <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
                  {project.shortDescription}
                </p>
              </section>
            )}

            {/* Case Study Narrative */}
            {project.description && (
              <section aria-labelledby="project-narrative-heading">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
                  <FileText className="w-5 h-5 text-construction-red" />
                  <h2 id="project-narrative-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
                    Project Execution &amp; Engineering Narrative
                  </h2>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed font-normal whitespace-pre-line space-y-4">
                  {project.description}
                </div>
              </section>
            )}

            {/* Project Highlights (Rendered ONLY if non-empty) */}
            {highlightsList.length > 0 && (
              <section aria-labelledby="project-highlights-heading">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
                  <Sparkles className="w-5 h-5 text-construction-navy" />
                  <h2 id="project-highlights-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
                    Key Execution Highlights
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {highlightsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-colors"
                    >
                      {item.label && (
                        <span className="text-[11px] font-mono uppercase tracking-wider text-construction-navy font-bold block mb-1">
                          {item.label}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-slate-900">
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
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
                  <Layers className="w-5 h-5 text-construction-red" />
                  <h2 id="project-services-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
                    Engineering Disciplines &amp; Services Deployed
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {servicesList.map((svc, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono uppercase tracking-wider hover:border-slate-400 transition-colors shadow-sm"
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
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
                  <Play className="w-5 h-5 text-construction-navy" />
                  <h2 id="project-video-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
                    {project.videoTitle || "Execution Video Showcase"}
                  </h2>
                </div>

                {project.videoDescription && (
                  <p className="text-sm text-slate-600 font-normal mb-4">
                    {project.videoDescription}
                  </p>
                )}

                <div className="relative aspect-video w-full bg-black border border-slate-200 overflow-hidden shadow-md">
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
                <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-construction-navy" />
                    <h2 id="project-gallery-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
                      Field Execution &amp; Architectural Gallery
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-semibold">
                    {galleryItems.length} {galleryItems.length === 1 ? "Record" : "Records"}
                  </span>
                </div>

                <ProjectGalleryLightbox images={galleryItems} projectTitle={project.title} />
              </section>
            )}

            {/* Verified Location & Map Section (Rendered ONLY if verified data exists) */}
            {hasVerifiedGeo && (
              <section aria-labelledby="project-location-heading">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
                  <Compass className="w-5 h-5 text-construction-red" />
                  <h2 id="project-location-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
                    Verified Site Geography
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {geoDetails.map((geo, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">
                        {geo.label}
                      </span>
                      <p className="text-sm font-bold text-slate-900">{geo.value}</p>
                    </div>
                  ))}
                </div>

                {project.googleMapsUrl && (
                  <div className="mt-4">
                    {project.googleMapsUrl.includes("embed") ? (
                      <div className="aspect-[21/9] w-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-construction-navy hover:bg-slate-800 text-white text-xs font-mono uppercase tracking-wider border border-slate-300 transition-colors shadow-sm"
                      >
                        <MapPin className="w-4 h-4 text-white" />
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
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200">
                  <HelpCircle className="w-5 h-5 text-construction-navy" />
                  <h2 id="project-faq-heading" className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
                    Project Technical &amp; Execution Q&amp;A
                  </h2>
                </div>
                <div className="space-y-4">
                  {validFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-colors"
                    >
                      <h3 className="text-base font-bold text-construction-navy mb-2 font-display">
                        {faq.question}
                      </h3>
                      <p className="text-sm font-normal text-slate-700 leading-relaxed whitespace-pre-line">
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
            <div className="bg-white border border-slate-200 p-6 sm:p-8 sticky top-28 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-200">
                <Building2 className="w-4 h-4 text-construction-navy" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-900">
                  Executive Project Ledger
                </h3>
              </div>

              {/* Specifications List (Strictly Omit Null/Empty) */}
              {factsLedger.length > 0 ? (
                <ul className="space-y-5">
                  {factsLedger.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <li key={idx} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                          <Icon className="w-3.5 h-3.5 text-construction-navy" />
                          {item.label}
                        </span>
                        <p className="text-sm font-bold text-slate-900 pl-5">
                          {item.value}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 font-mono">
                  Standard architectural ledger verified.
                </p>
              )}

              {/* Physical Status Indicator */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2 font-semibold">
                  Structural Commissioning
                </span>
                <div
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider border ${
                    isOngoing
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-emerald-50 text-emerald-800 border-emerald-300"
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isOngoing ? "text-amber-600" : "text-emerald-600"}`} />
                  <span>{isOngoing ? "Active Construction Site" : "Completed & Verified Asset"}</span>
                </div>
              </div>

              {/* Consultation / Quote Action */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-600 font-normal leading-relaxed mb-4">
                  Planning a commercial development, civil facility, or industrial structure with similar engineering parameters?
                </p>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-construction-navy hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
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
        <section aria-labelledby="related-projects-heading" className="border-t border-slate-200 bg-slate-50/70 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-construction-navy block mb-2">
                  Portfolio Cross-Reference
                </span>
                <h2 id="related-projects-heading" className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-slate-900">
                  Related {project.category} Projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="text-xs font-mono font-bold uppercase tracking-wider text-construction-navy hover:text-construction-red transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
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
                    className="group flex flex-col bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
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
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                          HiPRO Execution
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-white/95 text-construction-navy border border-slate-200 shadow-sm">
                          {rel.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mb-2">
                          <span className={relIsOngoing ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                            ● {relIsOngoing ? "Ongoing" : "Completed"}
                          </span>
                          {rel.location && (
                            <>
                              <span>•</span>
                              <span className="truncate">{rel.location}</span>
                            </>
                          )}
                        </div>

                        <h3 className="text-base font-bold font-display uppercase tracking-tight text-slate-900 group-hover:text-construction-navy transition-colors line-clamp-2">
                          {rel.title}
                        </h3>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-construction-navy group-hover:text-construction-red transition-colors">
                        <span>Review Case Study</span>
                        <ChevronRight className="w-4 h-4 text-construction-navy group-hover:translate-x-1 transition-transform" />
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
      <section className="relative overflow-hidden border-t border-slate-200 bg-white py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#0F2C59 1px, transparent 1px), linear-gradient(to right, #0F2C59 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-construction-navy bg-slate-100 border border-slate-200 mb-6 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-construction-navy" />
            Direct Consultation
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display uppercase tracking-tight text-slate-950 mb-6">
            Consult With Our Engineering Directors
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
            Planning a heavy industrial superstructure, commercial landmark, or residential development? Leverage Hindustan Projects&apos; verified civil engineering expertise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-construction-red hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
            >
              Initiate Project Consultation
            </Link>
            <Link
              href="/projects"
              className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono font-bold text-xs uppercase tracking-widest border border-slate-300 transition-all"
            >
              Browse All Projects
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
