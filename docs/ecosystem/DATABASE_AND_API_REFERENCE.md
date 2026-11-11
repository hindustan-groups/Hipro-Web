# Database & API Reference Manual

## 1. Architectural Overview

The Hindustan Projects monorepo ecosystem utilizes a unified database and API architecture serving all 4 core components and the Automail communications engine:
- **Database Engine:** PostgreSQL (hosted remotely via Neon / Supabase / Render PostgreSQL in production, and locally via Docker / local PostgreSQL during development).
- **Object-Relational Mapping (ORM):** Prisma ORM (`backend/prisma/schema.prisma`).
- **Backend Service:** Node.js with TypeScript and Express (`backend/src/`).
- **Database Safety Guard:** `backend/src/lib/databaseSafety.ts` enforcing strict loopback isolation for local environments.

---

## 2. Complete Prisma Schema Model Catalog (35 Models)

The data layer is partitioned into five functional domains comprising exactly **35 Prisma models**:

### A. HiPRO Corporate Core & Marketing (14 Models)
1. **`HeroSlide`**: Homepage carousel imagery, headlines, sub-headlines, primary/secondary CTA links, and display order.
2. **`Service`**: Corporate civil engineering and general contracting capabilities (`slug`, `title`, `description`, `icon`, `image`, `benefits`, `specifications`, `published`).
3. **`Project`**: Engineering portfolio records (`slug`, `title`, `category`, `client`, `location`, `area`, `cost`, `status`, `images`, `scope`, `completionDate`).
4. **`BlogPost`**: CMS articles (`slug`, `title`, `excerpt`, `content`, `coverImage`, `author`, `category`, `published`, `seoKeywords`).
5. **`Testimonial`**: Corporate client reviews and executive endorsements (`name`, `role`, `company`, `content`, `rating`, `image`, `published`).
6. **`TeamMember`**: Executive and technical leadership profiles (`name`, `role`, `department`, `bio`, `image`, `linkedin`, `order`).
7. **`CompanyStat` / `Stats`**: Aggregate corporate achievements (sq ft constructed, projects completed, active cities, engineering awards).
8. **`Guarantee`**: Formal service pledges (cost overrun guarantees, structural warranty periods, on-time handover commitments).
9. **`JobPosting`**: Open engineering, project management, and operational job requisitions (`title`, `department`, `location`, `type`, `experience`, `description`, `active`).
10. **`JobApplication`**: Candidate resumes and submissions (`jobId`, `fullName`, `email`, `phone`, `resumeUrl`, `coverLetter`, `status`).
11. **`ContactMessage`**: General corporate inquiries submitted via contact forms (`name`, `email`, `phone`, `subject`, `message`, `status`).
12. **`QuoteRequest`**: Client project quotation submissions (`name`, `email`, `phone`, `projectType`, `estimatedArea`, `budgetRange`, `location`, `notes`).
13. **`NewsletterSubscriber`**: Marketing audience email registrations (`email`, `status`, `subscribedAt`).
14. **`AboutPageContent`**: Rich company background, corporate history, mission, vision, and timeline content.

### B. Hind Building Solutions (HBS) (5 Models)
15. **`HbsContent`**: Sub-brand general CMS content, banners, guarantees, and verified corporate accreditations.
16. **`HbsService`**: Specialized structural repair, waterproofing, and rehabilitation service catalog (`slug`, `title`, `features`, `process`, `faqs`).
17. **`HbsProject`**: Repair case studies (`slug`, `title`, `category`, `client`, `scope`, `beforeImage`, `afterImage`).
18. **`HbsTestimonial`**: HBS client reviews and structural rehabilitation references.
19. **`HbsLead`**: Inbound repair inquiries (`name`, `phone`, `email`, `serviceInterest`, `propertyType`, `address`, `status`, `notes`).

### C. Vendor Empanelment & Site Gate Passes (8 Models)
20. **`VendorApplication`**: Contractor registration dossiers (`trackingId`, `companyName`, `applicantName`, `email`, `phone`, `gstin`, `pan`, `tier`, `category`, `status`, `currentStage`).
21. **`EmpanelmentTender`**: Procurement listings (`tenderNumber`, `title`, `category`, `estimatedCost`, `closingDate`, `status`, `documents`).
22. **`VendorBid`**: Contractor commercial proposals (`tenderId`, `vendorId`, `bidAmount`, `technicalDocUrl`, `commercialDocUrl`, `status`).
23. **`SiteGatePass`**: Jobsite access permits (`passCode`, `vendorId`, `projectId`, `visitorName`, `visitorType`, `vehicleNumber`, `validFrom`, `validUntil`, `status`).
24. **`VendorWorkOrder`**: Executed contractor contracts and project awards (`workOrderNumber`, `vendorId`, `contractValue`, `status`).
25. **`VendorInvoice`**: Contractor billing and milestone payment requests (`invoiceNumber`, `workOrderId`, `amount`, `status`).
26. **`EmpanelmentTicket`**: Contractor support tickets and technical queries (`ticketNumber`, `vendorId`, `subject`, `priority`, `status`).
27. **`EmpanelmentContent`**: Vendor portal guidelines, procurement policies, and document checklist specifications.

### D. Master Admin & Security (3 Models)
28. **`AdminUser`**: Administrative accounts (`email`, `passwordHash`, `name`, `role`, `permissions`, `active`).
29. **`AdminSession`**: Stateful sliding user sessions (`userId`, `expiresAt`, `createdAt`).
30. **`Settings`**: Global site settings, SEO defaults, maintenance switches, and analytics configuration.

### E. Automail Communications Engine (5 Models)
31. **`AutomailSetting`**: Mail server credentials and delivery method configuration (`smtpHost`, `smtpPort`, `smtpUser`, `smtpPass`, `apiToken`, `deliveryMethod`).
32. **`AutomailContact`**: Central recipient directory (`email`, `name`, `company`, `category`, `tags`, `unsubscribedAt`).
33. **`AutomailCampaign`**: Marketing and operational email campaigns (`title`, `subject`, `htmlContent`, `brand`, `status`, `scheduledAt`).
34. **`AutomailSendLog`**: Immutable dispatch audit log (`campaignId`, `recipientEmail`, `status`, `errorReason`, `messageId`, `sentAt`).
35. **`AutomailDailyStat`**: Daily delivery volume and quota tracking (`date`, `sentCount`, `bouncedCount`, `failedCount`).

---

## 3. Complete Express API Route Catalog (24 Route Files)

All API routes reside in `backend/src/routes/` and are mounted under `/api/`:

| Route File | Base Path | Key Endpoints | Auth / RBAC Guards | Functional Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| `about.ts` | `/api/about` | `GET /`, `PUT /` | Public read, `authGuard` write | Corporate narrative and timeline content. |
| `adminUsers.ts` | `/api/admin/users` | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id` | `adminGuard` (Super Admin) | Staff account creation and RBAC assignments. |
| `applications.ts` | `/api/careers` | `POST /apply`, `GET /admin/applications` | Public apply, `requirePermission("jobs")` | Job applications and resume intake. |
| `auth.ts` | `/api/auth` | `POST /login`, `POST /logout`, `GET /me` | Public login, `authGuard` for session check | Admin authentication & sliding session renewal. |
| `automail.ts` | `/api/automail` | `/settings`, `/contacts`, `/campaigns`, `/send` | `requirePermission("automail")` | Communications engine management & dispatch. |
| `blogs.ts` | `/api/blogs` | `GET /`, `GET /:slug`, `POST /`, `PATCH /:id` | Public read, `requirePermission("blogs")` | Blog articles and category taxonomy. |
| `contact.ts` | `/api/contact` | `POST /`, `GET /admin` | Public intake, `requirePermission("leads")` | General corporate inquiries. |
| `dashboard.ts` | `/api/admin/dashboard` | `GET /stats`, `GET /activity` | `authGuard` | Aggregate admin overview metrics. |
| `empanelment.ts` | `/api/empanelment` | `/apply`, `/track/:id`, `/gate-pass/*`, `/admin/*` | Public apply/track, `requirePermission("empanelment")` | Full vendor procurement and pass verification. |
| `guarantees.ts` | `/api/guarantees` | `GET /`, `POST /`, `PATCH /:id` | Public read, `authGuard` write | Corporate warranty and service pledges. |
| `hbs.ts` | `/api/hbs` | `/services`, `/projects`, `/leads`, `/admin/*` | Public read/lead, `requirePermission("hbs")` | HBS services, case studies, and repair inquiries. |
| `hero.ts` | `/api/hero` | `GET /slides`, `POST /slides`, `PATCH /:id` | Public read, `requirePermission("hero")` | Homepage hero banners and callouts. |
| `jobs.ts` | `/api/jobs` | `GET /`, `POST /`, `PATCH /:id` | Public read, `requirePermission("jobs")` | Career opportunities and requisitions. |
| `leads.ts` | `/api/leads` | `GET /`, `POST /`, `PATCH /:id` | `requirePermission("leads")` | High-value project inquiry tracking. |
| `locations.ts` | `/api/locations` | `GET /`, `PUT /` | Public read, `authGuard` write | Office coordinates and operational footprint. |
| `newsletter.ts` | `/api/newsletter` | `POST /subscribe`, `GET /admin` | Public subscribe, `authGuard` list | Newsletter audience management. |
| `projects.ts` | `/api/projects` | `GET /`, `GET /:slug`, `POST /`, `PATCH /:id` | Public read, `requirePermission("projects")` | Corporate engineering project portfolio. |
| `quote.ts` | `/api/quote` | `POST /`, `GET /admin` | Public quote, `requirePermission("leads")` | Construction quote requests. |
| `services.ts` | `/api/services` | `GET /`, `GET /:slug`, `POST /`, `PATCH /:id` | Public read, `requirePermission("services")` | Engineering service specifications. |
| `settings.ts` | `/api/settings` | `GET /`, `PATCH /` | Public read, `adminGuard` write | System metadata and configuration. |
| `stats.ts` | `/api/stats` | `GET /`, `PUT /` | Public read, `authGuard` write | Corporate achievement figures. |
| `team.ts` | `/api/team` | `GET /`, `POST /`, `PATCH /:id` | Public read, `authGuard` write | Executive leadership profiles. |
| `testimonials.ts`| `/api/testimonials` | `GET /`, `POST /`, `PATCH /:id` | Public read, `requirePermission("testimonials")`| Client reviews and endorsements. |
| `upload.ts` | `/api/upload` | `POST /image`, `POST /document` | `authGuard` | Asset storage and media upload handler. |

---

## 4. Database Safety Engine (`backend/src/lib/databaseSafety.ts`)

To eliminate the danger of accidental data overwrites or test execution against live infrastructure, the backend implements automated destination gating:

1. **Loopback Enforcement in Non-Production:**
   If `NODE_ENV !== "production"`, `DATABASE_URL` **must** resolve strictly to a loopback host:
   - `localhost`
   - `127.0.0.1`
   - `::1` or `[::1]`
   Any attempt to execute seed scripts or run tests against an external database hostname while in development mode throws an immediate fatal error.
2. **Production Seeding Gating:**
   Seeding against production is disabled by default. Authorizing a production migration/seed requires three explicit runtime flags:
   - `ALLOW_PRODUCTION_SEED=true`
   - `TARGET_DB_HOST_CONFIRMATION=<exact-hostname>`
   - `TARGET_DB_NAME_CONFIRMATION=<exact-dbname>`
3. **Zero Secret Logging:**
   Diagnostic output logs parsed hostnames and database names only; raw connection URLs and credentials are never written to logs or error messages.

