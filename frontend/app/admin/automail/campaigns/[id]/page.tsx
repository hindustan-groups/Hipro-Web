"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart2,
  Building2,
  Hammer,
  Globe2,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function CampaignReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/automail/campaigns/${id}`);
      const data = await res.json();
      if (data.success) {
        setReport(data);
      }
    } catch (err) {
      console.error("Failed to load report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-xs">Loading transmission report...</p>
      </div>
    );
  }

  if (!report || !report.campaign) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
        <h3 className="text-base font-bold text-slate-900">Campaign Not Found</h3>
        <p className="text-xs text-slate-500">The requested transmission report does not exist.</p>
        <Link
          href="/admin/automail/campaigns"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Return to Campaigns
        </Link>
      </div>
    );
  }

  const { campaign, summary } = report;
  const logs = campaign.logs || [];
  const progress = summary.total > 0 ? ((summary.sent + summary.failed) / summary.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <AutoMailNav activeBrand={campaign.brand} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/automail/campaigns"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Campaigns</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-slate-900">{campaign.name}</h2>
            {campaign.brand === "hipro" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 className="w-3 h-3" />
                HiPRO
              </span>
            ) : campaign.brand === "hbs" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                <Hammer className="w-3 h-3" />
                Hind Build
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                <Globe2 className="w-3 h-3" />
                Universal
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
              {campaign.status}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Subject: <span className="font-semibold text-slate-700">{campaign.subject}</span>
          </p>
        </div>

        <button
          onClick={fetchReport}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-all self-start sm:self-auto"
          title="Refresh report"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recipients</span>
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{summary.total}</div>
          <p className="text-[11px] text-slate-500 mt-1">Queued for campaign</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{summary.sent}</div>
          <p className="text-[11px] text-slate-500 mt-1">Confirmed sent via SMTP</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Failed / Bounced</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-600">{summary.failed}</div>
          <p className="text-[11px] text-slate-500 mt-1">Delivery errors</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Queue</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{summary.queued}</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting dispatch slot</p>
        </div>
      </div>

      {/* Completion Progress Card */}
      {summary.total > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-800">Overall Transmission Completion</span>
            <span className="text-blue-600 font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Transmission Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transmission Log Details</h3>
            <p className="text-xs text-slate-500">Live recipient status, delivery times & server error codes</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Recipient Email</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4">Error / Response Note</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{log.contactEmail}</td>
                  <td className="py-3 px-4 text-slate-600">{log.contactName || "—"}</td>
                  <td className="py-3 px-4">
                    {log.status === "sent" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Delivered
                      </span>
                    ) : log.status === "failed" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        <XCircle className="w-3 h-3" />
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Queued
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-red-600 font-mono text-[11px] max-w-xs truncate">
                    {log.error || "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {log.sentAt ? new Date(log.sentAt).toLocaleTimeString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
