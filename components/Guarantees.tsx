import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Guarantees() {
  const guarantees = [
    {
      id: 1,
      title: "In-House Experts, always on your side",
      description: "Your dedicated team – Architect, Site Project Manager, Technical Lead, and Relationship Manager.",
      bg: "bg-[#E85D35]",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80", // Construction team/architects
    },
    {
      id: 2,
      title: "Top-Tier Professional Contractors",
      description: "Every contractor is hand-picked through a rigorous six-stage vetting process to ensure quality.",
      bg: "bg-[#1A5F8C]",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80", // Handshake
    },
    {
      id: 3,
      title: "Built to Last. Backed by 10 Year Warranty",
      description: "Every project is quality checked and protected long after handover to give you peace of mind.",
      bg: "bg-[#0F172A]",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", // House
      hasShield: true,
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 font-display max-w-2xl">
            Guarantees Every Homeowner Deserves
          </h2>
          {/* Optional arrows for a slider look, though we'll use a grid for simplicity like the image implies */}
          <div className="hidden md:flex gap-3">
            <button className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#E85D35] hover:bg-orange-200 transition-colors">
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#E85D35] hover:bg-orange-200 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] md:h-[650px]">
          {guarantees.map((item) => (
            <div 
              key={item.id} 
              className={`relative overflow-hidden rounded-3xl ${item.bg} text-white flex flex-col group cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl`}
            >
              
              {/* Text Content */}
              <div className="p-8 md:p-10 z-20 flex-1">
                <h3 className="text-3xl md:text-[34px] font-bold leading-[1.1] mb-6 font-display">
                  {item.title}
                </h3>
                <p className="text-white/80 text-[15px] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Image Container */}
              <div className="relative h-[250px] md:h-[320px] w-full mt-auto">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Fade overlay so text above is legible if image is tall */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[var(--overlay-color)] opacity-50" style={{'--overlay-color': item.bg.replace('bg-[', '').replace(']', '')} as React.CSSProperties} />
                
                {/* Shield for the 3rd card */}
                {item.hasShield && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-40 h-48 flex items-center justify-center">
                      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                        <path 
                          d="M50 5 L90 20 L90 60 C90 90 50 115 50 115 C50 115 10 90 10 60 L10 20 Z" 
                          fill="none" 
                          stroke="#38BDF8" 
                          strokeWidth="2"
                          className="animate-pulse"
                        />
                        <path 
                          d="M50 8 L87 22 L87 60 C87 88 50 111 50 111 C50 111 13 88 13 60 L13 22 Z" 
                          fill="rgba(15,23,42,0.6)" 
                        />
                      </svg>
                      <span className="absolute text-5xl font-bold text-white font-display">10</span>
                    </div>
                  </div>
                )}
                
                {/* Arrow Button */}
                <div className="absolute bottom-6 right-6 z-30">
                  <div className="w-12 h-12 rounded-full bg-[#fae8e3] text-[#E85D35] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
