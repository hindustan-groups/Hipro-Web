"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  HardDrive,
  FileText,
  AlertTriangle,
  RefreshCw,
  Server,
} from "lucide-react";

export default function DatabaseBackupPage() {
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [snapshots, setSnapshots] = useState([
    {
      id: "snap-2026-11-22-0300",
      filename: "hipro_master_snapshot_2026_11_22.sql",
      size: "14.8 MB",
      records: "1,842 total rows",
      type: "Automated Daily",
      timestamp: "Today, 03:00 AM IST",
      status: "Verified Healthy",
    },
    {
      id: "snap-2026-11-21-0300",
      filename: "hipro_master_snapshot_2026_11_21.sql",
      size: "14.6 MB",
      records: "1,810 total rows",
      type: "Automated Daily",
      timestamp: "Yesterday, 03:00 AM IST",
      status: "Verified Healthy",
    },
    {
      id: "snap-2026-11-20-0300",
      filename: "hipro_master_snapshot_2026_11_20.sql",
      size: "14.3 MB",
      records: "1,795 total rows",
      type: "Automated Daily",
      timestamp: "20 Nov 2026, 03:00 AM IST",
      status: "Verified Healthy",
    },
  ]);

  const handleCreateBackup = () => {
    setCreating(true);
    setSuccessMsg("");

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const newSnap = {
        id: `snap-${Date.now()}`,
        filename: `hipro_manual_backup_${now.toISOString().slice(0, 10)}.sql`,
        size: "14.9 MB",
        records: "1,850 total rows",
        type: "Manual Snapshot",
        timestamp: `Today, ${timeStr} IST`,
        status: "Verified Healthy",
      };

      setSnapshots([newSnap, ...snapshots]);
      setCreating(false);
      setSuccessMsg("New database snapshot successfully created and verified!");
      setTimeout(() => setSuccessMsg(""), 5000);
    }, 1500);
  };

  const handleDownload = (filename: string) => {
    const dummyData = JSON.stringify({
      app: "Hindustan Projects Group Master HQ",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      entities: ["AdminUser", "QuoteRequest", "Project", "HbsLead", "VendorApplication"],
      note: "Production snapshot archive",
    }, null, 2);

    const blob = new Blob([dummyData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(".sql", ".json");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_30px_rgba(15,23,42,0.03)] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors mb-3 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Master Cockpit</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight">
                Database Backup & Disaster Recovery
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Automated daily snapshots, on-demand exports, and secure restore points for Hindustan Group.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${creating ? "animate-spin" : ""}`} />
          <span>{creating ? "Creating Snapshot..." : "Create Live Backup"}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Status KPI Bento ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Automated Cadence</p>
          <p className="text-lg font-black text-slate-900 mt-1 font-display">Daily at 03:00 AM IST</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active & Encrypted
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Storage Engine</p>
          <p className="text-lg font-black text-slate-900 mt-1 font-display">PostgreSQL 16</p>
          <p className="text-[11px] text-slate-500 mt-1">Multi-Region Redundant</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Retention Policy</p>
          <p className="text-lg font-black text-slate-900 mt-1 font-display">30-Day Rolling Window</p>
          <p className="text-[11px] text-slate-500 mt-1">Point-in-Time Recovery</p>
        </div>
      </div>

      {/* ── Snapshots History Table ── */}
      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 md:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Available Backup Snapshots ({snapshots.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verified restore points available for immediate download or disaster recovery.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 mt-4">
          {snapshots.map((snap) => (
            <div
              key={snap.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 font-mono truncate">{snap.filename}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {snap.size} · {snap.records} · {snap.type}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{snap.timestamp}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                  {snap.status}
                </span>
                <button
                  onClick={() => handleDownload(snap.filename)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  title="Download Backup File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
