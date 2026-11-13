import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin, Lock, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { getHbsCanonicalUrl, resolveHbsOgImage, HBS_SEO_KEYWORDS } from "@/lib/hbsSeo";
import { fetchHbsContent } from "@/lib/hbsData";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchHbsContent();
  const canonicalUrl = getHbsCanonicalUrl("privacy-policy");
  const title = "Privacy Policy | Hind Building Solutions (HiBUILD)";
  const description =
    "Read the Privacy Policy for Hind Building Solutions (HiBUILD), a specialized division of Hindustan Projects. Learn how we handle site inspection requests, quotation details, and customer inquiries.";

  const ogImages = resolveHbsOgImage(content.ogImage || content.ogDefaultImage, title);

  return {
    title: { absolute: title },
    description,
    keywords: ["HBS Privacy Policy", "Hind Build Privacy", ...HBS_SEO_KEYWORDS],
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

export default async function HbsPrivacyPolicyPage() {
  const content = await fetchHbsContent();
  const canonicalUrl = getHbsCanonicalUrl("privacy-policy");

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
        name: "Privacy Policy",
        item: canonicalUrl,
      },
    ],
  };

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy | Hind Building Solutions",
    url: canonicalUrl,
    description: "Official Privacy Policy of Hind Building Solutions (HiBUILD).",
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
            <span className="text-red-400 font-semibold">Privacy Policy</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>Data Transparency & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-3">
            Privacy <span className="text-red-500">Policy</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-normal max-w-xl mx-auto">
            Hind Building Solutions (HiBUILD) &bull; A specialized division of Hindustan Projects (HiPRO)
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">

            {/* 1. Introduction */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">01.</span>
                Introduction & Brand Identity
              </h2>
              <p>
                Welcome to <strong>Hind Building Solutions (HiBUILD)</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). Hind Building Solutions is a dedicated civil maintenance, waterproofing, structural repair, and turnkey building services company operating across Rajasthan, functioning as a specialized operational division of <strong>Hindustan Projects (HiPRO)</strong>.
              </p>
              <p>
                This Privacy Policy explains how we collect, handle, and protect your information when you browse our website at{" "}
                <Link href={canonicalUrl} className="text-red-600 font-semibold hover:underline">
                  https://hindbuilding.hindustanprojects.in
                </Link>{" "}
                or submit service inquiries, quotation requests, or diagnostic inspection bookings.
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">02.</span>
                Information Collected Through Our Website
              </h2>
              <p>
                When you interact with our website contact forms, site visit booking modals, or direct consultation buttons, we collect only the information necessary to fulfill your technical service request:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Contact Coordinates:</strong> Full Name, Mobile Phone Number, and Optional Email Address.</li>
                <li><strong>Service Inquiries:</strong> Selected trade(s) (e.g. Structure Repair, Water Leakage Solution, Painting, Termite Control, Plumbing &amp; Electrical).</li>
                <li><strong>Property Context:</strong> Property type (e.g. Independent Villa, Apartment, Commercial Complex, Industrial Unit) and general location/city within Rajasthan.</li>
                <li><strong>Technical Problem Description:</strong> Any specific notes, symptoms, or concerns you submit regarding cracks, dampness, or maintenance requirements.</li>
                <li><strong>Preferred Contact Channel:</strong> Phone call, WhatsApp consultation, or in-person site visit preference.</li>
              </ul>
            </div>

            {/* 3. Purpose of Collection */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">03.</span>
                How We Use Your Information
              </h2>
              <p>We use the collected information strictly for operational and customer service purposes:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700">Scheduling diagnostic on-site visits and non-destructive moisture meter scans.</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700">Preparing itemized bills of quantities (BOQ) and written warranty estimates.</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700">Direct communication via telephone or WhatsApp regarding your service inquiries.</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700">Post-execution warranty documentation and engineering inspection sign-offs.</span>
                </div>
              </div>
            </div>

            {/* 4. Data Sharing & Protection */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">04.</span>
                Data Protection & Zero Third-Party Selling
              </h2>
              <p>
                <strong>We do not sell, rent, or trade your personal contact details to third-party telemarketers or external advertisers.</strong> Information submitted to Hind Building Solutions is shared exclusively with our internal civil engineering supervisors, certified field applicators, and parent administration at Hindustan Projects to execute your requested service.
              </p>
              <p>
                Our web forms employ server-side input sanitation, rate limiting, and honeypot spam protection to safeguard transmission.
              </p>
            </div>

            {/* 5. Analytics & Cookies */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">05.</span>
                Analytics &amp; Usage Telemetry
              </h2>
              <p>
                To understand website performance and improve user experience, we may utilize Google Analytics (GA4) with strict IP and Personally Identifiable Information (PII) exclusion. We do not transmit customer names, phone numbers, or free-text messages to any analytics platform.
              </p>
            </div>

            {/* 6. Contact & Grievances */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-red-600 text-base font-bold">06.</span>
                Contact Coordinates &amp; Inquiries
              </h2>
              <p>
                If you have questions regarding this Privacy Policy or wish to review or update the contact details provided for an active service order, please reach out to us:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800">
                  <Phone className="w-4 h-4 text-red-600" />
                  <span className="font-bold">Official Hotline:</span>
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
