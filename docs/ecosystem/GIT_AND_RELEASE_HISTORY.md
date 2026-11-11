# Git & Release History — Monorepo Evolution & Release Protocol

## 1. Monorepo Identity & Worktree Topology

The Hindustan Projects codebase is maintained in a single canonical Git monorepo:
- **Canonical Repository Root:** `D:\HindustanProjects\Hipro-Website\Hipro-Web`
- **Git Common Directory:** `D:\HindustanProjects\Hipro-Website\Hipro-Web\.git`
- **Remote URL:** `https://github.com/hindustan-groups/Hipro-Web.git`
- **Current Canonical Branch:** `main`
- **Current Synchronized HEAD Commit:** `d88f36c34599a829a0a52404379d7f1b52e3ec1b` (Merge PR #14)

### Worktree Architecture
The monorepo uses Git worktrees to enable concurrent multi-branch engineering while sharing a single `.git` object database:
1. **`Hipro-Web` (Primary Worktree):** The canonical workspace tracking `main`.
2. **`Hipro-Main` (Linked Worktree):** Located at `D:\HindustanProjects\Hipro-Website\Hipro-Main`, checked out to `feature/master-admin-redesign-and-rbac` (`12bd197`). Contains isolated local QA provisioning scripts (`seed_qa_accounts.ts`, `provision_qa_accounts.ps1`).
3. **Retired Worktrees (Step 6):** Intermediate batch worktrees (`Hipro-Batch1`, `Hipro-Batch2`, `Hipro-Batch2B`) were formally retired and unlinked in Step 6 after complete stash preservation.

---

## 2. Major Pull Request Release History

The development trajectory leading to the current production baseline was delivered across three major architectural releases:

### Pull Request #12: Automail Corporate Layout & Legal Compliance
- **Core Scope:** Introduced the corporate email layout wrapper (`backend/src/services/automail/emailTemplateWrapper.ts`).
- **Achievements:**
  - Enforced 100% corporate branding on all outgoing transactional and broadcast emails.
  - Multi-brand header/footer theming (`hipro`, `hbs`, `empanelment`, `all`).
  - Embedded corporate registered office address, helpline numbers, and legal confidentiality disclaimers.
  - Added idempotent wrapping detection (`isAlreadyCorporatelyBranded`).

### Pull Request #13: Phase 2C-1O Defensive Safety Hardening
- **Core Scope:** Multi-layer security hardening across database, email, uploads, and dependencies.
- **Achievements:**
  - Implemented `databaseSafety.ts` enforcing strict loopback-only connections in development environments.
  - Hardened email safety by permanently suppressing live SMTP/API calls outside `NODE_ENV=production`.
  - Added Cloudinary upload safety (`ALLOW_DEV_CLOUDINARY_UPLOADS=false`).
  - Resolved `follow-redirects` security vulnerability (GHSA-mrwp-f3q8-3g9p) via dependency overrides.
  - Sanitized project slugs, preventing path traversal and URL injection.

### Pull Request #14: Master Integration Release (PRs #1, #2, #3, #4 Combined)
- **PR #14 Merge Commit:** `d88f36c34599a829a0a52404379d7f1b52e3ec1b`
- **Preceding Stack Commits:**
  1. `abfc3f7` (**PR 1 - Public Projects & SEO**): Slug normalization, offline fallback data integrity, cost estimator enhancements, and WCAG accessibility improvements.
  2. `b3fcca4` (**PR 2 - HBS Dynamic Claims & Compliance**): Remediation of unverified ISO certifications, dynamic claim administration from database, sub-brand visual polish.
  3. `becea6d` (**PR 3 - Master Admin Redesign & RBAC**): Complete UI overhaul of `/admin`, implementation of sliding session engine with 7-day window / 30-day ceiling, and fail-closed RBAC middleware.
  4. `12bd197` (**PR 4 - QA & Security Test Suites**): Automated test harness verifying session extension, role isolation, and security controls.

---

## 3. Preserved Git Stashes Registry

Four complete backups remain safely stored in the Git stash registry. These preserve historic local drafts and scratch states created prior to worktree synchronization and retirement:

| Stash Identifier | Commit SHA | Stash Message & Description | Item Count | Status |
| :--- | :--- | :--- | :--- | :--- |
| `stash@{0}` | `bf99057` | `backup-batch2b-pre-retire` (Batch2B pre-removal backup) | 39 items | Archived (Verified superseded by PR #14) |
| `stash@{1}` | `c7ef799` | `backup-batch2-pre-retire` (Batch2 pre-removal backup) | 4 items | Archived (Verified merged in PR #14) |
| `stash@{2}` | `3606fe4` | `backup-batch1-pre-retire` (Batch1 pre-removal backup) | 5 items | Archived (Verified merged in PR #14) |
| `stash@{3}` | `18f1d00` | `backup-pre-main-sync-oct24-drafts` (Hipro-Web pre-sync backup) | 24 items | Archived (Preserves October local drafts) |

---

## 4. Pending Feature Branches & Cherry-Pick Candidates

Audit of all 36 local branches revealed that 34 are fully merged into `main`. Exactly two branches contain unique commits:

### 1. `fix/blog-cms-draft-content-integrity`
- **Unique Commits:** 2 commits ahead of `main`:
  - `095fd67`: *feat(cms): add real-time auto-save, cross-page draft recovery, and beforeunload protection*
  - `d6ad07a`: *fix(cms): prevent draft and edit article content loss in blog CMS V2*
- **Significance:** Adds localStorage-based real-time draft saving, un-saved change warnings (`beforeunload`), and recovery banners in `/admin/blogs`.
- **Recommendation:** High value feature; scheduled for clean cherry-pick onto a new PR branch.

### 2. `improvement/about-page-redesign`
- **Unique Commits:** 1 commit ahead of `main`:
  - `2f6ccdb`: *feat(about): implement corporate engineering redesign for /about based on audit report*
- **Significance:** UI enhancements for the corporate About page.
- **Recommendation:** Review against current `app/(site)/about/page.tsx` before deciding to merge.

---

## 5. Release Protocol for Future Pull Requests

To maintain codebase stability, every future PR must adhere to the standardized 6-phase release protocol:

1. **Branch Isolation:** Branch exclusively from clean, updated `main` (`git checkout -b feature/<name> origin/main`).
2. **Local Environment Safety:** Verify that `databaseSafety.ts` loopback checks pass and zero real credentials are used.
3. **Type Checking & Linting:** Run `npm run lint` and `npx tsc --noEmit` across both `frontend/` and `backend/`.
4. **Pre-Commit Secrets Audit:** Verify that no `.env` files, private keys, or credentials are staged (`git status`, `git diff --cached`).
5. **PR Description & Traceability:** Explicitly document the problem statement, affected components, database schema changes, and test evidence.
6. **Post-Merge Clean Synchronization:** Fast-forward local `main` with `git fetch origin main && git merge --ff-only origin/main` to prevent diverging branches.

