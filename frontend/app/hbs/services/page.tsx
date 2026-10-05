import Link from "next/link";
import { Wrench, ArrowRight, MessageSquare, CheckCircle, ShieldCheck } from "lucide-react";
import { fetchHbsServices, fetchHbsContent } from "@/lib/hbsData";

export const revalidate = 60;

export default async function HbsServicesPage() {
  const [services, content] = await Promise.all([
    fetchHbsServices(),
    fetchHbsContent(),
  ]);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";

  const whatsappRaw = content.whatsapp.replace(/[^\d]/g, "") || "917597000601";

  return (
    <div className="space-y-12 sm:space-y-16 py-12">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-slate-200 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            All 19 Specialized Solutions
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase font-display tracking-tight">
            Comprehensive <span className="text-amber-600">Building Services</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            From emergency structural crack repair and positive-side waterproofing to solar rooftop maintenance and automated security, Hind Building Solutions provides turnkey execution with written material and workmanship guarantees.
          </p>
        </div>
      </section>

      {/* Services Listing (All 19 items) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-8">
          {services.map((service, index) => {
            let featuresArray: string[] = [];
            try {
              if (service.features) {
                featuresArray = typeof service.features === "string" ? JSON.parse(service.features) : service.features;
              }
            } catch {}

            return (
              <div
                key={service.id || index}
                id={service.slug}
                className="bg-white border border-slate-200 hover:border-amber-500 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all scroll-mt-24"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left Column: Index & Service Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-black text-amber-700 bg-amber-50 px-2.5 py-1 border border-amber-200">
                        {service.serviceNumber || String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                        HBS SERVICE CODE #{service.serviceNumber || String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase font-display tracking-tight">
                        {service.title}
                      </h2>
                      {service.hindiTitle && (
                        <p className="text-sm font-semibold text-slate-500 mt-0.5">
                          {service.hindiTitle}
                        </p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
                      {service.fullDescription || service.shortDescription}
                    </p>

                    {/* Features Badges */}
                    {featuresArray.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Key Deliverables:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {featuresArray.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-slate-700">
                              <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="font-medium">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="lg:w-64 flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-6 border-slate-100 justify-center">
                    <Link
                      href={`${prefix}/contact?service=${encodeURIComponent(service.title)}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider py-3 shadow-xs transition-colors"
                    >
                      <Wrench className="w-4 h-4 text-white" />
                      <span>Request Quote</span>
                    </Link>

                    <a
                      href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(`Hello HBS, I would like to inquire about: ${service.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp Inquiry</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white p-8 sm:p-10 border-l-4 border-amber-500 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold uppercase font-display">
              Need Multiple Services For A Property?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              We offer turnkey package rates for housing societies, commercial complexes, and complete home renovations.
            </p>
          </div>
          <Link
            href={`${prefix}/contact`}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 text-xs uppercase tracking-wider shrink-0 transition-colors"
          >
            <span>Consult an HBS Supervisor</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
        </div>
      </section>
    </div>
  );
}
