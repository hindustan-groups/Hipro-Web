import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { findAll } from "@/lib/db";
import type { BlogPost, Settings, BlogsHeroContent } from "@/lib/types";
import { resolveCTA, resolveCTAHref } from "@/lib/cta";
import BlogsHero from "@/components/BlogsHero";
import PublicBlogGrid from "@/components/PublicBlogGrid";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Construction Blog & Industry Insights",
  description:
    "Read the latest news, tips, and insights on construction, architecture, and infrastructure development in India from Hindustan Projects.",
  alternates: {
    canonical: "https://www.hindustanprojects.in/blogs",
  },
  openGraph: {
    title: "Construction Blog & Industry Insights | Hindustan Projects",
    description:
      "Read the latest news, tips, and insights on construction, architecture, and infrastructure development in India from Hindustan Projects.",
    url: "https://www.hindustanprojects.in/blogs",
    siteName: "Hindustan Projects",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://www.hindustanprojects.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hindustan Projects - Engineering & Construction Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Construction Blog & Industry Insights | Hindustan Projects",
    description:
      "Read the latest news, tips, and insights on construction, architecture, and infrastructure development in India from Hindustan Projects.",
    images: ["https://www.hindustanprojects.in/og-image.jpg"],
  },
};

export default async function BlogsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const selectedCategory = searchParams?.category;

  const [allBlogs, allSettings] = await Promise.all([
    findAll<BlogPost>("blogs"),
    findAll<Settings>("settings"),
  ]);
  const settings = allSettings[0] || {};
  const primaryCta = resolveCTA(settings, "blogs_cta_primary");
  const secondaryCta = resolveCTA(settings, "blogs_cta_secondary");

  // Parse Blogs Hero CMS configuration from settings.pageContent
  let heroConfig: BlogsHeroContent = {};
  try {
    if (settings.pageContent) {
      const pc =
        typeof settings.pageContent === "string"
          ? JSON.parse(settings.pageContent)
          : settings.pageContent;
      if (pc.blogsHero && typeof pc.blogsHero === "object") {
        heroConfig = pc.blogsHero;
      }
    }
  } catch {
    heroConfig = {};
  }

  const now = new Date();
  const publishedBlogs = (allBlogs || [])
    .filter((b) => {
      if (!b || b.active === false) return false;
      const status = (b.status || "published").toLowerCase();
      if (status !== "published") return false;
      if (b.publishDate) {
        const pd = new Date(b.publishDate);
        if (!isNaN(pd.getTime()) && pd > now) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

  // SEO & AEO Structured Data: BreadcrumbList + CollectionPage / Blog
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
        name: "Blogs & Insights",
        item: "https://www.hindustanprojects.in/blogs",
      },
    ],
  };

  const blogCollectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://www.hindustanprojects.in/blogs#blog",
    name: "Hindustan Projects Construction Knowledge & Insights",
    description:
      "Civil engineering guidance, construction cost planning frameworks, architectural guidelines, and site execution insights for Rajasthan.",
    publisher: {
      "@type": "Organization",
      name: "Hindustan Projects",
      url: "https://www.hindustanprojects.in",
      logo: "https://www.hindustanprojects.in/logo.jpg",
    },
    blogPost: publishedBlogs.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      url: `https://www.hindustanprojects.in/blogs/${post.slug || post.id}`,
      datePublished: post.createdAt,
      dateModified: post.updatedAt || post.createdAt,
      author: {
        "@type": "Person",
        name: post.author || "HiPRO Engineering Team",
      },
      image: post.image,
    })),
  };

  return (
    <>
      {/* Structured Schema for Crawlers & LLM Agents */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionJsonLd) }}
      />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — HERO: Premium Editorial Knowledge Platform
          ───────────────────────────────────────────────────────────── */}
      <BlogsHero
        eyebrow={heroConfig.eyebrow}
        title={heroConfig.title}
        description={heroConfig.description}
        image={heroConfig.image}
        imageAlt={heroConfig.imageAlt}
        ctaText={heroConfig.ctaText}
        ctaLink={heroConfig.ctaLink}
        enabled={heroConfig.enabled !== false}
        featuredBlog={publishedBlogs[0] || null}
        totalBlogs={publishedBlogs.length}
      />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — EDITORIAL LISTING & KNOWLEDGE GRID
          ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 md:py-20 bg-slate-50/70 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <PublicBlogGrid
            blogs={publishedBlogs}
            initialCategory={selectedCategory || ""}
            initialPageSize={6}
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 — BOTTOM CONVERSION CTA STRIP
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs font-bold text-construction-red uppercase tracking-widest block mb-3 font-mono">
            Project Planning &amp; Estimation
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-construction-navy mb-5 font-display uppercase tracking-tight">
            Planning a Construction Project in Rajasthan?
          </h2>
          <p className="text-slate-600 mb-8 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            From turnkey civil construction and architectural planning to site surveying and cost estimation, our team delivers disciplined engineering excellence across Bhilwara and Rajasthan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {secondaryCta && secondaryCta.enabled !== false && (
              <Link
                href={resolveCTAHref(secondaryCta)}
                target={secondaryCta.openNewTab ? "_blank" : undefined}
                rel={secondaryCta.openNewTab ? "noopener noreferrer" : undefined}
                className="w-full sm:w-auto bg-construction-red hover:bg-red-700 text-white font-bold px-8 py-4 text-xs uppercase tracking-wider transition-all shadow-md text-center"
              >
                {secondaryCta.label}
              </Link>
            )}
            {primaryCta && primaryCta.enabled !== false && (
              <Link
                href={resolveCTAHref(primaryCta)}
                target={primaryCta.openNewTab ? "_blank" : undefined}
                rel={primaryCta.openNewTab ? "noopener noreferrer" : undefined}
                className="w-full sm:w-auto bg-construction-navy hover:bg-blue-900 text-white font-bold px-8 py-4 text-xs uppercase tracking-wider transition-all shadow-md text-center"
              >
                {primaryCta.label}
              </Link>
            )}
            <a
              href="tel:7597000601"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-8 py-4 text-xs uppercase tracking-wider transition-all shadow-xs text-center"
            >
              <Phone className="w-3.5 h-3.5 text-construction-navy" />
              <span>Call +91 75970 00601</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
