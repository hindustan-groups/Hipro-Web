const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
  new:         { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  read:        { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
  replied:     { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  contacted:   { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  in_progress: { bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500" },
  converted:   { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-600" },
  closed:      { bg: "bg-slate-200",  text: "text-slate-700",  dot: "bg-slate-500" },
  pending:     { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  reviewed:    { bg: "bg-cyan-100",   text: "text-cyan-700",   dot: "bg-cyan-500" },
  approved:    { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  rejected:    { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
  active:      { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  archived:    { bg: "bg-slate-100",  text: "text-slate-600",  dot: "bg-slate-400" },
  subscribed:  { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  unsubscribed:{ bg: "bg-slate-100",  text: "text-slate-500",  dot: "bg-slate-400" },
};

export default function StatusBadge({ status }: { status: string }) {
  const norm = (status || "new").toLowerCase().replace(/[\s-]+/g, "_");
  const s = statusMap[norm] ?? { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" };
  const label = (status || "new").replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}
