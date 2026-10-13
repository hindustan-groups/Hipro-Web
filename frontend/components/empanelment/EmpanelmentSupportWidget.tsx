"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Phone,
  HelpCircle,
  X,
  Send,
  Search,
  CheckCircle2,
  FileQuestion,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function EmpanelmentSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "ticket" | "track">("menu");

  // Track Quick Search State
  const [quickTrackId, setQuickTrackId] = useState("");

  // Ticket Form State
  const [trackingId, setTrackingId] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Document Query");
  const [priority, setPriority] = useState("NORMAL");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId || !subject || !message) {
      setErrorMessage("Please fill all mandatory fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/empanelment/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingId.trim().toUpperCase(),
          subject,
          category,
          priority,
          message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTicketSuccess(data.ticketNo || "HP-TCK-NEW");
        setSubject("");
        setMessage("");
      } else {
        setErrorMessage(data.error || "Failed to submit ticket.");
      }
    } catch (err: any) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      {/* Expanded Modal Box */}
      {isOpen && (
        <div className="mb-4 w-90 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight leading-tight">
                  Vendor Helpdesk & Support
                </h4>
                <p className="text-[11px] text-amber-100">
                  Procurement Assistance (Bhilwara, RJ)
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveTab("menu");
                setTicketSuccess(null);
                setErrorMessage("");
              }}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50/50">
            {activeTab === "menu" && (
              <div className="space-y-2.5">
                {/* 1. Quick Track */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quick Status Check / स्थिति जांचें</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <input
                      type="text"
                      placeholder="Enter HP-EMP-XXXXXX"
                      value={quickTrackId}
                      onChange={(e) => setQuickTrackId(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase bg-slate-50"
                    />
                    <Link
                      href={quickTrackId ? `/empanelment/track?trackingId=${quickTrackId}` : "/empanelment/track"}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center"
                    >
                      Track
                    </Link>
                  </div>
                </div>

                {/* 2. WhatsApp Direct */}
                <a
                  href="https://wa.me/919829012345?text=Hello%20Hindustan%20Projects%20Procurement%20Desk,%20I%20need%20assistance%20regarding%20Vendor%20Empanelment."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                        Chat on WhatsApp
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Direct reply from Procurement team
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* 3. Call Helpline */}
                <a
                  href="tel:+919829012345"
                  className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Call Procurement Helpline
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Mon-Sat &bull; 9:30 AM to 6:30 PM
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 font-mono">+91 98290 12345</span>
                </a>

                {/* 4. Raise Support Ticket */}
                <button
                  onClick={() => setActiveTab("ticket")}
                  className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 rounded-2xl transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <FileQuestion className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                        Raise Support Ticket
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Submit queries regarding KYC, Bids or Tenders
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}

            {/* Ticket Form View */}
            {activeTab === "ticket" && (
              <div>
                {ticketSuccess ? (
                  <div className="text-center py-6 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h5 className="font-bold text-slate-900 text-sm">
                      Ticket Submitted Successfully!
                    </h5>
                    <p className="text-xs text-slate-600 font-mono bg-slate-100 p-2 rounded-xl border border-slate-200">
                      Ticket No: <span className="font-bold text-amber-600">{ticketSuccess}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Our procurement executive will inspect your query and respond via email within 24 business hours.
                    </p>
                    <button
                      onClick={() => {
                        setTicketSuccess(null);
                        setActiveTab("menu");
                      }}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                    >
                      Back to Menu
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleTicketSubmit} className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800">Raise Support Ticket</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("menu")}
                        className="text-[11px] text-amber-600 font-bold hover:underline"
                      >
                        &larr; Back
                      </button>
                    </div>

                    {errorMessage && (
                      <div className="p-2 rounded-xl bg-red-50 text-red-700 text-[11px] border border-red-200">
                        {errorMessage}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Vendor Tracking ID *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HP-EMP-849201"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                        required
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="Document Query">Document Query</option>
                          <option value="GST / PAN Issue">GST / PAN Issue</option>
                          <option value="Tender Bidding">Tender Bidding</option>
                          <option value="Gate Pass">Gate Pass Issue</option>
                          <option value="Payment / Billing">Payment / Billing</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Priority
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="NORMAL">Normal</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent (Site Halt)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Subject *
                      </label>
                      <input
                        type="text"
                        placeholder="Brief summary of issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Message / Query Details *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe your issue or clarification required..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting Ticket...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Ticket</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 group font-bold text-xs"
        aria-label="Open Empanelment Support"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4" />
          <span>Vendor Helpdesk</span>
        </div>
      </button>
    </div>
  );
}
