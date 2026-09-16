"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Cloud, Share2, Phone, MapPin, Mail, Info, Layers, ExternalLink } from "lucide-react";
import type { Settings } from "@/lib/types";

interface GroupCompanyConfig {
  name: string;
  description: string;
  website: string;
  status: string;
  active: boolean;
  order: number;
}

const DEFAULT_GROUP_COMPANIES: GroupCompanyConfig[] = [
  {
    name: "Hindustan Projects",
    description: "Core Architecture, Turnkey Civil Construction & Infrastructure Execution.",
    website: "https://www.hindustanprojects.in/",
    status: "Flagship",
    active: true,
    order: 1,
  },
  {
    name: "HiPro Marketing",
    description: "Marketing and brand solutions under the Hindustan Group.",
    website: "",
    status: "Coming Soon",
    active: true,
    order: 2,
  },
  {
    name: "HiPro IT Services",
    description: "Digital solutions and technology services under the Hindustan Group.",
    website: "https://www.itservices.hindustanprojects.in/",
    status: "Live Portal",
    active: true,
    order: 3,
  },
  {
    name: "Hindustan Empanelment",
    description: "Contractor, Vendor & Institutional Empanelment Services.",
    website: "https://empanelment.hindustanprojects.in/",
    status: "Live Portal",
    active: true,
    order: 4,
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "fczoredh",
    cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"
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

  // Group companies ecosystem
  const [groupCompanies, setGroupCompanies] = useState<GroupCompanyConfig[]>(DEFAULT_GROUP_COMPANIES);

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
            cloudinaryCloudName: data.data.cloudinaryCloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "fczoredh",
            cloudinaryUploadPreset: data.data.cloudinaryUploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"
          });
          
          if (data.data.socialLinks) {
            try {
              const parsedSocials = JSON.parse(data.data.socialLinks);
              setSocials((prev) => ({ ...prev, ...parsedSocials }));
            } catch { /* silent fallback */ }
          }

          if (data.data.pageContent) {
            try {
              const parsedContent = JSON.parse(data.data.pageContent);
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

              if (parsedContent.groupCompanies && Array.isArray(parsedContent.groupCompanies) && parsedContent.groupCompanies.length > 0) {
                setGroupCompanies(parsedContent.groupCompanies);
              }
            } catch { /* silent fallback */ }
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleGroupCompanyChange = (index: number, field: keyof GroupCompanyConfig, value: any) => {
    setGroupCompanies((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    // Preserve existing pageContent keys when updating
    let currentParsed = {};
    try {
      if (settings.pageContent) currentParsed = JSON.parse(settings.pageContent);
    } catch { /* silent */ }

    // Cleanse deprecated legacy dummy keys that contained old 1999 / demo content
    const deprecatedKeys = [
      "aboutStory",
      "aboutChecklist",
      "aboutHero",
      "aboutHeritageTag",
      "aboutStoryTitle",
      "aboutBadge1Label",
      "aboutBadge1Value",
      "aboutBadge2Label",
      "aboutBadge2Value",
      "valuesSubtitle",
      "valuesTitle",
      "valuesTag"
    ];
    deprecatedKeys.forEach((k) => delete (currentParsed as any)[k]);

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
      groupCompanies,
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
        setMessage({ text: "Settings saved successfully!", type: "success" });
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
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-construction-navy" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Global Settings</h1>
        <p className="text-slate-500 text-sm">Manage site-wide contact info, homepage dynamic sections, group companies, and Cloudinary keys.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden space-y-0">
        
        {/* ── 1. Cloudinary Integration ────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none bg-blue-50 flex items-center justify-center border border-blue-100">
              <Cloud className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Cloudinary Integration</h2>
              <p className="text-slate-500 text-xs mt-0.5">Configure cloud storage for image uploads.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Cloud Name</label>
              <input 
                type="text" 
                value={settings.cloudinaryCloudName || ""} 
                onChange={(e) => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
                placeholder="e.g. dxyz123ab"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all placeholder:text-slate-400 font-mono" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Unsigned Upload Preset</label>
              <input 
                type="text" 
                value={settings.cloudinaryUploadPreset || ""} 
                onChange={(e) => setSettings({ ...settings, cloudinaryUploadPreset: e.target.value })}
                placeholder="e.g. my_preset"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all placeholder:text-slate-400 font-mono" 
              />
            </div>
          </div>
        </div>

        {/* ── 2. Contact Details ───────────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none bg-slate-100 flex items-center justify-center border border-slate-200">
              <Phone className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Company Contact Information</h2>
              <p className="text-slate-500 text-xs mt-0.5">Appears in footer and on the Contact page.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Email Address</label>
              <input 
                type="email" 
                value={settings.companyEmail || ""} 
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                placeholder="info@hindustanprojects.in"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Phone Number</label>
              <input 
                type="text" 
                value={settings.companyPhone || ""} 
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                placeholder="+91 75970 00601"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Headquarters Address</label>
              <input 
                type="text" 
                value={settings.companyAddress || ""} 
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                placeholder="Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001, India"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
          </div>
        </div>

        {/* ── 3. Social Media Links ────────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none bg-red-50 flex items-center justify-center border border-red-100">
              <Share2 className="w-5 h-5 text-construction-red" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Social Media Links</h2>
              <p className="text-slate-500 text-xs mt-0.5">Verified links will render in the website footer.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Instagram URL</label>
              <input 
                type="url" 
                value={socials.instagram} 
                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                placeholder="https://www.instagram.com/hindustan_projects/"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Facebook URL</label>
              <input 
                type="url" 
                value={socials.facebook} 
                onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                placeholder="https://www.facebook.com/people/Hindustan-Projects"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">LinkedIn URL</label>
              <input 
                type="url" 
                value={socials.linkedin} 
                onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/hindustanprojects"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Pinterest URL</label>
              <input 
                type="url" 
                value={socials.pinterest || ""} 
                onChange={(e) => setSocials({ ...socials, pinterest: e.target.value })}
                placeholder="https://pin.it/5OlMWwi2w"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Twitter / X URL</label>
              <input 
                type="url" 
                value={socials.twitter} 
                onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                placeholder="https://twitter.com/your-handle"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>
          </div>
        </div>

        {/* ── 4. Homepage Section Titles ─────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/20">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Homepage Section Titles</h2>
            <p className="text-slate-500 text-xs mt-0.5">Customize default section headings on the homepage.</p>
          </div>

          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Projects Section Title</label>
            <input 
              type="text" 
              value={projectsHeader} 
              onChange={(e) => setProjectsHeader(e.target.value)}
              placeholder="e.g. Landmarks In The Making"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-medium" 
            />
          </div>
        </div>

        {/* ── 5. Home About / Intro ───────────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none bg-amber-50 flex items-center justify-center border border-amber-200">
              <Info className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Home About / Introduction</h2>
              <p className="text-slate-500 text-xs mt-0.5">Control the introductory overview displayed on the homepage.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Home About Tag / Badge</label>
                <input 
                  type="text" 
                  value={homeAboutTag} 
                  onChange={(e) => setHomeAboutTag(e.target.value)}
                  placeholder="e.g. About Hindustan Projects · Est. 2019"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
                />
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Home About Heading</label>
                <input 
                  type="text" 
                  value={homeAboutHeading} 
                  onChange={(e) => setHomeAboutHeading(e.target.value)}
                  placeholder="e.g. Engineering Landmarks. Building Trust in Rajasthan."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Home About Description</label>
              <textarea 
                rows={3}
                value={homeAboutText} 
                onChange={(e) => setHomeAboutText(e.target.value)}
                placeholder="Comprehensive corporate overview paragraph..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" 
              />
            </div>

            {/* Bullets / Pillars */}
            <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Intro Key Pillars / Bullets</h3>
              
              {/* Pillar 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-[11px] font-bold text-construction-navy uppercase tracking-wider">Pillar 1</p>
                <input 
                  type="text" 
                  value={homeAboutBullet1Title} 
                  onChange={(e) => setHomeAboutBullet1Title(e.target.value)}
                  placeholder="Pillar 1 Title (e.g. Engineering & Construction)"
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-construction-navy" 
                />
                <textarea 
                  rows={2}
                  value={homeAboutBullet1Desc} 
                  onChange={(e) => setHomeAboutBullet1Desc(e.target.value)}
                  placeholder="Pillar 1 Description..."
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy" 
                />
              </div>

              {/* Pillar 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-[11px] font-bold text-construction-navy uppercase tracking-wider">Pillar 2</p>
                <input 
                  type="text" 
                  value={homeAboutBullet2Title} 
                  onChange={(e) => setHomeAboutBullet2Title(e.target.value)}
                  placeholder="Pillar 2 Title (e.g. Turnkey Project Execution)"
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-construction-navy" 
                />
                <textarea 
                  rows={2}
                  value={homeAboutBullet2Desc} 
                  onChange={(e) => setHomeAboutBullet2Desc(e.target.value)}
                  placeholder="Pillar 2 Description..."
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy" 
                />
              </div>

              {/* Pillar 3 */}
              <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-[11px] font-bold text-construction-navy uppercase tracking-wider">Pillar 3</p>
                <input 
                  type="text" 
                  value={homeAboutBullet3Title} 
                  onChange={(e) => setHomeAboutBullet3Title(e.target.value)}
                  placeholder="Pillar 3 Title (e.g. Architecture & Planning)"
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-construction-navy" 
                />
                <textarea 
                  rows={2}
                  value={homeAboutBullet3Desc} 
                  onChange={(e) => setHomeAboutBullet3Desc(e.target.value)}
                  placeholder="Pillar 3 Description..."
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 6. Hindustan Group Companies ───────────────────────── */}
        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-none bg-indigo-50 flex items-center justify-center border border-indigo-200">
              <Layers className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Hindustan Group Ecosystem</h2>
              <p className="text-slate-500 text-xs mt-0.5">Manage group companies, status badges, and external portal URLs.</p>
            </div>
          </div>

          <div className="space-y-4">
            {groupCompanies.map((company, index) => (
              <div key={index} className="p-4 bg-white border border-slate-200 rounded-none space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-construction-navy">
                    Company #{index + 1}: {company.name}
                  </span>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={company.active !== false}
                      onChange={(e) => handleGroupCompanyChange(index, "active", e.target.checked)}
                      className="rounded-none text-construction-navy focus:ring-construction-navy"
                    />
                    Active on Homepage
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={company.name}
                      onChange={(e) => handleGroupCompanyChange(index, "name", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status Badge Text</label>
                    <select
                      value={company.status}
                      onChange={(e) => handleGroupCompanyChange(index, "status", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy"
                    >
                      <option value="Flagship">Flagship</option>
                      <option value="Live Portal">Live Portal</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Portal Website URL</label>
                  <input 
                    type="url" 
                    value={company.website}
                    onChange={(e) => handleGroupCompanyChange(index, "website", e.target.value)}
                    placeholder="https://... (Leave blank for Coming Soon)"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Short Description</label>
                  <textarea 
                    rows={2}
                    value={company.description}
                    onChange={(e) => handleGroupCompanyChange(index, "description", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form Actions ───────────────────────────────────── */}
        <div className="bg-slate-50 p-6 flex items-center justify-between">
          <div>
            {message.text && (
              <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            )}
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-6 py-2.5 rounded-none text-sm font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
