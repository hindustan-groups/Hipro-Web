# HINDUSTAN PROJECTS (HiPRO) — BUGS AND TECHNICAL DEBT REGISTER
**Document Reference:** `DOC-HIPRO-AUDIT-006`  
**Audit Date:** October 2026 (Local System Time: 2026-10-21)  
**Status:** Complete Read-Only Technical Audit  
**Author/Auditor:** Antigravity AI Senior Technical Auditor  

---

## 1. Defect Classification Framework

Defects identified during this audit are prioritized according to business impact and operational risk:
- **P0 (Critical Production / SEO Integrity):** Direct cause of page de-indexing, 404 errors on public routes, database corruption risk, or severe canonical conflicts.
- **P1 (High Impact / Broken User Flow):** Visible customer-facing bugs, architectural disconnects, data-flow volatility, or unpersistent critical business state.
- **P2 (SEO / UX / Testing Debt):** Schema gaps, missing automated tests, accessibility defects, or performance bottlenecks.
- **P3 (Code Hygiene & Technical Debt):** Unused scripts, legacy folders, redundant CSS, or dependency cleanups.

---

## 2. Comprehensive Defect Register

### 2.1 Critical Defects (P0)

#### DEF-001: Corrupted Project Slugs in Database & Sitemap
- **Priority:** **P0**
- **Affected Module:** Backend Database & Public Projects Portfolio
- **Affected Files:**
  - `backend/src/routes/projects.ts`
  - `frontend/app/(site)/projects/[slug]/page.tsx`
  - `frontend/app/sitemap.ts`
- **Observable Evidence:**
  Querying `https://hipro-backend-749v.onrender.com/api/projects` and inspecting `https://www.hindustanprojects.in/sitemap.xml` reveals slugs formatted with prepended prefixes:
  - `projects-adani-gas-chamber-shinghpur`
  - `expansion-of-weav-projects-expansion-of-weaving-department-airjet-ajay-syntexing-department-airjet-ajay-syntex-pvt-ltd`
- **Root Cause Analysis:** When projects were initially seeded or imported via early CMS forms, the URL path `/projects/` or `projects-` was concatenated directly into the title before hashing or slug generation, resulting in corrupted slug strings stored in PostgreSQL.
- **Proposed Technical Fix:**
  1. Write a safe database migration script to sanitize existing slug values (e.g., `projects-adani-...` -> `adani-gas-chamber-shinghpur`).
  2. Implement an input sanitization hook in `projects.controller.ts` that strips leading slashes or `projects-` before saving.
  3. Configure permanent 301 redirects in `frontend/next.config.mjs` mapping old corrupted slugs to clean canonical slugs.
- **Acceptance Criteria:** All project slugs in database and sitemap are clean, human-readable strings without path duplication.

---

#### DEF-002: Double Slashes in Project Canonical URLs
- **Priority:** **P0**
- **Affected Module:** Frontend SEO Metadata Generator
- **Affected File:** `frontend/app/(site)/projects/[slug]/page.tsx`
- **Observable Evidence:**
  Inspecting HTML source of project pages reveals:
  ```html
  <link rel="canonical" href="https://www.hindustanprojects.in/projects//projects/adani-gas-chamber-shinghpur" />
  ```
- **Root Cause Analysis:** The metadata generator builds canonical links with `${baseUrl}/projects/${params.slug}`. When `params.slug` starts with `/projects/` (due to DEF-001), a double slash (`//projects/`) is generated.
- **Proposed Technical Fix:**
  Normalize the slug before building the canonical URL:
  ```typescript
  const cleanSlug = params.slug.replace(/^\/?(projects\/)?/, '');
  const canonicalUrl = `${baseUrl}/projects/${cleanSlug}`;
  ```
- **Acceptance Criteria:** Every project page outputs a valid canonical URL containing strictly single slashes and matching the true indexable route.

---

#### DEF-003: Active Portfolio Showcase Project Marked `noIndex: true`
- **Priority:** **P0**
- **Affected Module:** Database Record & Search Engine Indexing
- **Affected Entity:** Project ID `cm...` (Adani Industrial Gas Chamber Project).
- **Observable Evidence:**
  The project record in PostgreSQL has `noIndex: true`. When Next.js renders `frontend/app/(site)/projects/[slug]/page.tsx`, it injects:
  ```html
  <meta name="robots" content="noindex,nofollow" />
  ```
- **Root Cause Analysis:** The `noIndex` boolean flag was likely toggled accidentally during CMS testing and never reset to `false`.
- **Proposed Technical Fix:**
  Audit all records in the `Project` table. Update `noIndex = false` for all valid, completed client portfolio entries.
- **Acceptance Criteria:** All legitimate portfolio projects output `<meta name="robots" content="index,follow" />`.

---

#### DEF-004: Lack of Version-Controlled Database Migrations
- **Priority:** **P0**
- **Affected Module:** Backend Database & Prisma Workflow
- **Affected Directory:** `backend/prisma/`
- **Observable Evidence:**
  The `backend/prisma/` directory contains only `schema.prisma`. No `migrations/` folder exists, and `package.json` uses `"db:push": "prisma db push"`.
- **Root Cause Analysis:** The team used rapid prototyping workflows (`prisma db push`), bypassing the generation of deterministic migration scripts.
- **Risk:** Any future column rename, type adjustment, or deletion executed via `db push` risks irreversible data loss or unrecoverable schema drift between local, preview, and production databases.
- **Proposed Technical Fix:**
  Baseline the existing Neon schema using `npx prisma migrate diff` and generate an initial migration baseline committed to Git.
- **Acceptance Criteria:** A clean `backend/prisma/migrations/` directory exists in version control, and future changes use `prisma migrate dev`.

---

### 2.2 High-Impact Defects (P1)

#### DEF-005: `Service` Model Lacks Persisted `slug` Column
- **Priority:** **P1**
- **Affected Module:** Backend Prisma Schema & Routing Stability
- **Affected Files:**
  - `backend/prisma/schema.prisma` (`model Service`)
  - `backend/src/routes/services.ts`
  - `frontend/app/(site)/services/[slug]/page.tsx`
- **Observable Evidence:**
  `model Service` only has `id`, `title`, `description`, etc. Slugs are derived dynamically on-the-fly:
  ```typescript
  export const getServiceSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  ```
- **Root Cause Analysis:** Lack of an explicit `slug` field forces the frontend to query services by calculating slugs at runtime or matching slug strings to normalized titles.
- **Risk:** Changing a service title in the CMS immediately invalidates all indexed Google URLs, backlinks, and brochures.
- **Proposed Technical Fix:**
  Add a `@unique slug String` column to `model Service`, write a backfill script to populate existing slugs, and enforce slug immutability in the CMS.
- **Acceptance Criteria:** `model Service` has a dedicated, indexed `slug` column.

---

#### DEF-006: Empanelment Subdomain Routing Disconnect
- **Priority:** **P1**
- **Affected Module:** Subdomain Deployment & DNS Ingress
- **Affected Hostname:** `https://empanelment.hindustanprojects.in`
- **Observable Evidence:**
  Accessing `https://empanelment.hindustanprojects.in` serves a standalone Vite SPA build (`/assets/index-CwasgwSq.js`) rather than the modern Next.js 14 App Router portal implemented under `frontend/app/empanelment/`.
- **Root Cause Analysis:** The domain DNS or Vercel routing configuration for the `empanelment` subdomain was never updated to point to the main Next.js Vercel deployment where `middleware.ts` handles the `/empanelment` rewrite.
- **Proposed Technical Fix:**
  Add `empanelment.hindustanprojects.in` as an official domain alias on the Vercel project and verify that `middleware.ts` routes requests to `/empanelment/*`.
- **Acceptance Criteria:** Visiting `empanelment.hindustanprojects.in` renders the unified Next.js 14 App Router layout.

---

#### DEF-007: HBS Hero Headline Typo Bug
- **Priority:** **P1**
- **Affected Module:** Sub-brand Frontend Layout
- **Affected File:** `frontend/components/hbs/HbsHero.tsx` (Lines 104-107)
- **Observable Evidence:**
  Live on `https://hindbuilding.hindustanprojects.in`, the hero subtitle renders:
  > *"Repair. Protect. Maintain. .Build Better."* (Notice the double period after Maintain).
- **Root Cause Analysis:** The text manipulation logic:
  ```typescript
  line.replace("Build Better", "")
  ```
  executes against a string ending with `"Build Better."`, stripping only the phrase and leaving an orphaned period immediately adjacent to the preceding period.
- **Proposed Technical Fix:**
  Refactor line replacement to safely strip punctuation:
  ```typescript
  line.replace(/\s*\.?Build Better\.?/i, '')
  ```
- **Acceptance Criteria:** HBS hero displays clean typography: *"Repair. Protect. Maintain. Build Better."*

---

#### DEF-008: Automail Daily Quota In-Memory Reset Risk
- **Priority:** **P1**
- **Affected Module:** Backend Automail Service
- **Affected File:** `backend/src/services/automail.service.ts`
- **Observable Evidence:**
  The daily email dispatch quota counter is stored in a JavaScript `Map<string, number>()` in application memory.
- **Root Cause Analysis:** In-memory counters do not survive server restarts, scale-out instances, or Render Docker container redeployments.
- **Risk:** If Render restarts the backend container, the quota counter resets to zero, allowing marketing campaigns to exceed the daily safe sending limit of 200 emails and potentially triggering SMTP blacklisting.
- **Proposed Technical Fix:**
  Create a lightweight PostgreSQL table (`AutomailDailyLog`) to track email timestamps and query total daily sends transactions.
- **Acceptance Criteria:** Daily email quota is persisted in database and survives server reboots.

---

### 2.3 Medium-Impact Defects & Technical Debt (P2 & P3)

| ID | Priority | Module | Description | Recommendation |
| :---: | :---: | :--- | :--- | :--- |
| **DEF-009** | **P2** | Quality / CI | Complete absence of automated unit and integration tests (`npm test` missing in manifests). | Configure Jest/Vitest with basic sanity tests for slugs, schemas, and routes. |
| **DEF-010** | **P2** | SEO / Schema | Missing GeoCoordinates and FAQPage schema markup on core service pages. | Update `JsonLd.tsx` and service templates to inject coordinates and FAQ schemas. |
| **DEF-011** | **P2** | Admin Auth | Admin session cookie lacks explicit sliding window renewal; users experience sudden session drops after 24h. | Implement sliding session renewal on authenticated requests. |
| **DEF-012** | **P3** | Repository | Lingering scratch directory (`scratch/empanelment-portal`) and test scripts in repository root. | Archive or clean up scratch scripts into dedicated documentation/tools folders. |
