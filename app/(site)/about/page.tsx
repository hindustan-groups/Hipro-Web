import { Award, Users, Target, History, ArrowUpRight, CheckCircle } from "lucide-react";

const team = [
  { name: "Robert Harrison", role: "CEO & Founder",   img: "https://i.pravatar.cc/150?img=11", gradient: "from-red-500 to-orange-500" },
  { name: "Sandra Miles",    role: "Chief Engineer",   img: "https://i.pravatar.cc/150?img=5",  gradient: "from-blue-500 to-indigo-600" },
  { name: "James Carter",    role: "Project Manager",  img: "https://i.pravatar.cc/150?img=12", gradient: "from-red-500 to-rose-600" },
  { name: "Lisa Thompson",   role: "Head of Design",   img: "https://i.pravatar.cc/150?img=9",  gradient: "from-blue-600 to-purple-600" },
  { name: "Mark Davis",      role: "Safety Director",  img: "https://i.pravatar.cc/150?img=15", gradient: "from-red-500 to-pink-600" },
  { name: "Angela Brown",    role: "Client Relations", img: "https://i.pravatar.cc/150?img=25", gradient: "from-blue-500 to-cyan-500" },
];

const values = [
  { icon: Award,        title: "Excellence",  desc: "We hold ourselves to the highest standards in every aspect.", gradient: "from-red-500 to-orange-500",   bg: "from-red-50 to-orange-50" },
  { icon: Users,        title: "Teamwork",    desc: "Collaboration drives outstanding outcomes for every project.", gradient: "from-blue-500 to-indigo-600",  bg: "from-blue-50 to-indigo-50" },
  { icon: Target,       title: "Precision",   desc: "Meticulous attention to detail ensures quality at every phase.", gradient: "from-red-500 to-rose-600",  bg: "from-red-50 to-rose-50" },
  { icon: History,      title: "Reliability", desc: "We honor our commitments — on time, on budget, every time.", gradient: "from-blue-600 to-purple-600", bg: "from-blue-50 to-purple-50" },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative bg-surface pt-36 pb-24 px-4 overflow-hidden grid-bg">
        {/* Glow blobs */}
        <div className="blob w-[500px] h-[500px] bg-blue-200 -top-20 right-0 animate-glow-pulse" />
        <div className="blob w-[400px] h-[400px] bg-red-100 bottom-0 left-0 animate-glow-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-2 mb-6 shadow-3d-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[12px] text-gray-600 font-medium">Est. 1999 · 25+ Years of Excellence</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-5 font-display animate-fade-up" style={{ animationDelay: "0.15s" }}>
            About{" "}
            <span className="text-gradient-red">Hindustan</span>{" "}
            <span className="text-gradient-blue">Projects</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-light animate-blur-in" style={{ animationDelay: "0.3s" }}>
            25 years of building excellence, trust, and lasting structures across the region.
          </p>

          {/* 3D floating stat pills */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {[
              { label: "500+ Projects",    gradient: "from-red-500 to-orange-500" },
              { label: "200+ Experts",     gradient: "from-blue-500 to-indigo-600" },
              { label: "25+ Years",        gradient: "from-red-500 to-rose-600" },
              { label: "98% Satisfaction", gradient: "from-blue-600 to-purple-600" },
            ].map((p, i) => (
              <div
                key={i}
                className="glass-light rounded-full px-5 py-2.5 shadow-3d-sm card-3d animate-slide-up"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <span className={`text-[13px] font-bold bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent`}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="blob w-96 h-96 bg-indigo-100 top-0 right-0" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-1.5 mb-5 shadow-3d-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[12px] text-gray-600 font-medium uppercase tracking-widest">Our Story</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-display">
                Building Dreams
                <br />
                <span className="text-gradient-red">Since 1999</span>
              </h2>
              <div className="space-y-4 text-[15px] text-gray-600 font-light leading-relaxed">
                <p>
                  Founded in 1999, Hindustan Projects began as a small residential contractor in
                  the heart of the city. Through decades of hard work, integrity, and dedication
                  to quality, we have grown into one of the region's most trusted construction firms.
                </p>
                <p>
                  We have successfully completed over 500 projects ranging from single-family homes
                  to large commercial complexes and industrial facilities. Every project receives
                  the same level of care and professionalism.
                </p>
                <p>
                  Our team of 200+ skilled professionals bring expertise, passion, and precision
                  to every build — ensuring we deliver on time, within budget, and beyond expectations.
                </p>
              </div>

              {/* Checklist */}
              <div className="mt-6 space-y-2">
                {["ISO Certified Construction", "Award-Winning Team", "Pan-India Operations", "Zero Compromise on Safety"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[14px] text-gray-700">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${i % 2 === 0 ? "from-red-500 to-orange-500" : "from-blue-500 to-indigo-600"}`}>
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* 3D image card */}
            <div className="relative perspective-1000">
              <div className="rounded-3xl overflow-hidden shadow-3d-xl border border-white card-3d">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=85"
                  alt="Construction team"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent" />
              </div>
              {/* Floating badge on image */}
              <div className="absolute -bottom-5 -left-5 glass-light rounded-2xl p-4 shadow-3d-lg card-3d">
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Founded</p>
                <p className="text-3xl font-bold font-display text-gradient-blue">1999</p>
              </div>
              <div className="absolute -top-5 -right-5 glass-light rounded-2xl p-4 shadow-3d-lg card-3d">
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Projects</p>
                <p className="text-3xl font-bold font-display text-gradient-red">500+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────── */}
      <section className="py-24 bg-surface relative overflow-hidden grid-bg">
        <div className="blob w-96 h-96 bg-red-100 bottom-0 right-0" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-1.5 mb-4 shadow-3d-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[12px] text-gray-600 font-medium uppercase tracking-widest">What Drives Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display">Our Core Values</h2>
            <p className="text-gray-500 mt-3 font-light max-w-xl mx-auto">
              The principles that guide every project and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="group relative p-7 rounded-3xl bg-white border border-gray-100 hover:border-gray-200 shadow-3d-sm hover:shadow-3d-lg card-3d transition-all duration-300 overflow-hidden text-center"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${v.bg} rounded-3xl`} />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-4 shadow-3d-sm group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-2 font-display">{v.title}</h3>
                    <p className="text-[13px] text-gray-500 font-light leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="blob w-96 h-96 bg-blue-100 top-0 left-0" />
        <div className="blob w-80 h-80 bg-red-100 bottom-0 right-0" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-light rounded-full px-4 py-1.5 mb-4 shadow-3d-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[12px] text-gray-600 font-medium uppercase tracking-widest">Leadership</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-display">Meet Our Team</h2>
            <p className="text-gray-500 mt-3 font-light max-w-xl mx-auto">
              Experienced professionals committed to building your vision.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((m, i) => (
              <div
                key={i}
                className="group relative p-7 rounded-3xl bg-white border border-gray-100 hover:border-gray-200 shadow-3d-sm hover:shadow-3d-xl card-3d transition-all duration-300 overflow-hidden text-center"
              >
                {/* Hover gradient bg */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${m.gradient.replace("from-", "from-").replace("to-", "to-")}/10 rounded-3xl`} style={{ background: `linear-gradient(135deg, transparent, rgba(0,0,0,0.02))` }} />

                <div className="relative z-10">
                  {/* Avatar with gradient ring */}
                  <div className="relative inline-block mb-4">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${m.gradient} p-0.5 shadow-3d-md`}>
                      <img
                        src={m.img}
                        alt={m.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                      />
                    </div>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 font-display">{m.name}</h3>
                  <p className={`text-[13px] font-semibold mt-1 bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent`}>
                    {m.role}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <button className={`inline-flex items-center gap-1 text-[12px] font-medium bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity`}>
                      View Profile <ArrowUpRight className="w-3 h-3 text-blue-500" />
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
