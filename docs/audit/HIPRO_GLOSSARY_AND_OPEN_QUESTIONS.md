# HINDUSTAN PROJECTS (HiPRO) — GLOSSARY AND OPEN QUESTIONS
**Document Reference:** `DOC-HIPRO-AUDIT-008`  
**Audit Date:** October 2026 (Local System Time: 2026-10-21)  
**Status:** Complete Read-Only Technical Audit  
**Author/Auditor:** Antigravity AI Senior Technical Auditor  

---

## 1. Project Glossary and System Concepts

| Term / Acronym | Definition & Context in HiPRO Ecosystem |
| :--- | :--- |
| **HiPRO** | *Hindustan Projects.* The flagship commercial entity specializing in architecture, civil construction, structural engineering, and turnkey project execution based in Bhilwara, Rajasthan. |
| **HBS / HiBUILD** | *Hind Building Solutions.* The specialized building chemicals, waterproofing, concrete repair, and structural rehabilitation sub-brand operating on `hindbuilding.hindustanprojects.in`. |
| **Empanelment Portal** | The vendor, subcontractor, and trade specialist registration platform located at `empanelment.hindustanprojects.in`. |
| **SnapTech Digital** | Strategic digital partner providing external enterprise console links for IT operations and digital marketing management. |
| **Automail Engine** | Custom multi-brand email automation platform integrated into `/admin/automail` featuring branded templates, merge fields, and rate-limited SMTP dispatching. |
| **PEB Structures** | *Pre-Engineered Buildings.* Steel infrastructure manufactured off-site and assembled on location for factories, textile mills, and warehouses. |
| **Turnkey Construction** | End-to-end project contracting where HiPRO manages architectural planning, structural design, permits, civil construction, interior finishing, and commissioning. |
| **AEO / GEO** | *Answer Engine Optimization / Generative Engine Optimization.* Optimizing structured data and factual citations to rank in AI search interfaces (ChatGPT Search, Perplexity, Google AI Overviews). |
| **Neon Serverless** | Cloud-native serverless PostgreSQL providing auto-scaling compute, connection pooling, and point-in-time recovery branches. |
| **Next.js Ingress Proxy** | The rewrite rule in `next.config.mjs` routing `/api/*` to the Render backend to prevent browser CORS and cross-domain cookie rejection. |
| **Prisma db push** | Command that pushes schema states directly to the database without generating tracked SQL migration files. |

---

## 2. Business-Owner Decisions Required

The following 10 strategic and technical questions require explicit decision and authorization from the business owner before remediation can begin:

### Decision 1: Project Slug Database Sanitization & 301 Redirect Scope
- **Context:** Multiple portfolio project slugs in the database contain `projects-` (e.g. `projects-adani-gas-chamber-shinghpur`).
- **Owner Decision Needed:** Do you authorize executing an automated database update to clean all existing project slugs, accompanied by permanent 301 redirects in `next.config.mjs` to preserve search ranking continuity?

### Decision 2: Clearance of `noIndex` Flag on Live Showcase Projects
- **Context:** At least one major client portfolio project (Adani Gas Chamber) is marked `noIndex: true` in the database, actively blocking it from Google Search.
- **Owner Decision Needed:** Should all completed client projects currently visible on the website be set to `noIndex: false` so that they appear in Google search results?

### Decision 3: Empanelment Subdomain Vercel Routing Migration
- **Context:** `https://empanelment.hindustanprojects.in` currently loads an older standalone Vite SPA build. A modern Next.js 14 App Router portal has been developed in `frontend/app/empanelment/` but is not receiving live traffic.
- **Owner Decision Needed:** Do you approve repointing the `empanelment.hindustanprojects.in` domain on Vercel to route traffic to the unified Next.js App Router codebase?

### Decision 4: Google Search Console & Business Profile Access
- **Context:** Search Console data and live impressions were inaccessible during this read-only audit.
- **Owner Decision Needed:** Can access be granted to Google Search Console and Google Business Profile, or will the owner provide CSV performance exports for organic query auditing?

### Decision 5: Service URL Slugs vs. Dynamic Derivation
- **Context:** Service URLs are calculated on-the-fly from the service title. Modifying a title in the CMS immediately breaks the URL.
- **Owner Decision Needed:** Do you approve adding an immutable, dedicated `slug` field to the `Service` database model to ensure permanent URL stability?

### Decision 6: Automail Sending Limits & Sender Address
- **Context:** Automail currently has a hard limit of 200 emails per day and 5 emails per minute sent via Hostinger SMTP (`smtp.hostinger.com`).
- **Owner Decision Needed:** Is the current 200 email/day limit sufficient for sales dispatches, and is Hostinger the approved permanent outbound gateway, or will an enterprise provider (SendGrid, Postmark) be adopted?

### Decision 7: HBS Cross-Linking & Brand Architecture
- **Context:** HBS operates as an isolated sub-brand on `hindbuilding.hindustanprojects.in`.
- **Owner Decision Needed:** How prominent should the cross-linking be between the main HiPRO corporate footer and the HBS portal? Should HBS have a featured banner on the main HiPRO homepage?

### Decision 8: Git Branch Promotion Strategy
- **Context:** The active feature branch `feature/automail-corporate-header-footer` is complete with clean working trees.
- **Owner Decision Needed:** Should this feature branch be merged into `main` after owner review, or should an intermediate `develop` branch be established for integration testing?

### Decision 9: Database Migration Baseline Execution
- **Context:** The database schema has evolved using `prisma db push`. Transitioning to `prisma migrate` requires a one-time baseline command against the Neon PostgreSQL production instance.
- **Owner Decision Needed:** Do you authorize establishing a migration baseline in a scheduled maintenance window?

### Decision 10: Geographic SEO Expansion
- **Context:** Current SEO targeting focuses predominantly on Bhilwara.
- **Owner Decision Needed:** Which secondary Rajasthan markets should be targeted next for landing page expansion (e.g., Chittorgarh, Rajsamand, Bijolia, Udaipur, Ajmer, Jaipur)?
