"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  Landmark,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Lock,
  Camera,
} from "lucide-react";
import { useVendorPortal, vendorFetch } from "../context";

async function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(ev.target?.result || ""));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Invalid image file."));
      img.src = String(ev.target?.result || "");
    };
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

export default function VendorProfilePage() {
  const { vendor, refreshVendor } = useVendorPortal();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    contactName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    passportPhotoUrl: "",
    bankAccountNo: "",
    bankIfsc: "",
    bankName: "",
    bankBranch: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await vendorFetch("/api/vendor/portal/profile");
        if (res.ok) {
          const data = await res.json();
          const app = data.application || data.data?.application || {};
          setFormData({
            contactName: app.contactName || "",
            phone: app.phone || "",
            address: app.address || "",
            city: app.city || app.district || "",
            state: app.state || "",
            pincode: app.pincode || "",
            passportPhotoUrl: app.passportPhotoUrl || "",
            bankAccountNo: app.accountNumber || app.bankAccountNo || "",
            bankIfsc: app.ifscCode || app.bankIfsc || "",
            bankName: app.bankName || "",
            bankBranch: app.bankBranch || "",
          });
        }
      } catch (err: any) {
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const res = await vendorFetch("/api/vendor/portal/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setSuccess("Profile information updated successfully.");
      await refreshVendor();
    } catch (err: any) {
      setError(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const app = vendor?.application;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enterprise Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review verified statutory enterprise registration details and maintain updated contact information.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Passport-Size Photo for Smart PVC ID Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-xl border-2 border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
              {formData.passportPhotoUrl ? (
                <img
                  src={formData.passportPhotoUrl}
                  alt="Passport Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Passport-Size Photo (For PVC Smart Card)
                </h2>
                {!formData.passportPhotoUrl && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Required for ID Card
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Upload a clear front-facing photo. This photo will appear on your official Hindustan Projects PVC ID Card.
              </p>
            </div>
          </div>

          <label className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors">
            <Camera className="w-4 h-4" />
            <span>{formData.passportPhotoUrl ? "Change Photo" : "Upload Photo"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const dataUrl = await compressPhoto(file);
                  setFormData((prev) => ({ ...prev, passportPhotoUrl: dataUrl }));
                } catch (_err) {
                  setError("Invalid photo file.");
                }
              }}
            />
          </label>
        </div>

        {/* Verified Statutory Details (Read-only) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#ea580c]" />
              <h2 className="text-base font-bold text-slate-900">Verified Statutory Enterprise Details</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Lock className="w-3.5 h-3.5" />
              Locked by Empanelment Directorate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Enterprise Legal Name</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{app?.companyName || "—"}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Tracking Dossier ID</p>
              <p className="text-sm font-mono font-semibold text-slate-900 mt-1">{app?.trackingId || "—"}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Primary Work Classification</p>
              <p className="text-sm font-semibold text-[#ea580c] mt-1">
                {app?.category || (app as any)?.primaryRole || "General Contractor"}
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Vendor Type &amp; Experience</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {(app as any)?.entityType === "INDIVIDUAL_WORKER"
                  ? "Individual / Only Worker"
                  : (app as any)?.entityType === "RUN_SMALL_TEAM"
                  ? "Contractor with Team"
                  : (app as any)?.entityType === "OWN_BUSINESS"
                  ? "Business / Firm"
                  : (app as any)?.entityType || "Vendor"}
                {(app as any)?.experienceYears ? ` • ${(app as any).experienceYears}` : ""}
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Empanelment Status / Tier</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{app?.tier || "CLASS B"} • {app?.status || "SUBMITTED"}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Project Scale &amp; Mobile</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {(app as any)?.projectScale || "Standard"} • {app?.phone || vendor?.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Authorized Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-5 h-5 text-[#ea580c]" />
            <h2 className="text-base font-bold text-slate-900">Authorized Representative & Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Person Name *
              </label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operating Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State / PIN Code</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Landmark className="w-5 h-5 text-[#ea580c]" />
            <h2 className="text-base font-bold text-slate-900">Procurement Settlement & Banking Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. State Bank of India"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                placeholder="e.g. Bhilwara Main Branch"
                value={formData.bankBranch}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                placeholder="Account No."
                value={formData.bankAccountNo}
                onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. SBIN0001234"
                value={formData.bankIfsc}
                onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white font-semibold text-sm hover:from-[#c2410c] hover:to-[#ea580c] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Profile Updates"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
