# HINDUSTAN PROJECTS (HiPRO) — MASTER PROJECT REPORT
**Document Reference:** `DOC-HIPRO-AUDIT-001`  
**Audit Date:** October 2026 (Local System Time: 2026-10-21)  
**Status:** Complete Read-Only Audit & Verification  
**Author/Auditor:** Antigravity AI Senior Technical Auditor  

---

## 1. Executive Summary

Hindustan Projects (HiPRO) is a premier architectural design, structural engineering, turnkey civil construction, and industrial infrastructure firm headquartered in Bhilwara, Rajasthan, India. The company operates a sophisticated multi-brand digital ecosystem encompassing:
1. **HiPRO Main Portal (`www.hindustanprojects.in`):** The primary corporate website showcasing architectural design, residential construction, commercial projects, industrial PEB infrastructure, interior design, estimating calculators, blogs, and corporate credentials.
2. **Hind Building Solutions / HiBUILD (`hindbuilding.hindustanprojects.in`):** A specialized sub-brand dedicated to advanced building chemical solutions, structural repair, waterproofing, concrete rehabilitation, retrofitting, and industrial coatings.
3. **Vendor & Contractor Empanelment Portal (`empanelment.hindustanprojects.in`):** An onboarding, compliance verification, and registration hub for trade contractors, material vendors, labor providers, and consulting specialists.
4. **HiPRO Multi-Console Admin CMS & Automail Engine (`/admin`):** A unified management backend featuring four distinct consoles (HiPRO Master Admin, HiBUILD CMS, Empanelment Hub, and SnapTech Digital partner link) coupled with a high-throughput, multi-brand email automation engine.

This comprehensive technical audit was executed in strict read-only mode to evaluate system architecture, data models, CMS integrity, public rendering, SEO/AEO/GEO readiness, deployment infrastructure, Git workflow, and security.

### Key Audit Findings Summary
- **Overall System Health:** The core architecture is modern, robust, and production-active. The system leverages Next.js 14.2 App Router with SSR/SSG on Vercel, an Express/TypeScript backend running on Render, PostgreSQL hosted on Neon Serverless, and Cloudinary for media assets.
- **Critical Issues Identified (P0/P1):**
  1. *Project Slug Corruption & Duplicate URLs:* Several project records in the database feature slugs with `projects-` or `/projects/` prepended (e.g., `projects-adani-gas-chamber-shinghpur`), generating malformed URLs, double slashes in canonical tags (`/projects//projects/...`), and 404/broken links in the sitemap.
  2. *Inadvertent Project De-indexing:* At least one live project in the database has `noIndex: true` set, causing Next.js to inject `<meta name="robots" content="noindex,nofollow" />` on a key portfolio page.
  3. *Empanelment Subdomain Routing Disconnect:* While the Next.js frontend contains a modern App Router implementation (`/empanelment`), the live DNS/Vercel configuration for `empanelment.hindustanprojects.in` currently points to an older standalone Vite SPA build.
  4. *HBS Hero Headline Typo:* A string manipulation defect in `HbsHero.tsx` renders a double period (`Repair. Protect. Maintain. .Build Better.`) on the live HBS homepage.
  5. *Unmanaged Database Schema Migrations:* The backend currently relies on `prisma db push` rather than tracked `prisma migrate` migration files, creating risk of schema drift.
  6. *Volatile Service Slugs:* The `Service` model lacks a dedicated `slug` database field; slugs are calculated on-the-fly from the service title. Modifying a title instantly changes its URL without automated 301 redirects.

---

## 2. Verified System Architecture

```
                    +-------------------------------------------------+
                    |               CLIENT WEB BROWSERS               |
                    +-------------------------------------------------+
                         |                      |                   |
                         v                      v                   v
           www.hindustanprojects.in   hindbuilding...      empanelment...
                         |                      |                   |
                         +----------------------+-------------------+
                                                |
                                                v
                               +---------------------------------+
                               |       VERCEL EDGE NETWORK       |
                               |  Next.js 14.2 App Router (SSR)  |
                               +---------------------------------+
                                       |                  |
                         (Proxy Rewrites to /api/*)       | (Asset URLs)
                                       v                  v
                      +-----------------------------+  +-----------------+
                      |     RENDER DOCKER SERVICE   |  |  CLOUDINARY CDN |
                      | Express 4.22 + TypeScript   |  |  Media & PDFs   |
                      +-----------------------------+  +-----------------+
                                       |
                         (Prisma 5.22 Connection Pool)
                                       v
                      +-----------------------------+
                      |   NEON SERVERLESS POSTGRES  |
                      |   ep-rapid-salad-azar0h0l   |
                      +-----------------------------+
```

### Infrastructure Summary
| Layer | Technology | Provider / Host | Live Target / Hostname |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 14.2.5, React 18.3, TailwindCSS | Vercel | `www.hindustanprojects.in` |
| **Sub-brand Frontend** | Next.js App Router (`/hbs`) | Vercel (Wildcard/Subdomain) | `hindbuilding.hindustanprojects.in` |
| **Portal Frontend** | Next.js (`/empanelment`) & Vite SPA | Vercel (Subdomain) | `empanelment.hindustanprojects.in` |
| **Backend API** | Node.js, Express 4.22, TypeScript, tsx | Render (Docker/Web Service) | `hipro-backend-749v.onrender.com` |
| **Database** | PostgreSQL 16 (Serverless, Pooling) | Neon Tech (AWS ap-southeast-1) | `neondb` (Pooled connection) |
| **Media Storage** | Cloudinary Image/File CDN | Cloudinary | `res.cloudinary.com/fczoredh/` |
| **Email Gateway** | NodeMailer / Hostinger SMTP | Hostinger Business Mail | `smtp.hostinger.com:465` |

---

## 3. Product Ecosystem & Implementation Status

| Component / Subsystem | Primary Route / Domain | Target Audience | Implementation Status | Verification Notes |
| :--- | :--- | :--- | :--- | :--- |
| **HiPRO Main Portal** | `https://www.hindustanprojects.in` | Commercial, industrial, and residential clients | **Implemented & Verified** | Next.js App Router live. SSR data fetching from Render API. |
| **HiPRO Services** | `/services`, `/services/[slug]` | Prospective builders, project owners | **Implemented & Verified** | 8 services active. Dynamic slugs derived from title. |
| **HiPRO Projects Portfolio** | `/projects`, `/projects/[slug]` | Corporate buyers, architects, clients | **Implemented with Defects** | 10 projects live. 2 projects have corrupted slugs (`projects-*`). |
| **HiPRO Estimator** | `/cost-estimator` | Residential & commercial cost inquiries | **Implemented & Verified** | Multi-step interactive calculator. Submits to backend DB. |
| **HiPRO Blog Engine** | `/blogs`, `/blogs/[slug]` | Organic search visitors, industry peers | **Implemented & Verified** | 15 published articles. Category filters and rich content. |
| **HiBUILD (HBS) Sub-brand** | `https://hindbuilding.hindustanprojects.in` | Contractors, engineers, waterproofing clients | **Implemented & Verified** | 19 services live. Distinct red/dark theme. Minor hero text bug. |
| **Empanelment Portal** | `https://empanelment.hindustanprojects.in` | Subcontractors, vendors, labor suppliers | **Partially Implemented** | Subdomain serves Vite SPA build; App Router code exists in repo. |
| **Master Admin Console** | `/admin` | Company executives, marketing team | **Implemented & Verified** | Protected by `adminSession` cookie. Manages all core content. |
| **HiBUILD CMS** | `/admin/hbs` | HBS brand managers | **Implemented & Verified** | Dedicated content singleton, services, projects, leads. |
| **Empanelment Admin** | `/admin/empanelment` | Vendor management & procurement | **Implemented (DATA-CRIT-01 Note)** | View registrations, download documents, review vendor tiers. Note: Bank/document field key mismatch caused silent data loss on submissions; resolved in hardening branch. |
| **Automail Multi-Brand Engine** | `/admin/automail` | Marketing & sales dispatchers | **Implemented & Verified** | Multi-brand corporate header/footer, daily limits, tracking. |

---

## 4. Priority Defect Matrix

The audit identified confirmed defects categorized under standard engineering priority tiers:

| Issue ID | Priority | Category | Component | Brief Description |
| :--- | :---: | :--- | :--- | :--- |
| **DEF-001** | **P0** | SEO / Database | Projects CMS & API | Corrupted project slugs containing `projects-` or `/projects/` causing 404s and malformed URLs. |
| **DEF-002** | **P0** | SEO / Frontend | `projects/[slug]/page.tsx` | Canonical URLs contain double slashes (`https://www.hindustanprojects.in/projects//projects/...`). |
| **DEF-003** | **P0** | SEO / Indexing | Database (`Project`) | Valid showcase project marked `noIndex: true` in production database, excluding it from search index. |
| **DEF-004** | **P0** | DevOps / DB | Prisma Schema | Zero migration history; database managed via `prisma db push`, risking schema drift and loss. |
| **DEF-005** | **P1** | Architecture | `Service` Model | `Service` table lacks a `slug` column; changing service title breaks external links and rankings. |
| **DEF-006** | **P1** | Deployment | Empanelment Portal | Live subdomain serves legacy Vite SPA build while modern Next.js App Router code sits idle in repo. |
| **DEF-007** | **P1** | UX / Brand | `HbsHero.tsx` | String replace logic creates double period `Repair. Protect. Maintain. .Build Better.` on HBS live site. |
| **DEF-008** | **P2** | Performance | Automail Engine | Quota tracking stored in memory (`Map<string, number>`) rather than database table, resetting on pod reboot. |
| **DEF-009** | **P2** | Quality / CI | Entire Repo | Absence of automated unit, integration, and E2E test suites (`npm test` missing in manifests). |
| **DEF-010** | **P2** | SEO / Geo | Core Services | Missing specific hyper-local landing pages for secondary Rajasthan industrial hubs (Chittorgarh, Bijolia). |

---

## 5. Top 10 Immediate Next Tasks

1. **TASK-001 (P0): Database Slug Sanitization & Project 301 Redirects**  
   Sanitize corrupted project slugs in PostgreSQL (stripping `projects-` and `/projects/`) and add Next.js permanent 301 redirects in `next.config.mjs` to prevent 404 errors for already-indexed links.
2. **TASK-002 (P0): Fix Canonical Double Slash in Project Template**  
   Refactor `frontend/app/(site)/projects/[slug]/page.tsx` metadata generator to ensure clean URL concatenation without double slashes.
3. **TASK-003 (P0): Clear `noIndex` Flag on Live Showcase Projects**  
   Review and update `noIndex` flag to `false` for valid completed portfolio projects in database.
4. **TASK-004 (P0): Transition Prisma Workflow from `db push` to `prisma migrate`**  
   Baseline the existing Neon database schema using `prisma migrate diff` and commit the initial migration file into version control.
5. **TASK-005 (P1): Add `slug` Field to `Service` Prisma Model**  
   Introduce a persisted, unique `slug` column to `model Service`, backfill from existing titles, and update admin controller to manage slugs explicitly.
6. **TASK-006 (P1): Fix HBS Hero Typo in `HbsHero.tsx`**  
   Update the string replacement logic in `HbsHero.tsx` to cleanly handle punctuation and avoid the double period defect.
7. **TASK-007 (P1): Align Empanelment Subdomain to Next.js App Router**  
   Configure Vercel domain routing to direct `empanelment.hindustanprojects.in` to the Next.js App Router deployment (`frontend/app/empanelment`) and retire the standalone Vite SPA.
8. **TASK-008 (P2): Persist Automail Quota & Dispatch Logs in PostgreSQL**  
   Migrate daily email quota counters from memory into a dedicated PostgreSQL table (`EmailQuotaLog`) to ensure resilience across Render dyno restarts.
9. **TASK-009 (P2): Deploy Comprehensive SEO & AEO Structured Data Schema**  
   Enhance `LocalBusiness`, `Organization`, and `Service` JSON-LD schemas to include explicit geocoordinates, service area polygons, and FAQPage schemas.
10. **TASK-010 (P2): Implement Automated Regression & Build Test Suite**  
    Create basic Jest/Vitest unit tests for slug generation, URL builders, and schema validators, integrating them into a GitHub Actions CI pipeline.

---

## 6. Audit Governance & Read-Only Confirmation

- **Codebase Integrity:** Zero source code files, configurations, database records, or environment settings were altered during this audit.
- **Git State:** Current branch is `feature/automail-corporate-header-footer` at commit `7a27285`. Working directory is clean.
- **Production Safety:** No database mutations, migrations, test leads, public form submissions, commits, or deployments were executed.
- **Handover Requirements:** All remediation must occur on isolated feature branches following explicit business owner approval.
