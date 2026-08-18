"use client";

import Link from "next/link";
import type { Service } from "@/lib/types";

const defaultServices: Service[] = [
  {
    id: "1",
    title: "Civil & Structural Engineering",
    description: "End-to-end heavy infrastructure and RCC structural execution built to international safety standards.",
    category: "Design & Planning",
    icon: "HardHat",
    features: [],
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=1200&q=80",
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Commercial & High-Rise Towers",
    description: "Iconic commercial spaces, retail complexes, and corporate headquarters engineered for modern work.",
    category: "Commercial Development",
    icon: "Building",
    features: [],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function Services({ services = [] }: { services?: Service[] }) {
  const list = services && services.length > 0 ? services : defaultServices;
  const displayServices = list.slice(0, 4);

  return (
    <section id="section-services" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black font-display tracking-tight mb-4">
            Our <span className="font-serif italic font-normal text-construction-red">Construction</span> Services
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-light">
            Expertise in delivering top-notch construction with precision, quality, and transparency.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {displayServices.map((service, index) => {
            const slug = (service.title || "").toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
            const imageUrl = service.image || "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=1200&q=80";
            
            return (
              <div 
                key={index}
                className="group relative h-[320px] md:h-[380px] w-full rounded-[2rem] overflow-hidden shadow-lg shadow-slate-900/10 bg-slate-900"
              >
                {/* Background Image */}
                <img 
                  src={imageUrl} 
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300" />
                
                {/* Content Box */}
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
                  
                  <div className="flex-1">
                    <h3 className="text-3xl md:text-4xl font-bold text-white font-display mb-3 leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-slate-200 font-light line-clamp-2 md:text-lg">
                      {service.description}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/services/${slug}`}
                    className="inline-flex shrink-0 items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-orange-900/30 hover:shadow-orange-900/50"
                  >
                    Explore {(service.title || "Service").split(' ')[0]}
                  </Link>

                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
          <Link 
            href="/services" 
            className="inline-flex items-center justify-center gap-3 bg-white border border-slate-300 text-black font-bold px-10 py-4 rounded-xl text-[15px] hover:bg-construction-navy hover:border-construction-navy hover:text-white transition-all shadow-sm"
          >
            View All Services
          </Link>
        </div>

      </div>
    </section>
  );
}
