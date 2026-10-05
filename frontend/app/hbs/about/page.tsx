import Link from "next/link";
import { ShieldCheck, CheckCircle, ArrowRight, Award, Clock, Wrench, Building2, MapPin } from "lucide-react";
import { fetchHbsContent } from "@/lib/hbsData";

export const revalidate = 60;

export default async function HbsAboutPage() {
  const content = await fetchHbsContent();

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  let teamItems = [];
  try {
    if (content.team) teamItems = JSON.parse(content.team);
  } catch {}

  let whyChooseItems = [];
  try {
    if (content.whyChoosePoints) whyChooseItems = JSON.parse(content.whyChoosePoints);
  } catch {}

  return (
    <div className="space-y-16 sm:space-y-24 py-12">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-slate-200 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            Sub-Brand of Hindustan Projects (HiPRO)
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase font-display tracking-tight">
            About <span className="text-amber-600">Hind Building Solutions</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Bridging the gap between unorganized local handymen and large-scale civil contractors with turnkey engineering discipline, diagnostic testing, and verified warranties.
          </p>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-amber-600 font-mono text-xs uppercase tracking-widest font-bold">
              Engineering Heritage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display">
              Why We Founded HBS
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {content.aboutStory || "Hind Building Solutions (HBS) was founded under Hindustan Projects (HiPRO) to bridge the massive gap between informal local handymen and large civil contractors. Modern buildings represent substantial investments, yet minor moisture ingress, foundation settlements, and electrical wear frequently turn into catastrophic structural hazards. HBS brings certified engineering discipline, non-destructive diagnosis, and turnkey accountability to building maintenance across Rajasthan."}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Every site inspection is carried out with digital moisture sensors, thermal imaging, and acoustic scanners to treat root causes rather than superficial cosmetic cover-ups.
            </p>

            <div className="p-4 bg-slate-900 text-white border-l-4 border-amber-500 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Parent Company Supervision</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operating with the rigorous technical standards, vendor procurement power, and engineering oversight of Hindustan Projects.
              </p>
            </div>
          </div>

          {/* Right Column: Mission & Vision Cards */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5">
                Corporate Mission
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase font-display">
                Extend Structural Longevity & Protect Investments
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {content.mission || "To extend the functional life, aesthetic dignity, and structural safety of every residential, commercial, and industrial property through dependable, engineering-grade maintenance."}
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-2 py-0.5">
                Corporate Vision
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase font-display">
                Rajasthan&apos;s Most Dependable Single-Window Brand
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {content.vision || "To be Rajasthan's most trusted single-window building maintenance and protection brand, synonymous with integrity, speed, and lasting craftsmanship."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team / Supervisory Structure */}
      {teamItems.length > 0 && (
        <section className="bg-slate-100 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-amber-700 font-mono text-xs uppercase tracking-wider font-bold block mb-1">
                Operational Backbone
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display">
                Execution & Supervisory Standards
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamItems.map((member: any, idx: number) => (
                <div key={idx} className="bg-white p-6 border border-slate-200 space-y-2 shadow-xs">
                  <h4 className="text-base font-bold text-slate-900 uppercase font-display">
                    {member.name}
                  </h4>
                  <p className="text-xs font-semibold text-amber-700 uppercase font-mono">
                    {member.role}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {member.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black uppercase font-display">
              Have Questions About A Repair or Renovation?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Speak directly with an HBS engineer or request a non-destructive site evaluation.
            </p>
          </div>
          <Link
            href={`${prefix}/contact`}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 text-xs uppercase tracking-wider shrink-0 transition-colors"
          >
            <Wrench className="w-4 h-4 text-slate-950" />
            <span>Book Site Evaluation</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
