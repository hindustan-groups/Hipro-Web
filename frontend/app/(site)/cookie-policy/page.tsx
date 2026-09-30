import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, ShieldCheck, Mail, Phone, MapPin, CheckCircle2, Sliders, Info, Eye } from "lucide-react";
import { COMPANY_INFO } from "@/lib/companyData";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Cookie Policy | Hindustan Projects (HiPRO)",
  description: "Learn how Hindustan Projects uses cookies and tracking technologies to optimize website experience, analyze visitor traffic, and protect your privacy.",
  alternates: {
    canonical: "/cookie-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiePolicyPage() {
  return (
    <>
      {/* Header Banner */}
      <section className="bg-white pt-36 pb-16 px-4 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-red-50 border border-red-100 text-construction-red mb-6 shadow-sm">
            <Cookie className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Cookie &amp; Tracking Transparency</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 font-display uppercase tracking-tight">
            Cookie <span className="font-serif italic font-normal text-construction-red normal-case">Policy</span>
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

            {/* 1. What Are Cookies */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">01.</span>
                What Are Cookies?
              </h2>
              <p className="mb-3">
                Cookies are small text files that are stored on your device (computer, tablet, or smartphone) when you visit websites. They are widely used by modern web platforms to make websites function efficiently, retain your preferences, enhance security, and provide statistical insights to the site owners.
              </p>
              <p>
                At <strong>Hindustan Projects (HiPRO)</strong>, we respect your privacy and only deploy cookies necessary to deliver seamless civil engineering, architectural planning, and turnkey construction consultation services.
              </p>
            </div>

            {/* 2. How We Use Cookies */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">02.</span>
                How We Use Cookies
              </h2>
              <p className="mb-4">
                We use cookies and similar browser storage mechanisms (such as <code>localStorage</code>) for the following core purposes:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm font-display uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Essential Functionality</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Enabling secure form submissions, CSRF protection, admin panel sessions, and remembering your privacy choices.
                  </p>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm font-display uppercase">
                    <Eye className="w-4 h-4 text-construction-red" />
                    <span>Traffic &amp; Performance Analytics</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Aggregated metrics via Google Analytics (GA4) to understand which engineering services and blueprints interest our clients most.
                  </p>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm font-display uppercase">
                    <Sliders className="w-4 h-4 text-construction-navy" />
                    <span>User Preferences</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Remembering previously dismissed consultation popups and custom cost estimator calculations.
                  </p>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-sm font-display uppercase">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Security &amp; Fraud Prevention</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Detecting automated bots and spam submissions on our technical dispatch and project inquiry forms.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Types of Cookies We Set */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">03.</span>
                Categories of Cookies We Use
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-mono border-b border-slate-200">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Purpose</th>
                      <th className="p-3">Lifespan</th>
                      <th className="p-3">Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Strictly Necessary</td>
                      <td className="p-3 text-slate-600">Session handling, admin security, cookie preference storage.</td>
                      <td className="p-3 text-slate-600">Session / Up to 1 year</td>
                      <td className="p-3 text-emerald-600 font-bold">Mandatory</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Analytics (GA4)</td>
                      <td className="p-3 text-slate-600">Measures anonymous visitor behavior, page traffic, and referral sources (<code>_ga</code>, <code>_ga_*</code>).</td>
                      <td className="p-3 text-slate-600">Up to 2 years</td>
                      <td className="p-3 text-slate-600">Optional</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Functional &amp; UI</td>
                      <td className="p-3 text-slate-600">Stores consultation modal state (<code>hasSeenConsultationPopup</code>) to avoid disturbing your browsing.</td>
                      <td className="p-3 text-slate-600">Persistent</td>
                      <td className="p-3 text-slate-600">Optional</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Managing and Controlling Cookies */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">04.</span>
                How to Manage &amp; Disable Cookies
              </h2>
              <p className="mb-3">
                You have full control over your cookie settings. You can accept or decline non-essential cookies via our on-screen Cookie Consent Banner at any time.
              </p>
              <p className="mb-3">
                Additionally, all modern browsers allow you to change cookie preferences or delete stored cookies entirely:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 mb-4">
                <li><strong>Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Cookies and other site data</li>
                <li><strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data</li>
                <li><strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data</li>
                <li><strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies</li>
              </ul>
              <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Please note: Disabling strictly necessary cookies may impact certain website features like secure admin login or inquiry submissions.
                </span>
              </div>
            </div>

            {/* 5. Contact & Privacy Office */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">05.</span>
                Questions &amp; Contact Information
              </h2>
              <p className="mb-4">
                If you have questions regarding this Cookie Policy or how your browsing data is processed, please contact our legal and technical team:
              </p>
              <div className="p-6 bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-construction-red shrink-0" />
                  <span><strong>Headquarters:</strong> {COMPANY_INFO.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-construction-red shrink-0" />
                  <span><strong>Direct Line:</strong> {COMPANY_INFO.formattedPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-construction-red shrink-0" />
                  <span><strong>Privacy Inquiries:</strong> {COMPANY_INFO.email}</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
                <Link href="/privacy-policy" className="text-construction-red hover:underline">
                  &larr; Read Full Privacy Policy
                </Link>
                <Link href="/terms" className="text-slate-600 hover:text-slate-900 hover:underline">
                  Terms of Service &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
