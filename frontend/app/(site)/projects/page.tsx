import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
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
      <section className="relative bg-white pt-28 sm:pt-32 md:pt-36 pb-10 sm:pb-12 md:pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 overflow-hidden">
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

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Eyebrow Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 text-construction-navy mb-4 sm:mb-5 shadow-xs">
            <span className="w-1.5 h-1.5 bg-construction-red" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-widest font-mono">
              OUR PROJECTS
            </span>
          </div>

          {/* Primary Semantic H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-950 mb-4 font-display uppercase tracking-tight leading-[1.15]">
            ENGINEERING PROJECTS THAT DELIVER
          </h1>

          {/* HiPRO Two-Tone Architectural Accent Bar */}
          <div className="flex w-32 h-1 mx-auto mb-5" aria-hidden="true">
            <div className="w-1/3 h-full bg-yellow-500" />
            <div className="w-2/3 h-full bg-construction-navy" />
          </div>

          {/* Supporting Lead Description (Concise & Verified, Zero Invented Claims) */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed mb-6 sm:mb-8">
            Explore verified industrial, commercial, and turnkey construction projects engineered with precision and delivered across Rajasthan and India.
          </p>

          {/* Action Navigation CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xs sm:max-w-none mx-auto">
            <a
              href="#projects-list"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-construction-navy hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-none text-xs uppercase tracking-widest transition-all shadow-sm group"
            >
              <span>Explore Portfolio</span>
              <ArrowDown className="w-3.5 h-3.5 text-construction-red group-hover:translate-y-0.5 transition-transform" />
            </a>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3 rounded-none border border-slate-300 text-xs uppercase tracking-widest transition-all shadow-xs group"
            >
              <span>Discuss Your Project</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
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
