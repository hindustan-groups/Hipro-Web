"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp, AlertTriangle, Globe } from "lucide-react";

export default function GovBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full z-[100] relative">
      {/* Top strip — like USA gov banner */}
      <div className="bg-[#1a1a2e] text-white text-[12px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">

          {/* Left — flag + label */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {/* Mini flag icon */}
            <div className="flex items-center gap-0.5">
              <span className="text-[16px]">🏛️</span>
            </div>
            <span className="text-gray-300">
              An official website of the{" "}
              <span className="font-semibold text-white">Government Construction Registry</span>
            </span>
            <span className="hidden sm:inline text-gray-400 ml-1 flex items-center gap-1 underline decoration-dotted underline-offset-2">
              Here&apos;s how you know
              {expanded ? (
                <ChevronUp className="w-3 h-3 ml-0.5 inline" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5 inline" />
              )}
            </span>
          </button>

          {/* Right — skip */}
          <button
            onClick={() => setDismissed(true)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[11px] font-medium"
            aria-label="Dismiss banner"
          >
            Skip
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded info panel */}
      {expanded && (
        <div className="bg-[#12122a] border-t border-white/10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid sm:grid-cols-2 gap-8">
            {/* Official site */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-900/60 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-[13px] mb-1">Official Government Website</p>
                <p className="text-[12px] text-gray-400 leading-relaxed font-light">
                  Government websites always use a{" "}
                  <span className="text-white font-medium">.gov</span> or{" "}
                  <span className="text-white font-medium">.gov.in</span> domain.
                  Before sharing sensitive information, verify you're on an official site.
                </p>
              </div>
            </div>

            {/* Secure site */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-900/60 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-[13px] mb-1">Secure & Encrypted Connection</p>
                <p className="text-[12px] text-gray-400 leading-relaxed font-light">
                  The <span className="text-white font-medium">https://</span> in the URL ensures
                  your connection is encrypted and secure. Only share sensitive info on secure sites.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcement bar — below the gov strip */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:inline bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shrink-0">
              Notice
            </span>
            <p className="text-[12px] sm:text-[13px] font-medium truncate">
              Hindustan Projects is a registered contractor under the{" "}
              <span className="font-bold underline decoration-white/60 underline-offset-2 cursor-pointer hover:decoration-white transition-all">
                National Infrastructure Development Program 2025
              </span>
              . License No: <span className="font-bold">NIDP-BLD-2025-04821</span>
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/70 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-[12px] font-medium"
          >
            Skip
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
