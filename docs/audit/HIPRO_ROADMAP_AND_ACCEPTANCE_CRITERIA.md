# HINDUSTAN PROJECTS (HiPRO) — REMEDIATION ROADMAP AND ACCEPTANCE CRITERIA
**Document Reference:** `DOC-HIPRO-AUDIT-007`  
**Audit Date:** October 2026 (Local System Time: 2026-10-21)  
**Status:** Complete Read-Only Technical Audit  
**Author/Auditor:** Antigravity AI Senior Technical Auditor  

---

## 1. Roadmap Architecture & Execution Phasing

This roadmap establishes a safe, prioritized, and measurable remediation plan. In strict adherence to project governance, **all execution is blocked until the business owner explicitly approves the remediation scope**.

```
+-------------------------------------------------------------------------------+
| PHASE 1: CRITICAL PRODUCTION DATA & SEO REMEDIATION (P0)                      |
| Sanitize Project Slugs, Canonical Tags, noIndex Flags, Prisma Migrations      |
+-------------------------------------------------------------------------------+
                                        │
                                        ▼
+-------------------------------------------------------------------------------+
| PHASE 2: CORE ARCHITECTURE & ROUTING ALIGNMENT (P1)                           |
| Add Service Slugs, Align Empanelment Subdomain, Fix HBS Hero Typo, Automail DB|
+-------------------------------------------------------------------------------+
                                        │
                                        ▼
+-------------------------------------------------------------------------------+
| PHASE 3: TECHNICAL SEO, AEO/GEO & SCHEMA HARDENING (P2)                       |
| GeoCoordinates, LocalBusiness AreaServed, FAQPage Schema, Multi-Sitemap Index |
+-------------------------------------------------------------------------------+
                                        │
                                        ▼
+-------------------------------------------------------------------------------+
| PHASE 4: QUALITY, TESTING & CI/CD GOVERNANCE (P2)                             |
| Vitest/Jest Integration, Automated GitHub Actions Pull Request Checker       |
+-------------------------------------------------------------------------------+
                                        │
                                        ▼
+-------------------------------------------------------------------------------+
| PHASE 5: OPERATIONS, MONITORING & CODE CLEANUP (P3)                           |
| Sliding Admin Sessions, Sentry Logging, Clean Scratch/Test Scripts           |
+-------------------------------------------------------------------------------+
```

---

## 2. Phase 1: Critical Production Data & SEO Remediation (P0)

### TASK-001: Project Slug Database Sanitization & 301 Redirect Map
- **Priority:** **P0**
- **Problem:** Database contains project slugs prefixed with `projects-` or `/projects/`, generating broken links, 404s, and duplicate sitemap entries.
- **Affected Files:**
  - Database table: `Project`
  - `frontend/next.config.mjs`
  - `frontend/app/sitemap.ts`
- **Proposed Solution:**
  1. Execute a safe SQL update script in a transaction stripping `projects-` and `/projects/` prefixes from existing project slugs.
  2. Add permanent 301 redirects in `next.config.mjs` mapping old corrupted slugs to the clean sanitized paths to preserve any inbound links.
- **Dependencies:** None.
- **Risks:** 404 errors if redirects are omitted.
- **Tests Required:** Verify project detail pages load with clean slugs; verify old slug URLs return HTTP 301.
- **Acceptance Criteria:** Zero project slugs contain `projects-` or `/projects/`. Sitemap reflects clean URLs. Old URLs redirect cleanly with 301 status.
- **Owner Approval Checkpoint:** Requires owner sign-off on slug cleanup mapping before executing database update.

---

### TASK-002: Fix Double Slash in Project Canonical Tag Builder
- **Priority:** **P0**
- **Problem:** Canonical tags render as `https://www.hindustanprojects.in/projects//projects/slug`.
- **Affected File:** `frontend/app/(site)/projects/[slug]/page.tsx`
- **Proposed Solution:** Sanitize the input slug in `generateMetadata()`:
  ```typescript
  const normalizedSlug = params.slug.replace(/^\/?(projects\/)?/, '');
  const canonicalUrl = `${baseUrl}/projects/${normalizedSlug}`;
  ```
- **Dependencies:** None.
- **Acceptance Criteria:** Canonical tag contains strictly valid single-slash URL structure across all project pages.

---

### TASK-003: Review and Clear `noIndex` on Active Showcase Projects
- **Priority:** **P0**
- **Problem:** Live portfolio projects have `noIndex: true` set in the database, instructing Google not to index them.
- **Affected Database Table:** `Project`
- **Proposed Solution:** Run a read-only audit query of all projects with `noIndex = true`. In agreement with the owner, reset valid showcase projects to `noIndex = false`.
- **Acceptance Criteria:** Live project pages output `<meta name="robots" content="index,follow" />`.

---

### TASK-004: Baseline Prisma Schema into Version-Controlled Migrations
- **Priority:** **P0**
- **Problem:** Absence of a `prisma/migrations` folder; schema is pushed without history via `prisma db push`.
- **Affected Directory:** `backend/prisma/`
- **Proposed Solution:**
  1. Run `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > baseline.sql`.
  2. Create the initial baseline directory: `prisma/migrations/0_init/migration.sql`.
  3. Mark migration as applied: `npx prisma migrate resolve --applied 0_init`.
- **Acceptance Criteria:** `backend/prisma/migrations` is committed to Git, and `npm run build` succeeds without warnings.

---

## 3. Phase 2: Core Architecture & Routing Alignment (P1)

### TASK-005: Add Persisted `slug` Column to Prisma `Service` Model
- **Priority:** **P1**
- **Problem:** `model Service` lacks a `slug` column, deriving URLs dynamically and risking broken links whenever a service title is edited.
- **Affected Files:**
  - `backend/prisma/schema.prisma`
  - `backend/src/controllers/services.controller.ts`
  - `frontend/app/(site)/services/[slug]/page.tsx`
- **Proposed Solution:**
  1. Add `slug String @unique` to `model Service` in Prisma schema.
  2. Generate a migration script with a backfill routine setting `slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))`.
  3. Update backend service controller to query by `prisma.service.findUnique({ where: { slug } })`.
- **Acceptance Criteria:** Every service record has an immutable, unique slug in the database.

---

### TASK-006: Point Empanelment Subdomain to Next.js App Router
- **Priority:** **P1**
- **Problem:** `https://empanelment.hindustanprojects.in` serves an obsolete standalone Vite SPA bundle while modern Next.js App Router code exists in `frontend/app/empanelment`.
- **Affected Systems:** Vercel Domain Configuration, DNS, `frontend/middleware.ts`
- **Proposed Solution:**
  1. Configure `empanelment.hindustanprojects.in` domain on Vercel to route to the Next.js application deployment.
  2. Verify `frontend/middleware.ts` detects the hostname and rewrites path to `/empanelment/*`.
- **Acceptance Criteria:** Accessing `https://empanelment.hindustanprojects.in` renders the unified Next.js App Router layout and UI.

---

### TASK-007: Fix HBS Hero Headline Typo in `HbsHero.tsx`
- **Priority:** **P1**
- **Problem:** Live HBS hero displays a double period: *"Repair. Protect. Maintain. .Build Better."*
- **Affected File:** `frontend/components/hbs/HbsHero.tsx` (Lines 104-107)
- **Proposed Solution:**
  Refactor string replacement logic to strip the phrase and surrounding punctuation:
  ```typescript
  line.replace(/\s*\.?Build Better\.?/i, '')
  ```
- **Acceptance Criteria:** Live HBS headline renders: *"Repair. Protect. Maintain. Build Better."*

---

### TASK-008: Persist Automail Quota & Dispatches in PostgreSQL
- **Priority:** **P1**
- **Problem:** Daily email sending quota is stored in memory and resets whenever Render restarts the backend container.
- **Affected File:** `backend/src/services/automail.service.ts`
- **Proposed Solution:** Create `AutomailDailyLog` table in Prisma to persist send timestamps and enforce the 200-email daily cap reliably.
- **Acceptance Criteria:** Daily sending quota survives backend server restarts without resetting to zero.

---

## 4. Phase 3: Technical SEO, AEO/GEO & Schema Hardening (P2)

### TASK-009: Add GeoCoordinates and Regional Polygons to `LocalBusiness` Schema
- **Priority:** **P2**
- **Proposed Solution:** Update `frontend/components/seo/JsonLd.tsx` to include exact latitude (`25.3463`), longitude (`74.6364`), and defined `areaServed` districts (Bhilwara, Chittorgarh, Rajsamand).
- **Acceptance Criteria:** Google Rich Results Test validates complete LocalBusiness schema without warnings.

---

### TASK-010: Implement `FAQPage` JSON-LD Structured Data
- **Priority:** **P2**
- **Proposed Solution:** Inject dynamic `FAQPage` schema on `/services/[slug]` pages using existing service FAQ arrays.
- **Acceptance Criteria:** Valid FAQPage schema detected on all service detail routes.

---

### TASK-011: Multi-Subdomain XML Sitemap Index
- **Priority:** **P2**
- **Proposed Solution:** Upgrade `frontend/app/sitemap.ts` to generate a sitemap index referencing both `www.hindustanprojects.in/sitemap-hipro.xml` and `hindbuilding.hindustanprojects.in/sitemap-hbs.xml`.
- **Acceptance Criteria:** Comprehensive sitemap covers all brands and passes Google Search Console validation.

---

## 5. Phase 4: Quality, Testing & CI/CD Governance (P2)

### TASK-012: Setup Vitest Unit Test Runner
- **Priority:** **P2**
- **Proposed Solution:** Install Vitest in `frontend/` and `backend/`. Add test scripts to `package.json` covering slug generation, canonical builders, and schema validators.
- **Acceptance Criteria:** `npm test` runs and passes across all packages.

---

### TASK-013: Configure GitHub Actions CI Workflow
- **Priority:** **P2**
- **Proposed Solution:** Create `.github/workflows/ci.yml` to automatically execute `npm run lint`, `npm run build`, and `npm test` on all Pull Requests targeting `main`.
- **Acceptance Criteria:** Pull requests display green passing checks prior to review.
