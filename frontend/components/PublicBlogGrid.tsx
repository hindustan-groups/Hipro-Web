"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowUpRight } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

interface PublicBlogGridProps {
  blogs: BlogPost[];
  initialCategory?: string;
  initialPageSize?: number;
}

export default function PublicBlogGrid({
  blogs = [],
  initialCategory = "",
  initialPageSize = 6,
}: PublicBlogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [visibleCount, setVisibleCount] = useState<number>(initialPageSize);

  // Extract valid published categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category && b.category.trim()) {
        set.add(b.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [blogs]);

  // Filter blogs by active category
  const filteredBlogs = useMemo(() => {
    if (!selectedCategory) return blogs;
    return blogs.filter(
      (b) => b.category && b.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [blogs, selectedCategory]);

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);
  const hasMore = filteredBlogs.length > visibleCount;

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(initialPageSize);
  };

  return (
    <div>
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        <button
          onClick={() => handleSelectCategory("")}
          className={`text-xs font-bold uppercase tracking-wider px-4 py-2 border shadow-sm transition-colors cursor-pointer rounded-none ${
            !selectedCategory
              ? "bg-construction-navy text-white border-construction-navy"
              : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          All Articles
        </button>
        {categories.map((cat, ci) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={ci}
              onClick={() => handleSelectCategory(cat)}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 border transition-colors cursor-pointer rounded-none ${
                isSelected
                  ? "bg-construction-navy text-white border-construction-navy shadow-sm"
                  : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500">
            {selectedCategory ? (
              <div>
                <p className="mb-4">No blog posts found in category &quot;{selectedCategory}&quot;.</p>
                <button
                  onClick={() => handleSelectCategory("")}
                  className="inline-block bg-construction-navy text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 cursor-pointer"
                >
                  View All Articles
                </button>
              </div>
            ) : (
              "No blog posts available at the moment. Please check back later."
            )}
          </div>
        ) : (
          visibleBlogs.map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug || post.id}`}
              className="group flex flex-col h-full bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 rounded-none overflow-hidden"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-56">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={!isOptimizableImage(post.image)}
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Category badge */}
                {post.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-construction-navy text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-none shadow-sm">
                      {post.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-construction-navy" />
                      {post.date}
                    </div>
                    {post.author && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-construction-navy" />
                        {post.author}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3 font-display uppercase tracking-tight group-hover:text-construction-navy transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-construction-navy uppercase tracking-wider group-hover:text-construction-red group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* View More Articles / Load More Button */}
      {hasMore ? (
        <div className="mt-14 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + initialPageSize)}
            className="inline-flex items-center justify-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-10 py-4 text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer group border border-construction-navy hover:border-slate-900 focus-visible:ring-2 focus-visible:ring-construction-navy focus-visible:outline-none"
          >
            <span>View More Articles ({filteredBlogs.length - visibleCount} remaining)</span>
            <ArrowUpRight className="w-4 h-4 text-construction-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      ) : filteredBlogs.length > initialPageSize ? (
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
            Showing all {filteredBlogs.length} articles
          </p>
        </div>
      ) : null}
    </div>
  );
}
