import Link from "next/link";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";

// In a real app, this would be fetched from a database using the ID
const BLOG_POSTS = [
  {
    id: "1",
    title: "The Future of Sustainable Construction",
    excerpt: "Explore how green building practices are reshaping the industry and what it means for your next project. We delve into eco-friendly materials and energy-efficient designs.",
    content: "Sustainable construction is no longer just a buzzword; it's a fundamental shift in how we build. In recent years, the push for greener, more energy-efficient buildings has transformed the construction industry. From the use of recycled materials to the implementation of advanced energy management systems, sustainable practices are becoming the standard rather than the exception. \n\nOne of the most significant advancements is in the materials we use. Traditional concrete and steel are being supplemented or even replaced by innovative materials like cross-laminated timber (CLT) and recycled aggregates. These materials not only reduce the carbon footprint of the building process but also offer excellent structural properties. \n\nFurthermore, the integration of smart technology is making buildings more efficient than ever. Automated lighting, heating, and cooling systems ensure that energy is only used when needed, drastically reducing waste. As we look to the future, it's clear that sustainable construction will continue to evolve, offering new ways to build in harmony with our environment.",
    image: "https://images.unsplash.com/photo-1541888081604-3a216f966141?q=80&w=2000&auto=format&fit=crop",
    date: "August 12, 2024",
    author: "John Doe",
    category: "Sustainability"
  },
  {
    id: "2",
    title: "Top 5 Safety Protocols on Modern Job Sites",
    excerpt: "Safety is our number one priority. Learn about the new technologies and rigorous training protocols keeping workers safe on complex construction sites.",
    content: "Construction sites are inherently dangerous places, but with the right protocols and technologies, we can minimize risks and ensure that everyone goes home safely at the end of the day. Here are the top 5 safety protocols currently transforming modern job sites:\n\n1. **Wearable Technology**: Smart helmets and vests equipped with sensors can monitor workers' vital signs, detect fatigue, and even alert them to nearby hazards, such as moving machinery or hazardous gases.\n\n2. **Drones for Site Inspections**: Drones are increasingly being used to conduct site inspections, especially in hard-to-reach or dangerous areas. This reduces the need for workers to put themselves in risky situations.\n\n3. **Virtual Reality (VR) Training**: Before workers even step onto a site, they can undergo comprehensive training using VR. This allows them to experience and react to potential hazards in a safe, controlled environment.\n\n4. **Automated Equipment**: Automated and remote-controlled machinery can take over the most dangerous tasks, keeping human workers out of harm's way.\n\n5. **Strict Access Control**: Advanced biometric systems ensure that only authorized and fully trained personnel can access certain areas of a site, reducing the risk of accidents caused by inexperienced individuals.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop",
    date: "July 28, 2024",
    author: "Jane Smith",
    category: "Safety"
  },
  {
    id: "3",
    title: "Cost-Effective Material Choices for 2024",
    excerpt: "Supply chain insights to help you make the best material choices without compromising quality. An overview of market trends and availability.",
    content: "As we navigate 2024, the construction industry continues to face supply chain challenges and fluctuating material costs. Making cost-effective choices without compromising on quality or safety is more crucial than ever. Here is an overview of smart material choices for this year.\n\nFirst, consider **Engineered Wood Products**. They are often more cost-effective and structurally consistent than traditional timber. Products like LVL (Laminated Veneer Lumber) and I-joists offer high strength-to-weight ratios and are less prone to warping.\n\nSecondly, **Recycled Steel** is a fantastic option. It maintains the strength and durability of new steel but is often available at a lower cost and with a significantly reduced environmental impact.\n\nLastly, don't overlook **Precast Concrete**. By casting concrete in a controlled environment, manufacturers can ensure high quality and consistency while reducing on-site labor costs and waste. As market trends shift, staying informed about these alternatives can make a substantial difference in your project's bottom line.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2000&auto=format&fit=crop",
    date: "July 15, 2024",
    author: "Mike Johnson",
    category: "Industry News"
  }
];

export default function BlogPost({ params }: { params: { id: string } }) {
  const post = BLOG_POSTS.find(p => p.id === params.id) || BLOG_POSTS[0];

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
