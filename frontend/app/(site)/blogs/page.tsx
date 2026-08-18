import Link from "next/link";
import { ArrowUpRight, Calendar, User, Newspaper } from "lucide-react";
import { findAll } from "@/lib/db";
import type { BlogPost } from "@/lib/types";

export default async function BlogsPage() {
  const allBlogs = await findAll<BlogPost>("blogs");
  const blogs = allBlogs
    .filter(b => b.active !== false)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-500">
                No blog posts available at the moment. Please check back later.
              </div>
            ) : (
              blogs.map((post) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.slug}`}
                  className="group flex flex-col h-full bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 rounded-none overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
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
                      <h3 className="text-xl font-bold text-black mb-3 font-display uppercase tracking-tight group-hover:text-construction-navy transition-colors">
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
    </>
  );
}
