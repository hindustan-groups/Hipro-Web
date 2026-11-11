# BATCH 2B — INDEPENDENT SECURITY REVIEW REPORT (READ-ONLY)
**Audit Type:** Independent Code & Architecture Security Review  
**Date:** November 9, 2026  
**Target Repository:** Hindustan Projects Monorepo  
**Worktree:** `D:\HindustanProjects\Hipro-Website\Hipro-Batch2B`  
**Branch:** `feature/batch2b-master-admin-rbac`  
**Base Commit:** `da1174182d1cb1f6386b698090c36c96848d0f29` + Batch 1 + Batch 2A baseline  

---

## 1. Executive Verdict

### **Verdict: APPROVED WITH CONDITIONS**

The Batch 2B Master Admin Role-Based Access Control (RBAC) implementation successfully establishes least-privilege backend authorization across the Master Admin API. Legitimate staff members (`role: "employee"`) can now manage their assigned modules without false-negative `adminGuard` rejections, and unauthorized staff members cannot access or mutate unassigned modules via direct API calls.

Approval is granted subject to resolving **one Medium-severity finding** (an unauthenticated body-based deletion path in legacy `DELETE /api/newsletter`) and **two Low-severity consistency items** prior to final integration into `Hipro-Main`.

---

## 2. Files Reviewed

The following files within `D:\HindustanProjects\Hipro-Website\Hipro-Batch2B` were independently inspected line-by-line:

### Core Middleware & Libraries
1. `backend/src/middleware/authGuard.ts` — Core permission parser, role checker, `authGuard`, `adminGuard`, and `requirePermission` middleware factory.
2. `backend/src/lib/auth.ts` — Session lifecycle, sliding renewal, 30-day absolute ceiling, and CUID timestamp extraction.
3. `backend/src/index.ts` — API route mounting, middleware chain, and CORS/cookie-parser configuration.
4. `backend/prisma/schema.prisma` — Data models for `AdminUser` and `AdminSession`.

### Route Modules (All 21 Mounted Routes)
5. `backend/src/routes/adminUsers.ts` — Super Admin staff management and session invalidation.
6. `backend/src/routes/settings.ts` — Global site settings (Super Admin ONLY).
7. `backend/src/routes/upload.ts` — Image uploads and file validation.
8. `backend/src/routes/blogs.ts` — Blog CMS operations.
9. `backend/src/routes/about.ts` — About page CMS mutations.
10. `backend/src/routes/projects.ts` — Project catalog and portfolio mutations.
11. `backend/src/routes/services.ts` — Service catalog mutations.
12. `backend/src/routes/leads.ts` — Unified CRM leads hub.
13. `backend/src/routes/contact.ts` — Client contact inquiries.
14. `backend/src/routes/quote.ts` — Quote requests and estimator leads.
15. `backend/src/routes/applications.ts` — Job applications.
16. `backend/src/routes/newsletter.ts` — Newsletter subscriber management and public unsubscribe.
17. `backend/src/routes/team.ts` — Team member management.
18. `backend/src/routes/testimonials.ts` — Client review moderation.
19. `backend/src/routes/hero.ts` — Hero slider management.
20. `backend/src/routes/jobs.ts` — Careers and job postings.
21. `backend/src/routes/stats.ts` — Company metrics and KPI counters.
22. `backend/src/routes/guarantees.ts` — Service guarantee badges.
23. `backend/src/routes/hbs.ts` — Hind Building Solutions portal CMS, leads, and seed.
24. `backend/src/routes/empanelment.ts` — Contractor empanelment admin routes.
25. `backend/src/routes/automail.ts` — AutoMail email campaign studio.
26. `backend/src/routes/dashboard.ts` — Summary statistics overview.
27. `backend/src/routes/locations.ts` — States/districts public helper.

### Frontend Consistency
28. `frontend/app/admin/users/page.tsx` — Permission checkbox configuration in staff management.
29. `frontend/components/admin/AdminAccessWrapper.tsx` — Frontend route access wrapper.
30. `frontend/components/admin/AdminSidebar.tsx` — Admin navigation visibility logic.

### Test Suites
31. `backend/src/scripts/test_rbac_authorization.ts` — RBAC automated test suite.
32. `backend/src/scripts/test_sliding_session.ts` — Sliding session concurrency test suite.

---

## 3. Route-by-Route Authorization Matrix

The table below outlines every mounted route module, its HTTP methods, applied guard middleware, required permissions, and independent verification verdict:

| Route Path | Method(s) | Middleware / Guard | Required Permission | Access Control Rule | Verdict |
| :--- | :---: | :---: | :---: | :--- | :---: |
| `/api/auth/login` | POST | `authLoginLimiter` | None | Public login (Rate-limited: 5 req/min) | VERIFIED |
| `/api/auth/logout` | POST | None | None | Deletes session token & clears cookie | VERIFIED |
| `/api/auth/me` | GET | `getSessionUser` | Active Session | Returns authenticated user profile | VERIFIED |
| `/api/admin-users` | GET, POST | `adminGuard` | Super Admin (`role: admin`) | Staff account management | VERIFIED |
| `/api/admin-users/:id` | DELETE | `adminGuard` | Super Admin (`role: admin`) | Staff deletion & session purge | VERIFIED |
| `/api/settings` | GET | None (Internal check) | None (Public safe / Admin full) | Public gets safe fields; admin gets full | VERIFIED |
| `/api/settings` | PATCH | `adminGuard` | Super Admin (`role: admin`) | Global site configuration | VERIFIED |
| `/api/upload` | POST | `requirePermission(...)` | `["upload", "projects", "blogs", ...]` | Content staff & upload permission | VERIFIED |
| `/api/blogs` | GET, GET `/:slug` | None | None | Public blog reading | VERIFIED |
| `/api/blogs` | POST, PATCH, DEL | `requirePermission("blogs")` | `blogs` | Blog CMS management | VERIFIED |
| `/api/about` | GET | None | None | Public about page content | VERIFIED |
| `/api/about` | PUT, PATCH | `requirePermission("about")` | `about` | About page content mutations | VERIFIED |
| `/api/projects` | GET, GET `/:slugOrId`| None | None | Public project portfolio reading | VERIFIED |
| `/api/projects` | POST, PATCH, DEL | `requirePermission("projects")` | `projects` | Project catalog mutations | VERIFIED |
| `/api/services` | GET, GET `/:id` | None | None | Public service catalog reading | VERIFIED |
| `/api/services` | POST, PATCH, DEL | `requirePermission("services")` | `services` | Service catalog mutations | VERIFIED |
| `/api/leads` | ALL (Router) | `requirePermission("leads")` | `leads` | Unified leads hub read/mutate | VERIFIED |
| `/api/contact` | POST | `contactLimiter` | None | Public inquiry form submission | VERIFIED |
| `/api/contact` | GET, PATCH, DEL | `requirePermission("contacts")`| `contacts` | Inquiry message management | VERIFIED |
| `/api/quote` | POST | `quoteLimiter` | None | Public quote request submission | VERIFIED |
| `/api/quote` | GET, PATCH, DEL | `requirePermission("quotes")` | `quotes` | Quote request management | VERIFIED |
| `/api/applications` | POST | None | None | Public job application submission | VERIFIED |
| `/api/applications` | GET, PATCH, DEL | `requirePermission("applications")` | `applications` | Job application management | VERIFIED |
| `/api/newsletter` | POST | None | None | Public newsletter subscription | VERIFIED |
| `/api/newsletter` | GET, DEL `/:id` | `requirePermission("newsletter")` | `newsletter` | Subscriber list & deletion by ID | VERIFIED |
| `/api/newsletter` | DELETE `/` | None (Legacy) | **NONE (VULNERABLE)** | Unsubscribe by email or delete by ID | **FINDING** |
| `/api/team` | GET | None | None | Public team directory reading | VERIFIED |
| `/api/team` | POST, PATCH, DEL | `requirePermission("team")` | `team` | Team member management | VERIFIED |
| `/api/testimonials` | GET, POST | None | None | Public view & client review submit | VERIFIED |
| `/api/testimonials` | PATCH, DEL | `requirePermission("testimonials")`| `testimonials` | Review moderation & deletion | VERIFIED |
| `/api/hero` | GET | None | None | Public hero slide reading | VERIFIED |
| `/api/hero` | POST, PATCH, DEL | `requirePermission("hero")` | `hero` | Hero slider mutations | VERIFIED |
| `/api/jobs` | GET | None | None | Public career postings reading | VERIFIED |
| `/api/jobs` | POST, PATCH, DEL | `requirePermission("jobs")` | `jobs` | Job postings mutations | VERIFIED |
| `/api/stats` | GET | None | None | Public KPI stats reading | VERIFIED |
| `/api/stats` | PATCH | `requirePermission("stats")` | `stats` | KPI counter mutations | VERIFIED |
| `/api/guarantees` | GET | None | None | Public guarantees badges reading | VERIFIED |
| `/api/guarantees` | POST, PATCH, DEL | `requirePermission(...)` | `["guarantees", "about", "settings"]` | Guarantee badge mutations | VERIFIED |
| `/api/hbs/content` | GET | None | None | Public HBS content reading | VERIFIED |
| `/api/hbs/content` | PATCH | `requirePermission("hbs")` | `hbs` | HBS content mutations | VERIFIED |
| `/api/hbs/seed` | POST | `adminGuard` | Super Admin (`role: admin`) | Production HBS database seed | VERIFIED |
| `/api/hbs/services`| GET, POST, PATCH, DEL | `requirePermission("hbs")` | `hbs` (Reads public, writes guarded) | HBS service catalog | VERIFIED |
| `/api/hbs/projects`| GET, POST, PATCH, DEL | `requirePermission("hbs")` | `hbs` (Reads public, writes guarded) | HBS project showcase | VERIFIED |
| `/api/hbs/testimonials`| GET, POST, PATCH, DEL | `requirePermission("hbs")` | `hbs` (Reads public, writes guarded) | HBS client testimonials | VERIFIED |
| `/api/hbs/leads` | POST | `contactLimiter` | None | Public HBS inquiry submission | VERIFIED |
| `/api/hbs/leads` | GET, POST, PATCH, DEL | `requirePermission(["hbs", "leads"])` | `hbs` OR `leads` | HBS lead pipeline & notes | VERIFIED |
| `/api/empanelment/admin/*` | ALL | `requirePermission("empanelment")` | `empanelment` | Empanelment administration | VERIFIED |
| `/api/automail` | ALL (Router) | `requirePermission("automail")` | `automail` | AutoMail campaigns, settings, contacts | VERIFIED |
| `/api/dashboard` | GET | `authGuard` | Authenticated (Any role) | Summary statistics overview | VERIFIED |
| `/api/locations` | GET | None | None | Public state/district lookup | VERIFIED |

---

## 4. Security Findings & Detailed Analysis

### Finding SEC-B2B-01 (Medium Severity)
**Unauthenticated Record Deletion via Legacy `DELETE /api/newsletter` with Body `{ id }`**
- **File:** `backend/src/routes/newsletter.ts`
- **Lines:** 98–131
- **Vulnerability Description:**
  While `DELETE /api/newsletter/:id` is properly guarded with `requirePermission("newsletter")`, the unparameterized route `DELETE /api/newsletter` was originally created as a dual-purpose endpoint for unsubscribing by email or deleting by ID. Lines 101–109 check:
  ```typescript
  const { email, id } = req.body;
  if (id) {
    const { deleteOne } = await import("../lib/db");
    const ok = await deleteOne("newsletter", id as string);
    ...
  }
  ```
  Because this handler has no middleware guard, any unauthenticated caller (or unauthorized employee) who knows or guesses a subscriber record ID can permanently delete that record from the database.
- **Impact:** Unauthorized loss of newsletter subscriber records without authentication or permission checks.
- **Required Fix:** In `backend/src/routes/newsletter.ts`, remove lines 102–109 from `router.delete("/", ...)`. Route all administrative record deletions strictly to `DELETE /:id` (guarded by `requirePermission("newsletter")`), leaving `DELETE /` exclusively as a public unsubscribe endpoint that sets `active = false` via `{ email }`.

---

### Finding SEC-B2B-02 (Low Severity / Consistency)
**Inconsistent Permission Options in Frontend Staff Management UI**
- **File:** `frontend/app/admin/users/page.tsx`
- **Lines:** 20–41 (`availableSections`)
- **Description:**
  1. The form lists `{ key: "settings", label: "Site Settings" }`. However, `PATCH /api/settings` is strictly restricted to Super Admin (`adminGuard`). If an administrator checks "Site Settings" for an employee, the employee will receive HTTP 403 Forbidden when attempting to save settings.
  2. The form omits `hbs`, `empanelment`, `automail`, and explicit `upload`. Staff members cannot be assigned permissions for these venture portals through the UI without manual database updates.
- **Impact:** Administrative confusion regarding available employee privileges.
- **Required Fix:** Remove `settings` from `availableSections` (or mark it as Super Admin only) and add options for `hbs` ("HBS Portal CMS"), `empanelment` ("Vendor Empanelment"), and `automail` ("AutoMail Studio").

---

### Finding SEC-B2B-03 (Low Severity / UI Route Alignment)
**Overly Broad Navigation Access Checks in Frontend Shell**
- **File:** `frontend/components/admin/AdminAccessWrapper.tsx` (lines 99–109) and `frontend/components/admin/AdminSidebar.tsx` (lines 278–288)
- **Description:**
  `AdminAccessWrapper` and `AdminSidebar` check whether a user has `contacts`, `quotes`, or `applications` to permit access to the `/admin/leads` UI page. However, backend route `/api/leads` strictly requires `requirePermission("leads")`. As a result, an employee with only `quotes` can view the frontend leads page shell, but every API fetch to `/api/leads` fails with HTTP 403 Forbidden.
- **Impact:** Degraded user experience: staff members are presented with sidebar links to pages where all underlying data fetches fail. Backend security correctly holds the line, but frontend navigation rules should mirror backend permissions.
- **Required Fix:** Align `AdminAccessWrapper.tsx` and `AdminSidebar.tsx` to require `userPermissions.includes("leads")` for the Leads Hub and `userPermissions.includes("automail")` for AutoMail.

---

### Finding SEC-B2B-04 (Low Severity / Defense-in-Depth)
**Missing Super Admin Deletion Protection Guard in Staff Management**
- **File:** `backend/src/routes/adminUsers.ts`
- **Lines:** 71–88 (`DELETE /:id`)
- **Description:**
  `DELETE /api/admin-users/:id` checks `currentUser.id === id` to prevent self-deletion, but does not verify whether the target user being deleted possesses `role === "admin"`. If a second Super Admin account exists, it could be deleted without an explicit confirmation or protection check.
- **Impact:** Accidental deletion of Super Admin accounts by other Super Admins.
- **Required Fix:** Add a check `if (targetUser.role === "admin")` to prevent deleting admin accounts via staff deletion endpoints, or require explicit confirmation.

---

## 5. Review Areas Assessment

### A. Core Authorization (`authGuard.ts`)
- `getUserPermissions()` safely handles null, undefined, malformed JSON, and non-array structures. Fails closed (`[]`) under all invalid inputs.
- `hasPermission()` strictly restricts unrestricted access to `role === "admin"`. `role === "employee"` is evaluated strictly against user permissions. All other roles fail closed.
- `requirePermission()` correctly executes `authGuard(req, res, ...)`, preserving session renewal and cookie propagation.
- Unauthenticated requests receive HTTP 401; authenticated but unauthorized requests receive HTTP 403 with descriptive error payloads.

### B. Route-by-Route Authorization
- All 21 backend route modules were audited.
- Mutation routes across content modules (`blogs`, `about`, `projects`, `services`, `team`, `testimonials`, `hero`, `jobs`, `stats`, `guarantees`) strictly require their respective module permissions.
- Public read endpoints remain accessible to site visitors.

### C. Super Admin Restrictions
- Strictly restricted to `role === "admin"`:
  - `/api/admin-users/*` (guarded at router level with `adminGuard`).
  - `PATCH /api/settings` (guarded with `adminGuard`).
  - `POST /api/hbs/seed` (guarded with `adminGuard`).
- No alternate or unprotected routes bypass these restrictions.

### D. CRM Module Isolation
- Strict boundary isolation is enforced:
  - Staff with `quotes` cannot access `/api/leads` (403), `/api/contact` (403), `/api/applications` (403), or `/api/newsletter` (403).
  - Staff with `leads` cannot access `/api/quote` (403) or `/api/contact` (403).
  - Tested and verified in Section 7 of `test_rbac_authorization.ts`.

### E. Upload Security
- `POST /api/upload` is guarded by `requirePermission(["upload", "projects", "blogs", "services", "about", "team", "testimonials", "hero", "hbs"])`.
- CRM-only staff (`leads`, `contacts`, `quotes`) and staff with empty permissions receive HTTP 403 Forbidden.
- 5MB file limit, extension whitelist, MIME matching, magic bytes validation, and directory traversal sanitization (`..` stripping) remain fully operational.

### F. Staff Deletion and Session Invalidation
- Deleting a staff account calls `prisma.adminSession.deleteMany({ where: { userId: id } })`.
- Active session tokens are purged; subsequent requests immediately return HTTP 401 Unauthorized.
- Tested and verified in Section 9 of `test_rbac_authorization.ts`.

### G. Batch 2A Compatibility
- 7-day sliding session window and 1-day throttle threshold are preserved.
- 30-day absolute maximum session ceiling is enforced via CUID v1 timestamp derivation.
- SEC-02 atomic conditional `updateMany` compare-and-set and zero-row re-validation remain fully functional.
- All 63 Batch 2A tests pass with 0 failures.

---

## 6. Test Verification & Mathematical Discrepancy Resolution

### Independent Test Execution Results

All test suites were independently executed within `D:\HindustanProjects\Hipro-Website\Hipro-Batch2B`:

```
==================================================================
       TEST SUITE EXECUTION SUMMARY (INDEPENDENT AUDIT)
==================================================================
1. backend/src/scripts/test_rbac_authorization.ts       : 102 PASSED (0 FAILED)
2. backend/src/scripts/test_sliding_session.ts          :  63 PASSED (0 FAILED)
3. backend/src/scripts/test_security_headers.ts         :  32 PASSED (0 FAILED)
4. backend/src/scripts/test_rate_limiting.ts            :  18 PASSED (0 FAILED)
5. frontend/test/canonical-schema-alignment.test.mjs    :  22 PASSED (0 FAILED)
6. frontend/test/canonical-slug-normalization.test.mjs  :   6 PASSED (0 FAILED)
7. frontend/test/local-safety.test.mjs                  :  45 PASSED (0 FAILED)
8. frontend/test/batch1-code-fixes.test.mjs             :   7 PASSED (0 FAILED)
==================================================================
ACTUAL CUMULATIVE TEST COUNT                            : 295 PASSED (0 FAILED)
==================================================================
```

### Analysis of the "289" vs "295" Discrepancy
In the implementation report (`BATCH2B_RBAC_IMPLEMENTATION_REPORT.md`), the cumulative total was reported as **289**.
Calculating the actual sum of the listed test suites:
$$102 + 63 + 32 + 18 + 22 + 6 + 45 + 7 = 295$$

The difference is exactly **6 tests**:
$$295 - 289 = 6$$

**Root Cause:**
The implementation report author calculated the frontend test subtotal without including `canonical-slug-normalization.test.mjs` (which contains exactly 6 tests: $22 + 45 + 7 = 74$; $102 + 63 + 32 + 18 + 74 = 289$). The tests themselves were executed and passed, but the reported sum omitted this 6-test suite. The true cumulative verified test count is **295 Passed, 0 Failed**.

---

## 7. Required Fixes Before Final Integration into `Hipro-Main`

Before integrating Batch 2B into `Hipro-Main`, the following fixes should be addressed:

1. **Fix SEC-B2B-01 (Mandatory Condition):**
   In `backend/src/routes/newsletter.ts`, remove the unauthenticated `{ id }` deletion branch from `router.delete("/", ...)` so that deletion by ID strictly occurs via the guarded `router.delete("/:id", requirePermission("newsletter"), ...)`.
2. **Fix SEC-B2B-02 (Recommended):**
   In `frontend/app/admin/users/page.tsx`, remove `settings` from `availableSections` and add `hbs`, `empanelment`, and `automail`.
3. **Fix SEC-B2B-03 (Recommended):**
   In `frontend/components/admin/AdminAccessWrapper.tsx` and `AdminSidebar.tsx`, require `leads` permission for the Leads Hub and `automail` permission for AutoMail Studio.

---

## 8. Safety & Isolation Compliance Confirmation

- **Database Safety:** Zero database connections, SQL queries, schema updates, or Prisma migrations were performed during this review.
- **Production Safety:** Zero production services, Cloudinary endpoints, or external environments were accessed.
- **Worktree Safety:** No files were modified in `Hipro-Main`, `Hipro-Web`, `Hipro-Batch1`, or `Hipro-Batch2`. The 16 pre-existing dirty working tree entries in `Hipro-Web` remain untouched.
- **Git Safety:** Zero commits, merges, pushes, or deployments were executed.

