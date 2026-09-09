import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar, User, Newspaper } from "lucide-react";
import { findAll } from "@/lib/db";
import type { BlogPost } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Construction Blog & Industry Insights",
  description: "Read the latest news, tips, and insights on construction, architecture, and infrastructure development in India from Hindustan Projects.",
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: "Construction Blog & Industry Insights | Hindustan Projects",
    description: "Read the latest news, tips, and insights on construction, architecture, and infrastructure development in India from Hindustan Projects.",
    type: "website",
  },
};

export default async function BlogsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const allBlogs = await findAll<BlogPost>("blogs");
  const blogs = allBlogs
    .filter(b => b.active !== false)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const selectedCategory = searchParams?.category;
  const categories = Array.from(new Set(blogs.map(b => b.category).filter(Boolean)));

  const displayBlogs = selectedCategory
    ? blogs.filter(b => b.category && b.category.toLowerCase() === selectedCategory.toLowerCase())
    : blogs;

  return (
    <>
      {/* Header */}
      <section className="bg-white pt-36 pb-20 px-4 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-slate-50 border border-slate-200 text-construction-navy mb-6 shadow-sm">
            <Newspaper className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Industry Insights</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-5 font-display uppercase tracking-tight">
            Our <span className="font-serif italic font-normal text-construction-red normal-case">Blogs &amp; Insights</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            Stay up to date with the latest trends, news, and insights from the world of construction and engineering.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter Pills (Functional Query Links) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <Link
              href="/blogs"
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 border shadow-sm transition-colors ${
                !selectedCategory
                  ? "bg-construction-navy text-white border-construction-navy"
                  : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              All Articles
            </Link>
            {categories.map((cat, ci) => {
              const isSelected = selectedCategory?.toLowerCase() === cat.toLowerCase();
              return (
                <Link
                  key={ci}
                  href={`/blogs?category=${encodeURIComponent(cat)}`}
                  className={`text-xs font-bold uppercase tracking-wider px-4 py-2 border transition-colors ${
                    isSelected
                      ? "bg-construction-navy text-white border-construction-navy shadow-sm"
                      : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayBlogs.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-500">
                {selectedCategory ? (
                  <div>
                    <p className="mb-4">No blog posts found in category &quot;{selectedCategory}&quot;.</p>
                    <Link
                      href="/blogs"
                      className="inline-block bg-construction-navy text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5"
                    >
                      View All Articles
                    </Link>
                  </div>
                ) : (
                  "No blog posts available at the moment. Please check back later."
                )}
              </div>
            ) : (
              displayBlogs.map((post) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.slug}`}
                  className="group flex flex-col h-full bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 rounded-none overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-56">
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized={!isOptimizableImage(post.image)}
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-construction-navy text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-none shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-construction-navy" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-construction-navy" />
                          {post.author}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-black mb-3 font-display uppercase tracking-tight group-hover:text-construction-navy transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-3">{post.excerpt}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-construction-navy uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                        Read Article <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Bottom Conversion CTA */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs font-bold text-construction-red uppercase tracking-widest block mb-3">Project Planning &amp; Estimation</span>
          <h2 className="text-3xl md:text-4xl font-bold text-construction-navy mb-5 font-display uppercase tracking-tight">
            Planning a Construction Project in Rajasthan?
          </h2>
          <p className="text-slate-600 mb-8 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            From turnkey civil construction and architectural planning to site surveying and cost estimation, our team delivers disciplined engineering excellence across Bhilwara and Rajasthan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cost-estimator"
              className="bg-construction-red hover:bg-red-700 text-white font-bold px-8 py-4 text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Use Cost Estimator
            </Link>
            <Link
              href="/contact?service=General%20Inquiry"
              className="bg-construction-navy hover:bg-blue-900 text-white font-bold px-8 py-4 text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Consult an Engineer
            </Link>
            <a
              href="tel:7597000601"
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-8 py-4 text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              Call +91 75970 00601
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
