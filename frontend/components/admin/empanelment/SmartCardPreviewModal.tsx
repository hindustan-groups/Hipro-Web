"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  RotateCw,
  Check,
  ChevronDown,
  Layers,
} from "lucide-react";

export interface SmartCardVendor {
  companyName?: string;
  contactName?: string;
  trackingId?: string;
  tier?: string;
  category?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  approvedAt?: string | null;
  createdAt?: string | null;
  pan?: string | null;
  gstin?: string | null;
}

interface SmartCardPreviewModalProps {
  vendor: SmartCardVendor | null;
  isOpen: boolean;
  onClose: () => void;
}

// =========================================================================
// CARD SHARED PROPS INTERFACE
// =========================================================================
interface CardRenderProps {
  companyName: string;
  contactName: string;
  trackingId: string;
  category: string;
  city: string;
  state: string;
  currentTier: { label: string; code: string; bg: string; text: string; border: string };
  issueDate: string;
  validThru: string;
  qrUrl: string;
  officialWebsite: string;
  officialPortal: string;
  officialAddress: string;
  officialHelpline: string;
  officialEmail: string;
  isPrint?: boolean;
}

// =========================================================================
// UNIFIED FRONT CARD COMPONENT (Used on Screen, Both-Sides & Print)
// =========================================================================
function UnifiedCardFront({
  companyName,
  contactName,
  trackingId,
  category,
  city,
  state,
  currentTier,
  issueDate,
  validThru,
  qrUrl,
  officialWebsite,
  isPrint = false,
}: CardRenderProps) {
  return (
    <div
      className={`w-full h-full rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl overflow-hidden flex flex-col justify-between select-none relative ${
        isPrint ? "print-exact-front" : ""
      }`}
      style={{ aspectRatio: "85.6 / 53.98" }}
    >
      {/* Top Header Banner */}
      <div className="bg-[#0F2C59] px-3.5 py-2 sm:px-4 sm:py-2.5 border-b-[3px] border-[#D9232A] flex items-center justify-between text-white shrink-0 relative z-10">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Official HiPRO Logo */}
          <div className="h-7 sm:h-8 px-1.5 py-0.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hipro-logo.jpg"
              alt="HiPRO Official Logo"
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <div className="text-[11px] sm:text-[13px] font-black tracking-wider leading-none">
              HINDUSTAN <span className="text-[#D9232A]">PROJECTS</span>
            </div>
            <p className="text-[6.5px] sm:text-[7.5px] tracking-wide text-sky-200 uppercase font-semibold mt-0.5 leading-none">
              EPC &amp; INFRASTRUCTURE • VERIFIED CREDENTIAL
            </p>
          </div>
        </div>

        {/* Gold Chip & NFC Symbol */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="text-amber-400 font-mono text-[8px] sm:text-[9px] tracking-tighter rotate-90 opacity-90 leading-none">
            )))
          </div>
          <div className="w-8 h-6 sm:w-9 sm:h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 border border-amber-100 shadow-xs flex items-center justify-center relative overflow-hidden">
            <div className="w-full h-[1px] bg-amber-800/40 absolute top-2" />
            <div className="w-full h-[1px] bg-amber-800/40 absolute bottom-2" />
            <div className="h-full w-[1px] bg-amber-800/40 absolute left-2.5" />
            <div className="h-full w-[1px] bg-amber-800/40 absolute right-2.5" />
          </div>
        </div>
      </div>

      {/* Middle Identity Section */}
      <div className="px-3.5 py-1 sm:px-4 sm:py-2 my-auto flex-1 flex flex-col justify-center relative z-10">
        {/* Security HiPRO Logo Watermark */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-[#0F2C59]/15 pointer-events-none flex items-center justify-center p-3 select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hipro-logo.jpg"
            alt="HiPRO Watermark"
            className="w-18 sm:w-24 h-auto object-contain opacity-15 mix-blend-multiply select-none"
          />
        </div>

        {/* Tier Pill */}
        <div>
          <span
            className={`text-[7.5px] sm:text-[8.5px] font-mono font-black tracking-wider px-2 py-0.5 rounded-full uppercase inline-block shadow-2xs ${
              currentTier.code === "CLASS-C"
                ? "bg-[#D9232A] text-white border border-red-700"
                : "bg-[#0F2C59] text-amber-300 border border-amber-400"
            }`}
          >
            {currentTier.label}
          </span>
        </div>

        {/* Company Name */}
        <h3 className="text-xs sm:text-base font-black tracking-tight text-[#0F2C59] line-clamp-1 mt-1 leading-snug">
          {companyName}
        </h3>

        {/* Contact & Category */}
        <p className="text-[9px] sm:text-[10.5px] font-bold text-[#D9232A] mt-0.5 leading-snug">
          {contactName} • {category}
        </p>

        <p className="text-[7.5px] sm:text-[8.5px] font-medium text-slate-500 mt-0.5 leading-snug">
          📍 {city}, {state} • Approved Trade Partner
        </p>

        {/* Website line */}
        <p className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-[#0F2C59] mt-0.5 leading-snug">
          🌐 {officialWebsite}
        </p>
      </div>

      {/* Bottom Security & Verification Bar */}
      <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 border-t border-slate-200/90 bg-slate-50/95 flex items-center justify-between gap-2 shrink-0 relative z-10">
        {/* Empanelment ID Block */}
        <div className="bg-[#0F2C59] text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl shadow-xs border border-[#0B2545]">
          <p className="text-[5.5px] sm:text-[6.5px] text-sky-200 font-mono tracking-widest uppercase font-bold leading-none">
            EMPANELMENT ID
          </p>
          <p className="text-[10.5px] sm:text-[13px] font-mono font-black text-amber-300 tracking-wider leading-tight">
            {trackingId}
          </p>
          <p className="text-[5.5px] sm:text-[6.5px] text-slate-300 font-mono leading-none">
            ISSUED: {issueDate} • VALID: {validThru}
          </p>
        </div>

        {/* Holographic Seal & Verification QR */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Circular Holographic Security Seal with HiPRO Logo */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-500 via-[#D9232A] to-[#0F2C59] p-0.5 shadow-xs shrink-0">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-0.5 leading-none text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hipro-logo.jpg" alt="HiPRO Seal" className="w-4 sm:w-5 h-auto object-contain" />
              <span className="text-[3.5px] sm:text-[4px] font-black text-[#D9232A] tracking-tighter uppercase mt-0.5">
                VERIFIED
              </span>
            </div>
          </div>

          {/* Live Verification QR */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="Verification QR"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white p-0.5 shadow-xs shrink-0 border border-slate-300"
          />
        </div>
      </div>

      {/* Dual Color Edge Ribbon */}
      <div className="flex h-1.5 w-full shrink-0">
        <div className="bg-[#0F2C59] flex-1" />
        <div className="bg-[#D9232A] w-1/3" />
      </div>
    </div>
  );
}

// =========================================================================
// UNIFIED BACK CARD COMPONENT (Used on Screen, Both-Sides & Print)
// =========================================================================
function UnifiedCardBack({
  trackingId,
  officialWebsite,
  officialAddress,
  officialHelpline,
  officialEmail,
  isPrint = false,
}: CardRenderProps) {
  return (
    <div
      className={`w-full h-full rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl overflow-hidden flex flex-col justify-between select-none relative ${
        isPrint ? "print-exact-back" : ""
      }`}
      style={{ aspectRatio: "85.6 / 53.98" }}
    >
      {/* Top Navy Trim */}
      <div className="bg-[#0F2C59] h-2.5 w-full shrink-0 border-b border-[#D9232A]" />

      {/* HiCo Magnetic Stripe */}
      <div className="h-7 sm:h-8 bg-[#1E293B] w-full shrink-0 flex items-center px-4">
        <div className="h-1.5 sm:h-2 w-full bg-slate-700/50 rounded-xs" />
      </div>

      <div className="px-3.5 sm:px-4 pt-1">
        <p className="text-[6.5px] sm:text-[7px] text-slate-500 leading-tight">
          Official property of Hindustan Projects. If found, please return to any Procurement Directorate office.
        </p>
      </div>

      {/* Signature Strip & Officer Seal */}
      <div className="px-3.5 sm:px-4 my-auto py-0.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 rounded-md h-6 sm:h-7 px-2.5 sm:px-3 flex items-center justify-between border border-slate-300 shadow-inner">
            <span className="font-serif italic text-[11px] sm:text-xs font-bold text-[#0F2C59]">
              R. K. Sharma
            </span>
            <span className="text-[6px] sm:text-[6.5px] font-mono text-slate-500 uppercase font-bold">
              Authorized Officer
            </span>
          </div>
          <div className="px-2 py-0.5 sm:py-1 rounded bg-[#0F2C59] text-white text-[6.5px] sm:text-[7px] font-mono font-bold border border-[#D9232A]">
            VALIDATED
          </div>
        </div>

        {/* Official Terms */}
        <div className="mt-1 sm:mt-1.5 text-[6px] sm:text-[6.8px] text-slate-600 space-y-0.5 leading-relaxed">
          <p>• Mandatory for commercial tender bidding, site access &amp; 24-hr daily gate pass issuance.</p>
          <p>• Misuse or unauthorized duplication will lead to immediate de-listing &amp; legal proceedings.</p>
        </div>
      </div>

      {/* Official HQ Address, Website & Barcode Section */}
      <div className="px-3.5 sm:px-4 py-1.5 sm:py-2 border-t border-slate-200 bg-slate-50 flex items-end justify-between shrink-0">
        <div className="space-y-0.5">
          <div className="bg-white rounded px-2 py-0.5 w-32 sm:w-40 flex flex-col items-center border border-slate-300">
            <div className="h-3 sm:h-4 w-full flex items-center justify-between overflow-hidden">
              {Array.from({ length: 36 }).map((_, idx) => (
                <span
                  key={idx}
                  className="h-full bg-black"
                  style={{
                    width: idx % 3 === 0 ? "2.5px" : idx % 5 === 0 ? "3.5px" : "1.2px",
                    marginRight: "1px",
                  }}
                />
              ))}
            </div>
            <span className="text-[5.5px] sm:text-[6.5px] font-mono font-bold text-black tracking-widest mt-0.5 leading-none">
              *{trackingId}*
            </span>
          </div>
          <p className="text-[5.5px] sm:text-[6px] text-slate-500 font-mono leading-none">
            ISO 7810 ID-1 CR-80 COMPLIANT • 85.6 × 53.98 MM
          </p>
        </div>

        <div className="text-right text-[6px] sm:text-[6.5px] text-slate-600 space-y-0.5 max-w-[210px] sm:max-w-[240px]">
          <p className="font-black text-[#0F2C59] text-[7px] sm:text-[7.5px] leading-tight">HINDUSTAN PROJECTS</p>
          <p className="line-clamp-1 leading-tight">📍 {officialAddress}</p>
          <p className="font-mono font-bold text-[#D9232A] leading-tight">🌐 {officialWebsite}</p>
          <p className="leading-tight">📞 {officialHelpline} • ✉️ {officialEmail}</p>
        </div>
      </div>

      {/* Dual Color Edge Ribbon */}
      <div className="flex h-1.5 w-full shrink-0">
        <div className="bg-[#0F2C59] flex-1" />
        <div className="bg-[#D9232A] w-1/3" />
      </div>
    </div>
  );
}

// =========================================================================
// MAIN MODAL COMPONENT
// =========================================================================
export default function SmartCardPreviewModal({
  vendor,
  isOpen,
  onClose,
}: SmartCardPreviewModalProps) {
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [showBothSides, setShowBothSides] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState("");

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSide("front");
      setShowBothSides(false);
      setDownloadSuccess("");
    }
  }, [isOpen]);

  if (!isOpen || !vendor) return null;

  const trackingId = vendor.trackingId || "HP-EMP-108201";
  const companyName = vendor.companyName || "Marwar Infra & Builders Pvt Ltd";
  const contactName = vendor.contactName || "Rajendra Choudhary";
  const category = vendor.category || "Civil Construction";
  const city = vendor.city || "Bhilwara";
  const state = vendor.state || "Rajasthan";

  // Official Company Meta
  const officialWebsite = "www.hindustanprojects.in";
  const officialPortal = "empanelment.hindustanprojects.in";
  const officialAddress = "Opp. Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara - 311001, Rajasthan, India";
  const officialHelpline = "+91 75970 00601";
  const officialEmail = "procurement@hindustanprojects.in";

  const tierKey = (vendor.tier || "TIER_C").toUpperCase();
  const tierConfig: Record<
    string,
    { label: string; code: string; bg: string; text: string; border: string }
  > = {
    TIER_A: {
      label: "CLASS A • MEGA INFRASTRUCTURE",
      code: "CLASS-A",
      bg: "bg-[#0F2C59]",
      text: "text-amber-300",
      border: "border-amber-400",
    },
    CLASS_A: {
      label: "CLASS A • MEGA INFRASTRUCTURE",
      code: "CLASS-A",
      bg: "bg-[#0F2C59]",
      text: "text-amber-300",
      border: "border-amber-400",
    },
    TIER_B: {
      label: "CLASS B • CORE CIVIL & MEP",
      code: "CLASS-B",
      bg: "bg-[#0F2C59]",
      text: "text-sky-200",
      border: "border-sky-300",
    },
    CLASS_B: {
      label: "CLASS B • CORE CIVIL & MEP",
      code: "CLASS-B",
      bg: "bg-[#0F2C59]",
      text: "text-sky-200",
      border: "border-sky-300",
    },
    TIER_C: {
      label: "CLASS C • SPECIALIZED TRADE",
      code: "CLASS-C",
      bg: "bg-[#D9232A]",
      text: "text-white",
      border: "border-red-600",
    },
    CLASS_C: {
      label: "CLASS C • SPECIALIZED TRADE",
      code: "CLASS-C",
      bg: "bg-[#D9232A]",
      text: "text-white",
      border: "border-red-600",
    },
    TIER_D: {
      label: "CLASS D • REGISTERED SUPPLIER",
      code: "CLASS-D",
      bg: "bg-slate-800",
      text: "text-slate-100",
      border: "border-slate-600",
    },
    CLASS_D: {
      label: "CLASS D • REGISTERED SUPPLIER",
      code: "CLASS-D",
      bg: "bg-slate-800",
      text: "text-slate-100",
      border: "border-slate-600",
    },
  };

  const currentTier = tierConfig[tierKey] || tierConfig.TIER_C;

  const issueDate = vendor.approvedAt
    ? new Date(vendor.approvedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase()
    : new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase();

  const expiryYear = new Date().getFullYear() + 2;
  const validThru = `OCT ${expiryYear}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    `https://hindustanprojects.in/empanelment/verify-partner?id=${encodeURIComponent(trackingId)}`
  )}`;

  const cardProps: CardRenderProps = {
    companyName,
    contactName,
    trackingId,
    category,
    city,
    state,
    currentTier,
    issueDate,
    validThru,
    qrUrl,
    officialWebsite,
    officialPortal,
    officialAddress,
    officialHelpline,
    officialEmail,
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to load image for high-res canvas
  const loadImg = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image: " + src));
      img.src = src;
    });
  };

  // High-Resolution 300 DPI Canvas Rendering & Download Functionality
  const handleDownload = async (type: "front" | "back" | "both") => {
    setIsDownloading(true);
    setDownloadMenuOpen(false);

    try {
      const cardWidth = 1012; // 85.6mm at 300 DPI
      const cardHeight = 638; // 54mm at 300 DPI

      // Preload HiPRO logo and QR code
      const [logoImg, qrImg] = await Promise.all([
        loadImg("/hipro-logo.jpg").catch(() => null),
        loadImg(qrUrl).catch(() => null),
      ]);

      // Draw FRONT side matching the exact HTML card
      const drawFront = (ctx: CanvasRenderingContext2D, dx: number, dy: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(dx, dy, cardWidth, cardHeight, 36);
        ctx.clip();

        // Card Base
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(dx, dy, cardWidth, cardHeight);

        // Top Header Banner
        const bannerHeight = 126;
        const bannerGrad = ctx.createLinearGradient(dx, dy, dx + cardWidth, dy + bannerHeight);
        bannerGrad.addColorStop(0, "#0F2C59");
        bannerGrad.addColorStop(0.7, "#0B2545");
        bannerGrad.addColorStop(1, "#091D36");
        ctx.fillStyle = bannerGrad;
        ctx.fillRect(dx, dy, cardWidth, bannerHeight);

        // Crimson Red Accent Line
        ctx.fillStyle = "#D9232A";
        ctx.fillRect(dx, dy + bannerHeight - 6, cardWidth, 6);

        // HiPRO Brand Logo
        const logoX = dx + 44;
        const logoY = dy + 22;
        const logoW = 86;
        const logoH = 82;

        if (logoImg) {
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(logoX, logoY, logoW, logoH, 12);
          ctx.fill();
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.drawImage(logoImg, logoX + 6, logoY + 6, logoW - 12, logoH - 12);
        }

        // Header Title: HINDUSTAN PROJECTS
        const textOffsetX = logoImg ? logoX + logoW + 20 : logoX + 64;
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 25px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.letterSpacing = "2px";
        ctx.fillText("HINDUSTAN", textOffsetX, dy + 56);

        ctx.fillStyle = "#D9232A";
        ctx.fillText("PROJECTS", textOffsetX + 172, dy + 56);

        // Subtitle
        ctx.fillStyle = "#93C5FD";
        ctx.font = "700 12px -apple-system, monospace";
        ctx.letterSpacing = "1.5px";
        ctx.fillText("EPC & INFRASTRUCTURE • VERIFIED CREDENTIAL", textOffsetX, dy + 82);

        // Gold Smart Microchip (Right Header)
        const chipX = dx + cardWidth - 146;
        const chipY = dy + 28;
        const chipW = 96;
        const chipH = 74;

        const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
        chipGrad.addColorStop(0, "#FDE68A");
        chipGrad.addColorStop(0.5, "#D97706");
        chipGrad.addColorStop(1, "#FEF3C7");
        ctx.fillStyle = chipGrad;
        ctx.beginPath();
        ctx.roundRect(chipX, chipY, chipW, chipH, 12);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Chip circuit traces
        ctx.strokeStyle = "rgba(120, 53, 15, 0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(chipX + 22, chipY + 14, 52, 46);
        ctx.beginPath();
        ctx.moveTo(chipX, chipY + 37);
        ctx.lineTo(chipX + 22, chipY + 37);
        ctx.moveTo(chipX + 74, chipY + 37);
        ctx.lineTo(chipX + chipW, chipY + 37);
        ctx.stroke();

        // Contactless / NFC waves
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(chipX - 26, chipY + 37, 14, -0.6, 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(chipX - 26, chipY + 37, 22, -0.6, 0.6);
        ctx.stroke();

        // --- MIDDLE IDENTITY SECTION ---
        // Watermark HiPRO Logo in Background (Center-Right)
        const wmX = dx + cardWidth - 230;
        const wmY = dy + 290;
        const wmRadius = 110;
        ctx.save();
        ctx.strokeStyle = "rgba(15, 44, 89, 0.10)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(wmX, wmY, wmRadius, 0, Math.PI * 2);
        ctx.stroke();

        if (logoImg) {
          ctx.globalAlpha = 0.12;
          const logoWmW = 140;
          const logoWmH = 140;
          ctx.drawImage(logoImg, wmX - logoWmW / 2, wmY - logoWmH / 2, logoWmW, logoWmH);
        }
        ctx.restore();

        // Tier Pill Badge
        const tierBadgeY = dy + 158;
        ctx.fillStyle = currentTier.code === "CLASS-C" ? "#D9232A" : "#0F2C59";
        ctx.beginPath();
        ctx.roundRect(dx + 44, tierBadgeY, 360, 36, 18);
        ctx.fill();
        ctx.strokeStyle = currentTier.code === "CLASS-C" ? "#B91C1C" : "#F59E0B";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "800 13px -apple-system, monospace";
        ctx.letterSpacing = "1.5px";
        ctx.fillText(currentTier.label, dx + 64, tierBadgeY + 23);

        // Company Name
        ctx.fillStyle = "#0F2C59";
        ctx.font = "900 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.letterSpacing = "0.5px";
        const displayComp = companyName.length > 28 ? companyName.substring(0, 26) + "..." : companyName;
        ctx.fillText(displayComp, dx + 44, dy + 240);

        // Authorized Contact & Category
        ctx.fillStyle = "#D9232A";
        ctx.font = "700 20px -apple-system, sans-serif";
        ctx.fillText(`${contactName} • ${category}`, dx + 44, dy + 278);

        // Location & Accreditation
        ctx.fillStyle = "#475569";
        ctx.font = "600 16px -apple-system, sans-serif";
        ctx.fillText(`📍 ${city}, ${state} • Approved Trade Partner`, dx + 44, dy + 312);

        // Website line on front
        ctx.fillStyle = "#0F2C59";
        ctx.font = "700 14px -apple-system, monospace";
        ctx.fillText(`🌐 ${officialWebsite}`, dx + 44, dy + 342);

        // Divider
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dx + 44, dy + 450);
        ctx.lineTo(dx + cardWidth - 44, dy + 450);
        ctx.stroke();

        // --- BOTTOM SECTION ---
        // Empanelment ID Block
        const idBoxW = 420;
        const idBoxH = 100;
        const idBoxX = dx + 44;
        const idBoxY = dy + 474;

        ctx.fillStyle = "#0F2C59";
        ctx.beginPath();
        ctx.roundRect(idBoxX, idBoxY, idBoxW, idBoxH, 16);
        ctx.fill();

        ctx.strokeStyle = "#D9232A";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#FBBF24";
        ctx.font = "700 12px -apple-system, monospace";
        ctx.letterSpacing = "2px";
        ctx.fillText("EMPANELMENT CREDENTIAL ID", idBoxX + 22, idBoxY + 30);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 30px -apple-system, monospace";
        ctx.letterSpacing = "3px";
        ctx.fillText(trackingId, idBoxX + 22, idBoxY + 68);

        ctx.fillStyle = "#93C5FD";
        ctx.font = "700 12px -apple-system, monospace";
        ctx.fillText(`ISSUED: ${issueDate}  •  VALID: ${validThru}`, idBoxX + 22, idBoxY + 88);

        // Circular Holographic Seal (Right bottom) with HiPRO Logo
        const sealX = dx + cardWidth - 210;
        const sealY = dy + 524;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sealX, sealY, 46, 0, Math.PI * 2);
        const sealGrad = ctx.createLinearGradient(sealX - 46, sealY - 46, sealX + 46, sealY + 46);
        sealGrad.addColorStop(0, "#F59E0B");
        sealGrad.addColorStop(0.3, "#D9232A");
        sealGrad.addColorStop(0.7, "#0F2C59");
        sealGrad.addColorStop(1, "#10B981");
        ctx.fillStyle = sealGrad;
        ctx.fill();
        ctx.strokeStyle = "#FDE68A";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (logoImg) {
          ctx.beginPath();
          ctx.arc(sealX, sealY, 38, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
          ctx.drawImage(logoImg, sealX - 22, sealY - 24, 44, 32);
          ctx.fillStyle = "#D9232A";
          ctx.font = "900 8px -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("VERIFIED", sealX, sealY + 18);
        }
        ctx.restore();

        // QR Code
        if (qrImg) {
          const qrX = dx + cardWidth - 120;
          const qrY = dy + 474;
          const qrSize = 76;
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(qrX, qrY, qrSize, qrSize, 10);
          ctx.fill();
          ctx.strokeStyle = "#CBD5E1";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.drawImage(qrImg, qrX + 4, qrY + 4, qrSize - 8, qrSize - 8);
        }

        // Bottom Edge Dual Color Band
        ctx.fillStyle = "#0F2C59";
        ctx.fillRect(dx, dy + cardHeight - 8, cardWidth * 0.7, 8);
        ctx.fillStyle = "#D9232A";
        ctx.fillRect(dx + cardWidth * 0.7, dy + cardHeight - 8, cardWidth * 0.3, 8);

        ctx.restore();
      };

      // Draw BACK side matching the exact HTML card
      const drawBack = (ctx: CanvasRenderingContext2D, dx: number, dy: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(dx, dy, cardWidth, cardHeight, 36);
        ctx.clip();

        // Card Base
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(dx, dy, cardWidth, cardHeight);

        // Top Brand Navy Trim
        ctx.fillStyle = "#0F2C59";
        ctx.fillRect(dx, dy, cardWidth, 24);
        ctx.fillStyle = "#D9232A";
        ctx.fillRect(dx, dy + 24, cardWidth, 4);

        // HiCo Magnetic Stripe
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(dx, dy + 36, cardWidth, 80);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(dx, dy + 66, cardWidth, 16);

        // Notice text
        ctx.fillStyle = "#64748B";
        ctx.font = "600 12px -apple-system, sans-serif";
        ctx.fillText(
          "Official property of Hindustan Projects. If found, please return to any Procurement Directorate office.",
          dx + 44,
          dy + 144
        );

        // Signature Panel
        ctx.fillStyle = "#F1F5F9";
        ctx.beginPath();
        ctx.roundRect(dx + 44, dy + 162, 540, 68, 8);
        ctx.fill();
        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Signature textured lines
        ctx.strokeStyle = "#E2E8F0";
        for (let i = 172; i < 222; i += 8) {
          ctx.beginPath();
          ctx.moveTo(dx + 54, dy + i);
          ctx.lineTo(dx + 574, dy + i);
          ctx.stroke();
        }

        // Script Signature
        ctx.fillStyle = "#0F2C59";
        ctx.font = "italic bold 28px 'Brush Script MT', cursive, Georgia, serif";
        ctx.fillText("R. K. Sharma", dx + 80, dy + 208);

        ctx.fillStyle = "#64748B";
        ctx.font = "700 10px -apple-system, sans-serif";
        ctx.fillText("DIRECTOR & AUTHORIZED SIGNATORY", dx + 44, dy + 246);

        // Security Token Box (Right of signature)
        ctx.fillStyle = "#0F2C59";
        ctx.beginPath();
        ctx.roundRect(dx + 610, dy + 162, cardWidth - 654, 68, 8);
        ctx.fill();
        ctx.strokeStyle = "#D9232A";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#93C5FD";
        ctx.font = "800 11px -apple-system, monospace";
        ctx.fillText("SECURITY TOKEN", dx + 626, dy + 190);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 16px -apple-system, monospace";
        ctx.fillText(trackingId, dx + 626, dy + 216);

        // Terms of Empanelment
        ctx.fillStyle = "#0F2C59";
        ctx.font = "900 13px -apple-system, sans-serif";
        ctx.fillText("TERMS & CONDITIONS OF VENDOR EMPANELMENT:", dx + 44, dy + 278);

        ctx.fillStyle = "#334155";
        ctx.font = "500 12px -apple-system, sans-serif";
        const terms = [
          "1. This card certifies authorized contractor status for commercial bidding and turnkey civil execution.",
          "2. Mandatory for site in-charge & labour supervisor entry to generate official 24-hr daily gate passes.",
          "3. Non-transferable. Misuse or tampered presentation will result in immediate contractor de-listing.",
          "4. Valid for 24 months from issuance. For renewals or tier upgrades, visit empanelment.hindustanprojects.in.",
        ];
        terms.forEach((t, i) => {
          ctx.fillText(t, dx + 44, dy + 302 + i * 19);
        });

        // Corporate Footer
        ctx.fillStyle = "#E2E8F0";
        ctx.fillRect(dx + 44, dy + 392, cardWidth - 88, 1);

        ctx.fillStyle = "#0F2C59";
        ctx.font = "900 14px -apple-system, sans-serif";
        ctx.fillText("HINDUSTAN PROJECTS PROCUREMENT & CONTRACTS DIRECTORATE", dx + 44, dy + 418);

        // Address & Official Coordinates
        ctx.fillStyle = "#334155";
        ctx.font = "600 12.5px -apple-system, sans-serif";
        ctx.fillText(`📍 Corporate HQ: ${officialAddress}`, dx + 44, dy + 442);
        ctx.fillText(`🌐 Official Website: ${officialWebsite}   •   Portal: ${officialPortal}`, dx + 44, dy + 464);
        ctx.fillText(`📞 24x7 Helpline: ${officialHelpline}   •   ✉️ Email: ${officialEmail}`, dx + 44, dy + 486);

        // Barcode Graphic
        const barX = dx + 44;
        const barY = dy + 512;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(barX, barY, 480, 60, 6);
        ctx.fill();
        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#000000";
        let currX = barX + 16;
        for (let b = 0; b < 64; b++) {
          const w = b % 4 === 0 || b % 7 === 0 ? 5 : b % 3 === 0 ? 3 : 2;
          ctx.fillRect(currX, barY + 6, w, 34);
          currX += w + (b % 2 === 0 ? 3 : 4);
          if (currX > barX + 460) break;
        }

        ctx.font = "bold 11px -apple-system, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`*${trackingId}*`, barX + 240, barY + 52);
        ctx.textAlign = "left";

        ctx.fillStyle = "#0F2C59";
        ctx.font = "700 11px -apple-system, monospace";
        ctx.fillText("ISO 7810 ID-1 CR-80 COMPLIANT • 85.60 × 53.98 MM", dx + 540, barY + 52);

        // Bottom Edge Band
        ctx.fillStyle = "#0F2C59";
        ctx.fillRect(dx, dy + cardHeight - 8, cardWidth * 0.7, 8);
        ctx.fillStyle = "#D9232A";
        ctx.fillRect(dx + cardWidth * 0.7, dy + cardHeight - 8, cardWidth * 0.3, 8);

        ctx.restore();
      };

      // Create high-res off-screen canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas 2D context");

      if (type === "front") {
        canvas.width = cardWidth;
        canvas.height = cardHeight;
        drawFront(ctx, 0, 0);
      } else if (type === "back") {
        canvas.width = cardWidth;
        canvas.height = cardHeight;
        drawBack(ctx, 0, 0);
      } else {
        // Dual side sheet (Front on top, Back on bottom with print guidelines)
        const sheetPadding = 60;
        const gap = 50;
        canvas.width = cardWidth + sheetPadding * 2;
        canvas.height = cardHeight * 2 + sheetPadding * 2 + gap + 100;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sheet Header
        ctx.fillStyle = "#0F2C59";
        ctx.font = "900 24px -apple-system, sans-serif";
        ctx.fillText("HINDUSTAN PROJECTS — PVC SMART PARTNER CARD SPECIFICATION", sheetPadding, 48);

        ctx.fillStyle = "#D9232A";
        ctx.font = "700 13px -apple-system, monospace";
        ctx.fillText(`CR-80 ISO 7810 COMPLIANT (85.60 × 53.98 MM) • ${officialWebsite}`, sheetPadding, 74);

        // Front Card
        drawFront(ctx, sheetPadding, 100);

        // Back Card
        drawBack(ctx, sheetPadding, 100 + cardHeight + gap);

        // Footer Cut Guidelines
        ctx.fillStyle = "#64748B";
        ctx.font = "500 13px -apple-system, sans-serif";
        ctx.fillText(
          `Official Corporate Address: ${officialAddress} | Support: ${officialHelpline}`,
          sheetPadding,
          canvas.height - 30
        );
      }

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      const filename =
        type === "front"
          ? `HindustanProjects-Card-Front-${trackingId}.png`
          : type === "back"
          ? `HindustanProjects-Card-Back-${trackingId}.png`
          : `HindustanProjects-SmartCard-DualSheet-${trackingId}.png`;

      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(
        `Downloaded ${type.toUpperCase()} high-res card (300 DPI) successfully!`
      );
      setTimeout(() => setDownloadSuccess(""), 4000);
    } catch (err) {
      console.error("Card download failed:", err);
      alert("Failed to generate image. Please try again or use the Print option.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* ============================================================ */}
      {/* PRINTABLE SHEET (Shown ONLY during @media print)            */}
      {/* Exact ISO 7810 ID-1 standard dimensions (85.60 × 53.98 mm)   */}
      {/* ============================================================ */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 text-black z-100">
        <div className="max-w-[190mm] mx-auto text-center space-y-4">
          <div className="border-b-2 border-[#0F2C59] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hipro-logo.jpg" alt="HiPRO Logo" className="h-10 w-auto object-contain bg-white rounded p-0.5" />
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider text-[#0F2C59]">
                  HINDUSTAN <span className="text-[#D9232A]">PROJECTS</span>
                </h1>
                <p className="text-xs text-slate-600 font-mono">
                  OFFICIAL EMPANELLED CONTRACTOR PVC SMART CARD (ISO 7810 ID-1)
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs font-bold text-slate-700">
              ID: {trackingId}
            </div>
          </div>

          {/* Exact 85.6mm × 53.98mm Print Cards */}
          <div className="flex flex-row items-center justify-center gap-8 pt-4">
            {/* Front Card Print */}
            <div className="w-[85.6mm] h-[53.98mm] shrink-0 border-2 border-dashed border-[#0F2C59] rounded-2xl relative shadow-sm">
              <UnifiedCardFront {...cardProps} isPrint />
            </div>

            {/* Back Card Print */}
            <div className="w-[85.6mm] h-[53.98mm] shrink-0 border-2 border-dashed border-[#0F2C59] rounded-2xl relative shadow-sm">
              <UnifiedCardBack {...cardProps} isPrint />
            </div>
          </div>

          <div className="pt-6 space-y-1">
            <p className="text-[11px] font-bold text-slate-800 font-mono">
              ★ PRINTING INSTRUCTIONS: PRINT AT 100% SCALE (NO SCALING / ACTUAL SIZE).
            </p>
            <p className="text-[9.5px] text-slate-500">
              Dimensions: 85.60 mm × 53.98 mm (CR-80). Cut along the outer dashed lines for exact thermal card tray or pouch lamination fit.
            </p>
          </div>
        </div>
      </div>

      {/* Screen Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* ============================================================ */}
      {/* MAIN MODAL CONTAINER                                         */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-xs flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F2C59] p-1 flex items-center justify-center shadow-md border border-[#0B2545]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hipro-logo.jpg" alt="HiPRO Logo" className="h-full w-auto object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-[#0F2C59] tracking-tight">
                  Official PVC Smart Partner Card
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-[#D9232A] border border-red-200">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Standard CR-80 (85.60 × 53.98 mm) contractor smart identity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Clean Single Side Controller (NO duplicate rows) */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => {
                setActiveSide("front");
                setShowBothSides(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeSide === "front" && !showBothSides
                  ? "bg-[#0F2C59] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Front Side
            </button>
            <button
              onClick={() => {
                setActiveSide("back");
                setShowBothSides(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeSide === "back" && !showBothSides
                  ? "bg-[#0F2C59] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Back Side
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Both Sides Toggle */}
            <button
              onClick={() => setShowBothSides(!showBothSides)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showBothSides
                  ? "bg-[#0F2C59] text-white border-[#0F2C59]"
                  : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showBothSides ? "Single Card" : "Both Sides"}</span>
            </button>

            {/* Quick Flip Button */}
            {!showBothSides && (
              <button
                onClick={() => setActiveSide(activeSide === "front" ? "back" : "front")}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#D9232A] font-bold text-xs border border-red-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip ↷</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD VIEWING STAGE                                           */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-6 bg-slate-100/70 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[300px]">
          {/* Download Success Banner */}
          {downloadSuccess && (
            <div className="mb-4 w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {!showBothSides ? (
            /* Single Interactive 3D Card */
            <div className="w-full max-w-[450px] flex flex-col items-center">
              <div
                className="w-full aspect-[85.6/53.98] cursor-pointer relative"
                style={{ perspective: "1400px" }}
                onClick={() => setActiveSide(activeSide === "front" ? "back" : "front")}
                title="Click card to flip 360°"
              >
                <div
                  className="w-full h-full relative transition-transform duration-700 rounded-2xl"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: activeSide === "back" ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front Side */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <UnifiedCardFront {...cardProps} />
                  </div>

                  {/* Back Side */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <UnifiedCardBack {...cardProps} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3 text-center flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-[#D9232A] animate-spin-slow" />
                <span>Card par click karein ya &quot;Flip&quot; dabayein (Front aur Back dekhne ke liye).</span>
              </p>
            </div>
          ) : (
            /* Both Sides View (Clean Stacked) */
            <div className="w-full max-w-[450px] space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <p className="text-[10.5px] font-bold text-slate-700">Front Side (Obverse)</p>
                <div className="w-full aspect-[85.6/53.98]">
                  <UnifiedCardFront {...cardProps} />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10.5px] font-bold text-slate-700">Back Side (Reverse)</p>
                <div className="w-full aspect-[85.6/53.98]">
                  <UnifiedCardBack {...cardProps} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* FOOTER ACTIONS                                               */}
        {/* ============================================================ */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500">
            Standard ISO 7810 ID-1 PVC dimensions (85.60 × 53.98 mm).
          </p>

          <div className="flex items-center justify-end gap-2 relative">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>

            {/* Download Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                disabled={isDownloading}
                className="px-4 py-2.5 rounded-2xl bg-[#D9232A] hover:bg-[#B91C1C] text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? "Generating..." : "Download HD"}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {downloadMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-54 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-20 space-y-1 animate-in fade-in">
                  <button
                    onClick={() => handleDownload("front")}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Download Front (PNG)</span>
                    <span className="text-[10px] text-slate-400 font-mono">300 DPI</span>
                  </button>
                  <button
                    onClick={() => handleDownload("back")}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Download Back (PNG)</span>
                    <span className="text-[10px] text-slate-400 font-mono">300 DPI</span>
                  </button>
                  <div className="h-[1px] bg-slate-100 my-1" />
                  <button
                    onClick={() => handleDownload("both")}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#D9232A] bg-red-50 hover:bg-red-100 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Both Sides Sheet (PNG)</span>
                    <span className="text-[10px] text-[#D9232A] font-mono">Ready Print</span>
                  </button>
                </div>
              )}
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-2xl bg-[#0F2C59] hover:bg-[#0B2545] text-white font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print PVC Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
