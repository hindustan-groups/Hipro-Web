"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Phone,
  Building2,
  Image as ImageIcon,
  Shield,
  Check,
  X,
  Compass,
  ArrowRight,
  MessageSquare,
  Wrench,
  RotateCcw,
  Sliders,
  Sparkles,
  Accessibility,
  Eye,
  Smartphone,
  Monitor,
  MapPin,
  Globe,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import type { HbsContent, HbsNavbarConfig, HbsNavbarItem } from "@/lib/types";
import HbsImageUploader from "@/components/hbs/admin/HbsImageUploader";
import HbsAdminPageHeader from "@/components/hbs/admin/HbsAdminPageHeader";
import HbsNavbar, { DEFAULT_NAVBAR_CONFIG } from "@/components/hbs/HbsNavbar";

type SettingsTab = "navbar" | "footer" | "contact" | "social_legal";
type PreviewMode = "desktop" | "mobile";

export default function HbsAdminSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams?.get("tab") as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromQuery || "navbar");

  const switchTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.replace(`/admin/hbs/settings?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    if (tabFromQuery && ["navbar", "footer", "contact", "social_legal"].includes(tabFromQuery)) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [content, setContent] = useState<Partial<HbsContent>>({});
  const [navConfig, setNavConfig] = useState<HbsNavbarConfig>(DEFAULT_NAVBAR_CONFIG);
  const [footerConfig, setFooterConfig] = useState<{
    pillars: Array<{ label: string; icon: string }>;
    heritageCard: {
      badge: string;
      text: string;
      linkText: string;
      linkUrl: string;
    };
    copyrightText: string;
    enterpriseText: string;
    enterpriseUrl: string;
  }>({
    pillars: [
      { label: "Up to 10-Yr Warranty", icon: "ShieldCheck" },
      { label: "Civil Engineer Supervision", icon: "HardHat" },
      { label: "ISI Certified Branded Materials", icon: "CheckCircle2" },
      { label: "Doorstep Rajasthan Service", icon: "Sparkles" },
    ],
    heritageCard: {
      badge: "A Brand Under Hindustan Projects",
      text: "Backed by the civil engineering heritage of Hindustan Projects (HiPRO). Bringing industrial civil rigor to property repair and maintenance.",
      linkText: "Hindustan Projects (HiPRO)",
      linkUrl: "https://www.hindustanprojects.in",
    },
    copyrightText: "© 2026 Hind Building Solutions (HiBUILD). All rights reserved.",
    enterpriseText: "An Enterprise of Hindustan Projects",
    enterpriseUrl: "https://www.hindustanprojects.in",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  // Initial snapshot to track unsaved changes
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");

  // Social links parsed state
  const [socials, setSocials] = useState<{
    instagram: string;
    facebook: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  }>({
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    youtube: "",
  });

  const loadSettings = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/hbs/content", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setContent(json.data);

        // Parse Navbar configuration from ctaSettings
        let parsedNav: HbsNavbarConfig = DEFAULT_NAVBAR_CONFIG;
        if (json.data.ctaSettings) {
          try {
            const parsed =
              typeof json.data.ctaSettings === "string"
                ? JSON.parse(json.data.ctaSettings)
                : json.data.ctaSettings;
            if (parsed && typeof parsed === "object") {
              const raw = parsed.navbar || parsed;
              parsedNav = {
                navItems: Array.isArray(raw.navItems) ? raw.navItems : DEFAULT_NAVBAR_CONFIG.navItems,
                primaryCta: { ...DEFAULT_NAVBAR_CONFIG.primaryCta, ...(raw.primaryCta || {}) },
                contactActions: { ...DEFAULT_NAVBAR_CONFIG.contactActions, ...(raw.contactActions || {}) },
                behaviour: { ...DEFAULT_NAVBAR_CONFIG.behaviour, ...(raw.behaviour || {}) },
                animation: { ...DEFAULT_NAVBAR_CONFIG.animation, ...(raw.animation || {}) },
                branding: { ...DEFAULT_NAVBAR_CONFIG.branding, ...(raw.branding || {}) },
                accessibility: { ...DEFAULT_NAVBAR_CONFIG.accessibility, ...(raw.accessibility || {}) },
              };
            }
          } catch {
            parsedNav = DEFAULT_NAVBAR_CONFIG;
          }
        }
        setNavConfig(parsedNav);

        // Parse Footer configuration from ctaSettings
        if (json.data.ctaSettings) {
          try {
            const parsed =
              typeof json.data.ctaSettings === "string"
                ? JSON.parse(json.data.ctaSettings)
                : json.data.ctaSettings;
            if (parsed && typeof parsed === "object" && parsed.footer) {
              setFooterConfig((prev) => ({
                ...prev,
                ...parsed.footer,
                pillars:
                  Array.isArray(parsed.footer.pillars) && parsed.footer.pillars.length > 0
                    ? parsed.footer.pillars
                    : prev.pillars,
                heritageCard: { ...prev.heritageCard, ...(parsed.footer.heritageCard || {}) },
              }));
            }
          } catch {}
        }

        // Parse Socials
        let parsedSocials = {
          instagram: "",
          facebook: "",
          linkedin: "",
          twitter: "",
          youtube: "",
        };
        if (json.data.socialLinks) {
          try {
            const parsed =
              typeof json.data.socialLinks === "string"
                ? JSON.parse(json.data.socialLinks)
                : json.data.socialLinks;
            parsedSocials = {
              instagram: parsed.instagram || "",
              facebook: parsed.facebook || "",
              linkedin: parsed.linkedin || "",
              twitter: parsed.twitter || "",
              youtube: parsed.youtube || "",
            };
          } catch {}
        }
        setSocials(parsedSocials);

        // Store baseline snapshot
        setInitialSnapshot(
          JSON.stringify({
            content: json.data,
            navConfig: parsedNav,
            footerConfig,
            socials: parsedSocials,
          })
        );
      } else {
        setMessage({ text: json.error || "Failed to load HBS settings.", type: "error" });
      }
    } catch {
      setMessage({ text: "Failed to connect to backend API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Compute dirty/unsaved state
  const isDirty = useMemo(() => {
    if (!initialSnapshot) return false;
    const currentSnapshot = JSON.stringify({
      content,
      navConfig,
      socials,
    });
    return currentSnapshot !== initialSnapshot;
  }, [initialSnapshot, content, navConfig, socials]);

  // Warn user if leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (field: keyof HbsContent, value: any) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleNavItemChange = (id: string, field: keyof HbsNavbarItem, value: any) => {
    setNavConfig((prev) => ({
      ...prev,
      navItems: prev.navItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleResetToRecommended = useCallback(() => {
    if (window.confirm("Reset all navbar controls to recommended Apple-minimal defaults?")) {
      setNavConfig(DEFAULT_NAVBAR_CONFIG);
      setMessage({ text: "Navbar settings reset to recommended defaults. Click 'Save Changes' to apply.", type: "success" });
    }
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      let currentCtaSettings: any = {};
      try {
        if (content.ctaSettings) {
          currentCtaSettings =
            typeof content.ctaSettings === "string"
              ? JSON.parse(content.ctaSettings)
              : content.ctaSettings;
        }
      } catch {}

      const updatedCtaSettings = {
        ...currentCtaSettings,
        navbar: navConfig,
        footer: footerConfig,
      };

      const payload = {
        ...content,
        ctaSettings: JSON.stringify(updatedCtaSettings),
        socialLinks: JSON.stringify(socials),
      };

      const res = await fetch("/api/hbs/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSavedRecently(true);
        setTimeout(() => setSavedRecently(false), 2500);

        setInitialSnapshot(
          JSON.stringify({
            content: json.data || content,
            navConfig,
            footerConfig,
            socials,
          })
        );

        setMessage({ text: "Navbar and system settings saved successfully!", type: "success" });
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              paths: ["/hbs", "/hbs/about", "/hbs/services", "/hbs/projects", "/hbs/contact", "/hbs/why-choose-us"],
              tags: ["hbs-content"],
            }),
          });
        } catch {}
      } else {
        setMessage({ text: json.error || "Failed to save settings.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-xs uppercase tracking-wider font-mono">Loading Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-24">
      {/* Apple-minimal Header */}
      <HbsAdminPageHeader
        breadcrumbs={[{ label: "Settings" }]}
        title="Navbar & System Settings"
        description="Manage the Hind Building Solutions public navbar, brand assets, live preview, behaviour, and animations."
      >
        <div className="flex items-center gap-2.5">
          {isDirty ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved changes</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>All changes saved</span>
            </span>
          )}

          <button
            type="button"
            onClick={loadSettings}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all shadow-[0_4px_14px_rgba(239,68,68,0.35)] disabled:opacity-50 min-h-[38px]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : savedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </HbsAdminPageHeader>

      {message.text && (
        <div
          className={`p-4 text-xs flex items-center gap-2.5 rounded-2xl border transition-all ${
            message.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800 shadow-sm"
              : "bg-red-50/90 border-red-200 text-red-800 shadow-sm"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* Apple Segmented Tabs Bar */}
      <div className="p-1.5 bg-slate-200/50 backdrop-blur-2xl rounded-2xl border border-white/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => switchTab("navbar")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "navbar"
              ? "bg-white text-slate-900 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>Header & Navbar CMS</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("footer")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "footer"
              ? "bg-white text-slate-900 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-red-600" />
          <span>Footer & Legal CMS</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("contact")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "contact"
              ? "bg-white text-slate-900 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hotlines & WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("social_legal")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "social_legal"
              ? "bg-white text-slate-900 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-purple-600" />
          <span>Social Media & Legal</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ========================================================
            TAB 1: NAVBAR CMS (PHASE 3C-16 COMPLETE SPEC)
        ======================================================== */}
        {activeTab === "navbar" && (
          <div className="space-y-8">
            {/* ── SECTION 10: CMS LIVE PREVIEW ─────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-900" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Live Navbar Preview
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    (Updates instantly from form state)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("desktop")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        previewMode === "desktop"
                          ? "bg-white text-slate-900 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("mobile")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        previewMode === "mobile"
                          ? "bg-white text-slate-900 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetToRecommended}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors font-medium"
                    title="Reset to recommended Apple-minimal defaults"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Recommended</span>
                  </button>
                </div>
              </div>

              {/* Render simulated live navbar */}
              {previewMode === "desktop" ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-inner">
                  <HbsNavbar content={content as HbsContent} previewConfig={navConfig} />
                  <div className="p-8 text-center text-xs text-slate-400 font-mono bg-slate-100/60">
                    [ Page Content Area — Scroll simulation ]
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 rounded-xl flex justify-center">
                  <div className="w-full max-w-[390px] border-4 border-slate-800 rounded-2xl overflow-hidden shadow-xl bg-white relative min-h-[580px] flex flex-col justify-between">
                    <div className="h-5 bg-slate-800 flex items-center justify-center">
                      <div className="w-16 h-2 bg-slate-600 rounded-full" />
                    </div>
                    <HbsNavbar content={content as HbsContent} previewConfig={navConfig} previewViewport="mobile" />
                    <div className="p-8 text-center text-xs text-slate-400 font-mono bg-slate-50">
                      [ Mobile Viewport (390px) ]
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── SECTION 1: BRANDING ──────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>1. Branding &amp; Logos</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage the official Hind Building Solutions logo assets used across the navbar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <HbsImageUploader
                  label="Primary Logo (Desktop)"
                  description="High-resolution horizontal brand logo with transparent background"
                  value={content.logoPrimary || ""}
                  onChange={(url) => handleChange("logoPrimary", url)}
                  folder="hbs/branding"
                  recommendedSize="400×90px"
                  previewHeight="h-20"
                />

                <HbsImageUploader
                  label="Dark / Reverse Logo"
                  description="Light version for dark backgrounds or transparent top state"
                  value={content.logoDark || ""}
                  onChange={(url) => handleChange("logoDark", url)}
                  folder="hbs/branding"
                  recommendedSize="400×90px"
                  previewHeight="h-20"
                />

                <HbsImageUploader
                  label="Mobile Logo"
                  description="Compact logo displayed on mobile viewports (<768px)"
                  value={content.logoMobile || ""}
                  onChange={(url) => handleChange("logoMobile", url)}
                  folder="hbs/branding"
                  recommendedSize="280×70px"
                  previewHeight="h-20"
                />

                <HbsImageUploader
                  label="Mobile Mark / Monogram"
                  description="Square emblem icon used on compact mobile navbar"
                  value={content.logoMark || ""}
                  onChange={(url) => handleChange("logoMark", url)}
                  folder="hbs/branding"
                  recommendedSize="96×96px"
                  previewHeight="h-20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Logo Alt Text
                  </label>
                  <input
                    type="text"
                    value={navConfig.branding?.logoAltText || "Hind Building Solutions"}
                    onChange={(e) =>
                      setNavConfig((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, logoAltText: e.target.value },
                      }))
                    }
                    placeholder="Hind Building Solutions"
                    className="w-full text-xs font-medium border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Accessibility description for screen readers.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Brand Subtitle (Desktop)
                  </label>
                  <input
                    type="text"
                    value={navConfig.branding?.brandSubtitle || "Engineering & Turnkey Solutions"}
                    onChange={(e) =>
                      setNavConfig((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, brandSubtitle: e.target.value },
                      }))
                    }
                    placeholder="Engineering & Turnkey Solutions"
                    className="w-full text-xs font-medium border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Micro-descriptor displayed below brand name when emblem is active.
                  </span>
                </div>
              </div>
            </div>

            {/* ── SECTION 2: NAVIGATION LINKS ─────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>2. Navigation Links</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Control label, visibility, and display sequence for main site pages.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                {navConfig.navItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16">
                        <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-0.5">
                          Order
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={item.order}
                          onChange={(e) =>
                            handleNavItemChange(item.id, "order", parseInt(e.target.value) || 1)
                          }
                          className="w-full text-xs font-mono font-bold text-center border border-slate-300 p-2 bg-slate-50 rounded-md focus:bg-white focus:outline-slate-900"
                        />
                      </div>

                      <div className="flex-1 sm:w-64">
                        <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-0.5">
                          Page Label ({item.id})
                        </label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleNavItemChange(item.id, "label", e.target.value)}
                          placeholder={item.id}
                          className="w-full text-xs font-semibold border border-slate-300 p-2 bg-slate-50 rounded-md focus:bg-white focus:outline-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleNavItemChange(item.id, "visible", !item.visible)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                          item.visible
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                            : "bg-slate-100 text-slate-500 border border-slate-300"
                        }`}
                      >
                        {item.visible ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Visible ✓</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-slate-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SECTION 3: CALL-TO-ACTION (CTA) ──────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>3. Conversion CTAs &amp; Actions</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure primary quote action, direct phone calling, and WhatsApp messaging.
                </p>
              </div>

              {/* Primary CTA */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>Primary Action Button</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNavConfig((prev) => ({
                        ...prev,
                        primaryCta: { ...prev.primaryCta, enabled: !prev.primaryCta.enabled },
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border min-h-[34px] ${
                      navConfig.primaryCta.enabled
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {navConfig.primaryCta.enabled ? "Enabled ✓" : "Disabled"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={navConfig.primaryCta.label || ""}
                      onChange={(e) =>
                        setNavConfig((prev) => ({
                          ...prev,
                          primaryCta: { ...prev.primaryCta, label: e.target.value },
                        }))
                      }
                      placeholder="Get Free Quote"
                      className="w-full text-xs font-semibold border border-slate-300 p-2.5 bg-white rounded-lg focus:outline-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Destination URL
                    </label>
                    <input
                      type="text"
                      value={navConfig.primaryCta.destination || ""}
                      onChange={(e) =>
                        setNavConfig((prev) => ({
                          ...prev,
                          primaryCta: { ...prev.primaryCta, destination: e.target.value },
                        }))
                      }
                      placeholder="/contact"
                      className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-white rounded-lg focus:outline-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Actions: Call & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Call */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>Phone Call Action</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setNavConfig((prev) => ({
                          ...prev,
                          contactActions: {
                            ...prev.contactActions,
                            callEnabled: !prev.contactActions.callEnabled,
                          },
                        }))
                      }
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        navConfig.contactActions.callEnabled
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-300"
                      }`}
                    >
                      {navConfig.contactActions.callEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={navConfig.contactActions.callLabel || "Call"}
                      onChange={(e) =>
                        setNavConfig((prev) => ({
                          ...prev,
                          contactActions: { ...prev.contactActions, callLabel: e.target.value },
                        }))
                      }
                      placeholder="Call"
                      className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-slate-900 mb-2"
                    />
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Phone Number (defaults to Hotline)
                    </label>
                    <input
                      type="text"
                      value={navConfig.contactActions.phone || content.phone || ""}
                      onChange={(e) =>
                        setNavConfig((prev) => ({
                          ...prev,
                          contactActions: { ...prev.contactActions, phone: e.target.value },
                        }))
                      }
                      placeholder="+91 75970 00601"
                      className="w-full text-xs font-mono border border-slate-300 p-2 bg-white rounded-lg focus:outline-slate-900"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Action</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setNavConfig((prev) => ({
                          ...prev,
                          contactActions: {
                            ...prev.contactActions,
                            whatsappEnabled: !prev.contactActions.whatsappEnabled,
                          },
                        }))
                      }
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        navConfig.contactActions.whatsappEnabled
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-white text-slate-600 border-slate-300"
                      }`}
                    >
                      {navConfig.contactActions.whatsappEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={navConfig.contactActions.whatsappLabel || "WhatsApp"}
                      onChange={(e) =>
                        setNavConfig((prev) => ({
                          ...prev,
                          contactActions: { ...prev.contactActions, whatsappLabel: e.target.value },
                        }))
                      }
                      placeholder="WhatsApp"
                      className="w-full text-xs border border-slate-300 p-2 bg-white rounded-lg focus:outline-slate-900 mb-2"
                    />
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={navConfig.contactActions.whatsappNumber || content.whatsapp || ""}
                      onChange={(e) =>
                        setNavConfig((prev) => ({
                          ...prev,
                          contactActions: { ...prev.contactActions, whatsappNumber: e.target.value },
                        }))
                      }
                      placeholder="+91 75970 00601"
                      className="w-full text-xs font-mono border border-slate-300 p-2 bg-white rounded-lg focus:outline-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 4: BEHAVIOUR ─────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>4. Scroll &amp; Layout Behaviour</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tune sticky scrolling, header compacting, transparency, and active route markers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sticky Navbar */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Sticky Navbar</span>
                    <span className="text-[11px] text-slate-500 block">Pins header to top of viewport on scroll</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNavConfig((prev) => ({
                        ...prev,
                        behaviour: { ...prev.behaviour, sticky: !(prev.behaviour?.sticky !== false) },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                      navConfig.behaviour?.sticky !== false
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {navConfig.behaviour?.sticky !== false ? "ON" : "OFF"}
                  </button>
                </div>

                {/* Compact on Scroll */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Compact on Scroll</span>
                    <span className="text-[11px] text-slate-500 block">Reduces height smoothly after scrolling 20px</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNavConfig((prev) => ({
                        ...prev,
                        behaviour: {
                          ...prev.behaviour,
                          compactOnScroll: !(prev.behaviour?.compactOnScroll !== false),
                        },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                      navConfig.behaviour?.compactOnScroll !== false
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {navConfig.behaviour?.compactOnScroll !== false ? "ON" : "OFF"}
                  </button>
                </div>

                {/* Transparent at Top */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Transparent at Top</span>
                    <span className="text-[11px] text-slate-500 block">Seamless hero integration before scrolling</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNavConfig((prev) => ({
                        ...prev,
                        behaviour: {
                          ...prev.behaviour,
                          transparentAtTop: !prev.behaviour?.transparentAtTop,
                        },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                      navConfig.behaviour?.transparentAtTop
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {navConfig.behaviour?.transparentAtTop ? "ON" : "OFF"}
                  </button>
                </div>

                {/* Active Indicator */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Active Page Indicator</span>
                    <span className="text-[11px] text-slate-500 block">Subtle Apple-style bar below current page</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNavConfig((prev) => ({
                        ...prev,
                        behaviour: {
                          ...prev.behaviour,
                          activeIndicator: !(prev.behaviour?.activeIndicator !== false),
                        },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                      navConfig.behaviour?.activeIndicator !== false
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {navConfig.behaviour?.activeIndicator !== false ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── SECTION 5: ANIMATION ─────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>5. Animation System</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pure CSS hardware-accelerated transitions. Respects prefers-reduced-motion automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Navbar Animation</span>
                    <span className="text-[11px] text-slate-500 block">Entrance &amp; transitions</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNavConfig((prev) => ({
                        ...prev,
                        animation: {
                          ...prev.animation,
                          navbarAnimation: !(prev.animation?.navbarAnimation !== false),
                        },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                      navConfig.animation?.navbarAnimation !== false
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {navConfig.animation?.navbarAnimation !== false ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Mobile Drawer Anim</span>
                    <span className="text-[11px] text-slate-500 block">Staggered slide reveal</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNavConfig((prev) => ({
                        ...prev,
                        animation: {
                          ...prev.animation,
                          mobileMenuAnimation: !(prev.animation?.mobileMenuAnimation !== false),
                        },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                      navConfig.animation?.mobileMenuAnimation !== false
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {navConfig.animation?.mobileMenuAnimation !== false ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Scroll Compacting</span>
                    <span className="text-[11px] text-slate-500 block">Smooth height transition</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNavConfig((prev) => ({
                        ...prev,
                        animation: {
                          ...prev.animation,
                          scrollAnimation: !(prev.animation?.scrollAnimation !== false),
                        },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                      navConfig.animation?.scrollAnimation !== false
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {navConfig.animation?.scrollAnimation !== false ? "ON" : "OFF"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Animation Speed
                  </label>
                  <select
                    value={navConfig.animation?.speed || "normal"}
                    onChange={(e) =>
                      setNavConfig((prev) => ({
                        ...prev,
                        animation: { ...prev.animation, speed: e.target.value as any },
                      }))
                    }
                    className="w-full text-xs font-semibold border border-slate-300 p-2.5 bg-white rounded-lg focus:outline-slate-900"
                  >
                    <option value="fast">Fast (180ms - Snappy &amp; instant)</option>
                    <option value="normal">Normal (240ms - Recommended Apple feel)</option>
                    <option value="slow">Slow (360ms - Cinematic &amp; calm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Animation Intensity
                  </label>
                  <select
                    value={navConfig.animation?.intensity || "normal"}
                    onChange={(e) =>
                      setNavConfig((prev) => ({
                        ...prev,
                        animation: { ...prev.animation, intensity: e.target.value as any },
                      }))
                    }
                    className="w-full text-xs font-semibold border border-slate-300 p-2.5 bg-white rounded-lg focus:outline-slate-900"
                  >
                    <option value="subtle">Subtle (Minimal opacity change)</option>
                    <option value="normal">Normal (Balanced opacity + translateY)</option>
                    <option value="strong">Strong (Expressive motion)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── SECTION 6: ACCESSIBILITY ─────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-amber-600" />
                  <span>6. Accessibility (WCAG AA)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ensure screen reader announcements, keyboard navigation, and reduced motion safety.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Menu Aria-Label
                  </label>
                  <input
                    type="text"
                    value={navConfig.accessibility?.menuAriaLabel || "Navigation Menu"}
                    onChange={(e) =>
                      setNavConfig((prev) => ({
                        ...prev,
                        accessibility: { ...prev.accessibility, menuAriaLabel: e.target.value },
                      }))
                    }
                    placeholder="Navigation Menu"
                    className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg font-medium"
                  />
                </div>

                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Reduced-Motion Safe Fallback</span>
                    <span className="text-[11px] text-slate-500 block">Bypasses animations if user prefers reduced motion</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNavConfig((prev) => ({
                        ...prev,
                        accessibility: {
                          ...prev.accessibility,
                          reducedMotionSafe: !(prev.accessibility?.reducedMotionSafe !== false),
                        },
                      }))
                    }
                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                      navConfig.accessibility?.reducedMotionSafe !== false
                        ? "bg-emerald-600 text-white border-emerald-700"
                        : "bg-white text-slate-600 border-slate-300"
                    }`}
                  >
                    {navConfig.accessibility?.reducedMotionSafe !== false ? "Active ✓" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: FOOTER CMS (COMPLETE 4-COLUMN SPEC & LIVE PREVIEW)
        ======================================================== */}
        {activeTab === "footer" && (
          <div className="space-y-8">
            {/* ── 1. LIVE FOOTER PREVIEW CARD ──────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-900" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Live Footer Preview
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    (Mirrors live frontend layout &amp; tokens)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Matches Public Component: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">components/hbs/HbsFooter.tsx</code>
                </div>
              </div>

              {/* Preview Wrapper */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-6 sm:p-8 space-y-8 overflow-hidden">
                {/* Brand Accent Ribbon */}
                <div className="h-1 w-full bg-gradient-to-r from-[#0D2D5E] via-red-600 to-[#0D2D5E] rounded-full" />

                {/* 4 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-xs text-slate-600">
                  {/* Col 1 */}
                  <div className="lg:col-span-4 space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/hibuild-logo.png" alt="HiBUILD" className="h-10 w-auto object-contain" />
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      {content.tagline ||
                        "Complete care for your building. Engineering-grade non-destructive diagnostics, chemical waterproofing, structural rehabilitation, painting, and turnkey facility maintenance across Rajasthan."}
                    </p>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-900">
                        <Shield className="w-3.5 h-3.5 text-red-600" />
                        <span>A Brand Under Hindustan Projects</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Backed by the civil engineering heritage of Hindustan Projects (HiPRO).
                      </p>
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="lg:col-span-2 space-y-2">
                    <h4 className="font-black text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      <span>Quick Links</span>
                    </h4>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      <li>• Home Page</li>
                      <li>• About HiBUILD</li>
                      <li>• All Services</li>
                      <li>• Our Projects</li>
                      <li>• Why Choose Us</li>
                      <li>• Book Free Inspection</li>
                    </ul>
                  </div>

                  {/* Col 3 */}
                  <div className="lg:col-span-3 space-y-2">
                    <h4 className="font-black text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      <span>Core Services</span>
                    </h4>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      <li>• Roof &amp; Terrace Waterproofing</li>
                      <li>• Structure Repair &amp; Grouting</li>
                      <li>• Building Painting &amp; Damp Wall</li>
                      <li>• Plumbing &amp; Electrical Networks</li>
                      <li>• Anti-Termite Soil Treatment</li>
                      <li>• Tile &amp; Precision Stone Work</li>
                    </ul>
                  </div>

                  {/* Col 4 */}
                  <div className="lg:col-span-3 space-y-2.5">
                    <h4 className="font-black text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      <span>Contact &amp; Support</span>
                    </h4>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span>{content.address || "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara 311001"}</span>
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Priority Hotline</span>
                        <span className="font-black text-slate-900 text-xs">{content.phone || "+91 94625 77757"}</span>
                      </div>
                      <div className="text-emerald-700 font-bold">
                        WhatsApp: {content.whatsapp || "+91 94625 77757"}
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        Hours: {content.businessHours || "Mon – Sat: 8:00 AM – 8:00 PM"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Trust Pillars strip */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-800">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">🛡️ Up to 10-Yr Warranty</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">👷 Civil Engineer Supervision</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">✓ ISI Certified Materials</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">📍 Doorstep Rajasthan Reach</div>
                </div>
              </div>
            </div>

            {/* ── 2. FORM: BRAND STORY & COLUMN 1 ─────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Column 1: Company Overview &amp; Social Channels</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Footer Narrative / Company Tagline
                  </label>
                  <textarea
                    rows={3}
                    value={content.tagline || ""}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                    placeholder="Complete care for your building. Engineering-grade non-destructive diagnostics, chemical waterproofing, structural rehabilitation, painting, and turnkey facility maintenance across Rajasthan."
                    className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg leading-relaxed font-sans"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Appears directly beneath the HiBUILD logo in Column 1.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={socials.instagram}
                      onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                      placeholder="https://instagram.com/hindbuild"
                      className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={socials.facebook}
                      onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                      placeholder="https://facebook.com/hindbuild"
                      className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      LinkedIn Page URL
                    </label>
                    <input
                      type="url"
                      value={socials.linkedin}
                      onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/hindbuild"
                      className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      YouTube Channel URL
                    </label>
                    <input
                      type="url"
                      value={socials.youtube}
                      onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                      placeholder="https://youtube.com/@hindbuild"
                      className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. FORM: COLUMN 4 CONTACT & RAJASTHAN SUPPORT ─ */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Column 4: Contact, Address &amp; Dispatch Hours</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Regional Office Street Address
                  </label>
                  <textarea
                    rows={2}
                    value={content.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001"
                    className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Engineer Priority Line (Phone)
                  </label>
                  <input
                    type="text"
                    value={content.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 94625 77757"
                    className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Direct Consultation
                  </label>
                  <input
                    type="text"
                    value={content.whatsapp || ""}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder="919462577757"
                    className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={content.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="hindbuild@hindustanprojects.in"
                    className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    value={content.businessHours || ""}
                    onChange={(e) => handleChange("businessHours", e.target.value)}
                    placeholder="Mon – Sat: 8:00 AM – 8:00 PM (Emergency Dispatch)"
                    className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* ── 4. FORM: TRUST ASSURANCE PILLARS STRIP ─────── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Trust Assurance Pillars Strip (4 Cards)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                These 4 trust badge cards appear across the full-width strip right above the footer copyright bar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {footerConfig.pillars.map((pillar, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Pillar #{idx + 1}
                    </span>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Pillar Title
                      </label>
                      <input
                        type="text"
                        value={pillar.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFooterConfig((prev) => ({
                            ...prev,
                            pillars: prev.pillars.map((p, j) => (j === idx ? { ...p, label: val } : p)),
                          }));
                        }}
                        className="w-full text-xs font-medium border border-slate-300 p-2 bg-white rounded-lg focus:outline-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Badge Icon
                      </label>
                      <select
                        value={pillar.icon}
                        onChange={(e) => {
                          const iconVal = e.target.value;
                          setFooterConfig((prev) => ({
                            ...prev,
                            pillars: prev.pillars.map((p, j) => (j === idx ? { ...p, icon: iconVal } : p)),
                          }));
                        }}
                        className="w-full text-xs font-medium border border-slate-300 p-2 bg-white rounded-lg focus:outline-slate-900"
                      >
                        <option value="ShieldCheck">🛡️ ShieldCheck (Warranty)</option>
                        <option value="HardHat">👷 HardHat (Civil Engineer)</option>
                        <option value="CheckCircle2">✓ CheckCircle2 (Branded ISI)</option>
                        <option value="Sparkles">✨ Sparkles (Service Reach)</option>
                        <option value="Clock">⏱️ Clock (Turnaround)</option>
                        <option value="Award">🏆 Award (Certified)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 5. FORM: PARENT COMPANY HERITAGE CARD ───────── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Parent Company Heritage Card (Column 1)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Badge Title
                  </label>
                  <input
                    type="text"
                    value={footerConfig.heritageCard.badge}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFooterConfig((prev) => ({
                        ...prev,
                        heritageCard: { ...prev.heritageCard, badge: v },
                      }));
                    }}
                    placeholder="A Brand Under Hindustan Projects"
                    className="w-full text-xs font-medium border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Parent Link Text
                  </label>
                  <input
                    type="text"
                    value={footerConfig.heritageCard.linkText}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFooterConfig((prev) => ({
                        ...prev,
                        heritageCard: { ...prev.heritageCard, linkText: v },
                      }));
                    }}
                    placeholder="Hindustan Projects (HiPRO)"
                    className="w-full text-xs font-medium border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Heritage Narrative Description
                  </label>
                  <textarea
                    rows={2}
                    value={footerConfig.heritageCard.text}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFooterConfig((prev) => ({
                        ...prev,
                        heritageCard: { ...prev.heritageCard, text: v },
                      }));
                    }}
                    placeholder="Backed by the civil engineering heritage of Hindustan Projects (HiPRO). Bringing industrial civil rigor to property repair and maintenance."
                    className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* ── 6. FORM: LEGAL & COMPLIANCE URLS ────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Bottom Bar: Legal Policies &amp; Copyright</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Privacy Policy URL
                  </label>
                  <input
                    type="text"
                    value={content.privacyPolicyUrl || ""}
                    onChange={(e) => handleChange("privacyPolicyUrl", e.target.value)}
                    placeholder="/privacy-policy"
                    className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Terms of Service URL
                  </label>
                  <input
                    type="text"
                    value={content.termsUrl || ""}
                    onChange={(e) => handleChange("termsUrl", e.target.value)}
                    placeholder="/terms"
                    className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Copyright Line
                  </label>
                  <input
                    type="text"
                    value={footerConfig.copyrightText}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFooterConfig((prev) => ({ ...prev, copyrightText: v }));
                    }}
                    placeholder="© 2026 Hind Building Solutions (HiBUILD). All rights reserved."
                    className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Enterprise Link Label
                  </label>
                  <input
                    type="text"
                    value={footerConfig.enterpriseText}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFooterConfig((prev) => ({ ...prev, enterpriseText: v }));
                    }}
                    placeholder="An Enterprise of Hindustan Projects"
                    className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: HOTLINES & IDENTITY
        ======================================================== */}
        {activeTab === "contact" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Brand Identity &amp; Contact Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Public Brand Name
                </label>
                <input
                  type="text"
                  value={content.brandName || "Hind Building Solutions"}
                  onChange={(e) => handleChange("brandName", e.target.value)}
                  className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={content.tagline || ""}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="Complete Building Repair, Maintenance, Protection & Services"
                  className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Hotline Phone
                </label>
                <input
                  type="text"
                  value={content.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 75970 00601"
                  className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Official WhatsApp Number
                </label>
                <input
                  type="text"
                  value={content.whatsapp || ""}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="+91 75970 00601"
                  className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={content.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="hbs@hindustanprojects.in"
                  className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Operating Business Hours
                </label>
                <input
                  type="text"
                  value={content.businessHours || ""}
                  onChange={(e) => handleChange("businessHours", e.target.value)}
                  placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
                  className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Office / Regional Address
              </label>
              <textarea
                rows={2}
                value={content.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Full operational address in Rajasthan"
                className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: SOCIAL & LEGAL
        ======================================================== */}
        {activeTab === "social_legal" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Social Media, Compliance &amp; Analytics</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={socials.instagram}
                  onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  LinkedIn Company URL
                </label>
                <input
                  type="url"
                  value={socials.linkedin}
                  onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Privacy Policy Link
                </label>
                <input
                  type="text"
                  value={content.privacyPolicyUrl || ""}
                  onChange={(e) => handleChange("privacyPolicyUrl", e.target.value)}
                  placeholder="/privacy-policy"
                  className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Terms &amp; Conditions Link
                </label>
                <input
                  type="text"
                  value={content.termsUrl || ""}
                  onChange={(e) => handleChange("termsUrl", e.target.value)}
                  placeholder="/terms"
                  className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  value={content.gaMeasurementId || ""}
                  onChange={(e) => handleChange("gaMeasurementId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full text-xs font-mono border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-slate-900 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STICKY SAVE BAR ───────────────────────────────── */}
        <div className="fixed bottom-0 inset-x-0 lg:left-auto lg:w-[calc(100%-var(--admin-sidebar-w,0px))] z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
            <span className="text-[13px]" aria-live="polite">
              {isDirty ? (
                <span className="inline-flex items-center gap-2 text-amber-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes in Navbar &amp; settings
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  All changes saved
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadSettings}
                className="min-h-[40px] px-3.5 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Reset Form
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving || !isDirty}
                className="inline-flex items-center gap-2 min-h-[40px] px-5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : savedRecently ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
