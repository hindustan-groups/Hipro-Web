import Link from "next/link";
import { Home } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-8xl font-black text-gray-800 mb-4 font-mono">404</div>
      <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
      <p className="text-gray-400 text-sm mb-8">This admin page doesn&apos;t exist.</p>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-none text-sm transition-colors"
      >
        <Home className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );
}
