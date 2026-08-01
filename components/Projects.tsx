import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

const projects = [
  { image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", title: "Skyline Office Tower", category: "Commercial", location: "Downtown", gradient: "from-blue-600 to-indigo-600" },
  { image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", title: "Riverside Luxury Residences", category: "Residential", location: "Riverside Park", gradient: "from-red-500 to-rose-600" },
  { image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80", title: "TechHub Innovation Center", category: "Industrial", location: "Tech Valley", gradient: "from-blue-500 to-cyan-600" },
];

export default function Projects() {
  return (
    <section id="section-projects" className="py-28 bg-white relative overflow-hidden">
      <div className="blob w-96 h-96 bg-indigo-100 top-0 right-0" />
      <div className="blob w-80 h-80 bg-red-100 bottom-0 left-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-1.5 mb-4 shadow-3d-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[12px] text-gray-600 font-medium uppercase tracking-widest">Our Work</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">Featured Projects</h2>
          </div>
          <Link href="/projects" className="self-start md:self-auto inline-flex items-center gap-1 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
            View all projects <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <div
              key={i}
              className="group rounded-3xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 shadow-3d-sm hover:shadow-3d-xl card-3d transition-all duration-500"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-60">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className={`bg-gradient-to-r ${p.gradient} text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-3d-sm`}>
                    {p.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-[16px] font-bold text-gray-900 mb-2 font-display">{p.title}</h3>
                <div className="flex items-center gap-1 text-[12px] text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {p.location}
                </div>
                <div className={`mt-4 inline-flex items-center gap-1 text-[13px] font-semibold bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent`}>
                  View Project <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
