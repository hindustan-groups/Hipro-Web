"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  QrCode,
  Sparkles,
  RotateCw,
  Eye,
  Check,
  Building2,
  Award,
  Phone,
  MapPin,
  ExternalLink,
  Layers,
  ChevronDown,
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

export default function SmartCardPreviewModal({
  vendor,
  isOpen,
  onClose,
}: SmartCardPreviewModalProps) {
  const [viewMode, setViewMode] = useState<"3d" | "dual" | "front" | "back">("3d");
  const [isFlipped, setIsFlipped] = useState(false);
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

  // Reset flipped state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsFlipped(false);
      setViewMode("3d");
      setDownloadSuccess("");
    }
  }, [isOpen]);

  if (!isOpen || !vendor) return null;

  const trackingId = vendor.trackingId || "HP-EMP-000000";
  const companyName = vendor.companyName || "Authorized Contractor";
  const contactName = vendor.contactName || "Authorized Representative";
  const category = vendor.category || "General Construction";
  const city = vendor.city || "Rajasthan";
  const phone = vendor.phone || "+91 75970 00601";

  const tierKey = (vendor.tier || "TIER_C").toUpperCase();
  const tierLabels: Record<
    string,
    { label: string; tierCode: string; color: string; border: string; bg: string; badgeGrad: string }
  > = {
    TIER_A: {
      label: "CLASS A • MEGA INFRASTRUCTURE",
      tierCode: "CLASS-A",
      color: "text-amber-300",
      border: "border-amber-400/50",
      bg: "bg-amber-500/20",
      badgeGrad: "from-amber-400 via-amber-300 to-amber-500",
    },
    CLASS_A: {
      label: "CLASS A • MEGA INFRASTRUCTURE",
      tierCode: "CLASS-A",
      color: "text-amber-300",
      border: "border-amber-400/50",
      bg: "bg-amber-500/20",
      badgeGrad: "from-amber-400 via-amber-300 to-amber-500",
    },
    TIER_B: {
      label: "CLASS B • CORE CIVIL & MEP",
      tierCode: "CLASS-B",
      color: "text-slate-200",
      border: "border-slate-300/40",
      bg: "bg-slate-400/20",
      badgeGrad: "from-slate-200 via-white to-slate-300",
    },
    CLASS_B: {
      label: "CLASS B • CORE CIVIL & MEP",
      tierCode: "CLASS-B",
      color: "text-slate-200",
      border: "border-slate-300/40",
      bg: "bg-slate-400/20",
      badgeGrad: "from-slate-200 via-white to-slate-300",
    },
    TIER_C: {
      label: "CLASS C • SPECIALIZED TRADE",
      tierCode: "CLASS-C",
      color: "text-amber-200",
      border: "border-amber-600/50",
      bg: "bg-amber-700/25",
      badgeGrad: "from-amber-300 via-amber-400 to-amber-600",
    },
    CLASS_C: {
      label: "CLASS C • SPECIALIZED TRADE",
      tierCode: "CLASS-C",
      color: "text-amber-200",
      border: "border-amber-600/50",
      bg: "bg-amber-700/25",
      badgeGrad: "from-amber-300 via-amber-400 to-amber-600",
    },
    TIER_D: {
      label: "CLASS D • LOCAL SUPPLIER",
      tierCode: "CLASS-D",
      color: "text-slate-300",
      border: "border-slate-600/40",
      bg: "bg-slate-700/30",
      badgeGrad: "from-slate-400 via-slate-300 to-slate-500",
    },
    CLASS_D: {
      label: "CLASS D • LOCAL SUPPLIER",
      tierCode: "CLASS-D",
      color: "text-slate-300",
      border: "border-slate-600/40",
      bg: "bg-slate-700/30",
      badgeGrad: "from-slate-400 via-slate-300 to-slate-500",
    },
  };

  const currentTier = tierLabels[tierKey] || tierLabels.TIER_C;

  const issueDate = vendor.approvedAt
    ? new Date(vendor.approvedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase()
    : new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase();

  const expiryYear = new Date().getFullYear() + 2;
  const validThru = `OCT ${expiryYear}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `https://hindustanprojects.in/empanelment/verify-partner?id=${encodeURIComponent(trackingId)}`
  )}`;

  const handlePrint = () => {
    window.print();
  };

  // High-Resolution 300 DPI Canvas Rendering & Download Functionality
  const handleDownload = async (type: "front" | "back" | "both") => {
    setIsDownloading(true);
    setDownloadMenuOpen(false);

    try {
      const cardWidth = 1012; // 85.6mm at 300 DPI
      const cardHeight = 638; // 54mm at 300 DPI

      // Helper function to draw the FRONT side on a 2D canvas context
      const drawFront = (ctx: CanvasRenderingContext2D, dx: number, dy: number) => {
        // Base Card Gradient (Dark obsidian brushed metallic)
        const bgGrad = ctx.createLinearGradient(dx, dy, dx + cardWidth, dy + cardHeight);
        bgGrad.addColorStop(0, "#080c14");
        bgGrad.addColorStop(0.5, "#0f172a");
        bgGrad.addColorStop(1, "#1c1204");
        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        ctx.roundRect(dx, dy, cardWidth, cardHeight, 36);
        ctx.fill();

        // Metallic border
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Holographic corner glows
        const glowTop = ctx.createRadialGradient(dx + cardWidth, dy, 10, dx + cardWidth, dy, 320);
        glowTop.addColorStop(0, "rgba(251, 191, 36, 0.2)");
        glowTop.addColorStop(1, "rgba(251, 191, 36, 0)");
        ctx.fillStyle = glowTop;
        ctx.fillRect(dx, dy, cardWidth, cardHeight);

        // Header: Brand Title
        ctx.fillStyle = "#f59e0b";
        ctx.font = "900 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.letterSpacing = "2px";
        ctx.fillText("HINDUSTAN PROJECTS", dx + 44, dy + 64);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "700 13px -apple-system, sans-serif";
        ctx.letterSpacing = "1.5px";
        ctx.fillText("OFFICIAL EMPANELLED PARTNER CREDENTIAL • ISO 7810", dx + 44, dy + 88);

        // Gold Microchip (Smart Chip)
        const chipX = dx + cardWidth - 140;
        const chipY = dy + 44;
        const chipW = 96;
        const chipH = 74;
        const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
        chipGrad.addColorStop(0, "#fde68a");
        chipGrad.addColorStop(0.5, "#d97706");
        chipGrad.addColorStop(1, "#fef3c7");
        ctx.fillStyle = chipGrad;
        ctx.beginPath();
        ctx.roundRect(chipX, chipY, chipW, chipH, 12);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Chip circuit traces
        ctx.strokeStyle = "rgba(120, 53, 15, 0.45)";
        ctx.lineWidth = 2;
        ctx.strokeRect(chipX + 22, chipY + 14, 52, 46);
        ctx.beginPath();
        ctx.moveTo(chipX, chipY + 37);
        ctx.lineTo(chipX + 22, chipY + 37);
        ctx.moveTo(chipX + 74, chipY + 37);
        ctx.lineTo(chipX + chipW, chipY + 37);
        ctx.stroke();

        // Contactless / NFC waves
        ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(chipX - 28, chipY + 37, 14, -0.6, 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(chipX - 28, chipY + 37, 22, -0.6, 0.6);
        ctx.stroke();

        // Middle: Tier Pill Badge
        ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
        ctx.beginPath();
        ctx.roundRect(dx + 44, dy + 180, 420, 36, 18);
        ctx.fill();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#fbbf24";
        ctx.font = "800 13px -apple-system, monospace";
        ctx.letterSpacing = "1.5px";
        ctx.fillText(currentTier.label, dx + 64, dy + 204);

        // Company Name
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 34px -apple-system, sans-serif";
        ctx.letterSpacing = "0.5px";
        ctx.fillText(companyName.length > 28 ? companyName.substring(0, 26) + "..." : companyName, dx + 44, dy + 270);

        // Contact Name & Trade
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "600 20px -apple-system, sans-serif";
        ctx.fillText(`${contactName} • ${category}`, dx + 44, dy + 312);

        // Location
        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 16px -apple-system, sans-serif";
        ctx.fillText(`📍 ${city}, Rajasthan • Registered Trade Contractor`, dx + 44, dy + 344);

        // Divider Line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dx + 44, dy + 470);
        ctx.lineTo(dx + cardWidth - 44, dy + 470);
        ctx.stroke();

        // Tracking ID Block
        ctx.fillStyle = "#94a3b8";
        ctx.font = "700 13px -apple-system, monospace";
        ctx.letterSpacing = "2px";
        ctx.fillText("EMPANELMENT CREDENTIAL ID", dx + 44, dy + 510);

        ctx.fillStyle = "#fde047";
        ctx.font = "900 32px -apple-system, monospace";
        ctx.letterSpacing = "3px";
        ctx.fillText(trackingId, dx + 44, dy + 554);

        // Validity Dates
        ctx.fillStyle = "#94a3b8";
        ctx.font = "700 14px -apple-system, monospace";
        ctx.fillText(`ISSUED: ${issueDate}    •    VALID THRU: ${validThru}`, dx + 44, dy + 592);

        // Holographic Security Seal (Right bottom)
        const sealX = dx + cardWidth - 250;
        const sealY = dy + 524;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
        const sealGrad = ctx.createLinearGradient(sealX - 44, sealY - 44, sealX + 44, sealY + 44);
        sealGrad.addColorStop(0, "rgba(245, 158, 11, 0.4)");
        sealGrad.addColorStop(0.5, "rgba(234, 88, 12, 0.3)");
        sealGrad.addColorStop(1, "rgba(59, 130, 246, 0.3)");
        ctx.fillStyle = sealGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#fef08a";
        ctx.font = "800 10px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("★ GENUINE ★", sealX, sealY - 6);
        ctx.fillText("HI-PRO SEAL", sealX, sealY + 10);
        ctx.restore();
      };

      // Helper function to draw the BACK side on a 2D canvas context
      const drawBack = (ctx: CanvasRenderingContext2D, dx: number, dy: number) => {
        // Base Card Gradient
        const bgGrad = ctx.createLinearGradient(dx, dy, dx + cardWidth, dy + cardHeight);
        bgGrad.addColorStop(0, "#0b0f19");
        bgGrad.addColorStop(0.5, "#111827");
        bgGrad.addColorStop(1, "#18140e");
        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        ctx.roundRect(dx, dy, cardWidth, cardHeight, 36);
        ctx.fill();

        ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Magnetic Stripe
        ctx.fillStyle = "#09090b";
        ctx.fillRect(dx, dy + 36, cardWidth, 84);
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(dx, dy + 68, cardWidth, 18);

        // Security Warning
        ctx.fillStyle = "#64748b";
        ctx.font = "600 12px -apple-system, sans-serif";
        ctx.fillText(
          "Official property of Hindustan Projects. If found, please return to any HiPRO Procurement Office.",
          dx + 44,
          dy + 150
        );

        // Signature Panel
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(dx + 44, dy + 174, 520, 68, 8);
        ctx.fill();

        // Signature textured lines
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        for (let i = 184; i < 236; i += 8) {
          ctx.beginPath();
          ctx.moveTo(dx + 54, dy + i);
          ctx.lineTo(dx + 554, dy + i);
          ctx.stroke();
        }

        // Script Signature
        ctx.fillStyle = "#1e293b";
        ctx.font = "italic bold 26px 'Brush Script MT', cursive, sans-serif";
        ctx.fillText("R. K. Sharma", dx + 80, dy + 218);

        ctx.fillStyle = "#64748b";
        ctx.font = "700 10px -apple-system, sans-serif";
        ctx.fillText("AUTHORIZED OFFICER SIGNATURE", dx + 44, dy + 258);

        // Security Microtext Stamp
        ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
        ctx.fillRect(dx + 590, dy + 174, cardWidth - 634, 68);
        ctx.fillStyle = "#d97706";
        ctx.font = "800 11px -apple-system, monospace";
        ctx.fillText("SECURITY TOKEN ID", dx + 606, dy + 200);
        ctx.fillStyle = "#f59e0b";
        ctx.font = "900 16px -apple-system, monospace";
        ctx.fillText(trackingId, dx + 606, dy + 226);

        // Terms of Empanelment
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "800 13px -apple-system, sans-serif";
        ctx.fillText("TERMS & CONDITIONS OF VENDOR EMPANELMENT:", dx + 44, dy + 296);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 12px -apple-system, sans-serif";
        const terms = [
          "1. This card certifies authorized empanelment status for commercial bidding and project execution.",
          "2. Mandatory for site in-charge & labour supervisor entry to generate official 24-hr daily gate passes.",
          "3. Non-transferable. Misuse or tampered presentation will result in immediate contractor de-listing.",
          "4. Valid for 24 months from issuance. For renewals or tier upgrades, visit empanelment portal online.",
        ];
        terms.forEach((t, i) => {
          ctx.fillText(t, dx + 44, dy + 322 + i * 20);
        });

        // Corporate Footer
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(dx, dy + 420, cardWidth, 1);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "800 14px -apple-system, sans-serif";
        ctx.fillText("HINDUSTAN PROJECTS PROCUREMENT & CONTRACTS DIRECTORATE", dx + 44, dy + 450);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "600 12.5px -apple-system, sans-serif";
        ctx.fillText("📍 Headquarters: Bhopal Ganj, Bhilwara - 311001, Rajasthan, India", dx + 44, dy + 474);
        ctx.fillText("📞 24x7 Helpline: +91 75970 00601   •   ✉️ Email: procurement@hindustanprojects.in", dx + 44, dy + 496);

        // Barcode Graphic
        const barX = dx + 44;
        const barY = dy + 524;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(barX, barY, 480, 56);

        // Simulated Code-128 bars
        ctx.fillStyle = "#000000";
        let currX = barX + 16;
        for (let b = 0; b < 60; b++) {
          const w = (b % 4 === 0 || b % 7 === 0) ? 5 : (b % 3 === 0) ? 3 : 2;
          ctx.fillRect(currX, barY + 4, w, 36);
          currX += w + ((b % 2 === 0) ? 3 : 4);
          if (currX > barX + 460) break;
        }

        ctx.fillStyle = "#000000";
        ctx.font = "bold 11px -apple-system, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`*${trackingId}*`, barX + 240, barY + 50);
        ctx.textAlign = "left";

        ctx.fillStyle = "#64748b";
        ctx.font = "600 11px -apple-system, monospace";
        ctx.fillText("ISO 7810 ID-1 CR-80 COMPLIANT (85.60 × 53.98 × 0.76 mm)", dx + 550, dy + 560);
      };

      // Create high-res canvas
      const canvas = document.createElement("canvas");
      if (type === "both") {
        canvas.width = cardWidth * 2 + 80;
        canvas.height = cardHeight + 80;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawFront(ctx, 40, 40);
        drawBack(ctx, cardWidth + 60, 40);

        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `HiPRO_PVC_SmartCard_DualSheet_${trackingId}.png`;
        a.click();
      } else if (type === "front") {
        canvas.width = cardWidth;
        canvas.height = cardHeight;
        const ctx = canvas.getContext("2d")!;
        drawFront(ctx, 0, 0);

        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `HiPRO_PVC_Card_Front_${trackingId}.png`;
        a.click();
      } else if (type === "back") {
        canvas.width = cardWidth;
        canvas.height = cardHeight;
        const ctx = canvas.getContext("2d")!;
        drawBack(ctx, 0, 0);

        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `HiPRO_PVC_Card_Back_${trackingId}.png`;
        a.click();
      }

      setDownloadSuccess("Smart card exported in high-resolution 300 DPI PNG!");
      setTimeout(() => setDownloadSuccess(""), 4000);
    } catch (_err) {
      // Fallback
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Printable Sheet (Shown ONLY during @media print) */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 text-black z-100">
        <div className="max-w-[190mm] mx-auto text-center space-y-4">
          <div className="border-b-2 border-slate-900 pb-3">
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
              HINDUSTAN PROJECTS — CONTRACTOR PVC SMART CARD
            </h1>
            <p className="text-xs text-slate-600 font-mono">
              STANDARD ISO 7810 ID-1 SPECIFICATION • THERMAL CARD TRAY &amp; PAPER PRINT SHEET
            </p>
          </div>

          <div className="flex flex-row items-center justify-center gap-6 pt-4">
            {/* Print Front */}
            <div className="w-[85.6mm] h-[53.98mm] rounded-2xl p-4 bg-slate-950 text-white flex flex-col justify-between border-2 border-dashed border-slate-400 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[8px] font-mono font-bold text-amber-400">HINDUSTAN PROJECTS</p>
                  <p className="text-[6px] text-slate-400">EMPANELLED PARTNER CREDENTIAL</p>
                </div>
                <div className="w-7 h-5 rounded bg-amber-400 border border-amber-300" />
              </div>
              <div className="my-auto">
                <span className="text-[7px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentTier.label}
                </span>
                <p className="text-[11px] font-black mt-1 text-white truncate">{companyName}</p>
                <p className="text-[8px] text-slate-300">{contactName} • {category}</p>
              </div>
              <div className="flex items-end justify-between border-t border-white/20 pt-1">
                <div>
                  <p className="text-[6px] text-slate-400 font-mono">EMPANELMENT ID</p>
                  <p className="text-[10px] font-mono font-black text-amber-300">{trackingId}</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="QR" className="w-8 h-8 rounded bg-white p-0.5" />
              </div>
            </div>

            {/* Print Back */}
            <div className="w-[85.6mm] h-[53.98mm] rounded-2xl p-4 bg-slate-900 text-white flex flex-col justify-between border-2 border-dashed border-slate-400 relative overflow-hidden">
              <div className="h-4 bg-black w-full -mx-4 -mt-4 mb-1" />
              <div className="space-y-1">
                <p className="text-[6px] text-slate-400 leading-tight">
                  This card certifies authorized contractor status with Hindustan Projects.
                </p>
                <div className="h-5 bg-white rounded px-2 flex items-center justify-between text-slate-900">
                  <span className="text-[8px] font-bold italic">R. K. Sharma</span>
                  <span className="text-[5px] text-slate-500">AUTHORIZED OFFICER</span>
                </div>
              </div>
              <div className="border-t border-white/20 pt-1 text-[6px] text-slate-400 space-y-0.5">
                <p>📍 Bhopal Ganj, Bhilwara - 311001, Rajasthan</p>
                <p>📞 Helpline: +91 75970 00601 • procurement@hindustanprojects.in</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 pt-6">
            Print at 100% scale (no scaling / actual size). Cut along dashed lines for exact CR-80 PVC wallet dimensions.
          </p>
        </div>
      </div>

      {/* Screen Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Card */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-xs flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
                  Official PVC Smart Partner Card
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Dual-sided ISO 7810 ID-1 verified contractor smart credential
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Toolbar */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "3d"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>3D Flip View</span>
            </button>
            <button
              onClick={() => setViewMode("dual")}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "dual"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Both Sides (Dual)</span>
            </button>
            <button
              onClick={() => {
                setViewMode("front");
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                viewMode === "front"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Front
            </button>
            <button
              onClick={() => {
                setViewMode("back");
                setIsFlipped(true);
              }}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                viewMode === "back"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Back
            </button>
          </div>

          {/* Quick Flip Button for 3D Mode */}
          {viewMode === "3d" && (
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-bold text-[11px] border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <RotateCw className={`w-3.5 h-3.5 text-amber-700 transition-transform ${isFlipped ? "rotate-180" : ""}`} />
              <span>{isFlipped ? "Show Front Side" : "Flip to Back ↷"}</span>
            </button>
          )}
        </div>

        {/* Card Viewing Area */}
        <div className="p-4 sm:p-6 bg-slate-950/5 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[320px]">
          {/* Success Banner */}
          {downloadSuccess && (
            <div className="mb-4 w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* MODE 1: 3D Flip Interactive Card */}
          {viewMode === "3d" && (
            <div className="w-full max-w-[440px] flex flex-col items-center">
              <div
                className="w-full aspect-[1.586] cursor-pointer relative"
                style={{ perspective: "1400px" }}
                onClick={() => setIsFlipped(!isFlipped)}
                title="Click anywhere to flip card"
              >
                <div
                  className="w-full h-full relative transition-transform duration-700 rounded-2xl"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT SIDE (3D) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl p-5 shadow-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-[#0d131f] to-[#1c1305] text-white flex flex-col justify-between border border-amber-500/30 select-none group"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Metallic Glow Blobs */}
                    <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-52 h-52 rounded-full bg-gradient-to-tr from-blue-500/10 via-amber-500/10 to-transparent blur-2xl pointer-events-none" />

                    {/* Top Bar: Brand, Logo & Smart Chip */}
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
                          <p className="text-[11px] sm:text-xs tracking-widest uppercase font-mono font-black text-amber-400">
                            HINDUSTAN PROJECTS
                          </p>
                        </div>
                        <p className="text-[8px] tracking-wider text-slate-400 uppercase font-semibold pl-3.5">
                          EMPANELLED PARTNER CREDENTIAL
                        </p>
                      </div>

                      {/* Gold Microchip & Contactless Symbol */}
                      <div className="flex items-center gap-2">
                        {/* NFC / Contactless */}
                        <div className="text-amber-400/60 font-mono text-[10px] tracking-tighter rotate-90">
                          )))
                        </div>
                        {/* Microchip */}
                        <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 border border-amber-100/70 shadow-xs flex items-center justify-center relative overflow-hidden">
                          <div className="w-full h-[1px] bg-amber-700/40 absolute top-2" />
                          <div className="w-full h-[1px] bg-amber-700/40 absolute bottom-2" />
                          <div className="h-full w-[1px] bg-amber-700/40 absolute left-3.5" />
                          <div className="h-full w-[1px] bg-amber-700/40 absolute right-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Middle: Tier Pill & Company Name */}
                    <div className="relative z-10 my-auto py-1">
                      <span
                        className={`text-[8.5px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${currentTier.bg} ${currentTier.border} ${currentTier.color} uppercase inline-block mb-1.5 shadow-2xs`}
                      >
                        {currentTier.label}
                      </span>
                      <h3 className="text-sm sm:text-base font-black tracking-tight text-white line-clamp-1 drop-shadow-xs">
                        {companyName}
                      </h3>
                      <p className="text-[10px] text-slate-300 font-semibold mt-0.5">
                        {contactName} • {category}
                      </p>
                      <p className="text-[8.5px] text-slate-400 font-medium mt-0.5">
                        📍 {city}, Rajasthan • Registered Partner
                      </p>
                    </div>

                    {/* Bottom Bar: Tracking ID, Dates, Hologram & QR */}
                    <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/10">
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest font-mono font-semibold">
                          EMPANELMENT ID
                        </p>
                        <p className="text-xs sm:text-sm font-mono font-black text-amber-300 tracking-wider">
                          {trackingId}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[8px] text-slate-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                          <span>ISSUED: {issueDate}</span>
                          <span>•</span>
                          <span>VALID: {validThru}</span>
                        </div>
                      </div>

                      {/* Holographic Seal & Verification QR */}
                      <div className="flex items-center gap-2">
                        {/* Circular Security Seal */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-blue-500/20 border border-amber-400/50 flex flex-col items-center justify-center text-[6px] font-black text-amber-200 tracking-tighter leading-none shadow-xs">
                          <span>★ HI-PRO ★</span>
                          <span className="text-[5px] text-amber-300 mt-0.5">VERIFIED</span>
                        </div>
                        {/* QR Code */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrUrl}
                          alt="Verification QR"
                          className="w-11 h-11 rounded-lg bg-white p-0.5 shadow-sm shrink-0 border border-white/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE (3D) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl p-5 shadow-2xl overflow-hidden bg-gradient-to-br from-[#080d18] via-[#0f172a] to-[#1a1408] text-white flex flex-col justify-between border border-amber-500/30 select-none"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {/* Magnetic Stripe across top */}
                    <div className="absolute top-4 left-0 right-0 h-9 bg-gradient-to-b from-black via-slate-950 to-neutral-900 border-y border-white/10" />

                    <div className="pt-10">
                      <p className="text-[7.5px] text-slate-400 leading-tight">
                        Official property of Hindustan Projects. If found, please return to any Procurement Directorate office.
                      </p>
                    </div>

                    {/* Signature Strip & Officer Seal */}
                    <div className="my-auto py-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white rounded-md h-7 px-3 flex items-center justify-between text-slate-900 shadow-inner">
                          <span className="font-serif italic text-xs font-bold text-slate-900">
                            R. K. Sharma
                          </span>
                          <span className="text-[7px] font-mono text-slate-400 uppercase">
                            Authorized Officer
                          </span>
                        </div>
                        <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-[7px] font-mono font-bold text-amber-300">
                          SECURITY SEAL
                        </div>
                      </div>

                      {/* Terms text */}
                      <div className="mt-2 text-[7px] text-slate-400 space-y-0.5 leading-relaxed font-sans">
                        <p>• Mandatory for commercial tender bidding, site access &amp; 24-hr daily gate pass issuance.</p>
                        <p>• Misuse or unauthorized duplication will lead to immediate de-listing &amp; legal proceedings.</p>
                      </div>
                    </div>

                    {/* Bottom Bar: Barcode & Headquarters */}
                    <div className="pt-2 border-t border-white/10 flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="bg-white rounded px-2 py-1 w-44 flex flex-col items-center">
                          <div className="h-5 w-full flex items-center justify-between overflow-hidden">
                            {Array.from({ length: 42 }).map((_, idx) => (
                              <span
                                key={idx}
                                className="h-full bg-black"
                                style={{
                                  width: idx % 3 === 0 ? "3px" : idx % 5 === 0 ? "4px" : "1.5px",
                                  marginRight: "1px",
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-[7px] font-mono font-bold text-black tracking-widest mt-0.5">
                            *{trackingId}*
                          </span>
                        </div>
                        <p className="text-[6.5px] text-slate-400 font-mono">
                          ISO 7810 ID-1 CR-80 COMPLIANT • 85.6 × 53.98 MM
                        </p>
                      </div>

                      <div className="text-right text-[7px] text-slate-400 space-y-0.5">
                        <p className="font-bold text-slate-300">HINDUSTAN PROJECTS</p>
                        <p>📍 Bhilwara - 311001, Rajasthan</p>
                        <p>📞 +91 75970 00601</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3 text-center flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
                <span>Click the card anytime to flip 360° between Front &amp; Back view.</span>
              </p>
            </div>
          )}

          {/* MODE 2: Dual View (Both Sides Side-by-Side) */}
          {viewMode === "dual" && (
            <div className="w-full space-y-5 animate-in fade-in">
              {/* Front Card Container */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1 text-amber-700">
                    <Award className="w-3.5 h-3.5" />
                    <span>Card Front Side (Obverse)</span>
                  </span>
                  <span className="text-slate-400 font-mono">85.60 × 53.98 mm</span>
                </div>
                <div className="w-full aspect-[1.586] rounded-2xl p-4 sm:p-5 shadow-xl bg-gradient-to-br from-slate-950 via-[#0d131f] to-[#1c1305] text-white flex flex-col justify-between border border-amber-500/30 relative overflow-hidden select-none">
                  {/* Front Content */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] tracking-widest uppercase font-mono font-black text-amber-400">
                        HINDUSTAN PROJECTS
                      </p>
                      <p className="text-[8px] tracking-wider text-slate-400 uppercase font-semibold">
                        EMPANELLED PARTNER CREDENTIAL
                      </p>
                    </div>
                    <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 border border-amber-100/70 flex items-center justify-center relative overflow-hidden">
                      <div className="w-full h-[1px] bg-amber-700/40 absolute top-2" />
                      <div className="w-full h-[1px] bg-amber-700/40 absolute bottom-2" />
                    </div>
                  </div>
                  <div className="my-auto py-1">
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentTier.bg} ${currentTier.border} ${currentTier.color}`}>
                      {currentTier.label}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white mt-1 truncate">{companyName}</h3>
                    <p className="text-[10px] text-slate-300">{contactName} • {category}</p>
                  </div>
                  <div className="flex items-end justify-between pt-2 border-t border-white/10">
                    <div>
                      <p className="text-[7px] text-slate-400 font-mono">EMPANELMENT ID</p>
                      <p className="text-xs sm:text-sm font-mono font-black text-amber-300">{trackingId}</p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrUrl} alt="QR" className="w-10 h-10 rounded bg-white p-0.5" />
                  </div>
                </div>
              </div>

              {/* Back Card Container */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1 text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>Card Back Side (Reverse)</span>
                  </span>
                  <span className="text-slate-400 font-mono">HiCo Magnetic Stripe</span>
                </div>
                <div className="w-full aspect-[1.586] rounded-2xl p-4 sm:p-5 shadow-xl bg-gradient-to-br from-[#080d18] via-[#0f172a] to-[#1a1408] text-white flex flex-col justify-between border border-amber-500/30 relative overflow-hidden select-none">
                  <div className="absolute top-4 left-0 right-0 h-8 bg-black border-y border-white/10" />
                  <div className="pt-8">
                    <p className="text-[7.5px] text-slate-400">Official property of Hindustan Projects.</p>
                  </div>
                  <div className="my-auto py-1">
                    <div className="bg-white rounded h-6 px-3 flex items-center justify-between text-slate-900">
                      <span className="font-serif italic text-xs font-bold">R. K. Sharma</span>
                      <span className="text-[7px] font-mono text-slate-400 uppercase">Authorized Officer</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-end justify-between text-[7px] text-slate-400">
                    <div>
                      <span className="font-mono text-slate-300 font-bold">*{trackingId}*</span>
                      <p className="text-[6.5px]">ISO 7810 ID-1 CR-80 STANDARD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-200 font-bold">HINDUSTAN PROJECTS</p>
                      <p>📞 +91 75970 00601</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: Front Only */}
          {viewMode === "front" && (
            <div className="w-full max-w-[440px] animate-in fade-in">
              <div className="w-full aspect-[1.586] rounded-2xl p-5 shadow-2xl bg-gradient-to-br from-slate-950 via-[#0d131f] to-[#1c1305] text-white flex flex-col justify-between border border-amber-500/30 relative overflow-hidden select-none">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs tracking-widest uppercase font-mono font-black text-amber-400">
                      HINDUSTAN PROJECTS
                    </p>
                    <p className="text-[8px] tracking-wider text-slate-400 uppercase font-semibold">
                      EMPANELLED PARTNER CREDENTIAL
                    </p>
                  </div>
                  <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-200 border border-amber-100/70" />
                </div>
                <div className="my-auto py-1">
                  <span className={`text-[8.5px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${currentTier.bg} ${currentTier.border} ${currentTier.color}`}>
                    {currentTier.label}
                  </span>
                  <h3 className="text-base font-black text-white mt-1 truncate">{companyName}</h3>
                  <p className="text-[10px] text-slate-300">{contactName} • {category}</p>
                </div>
                <div className="flex items-end justify-between pt-2 border-t border-white/10">
                  <div>
                    <p className="text-[7.5px] text-slate-400 font-mono">EMPANELMENT ID</p>
                    <p className="text-sm font-mono font-black text-amber-300">{trackingId}</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="QR" className="w-11 h-11 rounded-lg bg-white p-0.5" />
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: Back Only */}
          {viewMode === "back" && (
            <div className="w-full max-w-[440px] animate-in fade-in">
              <div className="w-full aspect-[1.586] rounded-2xl p-5 shadow-2xl bg-gradient-to-br from-[#080d18] via-[#0f172a] to-[#1a1408] text-white flex flex-col justify-between border border-amber-500/30 relative overflow-hidden select-none">
                <div className="absolute top-4 left-0 right-0 h-9 bg-black border-y border-white/10" />
                <div className="pt-10">
                  <p className="text-[7.5px] text-slate-400">
                    Official property of Hindustan Projects. Non-transferable contractor identity token.
                  </p>
                </div>
                <div className="my-auto py-1">
                  <div className="bg-white rounded h-7 px-3 flex items-center justify-between text-slate-900">
                    <span className="font-serif italic text-xs font-bold">R. K. Sharma</span>
                    <span className="text-[7px] font-mono text-slate-400 uppercase">Authorized Officer</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-end justify-between text-[7px] text-slate-400">
                  <div>
                    <span className="font-mono text-slate-300 font-bold">*{trackingId}*</span>
                    <p className="text-[6.5px]">ISO 7810 ID-1 CR-80 STANDARD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-200 font-bold">HINDUSTAN PROJECTS</p>
                    <p>📞 +91 75970 00601</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500">
            Standard CR-80 dimensions (85.6 × 53.98 mm).
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
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? "Generating..." : "Download HD"}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {downloadMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-20 space-y-1 animate-in fade-in">
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
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Both Sides Sheet (PNG)</span>
                    <span className="text-[10px] text-amber-700 font-mono">Ready Print</span>
                  </button>
                </div>
              )}
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
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
