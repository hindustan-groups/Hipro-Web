"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  X,
  Trash2,
} from "lucide-react";
import { useVendorPortal, vendorFetch } from "../context";

async function compressFileToDataUrl(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read PDF file."));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
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
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = () => reject(new Error("Invalid image file."));
      img.src = String(ev.target?.result || "");
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function DocumentVaultPage() {
  const { vendor, refreshVendor } = useVendorPortal();
  const [docData, setDocData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string } | null>(null);

  // Re-upload form state (file uploads, no raw URL inputs)
  const [showReuploadForm, setShowReuploadForm] = useState(false);
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
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
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setSubmitError("File size must be under 8 MB.");
      return;
    }
    setSubmitError("");
    setUploadingKey(key);
    try {
      const dataUrl = await compressFileToDataUrl(file);
      setUploads((prev) => ({ ...prev, [key]: dataUrl }));
    } catch (err: any) {
      setSubmitError(err.message || "Failed to process document.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleReuploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    if (Object.keys(uploads).length === 0 && !comments.trim()) {
      setSubmitError("Please upload at least one document or add a note.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await vendorFetch("/api/vendor/portal/documents/reupload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: uploads,
          comments: comments.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit document updates");
      }

      setSubmitSuccess("Documents uploaded successfully!");
      setUploads({});
      await fetchDocs();
      await refreshVendor();
      setTimeout(() => {
        setShowReuploadForm(false);
        setComments("");
        setSubmitSuccess("");
      }, 1200);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const app = docData?.application || vendor?.application;
  const isDocsRequested = app?.status === "DOCS_REQUESTED";

  const documentsList = useMemo(() => {
    const d = docData?.documents || {};
    return [
      {
        key: "aadharFrontUrl",
        name: "Aadhaar Card (Front)",
        url: d.aadharFrontUrl || app?.aadharFrontUrl || null,
        required: true,
        status: d.aadharFrontUrl || app?.aadharFrontUrl ? "UPLOADED" : "PENDING",
      },
      {
        key: "aadharBackUrl",
        name: "Aadhaar Card (Back)",
        url: d.aadharBackUrl || app?.aadharBackUrl || null,
        required: true,
        status: d.aadharBackUrl || app?.aadharBackUrl ? "UPLOADED" : "PENDING",
      },
      {
        key: "passportPhotoUrl",
        name: "Passport-Size Photo (For PVC ID Card)",
        url: d.passportPhotoUrl || app?.passportPhotoUrl || null,
        required: true,
        status: d.passportPhotoUrl || app?.passportPhotoUrl ? "UPLOADED" : "PENDING",
      },
      {
        key: "panCardUrl",
        name: "PAN Card",
        url: d.panCardUrl || app?.panCardUrl || null,
        required: false,
        status: d.panCardUrl || app?.panCardUrl ? "UPLOADED" : "OPTIONAL",
      },
      {
        key: "gstCertificateUrl",
        name: "GST Registration Certificate",
        url: d.gstCertificateUrl || app?.gstCertificateUrl || null,
        required: false,
        status: d.gstCertificateUrl || app?.gstCertificateUrl ? "UPLOADED" : "OPTIONAL",
      },
      {
        key: "bankChequeUrl",
        name: "Cancelled Bank Cheque / Passbook",
        url: d.bankChequeUrl || app?.bankChequeUrl || null,
        required: false,
        status: d.bankChequeUrl || app?.bankChequeUrl ? "UPLOADED" : "OPTIONAL",
      },
    ];
  }, [docData, app]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Document Vault &amp; KYC
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View your uploaded Aadhaar, PAN, Passport Photo, and compliance documents or upload updated copies.
          </p>
        </div>

        <button
          onClick={() => setShowReuploadForm(!showReuploadForm)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>{showReuploadForm ? "Close Upload" : "Upload / Update Documents"}</span>
        </button>
      </div>

      {/* Revision Request Alert */}
      {isDocsRequested && (
        <div className="p-5 rounded-3xl bg-purple-50 border border-purple-200 text-purple-950 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-purple-700 shrink-0" />
            <h2 className="font-black text-sm text-purple-950">
              Document Revision Requested
            </h2>
          </div>
          {docData?.adminRemarks && (
            <div className="p-3.5 rounded-2xl bg-white border border-purple-200/80 font-medium text-xs text-purple-950">
              &ldquo;{docData.adminRemarks}&rdquo;
            </div>
          )}
          <button
            onClick={() => setShowReuploadForm(true)}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <span>Upload Updated Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* File Upload Form */}
      {showReuploadForm && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-black text-sm text-slate-950">Upload / Replace Documents</h2>
            <p className="text-xs text-slate-500">
              Select clear photos or PDFs from your phone or computer.
            </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {documentsList.map((item) => {
                const uploadedVal = uploads[item.key];
                return (
                  <div
                    key={item.key}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                      {uploadedVal && (
                        <button
                          type="button"
                          onClick={() =>
                            setUploads((prev) => {
                              const next = { ...prev };
                              delete next[item.key];
                              return next;
                            })
                          }
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {uploadedVal ? (
                      uploadedVal.startsWith("data:application/pdf") ? (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>PDF Ready</span>
                        </div>
                      ) : (
                        <img
                          src={uploadedVal}
                          alt={item.name}
                          className="w-full h-24 object-cover rounded-xl border border-slate-200"
                        />
                      )
                    ) : (
                      <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white cursor-pointer transition-colors p-2 text-center">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[11px] font-bold text-slate-700">
                          {uploadingKey === item.key ? "Processing..." : "Tap to Upload"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileSelect(e, item.key)}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Note / Remarks (Optional)
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Any note for verification team..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:outline-none focus:border-slate-900"
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
                {submitting ? "Uploading..." : "Save Documents"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200/90">
            Loading document vault records...
          </div>
        ) : (
          documentsList.map((doc) => {
            const hasUrl = !!doc.url;
            const isImage =
              hasUrl &&
              (doc.url.startsWith("data:image/") ||
                /\.(jpg|jpeg|png|webp)(\?|$)/i.test(doc.url));
            return (
              <div
                key={doc.key}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {isImage ? (
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-slate-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-slate-950 truncate">{doc.name}</h3>
                      <p className="text-[10px] text-slate-400">
                        {doc.required ? "Required Document" : "Optional / Supplementary"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                      hasUrl
                        ? "bg-emerald-100 text-emerald-800"
                        : doc.required
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {hasUrl ? (
                    <button
                      type="button"
                      onClick={() => setPreviewDoc({ name: doc.name, url: doc.url })}
                      className="text-xs font-bold text-[#dc2626] hover:underline flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Document</span>
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px] italic">Not uploaded</span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowReuploadForm(true)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {hasUrl ? "Replace" : "Upload"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* In-Page Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">{previewDoc.name}</h3>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center max-h-[75vh] overflow-auto">
              {previewDoc.url.startsWith("data:application/pdf") ||
              previewDoc.url.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-[65vh] rounded-xl border border-slate-200 bg-white"
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-w-full max-h-[68vh] rounded-xl object-contain shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
