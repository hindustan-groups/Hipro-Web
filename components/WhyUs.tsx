import { Shield, Clock, Users, Award, CheckCircle, Wrench, Sparkles } from "lucide-react";

const features = [
  { icon: Shield,       title: "Licensed & Insured",  desc: "Fully compliant with international safety standards and comprehensive insurance coverage." },
  { icon: Clock,        title: "On-Time Delivery",    desc: "Rigorous milestone tracking and project scheduling ensuring guaranteed handover timelines." },
  { icon: Users,        title: "Expert Engineering Team", desc: "200+ seasoned engineers, architects, and site directors with decades of combined experience." },
  { icon: Award,        title: "Award-Winning Quality", desc: "Recognized for structural excellence, safety compliance, and innovation across India." },
  { icon: CheckCircle,  title: "10-Year Guarantee",   desc: "Complete structural warranty and post-occupancy inspection support on every project." },
  { icon: Wrench,       title: "Turnkey Solutions",   desc: "End-to-end execution from architectural master planning to final interior fit-out." },
];

export default function WhyUs() {
  return (
    <section id="section-whyus" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-slate-100 border border-slate-200 mb-4">
            <Sparkles className="w-4 h-4 text-construction-navy" />
            <span className="text-xs font-bold text-construction-navy uppercase tracking-wider">Why Hindustan Projects</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight mb-4">
            Built On Trust &amp; Engineering Excellence
          </h2>
          <p className="text-slate-600 text-base md:text-lg font-light leading-relaxed">
            Delivering landmark residential, commercial, and industrial infrastructure with uncompromising safety and precision.
          </p>
        </div>

        {/* Features Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative p-8 rounded-none bg-white border border-slate-200/80 hover:border-slate-300 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-none bg-slate-50 border border-slate-200 text-construction-navy flex items-center justify-center mb-6 group-hover:bg-construction-navy group-hover:text-white transition-all duration-300 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3 font-display uppercase tracking-tight group-hover:text-construction-navy transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
