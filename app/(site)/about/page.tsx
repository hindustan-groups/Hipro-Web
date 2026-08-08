import { Award, Users, Target, History, ArrowUpRight, CheckCircle, ShieldCheck } from "lucide-react";
import { findAll } from "@/lib/db";
import type { TeamMember } from "@/lib/types";

const values = [
  { icon: Award, title: "Excellence", desc: "Uncompromising quality standards across every square foot of engineering." },
  { icon: Users, title: "Teamwork", desc: "Seamless cross-functional coordination between architects, engineers, and site managers." },
  { icon: Target, title: "Precision", desc: "Rigorous attention to structural accuracy, safety compliance, and finishing." },
  { icon: History, title: "Reliability", desc: "Honoring timelines and budgets with guaranteed project handover metrics." },
];

export default async function AboutPage() {
  const allTeam = await findAll<TeamMember>("team");
  const team = allTeam.filter(m => m.active !== false).sort((a, b) => (a.order || 99) - (b.order || 99));

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative bg-white pt-36 pb-24 px-4 overflow-hidden border-b border-slate-200/80">
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-slate-100 border border-slate-200 text-construction-navy mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Est. 1999 · 25+ Years of Engineering Excellence</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-5 font-display uppercase tracking-tight">
            About <span className="text-blue-900">Hindustan</span> <span className="text-construction-red">Projects</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Building sustainable infrastructure, landmark commercial developments, and luxury residences across India with uncompromising integrity.
          </p>

          {/* Stat Pills */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {[
              { label: "500+ Landmark Builds" },
              { label: "200+ Senior Engineers" },
              { label: "25+ Years Experience" },
              { label: "98.5% Client Satisfaction" },
            ].map((p, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-none px-5 py-2.5 shadow-md shadow-slate-900/5 font-bold text-xs uppercase tracking-wider text-black"
              >
                <span className="text-construction-red mr-1.5">•</span>
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────── */}
      <section id="history" className="py-24 bg-white relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-slate-100 border border-slate-200 text-construction-navy mb-5">
                <span className="w-2 h-2 rounded-none bg-construction-navy animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Our Heritage</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-black mb-6 font-display uppercase tracking-tight leading-tight">
                Building Infrastructure <br /><span className="text-construction-red">Since 1999</span>
              </h2>
              <div className="space-y-4 text-base text-slate-600 font-light leading-relaxed">
                <p>
                  Founded in 1999, Hindustan Projects began with a vision to revolutionize urban infrastructure and civil engineering. Over two decades of relentless commitment to craftsmanship has earned us a reputation as one of the most trusted construction firms in the nation.
                </p>
                <p>
                  We have successfully executed over 500 high-impact projects ranging from luxury residential communities to multi-story commercial towers and state-of-the-art industrial logistics hubs.
                </p>
                <p>
                  Our multidisciplinary team of 200+ structural engineers, chartered architects, and project directors ensures every project is delivered on schedule, within budget, and to international safety benchmarks.
                </p>
              </div>

              {/* Checklist */}
              <div className="mt-8 space-y-3">
                {["ISO 9001:2015 Certified Operations", "National Excellence Awards Winner", "Zero-Accident Safety Protocol", "Comprehensive 10-Year Warranty"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-semibold text-black">
                    <div className="w-5 h-5 rounded-none flex items-center justify-center bg-slate-100 text-construction-navy border border-slate-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Image card */}
            <div className="relative">
              <div className="rounded-none overflow-hidden shadow-2xl border border-slate-200/80">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=85"
                  alt="Construction site team"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              {/* Floating Badges */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-none p-5 shadow-xl border border-slate-200/80">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ESTABLISHED</p>
                <p className="text-3xl font-bold font-display text-black">1999</p>
              </div>
              <div className="absolute -top-5 -right-5 bg-white rounded-none p-5 shadow-xl border border-slate-200/80">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PROJECTS HANDED OVER</p>
                <p className="text-3xl font-bold font-display text-construction-red">500+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-slate-100 border border-slate-200 text-construction-navy mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Principles</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight">Our Core Values</h2>
            <p className="text-slate-600 mt-3 font-light text-base">
              The foundational pillars guiding every blueprint, site inspection, and client relationship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="group relative p-8 rounded-none bg-white border border-slate-200/80 hover:border-construction-navy/40 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 text-center hover:-translate-y-1"
                >
                  <div className="w-12 h-12 mx-auto rounded-none bg-slate-100 border border-slate-200 text-construction-navy flex items-center justify-center mb-5 group-hover:bg-construction-navy group-hover:text-white transition-all shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2 font-display uppercase tracking-tight">{v.title}</h3>
                  <p className="text-xs text-slate-600 font-light leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────── */}
      <section id="team" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-slate-100 border border-slate-200 text-construction-navy mb-4">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Executive Leadership</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight">Meet Our Leadership</h2>
            <p className="text-slate-600 mt-3 font-light text-base">
              Seasoned industry veterans driving structural innovation and operational excellence.
            </p>
          </div>

          {team.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16 border border-slate-200/80 bg-white p-8 md:p-12 shadow-md">
              <div className="relative h-[400px] lg:h-[500px] w-full rounded-none overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
                <img src={team[0].img} alt={team[0].name} className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 text-construction-red text-[10px] font-bold uppercase tracking-widest mb-4">
                  Founder & CEO
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-black font-display uppercase tracking-tight mb-2">{team[0].name}</h3>
                <p className="text-construction-navy font-bold text-sm uppercase tracking-wider mb-6">{team[0].role}</p>
                <div className="text-slate-600 font-light leading-relaxed space-y-4 mb-8">
                  {team[0].bio ? (
                    team[0].bio.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))
                  ) : (
                    <p>Visionary leader committed to excellence in infrastructure and engineering.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.slice(1).map((m, i) => (
              <div
                key={i}
                className="group relative h-[440px] overflow-hidden rounded-none border border-slate-200/50 bg-slate-900"
              >
                <img
                  src={m.img}
                  alt={m.name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-500" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-10 h-[2px] bg-construction-red mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                  <h3 className="text-2xl font-bold text-white font-display uppercase tracking-tight">{m.name}</h3>
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-1">
                    {m.role}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <button className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-construction-red transition-colors uppercase tracking-wider">
                      Read Biography <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
