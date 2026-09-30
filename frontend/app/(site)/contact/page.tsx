import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink, Navigation, CheckCircle2 } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { findAll } from "@/lib/db";
import type { Settings, Service, ContactPageContent } from "@/lib/types";
import { COMPANY_INFO } from "@/lib/companyData";

export const revalidate = 60;

async function getContactSettings(): Promise<{
  settings: Settings;
  contactContent: ContactPageContent;
  services: Service[];
}> {
  const [settingsData, servicesData] = await Promise.all([
    findAll<Settings>("settings"),
    findAll<Service>("services"),
  ]);

  const settings = settingsData[0] || {};
  let contactContent: ContactPageContent = {};

  try {
    if (settings.pageContent) {
      const parsed =
        typeof settings.pageContent === "string"
          ? JSON.parse(settings.pageContent)
          : settings.pageContent;
      if (parsed.contactPage) {
        contactContent = parsed.contactPage;
      }
    }
  } catch {
    // fallback
  }

  const activeServices = servicesData
    .filter((s) => s.active !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  return { settings, contactContent, services: activeServices };
}

export async function generateMetadata(): Promise<Metadata> {
  const { contactContent } = await getContactSettings();

  const title =
    contactContent.metaTitle ||
    "Contact Us | Hindustan Projects (HiPRO) — Bhilwara, Rajasthan";
  const description =
    contactContent.metaDescription ||
    "Get in touch with Hindustan Projects (HiPRO) for construction inquiries, architectural consultation, turnkey civil contracting, and site evaluations in Bhilwara, Rajasthan.";

  return {
    title,
    description,
    alternates: {
      canonical: "/contact",
    },
    openGraph: {
      title,
      description,
      url: "https://www.hindustanprojects.in/contact",
      siteName: "Hindustan Projects (HiPRO)",
      images: [
        {
          url: "https://www.hindustanprojects.in/logo.jpg",
          width: 800,
          height: 600,
          alt: "Hindustan Projects Contact Office Bhilwara",
        },
      ],
      type: "website",
    },
  };
}

export default async function ContactPage() {
  const { settings, contactContent, services } = await getContactSettings();

  const address =
    contactContent.address || settings.companyAddress || COMPANY_INFO.address;
  const phone =
    contactContent.phone || settings.companyPhone || COMPANY_INFO.formattedPhone;
  const email =
    contactContent.email || settings.companyEmail || COMPANY_INFO.email;
  const businessHours =
    contactContent.businessHours ||
    "Monday–Saturday: 9:00 AM – 7:00 PM\nSunday: Closed";
  const whatsappNumber =
    contactContent.whatsapp || COMPANY_INFO.whatsappNumber || "917597000601";

  const badge = contactContent.badge || "Engineering Inquiry";
  const headingPrefix = contactContent.headingPrefix || "Get In";
  const headingAccent = contactContent.headingAccent || "Touch";
  const description =
    contactContent.description ||
    "Connect with our technical engineering team for project quotes, architectural planning, site evaluations, or partnership inquiries.";

  const formTitle = contactContent.formTitle || "Send Us A Message";
  const formSubtitle =
    contactContent.formSubtitle ||
    "Fill out your project specifications and our technical leads will reach out within 24 hours.";
  const responseNote =
    contactContent.responseNote ||
    "Our senior project engineers will respond within 24 business hours.";

  // Dynamic verified map embed URL or user-defined custom embed
  const fallbackEmbedUrl =
    "https://maps.google.com/maps?q=Hindustan%20Projects%2C%20Opposite%20Mukherji%20Park%2C%20Above%20Bhagwati%20Coffee%20House%2C%20Bhopal%20Ganj%2C%20Bhilwara%2C%20Rajasthan%20311001&t=&z=16&ie=UTF8&iwloc=&output=embed";
  const mapEmbedUrl = contactContent.mapEmbedUrl?.trim() || fallbackEmbedUrl;
  const mapDirectionsUrl =
    contactContent.mapDirectionsUrl?.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address || "Hindustan Projects Bhilwara"
    )}`;
  const showMap = contactContent.showMap !== false;

  const contactItems = [
    {
      icon: MapPin,
      label: "Headquarters",
      value: address,
      action: {
        href: mapDirectionsUrl,
        label: "Get Directions",
        isExternal: true,
      },
    },
    {
      icon: Phone,
      label: "Direct Phone",
      value: phone,
      action: {
        href: `tel:${phone.replace(/[^0-9+]/g, "")}`,
        label: "Call Now",
        isExternal: false,
      },
    },
    {
      icon: Mail,
      label: "Official Email",
      value: email,
      action: {
        href: `mailto:${email}`,
        label: "Send Email",
        isExternal: false,
      },
    },
    {
      icon: Clock,
      label: "Business Hours",
      value: businessHours,
      badge: "Open for Site Visits",
    },
  ];

  return (
    <>
      {/* Header */}
      <section className="bg-white pt-36 pb-20 px-4 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-none bg-red-50 border border-red-100 text-construction-red mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-none bg-construction-red animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {badge}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-5 font-display uppercase tracking-tight">
            {headingPrefix}{" "}
            <span className="font-serif italic font-normal text-construction-red normal-case">
              {headingAccent}
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            {description}
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-20 md:py-24 bg-slate-50/50 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12 items-start">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-slate-200/80 p-6 rounded-none shadow-sm mb-6">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
                Direct Communication
              </h2>
              <p className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight">
                Corporate & Site Office
              </p>
              <p className="text-xs text-slate-500 font-light mt-1">
                Reach out to our engineering leads directly via phone, email, or schedule an in-person site review at our Bhilwara headquarters.
              </p>
            </div>

            {contactItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-none border border-slate-200/80 bg-white flex items-start gap-5 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-none flex items-center justify-center shrink-0 bg-red-50 border border-red-100 text-construction-red">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                        {item.label}
                      </p>
                      {item.badge && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-100 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.value.split("\n").map((line, li) => (
                      <p
                        key={li}
                        className="text-sm font-semibold text-slate-900 leading-snug break-words"
                      >
                        {line}
                      </p>
                    ))}
                    {item.action && (
                      <a
                        href={item.action.href}
                        target={item.action.isExternal ? "_blank" : undefined}
                        rel={
                          item.action.isExternal
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-construction-red hover:text-red-700 uppercase tracking-wider mt-2.5 transition-colors font-display"
                      >
                        <span>{item.action.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick WhatsApp Support Box */}
            <div className="p-6 rounded-none border border-emerald-200 bg-emerald-50/60 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-mono">
                    Instant WhatsApp
                  </p>
                  <p className="text-xs text-emerald-800">
                    Quick engineering queries & drawing reviews
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors font-display shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Chat</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-none border border-slate-200/80 bg-white p-8 md:p-12 shadow-xl shadow-slate-900/5">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-construction-red" />
                  Direct Technical Dispatch
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-black font-display uppercase tracking-tight">
                  {formTitle}
                </h2>
                <p className="text-sm text-slate-500 font-light mt-1">
                  {formSubtitle}
                </p>
              </div>

              <ContactForm
                services={services}
                customCategories={contactContent.serviceCategories}
                responseNote={responseNote}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {showMap && (
        <section className="relative bg-slate-100 border-t border-slate-200">
          <div className="relative w-full h-[400px] md:h-[460px]">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hindustan Projects Bhilwara Office Location"
              className="grayscale-[20%] contrast-[1.05]"
            />

            {/* Floating Office Card */}
            <div className="absolute top-6 left-6 z-10 hidden sm:block max-w-sm bg-white/95 backdrop-blur-md p-5 border border-slate-300 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-none bg-construction-navy text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-construction-red" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Registered Headquarters
                  </p>
                  <p className="text-sm font-bold text-slate-900 font-display uppercase tracking-tight mt-0.5">
                    Hindustan Projects (HiPRO)
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {address}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={mapDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-construction-navy hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider transition-colors font-display"
                    >
                      <Navigation className="w-3 h-3 text-construction-red" />
                      <span>Directions</span>
                    </a>
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                      className="text-[11px] font-bold text-slate-700 hover:text-black uppercase tracking-wider underline underline-offset-2"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
