import { FoldersApi, MessagesApi } from "hostinger-mail-api-sdk";
import { prisma } from "../../lib/db";
import {
  getAutomailSettingsAsync,
  getDefaultMailboxes,
  CorporateMailbox,
} from "./settingsService";
import {
  getHostingerSdk,
  getHostingerMailboxes,
  extractCleanContactName,
} from "./emailSender";

export interface InboxMessageSummary {
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

export interface InboxMessageDetail extends InboxMessageSummary {
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

async function resolveMailboxResource(
  mb: CorporateMailbox,
  globalToken: string
): Promise<{ token: string; resourceId: string } | null> {
  const token = (mb.hostingerApiToken || globalToken || "").trim();
  if (!token) return null;

  if (mb.hostingerMailboxId && mb.hostingerMailboxId.trim()) {
    return { token, resourceId: mb.hostingerMailboxId.trim() };
  }

  try {
    const discovered = await getHostingerMailboxes(token);
    const cleanEmail = mb.email.toLowerCase().trim();
    const matched = discovered.find(
      (d) => d.address?.toLowerCase().trim() === cleanEmail
    );
    if (matched?.resourceId) {
      return { token, resourceId: matched.resourceId };
    }
  } catch {
    // Non-blocking per-mailbox fallback
  }
  return null;
}

function normalizeEmailAddress(addr?: { name?: string; address?: string } | null): {
  name: string;
  email: string;
} {
  const email = (addr?.address || "").trim().toLowerCase();
  const rawName = (addr?.name || "").trim();
  const { fullName } = extractCleanContactName(rawName, email || "unknown@example.com");
  return { name: rawName || fullName, email };
}

/**
 * Fetch unified inbox messages across all active Hostinger-API-enabled mailboxes.
 */
export async function fetchUnifiedInbox(params: {
  mailboxId?: string;
  recipientFilter?: string;
  folder?: string;
  unreadOnly?: boolean;
  search?: string;
  perMailbox?: number;
}): Promise<{
  messages: InboxMessageSummary[];
  configuredForInbox: boolean;
  warnings: string[];
}> {
  const settings = await getAutomailSettingsAsync();
  const mailboxes: CorporateMailbox[] = (
    settings.mailboxes && settings.mailboxes.length > 0
      ? settings.mailboxes
      : getDefaultMailboxes()
  ).filter((m) => m.status === "active");

  const globalToken = (
    settings.hostingerApiToken ||
    process.env.HOSTINGER_MAIL_API_TOKEN ||
    ""
  ).trim();

  const targetMailboxes =
    params.mailboxId && params.mailboxId !== "all"
      ? mailboxes.filter((m) => m.id === params.mailboxId)
      : mailboxes;

  if (process.env.NODE_ENV !== "production") {
    const hasAnyToken = Boolean(
      globalToken || targetMailboxes.some((m) => Boolean(m.hostingerApiToken?.trim()))
    );
    return {
      messages: [],
      configuredForInbox: hasAnyToken,
      warnings: hasAnyToken
        ? ["Development mode: live Hostinger Inbox fetch is disabled outside production."]
        : ["Hostinger Mail API Token not configured yet."],
    };
  }

  const folder = params.folder?.trim() || "INBOX";
  const perMailbox = Math.min(50, Math.max(5, params.perMailbox || 25));
  const warnings: string[] = [];
  let configuredCount = 0;

  const perBoxResults = await Promise.all(
    targetMailboxes.map(async (mb): Promise<InboxMessageSummary[]> => {
      const resolved = await resolveMailboxResource(mb, globalToken);
      if (!resolved) {
        return [];
      }
      configuredCount++;

      try {
        const sdk = await getHostingerSdk(resolved.token);
        const messagesApi = new MessagesApi(sdk.config);
        const resp = await messagesApi.listMessages(
          resolved.resourceId,
          folder,
          1,
          perMailbox,
          "-uid"
        );
        const rows: any[] = (resp.data as any)?.data || [];

        return rows.map((msg): InboxMessageSummary => {
          const from = normalizeEmailAddress(msg.from);
          const toList: string[] = Array.isArray(msg.to)
            ? msg.to.map((t: any) => (t?.address || "").trim().toLowerCase()).filter(Boolean)
            : [];
          const ccList: string[] = Array.isArray(msg.cc)
            ? msg.cc.map((t: any) => (t?.address || "").trim().toLowerCase()).filter(Boolean)
            : [];
          const attachments: any[] = Array.isArray(msg.attachments) ? msg.attachments : [];

          return {
            uid: Number(msg.uid),
            mailboxId: mb.id,
            mailboxEmail: mb.email,
            mailboxName: mb.name,
            brand: mb.brand || "hipro",
            hostingerResourceId: resolved.resourceId,
            folder,
            subject: msg.subject || "(No Subject)",
            fromName: from.name,
            fromEmail: from.email,
            toEmails: toList,
            ccEmails: ccList,
            date: msg.date || new Date().toISOString(),
            unseen: Boolean(msg.unseen),
            messageId: msg.messageId || null,
            inReplyTo: msg.inReplyTo || null,
            hasAttachments: attachments.length > 0,
            attachmentCount: attachments.length,
          };
        });
      } catch (err: any) {
        warnings.push(`${mb.email}: ${err?.response?.data?.message || err?.message || "Failed to fetch inbox"}`);
        return [];
      }
    })
  );

  let combined = perBoxResults.flat();

  // Filter by receiving mailbox or alias
  if (params.recipientFilter && params.recipientFilter !== "all") {
    const cleanFilter = params.recipientFilter.trim().toLowerCase();
    combined = combined.filter(
      (m) =>
        m.toEmails.includes(cleanFilter) ||
        m.ccEmails.includes(cleanFilter) ||
        m.mailboxEmail.toLowerCase() === cleanFilter
    );
  }

  if (params.unreadOnly) {
    combined = combined.filter((m) => m.unseen);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    combined = combined.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.fromName.toLowerCase().includes(q) ||
        m.fromEmail.toLowerCase().includes(q) ||
        m.toEmails.some((t) => t.includes(q))
    );
  }

  combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    messages: combined,
    configuredForInbox: configuredCount > 0 || Boolean(globalToken),
    warnings,
  };
}

/**
 * Fetch full message body & metadata for a specific email UID in a mailbox.
 */
export async function fetchInboxMessageDetail(params: {
  mailboxId: string;
  uid: number;
  folder?: string;
}): Promise<InboxMessageDetail> {
  const settings = await getAutomailSettingsAsync();
  const mailboxes: CorporateMailbox[] =
    settings.mailboxes && settings.mailboxes.length > 0
      ? settings.mailboxes
      : getDefaultMailboxes();
  const mb = mailboxes.find((m) => m.id === params.mailboxId);
  if (!mb) {
    throw new Error("Mailbox not found.");
  }

  const globalToken = (
    settings.hostingerApiToken ||
    process.env.HOSTINGER_MAIL_API_TOKEN ||
    ""
  ).trim();
  const resolved = await resolveMailboxResource(mb, globalToken);
  if (!resolved) {
    throw new Error("Hostinger Mail API Token is required to read message contents.");
  }

  const folder = params.folder?.trim() || "INBOX";
  const sdk = await getHostingerSdk(resolved.token);
  const messagesApi = new MessagesApi(sdk.config);

  const [metaResp, textResp] = await Promise.all([
    messagesApi.getMessage(resolved.resourceId, folder, params.uid),
    messagesApi.getMessageText(resolved.resourceId, folder, params.uid),
  ]);

  const msg: any = (metaResp.data as any)?.data || {};
  const textData: any = (textResp.data as any)?.data || {};
  const from = normalizeEmailAddress(msg.from);
  const toEmails: string[] = Array.isArray(msg.to)
    ? msg.to.map((t: any) => (t?.address || "").trim().toLowerCase()).filter(Boolean)
    : [];
  const ccEmails: string[] = Array.isArray(msg.cc)
    ? msg.cc.map((t: any) => (t?.address || "").trim().toLowerCase()).filter(Boolean)
    : [];

  return {
    uid: Number(msg.uid || params.uid),
    mailboxId: mb.id,
    mailboxEmail: mb.email,
    mailboxName: mb.name,
    brand: mb.brand || "hipro",
    hostingerResourceId: resolved.resourceId,
    folder,
    subject: msg.subject || "(No Subject)",
    fromName: from.name,
    fromEmail: from.email,
    toEmails,
    ccEmails,
    date: msg.date || new Date().toISOString(),
    unseen: false, // getMessageText marks message as Seen on Hostinger
    messageId: msg.messageId || null,
    inReplyTo: msg.inReplyTo || null,
    hasAttachments: Array.isArray(msg.attachments) && msg.attachments.length > 0,
    attachmentCount: Array.isArray(msg.attachments) ? msg.attachments.length : 0,
    text: textData.text || "",
    html: textData.html || "",
    attachments: Array.isArray(msg.attachments)
      ? msg.attachments.map((att: any) => ({
          id: att.id,
          filename: att.filename || null,
          contentType: att.contentType || "application/octet-stream",
          sizeBytes: Number(att.sizeBytes || 0),
          inline: Boolean(att.inline),
        }))
      : [],
  };
}

/**
 * Mark a message as Seen or Unseen in Hostinger Mail API.
 */
export async function updateInboxMessageSeenFlag(params: {
  mailboxId: string;
  uid: number;
  folder?: string;
  seen: boolean;
}) {
  const settings = await getAutomailSettingsAsync();
  const mailboxes: CorporateMailbox[] =
    settings.mailboxes && settings.mailboxes.length > 0
      ? settings.mailboxes
      : getDefaultMailboxes();
  const mb = mailboxes.find((m) => m.id === params.mailboxId);
  if (!mb) throw new Error("Mailbox not found.");

  const globalToken = (
    settings.hostingerApiToken ||
    process.env.HOSTINGER_MAIL_API_TOKEN ||
    ""
  ).trim();
  const resolved = await resolveMailboxResource(mb, globalToken);
  if (!resolved) throw new Error("Hostinger Mail API Token not configured.");

  const sdk = await getHostingerSdk(resolved.token);
  const messagesApi = new MessagesApi(sdk.config);
  const folder = params.folder?.trim() || "INBOX";

  await messagesApi.patchMessage(resolved.resourceId, folder, params.uid, {
    addFlags: params.seen ? ["\\Seen"] : [],
    removeFlags: params.seen ? [] : ["\\Seen"],
  });
}

/**
 * List available folders for a mailbox (for diagnostics / folder tabs).
 */
export async function listMailboxFolders(mailboxId: string): Promise<string[]> {
  const settings = await getAutomailSettingsAsync();
  const mb = (settings.mailboxes || getDefaultMailboxes()).find((m) => m.id === mailboxId);
  if (!mb) return ["INBOX", "INBOX.Sent"];

  const globalToken = (
    settings.hostingerApiToken ||
    process.env.HOSTINGER_MAIL_API_TOKEN ||
    ""
  ).trim();
  const resolved = await resolveMailboxResource(mb, globalToken);
  if (!resolved) return ["INBOX", "INBOX.Sent"];

  const sdk = await getHostingerSdk(resolved.token);
  const foldersApi = new FoldersApi(sdk.config);
  const resp = await foldersApi.listFolders(resolved.resourceId, 1, 50);
  const rows: any[] = (resp.data as any)?.data || [];
  return rows.map((f) => f.path || f.name).filter(Boolean);
}

/**
 * Upsert external email senders from inbox messages into AutomailContact directory.
 * Skips our own corporate mailbox & alias addresses.
 */
export async function importContactsFromInboxMessages(
  entries: Array<{ email: string; name?: string; brand?: string }>
): Promise<{ importedCount: number; skippedCount: number }> {
  const settings = await getAutomailSettingsAsync();
  const ownEmails = new Set<string>();
  for (const mb of settings.mailboxes || []) {
    if (mb.email) ownEmails.add(mb.email.toLowerCase().trim());
    for (const alias of mb.aliases || []) {
      ownEmails.add(alias.toLowerCase().trim());
    }
  }

  let importedCount = 0;
  let skippedCount = 0;
  const seen = new Set<string>();

  for (const item of entries) {
    const cleanEmail = (item.email || "").trim().toLowerCase();
    if (
      !cleanEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      ownEmails.has(cleanEmail) ||
      seen.has(cleanEmail)
    ) {
      skippedCount++;
      continue;
    }
    seen.add(cleanEmail);

    const { fullName } = extractCleanContactName(item.name, cleanEmail);
    const brand = (item.brand || "hipro").toLowerCase().trim() || "hipro";

    try {
      await (prisma as any).automailContact.upsert({
        where: { email: cleanEmail },
        create: {
          email: cleanEmail,
          name: fullName,
          brand,
          source: "inbox_received",
        },
        update: {
          name: item.name?.trim() ? fullName : undefined,
        },
      });
      importedCount++;
    } catch {
      skippedCount++;
    }
  }

  return { importedCount, skippedCount };
}
