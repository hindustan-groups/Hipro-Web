import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin, Clock, HelpCircle } from "lucide-react";
import { findAll, findBySlug } from "@/lib/db";
import type { BlogPost } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";
import { Metadata } from "next";
import { generateBreadcrumbSchema, generateFaqSchema } from "@/lib/schema";
import {
  enrichBlogContent,
  parseMarkdownBlocks,
  renderFormattedText,
  getFaqs,
  getCustomCta,
  getRelatedPostIds,
} from "@/lib/blogUtils";

export const revalidate = 60;

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await findBySlug<BlogPost>("blogs", decodedSlug);

  if (!post) return { title: "Blog Not Found" };

  const metaTitle = post.metaTitle || post.title;
  const metaDesc = post.metaDescription || post.excerpt;

  // Aggregate keywords
  const keywordList: string[] = [];
  if (post.primaryKeyword) keywordList.push(post.primaryKeyword.trim());
  if (post.secondaryKeywords) {
    keywordList.push(...post.secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean));
  }
  if (post.geoKeywords) {
    keywordList.push(...post.geoKeywords.split(',').map(k => k.trim()).filter(Boolean));
  }
  if (post.keywords) {
    keywordList.push(...post.keywords.split(',').map(k => k.trim()).filter(Boolean));
  }

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: keywordList.length > 0 ? Array.from(new Set(keywordList)) : undefined,
    alternates: {
      canonical: `/blogs/${decodedSlug}`,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: [post.image],
      type: "article",
      publishedTime: post.publishDate ? new Date(post.publishDate).toISOString() : post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      authors: [post.author || "Hindustan Projects"],
      section: post.category || "Construction & Engineering",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDesc,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await findBySlug<BlogPost>("blogs", decodedSlug);

  if (!post) notFound();

  const allBlogs = await findAll<BlogPost>("blogs");

  // Curated related articles with fallback to latest published
  const curatedIds = getRelatedPostIds(post);
  let relatedBlogs: BlogPost[] = [];
  if (curatedIds.length > 0) {
    relatedBlogs = allBlogs.filter(p =>
      (curatedIds.includes(p.id || "") || curatedIds.includes(p.slug || "")) &&
      p.id !== post.id &&
      p.slug !== post.slug &&
      p.active !== false &&
      (p.status || "published").toLowerCase() === "published"
    );
  }
  if (relatedBlogs.length === 0) {
    relatedBlogs = allBlogs
      .filter(p => p.id !== post.id && p.slug !== post.slug && p.active !== false && (p.status || "published").toLowerCase() === "published")
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3);
  }

  // Enrich content with clean markdown (no duplicate H1) and verified natural contextual internal links
  const enrichedContent = enrichBlogContent(decodedSlug, post.content || "");
  const blocks = parseMarkdownBlocks(enrichedContent);

  // Structured FAQs (prioritizes structured JSON, falls back to markdown extraction)
  const faqs = getFaqs(post);
  const faqJsonLd = faqs.length > 0 ? generateFaqSchema(faqs) : null;

  // Custom CTA config
  const customCta = getCustomCta(post);

  // Calculate read time based on enriched text
  const wordCount = enrichedContent.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const canonicalUrl = `https://www.hindustanprojects.in/blogs/${decodedSlug}`;

  // Regional relevance check for factual geo tags
  const isLocalBhilwara = /bhilwara/i.test(`${post.title} ${post.excerpt} ${post.targetLocation || ""} ${post.geoKeywords || ""} ${post.keywords || ""}`);
  const isLocalRajasthan = /rajasthan/i.test(`${post.title} ${post.excerpt} ${post.targetLocation || ""} ${post.geoKeywords || ""} ${post.keywords || ""}`);

  // Determine author entity: if author represents company (or is missing/generic), type as Organization referencing #organization
  const rawAuthor = post.author?.trim();
  const isCompanyAuthor =
    !rawAuthor ||
    /^(hindustan\s+projects(\s+team)?|hipro|admin)$/i.test(rawAuthor);

  const authorSchema = isCompanyAuthor
    ? {
        "@type": "Organization",
        "@id": "https://www.hindustanprojects.in/#organization",
        "name": "Hindustan Projects",
      }
    : /^(yogesh\s+kharol)$/i.test(rawAuthor)
    ? {
        "@type": "Person",
        "@id": "https://www.hindustanprojects.in/#founder",
        "name": rawAuthor,
      }
    : {
        "@type": "Person",
        "name": rawAuthor,
      };

  // Schema.org BlogPosting structured data
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "headline": post.metaTitle || post.title,
    "description": post.metaDescription || post.excerpt,
    "image": post.image,
    "datePublished": post.publishDate ? new Date(post.publishDate).toISOString() : post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
    "dateModified": post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    "author": authorSchema,
    "publisher": {
      "@type": "Organization",
      "@id": "https://www.hindustanprojects.in/#organization",
      "name": "Hindustan Projects",
      "url": "https://www.hindustanprojects.in",
      "logo": { "@type": "ImageObject", "url": "https://www.hindustanprojects.in/logo.jpg" }
    }
  };

  if (post.targetLocation || isLocalBhilwara || isLocalRajasthan) {
    const locName = post.targetLocation || (isLocalBhilwara ? "Bhilwara, Rajasthan, India" : "Rajasthan, India");
    jsonLd.contentLocation = {
      "@type": "Place",
      "name": locName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": isLocalBhilwara ? "Bhilwara" : "Jaipur",
        "addressRegion": "Rajasthan",
        "addressCountry": "IN"
      }
    };
  }

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.hindustanprojects.in" },
    { name: "Blogs", url: "https://www.hindustanprojects.in/blogs" },
    { name: post.title, url: canonicalUrl },
  ]);

  return (
    <>
      {/* Schema.org JSON-LD (Safely serialized) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      )}

      <article className="min-h-screen bg-[#FDFDFD]">
        
        {/* Dynamic Hero Section - Content-driven responsive layout with safe navbar clearance */}
        <header className="relative w-full min-h-[520px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-[660px] flex flex-col justify-end pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
          {/* Background Image with optimized framing */}
          <div className="absolute inset-0 w-full h-full">
            {post.image && (
              <Image 
                src={post.image} 
                alt={post.imageAlt || post.title}
                fill
                priority
                sizes="100vw"
                unoptimized={!isOptimizableImage(post.image)}
                className="object-cover object-[center_35%] md:object-[center_30%]"
              />
            )}
            {/* Base dark tint + directional gradient for reliable text contrast across all viewports */}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/35" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
            <Link 
              href="/blogs" 
              className="inline-flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white transition-colors uppercase tracking-widest mb-6 sm:mb-8 md:mb-10 group"
            >
              <ArrowLeft className="w-4 h-4 text-construction-red group-hover:-translate-x-1 transition-transform" /> Back to Insights
            </Link>

            <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-4 sm:mb-6">
              <span className="inline-block bg-construction-red text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] px-3.5 sm:px-4 py-1.5 shadow-xl">
                {post.category}
              </span>
              {post.targetLocation && (
                <span className="inline-block bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 backdrop-blur-sm">
                  {post.targetLocation}
                </span>
              )}
            </div>

            <h1 className="text-[clamp(1.65rem,4.2vw+0.2rem,4rem)] font-black text-white mb-5 sm:mb-6 font-display uppercase tracking-tight sm:tracking-tighter leading-[1.14] sm:leading-[1.1] max-w-4xl drop-shadow-lg break-words">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-white/90 font-medium sm:font-semibold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-construction-red shrink-0" />
                <span itemProp="author">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-construction-red shrink-0" />
                <time itemProp="datePublished" dateTime={post.publishDate ? new Date(post.publishDate).toISOString() : post.createdAt ? new Date(post.createdAt).toISOString() : undefined}>
                  {post.date}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-construction-red shrink-0" />
                <span>{readTime} min read</span>
              </div>
            </div>

            {post.imageCaption && (
              <p className="text-xs text-white/75 italic mt-3 sm:mt-4 max-w-2xl leading-relaxed drop-shadow">
                Cover: {post.imageCaption}
              </p>
            )}
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
              
              {/* Body Content Rendering with Full Semantic Markdown Support */}
              <div itemProp="articleBody" className="space-y-6 text-slate-700 font-light leading-[1.8] text-[17px] md:text-[18px]">
                {blocks.map((block, index) => {
                  switch (block.type) {
                    case 'h1':
                      if (block.content && block.content.toLowerCase() === post.title.toLowerCase()) {
                        return null; // Skip duplicate title
                      }
                      return (
                        <h2 key={index} className="text-3xl md:text-4xl font-bold text-slate-900 mt-12 mb-6 font-display uppercase tracking-tight">
                          {block.content}
                        </h2>
                      );
                    case 'h2':
                      return (
                        <h2 key={index} className="text-2xl md:text-3xl font-bold text-slate-900 mt-12 mb-5 font-display uppercase tracking-tight pt-4 border-t border-slate-100">
                          {block.content}
                        </h2>
                      );
                    case 'h3':
                      return (
                        <h3 key={index} className="text-xl md:text-2xl font-bold mt-8 mb-3 font-display tracking-tight text-construction-navy">
                          {block.content}
                        </h3>
                      );
                    case 'ul':
                      return (
                        <ul key={index} className="space-y-2.5 my-6 pl-2">
                          {block.items?.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-3 text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-construction-red mt-2.5 shrink-0" />
                              <span className="leading-relaxed">{renderFormattedText(item)}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    case 'ol':
                      return (
                        <ol key={index} className="space-y-2.5 my-6 pl-2 list-none">
                          {block.items?.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-3 text-slate-700">
                              <span className="text-xs font-black text-construction-red mt-1 shrink-0 font-display tracking-wider">
                                0{itemIdx + 1}.
                              </span>
                              <span className="leading-relaxed">{renderFormattedText(item)}</span>
                            </li>
                          ))}
                        </ol>
                      );
                    case 'blockquote':
                      return (
                        <blockquote key={index} className="border-l-4 border-construction-red bg-slate-50 p-6 my-8 italic text-slate-800 font-normal shadow-sm">
                          {renderFormattedText(block.content || "")}
                        </blockquote>
                      );
                    case 'table':
                      return (
                        <div key={index} className="overflow-x-auto my-8 border border-slate-200">
                          <table className="w-full text-left text-sm">
                            {block.headers && (
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 uppercase tracking-wider text-xs font-bold font-display">
                                <tr>
                                  {block.headers.map((h, hi) => (
                                    <th key={hi} className="p-3.5">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                            )}
                            {block.rows && (
                              <tbody className="divide-y divide-slate-100">
                                {block.rows.map((row, ri) => (
                                  <tr key={ri} className="hover:bg-slate-50/50 transition-colors">
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="p-3.5 text-slate-600">{renderFormattedText(cell)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            )}
                          </table>
                        </div>
                      );
                    case 'image':
                      return (
                        <figure key={index} className="my-8">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={block.content}
                            alt={block.items?.[0] || post.title}
                            loading="lazy"
                            className="w-full max-h-[550px] object-cover rounded-none border border-slate-200 shadow-md"
                          />
                          {block.items?.[0] && (
                            <figcaption className="text-xs text-slate-500 mt-2.5 text-center italic">
                              {block.items[0]}
                            </figcaption>
                          )}
                        </figure>
                      );
                    case 'paragraph':
                    default:
                      return (
                        <p key={index} className="leading-relaxed">
                          {renderFormattedText(block.content || "")}
                        </p>
                      );
                  }
                })}
              </div>

            </div>

            {/* Structured FAQ Section */}
            {faqs.length > 0 && (
              <div className="mt-14 pt-8 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <span className="p-1.5 bg-construction-red/10 text-construction-red">
                    <HelpCircle className="w-4 h-4" />
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 font-display uppercase tracking-tight">
                    Frequently Asked Questions
                  </h3>
                </div>
                <div className="space-y-3">
                  {faqs.map((faq, fIdx) => (
                    <details
                      key={fIdx}
                      className="group bg-slate-50 border border-slate-200 p-4 md:p-5 rounded-none open:bg-white open:shadow-sm transition-all"
                    >
                      <summary className="font-bold text-slate-900 cursor-pointer list-none flex items-center justify-between text-sm md:text-base select-none">
                        <span>{faq.question}</span>
                        <span className="text-construction-red font-bold text-lg transition-transform group-open:rotate-45 ml-4 shrink-0">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tags / Keywords block for UI SEO density */}
            {post.keywords && (
              <div className="mt-14 pt-8 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Topic Tags</h4>
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

              {/* Planning a Project CTA Widget (supports custom per-article CTA) */}
              <div className="bg-slate-900 p-8 text-white border border-slate-800">
                <h4 className="text-xs font-black text-construction-red uppercase tracking-[0.2em] mb-2">
                  {customCta ? "Featured Action" : "Project Planning"}
                </h4>
                <h5 className="text-xl font-bold font-display uppercase tracking-tight mb-3">
                  {customCta?.title || "Planning a build in Rajasthan?"}
                </h5>
                <p className="text-xs text-slate-300 font-light leading-relaxed mb-6">
                  {customCta?.description || "Estimate realistic residential construction costs in Bhilwara, Jaipur, and Rajasthan with our free calculator."}
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href={customCta?.buttonUrl || "/cost-estimator"}
                    className="w-full bg-construction-red hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs py-3 text-center transition-colors shadow-md"
                  >
                    {customCta?.buttonText || "Calculate Cost"}
                  </Link>
                  {!customCta && (
                    <Link
                      href="/services"
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest text-xs py-3 text-center transition-colors border border-white/20"
                    >
                      Explore Services
                    </Link>
                  )}
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
                        <div className="w-20 h-20 overflow-hidden bg-slate-100 shrink-0 relative">
                          {related.image && (
                            <Image 
                              src={related.image} 
                              alt={related.title} 
                              fill
                              sizes="80px"
                              unoptimized={!isOptimizableImage(related.image)}
                              className="object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                          )}
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
