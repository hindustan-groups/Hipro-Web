import type { Metadata } from "next";
import Link from "next/link";
import { FileText, AlertTriangle, Calculator, Shield, MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";
import { COMPANY_INFO } from "@/lib/companyData";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Terms of Service | Hindustan Projects (HiPRO)",
  description: "Review the Terms of Service for Hindustan Projects (HiPRO). Understand website terms, service inquiries, and our construction cost estimator disclaimer.",
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      {/* Header Banner */}
      <section className="bg-white pt-36 pb-16 px-4 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-red-50 border border-red-100 text-construction-red mb-6 shadow-sm">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Terms &amp; Conditions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 font-display uppercase tracking-tight">
            Terms of <span className="font-serif italic font-normal text-construction-red normal-case">Service</span>
          </h1>
          <p className="text-slate-500 text-sm font-light">
            Last Updated: September 2026 &bull; Effective Date: September 2026
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-14 border border-slate-200/80 shadow-sm space-y-12 text-slate-700 font-light leading-relaxed">

            {/* 1. Introduction */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">01.</span>
                Introduction
              </h2>
              <p className="mb-3">
                These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the website located at{" "}
                <Link href="https://www.hindustanprojects.in/" className="text-construction-red hover:underline font-normal">
                  https://www.hindustanprojects.in/
                </Link>{" "}
                operated by <strong>Hindustan Projects (HiPRO)</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), having its primary office in Bhilwara, Rajasthan, India.
              </p>
              <p>
                By accessing, browsing, or utilizing the interactive tools on this website (including submitting contact requests or using our online cost calculator), you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with these Terms, please discontinue using this website.
              </p>
            </div>

            {/* 2. Website Use */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">02.</span>
                Website Use &amp; Permitted Purpose
              </h2>
              <p className="mb-3">
                This website is provided to convey information regarding our engineering, architectural, and construction capabilities, and to facilitate project consultations between prospective clients and our technical team.
              </p>
              <p className="mb-2">When using this website, you agree that you will not:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>Submit intentionally false, fraudulent, or misleading contact information.</li>
                <li>Attempt to gain unauthorized access to our administrative dashboard or database infrastructure.</li>
                <li>Use automated scrapers, spiders, or data extraction scripts to harvest proprietary website content or client records.</li>
                <li>Transmit any harmful code, viruses, or disruptive scripts through our forms or file upload endpoints.</li>
                <li>Use our brand name, trademarks, or architectural portfolio images without prior written authorization.</li>
              </ul>
            </div>

            {/* 3. Services Information */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">03.</span>
                Services Information
              </h2>
              <p className="mb-3">
                Hindustan Projects provides civil construction, architectural planning, structural engineering, site surveying, water treatment plant construction, and project management consultancy services across Rajasthan and surrounding regions.
              </p>
              <p>
                The descriptions of services, construction packages, and technical capabilities displayed on this website are for general informational purposes. All construction contracts, engineering scopes of work, and project deliverables are formally governed by separate, customized, written agreements executed between Hindustan Projects and the client.
              </p>
            </div>

            {/* 4. Construction Cost Estimator Disclaimer */}
            <div className="p-6 md:p-8 bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-3 mb-4 text-amber-900">
                <Calculator className="w-6 h-6 text-amber-700 shrink-0" />
                <h2 className="text-2xl font-bold font-display uppercase tracking-tight">
                  <span className="text-amber-700 text-base font-sans font-bold">04.</span>
                  Construction Cost Estimator Disclaimer
                </h2>
              </div>
              <div className="space-y-3 text-sm text-amber-950 font-normal leading-relaxed">
                <p>
                  <strong>INDICATIVE ESTIMATE ONLY:</strong> The online House Construction Cost Calculator available on this website is an interactive estimation tool designed solely for high-level preliminary budgeting. 
                </p>
                <p>
                  The calculated output figures represent automated mathematical approximations based on generic standard unit assumptions (e.g., standard regional rates per square foot, standard floor heights, and assumed unit sizes). <strong>They do NOT constitute a formal quotation, a binding price commitment, a tender document, or a legal contract.</strong>
                </p>
                <p>
                  Actual on-site construction costs will vary significantly based on critical physical and engineering factors, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-amber-900 text-xs">
                  <li>Soil bearing capacity, seismic zones, and foundation design requirements.</li>
                  <li>Site topography, accessibility for heavy machinery, and excavation conditions.</li>
                  <li>Detailed structural, electrical, and plumbing engineering specifications.</li>
                  <li>Specific brand and quality selections for finishing materials, fixtures, tiles, and fittings.</li>
                  <li>Municipal sanction fees, utility connection expenses, and government compliance requirements.</li>
                  <li>Market price fluctuations of essential raw commodities (such as steel, cement, sand, and aggregates).</li>
                </ul>
                <p className="pt-2 font-medium">
                  We strongly advise clients to consult directly with our senior structural engineers for an on-site evaluation and formal Bill of Quantities (BOQ) before making financial commitments.
                </p>
              </div>
            </div>

            {/* 5. Quotes and Estimates */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">05.</span>
                Quotes and Official Estimates
              </h2>
              <p className="mb-3">
                Submitting a request through our &ldquo;Get Free Estimate&rdquo;, &ldquo;Contact Us&rdquo;, or &ldquo;Consultation&rdquo; forms does not bind either party to an agreement. A formal project proposal or binding quote is only established after:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>Detailed architectural and site requirements have been reviewed.</li>
                <li>Site measurements and soil/topographical feasibility have been conducted.</li>
                <li>A mutually agreed written contract detailing timelines, payment milestones, and quality specifications has been signed by both parties.</li>
              </ul>
            </div>

            {/* 6. Project Information & Portfolio */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">06.</span>
                Project Portfolios &amp; Visual Media
              </h2>
              <p>
                Photographs, architectural renderings, and project descriptions presented across our website showcase completed structures, ongoing construction works, and design capabilities. Certain portfolio images may represent conceptual 3D visualizations, architectural prototypes, or representative reference styles intended to demonstrate engineering capabilities.
              </p>
            </div>

            {/* 7. User Submissions / Inquiries */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">07.</span>
                User Submissions &amp; Communications
              </h2>
              <p className="mb-3">
                When submitting inquiries, resumes, or project parameters through our website, you warrant that all information provided is accurate and that you are authorized to provide such details.
              </p>
              <p>
                By providing your phone number and email address, you consent to our team contacting you via telephone, WhatsApp, or email to discuss your submitted project inquiry or employment application.
              </p>
            </div>

            {/* 8. Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">08.</span>
                Intellectual Property Rights
              </h2>
              <p className="mb-3">
                All content published on this website—including the Hindustan Projects (HiPRO) brand name, logo, graphic designs, architectural layouts, copy, and code—is the property of Hindustan Projects or used under applicable licenses.
              </p>
              <p>
                You may browse and download content from this website solely for personal, non-commercial use in evaluating our construction and engineering services. Any reproduction, redistribution, modification, or commercial exploitation of website materials without our express written consent is strictly prohibited.
              </p>
            </div>

            {/* 9. External Links */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">09.</span>
                External Links &amp; Third-Party Services
              </h2>
              <p>
                This website may contain links to external third-party services and websites, including social media platforms, WhatsApp, and Cloudinary for file hosting. We do not control or endorse the content, policies, or practices of third-party platforms. Your interactions with third-party sites are governed solely by the terms and policies of those respective third parties.
              </p>
            </div>

            {/* 10. Website Availability */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">10.</span>
                Website Availability &amp; Modifications
              </h2>
              <p>
                While we strive to ensure continuous website availability, we do not guarantee uninterrupted, error-free operation. We reserve the right to modify, suspend, or discontinue any feature, page, or online calculator tool at any time without prior notice for maintenance, updates, or operational improvements.
              </p>
            </div>

            {/* 11. Accuracy of Information */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">11.</span>
                Accuracy of Information
              </h2>
              <p>
                We make reasonable efforts to maintain accurate and up-to-date information on this website. However, technical descriptions, material specifications, and regulatory standards may change over time. Content is provided &ldquo;as is&rdquo; without warranties of any kind, either express or implied.
              </p>
            </div>

            {/* 12. Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">12.</span>
                Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by applicable law, Hindustan Projects and its directors, officers, and employees shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of, or inability to use, this website or reliance upon preliminary estimates generated by our online cost calculator. Formal commitments and liabilities are governed exclusively by individual signed construction contracts.
              </p>
            </div>

            {/* 13. Changes to Terms */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">13.</span>
                Changes to These Terms
              </h2>
              <p>
                We reserve the right to revise these Terms of Service at any time. Any changes will be posted directly to this page with an updated &ldquo;Last Updated&rdquo; date. Your continued use of the website following the posting of revised Terms signifies your acceptance of the updated terms.
              </p>
            </div>

            {/* 14. Contact Information */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">14.</span>
                Contact Information
              </h2>
              <p className="mb-6">
                If you have questions regarding these Terms of Service or our engineering services, please contact our Bhilwara office:
              </p>
              
              <div className="p-6 bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-construction-red shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-black font-bold text-sm block">Hindustan Projects (HiPRO)</strong>
                    <span className="text-xs text-slate-600 block">{COMPANY_INFO.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-construction-navy shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 block">Phone</span>
                    <a href={COMPANY_INFO.phoneTel} className="text-sm font-semibold text-black hover:text-construction-red transition-colors">
                      {COMPANY_INFO.formattedPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-construction-red shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 block">Email</span>
                    <a href={COMPANY_INFO.emailMailto} className="text-sm font-semibold text-black hover:text-construction-red transition-colors">
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
