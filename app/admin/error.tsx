"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-none bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-gray-400 text-sm mb-2 max-w-md">
        An error occurred in the admin panel. The user-facing site is unaffected.
      </p>
      {error?.message && (
        <code className="text-xs bg-gray-900 border border-gray-800 text-red-400 px-4 py-2 rounded-none mb-6 max-w-md block truncate">
          {error.message}
        </code>
      )}
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-none text-sm transition-colors"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );
}
