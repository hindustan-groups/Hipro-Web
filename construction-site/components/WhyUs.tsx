import { Shield, Clock, Users, Award, CheckCircle, Wrench, Sparkles } from "lucide-react";

const features = [
  { icon: Shield,       title: "Licensed & Insured",  desc: "Fully compliant with international safety standards and comprehensive insurance coverage." },
  { icon: Clock,        title: "On-Time Delivery",    desc: "Rigorous milestone tracking and project scheduling ensuring guaranteed handover timelines." },
  { icon: Users,        title: "Expert Engineering Team", desc: "200+ seasoned engineers, architects, and site directors with decades of combined experience." },
  { icon: Award,        title: "Award-Winning Quality", desc: "Recognized for structural excellence, safety compliance, and innovation across India." },
];

export default function WhyUs() {
  return (
    <section id="section-whyus" className="py-24 bg-slate-50 relative border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image Composition */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative h-[600px] w-full rounded-none overflow-hidden shadow-2xl border border-slate-200/80 z-10">
              <img 
                src="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?w=800&q=85" 
                alt="Construction Management" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-none">
                  <h4 className="text-white font-bold font-display uppercase tracking-wider text-xl mb-1">Building The Future</h4>
                  <p className="text-slate-300 text-sm font-light">Over two decades of defining cityscapes.</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-construction-red z-0" />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-slate-200 z-0 border border-slate-300" />
            
            {/* Floating Stats */}
            <div className="absolute top-12 -right-8 z-20 bg-white shadow-xl border border-slate-200/80 p-5 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Wrench className="w-6 h-6 text-construction-navy" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">100%</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Turnkey Execution</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content & List */}
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-white border border-slate-200 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-construction-navy" />
              <span className="text-[11px] font-bold text-construction-navy uppercase tracking-wider">Why Hindustan Projects</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight mb-6 leading-[1.1]">
              Built On Trust &amp; <br className="hidden md:block" />
              <span className="text-construction-red">Engineering Excellence</span>
            </h2>
            
            <p className="text-slate-600 text-base md:text-lg font-light leading-relaxed mb-10 border-l-2 border-slate-300 pl-4">
              We don&apos;t just construct buildings; we engineer landmark residential, commercial, and industrial infrastructure with uncompromising safety and precision.
            </p>

            {/* Features List (No Cards) */}
            <div className="space-y-8">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex gap-5 group">
                    <div className="shrink-0 mt-1">
                      <div className="w-12 h-12 rounded-none bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-construction-navy group-hover:border-construction-navy group-hover:bg-blue-50 transition-all duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1.5 font-display uppercase tracking-tight group-hover:text-construction-red transition-colors">
                        {f.title}
                      </h3>
                      <p className="text-slate-600 text-[14px] leading-relaxed font-light">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-900 font-bold uppercase tracking-wider text-sm">10-Year Guarantee</p>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Comprehensive structural warranty</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
