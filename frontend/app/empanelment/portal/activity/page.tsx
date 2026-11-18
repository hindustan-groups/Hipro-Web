"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  ShieldCheck,
  FileCheck2,
  QrCode,
  FolderOpen,
  Mail,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { vendorFetch } from "../context";

export default function VendorActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await vendorFetch("/api/vendor/portal/activity", {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          const activityList = json.data || json.logs || [];
          setLogs(activityList);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "VENDOR_LOGGED_IN":
      case "VENDOR_LOGGED_OUT":
        return <User className="w-4 h-4 text-blue-600" />;
      case "VENDOR_ACTIVATED":
      case "PASSWORD_RESET_COMPLETED":
        return <KeyRound className="w-4 h-4 text-emerald-600" />;
      case "TENDER_BID_SUBMITTED":
        return <FileCheck2 className="w-4 h-4 text-purple-600" />;
      case "GATE_PASS_ISSUED":
      case "SITE_GATE_PASS_GENERATED":
        return <QrCode className="w-4 h-4 text-amber-600" />;
      case "DOCUMENTS_REUPLOADED":
        return <FolderOpen className="w-4 h-4 text-indigo-600" />;
      case "STATUS_UPDATED":
      case "APPLICATION_APPROVED":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "EMAIL_SENT":
      case "CUSTOM_EMAIL_SENT":
        return <Mail className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Audit & Activity Timeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete immutable record of security logins, tender bids, site passes, and administrative changes.
        </p>
      </div>

      {/* Timeline Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading timeline events...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No activity recorded yet.</div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:inset-y-0 before:left-2.5 sm:before:left-3.5 before:w-0.5 before:bg-slate-200">
            {logs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  {getActionIcon(log.action)}
                </div>

                {/* Content */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                    <span className="font-bold text-xs text-slate-950">
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {log.details && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {log.details}
                    </p>
                  )}

                  <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center gap-3 text-[10px] text-slate-400">
                    <span>Actor: {log.actorName || log.actorType}</span>
                    <span>•</span>
                    <span className="uppercase">{log.actorType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

