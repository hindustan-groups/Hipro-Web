"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Building2, Factory, Wrench, HardHat, Paintbrush, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const services = [
  { 
    icon: Home,       
    title: "Residential Construction",        
    desc: "From custom-built dream homes to extensive renovations and remodeling, we create living spaces that reflect your lifestyle. Our residential team ensures every detail is perfect, prioritizing comfort, aesthetics, and structural integrity.", 
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  { 
    icon: Building2,  
    title: "Commercial Development",          
    desc: "We build state-of-the-class office buildings, retail spaces, and mixed-use developments. Our commercial projects are designed for functionality, energy efficiency, and modern business needs, delivered strictly on schedule.",          
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  { 
    icon: Factory,    
    title: "Industrial Facilities",          
    desc: "Specialized construction for warehouses, manufacturing facilities, and logistics centers. We understand the complex requirements of heavy-duty flooring, specialized ventilation, and large-scale industrial infrastructure.",          
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80",
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  { 
    icon: Wrench,     
    title: "Renovation & Remodeling",          
    desc: "Transform your existing spaces with modern upgrades and improvements. We handle structural changes, aesthetic overhauls, and complete interior redesigns with minimal disruption to your daily life.",      
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  { 
    icon: HardHat,    
    title: "Project Management",  
    desc: "Full oversight keeping every project on schedule and on budget. Our expert project managers coordinate all trades, handle permitting, and provide transparent, real-time updates from groundbreaking to final handover.",          
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  { 
    icon: Paintbrush, 
    title: "Design Build",        
    desc: "Integrated design and construction from concept to completion. By combining architectural design and construction under one contract, we streamline communication and accelerate project delivery.",        
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
];

export default function Services() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="section-services" className="py-28 bg-white relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute right-0 top-1/4 w-[600px] h-[600px] bg-gradient-to-l from-blue-50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#E85D35]/10 text-[#E85D35] rounded-full px-4 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E85D35]" />
              <span className="text-[12px] font-semibold uppercase tracking-widest">Our Expertise</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">Specialized Services</h2>
          </div>
          
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-[#1A5F8C] transition-colors"
          >
            Explore all services 
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#1A5F8C] transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Interactive Split Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Side: Service List */}
          <div className="w-full lg:w-5/12 flex flex-col gap-2">
            {services.map((service, index) => {
              const isActive = index === activeIndex;
              const Icon = service.icon;
              
              return (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`text-left w-full group relative p-5 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? "bg-white shadow-3d-md border border-gray-100 z-10 scale-[1.02]" 
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      isActive ? service.bg + " " + service.color : "bg-gray-100 text-gray-500 group-hover:text-gray-700"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-[19px] font-bold font-display transition-colors ${
                        isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900"
                      }`}>
                        {service.title}
                      </h3>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Side: Service Details & Image */}
          <div className="w-full lg:w-7/12 relative min-h-[500px]">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`absolute inset-0 flex flex-col transition-all duration-500 ease-in-out ${
                  index === activeIndex 
                    ? "opacity-100 translate-x-0 pointer-events-auto z-10" 
                    : "opacity-0 translate-x-12 pointer-events-none z-0"
                }`}
              >
                {/* Large Image Showcase */}
                <div className="relative w-full h-[350px] rounded-3xl overflow-hidden mb-8 shadow-3d-lg group">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  
                  {/* Bottom Text in Image */}
                  <div className="absolute bottom-6 left-8 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${service.bg} flex items-center justify-center`}>
                      <service.icon className={`w-5 h-5 ${service.color}`} />
                    </div>
                    <span className="text-white font-display font-semibold text-xl">{service.title}</span>
                  </div>
                </div>

                {/* Description and CTA */}
                <div className="pr-4">
                  <p className="text-[17px] text-gray-600 leading-relaxed font-light mb-8">
                    {service.desc}
                  </p>
                  <Link 
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3.5 rounded-full text-[15px] transition-all shadow-3d-sm"
                  >
                    Discuss your project
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
