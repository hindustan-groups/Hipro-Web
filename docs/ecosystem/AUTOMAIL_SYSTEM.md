# Automail Communications Engine — Architecture & Delivery Pipeline

## 1. System Role & Identity

**Automail** is not a separate web application or standalone SaaS tool; it is the **centralized, cross-cutting transactional and marketing email communications engine** for the entire Hindustan Projects monorepo ecosystem.

Automail services all divisions of the group:
1. **HiPRO Corporate:** Contact inquiries, quotation requests, engineering service confirmations, and newsletter bulletins.
2. **Hind Building Solutions (HBS):** Structural repair consult requests, waterproofing lead acknowledgments, and site audit notifications.
3. **Vendor Empanelment:** Application status updates, tracking notifications, tender announcements, and digital gate pass QR delivery.
4. **Master Admin Operations:** Password resets, security login alerts, and administrative broadcast campaigns.

---

## 2. Multi-Transport Architecture & Cloud Delivery Resilience

Sending transactional emails reliably from containerized cloud environments (such as Render) is challenging due to cloud provider egress port blocks (Render blocks outbound TCP ports 25, 465, and 587 by default on free and lower-tier instances).

Automail solves this via a multi-tier delivery and auto-rescue architecture (`backend/src/services/automail/emailSender.ts`):

```
       [ Outbound Email Request ]
                  │
                  ▼
       [ Non-Prod Safety Guard ] ──(NODE_ENV !== "production")──► [ Mock Delivery / Log Only ]
                  │
        (Production Mode)
                  │
                  ▼
       [ Delivery Method Check ]
       ┌──────────┴──────────┐
       ▼                     ▼
[ Hostinger Mail API ]   [ Primary SMTP Port 465 ]
(HTTPS Port 443 REST)        │
                             ├── (Success) ──► Delivered
                             └── (Timeout / Blocked)
                                      ▼
                         [ Fallback SMTP Port 587 ]
                         (STARTTLS)
                             │
                             ├── (Success) ──► Delivered
                             └── (Failed)
                                      ▼
                         [ Auto-Rescue via Hostinger API ]
                         (HTTPS Port 443 REST SDK)
```

### 1. Primary SMTP Transport (Port 465 / 587)
- Powered by `nodemailer`.
- Uses `dns.setDefaultResultOrder("ipv4first")` to prevent IPv6 `ENETUNREACH` socket errors across heterogeneous cloud networks.
- Supports Port 465 (SMTPS) with automatic fallback to Port 587 (STARTTLS).

### 2. Hostinger Mail API (REST over HTTPS Port 443)
- Powered by `hostinger-mail-api-sdk` (`Configuration`, `AccountApi`, `SendApi`).
- Bypasses all cloud firewall SMTP port restrictions by transmitting mail payloads over standard HTTPS Port 443.
- Serves as the primary configured delivery method or an automatic fallback rescue when SMTP sockets encounter network timeouts.

---

## 3. Strict Fail-Closed Non-Production Safety Guard

To prevent accidental transmission of live emails to real clients, subcontractors, or partners during local development, staging, or automated testing, Automail enforces a strict environment gate:

```typescript
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  console.log(`[AUTOMAIL DEV MOCK] Dispatched email to ${to} intercepted. Real transmission suppressed.`);
  return { success: true, message: "[DEV MOCK] Intercepted in development mode.", isMock: true };
}
```
- Real outbound TCP sockets (DNS lookups, SMTP connections, and Hostinger API HTTPS requests) are completely suppressed outside `NODE_ENV=production`.
- Mock dispatches record full payload metadata, subject lines, and recipient addresses in the backend console for developer inspection.

---

## 4. Corporate Brand Wrapper & Compliance (PR #12)

Implemented in PR #12 (`backend/src/services/automail/emailTemplateWrapper.ts`), the wrapper ensures **100% of dispatched emails conform to statutory, legal, and corporate design standards**:

### Dynamic Brand Topologies
The wrapper injects brand-specific styling and credentials based on the originating division:
- **`hipro`:** Dark slate gradient header (`#090e1a` to `#1e293b`), red accent (`#dc2626`), `OFFICIAL CORPORATE DISPATCH` badge, helpline `+91 75970 00601`.
- **`hbs`:** Crimson gradient header (`#450a0a` to `#991b1b`), amber accent (`#b91c1c`), `HiBUILD STRUCTURAL CARE DESK` badge, website `hindbuilding.hindustanprojects.in`.
- **`empanelment`:** Navy corporate header, `VENDOR PROCUREMENT DESK` badge, portal link `empanelment.hindustanprojects.in`.
- **`all`:** Hindustan Projects Group combined corporate header.

### Mandatory Compliance & Identity Injections
Every outgoing HTML email automatically includes:
1. **Corporate Headquarters:** Registered office address (Jaipur, Rajasthan, India).
2. **Statutory Disclaimers:** Confidentiality notice under Indian IT Act and international privacy standards.
3. **Quality Guarantees:** Dynamic trust badges referencing verified project execution and engineering compliance.
4. **Idempotent Guard:** `isAlreadyCorporatelyBranded()` prevents double-wrapping if a template already contains the corporate header.

---

## 5. Token Replacement & Template Engine

Automail provides a dynamic token interpolation engine (`customTemplatesService.ts`) supporting:
- Recipient tokens: `{{name}}`, `{{email}}`, `{{company}}`, `{{phone}}`.
- Workflow tokens: `{{trackingId}}`, `{{tier}}`, `{{passCode}}`, `{{tenderNumber}}`, `{{amount}}`.
- Corporate tokens: `{{companyName}}`, `{{year}}`, `{{helpline}}`, `{{website}}`.

Templates can be created, styled, and audited via Master Admin (`/admin/automail/templates`).

---

## 6. Database Models & Schema (`backend/prisma/schema.prisma`)

Automail state is persisted in 5 core Prisma models:
1. **`AutomailSetting`**: System configuration (delivery method `smtp` vs `api`, SMTP host/port/user/pass, Hostinger API token, sender names, daily quota limits).
2. **`AutomailContact`**: Audience directory (`email`, `name`, `company`, `category`, `status`, `tags`, `unsubscribedAt`).
3. **`AutomailCampaign`**: Broadcast campaigns (`title`, `subject`, `htmlContent`, `brand`, `status`, `scheduledAt`, `totalRecipients`, `sentCount`, `failCount`).
4. **`AutomailSendLog`**: Immutable delivery audit trail (`campaignId`, `recipientEmail`, `recipientName`, `status`, `errorReason`, `messageId`, `sentAt`).
5. **`AutomailDailyStat`**: Quota and volume tracking (`date`, `sentCount`, `bouncedCount`, `failedCount`).

---

## 7. Current Implementation Status vs. Pending Work

### Completed Work
- [x] Dual-transport delivery engine (Hostinger HTTPS API + Nodemailer SMTP).
- [x] Auto-switching from Port 465 to Port 587 and API rescue on network failure.
- [x] Strict fail-closed non-production mock delivery guard.
- [x] PR #12 Corporate Email Wrapper with multi-brand styling, address, and disclaimers.
- [x] Master Admin Automail cockpit (`/admin/automail`) with contacts, campaigns, logs, and settings.
- [x] CSV contact list parser and deduplicator (`csvParser.ts`).

### Known Pending Work
- [ ] **Bounce Webhook Handler:** Currently, failed dispatches are detected via synchronous transport errors. Adding an asynchronous webhook endpoint for Hostinger / Mailgun bounce event webhooks will improve long-term list hygiene.
- [ ] **Background Job Queue (BullMQ / Redis):** Large marketing broadcasts (> 500 recipients) currently execute via managed asynchronous batches in memory. Integrating a Redis-backed BullMQ queue is recommended for enterprise volume.

