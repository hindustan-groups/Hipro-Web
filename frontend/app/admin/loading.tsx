export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200/80 rounded-lg" />
          <div className="h-4 w-72 bg-slate-200/50 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-slate-200/80 rounded-xl" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-white/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs"
          >
            <div className="h-4 w-20 bg-slate-200/70 rounded-md" />
            <div className="h-8 w-16 bg-slate-200/90 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table / List card skeleton */}
      <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="h-5 w-36 bg-slate-200/80 rounded-md" />
          <div className="h-8 w-48 bg-slate-200/50 rounded-xl" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-100/60 rounded-xl border border-slate-200/40" />
        ))}
      </div>
    </div>
  );
}
