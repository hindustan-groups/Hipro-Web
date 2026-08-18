import Link from "next/link";
import { ArrowUpRight, Calendar, User, Newspaper } from "lucide-react";
import type { BlogPost } from "@/lib/types";

const defaultBlogs: BlogPost[] = [
  {
    id: "1",
    slug: "sustainable-construction-trends-2025",
    title: "Sustainable Civil Engineering & Green Building Trends",
    excerpt: "How modern high-rises and commercial complexes are utilizing energy-efficient materials and carbon-neutral concrete.",
    content: "Full content...",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=1200&q=80",
    date: "August 2025",
    author: "Chief Structural Engineer",
    category: "Engineering & Innovation",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    slug: "seismic-design-and-structural-safety",
    title: "Advanced Seismic Engineering for High-Rise Towers",
    excerpt: "Exploring modern damping technologies, shear wall systems, and geotechnical foundation techniques for earthquake resilience.",
    content: "Full content...",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
    date: "July 2025",
    author: "Senior Architect",
    category: "Architecture & Design",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function Blogs({ posts = [] }: { posts?: BlogPost[] }) {
  const list = posts && posts.length > 0 ? posts : defaultBlogs;
  if (!list || list.length === 0) return null;

  const featuredPost = list[0];
  const sidePosts = list.slice(1, 4); // Show max 3 side posts

  return (
    <section id="section-blogs" className="py-24 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
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
            className="group inline-flex items-center gap-2 text-construction-navy font-bold hover:text-construction-red transition-colors uppercase tracking-widest text-xs"
          >
            View All News 
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        {/* Editorial Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Featured Post (Left, 2/3 width) */}
          <Link 
            href={`/blogs/${featuredPost.slug || featuredPost.id}`}
            className="group w-full lg:w-2/3 relative h-[500px] md:h-[600px] block overflow-hidden bg-slate-900 border border-slate-200 shadow-md"
          >
            <img
              src={featuredPost.image}
              alt={featuredPost.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Category badge */}
            <div className="absolute top-6 left-6 z-10">
              <span className="bg-construction-red text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 border border-red-500/30 shadow-sm backdrop-blur-sm">
                {featuredPost.category}
              </span>
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
              <div className="flex items-center gap-4 text-xs text-slate-300 font-bold uppercase tracking-wider mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-construction-red" />
                  {featuredPost.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-construction-red" />
                  {featuredPost.author}
                </div>
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-white font-display uppercase tracking-tight mb-4 group-hover:text-red-100 transition-colors leading-tight">
                {featuredPost.title}
              </h3>
              <p className="text-slate-300 font-medium md:text-lg max-w-2xl line-clamp-2 md:line-clamp-none mb-6">
                {featuredPost.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Read Full Article <ArrowUpRight className="w-4 h-4 text-construction-red" />
              </span>
            </div>
          </Link>

          {/* Side Posts (Right, 1/3 width, stacked) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-8">
            {sidePosts.map((post) => (
              <Link
                key={post.id}
                href={`/blogs/${post.slug || post.id}`}
                className="group flex flex-col h-full bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-black/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-construction-navy" />
                        {post.date}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 font-display tracking-tight mb-3 group-hover:text-construction-navy transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-light line-clamp-2">{post.excerpt}</p>
                  </div>
                  
                  <div className="pt-6 mt-4 border-t border-slate-200/60">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-construction-navy uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      Read <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
