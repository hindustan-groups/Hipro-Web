import { MapPin, Calendar } from "lucide-react";

const projects = [
  { title: "Skyline Office Tower", category: "Commercial", location: "Downtown District", date: "2024", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80", desc: "15-story modern office complex with sustainable design features." },
  { title: "Riverside Luxury Residences", category: "Residential", location: "Riverside Park", date: "2023", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80", desc: "Premium apartment complex with waterfront views and amenities." },
  { title: "TechHub Innovation Center", category: "Industrial", location: "Tech Valley", date: "2024", image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=700&q=80", desc: "State-of-the-art technology and research facility." },
  { title: "Oakwood Shopping Plaza", category: "Commercial", location: "Oakwood District", date: "2023", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700&q=80", desc: "Modern retail center with 50+ stores and dining." },
  { title: "Heritage Home Restoration", category: "Residential", location: "Historic District", date: "2023", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80", desc: "Complete restoration of a Victorian-era mansion." },
  { title: "Green Valley Logistics Hub", category: "Industrial", location: "Green Valley", date: "2024", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&q=80", desc: "500,000 sq ft warehouse and distribution center." },
  { title: "Mountain View School", category: "Commercial", location: "Mountain View", date: "2022", image: "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=700&q=80", desc: "Modern educational facility for 800 students." },
  { title: "Lakeside Custom Estate", category: "Residential", location: "Lake District", date: "2023", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=700&q=80", desc: "7,000 sq ft luxury home with lake views." },
  { title: "Metro Hospital Expansion", category: "Commercial", location: "Metro Center", date: "2024", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&q=80", desc: "50,000 sq ft medical facility addition." },
];

const categoryColor: Record<string, string> = {
  Commercial: "text-blue-600 bg-blue-50",
  Residential: "text-red-600 bg-red-50",
  Industrial: "text-gray-700 bg-gray-100",
};

export default function ProjectsPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-white pt-36 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-[12px] text-gray-600 font-medium">500+ Completed Projects</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5">
            Our <span className="text-red-600">Projects</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
            A showcase of our best work across residential, commercial, and industrial sectors.
          </p>
        </div>
      </section>

      {/* Filter row */}
      <section className="bg-white pb-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2">
          {["All", "Residential", "Commercial", "Industrial"].map((cat) => (
            <button
              key={cat}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold border transition-colors ${
                cat === "All"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="pb-24 bg-white px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
            >
              <div className="overflow-hidden h-52">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className={`inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 ${categoryColor[p.category]}`}>
                  {p.category}
                </span>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">{p.title}</h3>
                <p className="text-[13px] text-gray-500 font-light mb-3">{p.desc}</p>
                <div className="flex items-center gap-4 text-[12px] text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 px-4 bg-white pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-black px-10 py-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want to See Your Project <span className="text-blue-400">Here?</span>
            </h2>
            <p className="text-gray-400 font-light mb-8 max-w-lg mx-auto">
              Let's discuss how we can bring your vision to life.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3.5 rounded-full text-[14px] transition-colors"
            >
              Start Your Project
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
