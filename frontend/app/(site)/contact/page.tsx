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

  let rawTitle =
    contactContent.metaTitle ||
    "Contact Office — Bhilwara, Rajasthan";
  if (rawTitle.includes(" | Hindustan Projects")) {
    rawTitle = rawTitle.replace(/\s*\|\s*Hindustan Projects.*/i, "").trim();
  }
  const title = rawTitle;
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
      {/* ─────────────────────────────────────────────────────────────
          HERO: Technical Engineering Dispatch & Architectural Command
          ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#071324] text-white pt-36 pb-20 md:pt-44 md:pb-28 px-4 overflow-hidden border-b border-slate-800">
        {/* Subtle Architectural Blueprint Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden="true"
        />

        {/* Ambient atmospheric lighting glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-construction-red/60 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Top Live Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-none bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="text-[11px] font-bold uppercase tracking-widest font-mono text-slate-300">
              {badge}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] font-semibold text-emerald-400">
              Active Site Dispatch
            </span>
          </div>

          {/* High-Impact Architectural Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-display uppercase tracking-tight leading-[1.12]">
            {headingPrefix}{" "}
            <span className="font-serif italic font-normal text-construction-red normal-case tracking-normal">
              {headingAccent}
            </span>
          </h1>

          {/* Subtitle with engineered clarity */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            {description}
          </p>

          {/* Fast-Action Technical CTAs Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center gap-2.5 bg-construction-red hover:bg-red-700 text-white font-bold px-7 py-3.5 rounded-none text-xs uppercase tracking-wider font-display shadow-lg shadow-red-600/30 transition-all hover:translate-y-[-1px]"
            >
              <Phone className="w-4 h-4" />
              <span>Call Technical Lead: {phone}</span>
            </a>

            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-none text-xs uppercase tracking-wider font-display shadow-md shadow-emerald-900/30 transition-all hover:translate-y-[-1px]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Instant WhatsApp</span>
            </a>

            <a
              href={mapDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold px-6 py-3.5 rounded-none text-xs uppercase tracking-wider font-display border border-white/20 transition-all hover:translate-y-[-1px]"
            >
              <Navigation className="w-4 h-4 text-construction-red" />
              <span>Bhilwara Office Location</span>
            </a>
          </div>

          {/* 4 Architectural Response Guarantees */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8 border-t border-white/10">
            {[
              { label: "Turnaround", title: "< 24-Hr Technical Quote", desc: "Detailed BOQ & site evaluation" },
              { label: "Site Inspection", title: "Regional Site Visits", desc: "Across Bhilwara & Rajasthan" },
              { label: "Direct Access", title: "Senior Engineers Only", desc: "Zero broker or sales middlemen" },
              { label: "Consultation", title: "Free Drawing Review", desc: "Architectural & structural checks" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/[0.04] backdrop-blur-sm border border-white/10 p-4 text-left hover:border-construction-red/50 transition-colors"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-construction-red font-mono mb-1">
                  {item.label}
                </p>
                <p className="text-xs sm:text-sm font-bold text-white font-display uppercase tracking-tight">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-400 font-light mt-0.5">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
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
                    {item.action ? (
                      <a
                        href={item.action.href}
                        target={item.action.isExternal ? "_blank" : undefined}
                        rel={
                          item.action.isExternal
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="block group"
                      >
                        {item.value.split("\n").map((line, li) => (
                          <p
                            key={li}
                            className="text-sm font-semibold text-slate-900 group-hover:text-construction-red transition-colors leading-snug break-words"
                          >
                            {line}
                          </p>
                        ))}
                      </a>
                    ) : (
                      item.value.split("\n").map((line, li) => (
                        <p
                          key={li}
                          className="text-sm font-semibold text-slate-900 leading-snug break-words"
                        >
                          {line}
                        </p>
                      ))
                    )}
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
          <div className="relative w-full h-[400px] md:h-[500px]">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hindustan Projects Bhilwara Office Location"
            />
          </div>
        </section>
      )}
    </>
  );
}
