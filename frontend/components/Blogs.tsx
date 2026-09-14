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
          
          {/* Featured Post (Left, 7 cols) */}
          <Link 
            href={`/blogs/${featuredPost.slug || featuredPost.id}`}
            className="group lg:col-span-7 relative min-h-[460px] md:min-h-[520px] lg:min-h-[580px] h-full block overflow-hidden bg-slate-900 border border-slate-200 shadow-md"
          >
            {featuredPost.image ? (
              <Image
                src={featuredPost.image}
                alt={featuredPost.imageAlt || featuredPost.title}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                unoptimized={!isOptimizableImage(featuredPost.image)}
                className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />
            ) : (
              <div className="w-full h-full bg-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            
            {/* Category badge */}
            {featuredPost.category && (
              <div className="absolute top-6 left-6 z-10">
                <span className="bg-construction-red text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 border border-red-500/30 shadow-sm backdrop-blur-sm">
                  {featuredPost.category}
                </span>
              </div>
            )}

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10">
              <div className="flex items-center gap-4 text-xs text-slate-300 font-bold uppercase tracking-wider mb-3">
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
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-display uppercase tracking-tight mb-3 group-hover:text-red-100 transition-colors leading-tight line-clamp-2">
                {featuredPost.title}
              </h3>
              <p className="text-slate-300 font-normal text-sm sm:text-base max-w-2xl line-clamp-2 mb-6 leading-relaxed">
                {featuredPost.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Read Full Article <ArrowUpRight className="w-4 h-4 text-construction-red" />
              </span>
            </div>
          </Link>

          {/* 2 Small Side Posts (Right, 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between h-full">
            {sidePosts.map((post) => (
              <Link
                key={post.id || post.slug}
                href={`/blogs/${post.slug || post.id}`}
                className="group flex flex-col sm:flex-row flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden min-h-[220px] lg:min-h-0"
              >
                {/* Thumbnail Image */}
                <div className="relative w-full sm:w-44 md:w-48 lg:w-44 xl:w-52 h-48 sm:h-auto shrink-0 overflow-hidden bg-slate-900">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 200px"
                      unoptimized={!isOptimizableImage(post.image)}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none sm:hidden" />
                  {post.category && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-construction-navy text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-construction-navy" />
                        {post.date}
                      </div>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2 group-hover:text-construction-navy transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-normal line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  
                  <div className="pt-4 mt-3 border-t border-slate-200/70 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-construction-navy uppercase tracking-wider group-hover:text-construction-red group-hover:translate-x-1 transition-all">
                      Read Article <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
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
