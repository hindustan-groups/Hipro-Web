export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-gray-800 rounded-none" />
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-none" />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-none p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded-none" />
        ))}
      </div>
    </div>
  );
}
