import type { Metadata } from "next";
import Link from "next/link";
import PublicProjectGrid from "@/components/PublicProjectGrid";
import ProjectsHero from "@/components/ProjectsHero";
import { findAll } from "@/lib/db";
import type { Project, Settings, ProjectsHeroContent } from "@/lib/types";
import { resolveCTA, resolveCTAHref } from "@/lib/cta";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Project Portfolio — Turnkey Engineering",
  description:
    "Explore verified industrial, commercial, institutional, and turnkey construction projects delivered by Hindustan Projects (HiPRO) across Rajasthan and India.",
  alternates: {
    canonical: "https://www.hindustanprojects.in/projects",
  },
  openGraph: {
    title: "Project Portfolio — Turnkey Engineering | Hindustan Projects (HiPRO)",
    description:
      "Explore verified industrial, commercial, institutional, and turnkey construction projects delivered by Hindustan Projects (HiPRO) across Rajasthan and India.",
    url: "https://www.hindustanprojects.in/projects",
    siteName: "Hindustan Projects",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.hindustanprojects.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hindustan Projects - Civil Engineering & Industrial Infrastructure Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Portfolio — Turnkey Engineering | Hindustan Projects (HiPRO)",
    description:
      "Explore verified industrial, commercial, institutional, and turnkey construction projects delivered by Hindustan Projects (HiPRO) across Rajasthan and India.",
    images: ["https://www.hindustanprojects.in/og-image.jpg"],
  },
};

export default async function ProjectsPage() {
  // Fetch raw projects, settings, and authoritative site stats concurrently
  const [allProjects, settingsData, rawStats] = await Promise.all([
    findAll<Project>("projects"),
    findAll<Settings>("settings"),
    findAll<any>("stats"),
  ]);
  const settings = settingsData[0] || {};
  const ctaHeroPrimary = resolveCTA(settings, "projects_hero_primary");
  const ctaHeroSecondary = resolveCTA(settings, "projects_hero_secondary");
  const ctaBottomPrimary = resolveCTA(settings, "projects_bottom_primary");

  // Parse Projects Hero configuration from authoritative Settings.pageContent
  let heroConfig: ProjectsHeroContent = {};
  try {
    if (settings.pageContent) {
      const pc =
        typeof settings.pageContent === "string"
          ? JSON.parse(settings.pageContent)
          : settings.pageContent;
      if (pc.projectsHero && typeof pc.projectsHero === "object") {
        heroConfig = pc.projectsHero;
      }
    }
  } catch {
    heroConfig = {};
  }

  // Sort authoritative site stats
  const sortedStats = Array.isArray(rawStats)
    ? [...rawStats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  // Strict Public Isolation Rule (Defense-in-depth):
  // Filter out any draft or operationally archived records before passing to public grid
  const publicProjects = (allProjects || []).filter((p) => {
    return p && p.publishStatus === "published" && p.status !== "archived";
  });

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.hindustanprojects.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: "https://www.hindustanprojects.in/projects",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO: Architectural Engineering Project Portfolio
          ───────────────────────────────────────────────────────────── */}
      <ProjectsHero
        eyebrow={heroConfig.eyebrow}
        title={heroConfig.title}
        description={heroConfig.description}
        image={heroConfig.image}
        imageAlt={heroConfig.imageAlt}
        ctaPrimary={ctaHeroPrimary}
        ctaSecondary={ctaHeroSecondary}
        stats={sortedStats}
        enabled={heroConfig.enabled !== false}
      />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — DYNAMIC FILTERABLE & SORTABLE PORTFOLIO GRID
          ───────────────────────────────────────────────────────────── */}
      <div id="projects-list">
        <PublicProjectGrid projects={publicProjects} />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — CALL TO ACTION: Build With HiPRO
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-50 border border-slate-200/90 px-8 py-16 text-center shadow-sm">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 font-display uppercase tracking-tight">
              Ready To Engineer <span className="font-serif italic font-normal text-construction-red normal-case">Your Next Landmark?</span>
            </h2>
            <p className="text-slate-600 font-light mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Partner with Hindustan Projects for end-to-end industrial master planning, heavy PEB steel fabrication, and coordinated turnkey execution.
            </p>
            {ctaBottomPrimary?.enabled !== false && (
              <Link
                href={ctaBottomPrimary ? resolveCTAHref(ctaBottomPrimary) : "/contact"}
                target={ctaBottomPrimary?.openNewTab ? "_blank" : undefined}
                rel={ctaBottomPrimary?.openNewTab ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-3 bg-construction-navy hover:bg-slate-900 text-white font-bold px-8 py-4 text-xs sm:text-sm transition-all uppercase tracking-wider shadow-sm"
              >
                {ctaBottomPrimary?.label ?? "Start Project Discussion"}
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
