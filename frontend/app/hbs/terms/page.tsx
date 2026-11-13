import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Mail, Phone, MapPin, CheckCircle2, ChevronRight, Wrench, ShieldCheck, AlertCircle } from "lucide-react";
import { getHbsCanonicalUrl, resolveHbsOgImage, HBS_SEO_KEYWORDS } from "@/lib/hbsSeo";
import { fetchHbsContent } from "@/lib/hbsData";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchHbsContent();
  const canonicalUrl = getHbsCanonicalUrl("terms");
  const title = "Terms of Service | Hind Building Solutions (HiBUILD)";
  const description =
    "Read the Terms of Service for Hind Building Solutions (HiBUILD), a specialized division of Hindustan Projects. Review service estimation standards, written warranty terms, and site inspection procedures.";

  const ogImages = resolveHbsOgImage(content.ogImage || content.ogDefaultImage, title);

  return {
    title: { absolute: title },
    description,
    keywords: ["HBS Terms of Service", "Hind Build Terms", ...HBS_SEO_KEYWORDS],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Hind Build | Hindustan Projects",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImages[0].url],
    },
  };
}

export default async function HbsTermsPage() {
  const content = await fetchHbsContent();
  const canonicalUrl = getHbsCanonicalUrl("terms");

  const phone = content.phone || "+91 94628 77757";
  const email = content.email || "hbs@hindustanprojects.in";
  const address = content.address || "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getHbsCanonicalUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Terms of Service",
        item: canonicalUrl,
      },
    ],
  };

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service | Hind Building Solutions",
    url: canonicalUrl,
    description: "Official Terms of Service of Hind Building Solutions (HiBUILD).",
    publisher: {
      "@type": "Organization",
      name: "Hind Building Solutions",
      parentOrganization: {
        "@type": "Organization",
        name: "Hindustan Projects (HiPRO)",
        url: "https://www.hindustanprojects.in/",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      {/* Header Banner */}
      <section className="bg-slate-900 text-white pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1528] via-[#0D2D5E] to-slate-900 opacity-95" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-300 mb-4 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-red-400 font-semibold">Terms of Service</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-4">
            <Scale className="w-3.5 h-3.5 text-red-400" />
            <span>Service Standards &amp; Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-3">
            Terms of <span className="text-red-500">Service</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-normal max-w-xl mx-auto">
            Hind Building Solutions (HiBUILD) &bull; Operational Guidelines &amp; Scope of Work
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">

            {/* 1. Agreement & Identity */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">01.</span>
                Agreement to Terms &amp; Corporate Identity
              </h2>
              <p>
                By accessing or using the website at{" "}
                <Link href={canonicalUrl} className="text-red-600 font-semibold hover:underline">
                  https://hindbuilding.hindustanprojects.in
                </Link>{" "}
                or requesting diagnostic inspections, building repairs, waterproofing, or civil services from <strong>Hind Building Solutions (HiBUILD)</strong>, you agree to comply with and be bound by these Terms of Service.
              </p>
              <p>
                Hind Building Solutions is a dedicated civil maintenance and repair enterprise operating under the corporate governance and technical engineering oversight of <strong>Hindustan Projects (HiPRO)</strong>, headquartered in Bhilwara, Rajasthan.
              </p>
            </div>

            {/* 2. Scope of Services */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">02.</span>
                Scope of Specialized Building Services
              </h2>
              <p>
                Hind Building Solutions provides engineering-grade building maintenance and rehabilitation across 19 specialized trades, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Structural Crack Injection, Micro-Concrete Jacketing &amp; RCC Strengthening</li>
                <li>Positive &amp; Negative Side Polyurethane Waterproofing and Efflorescence Defense</li>
                <li>Commercial &amp; Residential Interior/Exterior Painting and Putty Restoration</li>
                <li>Concealed Plumbing Diagnostic Acoustic Leak Detection &amp; Sanitary Infrastructure</li>
                <li>Terrace UV-Reflective Elastomeric Membrane Application &amp; Bird Netting Protection</li>
                <li>Chemical Soil Barrier Termite Treatment &amp; Post-Construction Wood Borer Eradication</li>
                <li>Flooring, Tile Replacement, Anti-Skid Pavers &amp; Chemical Epoxy Grouting</li>
                <li>Electrical Machine Maintenance, Panel Wiring, CCTV Surveillance &amp; Smart Building Automation</li>
              </ul>
            </div>

            {/* 3. Site Inspection & Estimation */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">03.</span>
                Site Inspections &amp; Bill of Quantities (BOQ)
              </h2>
              <p>
                Preliminary online and telephone estimates are indicative. Final binding quotes require an on-site physical evaluation by a Hind Build site supervisor or engineer.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Non-Destructive Testing:</strong> Where appropriate, our team uses electronic moisture profiling and acoustic listening tools to diagnose moisture travel paths before any surface chipping is undertaken.</li>
                <li><strong>Itemized BOQ:</strong> Before work commencement, clients receive an itemized quotation outlining square footage/running footage rates, specific industrial chemicals (e.g. Sika, Fosroc, Dr. Fixit), and estimated completion duration.</li>
                <li><strong>Unforeseen Sub-Surface Distress:</strong> If concealed concrete degradation, corroded rebar, or structural damage is revealed during execution that was not visible during initial non-invasive survey, written client approval will be secured prior to additional scope execution.</li>
              </ul>
            </div>

            {/* 4. Warranty Terms */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">04.</span>
                Written Warranty Protocols
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>Any warranty applicable to a specific service or project shall be expressly documented in the written quotation, service agreement, or separate warranty document issued for that work. The applicable duration, coverage, conditions and limitations shall be governed by that specific written documentation. Customers are advised to review the applicable terms before approving the work.</span>
                </div>
              </div>
            </div>

            {/* 5. Client Obligations */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">05.</span>
                Client Site Access &amp; Safety Cooperation
              </h2>
              <p>
                To allow safe, timely execution of building repair work, property owners agree to provide uninterrupted access to the treatment areas during agreed operational hours, access to water and electricity utilities required for high-pressure washing and mixing tools, and safe passage for our technician crews.
              </p>
            </div>

            {/* 6. Contact Coordinates */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">06.</span>
                Official Contact Coordinates
              </h2>
              <p>For questions regarding terms, contracts, or active site schedules, contact:</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <Phone className="w-4 h-4 text-red-600" />
                  <span className="font-bold">Official Line:</span>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-red-600 font-bold hover:underline">{phone}</a>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <Mail className="w-4 h-4 text-red-600" />
                  <span className="font-bold">Email:</span>
                  <a href={`mailto:${email}`} className="text-red-600 hover:underline">{email}</a>
                </div>
                <div className="flex items-start gap-2 text-slate-800">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
