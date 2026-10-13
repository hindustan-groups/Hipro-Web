"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  FileText,
  MapPin,
  ShieldCheck,
  ArrowRight,
  HeartHandshake,
  Building2,
  Building,
  Award,
  CheckCircle,
  Briefcase,
  IndianRupee,
  TrendingUp,
  Landmark,
  CreditCard,
  FolderOpen,
  FileCheck,
  UserPlus,
  FileUp,
  Layers,
  Wrench,
  Truck,
  Sparkles,
  User,
  Settings,
  Boxes,
  Zap,
  Paintbrush,
} from "lucide-react";
import {
  EmpanelmentContent,
  EmpanelmentStat,
  EmpanelmentCategory,
  EmpanelmentProcessStep,
  EmpanelmentBenefit,
  EmpanelmentDocument,
  EmpanelmentFAQ,
  EmpanelmentImpactPillar,
  EmpanelmentHeroPill,
  DEFAULT_EMPANELMENT_CONTENT,
  parseJsonField,
} from "@/lib/empanelmentContent";

// Safe outline icon renderer matching mockup exactly
function renderIcon(iconName: string, className = "w-6 h-6") {
  switch (iconName?.toLowerCase()) {
    case "hearthandshake":
    case "handshake":
      return <HeartHandshake className={className} />;
    case "users":
      return <Users className={className} />;
    case "building":
      return <Building className={className} />;
    case "building2":
      return <Building2 className={className} />;
    case "shieldcheck":
      return <ShieldCheck className={className} />;
    case "filetext":
      return <FileText className={className} />;
    case "filecheck":
      return <FileCheck className={className} />;
    case "fileup":
      return <FileUp className={className} />;
    case "mappin":
      return <MapPin className={className} />;
    case "creditcard":
      return <CreditCard className={className} />;
    case "briefcase":
      return <Briefcase className={className} />;
    case "award":
      return <Award className={className} />;
    case "folderopen":
      return <FolderOpen className={className} />;
    case "trendingup":
    case "barchart":
    case "chart":
      return <TrendingUp className={className} />;
    case "landmark":
      return <Landmark className={className} />;
    case "indianrupee":
      return <IndianRupee className={className} />;
    case "checkcircle":
      return <CheckCircle className={className} />;
    case "userplus":
      return <UserPlus className={className} />;
    case "wrench":
      return <Wrench className={className} />;
    case "truck":
      return <Truck className={className} />;
    case "settings":
    case "gear":
    case "cog":
      return <Settings className={className} />;
    case "user":
      return <User className={className} />;
    case "boxes":
    case "package":
      return <Boxes className={className} />;
    case "zap":
      return <Zap className={className} />;
    case "paintbrush":
      return <Paintbrush className={className} />;
    default:
      return <ShieldCheck className={className} />;
  }
}

// Category floating icon selector matching each category
function getCategoryIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("material")) return <Boxes className="w-5 h-5 text-[#dc2626]" />;
  if (t.includes("civil") || t.includes("structural")) return <Building2 className="w-5 h-5 text-[#dc2626]" />;
  if (t.includes("machin") || t.includes("equipment")) return <Wrench className="w-5 h-5 text-[#dc2626]" />;
  if (t.includes("electr") || t.includes("plumb")) return <Zap className="w-5 h-5 text-[#dc2626]" />;
  if (t.includes("interior") || t.includes("finish")) return <Paintbrush className="w-5 h-5 text-[#dc2626]" />;
  if (t.includes("logistic") || t.includes("transport")) return <Truck className="w-5 h-5 text-[#dc2626]" />;
  return <Layers className="w-5 h-5 text-[#dc2626]" />;
}

// Category tags providing genuine construction context and filling empty dead space
function getCategoryTags(title: string): string[] {
  const t = title.toLowerCase();
  if (t.includes("material")) return ["Cement & TMT", "Bricks & AAC", "Aggregates", "Sand & Steel"];
  if (t.includes("civil") || t.includes("structural")) return ["RCC Works", "PEB Sheds", "Fabrication", "Industrial Paving"];
  if (t.includes("machin") || t.includes("equipment")) return ["Excavators (JCB)", "Transit Mixers", "Tower Cranes", "Piling Rigs"];
  if (t.includes("electr") || t.includes("plumb")) return ["MEP Cabling", "Transformers", "PVC/HDPE Pipes", "Switchgears"];
  if (t.includes("interior") || t.includes("finish")) return ["Tiles & Marble", "Commercial Paint", "False Ceilings", "Glass Facades"];
  if (t.includes("logistic") || t.includes("transport")) return ["Dumper Fleet", "Bulk Haulage", "Heavy Flatbeds", "Site Logistics"];
  return ["Contract Supply", "Material Procurement", "Statutory Verified"];
}

// Category demand indicator badge
function getCategoryBadge(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("material")) return "High Procurement Demand";
  if (t.includes("civil") || t.includes("structural")) return "Active Site Contracts";
  if (t.includes("machin") || t.includes("equipment")) return "Plant & Machinery RFQ";
  if (t.includes("electr") || t.includes("plumb")) return "MEP Packages Open";
  if (t.includes("interior") || t.includes("finish")) return "Finishing Works Open";
  if (t.includes("logistic") || t.includes("transport")) return "Fleet Registration Open";
  return "Empanelment Open";
}

export default function EmpanelmentPortalHomePage() {
  const [content, setContent] = useState<EmpanelmentContent>(DEFAULT_EMPANELMENT_CONTENT);
  const [openFaqId, setOpenFaqId] = useState<string | null>("f1");

  useEffect(() => {
    async function loadData() {
      try {
        const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const cleanUrl = rawUrl.replace(/\/+$/, "");
        const res = await fetch(`${cleanUrl}/api/empanelment/content`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content) {
            setContent({ ...DEFAULT_EMPANELMENT_CONTENT, ...json.content });
          }
        }
      } catch (_e) {
        // fallback
      }
    }
    loadData();
  }, []);

  // 4 Feature pills below hero buttons
  const heroPills: EmpanelmentHeroPill[] = parseJsonField(content.heroPills, [
    { id: "p1", title: "Fair & Transparent\nProcurement", iconName: "Handshake" },
    { id: "p2", title: "Local Business\nOpportunities", iconName: "Users" },
    { id: "p3", title: "Long-Term\nPartnerships", iconName: "TrendingUp" },
    { id: "p4", title: "Quality &\nCompliance", iconName: "Settings" },
  ]);

  // Floating stats counter bar
  const stats: EmpanelmentStat[] = parseJsonField(content.stats, [
    { id: "s1", value: "200+", label: "Trusted Vendors", iconName: "Users" },
    { id: "s2", value: "150+", label: "Projects Supplied", iconName: "FileText" },
    { id: "s3", value: "15+", label: "Cities Across Rajasthan", iconName: "MapPin" },
    { id: "s4", value: "100%", label: "Transparent Process", iconName: "ShieldCheck" },
  ]);

  // 6 Photographic categories
  const categories: EmpanelmentCategory[] = parseJsonField(content.categoriesList, [
    {
      id: "c1",
      title: "Building Materials",
      description: "Cement, steel, bricks, aggregates and more",
      imageUrl: "/images/empanelment/cat-building-materials.jpg",
      linkUrl: "/empanelment/apply?category=building-materials",
    },
    {
      id: "c2",
      title: "Civil & Structural Work",
      description: "Construction, fabrication and structural services",
      imageUrl: "/images/empanelment/cat-civil-structural.jpg",
      linkUrl: "/empanelment/apply?category=civil-structural",
    },
    {
      id: "c3",
      title: "Machinery & Equipment",
      description: "Construction machinery, plants and equipment rental/supply",
      imageUrl: "/images/empanelment/cat-machinery-equipment.jpg",
      linkUrl: "/empanelment/apply?category=machinery-equipment",
    },
    {
      id: "c4",
      title: "Electrical & Plumbing",
      description: "Electrical, plumbing and MEP materials & services",
      imageUrl: "/images/empanelment/cat-electrical-plumbing.jpg",
      linkUrl: "/empanelment/apply?category=electrical-plumbing",
    },
    {
      id: "c5",
      title: "Interior & Finishing",
      description: "Interior, flooring, painting and finishing work",
      imageUrl: "/images/empanelment/cat-interior-finishing.jpg",
      linkUrl: "/empanelment/apply?category=interior-finishing",
    },
    {
      id: "c6",
      title: "Logistics & Transportation",
      description: "Material transportation and logistics support work",
      imageUrl: "/images/empanelment/cat-logistics-transport.jpg",
      linkUrl: "/empanelment/apply?category=logistics-transportation",
    },
  ]);

  // 4 Registration steps
  const steps: EmpanelmentProcessStep[] = parseJsonField(content.processSteps, [
    {
      step: "01",
      title: "Create Profile",
      description: "Fill in your business details and category information.",
      iconName: "FileText",
    },
    {
      step: "02",
      title: "Submit Documents",
      description: "Upload required documents for verification.",
      iconName: "FileCheck",
    },
    {
      step: "03",
      title: "Verification",
      description: "Our team will review your details and documents.",
      iconName: "ShieldCheck",
    },
    {
      step: "04",
      title: "Get Listed",
      description: "Once approved, you will be listed in our vendor network and can receive opportunities.",
      iconName: "Award",
    },
  ]);

  // 6 Vendor benefits
  const benefits: EmpanelmentBenefit[] = parseJsonField(content.benefitsList, [
    {
      id: "b1",
      title: "Consistent Opportunities",
      description: "Regular procurement opportunities from ongoing and upcoming projects.",
      iconName: "Briefcase",
    },
    {
      id: "b2",
      title: "Transparent Process",
      description: "Fair, ethical and clear procurement procedures.",
      iconName: "ShieldCheck",
    },
    {
      id: "b3",
      title: "Timely Payments",
      description: "Reliable and timely payment system.",
      iconName: "IndianRupee",
    },
    {
      id: "b4",
      title: "Support for Local Businesses",
      description: "Priority to local vendors and MSMEs from Rajasthan.",
      iconName: "Users",
    },
    {
      id: "b5",
      title: "Long-Term Partnerships",
      description: "Opportunity to grow with us on future projects.",
      iconName: "HeartHandshake",
    },
    {
      id: "b6",
      title: "Quality Standards",
      description: "Focus on quality, safety and compliance in every project.",
      iconName: "Award",
    },
  ]);

  // 4 Impact pillars
  const impactPillars: EmpanelmentImpactPillar[] = parseJsonField(content.impactPillars, [
    { id: "ip1", title: "Local Economic Growth", iconName: "TrendingUp" },
    { id: "ip2", title: "Sustainable Infrastructure", iconName: "Building2" },
    { id: "ip3", title: "Stronger Communities", iconName: "Users" },
    { id: "ip4", title: "A Better Rajasthan", iconName: "Landmark" },
  ]);

  // 6 Documents required
  const docsList: EmpanelmentDocument[] = parseJsonField(content.docsList, [
    { id: "d1", title: "GST Details", description: "GST registration certificate", iconName: "FileCheck" },
    { id: "d2", title: "PAN Details", description: "PAN card of the business", iconName: "CreditCard" },
    { id: "d3", title: "Bank Details", description: "Cancelled cheque or bank statement", iconName: "Building2" },
    { id: "d4", title: "Business Profile", description: "Company profile and work experience", iconName: "Briefcase" },
    { id: "d5", title: "Relevant Certifications", description: "Quality, safety or industry-specific certificates", iconName: "Award" },
    { id: "d6", title: "Other Documents", description: "Any additional documents as per category", iconName: "FolderOpen" },
  ]);

  // 5 FAQs
  const faqs: EmpanelmentFAQ[] = parseJsonField(content.faqsList, [
    {
      id: "f1",
      question: "Who can register as a vendor?",
      answer:
        "Any registered manufacturer, authorized distributor, raw material supplier, civil/structural contractor, or plant equipment provider possessing valid GSTIN and business credentials can register.",
    },
    {
      id: "f2",
      question: "What documents are required for registration?",
      answer:
        "Standard documentation includes GST registration certificate, business PAN card, bank details (cancelled cheque), MSME/Udyam certificate (if applicable), and past work experience profile.",
    },
    {
      id: "f3",
      question: "How will I get procurement opportunities?",
      answer:
        "Once verified and empanelled into your respective category, you will receive real-time Request for Quotations (RFQs), site purchase intents, and tender invitations directly via SMS, WhatsApp, and portal notifications.",
    },
    {
      id: "f4",
      question: "What is the payment process?",
      answer:
        "Payments are disbursed transparently via direct RTGS/NEFT against verified measurement sheets and tax invoices, adhering strictly to agreed milestones and MSME statutory terms.",
    },
    {
      id: "f5",
      question: "Is there any registration fee?",
      answer:
        "No. Vendor registration on Hindustan Projects Empanelment Portal is 100% free of charge. We never charge any processing or registration fees.",
    },
  ]);

  return (
    <div className="bg-white text-slate-900 font-sans antialiased flex flex-col selection:bg-red-100 selection:text-red-900">
      {/* ================================================================ */}
      {/* 1. HERO SECTION (Unboxed, full-bleed graphic with seamless fade) */}
      {/* ================================================================ */}
      <section className="relative bg-white overflow-hidden min-h-[580px] lg:min-h-[620px] flex flex-col justify-between">
        {/* Right Side Background Graphic - Full Bleed to Edge without any card box */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[68%] xl:w-[65%] h-full z-0 pointer-events-none overflow-hidden">
          <Image
            src={content.heroImageUrl || "/images/empanelment/hero-engineers-perfect.jpg"}
            alt="Hindustan Projects Engineers on Construction Site"
            fill
            priority
            unoptimized
            className="object-cover object-[80%_bottom] lg:object-[82%_bottom] opacity-15 sm:opacity-25 lg:opacity-100 transition-opacity"
          />
          {/* Mobile soft white veil so background graphics never collide with text */}
          <div className="lg:hidden absolute inset-0 bg-white/80 z-[1] pointer-events-none" />
          {/* Smooth horizontal gradient fade on left side close to text */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-24 sm:w-36 lg:w-44 bg-gradient-to-r from-white via-white/50 to-transparent z-10 pointer-events-none" />
          {/* Smooth bottom gradient fade into floating stats card */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/90 to-transparent z-10 pointer-events-none" />
        </div>



        {/* Hero Content on Left (Over clean white canvas) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28 w-full">
          <div className="max-w-xl lg:max-w-[48%] space-y-6">
            {/* Badge */}
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#dc2626] uppercase">
              <span className="w-5 h-0.5 bg-[#dc2626]"></span>
              <span>{content.heroBadge || "VENDOR PORTAL"}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-slate-950 tracking-tight leading-[1.08]">
              <span>{content.heroTitlePrefix || "Partner with"}</span>
              <br />
              <span>Hindustan </span>
              <span className="text-[#dc2626]">
                {content.heroTitleHighlight?.replace(/hindustan\s*/i, "") || "Projects"}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg font-normal">
              {content.heroSubtitle ||
                "Join our local vendor network for construction materials, services and project opportunities across Rajasthan and beyond."}
            </p>

            {/* Dual Action Buttons (Mobile-first stacked on small screens, row on desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto">
              <Link
                href="/empanelment/apply"
                className="inline-flex items-center justify-center gap-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-red-600/20 group w-full sm:w-auto text-center"
              >
                <User className="w-4 h-4 text-white shrink-0" />
                <span>{content.heroRegisterBtnText || "Register as a Vendor"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>

              <Link
                href="/empanelment/track"
                className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl border border-slate-300 transition-all shadow-2xs group w-full sm:w-auto text-center"
              >
                <User className="w-4 h-4 text-slate-700 shrink-0" />
                <span>{content.heroLoginBtnText || "Vendor Login"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>

            {/* 4 Feature Pills Below CTAs (Pure red outline icons, responsive 2x2 on mobile) */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 border-t border-slate-100">
              {heroPills.map((pill) => (
                <div key={pill.id} className="flex items-start gap-2 sm:gap-2.5">
                  <div className="text-[#dc2626] shrink-0 mt-0.5">
                    {renderIcon(pill.iconName, "w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]")}
                  </div>
                  <div className="text-[11px] sm:text-[12px] font-bold text-slate-800 leading-[1.25] whitespace-pre-line">
                    {pill.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. STATS COUNTER BAR (Floats over hero bottom edge, responsive grid) */}
      {/* ================================================================ */}
      <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 lg:-mt-14 w-full">
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-xl shadow-slate-200/50 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={stat.id}
              className={`flex items-center gap-3 sm:gap-4 ${idx % 2 === 1 ? "pl-2 sm:pl-0" : ""} ${idx > 0 ? "lg:border-l lg:border-slate-100 lg:pl-6" : ""}`}
            >
              {/* Pure red outline icon */}
              <div className="text-[#dc2626] shrink-0">
                {renderIcon(stat.iconName, "w-7 h-7 sm:w-9 sm:h-9 stroke-[1.8]")}
              </div>
              <div>
                <div className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] sm:text-[13px] font-semibold text-slate-500 mt-0.5 leading-tight">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3. CATEGORIES SECTION */}
      {/* ================================================================ */}
      <section className="bg-slate-50/70 pt-20 pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#dc2626] uppercase">
                <span className="w-5 h-0.5 bg-[#dc2626]"></span>
                <span>{content.categoriesBadge || "CATEGORIES"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {content.categoriesTitle || "Supply to Our Construction Projects"}
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {content.categoriesSubtitle ||
                  "We source high-quality materials, services and solutions from trusted local vendors to support our construction and infrastructure projects across Rajasthan."}
              </p>
            </div>
            <Link
              href="/empanelment/apply"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#dc2626] hover:text-[#b91c1c] transition-colors whitespace-nowrap self-start md:self-end group"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 6 Category Cards (3 Columns x 2 Rows Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {categories.map((cat) => {
              const tags = getCategoryTags(cat.title);
              const demandBadge = getCategoryBadge(cat.title);

              return (
                <Link
                  key={cat.id}
                  href={cat.linkUrl || "/empanelment/apply"}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-red-300 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Photo with Overlay Badge */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={cat.imageUrl}
                      alt={cat.title}
                      fill
                      unoptimized
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Subtle bottom gradient on image for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                    {/* Live status badge on top right */}
                    <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold tracking-wide flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{demandBadge}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Header: Icon + Title */}
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#dc2626] flex items-center justify-center shrink-0 group-hover:bg-[#dc2626] group-hover:text-white transition-colors shadow-xs">
                          {getCategoryIcon(cat.title)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-slate-950 group-hover:text-[#dc2626] transition-colors leading-snug">
                            {cat.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5 line-clamp-1">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      {/* Material / Service Tags Pill Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 group-hover:bg-red-50/80 group-hover:text-red-900 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer with Clean Action Row */}
                    <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#dc2626] group-hover:text-[#b91c1c]">
                      <span className="flex items-center gap-1.5">
                        <span>Apply for Empanelment</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                        Class A · B · C
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. HOW IT WORKS / VENDOR REGISTRATION PROCESS */}
      {/* ================================================================ */}
      <section className="bg-white py-16 sm:py-20 relative overflow-hidden bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#dc2626] uppercase">
              <span className="w-5 h-0.5 bg-[#dc2626]"></span>
              <span>{content.processBadge || "HOW IT WORKS"}</span>
              <span className="w-5 h-0.5 bg-[#dc2626]"></span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {content.processTitle || "Vendor Registration Process"}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {content.processSubtitle ||
                "Get registered in a few simple steps and become a part of Hindustan Projects' approved vendor network."}
            </p>
          </div>

          {/* 4 Process Step Cards with Connected Arrows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => (
              <div
                key={step.step}
                className="relative bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-red-200 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Step Number Badge & Red Outline Icon */}
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-[#dc2626] text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {step.step}
                    </span>
                    <div className="text-[#dc2626]">
                      {renderIcon(step.iconName, "w-6 h-6 stroke-[1.8]")}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connected Arrow between steps */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-red-400">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. BENEFITS FOR OUR VENDORS */}
      {/* ================================================================ */}
      <section className="bg-slate-50/70 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-2xl mb-12 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#dc2626] uppercase">
              <span className="w-5 h-0.5 bg-[#dc2626]"></span>
              <span>{content.benefitsBadge || "WHY PARTNER WITH US"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {content.benefitsTitle || "Benefits for Our Vendors"}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {content.benefitsSubtitle ||
                "We believe in long-term relationships with our vendors and suppliers, creating value for both business and society."}
            </p>
          </div>

          {/* 6 Benefit Cards (2x3 Grid with Pure Red Outline Icons) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-red-200 hover:shadow-md transition-all flex items-start gap-4"
              >
                {/* Pure Red Outline Icon, no pink box */}
                <div className="text-[#dc2626] shrink-0 mt-0.5">
                  {renderIcon(b.iconName, "w-8 h-8 stroke-[1.8]")}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-950">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 6. OUR IMPACT (Full-width dark container with skyline) */}
      {/* ================================================================ */}
      <section className="bg-[#0c1829] text-white py-16 sm:py-20 relative overflow-hidden">
        {/* Background Skyline Image with dark overlay */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
          <Image
            src={content.impactImageUrl || "/images/empanelment/impact-skyline.jpg"}
            alt="Construction Cranes Skyline"
            fill
            unoptimized
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1829] via-[#0c1829]/95 to-[#0c1829]/80 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#dc2626] uppercase">
                <span className="w-5 h-0.5 bg-[#dc2626]"></span>
                <span>{content.impactBadge || "OUR IMPACT"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {content.impactTitle || "Building a Stronger Rajasthan Together"}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                {content.impactSubtitle ||
                  "Empowering local businesses, creating opportunities and building a better Rajasthan through responsible and sustainable infrastructure development."}
              </p>

              <div className="pt-2">
                <Link
                  href="/empanelment/apply"
                  className="inline-flex items-center gap-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-lg transition-all shadow-lg shadow-red-900/40 group"
                >
                  <User className="w-4 h-4 text-white" />
                  <span>{content.impactBtnText || "Join Our Vendor Network"}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/90 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Pillars List */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {impactPillars.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-4 flex items-center gap-3 hover:border-red-500/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-600/15 text-[#dc2626] flex items-center justify-center shrink-0 border border-red-500/25">
                    {renderIcon(p.iconName, "w-4 h-4")}
                  </div>
                  <span className="text-xs font-bold text-slate-100">{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 7. DOCUMENTS REQUIRED + FAQS (2-COLUMN SECTION) */}
      {/* ================================================================ */}
      <section id="faqs" className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Left Column: Documents Required */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#dc2626] uppercase">
                  <span className="w-5 h-0.5 bg-[#dc2626]"></span>
                  <span>{content.docsBadge || "DOCUMENTS REQUIRED"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {content.docsTitle || "Get Ready for Registration"}
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {content.docsSubtitle ||
                    "Keep the following documents ready (as applicable) to complete your vendor registration smoothly."}
                </p>
              </div>

              {/* 6 Document Cards (2 per row) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {docsList.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex items-start gap-3 hover:border-red-200 transition-colors"
                  >
                    <div className="text-[#dc2626] shrink-0 mt-0.5">
                      {renderIcon(doc.iconName, "w-6 h-6 stroke-[1.8]")}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Frequently Asked Questions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#dc2626] uppercase">
                  <span className="w-5 h-0.5 bg-[#dc2626]"></span>
                  <span>{content.faqBadge || "FREQUENTLY ASKED QUESTIONS"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {content.faqTitle || "Quick Answers"}
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {content.faqSubtitle ||
                    "Find answers to common questions about vendor registration, procurement and working with Hindustan Projects."}
                </p>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-2.5">
                {faqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-slate-200/90 rounded-xl overflow-hidden bg-white transition-all shadow-xs"
                    >
                      <button
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-[#dc2626] text-xs sm:text-sm transition-colors"
                      >
                        <span>{faq.question}</span>
                        <span className="text-slate-400 font-bold text-base shrink-0">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs text-slate-600 border-t border-slate-100 pt-2.5 leading-relaxed bg-slate-50/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-1 text-right">
                <Link
                  href="/empanelment/guidelines#faqs"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#dc2626] hover:text-[#b91c1c] transition-colors group"
                >
                  <span>View All FAQs</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 8. RED CALLOUT BANNER */}
      {/* ================================================================ */}
      <section className="bg-[#dc2626] text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Content */}
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-wider text-red-100 uppercase">
                <span className="w-5 h-0.5 bg-red-200"></span>
                <span>{content.ctaBadge || "BE A PART OF OUR JOURNEY"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {content.ctaTitle || "Let's Build a Stronger, Self-Reliant Rajasthan."}
              </h2>
              <p className="text-red-100 text-xs sm:text-sm font-normal max-w-2xl">
                {content.ctaSubtitle ||
                  "Register as a vendor today and become a part of Hindustan Projects' growing network."}
              </p>
            </div>

            {/* Right White Pill Button */}
            <div className="shrink-0 w-full md:w-auto">
              <Link
                href="/empanelment/apply"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-950 text-xs sm:text-sm font-bold px-6 py-3.5 rounded-full transition-all shadow-lg group w-full md:w-auto text-center"
              >
                <User className="w-4 h-4 text-slate-900 shrink-0" />
                <span>{content.ctaBtnText || "Register Now"}</span>
                <ArrowRight className="w-4 h-4 text-[#dc2626] group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
