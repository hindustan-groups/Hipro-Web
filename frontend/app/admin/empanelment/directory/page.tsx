"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Award,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  FileText,
  AlertCircle,
} from "lucide-react";
import SmartCardPreviewModal from "@/components/admin/empanelment/SmartCardPreviewModal";

export default function VerifiedPartnersDirectoryPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [selectedVendorForCard, setSelectedVendorForCard] = useState<any | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("status", "APPROVED");
      if (tierFilter !== "ALL") params.append("tier", tierFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/empanelment/admin/applications?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load partners");

      setPartners(json.applications || []);
    } catch (err: any) {
      setError(err.message || "Failed to load empanelled partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tierFilter]);

  const handleOpenSmartCard = (vendor: any) => {
    setSelectedVendorForCard(vendor);
    setIsCardOpen(true);
  };

  const handlePrintDossier = (vendor: any) => {
    // Open printable A4 dossier in a clean popup window
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Empanelment Dossier — ${vendor.companyName}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .brand { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
          .badge { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 999px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; }
          .label { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 4px; }
          .val { font-weight: 600; color: #0f172a; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">HINDUSTAN PROJECTS</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">OFFICIAL EMPANELMENT DOSSIER & VERIFICATION RECORD</div>
          </div>
          <div>
            <span class="badge">${vendor.tier?.replace("_", " ") || "TIER C"}</span>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <div class="label">Legal Enterprise Name</div>
            <div class="val">${vendor.companyName}</div>
          </div>
          <div class="box">
            <div class="label">Empanelment Tracking ID</div>
            <div class="val" style="font-family: monospace;">${vendor.trackingId}</div>
          </div>
          <div class="box">
            <div class="label">Authorized Contact Person</div>
            <div class="val">${vendor.contactName} (${vendor.phone})</div>
          </div>
          <div class="box">
            <div class="label">Trade Category</div>
            <div class="val">${vendor.category}</div>
          </div>
          <div class="box">
            <div class="label">GSTIN & PAN</div>
            <div class="val">${vendor.gstin || "N/A"} / ${vendor.pan}</div>
          </div>
          <div class="box">
            <div class="label">Registered Address</div>
            <div class="val">${vendor.address || "—"}, ${vendor.city || "—"} (${vendor.state || "—"})</div>
          </div>
        </div>

        <div class="box" style="margin-bottom: 20px;">
          <div class="label">Banking Registry</div>
          <div class="val">Bank: ${vendor.bankName || "—"} | Account: ${vendor.bankAccountNumber || "—"} | IFSC: ${vendor.bankIfsc || "—"}</div>
        </div>

        <div class="box" style="margin-bottom: 20px;">
          <div class="label">Official Status & Assessment</div>
          <div class="val">Empanelled Partner — Active | Capacity Score: ${vendor.eligibilityScore || 85}/100 | CEO Signature Attached: ${vendor.ceoSigned ? "YES (Digitally Sealed)" : "Verified by Verification Officer"}</div>
        </div>

        <div class="footer">
          <div>Generated from Hindustan Projects Master Portal</div>
          <div>Authorized Vendor Empanelment Registry • Jaipur, Rajasthan</div>
        </div>

        <script>
          window.print();
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">
              Verified Empanelled Partners Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Directory of all approved contractors and vendors with PVC Smart ID credentials & printable compliance dossiers
          </p>
        </div>

        <button
          onClick={fetchPartners}
          className="self-start md:self-auto p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search approved contractors by name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPartners()}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="w-full sm:w-auto bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Tiers (A, B, C, D)</option>
          <option value="TIER_A">Tier A (&gt; ₹2 Crore)</option>
          <option value="TIER_B">Tier B (₹50 Lakh – ₹2 Cr)</option>
          <option value="TIER_C">Tier C (₹10 Lakh – ₹50L)</option>
          <option value="TIER_D">Tier D (&lt; ₹10 Lakh)</option>
        </select>

        <span className="text-slate-400 text-xs ml-auto">
          {partners.length} active empanelled partners
        </span>
      </div>

      {/* Partner Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading partner directory...</div>
      ) : partners.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white/70 rounded-2xl border border-slate-200/60 space-y-2">
          <Users className="w-8 h-8 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700">No approved partners found</p>
          <p className="text-[11px] text-slate-400">Approve pending applications from the pipeline to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                    {partner.tier?.replace("_", " ")}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {partner.trackingId}
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-sm tracking-tight line-clamp-1">
                  {partner.companyName}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {partner.contactName} • {partner.category}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{partner.city || "—"}, {partner.state || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                    <span>GSTIN: {partner.gstin || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenSmartCard(partner)}
                  className="py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/60 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  <Award className="w-3 h-3 text-amber-700" />
                  <span>PVC Card</span>
                </button>
                <button
                  onClick={() => handlePrintDossier(partner)}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  <Printer className="w-3 h-3 text-slate-500" />
                  <span>A4 Dossier</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smart Card Modal */}
      <SmartCardPreviewModal
        vendor={selectedVendorForCard}
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
      />
    </div>
  );
}
