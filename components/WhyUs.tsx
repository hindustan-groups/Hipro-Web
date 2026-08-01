import { Shield, Clock, Users, Award, CheckCircle, Wrench } from "lucide-react";

const features = [
  { icon: Shield,       title: "Licensed & Insured",  desc: "Fully licensed with comprehensive insurance for your peace of mind.",   gradient: "from-red-500 to-orange-500",   bg: "from-red-50 to-orange-50" },
  { icon: Clock,        title: "On-Time Delivery",    desc: "We respect your schedule and consistently deliver projects on time.",    gradient: "from-blue-500 to-indigo-600",  bg: "from-blue-50 to-indigo-50" },
  { icon: Users,        title: "Expert Team",         desc: "200+ skilled professionals with decades of combined experience.",        gradient: "from-red-500 to-rose-600",    bg: "from-red-50 to-rose-50" },
  { icon: Award,        title: "Award Winning",       desc: "Recognized for excellence in construction quality and service.",         gradient: "from-blue-600 to-purple-600", bg: "from-blue-50 to-purple-50" },
  { icon: CheckCircle,  title: "Quality Guarantee",   desc: "We stand behind every project with comprehensive warranties.",           gradient: "from-red-500 to-pink-600",    bg: "from-red-50 to-pink-50" },
  { icon: Wrench,       title: "Full Service",        desc: "From design to completion, we handle every aspect of your build.",       gradient: "from-blue-500 to-cyan-500",   bg: "from-blue-50 to-cyan-50" },
];

export default function WhyUs() {
  return (
    <section id="section-whyus" className="py-28 bg-surface relative overflow-hidden">
      <div className="blob w-[500px] h-[500px] bg-blue-100 top-0 left-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-1.5 mb-4 shadow-3d-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[12px] text-gray-600 font-medium uppercase tracking-widest">Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">Built on Trust &amp; Excellence</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto font-light">
            Every project is a promise — delivered with precision, integrity, and care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`group relative p-7 rounded-3xl bg-white border border-gray-100 hover:border-gray-200 shadow-3d-sm hover:shadow-3d-lg card-3d transition-all duration-300 overflow-hidden`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${f.bg} rounded-3xl`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-3d-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 mb-2 font-display">{f.title}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed font-light">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
