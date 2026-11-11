# Master Admin & RBAC — System Architecture & Implementation Status

## 1. Executive Summary & Purpose

**Master Admin** is the centralized, unified administrative control panel and Content Management System (CMS) for the entire Hindustan Projects ecosystem. It governs:
1. **Corporate Website CMS:** Real-time publication and editing of Blogs, Projects, Services, Hero banners, Client Testimonials, Team profiles, and Guarantees.
2. **Hind Building Solutions (HBS) CMS:** Services, case studies, client reviews, dynamic claims, and inbound repair inquiries.
3. **Vendor Empanelment Management:** Contractor applications, CPWD capacity tiering, tender postings, vendor bid reviews, and site gate pass approvals.
4. **Automail Communications Engine:** Contact lists, broadcast campaigns, email templates, and delivery auditing.
5. **Role-Based Access Control (RBAC):** Admin and employee user management with granular per-module permission assignments.

The Master Admin application is housed within Next.js App Router under `frontend/app/admin/`, with authentication routes in `frontend/app/admin-login/` and backend API endpoints in `backend/src/routes/admin.ts` and `backend/src/routes/auth.ts`.

---

## 2. Authentication & Sliding Session Architecture

### Session Security Model
Master Admin employs a stateful, database-backed session model anchored by the `AdminSession` Prisma model and an HTTP-only browser cookie:
- **Cookie Identifier:** `admin_session`
- **Security Flags:**
  - `httpOnly: true` (Strict protection against client-side JavaScript / XSS access)
  - `secure: process.env.NODE_ENV === "production"` (Enforces HTTPS in production environments)
  - `sameSite: "lax"` (Mitigates Cross-Site Request Forgery while allowing smooth top-level navigation)
  - `path: "/"`
- **Password Security:** Passwords are hashed using Node.js native `crypto.scryptSync` with a cryptographically secure 16-byte salt (`randomBytes(16)`), stored in the format `salt:derivedKeyHex`. Verification uses constant-time comparison via `crypto.timingSafeEqual` to eliminate timing attacks.

### Sliding Window & Absolute Lifetime Rules
To balance user convenience with enterprise security, the session engine implements a dual-TTL sliding window (`backend/src/lib/auth.ts`):
1. **Sliding Window TTL (`SLIDING_SESSION_TTL_MS`):** 7 days (`604,800,000 ms`). Every authenticated request occurring when less than the renewal threshold remains automatically extends `expiresAt` by 7 days.
2. **Renewal Throttle Threshold (`RENEWAL_THRESHOLD_MS`):** 24 hours (`86,400,000 ms`). Prevents excessive database write operations by only updating `AdminSession.expiresAt` if remaining lifetime is below this threshold.
3. **Absolute Maximum Lifetime (`ABSOLUTE_MAX_SESSION_TTL_MS`):** 30 days (`2,592,000,000 ms`). Regardless of user activity, a session cannot be extended beyond 30 days from its original creation timestamp (derived reliably from Prisma CUID v1 timestamp prefix). Once this ceiling is reached, the user is required to re-authenticate.

### Two-Tier Authentication Verification
Authentication is enforced at two distinct boundaries:
1. **Edge Middleware Guard (`frontend/middleware.ts`):** Evaluates incoming requests to `/admin/*` before Server Components or SSR pages execute. If the `admin_session` cookie is absent, it redirects immediately to `/admin-login?from=<path>`.
2. **Backend API Guard (`backend/src/middleware/authGuard.ts`):** Every administrative API route executes `authGuard`, which extracts `admin_session`, queries Prisma `AdminSession`, verifies expiration, refreshes the sliding TTL if appropriate, and populates `req.user`. Requests missing or invalid sessions fail immediately with `401 Unauthorized`.

---

## 3. Role-Based Access Control (RBAC) Engine

### Role Hierarchy & Definitions
The ecosystem supports distinct administrative roles defined on the `AdminUser` model:
- **`admin` (Super Admin):** Full, unrestricted administrative authority across all modules, system settings, user creation, and database utilities.
- **`employee` (Staff / Module Specialist):** Restricted operational account strictly bound by an explicit array of assigned permissions.
- **Legacy / Historical Role Aliases:** `SUPER_ADMIN`, `MANAGER`, `EDITOR`, `VIEWER` (mapped safely to standard roles during session normalization).

### Safe Permission Parsing (`getUserPermissions`)
Permissions for employee accounts are stored in `AdminUser.permissions` (either as a Prisma native string array or a JSON-serialized string). The parser in `backend/src/middleware/authGuard.ts` guarantees fail-closed security:
- Null, undefined, malformed JSON, or non-array inputs immediately resolve to an empty permission array `[]`.
- Strings are trimmed and sanitized; empty strings or non-string values are stripped.
- The system evaluates authorization via `hasPermission(user, requiredPermission)`.

### Supported RBAC Permission Modules
Employees can be granted access to one or more discrete modules:
- `blogs`: Full blog publishing, editorial drafting, and category management.
- `projects`: HiPRO and civil infrastructure portfolio management.
- `services`: Corporate engineering services and specifications.
- `hero`: Homepage banners, callouts, and main visual carousel.
- `testimonials`: Client feedback and corporate endorsements.
- `about`: Leadership profiles, corporate history, and values.
- `empanelment`: Contractor empanelment, tenders, bids, and gate passes.
- `hbs`: Hind Building Solutions services, projects, dynamic claims, and leads.
- `leads`: Customer contact inquiries, quote requests, and consultation forms.
- `automail`: Email campaigns, subscriber contacts, and email templates.
- `users`: Staff account management (restricted to Super Admins by default).
- `settings`: System-wide settings and site metadata.

### API Enforcement (`requirePermission`)
Express route files enforce permissions declaratively:
```typescript
router.patch("/content", requirePermission("hbs"), async (req, res) => { ... });
router.get("/leads", requirePermission(["hbs", "leads"]), async (req, res) => { ... });
```
If an employee lacks the specified module permission, the middleware responds with `403 Forbidden` and a structured error payload `{ error: "Forbidden: Insufficient permissions" }`.

---

## 4. Admin Studio Directory & Module Inventory

The administrative interface (`frontend/app/admin`) comprises 27 specialized administrative sub-studios:

| Studio Directory | Interface Route | Associated Backend Routes | Managed Capabilities |
| :--- | :--- | :--- | :--- |
| `about/` | `/admin/about` | `/api/admin/about`, `/api/content` | Company narrative, corporate timeline, executive leadership. |
| `applications/` | `/admin/applications` | `/api/careers` | Job applicant submissions, resume links, candidate statuses. |
| `automail/` | `/admin/automail` | `/api/automail/*` | Broadcast campaigns, subscriber lists, delivery metrics. |
| `blogs/` | `/admin/blogs` | `/api/blogs` | Articles, slug generation, rich HTML body, SEO tags. |
| `blogs-hero/` | `/admin/blogs-hero` | `/api/admin/blogs-hero` | Top featured article banner and category highlights. |
| `contact-page/` | `/admin/contact-page` | `/api/admin/contact-page` | Office locations, emergency contact numbers, maps embed. |
| `contacts/` | `/admin/contacts` | `/api/contacts` | General corporate inquiries submitted via contact forms. |
| `cost-estimator/` | `/admin/cost-estimator` | `/api/admin/cost-estimator` | Construction cost multiplier matrix by city and tier. |
| `cta-management/`| `/admin/cta-management` | `/api/admin/cta` | Global call-to-action blocks across marketing pages. |
| `empanelment/` | `/admin/empanelment` | `/api/empanelment/*` | Vendor applications, CPWD tiers, bids, gate passes. |
| `hbs/` | `/admin/hbs` | `/api/hbs/*` | Hind Building Solutions services, case studies, leads. |
| `hero/` | `/admin/hero` | `/api/hero` | Main website hero carousel, headlines, and metrics. |
| `image-showcase/`| `/admin/image-showcase` | `/api/admin/showcase` | Interactive before/after engineering imagery grids. |
| `jobs/` | `/admin/jobs` | `/api/jobs` | Career openings, engineering job requisitions. |
| `leads/` | `/admin/leads` | `/api/leads` | High-value commercial and residential project leads. |
| `navigation/` | `/admin/navigation` | `/api/admin/navigation` | Header and footer link tree and menu hierarchy. |
| `newsletter/` | `/admin/newsletter` | `/api/newsletter` | Public newsletter subscribers and subscription statuses. |
| `projects/` | `/admin/projects` | `/api/projects` | Corporate engineering project portfolio. |
| `projects-hero/` | `/admin/projects-hero` | `/api/admin/projects-hero` | Portfolio showcase banners and featured highlights. |
| `quotes/` | `/admin/quotes` | `/api/quotes` | Detailed client quotation submissions and BOQ requests. |
| `services/` | `/admin/services` | `/api/services` | Corporate civil engineering services and technical specs. |
| `settings/` | `/admin/settings` | `/api/settings` | Site-wide metadata, tracking scripts, maintenance mode. |
| `snaptech/` | `/admin/snaptech` | `/api/snaptech` | Proprietary SnapTech construction methodology specs. |
| `stats/` | `/admin/stats` | `/api/stats` | Corporate achievement metrics (sq ft delivered, cities). |
| `team/` | `/admin/team` | `/api/team` | Executive management and engineering leadership profiles. |
| `testimonials/` | `/admin/testimonials` | `/api/testimonials` | Client reviews, testimonials, video interview embeds. |
| `users/` | `/admin/users` | `/api/admin/users` | Admin & employee user creation, passwords, permissions. |

---

## 5. Security Controls & Defensive Hardening

1. **Host Isolation Interception:**
   Edge middleware blocks any administrative request originating from secondary hostnames (`hindbuilding.hindustanprojects.in`, `empanelment.hindustanprojects.in`). Requests are 301-redirected to the primary corporate origin.
2. **Cache Prevention (`no-store`):**
   All administrative SSR routes and API responses emit `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`, preventing browser history or proxy caching of sensitive management data.
3. **Rate Limiting on Authentication:**
   Authentication endpoints enforce brute-force rate limits (`authLimiter`), preventing automated password guessing.
4. **Fail-Closed Authorization:**
   If a user record has missing permissions, malformed JSON, or an unverified session token, access is denied by default.

---

## 6. Completed Work vs. Pending Work

### Completed Work
- [x] Modern responsive Master Admin redesign with dedicated layout and sidebar navigation.
- [x] Sliding session management with 7-day active window and 30-day absolute ceiling.
- [x] CUID v1 timestamp derivation for tamper-proof session creation epoch tracking.
- [x] Robust, fail-closed RBAC engine supporting 12+ granular operational permissions.
- [x] 27 specialized administrative studios fully wired to backend CRUD APIs.
- [x] Edge middleware route protection for `/admin/*` and host isolation enforcement.

### Known Pending Work
- [ ] **Employee Portal Architecture (Future Scope):** An internal employee portal (leave requests, HR document access, project timesheets) is planned for future phases under Master Admin. It is not currently active and is strictly not a separate project.
- [ ] **Session Audit Log Table:** While active sessions are tracked in `AdminSession`, a persistent audit history log table (`AdminSessionAudit`) tracking login IPs, user-agent fingerprints, and logout events is recommended for enterprise compliance.

