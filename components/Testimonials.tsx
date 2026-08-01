import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Michael Johnson",
    role: "Homeowner",
    image: "https://i.pravatar.cc/150?img=12",
    text: "Hindustan Projects transformed our outdated house into a stunning modern home. Professional, flawless, and two weeks ahead of schedule!",
    gradient: "from-red-500 to-orange-500",
    bg: "from-red-50/60 to-orange-50/40",
  },
  {
    name: "Sarah Williams",
    role: "Business Owner",
    image: "https://i.pravatar.cc/150?img=5",
    text: "From consultation to handover, Hindustan Projects exceeded every expectation. Our office was completed on budget — the quality is outstanding.",
    gradient: "from-blue-500 to-indigo-600",
    bg: "from-blue-50/60 to-indigo-50/40",
  },
  {
    name: "David Chen",
    role: "Property Developer",
    image: "https://i.pravatar.cc/150?img=7",
    text: "I've worked with many contractors, but Hindustan Projects is in a class of their own. Unmatched attention to detail and execution.",
    gradient: "from-purple-500 to-blue-600",
    bg: "from-purple-50/60 to-blue-50/40",
  },
];

export default function Testimonials() {
  return (
    <section id="section-testimonials" className="py-28 bg-white relative overflow-hidden">
      <div className="blob w-96 h-96 bg-purple-100 top-0 right-0" />
      <div className="blob w-80 h-80 bg-blue-100 bottom-0 left-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-1.5 mb-4 shadow-3d-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[12px] text-gray-600 font-medium uppercase tracking-widest">Client Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">What Our Clients Say</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`relative p-7 rounded-3xl bg-gradient-to-br ${t.bg} border border-white shadow-3d-md card-3d hover:shadow-3d-xl transition-all duration-300 overflow-hidden`}
            >
              {/* Quote icon */}
              <div className={`absolute top-5 right-5 w-10 h-10 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center opacity-20`}>
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} className={`w-4 h-4 fill-current ${si < 3 ? "text-red-500" : "text-blue-500"}`} />
                ))}
              </div>

              <p className="text-[14px] text-gray-700 leading-relaxed font-light mb-6">"{t.text}"</p>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={t.image} alt={t.name} className="w-11 h-11 rounded-full object-cover shadow-3d-sm" />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${t.gradient} border-2 border-white`} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-900 font-display">{t.name}</p>
                  <p className={`text-[12px] font-medium bg-gradient-to-r ${t.gradient} bg-clip-text text-transparent`}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
