# HINDUSTAN PROJECTS (HiPRO) — MODULE AND CMS INVENTORY
**Document Reference:** `DOC-HIPRO-AUDIT-003`  
**Audit Date:** October 2026 (Local System Time: 2026-10-21)  
**Status:** Complete Read-Only Technical Audit  
**Author/Auditor:** Antigravity AI Senior Technical Auditor  

---

## 1. Executive Overview of Admin CMS Architecture

The Hindustan Projects administration environment is organized as a unified multi-console application accessed at `/admin`. Built with Next.js App Router and React 18, it features the `PortalSwitcherDropdown.tsx` component allowing instantaneous context switching between four dedicated brand and operational consoles:

1. **HiPRO Master Admin (Emerald Theme):** Complete content management for the flagship architectural, structural engineering, and construction firm.
2. **HiBUILD (HBS) CMS (Red Theme):** Brand-isolated content management for specialized building chemicals, waterproofing, and structural rehabilitation.
3. **Vendor Empanelment Hub (Amber Theme):** Contractor compliance, registration review, qualification auditing, and document management.
4. **SnapTech Digital Console:** Direct external administrative portal for technical and enterprise digital infrastructure.

All administrative routes are protected by server-side cookie verification (`adminSession`) issued via `/api/admin/login`.

---

## 2. Complete CMS Capability Matrix

| Module | Create | Read | Update | Delete | Publish Toggle | Media Upload | SEO Fields | Frontend Linked | Verification Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Hero Slider CMS** | Yes | Yes | Yes | Yes | Yes | Yes (Cloudinary) | No | Yes (`/`) | Implemented & Verified |
| **Services CMS** | Yes | Yes | Yes | Yes | Yes | Yes (Cloudinary) | Partial (Derived) | Yes (`/services`) | Implemented (Lacks explicit slug) |
| **Projects Showcase CMS**| Yes | Yes | Yes | Yes | Yes | Yes (Cloudinary) | Yes (Slug/NoIndex)| Yes (`/projects`)| Implemented (Slug defect noted) |
| **Blog Engine CMS** | Yes | Yes | Yes | Yes | Yes | Yes (Cloudinary) | Yes (Meta/Canonical)| Yes (`/blogs`) | Implemented & Verified |
| **About & Corporate Profile**| No (Single)| Yes | Yes | No | Yes | Yes (Cloudinary) | Partial | Yes (`/about`) | Implemented & Verified |
| **Testimonials CMS** | Yes | Yes | Yes | Yes | Yes | Yes (Cloudinary) | No | Yes (`/`, `/about`) | Implemented & Verified |
| **FAQs CMS** | Yes | Yes | Yes | Yes | Yes | No | No | Yes (`/services/*`) | Implemented & Verified |
| **Team Profiles CMS** | Yes | Yes | Yes | Yes | Yes | Yes (Cloudinary) | No | Yes (`/about`) | Implemented & Verified |
| **Careers & Openings** | Yes | Yes | Yes | Yes | Yes | No | Partial | Yes (`/careers`) | Implemented & Verified |
| **Contact Inquiries** | No (System)| Yes | Status | Yes | N/A | No | N/A | Ingests from `/contact`| Implemented & Verified |
| **Project Quotations** | No (System)| Yes | Status | Yes | N/A | No (Viewer only)| N/A | Ingests from `/quotations`| Implemented & Verified |
| **Cost Estimator Leads** | No (System)| Yes | Status | Yes | N/A | No | N/A | Ingests from `/cost-estimator`| Implemented & Verified |
| **Automail Campaigns** | Yes | Yes | Yes | Yes | Dispatched| Yes (Embedded) | N/A | Internal Mail Engine | Implemented & Verified |
| **HBS Content Singleton**| No (Single)| Yes | Yes | No | Yes | Yes (Cloudinary) | Partial | Yes (`hindbuilding...`) | Implemented (Hero bug noted) |
| **HBS Services CMS** | Yes | Yes | Yes | Yes | Yes | Yes (Cloudinary) | Partial | Yes (`hindbuilding...`) | Implemented & Verified |
| **HBS Projects CMS** | Yes | Yes | Yes | Yes | Yes | Yes (Cloudinary) | Partial | Yes (`hindbuilding...`) | Implemented & Verified |
| **HBS Testimonials CMS**| Yes | Yes | Yes | Yes | Yes | Yes (Cloudinary) | No | Yes (`hindbuilding...`) | Implemented & Verified |
| **HBS Inquiries / Leads**| No (System)| Yes | Status | Yes | N/A | No | N/A | Ingests from HBS forms| Implemented & Verified |
| **Empanelment Applications**| No (System)| Yes | Status | Yes | N/A | Yes (Doc viewer)| N/A | Ingests from `/empanelment/apply`| Implemented & Verified |

---

## 3. Module-by-Module Technical Inventory

### 3.1 Hero Slider CMS (`/admin/hero`)
- **Purpose:** Controls dynamic hero image banners, value propositions, badge highlights, and primary call-to-actions on the HiPRO homepage.
- **Editable Fields:** `title`, `subtitle`, `badge`, `ctaText`, `ctaLink`, `backgroundImage`, `order`, `isActive`.
- **Database Model:** `HeroSlide`.
- **API Endpoints:** `GET /api/hero` (public), `POST /api/hero` (admin), `PUT /api/hero/:id`, `DELETE /api/hero/:id`.
- **Media Behavior:** Cloudinary image upload directly integrated into the slide creator modal.
- **Frontend Consumer:** `frontend/components/home/HeroSlider.tsx`.

### 3.2 Services CMS (`/admin/services`)
- **Purpose:** Manages core architectural, structural engineering, industrial, and turnkey construction service offerings.
- **Editable Fields:** `title`, `description`, `shortDescription`, `features` (JSON string array), `icon`, `image`, `isPopular`, `order`, `categoryId`.
- **Database Model:** `Service` (relations to `ServiceCategory` and `Project`).
- **API Endpoints:** `GET /api/services` (public list), `GET /api/services/:slug` (public detail), `POST /api/services`, `PUT /api/services/:id`, `DELETE /api/services/:id`.
- **Identified Architecture Limitation:** `model Service` in `schema.prisma` does **not** contain an explicit `slug` column. The slug is generated dynamically at runtime (`cleanServiceTitle()`). Modifying a service's title alters its URL slug immediately without recording a 301 redirect.
- **Frontend Consumer:** `frontend/app/(site)/services/page.tsx` and `frontend/app/(site)/services/[slug]/page.tsx`.

### 3.3 Projects Showcase CMS (`/admin/projects`)
- **Purpose:** Curates completed and ongoing architectural, commercial, and industrial engineering projects.
- **Editable Fields:** `title`, `slug`, `client`, `location`, `category`, `year`, `area`, `scope`, `description`, `heroImage`, `galleryImages` (array of Cloudinary URLs), `featured` (Boolean), `noIndex` (Boolean), `serviceId`.
- **Database Model:** `Project`.
- **API Endpoints:** `GET /api/projects`, `GET /api/projects/:slug`, `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`.
- **Identified Defect:** Multiple project records in the database contain corrupted slugs with prepended `projects-` (e.g. `projects-adani-gas-chamber-shinghpur`), breaking SEO canonical URL generation and creating broken internal links.
- **Frontend Consumer:** `frontend/app/(site)/projects/page.tsx` and `frontend/app/(site)/projects/[slug]/page.tsx`.

### 3.4 Blog Publishing CMS (`/admin/blogs`)
- **Purpose:** Generates educational construction articles, architectural guides, and industry news for organic search acquisition.
- **Editable Fields:** `title`, `slug`, `excerpt`, `content` (Markdown/HTML), `coverImage`, `author`, `published` (Boolean), `publishedAt`, `categoryId`, `metaTitle`, `metaDescription`, `canonicalUrl`.
- **Database Model:** `Blog` (relates to `BlogCategory`).
- **API Endpoints:** `GET /api/blogs` (published list), `GET /api/blogs/all` (admin list), `GET /api/blogs/:slug`, `POST /api/blogs`, `PUT /api/blogs/:id`, `DELETE /api/blogs/:id`.
- **SEO & AEO Capabilities:** Fully supports custom meta titles, meta descriptions, canonical override URLs, and Article structured data.
- **Frontend Consumer:** `frontend/app/(site)/blogs/page.tsx` and `frontend/app/(site)/blogs/[slug]/page.tsx`.

### 3.5 Corporate Profile & About CMS (`/admin/about`)
- **Purpose:** Manages company history, founder statements, vision, mission, and live corporate statistics.
- **Editable Fields:** `title`, `story`, `vision`, `mission`, `experienceYears`, `completedProjects`, `teamMembers`, `satisfactionRate`, `milestones` (JSON).
- **Database Model:** `AboutPage` (Singleton pattern).
- **API Endpoints:** `GET /api/about`, `PUT /api/about`.
- **Frontend Consumer:** `frontend/app/(site)/about/page.tsx` and home page counter component.

### 3.6 Lead & Inquiries Management Consoles (`/admin/leads/*`)
Consolidates three distinct customer ingestion pipelines:
1. **General Contact Inquiries (`/admin/leads/contact`):** Ingests name, email, phone, subject, message, and submission timestamp from `/contact`. Statuses: `NEW`, `IN_REVIEW`, `CONTACTED`, `CLOSED`.
2. **Project Quotation Requests (`/admin/leads/quotes`):** Ingests comprehensive client RFPs from `/quotations`, including project type, estimated budget, square footage, site address, and uploaded architectural drawings.
3. **Cost Estimator Submissions (`/admin/leads/estimator`):** Ingests calculations from `/cost-estimator`, capturing construction type (Residential, Commercial, Industrial), quality tier, square footage, estimated price range, and client contact details.

### 3.7 Automail Multi-Brand Email Engine (`/admin/automail`)
- **Purpose:** Enterprise-grade direct marketing and transactional dispatch system.
- **Features:**
  - **Multi-Brand Switcher:** Supports official HiPRO corporate branding, HiBUILD branding, and Empanelment notices.
  - **Corporate Headers & Footers:** Features registered company address, CIN/registration details, corporate logos, and social links.
  - **Campaigns & Templates:** Rich HTML template builder with merge variables (`{{name}}`, `{{company}}`, `{{service}}`).
  - **Rate Limiting & Safety Quota:** Hard daily limit of 200 emails; rate-limited at 5 emails/minute to protect SMTP reputation.
  - **Recipient Management:** CSV import with automated column mapping, email syntax validation, and duplicate suppression.

### 3.8 HiBUILD (HBS) Dedicated CMS (`/admin/hbs`)
Operates under brand isolation with dedicated database models:
- **`HbsContent`:** Singleton record controlling hero titles, subtitles, technical advisory descriptions, contact hotline, and brand values.
- **`HbsService`:** 19 specialized chemical and rehabilitation service categories (e.g., Crystalline Waterproofing, Carbon Fiber Wrapping, Epoxy Grouting, Polyurethane Injection).
- **`HbsProject`:** Structural rehabilitation case studies detailing client, chemical compounds applied, before/after photography, and warranty terms.
- **`HbsLead`:** Specialized inquiry inbox capturing waterproofing site inspections and commercial rehabilitation RFPs.

### 3.9 Vendor Empanelment Administration (`/admin/empanelment`)
- **Purpose:** Procurement management dashboard for evaluating contractor applications submitted via `empanelment.hindustanprojects.in`.
- **Core Entities:** `VendorApplication`, `VendorDocument`.
- **Features:**
  - In-browser PDF/Image document viewer for inspecting GSTIN certificates, PAN cards, EPFO records, and past project completion certificates.
  - Application status workflow: `PENDING` -> `UNDER_SCRUTINY` -> `APPROVED` -> `REJECTED`.
  - Automated tier assignment: Class A (> 10 Crores), Class B (2 to 10 Crores), Class C (< 2 Crores).

---

## 4. CMS Field & Public Rendering Disconnects

During the code inspection, several discrepancies were verified between fields declared in Prisma schemas/CMS forms and their final rendering on the public website:

1. **Service SEO Metadata:** The CMS allows managing service descriptions, but there are no dedicated `metaTitle` or `metaDescription` fields in `model Service`. The public frontend falls back to standard template strings (`${service.title} | Hindustan Projects`).
2. **Project Tags:** The `Project` model contains a `scope` string, but the public project detail page renders a static fallback checklist if `scope` does not contain delimited items.
3. **Empanelment Portal Disconnect:** As detailed in later sections, changes made to Empanelment landing text in CMS or App Router code do not affect the live subdomain because the live domain serves a standalone Vite SPA bundle.
