import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar, User, Newspaper } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

export default function Blogs({ posts = [] }: { posts?: BlogPost[] }) {
  // Enforce strict limit of maximum 3 latest blog posts on the homepage
  const displayPosts = (posts || []).slice(0, 3);
  if (displayPosts.length === 0) return null;

  return (
    <section id="section-blogs" className="py-24 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-construction-navy mb-4 shadow-sm">
              <Newspaper className="w-3.5 h-3.5 text-construction-red" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Latest News &amp; Updates</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-construction-navy font-display uppercase tracking-wider mb-4">
              Industry <span className="font-serif italic font-normal text-construction-red normal-case">Insights</span>
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

        {/* 3-Column Balanced Blog Grid - Perfectly Aligned Equal Height Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {displayPosts.map((post) => (
            <Link
              key={post.id || post.slug}
              href={`/blogs/${post.slug || post.id}`}
              className="group flex flex-col h-full bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Card Image */}
              <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-900 shrink-0">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={!isOptimizableImage(post.image)}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Category badge */}
                {post.category && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-construction-navy text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 shadow-sm">
                      {post.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-construction-red" />
                      {post.date}
                    </div>
                    {post.author && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-construction-navy" />
                        {post.author}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-display uppercase tracking-tight mb-3 group-hover:text-construction-navy transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-normal line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-5 mt-auto border-t border-slate-200/80 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-construction-navy uppercase tracking-wider group-hover:text-construction-red transition-colors">
                    Read Full Article <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
