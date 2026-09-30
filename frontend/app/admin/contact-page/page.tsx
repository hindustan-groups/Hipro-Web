"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  ExternalLink,
  RotateCcw,
  Eye,
  Sparkles,
  Layers,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import type { ContactPageContent, Settings } from "@/lib/types";
import { COMPANY_INFO } from "@/lib/companyData";

const VERIFIED_BHILWARA_MAP_EMBED =
  "https://maps.google.com/maps?q=Hindustan%20Projects%2C%20Opposite%20Mukherji%20Park%2C%20Above%20Bhagwati%20Coffee%20House%2C%20Bhopal%20Ganj%2C%20Bhilwara%2C%20Rajasthan%20311001&t=&z=16&ie=UTF8&iwloc=&output=embed";

const VERIFIED_BHILWARA_DIRECTIONS =
  "https://www.google.com/maps/search/?api=1&query=Hindustan+Projects+Opposite+Mukherji+Park+Above+Bhagwati+Coffee+House+Bhopal+Ganj+Bhilwara+Rajasthan+311001";

export default function AdminContactPageCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });

  const [activeTab, setActiveTab] = useState<"info" | "map" | "form" | "seo">("info");

  // Form state
  const [badge, setBadge] = useState("Engineering Inquiry");
  const [headingPrefix, setHeadingPrefix] = useState("Get In");
  const [headingAccent, setHeadingAccent] = useState("Touch");
  const [description, setDescription] = useState(
    "Connect with our technical engineering team for project quotes, architectural planning, site evaluations, or partnership inquiries."
  );

  const [address, setAddress] = useState(COMPANY_INFO.address);
  const [phone, setPhone] = useState(COMPANY_INFO.formattedPhone);
  const [email, setEmail] = useState(COMPANY_INFO.email);
  const [businessHours, setBusinessHours] = useState(
    "Monday–Saturday: 9:00 AM – 7:00 PM\nSunday: Closed"
  );
  const [whatsapp, setWhatsapp] = useState(COMPANY_INFO.whatsappNumber || "917597000601");

  const [formTitle, setFormTitle] = useState("Send Us A Message");
  const [formSubtitle, setFormSubtitle] = useState(
    "Fill out your project specifications and our technical leads will reach out within 24 hours."
  );
  const [responseNote, setResponseNote] = useState(
    "Our senior project engineers will respond within 24 business hours."
  );
  const [customServicesText, setCustomServicesText] = useState("");

  const [showMap, setShowMap] = useState(true);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(VERIFIED_BHILWARA_MAP_EMBED);
  const [mapDirectionsUrl, setMapDirectionsUrl] = useState(VERIFIED_BHILWARA_DIRECTIONS);

  const [metaTitle, setMetaTitle] = useState(
    "Contact Us | Hindustan Projects (HiPRO) — Bhilwara, Rajasthan"
  );
  const [metaDescription, setMetaDescription] = useState(
    "Get in touch with Hindustan Projects (HiPRO) for construction inquiries, architectural consultation, turnkey civil contracting, and site evaluations in Bhilwara, Rajasthan."
  );

  // Preserve full settings document
  const [fullSettings, setFullSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFullSettings(data.data);
          let parsedContent: any = {};
          try {
            if (data.data.pageContent) {
              parsedContent =
                typeof data.data.pageContent === "string"
                  ? JSON.parse(data.data.pageContent)
                  : data.data.pageContent;
            }
          } catch {
            parsedContent = {};
          }

          const cp: ContactPageContent = parsedContent.contactPage || {};

          if (cp.badge) setBadge(cp.badge);
          if (cp.headingPrefix) setHeadingPrefix(cp.headingPrefix);
          if (cp.headingAccent) setHeadingAccent(cp.headingAccent);
          if (cp.description) setDescription(cp.description);

          if (cp.address || data.data.companyAddress) {
            setAddress(cp.address || data.data.companyAddress);
          }
          if (cp.phone || data.data.companyPhone) {
            setPhone(cp.phone || data.data.companyPhone);
          }
          if (cp.email || data.data.companyEmail) {
            setEmail(cp.email || data.data.companyEmail);
          }
          if (cp.businessHours) setBusinessHours(cp.businessHours);
          if (cp.whatsapp) setWhatsapp(cp.whatsapp);

          if (cp.formTitle) setFormTitle(cp.formTitle);
          if (cp.formSubtitle) setFormSubtitle(cp.formSubtitle);
          if (cp.responseNote) setResponseNote(cp.responseNote);
          if (Array.isArray(cp.serviceCategories)) {
            setCustomServicesText(cp.serviceCategories.join("\n"));
          }

          if (cp.showMap !== undefined) setShowMap(cp.showMap);
          if (cp.mapEmbedUrl) setMapEmbedUrl(cp.mapEmbedUrl);
          if (cp.mapDirectionsUrl) setMapDirectionsUrl(cp.mapDirectionsUrl);

          if (cp.metaTitle) setMetaTitle(cp.metaTitle);
          if (cp.metaDescription) setMetaDescription(cp.metaDescription);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Smart handler to strip <iframe src="..."> if pasted by user
  const handleMapEmbedChange = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.includes("<iframe") && trimmed.includes("src=")) {
      const match = trimmed.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) {
        setMapEmbedUrl(match[1]);
        return;
      }
    }
    setMapEmbedUrl(trimmed);
  };

  const handleResetMap = () => {
    setMapEmbedUrl(VERIFIED_BHILWARA_MAP_EMBED);
    setMapDirectionsUrl(VERIFIED_BHILWARA_DIRECTIONS);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: "", type: "" });

    try {
      let currentParsed: any = {};
      if (fullSettings?.pageContent) {
        try {
          currentParsed =
            typeof fullSettings.pageContent === "string"
              ? JSON.parse(fullSettings.pageContent)
              : fullSettings.pageContent;
        } catch {
          currentParsed = {};
        }
      }

      const serviceCategoriesList = customServicesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const contactPagePayload: ContactPageContent = {
        badge: badge.trim(),
        headingPrefix: headingPrefix.trim(),
        headingAccent: headingAccent.trim(),
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        businessHours: businessHours.trim(),
        whatsapp: whatsapp.trim(),
        formTitle: formTitle.trim(),
        formSubtitle: formSubtitle.trim(),
        responseNote: responseNote.trim(),
        serviceCategories:
          serviceCategoriesList.length > 0 ? serviceCategoriesList : undefined,
        showMap,
        mapEmbedUrl: mapEmbedUrl.trim(),
        mapDirectionsUrl: mapDirectionsUrl.trim(),
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
      };

      const updatedPageContent = {
        ...currentParsed,
        contactPage: contactPagePayload,
      };

      const payload = {
        pageContent: JSON.stringify(updatedPageContent),
        companyAddress: address.trim(),
        companyPhone: phone.trim(),
        companyEmail: email.trim(),
      };

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        // Trigger instant cache revalidation for the contact page
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: ["/contact"], tags: ["settings"] }),
          });
        } catch {
          // non-blocking
        }

        setStatusMessage({
          text: "Contact page content & map settings saved successfully! Live site updated.",
          type: "success",
        });
      } else {
        setStatusMessage({
          text: json.error || "Failed to save contact page settings",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "Network error occurred while saving.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-construction-red" />
        <p className="text-xs uppercase tracking-widest font-mono text-slate-500">
          Loading Contact Page CMS...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-none bg-construction-red" />
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-display uppercase tracking-tight">
              Contact Page CMS
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-light">
            Manage all content on <span className="font-mono text-slate-700 font-medium">/contact</span>, including office details, form categories, and Google Maps embed location.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:text-black hover:border-slate-300 text-xs font-semibold uppercase tracking-wider font-display shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View Live Page</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-construction-red hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider font-display shadow-md shadow-red-600/20 transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage.text && (
        <div
          className={`p-4 border text-xs font-medium flex items-center justify-between gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage({ text: "", type: "" })}
            className="text-[11px] font-bold uppercase underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "info", label: "Office & Contact Info", icon: Phone },
          { id: "map", label: "Google Maps Location", icon: MapPin },
          { id: "form", label: "Inquiry Form & Categories", icon: MessageSquare },
          { id: "seo", label: "SEO & Meta Data", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider font-display border transition-all ${
                isActive
                  ? "bg-construction-navy text-white border-construction-navy shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? "text-construction-red" : "text-slate-400"
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Office & Contact Info */}
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-construction-red" />
                Hero Banner Content
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Header Badge
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Engineering Inquiry"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Heading Prefix
                  </label>
                  <input
                    type="text"
                    value={headingPrefix}
                    onChange={(e) => setHeadingPrefix(e.target.value)}
                    placeholder="Get In"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Heading Accent (Red Italic)
                  </label>
                  <input
                    type="text"
                    value={headingAccent}
                    onChange={(e) => setHeadingAccent(e.target.value)}
                    placeholder="Touch"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Intro Subtitle
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Connect with our technical engineering team for project quotes, site evaluations, or partnership inquiries."
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none resize-none"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-construction-red" />
                Office Communication Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Headquarters Address
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001, India"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Business Hours
                  </label>
                  <textarea
                    rows={2}
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    placeholder="Monday–Saturday: 9:00 AM – 7:00 PM&#10;Sunday: Closed"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none resize-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Direct Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 75970 00601"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@hindustanprojects.in"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+91 75970 00601"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Google Maps Location */}
        {activeTab === "map" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-construction-red" />
                    Google Maps Integration & Location Fix
                  </h2>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Fix the map location or paste any Google Maps embed link or coordinates.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetMap}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider font-display transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Reset to Bhilwara Office</span>
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showMap}
                      onChange={(e) => setShowMap(e.target.checked)}
                      className="w-4 h-4 accent-construction-red"
                    />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Show Map on Page
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Map Embed URL or &lt;iframe&gt; code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={mapEmbedUrl}
                    onChange={(e) => handleMapEmbedChange(e.target.value)}
                    placeholder="https://maps.google.com/maps?q=... or <iframe src='...'></iframe>"
                    className="w-full px-3 py-2.5 border border-slate-300 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                  <span>Tip: You can paste a full Google Maps &lt;iframe&gt; snippet here; the system automatically extracts the clean embed URL.</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Maps Directions Link (Opens Google Maps App / Navigation)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={mapDirectionsUrl}
                    onChange={(e) => setMapDirectionsUrl(e.target.value)}
                    placeholder="https://www.google.com/maps/search/?api=1&query=..."
                    className="flex-1 px-3 py-2 border border-slate-300 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                  <a
                    href={mapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider font-display flex items-center gap-1 shrink-0"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Live Preview */}
              <div className="border border-slate-200 p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-construction-red" />
                  Live Map Embed Preview
                </p>
                {mapEmbedUrl ? (
                  <div className="w-full h-72 bg-slate-200 border border-slate-300 overflow-hidden relative">
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Map Location Preview"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">
                    No map embed URL provided.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Inquiry Form & Categories */}
        {activeTab === "form" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-construction-red" />
                Contact Form Configuration
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Form Title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Send Us A Message"
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Response Commitment Note
                  </label>
                  <input
                    type="text"
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    placeholder="Our senior project engineers will respond within 24 business hours."
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Form Subtitle / Instructions
                </label>
                <textarea
                  rows={2}
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Fill out your project specifications and our technical leads will reach out within 24 hours."
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Category Dropdown Options (One per line)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Leave blank to automatically synchronize and display active services from your database with auto-corrected typography (e.g. Architecture & Planning, Turnkey Construction, etc.).
                </p>
                <textarea
                  rows={8}
                  value={customServicesText}
                  onChange={(e) => setCustomServicesText(e.target.value)}
                  placeholder={`Architecture & Planning\nProfessional Construction Services\nSurveying & Site Measurements\nInterior & Exterior Design\nWater Treatment Plant Construction\nProject Management & Consultancy\nStructural Engineering & Analysis\nConstruction Cost Estimation & BOQ`}
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SEO & Meta */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-construction-red" />
                Search Engine Optimization (SEO)
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Page Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Contact Us | Hindustan Projects (HiPRO) — Bhilwara, Rajasthan"
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Get in touch with Hindustan Projects (HiPRO) for construction inquiries, architectural consultation, turnkey civil contracting, and site evaluations in Bhilwara, Rajasthan."
                  className="w-full px-3 py-2 border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-construction-red focus:border-construction-red outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-light">
            Remember to save your changes to publish them to the live website.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-construction-red hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider font-display shadow-md shadow-red-600/20 transition-all"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
