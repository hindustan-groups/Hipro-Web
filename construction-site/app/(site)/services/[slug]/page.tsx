import { notFound } from "next/navigation";
import Link from "next/link";
import { findAll } from "@/lib/db";
import type { Service, Settings } from "@/lib/types";
import * as Icons from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const [allServices, settingsData] = await Promise.all([
    findAll<Service>("services"),
    findAll<Settings>("settings"),
  ]);

  const settings = settingsData[0] || {};
  const phone = settings.companyPhone || "+91 98765 43210";
  
  const service = allServices.find(s => 
    s.title.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-') === params.slug
  );

  if (!service || !service.active) {
    notFound();
  }

  let features: string[] = [];
  try {
    features = typeof service.features === 'string' ? JSON.parse(service.features) : service.features;
  } catch {
    features = [];
  }

  const Icon = (Icons as any)[service.icon] || Icons.Wrench;

  // Dynamically create supplementary images from other services so it's not hardcoded
  const supplementaryImages = [
    service.image,
    ...allServices.filter(s => s.id !== service.id).map(s => s.image)
  ];

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. Standard Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-slate-50 border-b border-slate-200/60">
        <div className="absolute inset-0 z-0">
          <img 
            src={service.image} 
            alt={service.title} 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
          <Link href="/services" className="inline-flex items-center text-slate-600 hover:text-construction-navy mb-6 transition-colors text-xs font-bold uppercase tracking-wider group bg-white hover:bg-slate-100 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <Icons.ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Capabilities
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-construction-red flex items-center justify-center text-white shadow-md rounded-full">
              <Icon className="w-6 h-6" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-construction-navy mb-6 font-display uppercase tracking-tight max-w-4xl mx-auto">
            {service.title}
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            {service.description}
          </p>
        </div>
      </section>

      {/* 2. Visual Zig-Zag Features */}
      {Array.isArray(features) && features.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
            
            {features.map((f: string, fi: number) => {
              const isEven = fi % 2 === 0;
              const imgSrc = supplementaryImages[fi % supplementaryImages.length];

              return (
                <div key={fi} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                  
                  {/* Text Content */}
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-red-50 border border-red-100 text-construction-red shadow-sm">
                      <span className="text-xs font-bold uppercase tracking-wider">Capability 0{fi + 1}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display uppercase tracking-tight leading-tight">
                      {f}
                    </h2>
                  </div>

                  {/* Image Content */}
                  <div className="flex-1 w-full">
                    <div className="relative h-[300px] lg:h-[350px] w-full shadow-2xl">
                      <img 
                        src={imgSrc} 
                        alt={f} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Decorative Element */}
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isEven ? '-left-6' : '-right-6'} w-12 h-24 bg-construction-red hidden lg:block`} />
                    </div>
                  </div>
                  
                </div>
              );
            })}

          </div>
        </section>
      )}

      {/* 3. CTA Section */}
      <section className="bg-slate-50 py-20 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-construction-navy mb-6 font-display uppercase tracking-tight">
            Need Expert Assistance with <span className="text-construction-red">{service.title}</span>?
          </h2>
          <p className="text-slate-600 mb-10 text-lg font-light leading-relaxed">
            Our engineering and management teams are ready to deploy. Reach out today for a comprehensive consultation and project estimate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/contact?service=${encodeURIComponent(service.title)}`}
              className="bg-construction-red hover:bg-red-700 text-white font-bold px-8 py-4 text-sm transition-all uppercase tracking-wider shadow-lg shadow-red-600/20"
            >
              Get a Free Quote
            </Link>
            <a 
              href={`tel:${phone.replace(/\s+/g, '')}`} 
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-8 py-4 text-sm transition-all uppercase tracking-wider flex items-center gap-2 shadow-sm"
            >
              <Icons.Phone className="w-4 h-4 text-construction-red" /> Call Us Directly
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
