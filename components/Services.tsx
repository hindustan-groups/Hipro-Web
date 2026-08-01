import Link from "next/link";
import { Home, Building2, Factory, Wrench, HardHat, Paintbrush, ArrowUpRight } from "lucide-react";

const services = [
  { icon: Home,       title: "Residential",        desc: "Custom homes, renovations, and remodeling for your dream living space.", gradient: "from-red-500 to-orange-500",   bg: "from-red-50 to-orange-50",   border: "hover:border-red-200" },
  { icon: Building2,  title: "Commercial",          desc: "Office buildings, retail spaces, and mixed-use developments.",          gradient: "from-blue-500 to-indigo-600",  bg: "from-blue-50 to-indigo-50",  border: "hover:border-blue-200" },
  { icon: Factory,    title: "Industrial",          desc: "Warehouses, manufacturing facilities, and logistics centers.",          gradient: "from-red-500 to-rose-600",    bg: "from-red-50 to-rose-50",     border: "hover:border-red-200" },
  { icon: Wrench,     title: "Renovation",          desc: "Transform existing spaces with modern upgrades and improvements.",      gradient: "from-blue-600 to-purple-600", bg: "from-blue-50 to-purple-50",  border: "hover:border-blue-200" },
  { icon: HardHat,    title: "Project Management",  desc: "Full oversight keeping every project on schedule and budget.",          gradient: "from-red-500 to-pink-600",    bg: "from-red-50 to-pink-50",     border: "hover:border-red-200" },
  { icon: Paintbrush, title: "Design Build",        desc: "Integrated design and construction from concept to completion.",        gradient: "from-blue-500 to-cyan-500",   bg: "from-blue-50 to-cyan-50",    border: "hover:border-blue-200" },
];

export default function Services() {
  return (
    <section id="section-services" className="py-28 bg-surface relative overflow-hidden grid-bg">
      {/* Blobs */}
      <div className="blob w-96 h-96 bg-blue-200 top-20 right-0" />
      <div className="blob w-80 h-80 bg-red-100 bottom-0 left-10" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-1.5 mb-4 shadow-3d-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[12px] text-gray-600 font-medium uppercase tracking-widest">What We Do</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">Our Services</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto font-light">Comprehensive construction solutions tailored to your every need.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`group relative p-7 rounded-3xl bg-white border border-gray-100 ${s.border} shadow-3d-sm hover:shadow-3d-lg card-3d transition-all duration-300 overflow-hidden`}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${s.bg} rounded-3xl`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-5 shadow-3d-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900 mb-2 font-display">{s.title}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed font-light mb-5">{s.desc}</p>
                  <div className={`inline-flex items-center gap-1 text-[13px] font-semibold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                    Learn more <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3.5 rounded-full text-[14px] transition-all shadow-glow-blue hover:shadow-3d-lg"
          >
            View All Services <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
