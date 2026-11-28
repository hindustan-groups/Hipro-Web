"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FolderOpen,
  FileCheck2,
  FileText,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  ArrowRight,
  Info,
} from "lucide-react";
import { useVendorPortal, vendorFetch } from "../context";

export default function DocumentVaultPage() {
  const { vendor, refreshVendor } = useVendorPortal();
  const [docData, setDocData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Re-upload form state
  const [showReuploadForm, setShowReuploadForm] = useState(false);
  const [gstUrl, setGstUrl] = useState("");
  const [panUrl, setPanUrl] = useState("");
  const [chequeUrl, setChequeUrl] = useState("");
  const [msmeUrl, setMsmeUrl] = useState("");
  const [pastWorkUrl, setPastWorkUrl] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await vendorFetch("/api/vendor/portal/documents", {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDocData(json.data);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load document vault");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleReuploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    const updateDocs: Record<string, string> = {};
    if (gstUrl.trim()) updateDocs.gstCertificateUrl = gstUrl.trim();
    if (panUrl.trim()) updateDocs.panCardUrl = panUrl.trim();
    if (chequeUrl.trim()) updateDocs.bankChequeUrl = chequeUrl.trim();
    if (msmeUrl.trim()) updateDocs.msmeCertificateUrl = msmeUrl.trim();
    if (pastWorkUrl.trim()) updateDocs.workExperienceDocUrl = pastWorkUrl.trim();

    if (Object.keys(updateDocs).length === 0 && !comments.trim()) {
      setSubmitError("Please provide at least one updated document URL or remark.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await vendorFetch("/api/vendor/portal/documents/reupload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: updateDocs,
          comments: comments.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit document updates");
      }

      setSubmitSuccess("Documents submitted successfully for verification!");
      fetchDocs();
      refreshVendor();
      setTimeout(() => {
        setShowReuploadForm(false);
        setComments("");
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const app = docData?.application || vendor?.application;
  const isDocsRequested = app?.status === "DOCS_REQUESTED";

  const documentsList = useMemo(() => {
    if (Array.isArray(docData?.documents)) {
      return docData.documents;
    }
    const d = docData?.documents || {};
    return [
      {
        name: "Aadhaar Card (Front)",
        url: d.aadharFrontUrl || app?.aadharFrontUrl || null,
        required: true,
        status: (d.aadharFrontUrl || app?.aadharFrontUrl) ? "UPLOADED" : "PENDING",
      },
      {
        name: "Aadhaar Card (Back)",
        url: d.aadharBackUrl || app?.aadharBackUrl || null,
        required: true,
        status: (d.aadharBackUrl || app?.aadharBackUrl) ? "UPLOADED" : "PENDING",
      },
      {
        name: "PAN Card",
        url: d.panCardUrl || app?.panCardUrl || null,
        required: false,
        status: (d.panCardUrl || app?.panCardUrl) ? "UPLOADED" : "OPTIONAL",
      },
      {
        name: "GST Registration Certificate",
        url: d.gstCertificateUrl || app?.gstCertificateUrl || null,
        required: false,
        status: (d.gstCertificateUrl || app?.gstCertificateUrl) ? "UPLOADED" : "OPTIONAL",
      },
      {
        name: "Cancelled Bank Cheque / Statement",
        url: d.bankChequeUrl || app?.bankChequeUrl || null,
        required: false,
        status: (d.bankChequeUrl || app?.bankChequeUrl) ? "UPLOADED" : "OPTIONAL",
      },
      {
        name: "MSME / Udyam Certificate",
        url: d.msmeDocUrl || app?.msmeDocUrl || null,
        required: false,
        status: (d.msmeDocUrl || app?.msmeDocUrl) ? "UPLOADED" : "OPTIONAL",
      },
      {
        name: "Past Work Experience / Completion Certificate",
        url: d.workExperienceDocUrl || app?.workExperienceDocUrl || null,
        required: false,
        status: (d.workExperienceDocUrl || app?.workExperienceDocUrl) ? "UPLOADED" : "OPTIONAL",
      },
      {
        name: "Authorized Signatory Passport Photo",
        url: d.passportPhotoUrl || app?.passportPhotoUrl || null,
        required: false,
        status: (d.passportPhotoUrl || app?.passportPhotoUrl) ? "UPLOADED" : "OPTIONAL",
      },
    ];
  }, [docData, app]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Document Vault & Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official repository of your registered business proofs, tax certificates, and KYC documents.
          </p>
        </div>

        <button
          onClick={() => setShowReuploadForm(!showReuploadForm)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>{showReuploadForm ? "Close Form" : "Upload Revised Documents"}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* REVISION REQUEST ALERT BANNER */}
      {/* ============================================================== */}
      {isDocsRequested && (
        <div className="p-5 rounded-3xl bg-purple-50 border border-purple-200 text-purple-950 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-purple-700 shrink-0" />
            <h2 className="font-black text-sm text-purple-950">
              Procurement Committee Document Revision Request
            </h2>
          </div>
          <p className="text-xs text-purple-900 leading-relaxed">
            The HiPRO Empanelment Verification Team has reviewed your dossier and requested clarification or revised copies:
          </p>
          {docData?.adminRemarks && (
            <div className="p-3.5 rounded-2xl bg-white border border-purple-200/80 font-medium text-xs text-purple-950">
              &ldquo;{docData.adminRemarks}&rdquo;
            </div>
          )}
          <button
            onClick={() => setShowReuploadForm(true)}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Provide Revised Documents Below</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* RE-UPLOAD / UPDATE FORM */}
      {/* ============================================================== */}
      {showReuploadForm && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-black text-sm text-slate-950">Submit Document Revisions</h2>
            <p className="text-xs text-slate-500">Provide updated document links or cloud storage URLs</p>
          </div>

          {submitError && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{submitError}</div>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="font-semibold">{submitSuccess}</div>
            </div>
          )}

          <form onSubmit={handleReuploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Updated GST Certificate URL
                </label>
                <input
                  type="url"
                  value={gstUrl}
                  onChange={(e) => setGstUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Updated PAN Card URL
                </label>
                <input
                  type="url"
                  value={panUrl}
                  onChange={(e) => setPanUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cancelled Cheque / Bank Passbook URL
                </label>
                <input
                  type="url"
                  value={chequeUrl}
                  onChange={(e) => setChequeUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  MSME / Udyam Certificate URL
                </label>
                <input
                  type="url"
                  value={msmeUrl}
                  onChange={(e) => setMsmeUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Past Work Orders / Completion Certificate URL
              </label>
              <input
                type="url"
                value={pastWorkUrl}
                onChange={(e) => setPastWorkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 text-slate-900 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vendor Explanation / Clarification Comments
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Explain the changes made or provide bank details..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#dc2626]/20 text-slate-900 bg-slate-50/50"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowReuploadForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* DOCUMENTS GRID */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentsList.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200/90">
            Loading document vault records...
          </div>
        ) : (
          documentsList.map((doc: any) => {
            const hasUrl = !!doc.url;
            return (
              <div
                key={doc.name}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-950">{doc.name}</h3>
                        <p className="text-[10px] text-slate-400">
                          {doc.required ? "Mandatory Document" : "Supplementary Proof"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        doc.status === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800"
                          : doc.status === "REVISION_REQUESTED"
                          ? "bg-purple-100 text-purple-800 animate-pulse"
                          : hasUrl
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {hasUrl ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#dc2626] hover:underline flex items-center gap-1.5"
                    >
                      <span>View Uploaded Copy</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[11px] italic">Not uploaded</span>
                  )}

                  <button
                    onClick={() => setShowReuploadForm(true)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Replace / Update
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
