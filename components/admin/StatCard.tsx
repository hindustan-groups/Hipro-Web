import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: LucideIcon;
  trend?: string;
}

export default function StatCard({ label, value, sub, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 shadow-sm shadow-slate-200/50 rounded-none p-5 hover:shadow-md hover:border-slate-300 transition-all relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-none bg-slate-50 border border-slate-200/60 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
        </div>
        {trend && (
          <span className="text-[11px] font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full shadow-sm">
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-black text-slate-900 mb-0.5 tracking-tight">{value}</div>
      <div className="text-[13px] font-semibold text-slate-500">{label}</div>
      {sub && <div className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{sub}</div>}
    </div>
  );
}
