import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin, Lock, FileText, CheckCircle2 } from "lucide-react";
import { COMPANY_INFO } from "@/lib/companyData";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Policy | Hindustan Projects (HiPRO)",
  description: "Read the Privacy Policy for Hindustan Projects (HiPRO). Learn how we handle project inquiries, consultation requests, job applications, and website data.",
  alternates: {
    canonical: "/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Header Banner */}
      <section className="bg-white pt-36 pb-16 px-4 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-red-50 border border-red-100 text-construction-red mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Privacy &amp; Data Transparency</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 font-display uppercase tracking-tight">
            Privacy <span className="font-serif italic font-normal text-construction-red normal-case">Policy</span>
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
                Welcome to <strong>Hindustan Projects (HiPRO)</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We specialize in professional civil engineering, architectural planning, and turnkey infrastructure execution, headquartered in Bhilwara, Rajasthan, India.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, store, and safeguard the information you provide when visiting our website at{" "}
                <Link href="https://www.hindustanprojects.in/" className="text-construction-red hover:underline font-normal">
                  https://www.hindustanprojects.in/
                </Link>{" "}
                or communicating with our technical team through our online forms, phone, or messaging channels.
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">02.</span>
                Information We Collect
              </h2>
              <p className="mb-3">
                We only collect information necessary to evaluate your construction requirements, prepare architectural feasibility studies, schedule consultations, or review professional job applications. We do not engage in covert background data harvesting or cross-site tracking.
              </p>
              <p>
                Depending on how you interact with our website, the information collected may include:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-1.5 text-slate-600">
                <li>Contact and identification details (e.g., your full name, phone number, email address).</li>
                <li>Project parameters (e.g., state, district, property location, service category, project type, estimated budget, message details).</li>
                <li>Employment background (e.g., job role applied for, years of relevant industry experience, uploaded curriculum vitae or resume).</li>
                <li>Basic client-side preferences (e.g., consultation popup dismissal flags and temporary calculator unlock status).</li>
              </ul>
            </div>

            {/* 3. Information You Provide */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">03.</span>
                Information You Provide Directly
              </h2>
              <p className="mb-3">
                You directly provide personal data across the following website touchpoints:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-black text-sm uppercase mb-1">General Inquiries</h3>
                  <p className="text-xs text-slate-600">Name, email, phone number, service category, and project scope submitted via the Contact Us form.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-black text-sm uppercase mb-1">Consultation Requests</h3>
                  <p className="text-xs text-slate-600">Name, email, phone number, state, and district provided in the consultation modal.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-black text-sm uppercase mb-1">Estimator Phone Gate</h3>
                  <p className="text-xs text-slate-600">Phone number entered to unlock the interactive house construction cost calculator.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-black text-sm uppercase mb-1">Careers &amp; Applications</h3>
                  <p className="text-xs text-slate-600">Name, email, phone number, work experience, and resume/CV document file.</p>
                </div>
              </div>
            </div>

            {/* 4. How We Use Information */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">04.</span>
                How We Use Information
              </h2>
              <p className="mb-3">
                We use the information submitted on our website solely for legitimate commercial, engineering, and employment purposes:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-600">
                <li>To evaluate project feasibility and prepare preliminary engineering estimates.</li>
                <li>To contact you by phone, WhatsApp, or email regarding your specific construction inquiry.</li>
                <li>To coordinate on-site inspections, surveying, and architectural consultations.</li>
                <li>To evaluate candidate qualifications for open positions at Hindustan Projects.</li>
                <li>To maintain accurate administrative records of client project requests and communication history.</li>
              </ul>
            </div>

            {/* 5. Lead / Inquiry Information */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">05.</span>
                Lead and Inquiry Information
              </h2>
              <p className="mb-3">
                When you submit an inquiry through our contact form, quote form, or estimator access modal, your submission is transmitted directly to our secure application server and stored in our database.
              </p>
              <p>
                Inquiry details are restricted to authorized HiPRO project engineers and administrative staff responsible for client relations. We do not sell, rent, or trade your inquiry details with third-party telemarketers, lead brokers, or advertising networks.
              </p>
            </div>

            {/* 6. Job Application Information */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">06.</span>
                Job Application Information
              </h2>
              <p className="mb-3">
                When applying for an open role on our Careers page, you provide your name, contact details, professional experience, and resume/CV file. 
              </p>
              <p>
                Resume documents uploaded through the application form are transmitted to Cloudinary, a cloud asset storage provider, to allow our hiring managers to review your qualifications. Job applicant data is used exclusively to assess employment eligibility and will not be repurposed for customer marketing.
              </p>
            </div>

            {/* 7. Newsletter / Marketing Information */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">07.</span>
                Newsletter and Marketing Information
              </h2>
              <p>
                Hindustan Projects does not currently operate an automated email newsletter or recurring marketing distribution list. You will not receive unsolicited mass promotional newsletters from us. Communications from our team are limited to direct follow-ups on inquiries initiated by you.
              </p>
            </div>

            {/* 8. Cookies and Local Storage */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">08.</span>
                Cookies and Local Storage
              </h2>
              <p className="mb-3">
                Our website utilizes minimal functional cookies and browser storage strictly required for operational user-experience features:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border-l-4 border-construction-navy text-sm">
                  <strong>Functional Cookie:</strong> <code className="text-xs bg-slate-200 px-1 py-0.5 text-slate-800">cost_estimator_unlocked</code>
                  <p className="text-xs text-slate-600 mt-1">
                    Set in your browser for 24 hours after entering your phone number on the Cost Estimator page. This ensures you do not need to repeatedly submit your phone number on subsequent calculator visits within that day.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border-l-4 border-construction-red text-sm">
                  <strong>Browser Local Storage:</strong> <code className="text-xs bg-slate-200 px-1 py-0.5 text-slate-800">hasSeenConsultationPopup</code> &amp; <code className="text-xs bg-slate-200 px-1 py-0.5 text-slate-800">user_phone</code>
                  <p className="text-xs text-slate-600 mt-1">
                    Used to remember if you have dismissed the consultation popup so it does not interrupt your browsing repeatedly, and to cache your phone number locally on your device for convenience.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                We do not deploy third-party advertising cookies, behavioural retargeting pixels, or invasive surveillance scripts. You can clear cookies and local storage anytime through your browser settings.
              </p>
            </div>

            {/* 9. Third-Party Services */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">09.</span>
                Third-Party Services
              </h2>
              <p className="mb-3">
                To deliver specific website features, we integrate the following verified third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>
                  <strong>Cloudinary:</strong> Used to securely store uploaded resume files and serve optimized project imagery. When you upload a resume, the document is hosted on Cloudinary&apos;s infrastructure.
                </li>
                <li>
                  <strong>Google Maps:</strong> An embedded map on our Contact page displays our Bhilwara office location. Viewing the map interacts with Google&apos;s standard mapping service under Google&apos;s privacy policy.
                </li>
                <li>
                  <strong>WhatsApp (Meta):</strong> Optional click-to-chat links connect you directly to our official WhatsApp business number. Conversations on WhatsApp are subject to WhatsApp&apos;s terms and privacy policies.
                </li>
                <li>
                  <strong>Unsplash CDN:</strong> Serves certain architectural reference imagery used across portfolio and service demonstrations.
                </li>
              </ul>
            </div>

            {/* 10. Data Storage and Security */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">10.</span>
                Data Storage and Security
              </h2>
              <p className="mb-3">
                All lead inquiries, quotes, and job application records are stored in a password-protected relational database. Access to submitted data is strictly restricted to authenticated administrators through our administrative portal.
              </p>
              <p>
                While we maintain reasonable administrative and technical safeguards to protect your personal details, no internet transmission or electronic storage method can be guaranteed 100% immune to risk. We encourage you not to transmit sensitive financial credentials (such as bank PINs or passwords) through general website inquiry forms.
              </p>
            </div>

            {/* 11. Data Retention */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">11.</span>
                Data Retention
              </h2>
              <p>
                We retain project inquiries and client contact records for as long as necessary to fulfill the commercial purpose for which they were submitted, maintain ongoing project communication, address future warranty or maintenance requests, and comply with standard business and taxation recordkeeping requirements under Indian law. Job applications are retained during active recruitment cycles and discarded when no longer required.
              </p>
            </div>

            {/* 12. Your Choices and Rights */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">12.</span>
                Your Choices and Rights
              </h2>
              <p className="mb-3">
                You have the right to request access to the personal information you have submitted to us, to request corrections to inaccurate contact details, or to ask that we remove your contact details from our active inquiry records.
              </p>
              <p>
                To exercise any of these requests, please contact our office directly at{" "}
                <a href="mailto:info@hindustanprojects.in" className="text-construction-red hover:underline font-normal">
                  info@hindustanprojects.in
                </a>{" "}
                or call us at{" "}
                <a href="tel:+917597000601" className="text-construction-red hover:underline font-normal">
                  +91 75970 00601
                </a>.
              </p>
            </div>

            {/* 13. External Links */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">13.</span>
                External Links
              </h2>
              <p>
                Our website includes links to external third-party websites, including our official profiles on Instagram, Facebook, LinkedIn, and Pinterest, as well as external links to group initiatives. We have no control over and assume no responsibility for the privacy practices, policies, or content of any external third-party websites. We encourage you to review their respective privacy notices when visiting them.
              </p>
            </div>

            {/* 14. Children's Privacy */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">14.</span>
                Children&apos;s Privacy
              </h2>
              <p>
                Our services and website are intended solely for individuals seeking commercial or residential construction, architectural engineering, or professional employment, and are not directed to children under 18 years of age. We do not knowingly collect personal information from minors. If you believe a minor has submitted personal information to our website, please notify us and we will promptly delete it.
              </p>
            </div>

            {/* 15. Changes to This Privacy Policy */}
            <div>
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">15.</span>
                Changes to This Privacy Policy
              </h2>
              <p>
                We may periodically update this Privacy Policy to reflect changes in our operational procedures, website features, or legal requirements. Any modifications will be published on this page with an updated &ldquo;Last Updated&rdquo; date at the top. We encourage you to review this page periodically to stay informed about our data handling practices.
              </p>
            </div>

            {/* 16. Contact Us */}
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-black font-display uppercase tracking-tight mb-4 flex items-center gap-3">
                <span className="text-construction-red text-base font-sans font-bold">16.</span>
                Contact Us
              </h2>
              <p className="mb-6">
                If you have questions, feedback, or data requests regarding this Privacy Policy, please contact our team:
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
