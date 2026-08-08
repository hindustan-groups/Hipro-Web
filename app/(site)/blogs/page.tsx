import Link from "next/link";
import { ArrowUpRight, Calendar, User, Newspaper } from "lucide-react";

const BLOG_POSTS = [
  {
    id: "1",
    title: "The Future of Sustainable Construction",
    excerpt: "Explore how green building practices are reshaping the industry and what it means for your next project. We delve into eco-friendly materials and energy-efficient designs.",
    image: "https://images.unsplash.com/photo-1541888081604-3a216f966141?q=80&w=2000&auto=format&fit=crop",
    date: "August 12, 2024",
    author: "John Doe",
    category: "Sustainability"
  },
  {
    id: "2",
    title: "Top 5 Safety Protocols on Modern Job Sites",
    excerpt: "Safety is our number one priority. Learn about the new technologies and rigorous training protocols keeping workers safe on complex construction sites.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop",
    date: "July 28, 2024",
    author: "Jane Smith",
    category: "Safety"
  },
  {
    id: "3",
    title: "Cost-Effective Material Choices for 2024",
    excerpt: "Supply chain insights to help you make the best material choices without compromising quality. An overview of market trends and availability.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2000&auto=format&fit=crop",
    date: "July 15, 2024",
    author: "Mike Johnson",
    category: "Industry News"
  }
];

export default function BlogsPage() {
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
            Our <span className="text-construction-navy">Blogs</span>
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
            {BLOG_POSTS.map((post) => (
              <Link
                href={`/blogs/${post.id}`}
                key={post.id}
                className="group rounded-none overflow-hidden bg-white border border-slate-200 hover:border-slate-300 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 flex flex-col hover:-translate-y-1.5"
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
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
