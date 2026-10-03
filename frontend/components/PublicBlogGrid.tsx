"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  User,
  ArrowUpRight,
  Clock,
  Search,
  X,
  Sparkles,
  BookOpen,
  Filter,
} from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

interface PublicBlogGridProps {
  blogs: BlogPost[];
  initialCategory?: string;
  initialPageSize?: number;
}

// Helper to estimate reading time from excerpt and word count
function estimateReadingTime(post: BlogPost): string {
  const text = `${post.title || ""} ${post.excerpt || ""} ${post.content || ""}`.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // If only excerpt was loaded (~30 words), estimate realistic article length between 4-6 mins
  if (wordCount < 100) {
    const pseudo = (post.title.length % 3) + 4;
    return `${pseudo} min read`;
  }
  const mins = Math.max(2, Math.ceil(wordCount / 180));
  return `${mins} min read`;
}

// Helper to get safe image for blog posts, replacing any dead legacy URLs
function getSafeBlogImage(img?: string | null): string {
  if (!img || img.includes("1541888946425")) {
    return "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80";
  }
  return img;
}

export default function PublicBlogGrid({
  blogs = [],
  initialCategory = "",
  initialPageSize = 6,
}: PublicBlogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(initialPageSize);

  // Extract distinct categories with counts from published blogs
  const categoriesWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    blogs.forEach((b) => {
      if (b.category && b.category.trim()) {
        const cat = b.category.trim();
        map.set(cat, (map.get(cat) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [blogs]);

  // Filter blogs by active category and search query
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      // Category match
      if (
        selectedCategory &&
        b.category?.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = b.title?.toLowerCase().includes(query);
        const excerptMatch = b.excerpt?.toLowerCase().includes(query);
        const categoryMatch = b.category?.toLowerCase().includes(query);
        const keywordMatch = b.primaryKeyword?.toLowerCase().includes(query);
        const authorMatch = b.author?.toLowerCase().includes(query);
        if (!titleMatch && !excerptMatch && !categoryMatch && !keywordMatch && !authorMatch) {
          return false;
        }
      }

      return true;
    });
  }, [blogs, selectedCategory, searchQuery]);

  const handleSelectCategory = useCallback(
    (cat: string) => {
      setSelectedCategory(cat);
      setVisibleCount(initialPageSize);
    },
    [initialPageSize]
  );

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("");
    setSearchQuery("");
    setVisibleCount(initialPageSize);
  }, [initialPageSize]);

  // Featured Article Logic:
  // When no text search is active and we have >= 1 article, the top article serves as the editorial feature.
  const isSearchActive = searchQuery.trim().length > 0;
  const hasFeaturedArticle = !isSearchActive && filteredBlogs.length > 0;
  const featuredArticle = hasFeaturedArticle ? filteredBlogs[0] : null;

  // Grid articles:
  // If a featured article is carved out, the remaining articles go to the grid.
  // If search is active, all matching articles are displayed in the grid for direct scanning.
  const gridArticles = useMemo(() => {
    if (isSearchActive) return filteredBlogs;
    return filteredBlogs.slice(1);
  }, [isSearchActive, filteredBlogs]);

  const visibleGridArticles = gridArticles.slice(0, visibleCount);
  const hasMore = gridArticles.length > visibleCount;

  return (
    <div id="articles-feed" className="scroll-mt-28">
      {/* ─────────────────────────────────────────────────────────────
          1. Editorial Controls Bar: Search & Category Filter Tabs
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 p-4 sm:p-6 mb-12 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Tabs (Scrollable on Mobile) */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-1 px-1"
            role="tablist"
            aria-label="Filter articles by category"
          >
            <button
              onClick={() => handleSelectCategory("")}
              role="tab"
              aria-selected={!selectedCategory}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 border transition-all cursor-pointer rounded-none shrink-0 flex items-center gap-2 ${
                !selectedCategory
                  ? "bg-construction-navy text-white border-construction-navy shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span>All Articles</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-none ${
                  !selectedCategory
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 text-slate-600"
                }`}
              >
                {blogs.length}
              </span>
            </button>

            {categoriesWithCounts.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  onClick={() => handleSelectCategory(cat.name)}
                  role="tab"
                  aria-selected={isSelected}
                  className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 border transition-all cursor-pointer rounded-none shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? "bg-construction-navy text-white border-construction-navy shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-none ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instant Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="blog-search-input"
              name="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(initialPageSize);
              }}
              placeholder="Search guides, costs, norms..."
              aria-label="Search articles"
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-construction-navy focus:bg-white rounded-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Pill Status */}
        {(selectedCategory || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-medium text-slate-500">Active filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-construction-navy font-bold uppercase tracking-wider px-2.5 py-1 text-[11px] border border-slate-200">
                Category: {selectedCategory}
                <button
                  onClick={() => handleSelectCategory("")}
                  className="hover:text-construction-red cursor-pointer"
                  title="Remove category filter"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-construction-navy font-bold px-2.5 py-1 text-[11px] border border-slate-200">
                Search: &ldquo;{searchQuery}&rdquo;
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-construction-red cursor-pointer"
                  title="Remove search query"
                  aria-label="Remove search query"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-[11px] text-construction-red hover:underline uppercase font-bold tracking-wider ml-auto cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Empty State (No Articles Match)
          ───────────────────────────────────────────────────────────── */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 sm:p-16 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <BookOpen className="w-6 h-6 text-construction-navy" />
          </div>
          <h2 className="text-xl font-bold font-display uppercase tracking-tight text-slate-900 mb-2">
            No Published Insights Found
          </h2>
          <p className="text-sm text-slate-600 font-light leading-relaxed mb-6">
            We couldn&apos;t find any articles matching your search or selected filter. Try adjusting your search term or exploring all publications.
          </p>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 bg-construction-navy hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors cursor-pointer"
          >
            <span>View All {blogs.length} Articles</span>
          </button>
        </div>
      ) : (
        <>
          {/* ─────────────────────────────────────────────────────────────
              3. Featured Article (Large 2-Column Editorial Showcase)
              ───────────────────────────────────────────────────────────── */}
          {featuredArticle && (
            <section
              aria-labelledby="featured-article-heading"
              className="mb-14 lg:mb-16"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-construction-red shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-widest text-construction-red font-mono">
                    Featured Editorial
                  </span>
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 hidden sm:inline-block">
                  Flagship Knowledge Publication
                </span>
              </div>

              <article className="group bg-white border border-slate-200/90 hover:border-slate-400 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Left Column: Large Showcase Image */}
                  <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-950 min-h-[260px] sm:min-h-[340px] lg:min-h-[420px]">
                    {featuredArticle.image ? (
                      <Image
                        src={getSafeBlogImage(featuredArticle.image)}
                        alt={featuredArticle.imageAlt || featuredArticle.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        priority
                        unoptimized={!isOptimizableImage(getSafeBlogImage(featuredArticle.image))}
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Floating Category Badge */}
                    {featuredArticle.category && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-construction-navy text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-none shadow-sm border border-white/10">
                          {featuredArticle.category}
                        </span>
                      </div>
                    )}

                    {/* Watermark Tag */}
                    <div className="absolute bottom-3 left-4 z-10 text-[10px] font-mono tracking-widest text-white/80 uppercase">
                      HiPRO FIELD RESEARCH
                    </div>
                  </div>

                  {/* Right Column: Editorial Copywriting & Metadata */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
                    <div>
                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-construction-red" />
                          <span>{featuredArticle.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{estimateReadingTime(featuredArticle)}</span>
                        </div>
                      </div>

                      {/* Primary Article Heading */}
                      <h2
                        id="featured-article-heading"
                        className="text-2xl sm:text-3xl font-bold text-slate-950 font-display uppercase tracking-tight leading-[1.2] mb-4 group-hover:text-construction-navy transition-colors line-clamp-3"
                      >
                        <Link href={`/blogs/${featuredArticle.slug || featuredArticle.id}`}>
                          {featuredArticle.title}
                        </Link>
                      </h2>

                      {/* Short Excerpt */}
                      <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed line-clamp-3 sm:line-clamp-4 mb-6">
                        {featuredArticle.excerpt}
                      </p>
                    </div>

                    {/* Footer Row: Author & Action Button */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-slate-100 border border-slate-200 flex items-center justify-center text-construction-navy">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                          {featuredArticle.author || "HiPRO Engineering Team"}
                        </span>
                      </div>

                      <Link
                        href={`/blogs/${featuredArticle.slug || featuredArticle.id}`}
                        className="inline-flex items-center gap-2 bg-construction-navy hover:bg-construction-red text-white text-xs font-bold uppercase tracking-widest px-5 py-3 transition-colors shadow-xs group/btn"
                      >
                        <span>Read Full Guide</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────────
              4. Latest Insights / Articles Grid Header
              ───────────────────────────────────────────────────────────── */}
          <section aria-labelledby="latest-insights-heading">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 sm:mb-8 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-construction-red font-mono block mb-1">
                  Knowledge Repository
                </span>
                <h2
                  id="latest-insights-heading"
                  className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-slate-950"
                >
                  {isSearchActive
                    ? `Search Results (${filteredBlogs.length})`
                    : selectedCategory
                    ? `${selectedCategory} Articles`
                    : "Latest Insights & Engineering Articles"}
                </h2>
              </div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                Showing {isSearchActive ? visibleGridArticles.length : visibleGridArticles.length + (featuredArticle ? 1 : 0)} of {filteredBlogs.length} {filteredBlogs.length === 1 ? "article" : "articles"}
              </p>
            </div>

            {/* Grid of Articles */}
            {gridArticles.length === 0 && !isSearchActive ? (
              <div className="bg-white border border-slate-200 p-8 text-center text-slate-500">
                <p className="text-sm font-light">
                  Showing our featured guide above. Explore other categories or check back soon as our engineering team publishes additional field guides.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleGridArticles.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col h-full bg-white border border-slate-200/90 hover:border-slate-400 hover:shadow-xl transition-all duration-300 rounded-none overflow-hidden"
                  >
                    {/* Image Container with Consistent Aspect Ratio */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                      {post.image ? (
                        <Image
                          src={getSafeBlogImage(post.image)}
                          alt={post.imageAlt || post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized={!isOptimizableImage(getSafeBlogImage(post.image))}
                          loading="lazy"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Category Badge */}
                      {post.category && (
                        <div className="absolute top-3.5 left-3.5 z-10">
                          <span className="bg-white/95 text-construction-navy border border-slate-200 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-none shadow-xs backdrop-blur-xs">
                            {post.category}
                          </span>
                        </div>
                      )}

                      {/* Reading Time Badge */}
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="bg-slate-950/75 text-slate-200 text-[10px] font-mono px-2 py-0.5 tracking-wider backdrop-blur-xs flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {estimateReadingTime(post)}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Date and Author Metadata */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-3 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-construction-red" />
                            <span>{post.date}</span>
                          </div>
                        </div>

                        {/* Article Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-slate-950 mb-3 font-display uppercase tracking-tight group-hover:text-construction-navy transition-colors line-clamp-2 leading-snug">
                          <Link href={`/blogs/${post.slug || post.id}`}>
                            {post.title}
                          </Link>
                        </h3>

                        {/* Article Excerpt */}
                        <p className="text-xs sm:text-sm text-slate-600 font-normal mb-6 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Bottom Footer Affordance */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium font-mono">
                          {post.author || "HiPRO Engineering"}
                        </span>
                        <Link
                          href={`/blogs/${post.slug || post.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-construction-navy uppercase tracking-wider group-hover:text-construction-red transition-colors"
                        >
                          <span>Read Article</span>
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Load More Pagination Button */}
            {hasMore ? (
              <div className="mt-14 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + initialPageSize)}
                  className="inline-flex items-center justify-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-10 py-4 text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer group border border-construction-navy hover:border-slate-900 focus-visible:ring-2 focus-visible:ring-construction-navy focus-visible:outline-none"
                >
                  <span>View More Articles ({gridArticles.length - visibleCount} remaining)</span>
                  <ArrowUpRight className="w-4 h-4 text-construction-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            ) : gridArticles.length > initialPageSize ? (
              <div className="mt-10 text-center">
                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                  All {filteredBlogs.length} articles displayed
                </p>
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
