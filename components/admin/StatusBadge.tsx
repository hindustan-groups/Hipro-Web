const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
  new:      { bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-400" },
  read:     { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400" },
  replied:  { bg: "bg-green-500/10",  text: "text-green-400",  dot: "bg-green-400" },
  pending:  { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400" },
  reviewed: { bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-400" },
  approved: { bg: "bg-green-500/10",  text: "text-green-400",  dot: "bg-green-400" },
  rejected: { bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-400" },
  active:   { bg: "bg-green-500/10",  text: "text-green-400",  dot: "bg-green-400" },
  archived: { bg: "bg-gray-500/10",   text: "text-gray-400",   dot: "bg-gray-400" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? { bg: "bg-gray-500/10", text: "text-gray-400", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
