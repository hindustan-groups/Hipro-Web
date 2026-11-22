"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Save,
  Loader2,
  Cloud,
  Share2,
  Phone,
  MapPin,
  Mail,
  Info,
  Layers,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Building2,
} from "lucide-react";
import type { Settings } from "@/lib/types";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "fczoredh",
    cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default",
  });

  // Structured state for socials
  const [socials, setSocials] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    pinterest: "",
  });

  const [projectsHeader, setProjectsHeader] = useState("Landmarks In The Making");

  // Home About dynamic fields
  const [homeAboutTag, setHomeAboutTag] = useState("About Hindustan Projects · Est. 2019");
  const [homeAboutHeading, setHomeAboutHeading] = useState("Engineering Landmarks. Building Trust in Rajasthan.");
  const [homeAboutText, setHomeAboutText] = useState(
    "Founded in 2019 in Bhilwara, Rajasthan, Hindustan Projects (HiPRO) is an engineering, construction, and infrastructure firm. From architectural planning and precise surveying to turnkey civil construction and infrastructure execution, Hindustan Projects delivers integrated solutions designed around quality, practical execution, and long-term value."
  );
  const [homeAboutBullet1Title, setHomeAboutBullet1Title] = useState("Engineering & Construction");
  const [homeAboutBullet1Desc, setHomeAboutBullet1Desc] = useState("Robust structural execution, heavy civil engineering, and durable residential and commercial developments built to code.");
  const [homeAboutBullet2Title, setHomeAboutBullet2Title] = useState("Turnkey Project Execution");
  const [homeAboutBullet2Desc, setHomeAboutBullet2Desc] = useState("Single-point accountability from blueprint to milestone handover, ensuring timeline adherence and budget control.");
  const [homeAboutBullet3Title, setHomeAboutBullet3Title] = useState("Architecture & Planning");
  const [homeAboutBullet3Desc, setHomeAboutBullet3Desc] = useState("Smart spatial layouts, 3D architectural visualization, and site-tailored master planning rooted in practical construction.");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings({
            ...data.data,
            cloudinaryCloudName:
              data.data.cloudinaryCloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "fczoredh",
            cloudinaryUploadPreset:
              data.data.cloudinaryUploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default",
          });

          if (data.data.socialLinks) {
            try {
              const parsedSocials = JSON.parse(data.data.socialLinks);
              setSocials((prev) => ({ ...prev, ...parsedSocials }));
            } catch {
              /* silent fallback */
            }
          }

          if (data.data.pageContent) {
            try {
              const parsedContent =
                typeof data.data.pageContent === "string"
                  ? JSON.parse(data.data.pageContent)
                  : data.data.pageContent;
              if (parsedContent.projectsHeader) setProjectsHeader(parsedContent.projectsHeader);
              if (parsedContent.homeAboutTag) setHomeAboutTag(parsedContent.homeAboutTag);
              if (parsedContent.homeAboutHeading) setHomeAboutHeading(parsedContent.homeAboutHeading);
              if (parsedContent.homeAboutText) setHomeAboutText(parsedContent.homeAboutText);

              if (parsedContent.homeAboutBullet1Title) setHomeAboutBullet1Title(parsedContent.homeAboutBullet1Title);
              else if (parsedContent.homeAboutBullet1) setHomeAboutBullet1Title(parsedContent.homeAboutBullet1);
              if (parsedContent.homeAboutBullet1Desc) setHomeAboutBullet1Desc(parsedContent.homeAboutBullet1Desc);

              if (parsedContent.homeAboutBullet2Title) setHomeAboutBullet2Title(parsedContent.homeAboutBullet2Title);
              else if (parsedContent.homeAboutBullet2) setHomeAboutBullet2Title(parsedContent.homeAboutBullet2);
              if (parsedContent.homeAboutBullet2Desc) setHomeAboutBullet2Desc(parsedContent.homeAboutBullet2Desc);

              if (parsedContent.homeAboutBullet3Title) setHomeAboutBullet3Title(parsedContent.homeAboutBullet3Title);
              else if (parsedContent.homeAboutBullet3) setHomeAboutBullet3Title(parsedContent.homeAboutBullet3);
              if (parsedContent.homeAboutBullet3Desc) setHomeAboutBullet3Desc(parsedContent.homeAboutBullet3Desc);
            } catch {
              /* silent fallback */
            }
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    // Preserve existing pageContent keys when updating
    let currentParsed: any = {};
    try {
      if (settings.pageContent) {
        currentParsed =
          typeof settings.pageContent === "string"
            ? JSON.parse(settings.pageContent)
            : settings.pageContent;
      }
    } catch {
      /* silent */
    }

    const updatedPageContent = {
      ...currentParsed,
      projectsHeader,
      homeAboutTag,
      homeAboutHeading,
      homeAboutText,
      homeAboutBullet1Title,
      homeAboutBullet1Desc,
      homeAboutBullet2Title,
      homeAboutBullet2Desc,
      homeAboutBullet3Title,
      homeAboutBullet3Desc,
    };

    const payload = {
      ...settings,
      socialLinks: JSON.stringify(socials),
      pageContent: JSON.stringify(updatedPageContent),
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag: "settings", paths: ["/", "/about"] }),
          });
        } catch {
          /* silent */
        }

        setMessage({ text: "HiPRO Web settings saved successfully!", type: "success" });
        setSettings((prev) => ({
          ...prev,
          pageContent: JSON.stringify(updatedPageContent),
          socialLinks: JSON.stringify(socials),
        }));
      } else {
        setMessage({ text: data.error || "Failed to save settings.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    }
    setSaving(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 font-medium">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" /> Loading HiPRO settings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ── Top Header Glass Breadcrumb ───────────────────────── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.03)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                href="/admin/hipro"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-all shadow-2xs group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to HiPRO Overview</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                HiPRO Web CMS
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              HiPRO Corporate Web · Site Settings
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">
              hindustanprojects.in · Cloudinary CDN media, civil office contact info, social channels, and homepage editorial copy.
            </p>
          </div>

          <a
            href="https://www.hindustanprojects.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all self-start sm:self-auto"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          </a>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── 1. Cloudinary Integration ────────────────────────── */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cloudinary CDN & Media Storage</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Image optimization and direct upload preset for civil projects, services, and team photos.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Cloud Name
              </label>
              <input
                type="text"
                value={settings.cloudinaryCloudName || ""}
                onChange={(e) => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
                placeholder="e.g. fczoredh"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Unsigned Upload Preset
              </label>
              <input
                type="text"
                value={settings.cloudinaryUploadPreset || ""}
                onChange={(e) => setSettings({ ...settings, cloudinaryUploadPreset: e.target.value })}
                placeholder="e.g. ml_default"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* ── 2. Civil Contact Details ─────────────────────────── */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Corporate Civil Contact Information</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Published in the website footer, navigation bar, and quote inquiry forms.
                </p>
              </div>
            </div>
            <Link
              href="/admin/contact-page"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all self-start sm:self-auto shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Full Contact Page & Map CMS →</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Official Inquiries Email
              </label>
              <input
                type="email"
                value={settings.companyEmail || ""}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                placeholder="info@hindustanprojects.in"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Civil Hotline Phone
              </label>
              <input
                type="text"
                value={settings.companyPhone || ""}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                placeholder="+91 75970 00601"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Corporate Headquarters Address (Bhilwara)
              </label>
              <input
                type="text"
                value={settings.companyAddress || ""}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                placeholder="Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── 3. Social Media Links ────────────────────────────── */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-100 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Official Social Media Links</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Verified public links displayed across hindustanprojects.in footer and headers.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Instagram URL
              </label>
              <input
                type="url"
                value={socials.instagram}
                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                placeholder="https://www.instagram.com/hindustan_projects/"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={socials.linkedin}
                onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/hindustanprojects"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Facebook URL
              </label>
              <input
                type="url"
                value={socials.facebook}
                onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                placeholder="https://facebook.com/hindustanprojects"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Pinterest URL
              </label>
              <input
                type="url"
                value={socials.pinterest || ""}
                onChange={(e) => setSocials({ ...socials, pinterest: e.target.value })}
                placeholder="https://pin.it/5OlMWwi2w"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Twitter / X URL
              </label>
              <input
                type="url"
                value={socials.twitter}
                onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                placeholder="https://twitter.com/hindustan_proj"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── 4. Homepage Dynamic Civil Sections ───────────────── */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/70 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Homepage Dynamic Civil Sections</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Headlines and intro narrative displayed directly on the hindustanprojects.in landing page.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Projects Showcase Section Title
              </label>
              <input
                type="text"
                value={projectsHeader}
                onChange={(e) => setProjectsHeader(e.target.value)}
                placeholder="e.g. Landmarks In The Making"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                  Home About Tag / Badge
                </label>
                <input
                  type="text"
                  value={homeAboutTag}
                  onChange={(e) => setHomeAboutTag(e.target.value)}
                  placeholder="e.g. About Hindustan Projects · Est. 2019"
                  className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                  Home About Heading
                </label>
                <input
                  type="text"
                  value={homeAboutHeading}
                  onChange={(e) => setHomeAboutHeading(e.target.value)}
                  placeholder="e.g. Engineering Landmarks. Building Trust in Rajasthan."
                  className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1.5 font-bold font-mono">
                Home About Narrative Description
              </label>
              <textarea
                rows={3}
                value={homeAboutText}
                onChange={(e) => setHomeAboutText(e.target.value)}
                placeholder="Brief narrative of HiPRO civil engineering firm..."
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* 3 Core Highlight Bullets */}
            <div className="pt-2">
              <label className="text-slate-500 text-[11px] uppercase tracking-wider block mb-2 font-bold font-mono">
                Homepage 3 Core Capabilities Bullets
              </label>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <input
                    type="text"
                    value={homeAboutBullet1Title}
                    onChange={(e) => setHomeAboutBullet1Title(e.target.value)}
                    placeholder="Bullet 1 Title"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <textarea
                    rows={2}
                    value={homeAboutBullet1Desc}
                    onChange={(e) => setHomeAboutBullet1Desc(e.target.value)}
                    placeholder="Bullet 1 Description..."
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg p-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <input
                    type="text"
                    value={homeAboutBullet2Title}
                    onChange={(e) => setHomeAboutBullet2Title(e.target.value)}
                    placeholder="Bullet 2 Title"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <textarea
                    rows={2}
                    value={homeAboutBullet2Desc}
                    onChange={(e) => setHomeAboutBullet2Desc(e.target.value)}
                    placeholder="Bullet 2 Description..."
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg p-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <input
                    type="text"
                    value={homeAboutBullet3Title}
                    onChange={(e) => setHomeAboutBullet3Title(e.target.value)}
                    placeholder="Bullet 3 Title"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <textarea
                    rows={2}
                    value={homeAboutBullet3Desc}
                    onChange={(e) => setHomeAboutBullet3Desc(e.target.value)}
                    placeholder="Bullet 3 Description..."
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg p-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Actions Floating Bar ────────────────────────── */}
        <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between sticky bottom-4 z-20">
          <div>
            {message.text && (
              <p
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  message.type === "success" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {message.type === "success" && <CheckCircle2 className="w-4 h-4" />}
                {message.text}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#0F2C59] hover:bg-blue-900 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : "Save HiPRO Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
