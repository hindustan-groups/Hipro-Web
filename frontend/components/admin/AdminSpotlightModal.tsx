"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Flame,
  ShieldCheck,
  Database,
  ArrowDownUp,
  KeyRound,
  Send,
  Users,
  Settings,
  FolderOpen,
  FileText,
  Inbox,
  HardHat,
  Star,
  ExternalLink,
  Sparkles,
  X,
  CornerDownLeft,
} from "lucide-react";

interface SpotlightItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: "Portals" | "Holding Tools" | "Inquiries & CMS" | "Quick Actions";
  icon: any;
  badge?: string;
}

const SPOTLIGHT_ITEMS: SpotlightItem[] = [
  // Portals
  { id: "p-hq", title: "Master Headquarters Cockpit", subtitle: "Executive overview & cross-brand portfolio", href: "/admin", category: "Portals", icon: Building2, badge: "Master HQ" },
  { id: "p-hipro", title: "HiPRO Corporate Web Studio", subtitle: "Civil turnkey engineering, PEB & projects CMS", href: "/admin/hipro", category: "Portals", icon: Building2, badge: "Web 1" },
  { id: "p-hbs", title: "Hind Building Solutions (HBS)", subtitle: "Waterproofing catalog & repair BOQ leads", href: "/admin/hbs", category: "Portals", icon: Flame, badge: "Web 2" },
  { id: "p-vendor", title: "Vendor Procurement Hub", subtitle: "Contractor KYC, Smart PVC cards & tenders", href: "/admin/empanelment", category: "Portals", icon: ShieldCheck, badge: "Web 3" },

  // Holding Tools
  { id: "t-backup", title: "Database Backup Vault", subtitle: "Automated snapshots & per-portal backups", href: "/admin/backup", category: "Holding Tools", icon: Database, badge: "Vault" },
  { id: "t-data", title: "Universal Data Import & Export", subtitle: "Bulk CSV & JSON data tools across portals", href: "/admin/data-tools", category: "Holding Tools", icon: ArrowDownUp, badge: "Data" },
  { id: "t-keys", title: "API Keys & Master Secrets", subtitle: "Cryptographic credentials & key rotation", href: "/admin/api-keys", category: "Holding Tools", icon: KeyRound, badge: "Secrets" },
  { id: "t-mail", title: "AutoMail Studio", subtitle: "Central transactional mailer & campaigns", href: "/admin/automail", category: "Holding Tools", icon: Send, badge: "Mail" },
  { id: "t-sec", title: "Security & 2FA Vault", subtitle: "RFC 6238 TOTP authenticator & password security", href: "/admin/security", category: "Holding Tools", icon: ShieldCheck, badge: "2FA" },
  { id: "t-users", title: "Staff & Roles (RBAC)", subtitle: "Admin users & permissions matrix", href: "/admin/users", category: "Holding Tools", icon: Users, badge: "RBAC" },
  { id: "t-settings", title: "Master HQ Settings", subtitle: "Holding legal identity & domain routing", href: "/admin/hq-settings", category: "Holding Tools", icon: Settings, badge: "Config" },

  // Inquiries & Funnel
  { id: "i-quotes", title: "Quotes Pipeline", subtitle: "HiPRO client turnkey cost estimates", href: "/admin/quotes", category: "Inquiries & CMS", icon: FileText, badge: "HiPRO" },
  { id: "i-contacts", title: "Direct Contact Inquiries", subtitle: "Website contact form messages", href: "/admin/contacts", category: "Inquiries & CMS", icon: Inbox, badge: "HiPRO" },
  { id: "i-hbs-leads", title: "Waterproofing Customer Leads", subtitle: "HBS crack injection & roof repair inquiries", href: "/admin/hbs/leads", category: "Inquiries & CMS", icon: Flame, badge: "HBS" },
  { id: "i-vendor-apps", title: "Contractor KYC Applications", subtitle: "Vendor onboarding & CPWD grading pipeline", href: "/admin/empanelment/applications", category: "Inquiries & CMS", icon: ShieldCheck, badge: "KYC" },
  { id: "i-projects", title: "Projects Portfolio", subtitle: "Completed and ongoing construction projects", href: "/admin/projects", category: "Inquiries & CMS", icon: FolderOpen, badge: "Civil" },
  { id: "i-services", title: "Civil Services Catalog", subtitle: "Turnkey industrial & commercial services", href: "/admin/services", category: "Inquiries & CMS", icon: HardHat, badge: "Civil" },
];

export default function AdminSpotlightModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SPOTLIGHT_ITEMS;
    return SPOTLIGHT_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          router.push(filteredItems[selectedIndex].href);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, page name, or portal (e.g. 'Backup', 'Quotes', 'HBS')..."
            className="w-full text-sm font-medium text-slate-900 placeholder-slate-400 outline-none bg-transparent"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200/80 rounded-md shadow-3xs shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">No matching admin pages found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching for &quot;Backup&quot;, &quot;HBS&quot;, &quot;Quotes&quot;, or &quot;Vendor&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {item.title}
                        </p>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-mono ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-white animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span><strong className="text-slate-600 font-normal">↑↓</strong> Navigate</span>
            <span><strong className="text-slate-600 font-normal">↵</strong> Jump</span>
            <span><strong className="text-slate-600 font-normal">esc</strong> Close</span>
          </div>
          <span className="text-[10px] text-slate-400">Hindustan Group Master HQ</span>
        </div>
      </div>
    </div>
  );
}
