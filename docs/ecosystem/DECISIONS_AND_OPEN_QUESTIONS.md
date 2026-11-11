# Architectural Decisions & Open Strategic Questions

## 1. Architectural Decision Records (ADRs)

This section records foundational technical decisions, their business drivers, architectural alternatives considered, and implemented rationales.

---

### ADR-001: Monorepo Architecture with Unified Database vs. Multi-Repo Polyrepo
- **Status:** **Accepted & Implemented**
- **Context:** The Hindustan Projects ecosystem spans corporate marketing, building repair (HBS), vendor empanelment, administrative CMS, and communications. Managing separate repositories and databases introduces high operational overhead, divergent schemas, and complex inter-service synchronization.
- **Decision:** Consolidate all 4 components into a single monorepo (`Hipro-Web`) with:
  - Unified Prisma ORM data layer (`backend/prisma/schema.prisma` with 35 models).
  - Single Express API backend (`backend/src/`).
  - Single Next.js App Router frontend with modular directory segregation (`app/(site)`, `app/hbs`, `app/empanelment`, `app/admin`).
- **Consequences:**
  - *Positive:* Instant cross-component data consistency, zero API version drift, shared TypeScript types, single database migration pipeline.
  - *Mitigations:* Rigorous directory structure and module isolation rules prevent circular dependencies.

---

### ADR-002: Edge Middleware Subdomain Rewriting with Host Isolation
- **Status:** **Accepted & Implemented**
- **Context:** Delivering three distinct public experiences (`www.hindustanprojects.in`, `hindbuilding.hindustanprojects.in`, `empanelment.hindustanprojects.in`) traditionally requires either separate Next.js instances or reverse proxies. Additionally, administrative access must be guarded against exposure across multiple subdomains.
- **Decision:** Utilize Next.js Edge Middleware (`frontend/middleware.ts`) to:
  1. Rewrite incoming hostname traffic internally to specific App Router directories without changing the URL displayed in the client's address bar.
  2. Enforce strict **Host Isolation**: Any attempt to access `/admin` or `/admin-login` on a secondary domain (`hindbuilding.*` or `empanelment.*`) is intercepted at the edge and 301-redirected to `https://www.hindustanprojects.in/admin`.
- **Consequences:**
  - *Positive:* Single Vercel deployment project (`hipro-web-r7y9`), zero infrastructure redundancy, centralized cookie and CORS management.
  - *Security:* Eliminates cross-subdomain administrative session hijack vectors.

---

### ADR-003: Stateful Sliding Database Sessions vs. Stateless JWT Tokens
- **Status:** **Accepted & Implemented**
- **Context:** Pure stateless JWT tokens cannot be revoked immediately if an administrator account is compromised, unless complex Redis blacklists are maintained. Conversely, fixed session timeouts degrade user experience during lengthy CMS drafting sessions.
- **Decision:** Implement a database-backed, stateful sliding session engine (`AdminSession`):
  - **7-Day Sliding Window:** Session expiration extends automatically on user activity (throttled to update DB once per 24 hours).
  - **30-Day Absolute Ceiling:** Derived from CUID v1 timestamp prefix; session expires permanently after 30 days regardless of activity, requiring re-authentication.
  - **HTTP-Only Cookie:** Session ID transmitted exclusively via `httpOnly`, `secure`, `sameSite: "lax"` cookie (`admin_session`).
- **Consequences:**
  - *Positive:* Immediate session revocation on password change or user deactivation, robust protection against XSS token theft, optimal editorial convenience.

---

### ADR-004: Fail-Closed Non-Production Email Delivery Interception
- **Status:** **Accepted & Implemented**
- **Context:** During development, testing, and automated builds, test scripts or developer actions could inadvertently trigger outbound emails to real client or vendor email addresses stored in test databases.
- **Decision:** Implement a permanent, fail-closed environment gate in `backend/src/services/automail/emailSender.ts`:
  - If `NODE_ENV !== "production"`, real outbound SMTP sockets and Hostinger API HTTPS dispatches are **strictly prohibited**.
  - No environment variable (such as `ENABLE_LIVE_EMAIL_IN_DEV`) is permitted to bypass this rule. Non-production dispatches return mock success responses and log payload metadata to the console.
- **Consequences:**
  - *Positive:* 100% elimination of accidental client email leakage during QA, staging, and local testing.

---

### ADR-005: CPWD Standard Tiering for Contractor Empanelment
- **Status:** **Accepted & Implemented**
- **Context:** Hindustan Projects requires an objective, industry-recognized methodology to categorize contractor capacity, bidding eligibility, and financial limits.
- **Decision:** Adopt the Central Public Works Department (CPWD) standard capacity grading:
  - Class A: EPC & Mega Infrastructure (> ₹50 Crore)
  - Class B: Major Subcontracting (Up to ₹50 Crore)
  - Class C: Specialized Trade Contracting (Up to ₹10 Crore)
  - Class D: Material & Equipment Supply (Up to ₹2 Crore)
- **Consequences:**
  - *Positive:* Immediate institutional credibility with government and institutional EPC clients, clear legal eligibility boundaries.

---

## 2. Open Strategic Questions & Decisions for User Input

The following questions require strategic decisions or authorization from project leadership:

### Question 1: Cleanup of Leftover Batch Directories
- **Issue:** `D:\HindustanProjects\Hipro-Website\Hipro-Batch1` and `D:\HindustanProjects\Hipro-Website\Hipro-Batch2` contain leftover `node_modules` folders from retired worktrees.
- **Options:**
  - **Option A (Recommended):** Authorize execution of `Remove-Item -Recurse -Force` to reclaim disk space. Both folders contain zero source code or uncommitted changes.
  - **Option B:** Leave directories in place until manual developer review.

---

### Question 2: Pruning Stale Git Worktree Metadata
- **Issue:** `.git/worktrees/` retains 11 orphaned registrations pointing to deleted ephemeral coding agent scratch directories.
- **Options:**
  - **Option A (Recommended):** Run `git worktree prune` from canonical repository root to clean `git worktree list`. Active worktrees (`Hipro-Web` and `Hipro-Main`) are unaffected.
  - **Option B:** Defer pruning until next major release cycle.

---

### Question 3: Cherry-Picking Blog CMS Real-Time Auto-Save
- **Issue:** Branch `fix/blog-cms-draft-content-integrity` contains two production-ready commits (`095fd67` and `d6ad07a`) adding `localStorage` auto-saving and `beforeunload` change protection to `/admin/blogs`.
- **Options:**
  - **Option A (Recommended):** Create a dedicated release branch, cherry-pick both commits, verify Next.js 15 compatibility, and merge to `main`.
  - **Option B:** Defer Blog CMS enhancements to a future editorial features sprint.

---

### Question 4: Deletion of Retired Local Batch Branches
- **Issue:** Local branches `feature/batch1-code-fixes`, `feature/batch2-master-admin-session`, and `feature/batch2b-master-admin-rbac` remain in local Git registry. Their uncommitted changes are preserved in `stash@{0}`, `stash@{1}`, and `stash@{2}`, and their code was merged in PR #14.
- **Options:**
  - **Option A (Recommended):** Delete local branch pointers via `git branch -d` to clean the branch inventory (branches are fully merged into `main`).
  - **Option B:** Retain branch pointers for historical reference.

---

### Question 5: Timeline & Scope for Employee Portal
- **Issue:** An "Employee Portal" has been mentioned in long-term roadmaps. As established in architecture reviews, this belongs under Master Admin (`/admin/employee`) rather than as an independent project or separate subdomain.
- **Options:**
  - **Option A:** Schedule Employee Portal planning for Phase 3 (focusing on leave tracking, digital pay slips, and engineering timesheets).
  - **Option B:** Keep Employee Portal in backlog pending operational requirement definition from HR leadership.

