import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Briefcase,
  Building2,
  CheckSquare,
  Compass,
  CheckCircle2,
  Clock,
} from "lucide-react";
import PublicProjectGrid from "@/components/PublicProjectGrid";
import { findAll } from "@/lib/db";
import type { Project } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Project Portfolio | HiPRO Construction & Turnkey Engineering",
  description:
    "Explore verified industrial, commercial, institutional, and turnkey construction projects delivered by Hindustan Projects (HiPRO) across Rajasthan and India.",
  alternates: {
    canonical: "https://www.hindustanprojects.in/projects",
  },
  openGraph: {
    title: "Project Portfolio | HiPRO Construction & Turnkey Engineering",
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
    title: "Project Portfolio | HiPRO Construction & Turnkey Engineering",
    description:
      "Explore verified industrial, commercial, institutional, and turnkey construction projects delivered by Hindustan Projects (HiPRO) across Rajasthan and India.",
    images: ["https://www.hindustanprojects.in/og-image.jpg"],
  },
};

export default async function ProjectsPage() {
  // Fetch raw projects from database/API
  const allProjects = await findAll<Project>("projects");

  // Strict Public Isolation Rule (Defense-in-depth):
  // Filter out any draft or operationally archived records before passing to public grid
  const publicProjects = (allProjects || []).filter((p) => {
    return p && p.publishStatus === "published" && p.status !== "archived";
  });

  const totalPublished = publicProjects.length;
  const completedCount = publicProjects.filter((p) => p.status === "completed").length;
  const ongoingCount = publicProjects.filter(
    (p) => p.status === "ongoing" || p.status === "active"
  ).length;

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
          SECTION 1 — HERO: Authoritative Engineering Project Portfolio
          ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-28 sm:pt-32 md:pt-36 pb-12 md:pb-16 px-4 border-b border-slate-200/80 overflow-hidden">
        {/* Subtle Architectural Drafting Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0F2C59 1px, transparent 1px), linear-gradient(to bottom, #0F2C59 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        {/* Ambient Lighting Accents */}
        <div
          className="absolute -top-24 right-0 w-96 h-96 bg-slate-100/70 rounded-full blur-3xl pointer-events-none -z-0"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 left-0 w-80 h-80 bg-red-50/40 rounded-full blur-3xl pointer-events-none -z-0"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Eyebrow Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-construction-navy mb-4 sm:mb-5 shadow-xs">
            <Briefcase className="w-3.5 h-3.5 text-construction-red" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              Project Portfolio · Engineering &amp; Construction
            </span>
          </div>

          {/* Primary H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 font-display uppercase tracking-tight leading-[1.15]">
            Projects That Turn{" "}
            <span className="font-serif italic font-normal text-construction-red normal-case tracking-normal">
              Engineering Into Execution
            </span>
          </h1>

          {/* Supporting Lead Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto font-light leading-relaxed mb-6 sm:mb-8">
            Explore Hindustan Projects&apos; verified industrial, commercial, and turnkey construction portfolio — engineered with precision from technical planning through coordinated site execution.
          </p>

          {/* Verified Statistics Bar (Only rendered if published projects exist — zero fabricated numbers) */}
          {totalPublished > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90 border border-slate-200/90 bg-slate-50/80 max-w-3xl mx-auto mb-6 sm:mb-8 text-center shadow-xs">
              <div className="p-4 sm:p-5">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-display block">
                  {totalPublished}
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block mt-1">
                  Published Case Studies
                </span>
              </div>

              <div className="p-4 sm:p-5">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-display block">
                  {completedCount}
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block mt-1">
                  Commissioned Projects
                </span>
              </div>

              <div className="p-4 sm:p-5">
                <span className="text-2xl sm:text-3xl font-bold text-amber-700 font-display block">
                  {ongoingCount}
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block mt-1">
                  Active Construction Sites
                </span>
              </div>
            </div>
          ) : (
            /* Architectural Ledger Anchors when database is empty (Zero fake statistics) */
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/90 border border-slate-200/90 bg-slate-50/70 max-w-4xl mx-auto mb-6 sm:mb-8 text-left shadow-xs">
              <div className="p-4 sm:p-5 group hover:bg-white transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">
                    01 / PLANNING
                  </span>
                  <Compass className="w-3.5 h-3.5 text-construction-red" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-display mb-1">
                  Engineering &amp; Planning
                </h2>
                <p className="text-[11px] sm:text-[12px] text-slate-600 font-normal leading-snug">
                  Technical feasibility and structural design support
                </p>
              </div>

              <div className="p-4 sm:p-5 group hover:bg-white transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">
                    02 / EXECUTION
                  </span>
                  <Building2 className="w-3.5 h-3.5 text-construction-red" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-display mb-1">
                  Construction &amp; Execution
                </h2>
                <p className="text-[11px] sm:text-[12px] text-slate-600 font-normal leading-snug">
                  Coordinated site engineering and turnkey delivery
                </p>
              </div>

              <div className="p-4 sm:p-5 group hover:bg-white transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">
                    03 / MANAGEMENT
                  </span>
                  <CheckSquare className="w-3.5 h-3.5 text-construction-red" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-display mb-1">
                  Quality &amp; Delivery
                </h2>
                <p className="text-[11px] sm:text-[12px] text-slate-600 font-normal leading-snug">
                  Precision safety protocols and milestone handover
                </p>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-construction-navy hover:bg-slate-900 text-white font-bold px-5 py-3 rounded-none text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm group"
            >
              <span>Discuss Your Project</span>
              <ArrowRight className="w-4 h-4 text-construction-red group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#projects-list"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3 rounded-none border border-slate-300 text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs"
            >
              <span>Explore Portfolio</span>
              <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </section>

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
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-construction-navy hover:bg-slate-900 text-white font-bold px-8 py-4 text-xs sm:text-sm transition-all uppercase tracking-wider shadow-sm"
            >
              Start Project Discussion
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
