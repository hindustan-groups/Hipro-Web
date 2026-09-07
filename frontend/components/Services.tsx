"use client";

import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/lib/types";
import { cleanServiceTitle, cleanContentTypos } from "@/lib/companyData";
import { isOptimizableImage } from "@/lib/imageUtils";

const defaultServices: Service[] = [
  {
    id: "1",
    title: "Architecture & Planning",
    description: "Integrated architectural layouts, structural design, and 3D master planning tailored for modern construction.",
    category: "Design & Planning",
    icon: "Compass",
    features: [],
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=75",
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Professional Construction Services",
    description: "Turnkey civil construction, heavy structural RCC work, and durable residential and commercial execution.",
    category: "Civil Construction",
    icon: "HardHat",
    features: [],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=75",
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    title: "Surveying & Site Measurements",
    description: "High-precision digital land surveying, contour mapping, and boundary demarcations using advanced equipment.",
    category: "Site Engineering",
    icon: "Ruler",
    features: [],
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=75",
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    title: "Interior & Exterior Design",
    description: "Premium architectural interiors, structural facade treatments, and turnkey aesthetic finishes for luxury spaces.",
    category: "Architecture & Interiors",
    icon: "Paintbrush",
    features: [],
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=75",
    order: 4,
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
            const cleanTitle = cleanServiceTitle(service.title);
            const cleanDesc = cleanContentTypos(service.description);
            const slug = (cleanTitle || "").toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
            const imageUrl = service.image || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=75";
            
            return (
              <div 
                key={index}
                className="group relative h-[320px] md:h-[380px] w-full rounded-[2rem] overflow-hidden shadow-lg shadow-slate-900/10 bg-slate-900"
              >
                {/* Background Image */}
                <Image 
                  src={imageUrl} 
                  alt={cleanTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={!isOptimizableImage(imageUrl)}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300" />
                
                {/* Content Box */}
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
                  
                  <div className="flex-1">
                    <h3 className="text-3xl md:text-4xl font-bold text-white font-display mb-3 leading-tight">
                      {cleanTitle}
                    </h3>
                    <p className="text-slate-200 font-light line-clamp-2 md:text-lg">
                      {cleanDesc}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/services/${slug}`}
                    className="inline-flex shrink-0 items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-orange-900/30 hover:shadow-orange-900/50"
                  >
                    Explore {(cleanTitle || "Service").split(' ')[0]}
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
