import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar, User, Newspaper } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

export default function Blogs({ posts = [] }: { posts?: BlogPost[] }) {
  if (!posts || posts.length === 0) return null;

  // Strict limit of 3 posts: 1 Big Featured + 2 Small Side Posts
  const displayPosts = posts.slice(0, 3);
  const featuredPost = displayPosts[0];
  const sidePosts = displayPosts.slice(1, 3);

  return (
    <section id="section-blogs" className="py-24 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-construction-navy mb-4 shadow-sm">
              <Newspaper className="w-3.5 h-3.5 text-construction-red" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Industry Insights</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-construction-navy font-display uppercase tracking-wider mb-4">
              Latest <span className="font-serif italic font-normal text-construction-red normal-case">News &amp; Articles</span>
            </h2>
            <div className="flex w-64 h-1">
              <div className="w-1/3 h-full bg-yellow-500"></div>
              <div className="w-2/3 h-full bg-construction-navy"></div>
            </div>
          </div>
          <Link 
            href="/blogs" 
            className="group hidden sm:inline-flex items-center gap-2 text-construction-navy font-bold hover:text-construction-red transition-colors uppercase tracking-widest text-xs"
          >
            View All News 
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        {/* Editorial Layout: 1 Big Featured Card (Left) + 2 Small Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Featured Post (Left, 7 cols) - Structured for Zero-Cropping and Unobstructed Imagery */}
          <Link 
            href={`/blogs/${featuredPost.slug || featuredPost.id}`}
            className="group lg:col-span-7 flex flex-col bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Top Showcase Image: Zero-Cropping Object-Contain Container */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-950 overflow-hidden flex items-center justify-center">
              {featuredPost.image ? (
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.imageAlt || featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  unoptimized={!isOptimizableImage(featuredPost.image)}
                  loading="lazy"
                  className="object-contain object-center"
                />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}
            </div>

            {/* Bottom Content Section - Unobstructed Editorial Typography */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between bg-white">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 font-mono">
                  {featuredPost.category && (
                    <span className="bg-construction-red/10 text-construction-red border border-construction-red/20 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1">
                      {featuredPost.category}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-construction-red" />
                    {featuredPost.date}
                  </div>
                  {featuredPost.author && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-construction-red" />
                      {featuredPost.author}
                    </div>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 font-display uppercase tracking-tight mb-3 group-hover:text-construction-navy transition-colors leading-tight line-clamp-2">
                  {featuredPost.title}
                </h3>
                <p className="text-slate-600 font-normal text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-construction-navy uppercase tracking-widest group-hover:text-construction-red group-hover:translate-x-1 transition-all">
                  Read Full Article <ArrowUpRight className="w-4 h-4 text-construction-red" />
                </span>
              </div>
            </div>
          </Link>

          {/* 2 Small Side Posts (Right, 5 cols) - Structured for Zero-Cropping & Balanced Editorial Density */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between h-full">
            {sidePosts.map((post) => (
              <Link
                key={post.id || post.slug}
                href={`/blogs/${post.slug || post.id}`}
                className="group flex flex-col justify-between flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden p-3.5 sm:p-6"
              >
                <div>
                  {/* Top Split: Thumbnail + Title & Meta (Compact Horizontal Row on Mobile) */}
                  <div className="flex flex-row gap-3 sm:gap-4 items-start sm:mb-3">
                    {/* Thumbnail Image - Zero Cropping 16:10 Container */}
                    <div className="relative w-28 xs:w-32 sm:w-40 md:w-44 lg:w-40 xl:w-44 aspect-[16/10] shrink-0 overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.imageAlt || post.title}
                          fill
                          sizes="(max-width: 640px) 120px, 200px"
                          unoptimized={!isOptimizableImage(post.image)}
                          loading="lazy"
                          className="object-contain object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Metadata Header & Article Title */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 font-mono">
                        {post.category && (
                          <span className="bg-construction-red/10 text-construction-red border border-construction-red/20 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5">
                            {post.category}
                          </span>
                        )}
                        <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-construction-navy" />
                          {post.date}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-base font-bold text-slate-900 font-display uppercase tracking-tight group-hover:text-construction-navy transition-colors line-clamp-2 sm:line-clamp-3 leading-snug">
                        {post.title}
                      </h4>

                      {/* Compact Mobile Read Action */}
                      <div className="sm:hidden mt-1.5 flex items-center gap-1 text-[10px] font-bold text-construction-navy uppercase tracking-wider group-hover:text-construction-red">
                        <span>Read</span>
                        <ArrowUpRight className="w-3 h-3 text-construction-red" />
                      </div>
                    </div>
                  </div>

                  {/* Article Excerpt - Full Width on Desktop/Tablet, Hidden on Mobile for clean density */}
                  <p className="hidden sm:block text-xs sm:text-sm text-slate-600 font-normal line-clamp-3 sm:line-clamp-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Card Footer CTA - Desktop/Tablet */}
                <div className="hidden sm:flex pt-3 mt-3 border-t border-slate-200/80 items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hidden xl:inline-block">
                    HiPRO Field Guide
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-construction-navy uppercase tracking-wider group-hover:text-construction-red group-hover:translate-x-1 transition-all">
                    Read Article <ArrowUpRight className="w-3.5 h-3.5 text-construction-red" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>

        {/* Mobile View All Button */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/blogs"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-construction-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors shadow-md"
          >
            View All News &amp; Articles
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
