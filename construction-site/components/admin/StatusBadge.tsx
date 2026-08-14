const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
  new:      { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  read:     { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  replied:  { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  pending:  { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  reviewed: { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500" },
  approved: { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  rejected: { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
  active:   { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  archived: { bg: "bg-slate-100",   text: "text-slate-700",   dot: "bg-slate-500" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none-full text-[11px] font-bold uppercase tracking-wide ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-none-full ${s.dot}`} />
      {status}
    </span>
  );
}
