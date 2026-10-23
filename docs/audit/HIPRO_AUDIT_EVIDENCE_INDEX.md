# HINDUSTAN PROJECTS (HiPRO) — AUDIT EVIDENCE INDEX
**Document Reference:** `DOC-HIPRO-AUDIT-009`  
**Audit Date:** October 2026 (Local System Time: 2026-10-21)  
**Status:** Complete Read-Only Technical Audit  
**Author/Auditor:** Antigravity AI Senior Technical Auditor  

---

## 1. Overview and Purpose

This document serves as the master traceability index linking every architectural claim, system status classification, and identified defect directly to concrete evidence within the codebase, database schema, live API responses, and public web pages.

---

## 2. Evidence Mapping by Technical Dimension

### 2.1 Git Repository & Version Control Evidence
| Item | Observed Value | Evidence Source |
| :--- | :--- | :--- |
| **Remote Origin** | `https://github.com/hindustan-groups/Hipro-Web` | `git remote -v` |
| **Active Branch** | `feature/automail-corporate-header-footer` | `git branch --show-current` |
| **Head Commit SHA** | `7a27285` (`feat(automail): implement official corporate header and footer across all email dispatches`) | `git log -1 --oneline` |
| **Production Head** | `18c69d8` (`fix(typography): unify Hind Build mobile fonts with desktop...`) | `git rev-parse origin/main` |
| **Working Tree** | Clean (`nothing to commit, working tree clean`) | `git status` |

---

### 2.2 Framework & Dependency Manifest Evidence
| Component | Declared Version / Setting | File Location |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js `14.2.5`, React `18.3.1` | [`frontend/package.json`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/frontend/package.json) |
| **Styling & Icons** | TailwindCSS `3.4.10`, Lucide React `0.428.0` | [`frontend/package.json`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/frontend/package.json) |
| **Backend Runtime** | Express `4.22.2`, TypeScript `5.6.0`, tsx | [`backend/package.json`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/backend/package.json) |
| **ORM & Database** | Prisma Client `5.22.0`, PostgreSQL | [`backend/package.json`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/backend/package.json) |
| **Database Synchronization** | `"db:push": "prisma db push"` (No migration scripts) | [`backend/package.json`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/backend/package.json) |

---

### 2.3 Live Production Ingress & API Probing Evidence
| Endpoint / URL | Response Status & Key Payload Observed | Verification Method |
| :--- | :--- | :--- |
| `https://www.hindustanprojects.in/` | HTTP 200 OK. Renders Next.js 14 App Router HTML, Montserrat fonts, and complete JSON-LD structured data. | Live HTTP GET Probe |
| `https://hindbuilding.hindustanprojects.in/` | HTTP 200 OK. Renders HBS sub-brand with HiBUILD red theme, 19 chemical services, and distinct navigation. | Live HTTP GET Probe |
| `https://empanelment.hindustanprojects.in/` | HTTP 200 OK. Serves standalone Vite SPA bundle (`/assets/index-CwasgwSq.js`) rather than Next.js App Router. | Live HTTP GET Probe |
| `https://hipro-backend-749v.onrender.com/health` | HTTP 200 OK: `{"status":"ok","uptime":24500,...}` | Live HTTP GET Probe |
| `https://www.hindustanprojects.in/api/services` | HTTP 200 OK. Returns 8 active services via Next.js proxy rewrite to Render backend. | Live HTTP GET Probe |
| `https://www.hindustanprojects.in/api/projects` | HTTP 200 OK. Returns 10 projects. Confirms presence of corrupted slugs. | Live HTTP GET Probe |
| `https://www.hindustanprojects.in/api/blogs` | HTTP 200 OK. Returns 15 published industry articles. | Live HTTP GET Probe |
| `https://www.hindustanprojects.in/sitemap.xml` | HTTP 200 OK. Returns generated XML sitemap containing corrupted project URLs. | Live HTTP GET Probe |

---

### 2.4 Defect Traceability Index

#### DEF-001 & DEF-002: Project Slug Corruption & Double Slash Canonicals
- **Source Code Locations:**
  - Database schema: [`backend/prisma/schema.prisma`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/backend/prisma/schema.prisma#L80-L115) (`model Project`)
  - Canonical generator: [`frontend/app/(site)/projects/[slug]/page.tsx`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/frontend/app/(site)/projects/[slug]/page.tsx#L15-L45)
  - Sitemap generator: [`frontend/app/sitemap.ts`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/frontend/app/sitemap.ts#L30-L55)
- **Live Evidence Output:**
  ```html
  <!-- Observed on https://www.hindustanprojects.in/sitemap.xml -->
  <url>
    <loc>https://www.hindustanprojects.in/projects/projects-adani-gas-chamber-shinghpur</loc>
  </url>
  
  <!-- Observed on https://www.hindustanprojects.in/projects/projects-adani-gas-chamber-shinghpur -->
  <link rel="canonical" href="https://www.hindustanprojects.in/projects//projects/adani-gas-chamber-shinghpur" />
  ```

#### DEF-003: Project Inadvertently Marked `noIndex: true`
- **Source Code Location:**
  - Prisma model: [`backend/prisma/schema.prisma`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/backend/prisma/schema.prisma#L102) (`noIndex Boolean @default(false)`)
- **Live Evidence Output:**
  API response for Adani Gas Chamber project includes `"noIndex": true`, triggering:
  ```html
  <meta name="robots" content="noindex,nofollow" />
  ```

#### DEF-005: `Service` Model Lacks Explicit `slug` Column
- **Source Code Locations:**
  - Prisma schema: [`backend/prisma/schema.prisma`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/backend/prisma/schema.prisma#L35-L65) (`model Service` lacks `slug` property).
  - Slug generation utility: [`frontend/lib/services.ts`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/frontend/lib/services.ts#L10-L25) (`cleanServiceTitle()`, `getServiceSlug()`).

#### DEF-006: Empanelment Subdomain Routing Mismatch
- **Source Code Location:**
  - Middleware rewrite: [`frontend/middleware.ts`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/frontend/middleware.ts#L15-L35)
  - Modern implementation: [`frontend/app/empanelment/page.tsx`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/frontend/app/empanelment/page.tsx)
  - Legacy build location: [`scratch/empanelment-portal/`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/scratch/empanelment-portal/)

#### DEF-007: HBS Hero Headline Double Period Typo
- **Source Code Location:**
  - Component file: [`frontend/components/hbs/HbsHero.tsx`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/frontend/components/hbs/HbsHero.tsx#L104-L107)
- **Live Evidence Output:**
  Inspecting DOM on `https://hindbuilding.hindustanprojects.in/`:
  ```html
  <p class="text-sm font-semibold tracking-wider text-red-500 uppercase">
    Repair. Protect. Maintain. .Build Better.
  </p>
  ```

#### DEF-008: Automail Daily Quota In-Memory Storage
- **Source Code Location:**
  - Service file: [`backend/src/services/automail.service.ts`](file:///d:/HindustanProjects/Hipro-Website/Hipro-Web/backend/src/services/automail.service.ts#L45-L60) (`private dailyQuotaMap = new Map<string, number>()`).
