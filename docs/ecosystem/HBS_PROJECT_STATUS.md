# Hind Building Solutions (HBS) — Project Status & Technical Architecture

## 1. Executive Summary & Brand Identity

**Hind Building Solutions (HBS)** is the specialized building repair, structural rehabilitation, maintenance, and waterproofing arm of the Hindustan Projects ecosystem.

While the flagship **Hindustan Projects (HiPRO)** brand focuses on civil infrastructure, general contracting, institutional facilities, and large-scale EPC developments, HBS addresses residential, commercial, industrial, and institutional asset management:
- Structural repairs, micro-concreting, and retrofitting.
- Advanced elastomeric, bituminous, and crystalline waterproofing.
- Exterior façade rehabilitation and weatherproofing.
- End-to-end interior and architectural renovations.
- Facility annual maintenance contracts (AMCs).

HBS operates with dedicated public branding and subdomain routing (`hindbuilding.hindustanprojects.in`), but is fully integrated into the monorepo architecture, sharing the central database, Express API service, administrative RBAC cockpit, and the Automail communications system.

---

## 2. Domain & Routing Topology

### Subdomain Resolution
HBS requests are resolved via Next.js Edge Middleware (`frontend/middleware.ts`):
- **Production Host:** `hindbuilding.hindustanprojects.in` (and alias `hindbuilding.com` if routed).
- **Local Host:** `hindbuilding.localhost:3000`.
- **Internal Rewrite Target:** `app/hbs/*`.
- **Root URL Experience:** A user visiting `https://hindbuilding.hindustanprojects.in/` is internally rewritten to `app/hbs/page.tsx` without showing `/hbs` in the browser URL bar.
- **Direct Path Support:** Visiting `https://hindustanprojects.in/hbs` also serves the HBS interface directly.

### Host Isolation & Security
In accordance with system-wide host isolation rules:
- Any attempt to access `/admin` or `/admin-login` on `hindbuilding.hindustanprojects.in` is intercepted by Edge Middleware and 301-redirected to the canonical corporate origin: `https://www.hindustanprojects.in/admin`.
- Cookies (`admin_session`) and admin API endpoints are protected against cross-subdomain tampering.

---

## 3. Frontend Architecture (`frontend/app/hbs`)

### Page Structure & Routes
The HBS application is organized under `frontend/app/hbs`:

| URL Route | File Path | Purpose & Characteristics |
| :--- | :--- | :--- |
| `/` (via rewrite) / `/hbs` | `app/hbs/page.tsx` | HBS Home page: dynamic hero, service cards, methodology, verified stats, lead intake. |
| `/about` / `/hbs/about` | `app/hbs/about/page.tsx` | HBS corporate background, engineering certifications, structural repair expertise. |
| `/services` / `/hbs/services` | `app/hbs/services/page.tsx` | Interactive catalog of all repair, maintenance, and waterproofing services. |
| `/services/[slug]` | `app/hbs/services/[slug]/page.tsx` | Comprehensive service detail page with dynamic specifications, workflow, and FAQs. |
| `/projects` / `/hbs/projects` | `app/hbs/projects/page.tsx` | Portfolio of executed restoration, waterproofing, and retrofitting projects. |
| `/projects/[slug]` | `app/hbs/projects/[slug]/page.tsx` | Project case study with before/after documentation and engineering specifications. |
| `/why-choose-us` | `app/hbs/why-choose-us/page.tsx` | Value proposition: engineering guarantees, non-destructive testing (NDT), warranty. |
| `/contact` / `/hbs/contact` | `app/hbs/contact/page.tsx` | Direct consultation booking and emergency structural audit request form. |

### Layout & Component Hierarchy
- **`app/hbs/layout.tsx`**: Isolated HBS layout containing dedicated brand navigation (`HbsHeader`), sub-brand footer (`HbsFooter`), quick-call dialer, and WhatsApp consultation action.
- **`app/hbs/contact/HbsContactForm.tsx`**: Client-side lead capture form sending POST requests to `/api/hbs/leads` with client-side validation and rate limiting.

---

## 4. Claims & Compliance Remediation (PR #2 & PR #5D)

During early development, static marketing templates contained hardcoded claims regarding ISO certifications and blanket warranties. In PR #2 and PR #5D, strict compliance remediation was implemented:

1. **Removal of Unverified ISO Badges:**
   - Hardcoded ISO 9001:2015 and ISO 14001:2015 static claims were removed from HBS template files.
   - Any quality management claims are now sourced dynamically from `HbsContent` in the database, allowing management to publish verifiable credentials with accreditation numbers.
2. **Dynamic Warranty Management:**
   - Warranties (e.g., "Up to 10 Years Waterproofing Warranty") are strictly qualified by substrate condition, technical application, and manufacturer specification rather than blanket claims.
3. **Engineering Credentials & CPWD Capacity Standards:**
   - Marketing text aligns with the corporate CPWD Class 1 / Class A standards, ensuring tenders and commercial proposals maintain regulatory fidelity.

---

## 5. Backend API & Data Persistence (`backend/src/routes/hbs.ts`)

The HBS service is supported by 22 endpoints defined in `backend/src/routes/hbs.ts`:

### Public Endpoints
- `GET /api/hbs/content`: Retrieves general HBS page content, banners, guarantees, and contact metadata.
- `GET /api/hbs/services`: Returns published repair and maintenance services.
- `GET /api/hbs/services/:slug`: Returns granular service detail by unique URL slug.
- `GET /api/hbs/projects`: Returns published HBS project case studies.
- `GET /api/hbs/projects/:slug`: Returns detailed project record by slug.
- `GET /api/hbs/testimonials`: Returns client reviews and verified feedback.
- `POST /api/hbs/leads`: Captures inbound inquiries (enforces `contactLimiter` IP rate limiting).

### Protected Admin Endpoints (RBAC: `requirePermission("hbs")`)
- `PATCH /api/hbs/content`: Updates banner text, metadata, and dynamic claims.
- `POST /api/hbs/seed`: Seeds default HBS services and content (`adminGuard`).
- `POST /api/hbs/services`, `PATCH /api/hbs/services/:id`, `DELETE /api/hbs/services/:id`: Full CRUD for services.
- `POST /api/hbs/projects`, `PATCH /api/hbs/projects/:id`, `DELETE /api/hbs/projects/:id`: Full CRUD for projects.
- `POST /api/hbs/testimonials`, `PATCH /api/hbs/testimonials/:id`, `DELETE /api/hbs/testimonials/:id`: Full CRUD for reviews.
- `GET /api/hbs/leads`, `POST /api/hbs/leads/:id/notes`, `PATCH /api/hbs/leads/:id`, `DELETE /api/hbs/leads/:id`: Inbound lead management (RBAC: `requirePermission(["hbs", "leads"])`).

### Database Models (`backend/prisma/schema.prisma`)
1. **`HbsContent`**: Key-value JSON and text content for site sections, contact lines, and certifications.
2. **`HbsService`**: Service records (`slug`, `title`, `description`, `icon`, `features`, `benefits`, `process`, `faqs`, `published`).
3. **`HbsProject`**: Case study records (`slug`, `title`, `category`, `client`, `location`, `scope`, `beforeImage`, `afterImage`, `completionDate`).
4. **`HbsTestimonial`**: Verified feedback (`clientName`, `clientRole`, `organization`, `rating`, `comment`, `published`).
5. **`HbsLead`**: Inbound lead records (`name`, `phone`, `email`, `serviceInterest`, `propertyType`, `address`, `status`, `notes`).

---

## 6. Current Implementation Status vs. Pending Work

### Completed Work
- [x] Full responsive mobile-first UI for all 8 HBS page routes.
- [x] Subdomain rewriting and canonical URL routing via Edge Middleware.
- [x] Host isolation enforcement preventing admin access on HBS domain.
- [x] Complete REST API with granular RBAC permissions (`hbs`, `leads`).
- [x] Inbound lead intake with IP rate limiting and email notification triggers.
- [x] Removal of unverified static ISO claims; dynamic claims enabled via DB.
- [x] Master Admin CMS integration under `/admin/hbs`.

### Known Pending Work
- [ ] **Mobile Drawer Navigation Clearance:** On small mobile screens (< 360px width), the navigation drawer close button can experience slight overlap with the sticky call-to-action button.
- [ ] **High-Resolution Case Study Media:** Several project case studies use placeholder imagery pending final on-site photography uploads from the field engineering team.
- [ ] **Automated Bill of Quantities (BOQ) Estimator:** A specialized repair and waterproofing cost calculator (analogous to the main site estimator) is planned for future inclusion.

