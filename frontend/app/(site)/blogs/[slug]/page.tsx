import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin, Clock } from "lucide-react";
import { findAll } from "@/lib/db";
import type { BlogPost } from "@/lib/types";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const allBlogs = await findAll<BlogPost>("blogs");
  const post = allBlogs.find((p) => p.slug === params.slug && p.active !== false);

  if (!post) return { title: "Blog Not Found" };

  return {
    title: post.metaTitle || `${post.title} | Hindustan Projects`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords ? post.keywords.split(',').map(k => k.trim()) : undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.image],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const allBlogs = await findAll<BlogPost>("blogs");
  const post = allBlogs.find(p => (p.slug === params.slug || p.id === params.slug) && p.active !== false);

  if (!post) notFound();

  const relatedBlogs = allBlogs
    .filter(p => p.id !== post.id && p.slug !== post.slug && p.active !== false)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  // Calculate read time
  const wordCount = (post.content || "").split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per min

  // Schema.org structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.metaTitle || post.title,
    "description": post.metaDescription || post.excerpt,
    "image": post.image,
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt,
    "author": { "@type": "Person", "name": post.author },
    "publisher": {
      "@type": "Organization",
      "name": "Hindustan Projects",
      "logo": { "@type": "ImageObject", "url": "https://hindustanprojects.com/logo.png" }
    }
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="min-h-screen bg-[#FDFDFD]">
        
        {/* Dynamic Hero Section */}
        <header className="relative w-full h-[60vh] md:h-[75vh] flex items-end pb-16 md:pb-24 pt-32">
          {/* Background Image with Parallax illusion */}
          <div className="absolute inset-0 w-full h-full">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8">
            <Link 
              href="/blogs" 
              className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-widest mb-8 md:mb-12 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Insights
            </Link>

            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-block bg-construction-red text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 shadow-xl">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 font-display uppercase tracking-tighter leading-[1.1] max-w-4xl drop-shadow-lg">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm text-white/80 font-semibold uppercase tracking-wider">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-construction-red" />
                <span itemProp="author">{post.author}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-construction-red" />
                <time itemProp="datePublished" dateTime={post.createdAt}>{post.date}</time>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-construction-red" />
                <span>{readTime} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Layout */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col lg:flex-row gap-16">
          
          {/* Main Article Content */}
          <div className="w-full lg:w-2/3">
            <div className="prose prose-lg md:prose-xl prose-slate max-w-none">
              
              {/* Excerpt / Lead Paragraph */}
              <p className="text-xl md:text-2xl text-slate-800 font-light leading-relaxed mb-12 border-l-4 border-construction-red pl-6 italic">
                {post.excerpt}
              </p>
              
              {/* Body Content Rendering */}
              <div itemProp="articleBody" className="space-y-8 text-slate-700 font-light leading-[1.8] text-[17px] md:text-[19px]">
                {(post.content || "").split('\n\n').map((paragraph, index) => {
                  // Basic markdown rendering simulation
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-3xl font-bold text-slate-900 mt-12 mb-6 font-display uppercase tracking-tight">{paragraph.replace('## ', '')}</h2>;
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={index} className="text-2xl font-bold text-slate-900 mt-10 mb-4 font-display tracking-tight">{paragraph.replace('### ', '')}</h3>;
                  }
                  
                  return (
                    <p key={index} className="mb-6">
                      {paragraph.includes('**') ? (
                        <span dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>') }} />
                      ) : (
                        paragraph
                      )}
                    </p>
                  );
                })}
              </div>

            </div>
            
            {/* Tags / Keywords block for UI SEO density */}
            {post.keywords && (
              <div className="mt-16 pt-8 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.split(',').map((k, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wider rounded-none hover:bg-slate-200 transition-colors cursor-default">
                      {k.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-32 space-y-10">
              
              {/* Author Card */}
              <div className="bg-white p-8 border border-slate-200 shadow-xl shadow-slate-100/50">
                <h4 className="text-xs font-black text-construction-red uppercase tracking-[0.2em] mb-6">About the Author</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-none flex items-center justify-center text-white text-2xl font-display font-bold">
                    {(post.author || "A").charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">{post.author || "Author"}</div>
                    <div className="text-slate-500 text-sm">Industry Expert</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  Delivering cutting edge insights on construction, engineering, and architectural innovations.
                </p>
              </div>

              {/* Share Card */}
              <div className="bg-slate-900 p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-construction-red/20 blur-3xl rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                <h4 className="text-xs font-black text-construction-red uppercase tracking-[0.2em] mb-6 relative z-10">Share Article</h4>
                <div className="flex gap-4 relative z-10">
                  <button className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-construction-red hover:scale-110 transition-all duration-300">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-construction-red hover:scale-110 transition-all duration-300">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-construction-red hover:scale-110 transition-all duration-300">
                    <Facebook className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Newsletter / CTA */}
              <div className="bg-slate-50 p-8 border border-slate-200">
                <h4 className="text-xl font-bold text-slate-900 font-display uppercase tracking-tight mb-2">Never miss an update</h4>
                <p className="text-sm text-slate-500 font-light mb-6">Get the latest insights delivered straight to your inbox.</p>
                <form className="flex flex-col gap-3">
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-3 bg-white border border-slate-300 text-sm focus:outline-none focus:border-construction-red" required />
                  <button type="submit" className="w-full bg-construction-red hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs py-4 transition-colors">
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Related Posts */}
              {relatedBlogs.length > 0 && (
                <div className="bg-white p-8 border border-slate-200 shadow-xl shadow-slate-100/50">
                  <h4 className="text-xs font-black text-construction-red uppercase tracking-[0.2em] mb-6">More Articles</h4>
                  <div className="space-y-6">
                    {relatedBlogs.map(related => (
                      <Link href={`/blogs/${related.slug}`} key={related.id} className="group flex gap-4 items-center">
                        <div className="w-20 h-20 overflow-hidden bg-slate-100 shrink-0">
                          {related.image && <img src={related.image} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 group-hover:text-construction-red transition-colors line-clamp-2 mb-1">{related.title}</h5>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{related.date}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </article>
    </>
  );
}
