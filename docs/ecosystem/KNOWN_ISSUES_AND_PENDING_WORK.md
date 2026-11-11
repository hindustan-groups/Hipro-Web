# Known Issues & Technical Debt Catalog

## 1. Overview & Classification

This document provides a factual, evidence-based catalog of all known defects, technical debt, unfinished operational items, and pending enhancements across the Hindustan Projects ecosystem.

Items are categorized by priority and operational risk:
- **Priority 1 (Operational Cleanup):** File locks, stale registrations, disk space.
- **Priority 2 (Pending Feature Merges):** Unmerged validated commits on local branches.
- **Priority 3 (User Experience & Mobile UX):** Form field feedback and CSS viewport clearances.
- **Priority 4 (Enterprise Infrastructure):** Background queues and asynchronous webhooks.

---

## 2. Priority 1 — Operational & Repository Maintenance

### Issue 1.1: Leftover `node_modules` Directories in Retired Worktree Folders
- **Affected Paths:**
  - `D:\HindustanProjects\Hipro-Website\Hipro-Batch1` (contains solely `frontend/node_modules/`)
  - `D:\HindustanProjects\Hipro-Website\Hipro-Batch2` (contains solely `backend/node_modules/` and `frontend/node_modules/`)
- **Root Cause:** When `git worktree remove` was executed during Step 6, Windows file locks held by background language servers or Node.js watchers prevented the complete removal of nested dependency directories.
- **Current State:** Both directories contain **zero source code, tracked files, or uncommitted work**. Git registrations for both worktrees have been successfully unregistered.
- **Resolution Plan:** Execute a recursive directory purge via PowerShell (`Remove-Item -Recurse -Force`) once IDE file locks are cleared.

### Issue 1.2: Stale Agent Scratch Worktree Registrations
- **Affected Component:** Git Common Directory (`.git/worktrees/`)
- **Root Cause:** Automated coding agent sessions created ephemeral scratch worktrees under `C:\Users\HP\.gemini\antigravity-ide\worktrees\...`. The physical directories have been deleted, but administrative metadata lingers in `.git/worktrees/`.
- **Current State:** 11 orphaned worktree registrations appear when running `git worktree list --porcelain`.
- **Resolution Plan:** Run `git worktree prune` from the canonical repository root to clean stale metadata without impacting active worktrees (`Hipro-Web` and `Hipro-Main`).

---

## 3. Priority 2 — Pending Feature Merges & Branch Cherry-Picks

### Issue 2.1: Unmerged Blog CMS Real-Time Auto-Save Feature
- **Branch:** `fix/blog-cms-draft-content-integrity`
- **Commit Range:** `095fd67` and `d6ad07a` (2 commits ahead of `main`).
- **Functionality Provided:**
  - Real-time `localStorage` auto-saving for blog article drafting in `/admin/blogs`.
  - Window `beforeunload` event protection alerting editors if they attempt to navigate away with un-saved changes.
  - Draft recovery notification bar on page load if a recovered local draft is newer than the database record.
- **Current State:** Fully validated and functional, but not yet merged into `main`.
- **Resolution Plan:** Create a clean release branch from `main`, cherry-pick commits `d6ad07a` and `095fd67`, verify against modern Next.js 15 App Router conventions, and open a formal pull request.

### Issue 2.2: Historical About Page Redesign
- **Branch:** `improvement/about-page-redesign`
- **Commit:** `2f6ccdb` (1 commit ahead of `main`).
- **Functionality Provided:** Engineering narrative and timeline refinements for `/about`.
- **Current State:** Unmerged pending leadership review against current marketing goals.

---

## 4. Priority 3 — User Experience & Client-Side Validation

### Issue 3.1: Empanelment Form Dynamic Client-Side Regex Feedback
- **Affected Route:** `frontend/app/empanelment/apply/page.tsx`
- **Description:** The backend API (`backend/src/routes/empanelment.ts`) strictly validates GSTIN and PAN formats via regex and checksums (`DATA-CRIT-01`). However, on the frontend registration form, feedback is currently displayed only upon form submission.
- **Impact:** Minor user frustration if a typo occurs in an 15-character GSTIN string on step 2 of a multi-step form.
- **Resolution Plan:** Add real-time `onChange` regex validation indicators with instant green/red status badges for GSTIN, PAN, and IFSC fields.

### Issue 3.2: HBS Mobile Navigation Drawer Clearance on Compact Screens
- **Affected Route:** `frontend/app/hbs/` (Mobile Navigation Drawer)
- **Description:** On compact mobile devices with viewports narrower than 360px, the navigation drawer close button (`X`) exhibits a slight visual overlap with the sticky "Emergency Call" consultation action button.
- **Resolution Plan:** Adjust safe-area padding and z-index offsets in `HbsHeader.tsx`.

---

## 5. Priority 4 — Enterprise Infrastructure & Communications Scalability

### Issue 4.1: Asynchronous Email Bounce & Delivery Webhook
- **Affected Service:** `backend/src/services/automail/`
- **Description:** Automail captures synchronous delivery failures (e.g., rejected SMTP recipient, invalid host). However, asynchronous hard bounces (e.g., mailbox full, domain disabled after acceptance) are not ingested back into the contact database.
- **Resolution Plan:** Implement an inbound webhook route (`POST /api/automail/webhooks/bounce`) accepting Hostinger Mail / Mailgun bounce event payloads to automatically mark `AutomailContact.status = "BOUNCED"`.

### Issue 4.2: Asynchronous Background Job Queue for Large Broadcasts
- **Affected Service:** `backend/src/services/automail/emailSender.ts`
- **Description:** Marketing email campaigns dispatched to large audience lists (> 500 recipients) currently execute via chunked asynchronous promises in Node.js process memory.
- **Impact:** If the backend container restarts during a broadcast, in-flight campaign batches require manual resumption.
- **Resolution Plan:** Integrate BullMQ backed by a Redis instance to provide persistent job scheduling, automatic retry policies, and granular per-message state machines.

### Issue 4.3: Legacy Numeric Project ID Routing Cleanup
- **Affected Component:** `frontend/app/(site)/projects/[slug]/page.tsx`
- **Description:** Backward-compatible redirect logic exists in `da11741` and `d596605` to map legacy numeric URLs (e.g. `/projects/1`) to canonical semantic slugs (e.g. `/projects/jaipur-metro-phase-2`).
- **Resolution Plan:** Audit search console traffic; once search crawlers and backlink indexes have updated to canonical slugs, legacy numerical mappings can be archived.

