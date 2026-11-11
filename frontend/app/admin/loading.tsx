export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-label="Loading admin content"
      className="space-y-6 p-1 max-w-7xl mx-auto motion-reduce:animate-none animate-pulse"
    >
      {/* Neutral page header skeleton */}
      <div className="bg-white border border-slate-200/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-2">
          <div className="h-3.5 w-36 bg-slate-200/70 rounded-none" />
          <div className="h-6 w-56 bg-slate-200/90 rounded-none" />
          <div className="h-3 w-80 max-w-full bg-slate-200/50 rounded-none" />
        </div>
        <div className="h-9 w-28 bg-slate-200/60 rounded-none shrink-0" />
      </div>

      {/* Neutral content container skeleton */}
      <div className="bg-white border border-slate-200/80 p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="h-4 w-44 bg-slate-200/70 rounded-none" />
          <div className="h-8 w-36 bg-slate-200/50 rounded-none" />
        </div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-100/80 rounded-none border border-slate-100" />
          <div className="h-12 bg-slate-50/90 rounded-none border border-slate-100" />
          <div className="h-12 bg-slate-100/80 rounded-none border border-slate-100" />
          <div className="h-12 bg-slate-50/90 rounded-none border border-slate-100" />
        </div>
      </div>
      <span className="sr-only">Loading page content...</span>
    </div>
  );
}
