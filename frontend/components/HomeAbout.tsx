import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, HardHat, Building2, MapPin } from "lucide-react";

interface HomeAboutProps {
  pageContent?: {
    homeAboutTag?: string;
    homeAboutHeading?: string;
    homeAboutText?: string;
    [key: string]: any;
  };
}

export default function HomeAbout({ pageContent = {} }: HomeAboutProps) {
  const badgeText = pageContent.homeAboutTag || "About Hindustan Projects · Est. 2019";
  const heading = pageContent.homeAboutHeading || "Engineering Landmarks. Building Trust in Rajasthan.";
  const description = pageContent.homeAboutText || 
    "Founded in 2019 in Bhilwara, Rajasthan, Hindustan Projects (HiPRO) is an engineering, construction, and infrastructure firm. From architectural planning and precise surveying to turnkey civil construction and infrastructure execution, Hindustan Projects delivers integrated solutions designed around quality, practical execution, and long-term value.";

  const corePillars = [
    {
      icon: HardHat,
      title: pageContent.homeAboutBullet1Title || pageContent.homeAboutBullet1 || "Engineering & Construction",
      desc: pageContent.homeAboutBullet1Desc || "Robust structural execution, heavy civil engineering, and durable residential and commercial developments built to code.",
    },
    {
      icon: ShieldCheck,
      title: pageContent.homeAboutBullet2Title || pageContent.homeAboutBullet2 || "Turnkey Project Execution",
      desc: pageContent.homeAboutBullet2Desc || "Single-point accountability from blueprint to milestone handover, ensuring timeline adherence and budget control.",
    },
    {
      icon: Compass,
      title: pageContent.homeAboutBullet3Title || pageContent.homeAboutBullet3 || "Architecture & Planning",
      desc: pageContent.homeAboutBullet3Desc || "Smart spatial layouts, 3D architectural visualization, and site-tailored master planning rooted in practical construction.",
    },
  ];

  return (
    <section id="section-home-about" className="py-24 bg-slate-50 relative border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Brand Statement & Context */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white border border-slate-200 text-construction-navy mb-6 shadow-sm">
              <span className="w-2 h-2 bg-construction-red" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{badgeText}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black font-display uppercase tracking-tight mb-6 leading-[1.12]">
              {heading.includes(".") ? (
                <>
                  {heading.split(".")[0]}. <br className="hidden sm:block" />
                  <span className="font-serif italic font-normal text-construction-red normal-case">
                    {heading.split(".").slice(1).join(".").trim()}
                  </span>
                </>
              ) : (
                heading
              )}
            </h2>

            <p className="text-slate-600 text-base md:text-lg font-light leading-relaxed mb-8 border-l-2 border-construction-red pl-5">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 mb-8">
              <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-construction-red" />
                Headquarters: Bhilwara, Rajasthan
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 shadow-sm">
                <Building2 className="w-3.5 h-3.5 text-construction-navy" />
                150+ Projects Handed Over
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-construction-red" />
                Founded in 2019
              </span>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-7 py-3.5 rounded-none text-xs uppercase tracking-widest transition-all shadow-md shadow-blue-950/20"
              >
                Discover Our Story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold px-7 py-3.5 rounded-none text-xs uppercase tracking-widest border border-slate-300 transition-all shadow-sm"
              >
                Explore Capabilities
              </Link>
            </div>
          </div>

          {/* Right Column: 3 Pillars Grid */}
          <div className="lg:col-span-5 space-y-4">
            {corePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={i}
                  className="bg-white p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow duration-300 relative group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-slate-100 group-hover:bg-red-50 border border-slate-200 group-hover:border-red-100 flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-5 h-5 text-construction-navy group-hover:text-construction-red transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-black font-display uppercase tracking-tight mb-1.5">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-normal">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
