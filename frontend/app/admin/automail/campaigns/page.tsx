"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import {
  Rocket,
  Plus,
  Play,
  Square,
  BarChart2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Hammer,
  Globe2,
  Search,
  Filter,
} from "lucide-react";

export default function AutoMailCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Launch modal states
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [campaignToLaunch, setCampaignToLaunch] = useState<any>(null);
  const [contactsList, setContactsList] = useState<any[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [audienceMode, setAudienceMode] = useState<"brand_auto" | "custom_select">("brand_auto");

  // Toast alert
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`/api/automail/campaigns?brand=${selectedBrand}`);
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, [selectedBrand]);

  const openLaunchModal = async (campaign: any) => {
    setCampaignToLaunch(campaign);
    setShowLaunchModal(true);
    setLoadingContacts(true);
    try {
      // Fetch audience contacts filtered by brand or all
      const brandParam = campaign.brand && campaign.brand !== "all" ? `&brand=${campaign.brand}` : "";
      const res = await fetch(`/api/automail/contacts?limit=5000${brandParam}`);
      const data = await res.json();
      if (data.success) {
        setContactsList(data.contacts || []);
        setSelectedContactIds((data.contacts || []).map((c: any) => c.id));
      }
    } catch {
      setToast({ message: "Failed to load audience contacts", type: "error" });
    } finally {
      setLoadingContacts(false);
    }
  };

  const confirmLaunch = async () => {
    if (!campaignToLaunch) return;
    setSendingId(campaignToLaunch.id);
    setShowLaunchModal(false);

    try {
      const payload: any = {};
      if (audienceMode === "custom_select") {
        payload.contactIds = selectedContactIds;
      } else {
        payload.brandAudience = campaignToLaunch.brand;
      }

      const res = await fetch(`/api/automail/send/${campaignToLaunch.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setToast({ message: data.message || "Transmission started!", type: "success" });
        fetchCampaigns();
      } else {
        setToast({ message: data.error || "Failed to start transmission", type: "error" });
      }
    } catch {
      setToast({ message: "Network error starting campaign", type: "error" });
    } finally {
      setSendingId(null);
      setCampaignToLaunch(null);
    }
  };

  const stopTransmission = async () => {
    try {
      const res = await fetch("/api/automail/send/stop/current", { method: "POST" });
      const data = await res.json();
      setToast({ message: data.message || "Stop signal sent", type: "info" });
      fetchCampaigns();
    } catch {
      setToast({ message: "Failed to dispatch stop signal", type: "error" });
    }
  };

  const deleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${name}"?`)) return;
    try {
      const res = await fetch(`/api/automail/campaigns/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Campaign "${name}" deleted.`, type: "success" });
        fetchCampaigns();
      }
    } catch {
      setToast({ message: "Failed to delete campaign", type: "error" });
    }
  };

  const getProgress = (c: any) => {
    if (!c.totalRecipients || c.totalRecipients === 0) return 0;
    return Math.round(((c.sentCount + c.failedCount) / c.totalRecipients) * 100);
  };

  const filteredContacts = contactsList.filter((c) => {
    if (!contactSearch) return true;
    const q = contactSearch.toLowerCase();
    return c.email.toLowerCase().includes(q) || (c.name && c.name.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <AutoMailNav activeBrand={selectedBrand} onBrandChange={setSelectedBrand} />

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : toast.type === "info"
              ? "bg-blue-50 text-blue-800 border border-blue-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Email Campaigns</h2>
          <p className="text-xs text-slate-500">
            Monitor transmission progress and trigger scheduled email deliveries
          </p>
        </div>

        <Link
          href={selectedBrand !== "all" ? `/admin/automail/compose?brand=${selectedBrand}` : "/admin/automail/compose"}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </Link>
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-xs">Loading campaign transmissions...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Rocket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">No campaigns found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Compose your first email campaign for {selectedBrand === "hipro" ? "HiPRO" : selectedBrand === "hbs" ? "Hind Build" : "your audience"}.
            </p>
          </div>
          <Link
            href="/admin/automail/compose"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all"
          >
            Create First Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const isSendingThis = c.status === "sending";
            const isCompleted = c.status === "completed";
            const isPaused = c.status === "paused";

            return (
              <div
                key={c.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                {/* Title & Brand Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                      {c.brand === "hipro" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Building2 className="w-3 h-3" />
                          HiPRO
                        </span>
                      ) : c.brand === "hbs" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          <Hammer className="w-3 h-3" />
                          Hind Build
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          <Globe2 className="w-3 h-3" />
                          Universal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Subject: <span className="font-semibold text-slate-700">{c.subject}</span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isSendingThis ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        Transmitting
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : isPaused ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Paused
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar (If initiated) */}
                {c.totalRecipients > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {c.sentCount} Delivered
                      </span>
                      <span className="text-red-700 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {c.failedCount} Failed
                      </span>
                      <span className="text-slate-500 font-mono">
                        Progress: {getProgress(c)}% ({c.sentCount + c.failedCount} / {c.totalRecipients})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(c)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {/* Launch / Re-launch */}
                    {!isSendingThis && (
                      <button
                        type="button"
                        onClick={() => openLaunchModal(c)}
                        disabled={sendingId === c.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {sendingId === c.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span>{c.totalRecipients > 0 ? "Re-Launch" : "Launch Campaign"}</span>
                      </button>
                    )}

                    {/* Stop Transmission */}
                    {isSendingThis && (
                      <button
                        type="button"
                        onClick={stopTransmission}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Halt Sending</span>
                      </button>
                    )}

                    {/* Analytics Report Link */}
                    <Link
                      href={`/admin/automail/campaigns/${c.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Delivery Report</span>
                    </Link>

                    {/* Delete */}
                    {!isSendingThis && (
                      <button
                        type="button"
                        onClick={() => deleteCampaign(c.id, c.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Created: {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Launch Confirmation & Contact Selection Modal */}
      {showLaunchModal && campaignToLaunch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Launch Campaign Transmission</h3>
              <p className="text-xs text-slate-500 font-medium">
                {campaignToLaunch.name} • Target Brand: {campaignToLaunch.brand?.toUpperCase()}
              </p>
            </div>

            {/* Audience Targeting Options */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAudienceMode("brand_auto")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    audienceMode === "brand_auto"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-bold">Auto-Target Brand</p>
                  <p className="text-[10px] font-normal text-slate-500">
                    Send to all matching {campaignToLaunch.brand} contacts ({contactsList.length})
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceMode("custom_select")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    audienceMode === "custom_select"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-bold">Select Specific Contacts</p>
                  <p className="text-[10px] font-normal text-slate-500">
                    Hand-pick recipients from checklist ({selectedContactIds.length} chosen)
                  </p>
                </button>
              </div>

              {/* Checklist Mode */}
              {audienceMode === "custom_select" && (
                <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col max-h-56">
                  <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search recipient..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="w-full text-xs bg-transparent outline-none"
                    />
                  </div>
                  <div className="overflow-y-auto p-2 space-y-1">
                    {filteredContacts.map((contact) => {
                      const isChecked = selectedContactIds.includes(contact.id);
                      return (
                        <label
                          key={contact.id}
                          className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContactIds([...selectedContactIds, contact.id]);
                              } else {
                                setSelectedContactIds(selectedContactIds.filter((id) => id !== contact.id));
                              }
                            }}
                            className="rounded text-blue-600"
                          />
                          <div className="truncate">
                            <span className="font-semibold text-slate-800">{contact.email}</span>
                            {contact.name && <span className="text-slate-400 ml-1.5">({contact.name})</span>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLaunchModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLaunch}
                disabled={audienceMode === "custom_select" && selectedContactIds.length === 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                Start Safe Transmission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
