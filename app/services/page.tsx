import Link from "next/link";
import { Home, Building2, Factory, Wrench, HardHat, Paintbrush } from "lucide-react";

const services = [
  {
    icon: Home,
    title: "Residential Construction",
    description: "Custom homes, renovations, additions, and remodeling. We bring your dream home to life with quality craftsmanship.",
    features: ["Custom Home Building", "Kitchen & Bath Remodeling", "Home Additions", "Basement Finishing"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85",
    accent: "red",
  },
  {
    icon: Building2,
    title: "Commercial Construction",
    description: "Office buildings, retail spaces, and mixed-use developments tailored to your business needs.",
    features: ["Office Buildings", "Retail Spaces", "Restaurants", "Shopping Centers"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=85",
    accent: "blue",
  },
  {
    icon: Factory,
    title: "Industrial Projects",
    description: "Warehouses, manufacturing facilities, and logistics centers built for efficiency and durability.",
    features: ["Warehouses", "Manufacturing Plants", "Distribution Centers", "Cold Storage"],
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=85",
    accent: "red",
  },
  {
    icon: Wrench,
    title: "Renovation & Restoration",
    description: "Transform existing spaces with modern upgrades while preserving structural integrity.",
    features: ["Building Restoration", "Structural Repairs", "Modern Upgrades", "Historic Preservation"],
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=85",
    accent: "blue",
  },
  {
    icon: HardHat,
    title: "Project Management",
    description: "Comprehensive oversight from planning to completion, ensuring on schedule and on budget delivery.",
    features: ["Budget Planning", "Timeline Management", "Quality Control", "Vendor Coordination"],
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=85",
    accent: "red",
  },
  {
    icon: Paintbrush,
    title: "Design Build Services",
    description: "Integrated design and construction for a seamless project experience from concept to completion.",
    features: ["Architectural Design", "3D Visualization", "Cost Estimation", "Integrated Delivery"],
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=85",
    accent: "blue",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-white pt-36 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-[12px] text-gray-600 font-medium">Full-Service Construction</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5">
            Our <span className="text-blue-600">Services</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
            Comprehensive construction solutions for residential, commercial, and industrial projects.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            const isRed = s.accent === "red";
            return (
              <div key={i} className={`rounded-3xl overflow-hidden border border-gray-100 bg-gray-50/40 grid lg:grid-cols-2 ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
                <div className={`p-10 flex flex-col justify-center ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${isRed ? "bg-red-50" : "bg-blue-50"}`}>
                    <Icon className={`w-5 h-5 ${isRed ? "text-red-600" : "text-blue-600"}`} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{s.title}</h2>
                  <p className="text-gray-500 font-light mb-6 leading-relaxed">{s.description}</p>
                  <div className="space-y-2">
                    {s.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2.5 text-[14px] text-gray-700">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRed ? "bg-red-500" : "bg-blue-500"}`}></span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`h-64 lg:h-auto ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 px-4 bg-white pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-black px-10 py-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your <span className="text-red-500">Project?</span>
            </h2>
            <p className="text-gray-400 font-light mb-8 max-w-lg mx-auto">
              Get a free consultation and quote for your construction needs.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-full text-[14px] transition-colors"
            >
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
