"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AutoMailNav from "@/components/admin/automail/AutoMailNav";
import {
  Inbox,
  RefreshCw,
  Search,
  Send,
  Mail,
  MailOpen,
  Paperclip,
  UserPlus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Reply,
  Sparkles,
} from "lucide-react";

interface InboxMessageSummary {
  uid: number;
  mailboxId: string;
  mailboxEmail: string;
  mailboxName: string;
  brand: string;
  hostingerResourceId: string;
  folder: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  toEmails: string[];
  ccEmails: string[];
  date: string;
  unseen: boolean;
  messageId: string | null;
  inReplyTo: string | null;
  hasAttachments: boolean;
  attachmentCount: number;
}

interface InboxMessageDetail extends InboxMessageSummary {
  text: string;
  html: string;
  attachments: Array<{
    id: string;
    filename: string | null;
    contentType: string;
    sizeBytes: number;
    inline: boolean;
  }>;
}

interface MailboxOption {
  id: string;
  name: string;
  email: string;
  aliases?: string[];
  brand: string;
}

export default function AutoMailInboxPage() {
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [mailboxes, setMailboxes] = useState<MailboxOption[]>([]);
  const [messages, setMessages] = useState<InboxMessageSummary[]>([]);
  const [configuredForInbox, setConfiguredForInbox] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [folder, setFolder] = useState<"INBOX" | "INBOX.Sent">("INBOX");
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");

  // Selected Message Detail
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<InboxMessageDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Reply Composer
  const [replyText, setReplyText] = useState("");
  const [replyFromEmail, setReplyFromEmail] = useState("");
  const [replyMailboxId, setReplyMailboxId] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // AI Draft Assistant
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Contact Sync
  const [syncingContacts, setSyncingContacts] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const loadMailboxes = async () => {
    try {
      const res = await fetch("/api/automail/mailboxes");
      const data = await res.json();
      if (data.success && Array.isArray(data.mailboxes)) {
        setMailboxes(data.mailboxes);
      }
    } catch {
      // Non-blocking
    }
  };

  const loadInbox = async (autoImport = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        folder,
        unreadOnly: String(unreadOnly),
        ...(recipientFilter !== "all" ? { recipientFilter } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(autoImport ? { autoImport: "true" } : {}),
      });
      const res = await fetch(`/api/automail/inbox?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setConfiguredForInbox(Boolean(data.configuredForInbox));
        setWarnings(data.warnings || []);
        if (data.importedSummary) {
          setToast({
            message: `Imported ${data.importedSummary.importedCount} new sender contact(s) into Audience & Leads!`,
            type: "success",
          });
        }
      } else {
        setToast({ message: data.error || "Failed to load inbox", type: "error" });
      }
    } catch {
      setToast({ message: "Network error loading inbox", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMailboxes();
  }, []);

  useEffect(() => {
    loadInbox(false);
  }, [folder, recipientFilter, unreadOnly]);

  const senderAndAliasOptions = useMemo(() => {
    const list: Array<{ email: string; label: string; mailboxId: string }> = [];
    for (const mb of mailboxes) {
      list.push({ email: mb.email.toLowerCase(), label: `${mb.email} (Primary)`, mailboxId: mb.id });
      for (const alias of mb.aliases || []) {
        list.push({ email: alias.toLowerCase(), label: `${alias} (Alias of ${mb.email})`, mailboxId: mb.id });
      }
    }
    return list;
  }, [mailboxes]);

  const visibleMessages = useMemo(() => {
    return messages.filter((m) => {
      if (selectedBrand !== "all" && m.brand !== selectedBrand) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          m.subject.toLowerCase().includes(q) ||
          m.fromName.toLowerCase().includes(q) ||
          m.fromEmail.toLowerCase().includes(q) ||
          m.toEmails.some((t) => t.includes(q))
        );
      }
      return true;
    });
  }, [messages, selectedBrand, search]);

  const openMessage = async (msg: InboxMessageSummary) => {
    const key = `${msg.mailboxId}:${msg.uid}`;
    setSelectedKey(key);
    setLoadingDetail(true);
    setReplyText("");

    // Default reply address: if message was sent to one of our aliases, reply from that exact alias!
    const allOwn = new Set(senderAndAliasOptions.map((o) => o.email));
    const matchedRecipient = msg.toEmails.find((t) => allOwn.has(t.toLowerCase()));
    setReplyFromEmail(matchedRecipient || msg.mailboxEmail);
    setReplyMailboxId(msg.mailboxId);

    try {
      const res = await fetch(
        `/api/automail/inbox/${encodeURIComponent(msg.mailboxId)}/${msg.uid}?folder=${encodeURIComponent(msg.folder)}`
      );
      const data = await res.json();
      if (data.success && data.message) {
        setDetail(data.message);
        setMessages((prev) =>
          prev.map((m) => (m.mailboxId === msg.mailboxId && m.uid === msg.uid ? { ...m, unseen: false } : m))
        );
      } else {
        setToast({ message: data.error || "Failed to load email body", type: "error" });
      }
    } catch {
      setToast({ message: "Network error loading email details", type: "error" });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleUnread = async (msg: InboxMessageSummary, nextSeen: boolean) => {
    try {
      await fetch(`/api/automail/inbox/${encodeURIComponent(msg.mailboxId)}/${msg.uid}/flags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seen: nextSeen, folder: msg.folder }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.mailboxId === msg.mailboxId && m.uid === msg.uid ? { ...m, unseen: !nextSeen } : m))
      );
      if (detail && detail.mailboxId === msg.mailboxId && detail.uid === msg.uid) {
        setDetail({ ...detail, unseen: !nextSeen });
      }
    } catch {
      setToast({ message: "Failed to update read status", type: "error" });
    }
  };

  const handleDraftReplyWithAi = async (customPrompt?: string) => {
    if (!detail) return;
    const promptToUse = (customPrompt ?? aiPrompt).trim();
    if (!promptToUse) {
      setToast({ message: "Write a short instruction for AI (e.g. 'Schedule site visit tomorrow at 11am').", type: "info" });
      return;
    }
    setAiGenerating(true);
    try {
      const res = await fetch("/api/automail/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToUse,
          mode: "reply",
          brand: detail.brand,
          incomingSubject: detail.subject,
          incomingBody: detail.text || "",
          incomingFromName: detail.fromName,
          recipientName: detail.fromName,
        }),
      });
      const data = await res.json();
      if (data.success && data.bodyText) {
        setReplyText(data.bodyText);
        if (!customPrompt) setAiPrompt("");
        setToast({
          message: `AI drafted your reply (${data.provider === "gemini" ? "Gemini AI" : "Smart Corporate AI"})!`,
          type: "success",
        });
      } else {
        setToast({ message: data.error || "Failed to generate AI reply", type: "error" });
      }
    } catch {
      setToast({ message: "Network error generating AI reply", type: "error" });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/automail/inbox/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: detail.fromEmail,
          name: detail.fromName,
          subject: detail.subject,
          messageText: replyText.trim(),
          mailboxId: replyMailboxId || detail.mailboxId,
          senderEmail: replyFromEmail || detail.mailboxEmail,
          inReplyTo: detail.messageId,
          brand: detail.brand,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: data.message || "Reply sent cleanly!", type: "success" });
        setReplyText("");
      } else {
        setToast({ message: data.error || "Failed to send reply", type: "error" });
      }
    } catch {
      setToast({ message: "Network error sending reply", type: "error" });
    } finally {
      setSendingReply(false);
    }
  };

  const handleImportSenders = async (singleContact?: { email: string; name?: string; brand?: string }) => {
    const payloadContacts = singleContact
      ? [singleContact]
      : visibleMessages.map((m) => ({
          email: m.fromEmail,
          name: m.fromName,
          brand: m.brand,
        }));

    if (payloadContacts.length === 0) {
      setToast({ message: "No incoming senders to import right now.", type: "info" });
      return;
    }

    setSyncingContacts(true);
    try {
      const res = await fetch("/api/automail/inbox/import-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: payloadContacts }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: data.message || `Synced ${data.importedCount} contact(s)!`, type: "success" });
      } else {
        setToast({ message: data.error || "Failed to import contacts", type: "error" });
      }
    } catch {
      setToast({ message: "Network error importing contacts", type: "error" });
    } finally {
      setSyncingContacts(false);
    }
  };

  return (
    <div className="space-y-6">
      <AutoMailNav activeBrand={selectedBrand} onBrandChange={setSelectedBrand} />

      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : toast.type === "info"
              ? "bg-blue-50 text-blue-800 border border-blue-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {!configuredForInbox && !loading && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Hostinger Mail API Token Required for Live Inbox</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Incoming emails read aur reply karne ke liye Tab 3 me Hostinger Mail API Token save karein (HTTPS Port 443).
              </p>
            </div>
          </div>
          <Link
            href="/admin/automail/settings"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs whitespace-nowrap"
          >
            Configure API Token →
          </Link>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFolder("INBOX")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                folder === "INBOX" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Inbox
            </button>
            <button
              type="button"
              onClick={() => setFolder("INBOX.Sent")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                folder === "INBOX.Sent" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sent Mail
            </button>
          </div>

          <select
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:border-blue-500"
            title="Filter by Receiving Mailbox or Alias"
          >
            <option value="all">All Mailboxes &amp; Aliases</option>
            {senderAndAliasOptions.map((opt) => (
              <option key={opt.email} value={opt.email}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setUnreadOnly((u) => !u)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              unreadOnly
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Unread Only
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sender, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white font-medium"
            />
          </div>

          <button
            type="button"
            onClick={() => handleImportSenders()}
            disabled={syncingContacts || visibleMessages.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            title="Save all visible incoming senders into Audience & Leads"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{syncingContacts ? "Syncing..." : "Import Senders to Contacts"}</span>
          </button>

          <button
            type="button"
            onClick={() => loadInbox(false)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Inbox</span>
          </button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
          {warnings.map((w, i) => (
            <p key={i}>• {w}</p>
          ))}
        </div>
      )}

      {/* 2-Pane Unified Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
        {/* Left Pane: Message List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-blue-600" />
              <span>Messages ({visibleMessages.length})</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {visibleMessages.filter((m) => m.unseen).length} unread
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[620px]">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-xs">Fetching messages from Hostinger...</p>
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="py-16 px-6 text-center text-slate-400 space-y-2">
                <Mail className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No messages in this view</p>
                <p className="text-[11px] text-slate-400">
                  Koi naya email aane par ya filter change karne par yahan show hoga.
                </p>
              </div>
            ) : (
              visibleMessages.map((msg) => {
                const key = `${msg.mailboxId}:${msg.uid}`;
                const isSelected = selectedKey === key;
                const receivedAtAddress = msg.toEmails[0] || msg.mailboxEmail;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => openMessage(msg)}
                    className={`w-full text-left p-4 transition-all hover:bg-slate-50 space-y-1.5 ${
                      isSelected ? "bg-blue-50/70 border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {msg.unseen && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                        <span className={`text-xs truncate ${msg.unseen ? "font-black text-slate-900" : "font-semibold text-slate-700"}`}>
                          {msg.fromName || msg.fromEmail}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(msg.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </div>

                    <p className={`text-xs truncate ${msg.unseen ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                      {msg.subject}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[200px]">
                        To: {receivedAtAddress}
                      </span>
                      {msg.hasAttachments && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                          <Paperclip className="w-3 h-3" /> {msg.attachmentCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Reader + Direct Reply */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          {loadingDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
              <p className="text-xs">Loading message content...</p>
            </div>
          ) : !detail ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center text-slate-400 space-y-2">
              <Sparkles className="w-9 h-9 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Select an Email to Read &amp; Reply</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Left list me se kisi bhi email par click karein — aap yahan se direct reply aur contact save kar sakte hain.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 space-y-3 bg-slate-50/40">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-base font-black text-slate-900 leading-snug">{detail.subject}</h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleImportSenders({ email: detail.fromEmail, name: detail.fromName, brand: detail.brand })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Save Contact</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleUnread(detail, detail.unseen)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold"
                    >
                      <MailOpen className="w-3 h-3" />
                      <span>{detail.unseen ? "Mark Read" : "Mark Unread"}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong className="text-slate-900">From:</strong> {detail.fromName} &lt;
                    <span className="font-mono text-blue-700">{detail.fromEmail}</span>&gt;
                  </p>
                  <p>
                    <strong className="text-slate-900">To:</strong>{" "}
                    <span className="font-mono">{detail.toEmails.join(", ") || detail.mailboxEmail}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {new Date(detail.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>

                {detail.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {detail.attachments.map((att) => (
                      <span
                        key={att.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700"
                      >
                        <Paperclip className="w-3 h-3" />
                        {att.filename || "attachment"} ({Math.round(att.sizeBytes / 1024)} KB)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex-1 overflow-y-auto max-h-[340px] bg-white">
                {detail.html ? (
                  <div
                    className="prose prose-sm max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: detail.html }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed">
                    {detail.text || "(Empty message body)"}
                  </pre>
                )}
              </div>

              {/* Direct Threaded Reply Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Reply className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reply to {detail.fromEmail}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Reply From:</span>
                    <select
                      value={replyFromEmail}
                      onChange={(e) => {
                        const chosen = e.target.value;
                        setReplyFromEmail(chosen);
                        const match = senderAndAliasOptions.find((o) => o.email === chosen.toLowerCase());
                        if (match) setReplyMailboxId(match.mailboxId);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-mono font-bold text-slate-800 outline-none"
                    >
                      {senderAndAliasOptions.map((opt) => (
                        <option key={opt.email} value={opt.email}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Write with AI Bar */}
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Write Reply with AI
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: "Acknowledge & Call", prompt: "Acknowledge receipt and schedule a quick discovery call" },
                        { label: "Send Quote Follow-up", prompt: "Share quotation & BOQ follow-up with transparent rates" },
                        { label: "Site Inspection", prompt: "Confirm engineer site inspection visit and request location" },
                        { label: "Vendor / Tender", prompt: "Share vendor empanelment and tender next steps" },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          disabled={aiGenerating}
                          onClick={() => handleDraftReplyWithAi(chip.prompt)}
                          className="px-2 py-0.5 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-md text-[10px] font-bold transition-colors disabled:opacity-50"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleDraftReplyWithAi();
                        }
                      }}
                      placeholder="Type instruction in English/Hinglish (e.g. 'Kal 11 baje site visit confirm karo')..."
                      className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      disabled={aiGenerating || !aiPrompt.trim()}
                      onClick={() => handleDraftReplyWithAi()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shrink-0 disabled:opacity-50"
                    >
                      {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>Draft AI</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your official reply here... (automatically wrapped with corporate branding & thread header)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 resize-y"
                />

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Threaded reply (`Re:`) + logged to Sent Audit
                  </span>
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{sendingReply ? "Sending Reply..." : "Send Reply"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
