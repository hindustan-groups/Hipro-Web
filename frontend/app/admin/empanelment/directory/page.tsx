"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Printer,
  ShieldCheck,
  Award,
  Phone,
  MapPin,
  AlertCircle,
  CreditCard,
  Check,
} from "lucide-react";
import EmpanelmentAdminPageHeader from "@/components/admin/empanelment/EmpanelmentAdminPageHeader";
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

      if (res.status === 401 || (res.redirected && res.url.includes("admin-login"))) {
        window.location.href = "/admin-login";
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Unable to load empanelled directory (Session expired or server error)");
      }

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

  const [copiedInviteVendorId, setCopiedInviteVendorId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const handleInviteVendor = async (vendorId: string) => {
    setInvitingId(vendorId);
    try {
      const res = await fetch(`/api/empanelment/admin/accounts/invite/${vendorId}`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        const link = json.data?.activationUrl || `${window.location.origin}/empanelment/activate?token=${json.data?.token}`;
        navigator.clipboard.writeText(link);
        setCopiedInviteVendorId(vendorId);
        setTimeout(() => setCopiedInviteVendorId(null), 3000);
      }
    } catch (_e) {
    } finally {
      setInvitingId(null);
    }
  };

  const handleOpenSmartCard = (vendor: any) => {
    setSelectedVendorForCard(vendor);
    setIsCardOpen(true);
  };

  const handlePrintDossier = (vendor: any) => {
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
            <span class="badge">${vendor.tier?.replace("_", " ") || "CLASS C"}</span>
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

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case "CLASS_A":
        return <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Class A</span>;
      case "CLASS_B":
        return <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Class B</span>;
      case "CLASS_C":
        return <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Class C</span>;
      default:
        return <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">{tier?.replace("_", " ") || "Class C"}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Apple-Style Page Header */}
      <EmpanelmentAdminPageHeader
        breadcrumbs={[{ label: "Partner Directory" }]}
        title="Verified Partners Directory"
        description="Official rolodex of approved contractors and suppliers with digital credentials and compliance dossiers."
        badge={`${partners.length} Active Partners`}
      >
        <button
          onClick={fetchPartners}
          disabled={loading}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 transition-all shadow-xs disabled:opacity-50"
          title="Refresh Directory"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </EmpanelmentAdminPageHeader>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white/75 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search approved contractors by name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPartners()}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 hover:bg-white rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Tiers (A, B, C, D)</option>
            <option value="CLASS_A">Class A (&gt; ₹2 Crore)</option>
            <option value="CLASS_B">Class B (₹50 Lakh – ₹2 Cr)</option>
            <option value="CLASS_C">Class C (₹10 Lakh – ₹50L)</option>
            <option value="CLASS_D">Class D (&lt; ₹10 Lakh)</option>
          </select>

          <span className="text-slate-400 text-xs font-medium shrink-0 ml-auto hidden sm:inline">
            {partners.length} active partners
          </span>
        </div>
      </div>

      {/* Partner Cards Grid */}
      {loading ? (
        <div className="p-14 text-center text-xs text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-600 mb-2" />
          Loading partner directory...
        </div>
      ) : partners.length === 0 ? (
        <div className="p-14 text-center text-xs text-slate-500 bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 space-y-2">
          <Users className="w-9 h-9 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700">No approved partners found</p>
          <p className="text-[11px] text-slate-400">Approve pending applications from the pipeline to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white/85 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.02)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  {getTierBadge(partner.tier)}
                  <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                    {partner.trackingId}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm tracking-tight line-clamp-1">
                  {partner.companyName}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {partner.contactName} • {partner.category}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{partner.city || "—"}{partner.state ? `, ${partner.state}` : ""}</span>
                  </div>
                  {partner.gstin && (
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 pt-0.5">
                      <span>GSTIN: {partner.gstin}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleInviteVendor(partner.id)}
                  disabled={invitingId === partner.id}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  {copiedInviteVendorId === partner.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Activation Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>{invitingId === partner.id ? "Generating..." : "Invite / Copy Portal Link"}</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenSmartCard(partner)}
                    className="py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CreditCard className="w-3 h-3 text-amber-600" />
                    <span>PVC Card</span>
                  </button>
                  <button
                    onClick={() => handlePrintDossier(partner)}
                    className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3 h-3 text-slate-500" />
                    <span>Dossier</span>
                  </button>
                </div>
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
