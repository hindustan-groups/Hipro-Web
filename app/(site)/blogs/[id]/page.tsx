import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { findAll } from "@/lib/db";
import type { BlogPost } from "@/lib/types";

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const allBlogs = await findAll<BlogPost>("blogs");
  const post = allBlogs.find(p => p.id === params.id && p.active !== false);

  if (!post) {
    notFound();
  }

  return (
    <>
      {/* Header Image & Meta */}
      <section className="bg-white pt-32 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/blogs" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-construction-navy transition-colors uppercase tracking-wider mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </Link>
          
          <div className="mb-6">
            <span className="inline-block bg-construction-navy text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-none shadow-sm mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-display uppercase tracking-tight leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 pb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-construction-navy" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-construction-navy" />
                {post.author}
              </div>
              <button className="flex items-center gap-2 ml-auto text-slate-400 hover:text-black transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="px-4 mb-12">
        <div className="max-w-5xl mx-auto h-[40vh] md:h-[60vh] relative overflow-hidden rounded-none shadow-2xl">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Content */}
      <section className="bg-white pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-slate max-w-none">
            <p className="text-xl text-slate-600 font-light leading-relaxed mb-8 border-l-4 border-construction-navy pl-6 italic">
              {post.excerpt}
            </p>
            
            {post.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-slate-700 leading-relaxed mb-6 font-light">
                {paragraph.includes('**') ? (
                  // Simple bold parsing for dummy content
                  <span dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ) : (
                  paragraph
                )}
              </p>
            ))}
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-200">
            <h3 className="text-2xl font-bold text-black mb-6 font-display uppercase tracking-tight">
              Share this article
            </h3>
            <div className="flex gap-4">
              {/* Dummy social buttons */}
              {['Twitter', 'LinkedIn', 'Facebook'].map((platform) => (
                <button key={platform} className="px-6 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-black font-bold uppercase tracking-wider text-xs transition-colors">
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
