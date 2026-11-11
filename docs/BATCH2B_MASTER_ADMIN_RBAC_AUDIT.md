# Batch 2B — Master Admin Staff RBAC & Authorization Audit

**Project:** Hindustan Projects (HiPRO) — Master Admin  
**Repository/Worktree:** `D:\HindustanProjects\Hipro-Website\Hipro-Main`  
**Branch:** `main`  
**Base Commit:** `da1174182d1cb1f6386b698090c36c96848d0f29`  
**Phase:** Phase 1 — Read-Only Authorization Audit  
**Date:** November 9, 2026  
**Status:** **AUDIT COMPLETED (Implementation Pending Approval)**

---

## 1. Executive Summary

An exhaustive, read-only architectural security audit of the Master Admin authentication, authorization, role hierarchy, middleware, and protected API routes was conducted within `Hipro-Main`.

### Key Findings Summary
1. **False Negatives / Staff Blockers (Denial of Service for Legitimate Staff):**
   - Legitimate subadmin/staff users (`role: "employee"`) who are explicitly assigned permissions by an administrator (such as `"blogs"`, `"about"`, or content editing permissions) are **completely blocked with HTTP 403 Forbidden** when attempting to save or publish changes.
   - The culprit is that `backend/src/routes/blogs.ts` (lines 217, 391, 568), `backend/src/routes/about.ts` (lines 381–382), and `backend/src/routes/upload.ts` (line 282) are protected by `adminGuard`.
   - In `backend/src/middleware/authGuard.ts` (line 21), `adminGuard` strictly rejects any user where `user.role !== "admin"`, completely ignoring `user.permissions`.
   - Furthermore, because `POST /api/upload` is guarded by `adminGuard`, **no staff member can upload images** for any module (including projects, services, or blog articles).

2. **False Positives / Overprivileged Access (OWASP A01: Broken Access Control):**
   - Almost every other admin route in the backend (e.g. `projects.ts`, `services.ts`, `leads.ts`, `contact.ts`, `quote.ts`, `applications.ts`, `settings.ts`, `team.ts`, `hero.ts`, `automail.ts`, `empanelment.ts`) is protected **only by `authGuard`**.
   - `authGuard` verifies only that a valid session exists (`if (!user) return 401 Unauthorized`). It performs **zero role or permission checks**.
   - A staff user with restricted permissions (e.g. granted only `"quotes"` to review quote requests) can directly call `DELETE /api/projects/:id`, `PATCH /api/settings`, `DELETE /api/services/:id`, or `DELETE /api/leads/:id` via API clients (curl, Postman, or browser console) and permanently delete or modify production data.
   - The application currently relies on frontend UI hiding (`AdminSidebar.tsx` and `AdminAccessWrapper.tsx`) as the primary access control mechanism.

---

## 2. Existing Authentication Architecture

### 2.1 Database Models
File: [`backend/prisma/schema.prisma#L302-L316`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/prisma/schema.prisma#L302-L316)

```prisma
model AdminUser {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  name        String
  role        String   @default("employee")
  permissions String?
  createdAt   DateTime @default(now())
}

model AdminSession {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
}
```

- **Roles:** The database schema defaults `AdminUser.role` to `"employee"`. The bootstrap admin has `role: "admin"`.
- **Permissions:** Stored as a nullable string (`permissions: String?`), containing a JSON-encoded array of module keys (e.g., `'["projects","leads","blogs"]'`).
- **Account State:** There are currently no fields for `isActive`, `status`, `suspendedAt`, or `lastLoginAt`.

### 2.2 Session Lifecycle & Token Management
File: [`backend/src/lib/auth.ts`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/lib/auth.ts)

- **Session Creation:** `createSession(userId, res)` generates an `AdminSession` record with `expiresAt = Date.now() + 7 days` (`SLIDING_SESSION_TTL_MS`). Sets an HTTP-only, secure, SameSite=Lax cookie named `admin_session`.
- **Session Validation & Sliding Renewal (Batch 2A):**
  - Extracts the exact creation millisecond from the Prisma CUID v1 format via `getSessionCreatedAt(session)` (`#L31-L41`). Non-CUID or malformed tokens fail closed immediately (deleted from DB, cookie cleared).
  - Enforces a 30-day absolute ceiling (`ABSOLUTE_MAX_SESSION_TTL_MS = 30 days`).
  - Throttles renewals to 1-day intervals (`remainingMs < 6 days`).
  - Executes atomic conditional Compare-and-Set (`updateMany` with `{ id: sessionId, expiresAt: session.expiresAt }`). Zero-row updates re-verify session state, logout, and expiration.
- **Logout:** `logout(req, res)` deletes the session by ID in `AdminSession` and clears the cookie (`path: "/"`, `#L202-L210`).

---

## 3. Existing Roles and Permission Model

### 3.1 Roles
1. **`admin` (Super Admin):**
   - Full, unrestricted access across all modules, system configurations, and staff accounts.
   - Initialized via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) or created by an existing admin.
2. **`employee` (Staff / Subadmin):**
   - Default role assigned to newly created users in `POST /api/admin-users`.
   - Intended to possess granular permissions assigned by the administrator.

### 3.2 Permission Keys Inventory
Derived from `frontend/app/admin/users/page.tsx#L20-L41`, `AdminSidebar.tsx#L127-L225`, and `AdminAccessWrapper.tsx#L78-L110`:

| Module Category | Permission Key | Intended Scope |
| :--- | :--- | :--- |
| **Overview** | `dashboard` | View dashboard summary statistics & activity feed |
| **Analytics** | `stats` | View and update Google Analytics / site metrics |
| **Leads / CRM** | `leads` | View, update, and manage leads hub |
| | `quotes` | View and manage quote requests |
| | `contacts` | View and manage contact messages |
| | `applications` | View and manage job applications & resumes |
| | `newsletter` | View and manage newsletter subscribers |
| | `automail` | Manage automated email campaigns and dispatches |
| **Portfolio / Content** | `projects` | Create, edit, and publish projects |
| | `services` | Create, edit, and publish services |
| | `blogs` | Create, edit, and publish blog articles |
| | `testimonials` | View and moderate client reviews |
| | `team` | Manage team member profiles |
| **Pages & CMS** | `hero` | Edit homepage hero banner |
| | `about` | Edit About page content and milestones |
| | `contact-page` | Edit contact page information and maps |
| | `cost-estimator` | Configure cost estimator pricing matrix |
| | `jobs` | Create and manage career job postings |
| | `cta-management` | Manage CTA banners and popups |
| | `navigation` | Configure navbar and footer menus |
| | `image-showcase` | Manage image showcase ribbons |
| | `projects-hero` | Manage projects page hero header |
| | `blogs-hero` | Manage blogs page hero header |
| **System Settings** | `settings` | Configure global site settings and Cloudinary |
| **Group Portals** | `hbs` | Manage Hind Building Solutions (HBS) portal |
| | `empanelment` | Manage Vendor Empanelment portal |
| | `snaptech` | Manage SnapTech venture portal |
| **Staff Management** | *None (Admin Only)* | Manage admin users and staff accounts |

---

## 4. Protected API Route Inventory & Authorization Mapping

A complete audit of all 24 route modules mounted in `backend/src/index.ts` was conducted:

| Route Path | Method | Existing Guard | Actual Current Access | Security Defect | Required Least-Privilege Guard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Rate Limiter | Public | None | Public |
| `/api/auth/logout` | POST | None | Public / Cookie | None | Public / Cookie |
| `/api/auth/me` | GET | `getSessionUser` | Authenticated | None | `authGuard` |
| `/api/admin-users` | GET, POST | `adminGuard` | Admin only | None | **Super Admin ONLY** |
| `/api/admin-users/:id` | DELETE | `adminGuard` | Admin only | Session leak on delete | **Super Admin ONLY** |
| `/api/upload` | POST | `adminGuard` | Admin only | **Staff blocked from image uploads** | `permissionGuard("upload" \| content)` |
| `/api/dashboard` | GET | `authGuard` | Any authenticated | None | `authGuard` |
| `/api/stats` | GET | Public | Public | None | Public |
| `/api/stats` | PATCH | `authGuard` | Any authenticated | **Staff can alter site stats** | `permissionGuard("stats")` |
| `/api/settings` | GET | Public (safe) / Admin | Public (safe) / Admin | None | Public (safe) / `adminGuard` |
| `/api/settings` | PATCH | `authGuard` | Any authenticated | **CRITICAL: Any staff can overwrite settings & API keys** | **Super Admin ONLY (`adminGuard`)** |
| `/api/projects` | GET, GET `/:id` | Public / Auth | Public / Any auth | None | Public / `authGuard` (drafts) |
| `/api/projects` | POST | `authGuard` | Any authenticated | **Any staff can create projects** | `permissionGuard("projects")` |
| `/api/projects/:id` | PATCH | `authGuard` | Any authenticated | **Any staff can edit any project** | `permissionGuard("projects")` |
| `/api/projects/:id` | DELETE | `authGuard` | Any authenticated | **CRITICAL: Any staff can delete projects** | `permissionGuard("projects")` |
| `/api/blogs` | GET, GET `/:slug` | Public / Auth | Public / Any auth | None | Public / `authGuard` |
| `/api/blogs` | POST | `adminGuard` | Admin only | **Staff with blogs perm BLOCKED** | `permissionGuard("blogs")` |
| `/api/blogs` | PATCH | `adminGuard` | Admin only | **Staff with blogs perm BLOCKED** | `permissionGuard("blogs")` |
| `/api/blogs` | DELETE | `adminGuard` | Admin only | **Staff with blogs perm BLOCKED** | `permissionGuard("blogs")` |
| `/api/services` | GET, GET `/:slug` | Public | Public | None | Public |
| `/api/services` | POST, PATCH, DEL | `authGuard` | Any authenticated | **Any staff can create/delete services** | `permissionGuard("services")` |
| `/api/about` | GET | Public | Public | None | Public |
| `/api/about` | PUT, PATCH | `adminGuard` | Admin only | **Staff with about perm BLOCKED** | `permissionGuard("about")` |
| `/api/leads` | GET, GET `/:id` | `authGuard` | Any authenticated | **Any staff can view all leads** | `permissionGuard("leads")` |
| `/api/leads/:id` | PATCH | `authGuard` | Any authenticated | **Any staff can modify leads** | `permissionGuard("leads")` |
| `/api/leads/:id` | DELETE | `authGuard` | Any authenticated | **CRITICAL: Any staff can delete leads** | `permissionGuard("leads")` |
| `/api/contact` | GET, PATCH | `authGuard` | Any authenticated | **Any staff can view/edit contacts** | `permissionGuard("contacts" \| "leads")` |
| `/api/contact/:id`, `/` | DELETE | `authGuard` | Any authenticated | **CRITICAL: Any staff can delete contacts** | `permissionGuard("contacts" \| "leads")` |
| `/api/quote` | GET, PATCH | `authGuard` | Any authenticated | **Any staff can view/edit quotes** | `permissionGuard("quotes" \| "leads")` |
| `/api/quote/:id`, `/` | DELETE | `authGuard` | Any authenticated | **CRITICAL: Any staff can delete quotes** | `permissionGuard("quotes" \| "leads")` |
| `/api/applications` | GET, PATCH | `authGuard` | Any authenticated | **Any staff can view/edit job apps** | `permissionGuard("applications" \| "leads")` |
| `/api/applications/:id` | DELETE | `authGuard` | Any authenticated | **CRITICAL: Any staff can delete resumes** | `permissionGuard("applications" \| "leads")` |
| `/api/newsletter` | GET | `authGuard` | Any authenticated | **Any staff can view subscribers** | `permissionGuard("newsletter" \| "leads")` |
| `/api/newsletter/:id` | DELETE | `authGuard` | Any authenticated | **Any staff can delete subscribers** | `permissionGuard("newsletter" \| "leads")` |
| `/api/team` | POST, PATCH, DEL | `authGuard` | Any authenticated | **Any staff can delete team members** | `permissionGuard("team")` |
| `/api/testimonials` | PATCH, DELETE | `authGuard` | Any authenticated | **Any staff can delete reviews** | `permissionGuard("testimonials")` |
| `/api/hero` | POST, PATCH, DEL | `authGuard` | Any authenticated | **Any staff can modify hero banner** | `permissionGuard("hero")` |
| `/api/jobs` | POST, PATCH, DEL | `authGuard` | Any authenticated | **Any staff can delete job postings** | `permissionGuard("jobs")` |
| `/api/guarantees` | POST, PATCH, DEL | `authGuard` | Any authenticated | **Any staff can delete guarantees** | `permissionGuard("settings" \| "about")` |
| `/api/hbs/seed` | POST | `adminGuard` | Admin only | None | **Super Admin ONLY** |
| `/api/hbs/*` (mutations) | POST, PATCH, DEL | `authGuard` | Any authenticated | **Any staff can modify HBS portal** | `permissionGuard("hbs")` |
| `/api/empanelment/admin/*` | ALL methods | `authGuard` | Any authenticated | **Any staff can approve/reject vendors** | `permissionGuard("empanelment")` |
| `/api/automail/*` | ALL methods | `authGuard` | Any authenticated | **Any staff can trigger mass emails** | `permissionGuard("automail")` |

---

## 5. Staff Access Blockers Analysis (False Negatives)

### 5.1 Issue 1: `adminGuard` Hard-Coded to Role `admin`
File: [`backend/src/middleware/authGuard.ts#L19-L27`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/middleware/authGuard.ts#L19-L27)
```typescript
export function adminGuard(req: Request, res: Response, next: NextFunction) {
  authGuard(req, res, () => {
    const user = (req as any).user;
    if (user?.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden - Admin access required" });
    }
    next();
  });
}
```
`adminGuard` only checks `user?.role !== "admin"`. It has no knowledge of `user.permissions`. Consequently, routes guarded by `adminGuard` fail for all subadmins (`role === "employee"`).

### 5.2 Issue 2: Blog Management Is Inaccessible to Content Staff
File: [`backend/src/routes/blogs.ts#L217, #L391, #L568`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/blogs.ts#L217)
- `POST /api/blogs` (Create article) -> `adminGuard`
- `PATCH /api/blogs` (Update article) -> `adminGuard`
- `DELETE /api/blogs` (Delete article) -> `adminGuard`
Even if an employee is granted the `"blogs"` permission in `AdminUser.permissions`, any blog creation or update returns HTTP 403 Forbidden.

### 5.3 Issue 3: About Page CMS Is Inaccessible to Staff
File: [`backend/src/routes/about.ts#L381-L382`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/about.ts#L381-L382)
- `PUT /api/about` -> `adminGuard`
- `PATCH /api/about` -> `adminGuard`
Staff granted `"about"` permission cannot update company milestones, hero copy, or company stats.

### 5.4 Issue 4: Image Uploads Are Completely Blocked for All Staff
File: [`backend/src/routes/upload.ts#L280-L284`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/upload.ts#L280-L284)
- `POST /api/upload` is guarded by `adminGuard`.
- Because modern CMS workflows require uploading project images, service cover photos, blog banners, and team headshots, any staff member attempting to upload a file receives HTTP 403 Forbidden.

---

## 6. Overprivileged Access & Missing Authorization (False Positives)

### 6.1 Issue 5: Global Site Settings Overwrite
File: [`backend/src/routes/settings.ts#L51`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/settings.ts#L51)
- `router.patch("/", authGuard, ...)` allows ANY authenticated employee to overwrite the global settings record.
- An employee can modify Cloudinary configuration (`cloudinaryCloudName`, `cloudinaryUploadPreset`), navigation configurations, or company contact details.

### 6.2 Issue 6: Unrestricted Deletion of Customer Leads, Inquiries & Resumes
Files:
- [`backend/src/routes/leads.ts#L335`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/leads.ts#L335) (`DELETE /api/leads/:id`)
- [`backend/src/routes/contact.ts#L149`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/contact.ts#L149) (`DELETE /api/contact/:id`)
- [`backend/src/routes/quote.ts#L136`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/quote.ts#L136) (`DELETE /api/quote/:id`)
- [`backend/src/routes/applications.ts#L74`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/applications.ts#L74) (`DELETE /api/applications/:id`)
All lead deletion endpoints use bare `authGuard`. Any authenticated user can delete incoming leads, quote requests, and candidate applications without requiring specific permission.

### 6.3 Issue 7: Unrestricted Deletion and Publishing of Projects and Services
Files:
- [`backend/src/routes/projects.ts#L314, #L753, #L804`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/projects.ts#L314)
- [`backend/src/routes/services.ts#L70, #L202, #L222`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/services.ts#L70)
Projects and services mutations use bare `authGuard`. A user assigned only to customer service inquiries can modify or delete high-visibility projects and services.

---

## 7. Sensitive Operations & Permission Boundaries

The following operations must be strictly segregated:

1. **Super Admin Tier (Strictly `role === "admin"`):**
   - User & staff management (`/api/admin-users/*`).
   - Production database seeding (`/api/hbs/seed`).
   - Global site settings & Cloudinary secrets (`/api/settings` PATCH).
2. **Staff Module Tier (`hasPermission(user, moduleKey)`):**
   - Project editing/deleting (`projects`).
   - Blog editing/deleting (`blogs`).
   - Service editing/deleting (`services`).
   - Lead management (`leads`, `contacts`, `quotes`, `applications`, `newsletter`).
   - Vendor empanelment management (`empanelment`).
   - AutoMail dispatcher (`automail`).
   - Group portal CMS (`hbs`).
3. **Media Upload Tier:**
   - Must allow `admin` OR staff with at least one content/media-capable permission (`projects`, `blogs`, `services`, `about`, `team`, `testimonials`, `hero`, `hbs`).

---

## 8. Frontend Authorization Findings

1. **Sidebar Navigation (`AdminSidebar.tsx#L252-L292`):**
   - Computes `userPermissions` via `JSON.parse(user.permissions)`.
   - Correctly hides navigation links if the user lacks the permission key.
2. **Page Content Wrapper (`AdminAccessWrapper.tsx#L78-L110`):**
   - Inspects URL path segments (e.g. `/admin/projects` -> segment `projects`).
   - If user lacks permission, replaces page content with an "Access Denied" screen.
3. **The Architectural Gap:**
   - Client-side navigation guards do **not** protect the API. A user can open DevTools or execute `fetch('/api/projects/...', { method: 'DELETE' })` and the backend will execute the deletion because the backend lacks permission checks.

---

## 9. Security Risk Classification

| Risk Level | Vulnerability Description | File & Line Reference | Impact |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | Any authenticated staff user can overwrite global site settings and Cloudinary keys | [`backend/src/routes/settings.ts#L51`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/settings.ts#L51) | Complete site configuration compromise |
| **CRITICAL** | Any authenticated staff user can permanently delete leads, quotes, and applications | [`backend/src/routes/leads.ts#L335`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/leads.ts#L335) | Irreversible customer data loss |
| **CRITICAL** | Any authenticated staff user can delete or mutate core projects and services | [`backend/src/routes/projects.ts#L804`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/projects.ts#L804) | Public website disruption |
| **HIGH** | Legitimate staff granted `"blogs"` or `"about"` permissions are blocked with 403 Forbidden | [`backend/src/routes/blogs.ts#L217`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/blogs.ts#L217), [`about.ts#L381`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/about.ts#L381) | Feature denial of service for staff |
| **HIGH** | All staff users are blocked from uploading images (`/api/upload`) | [`backend/src/routes/upload.ts#L282`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/upload.ts#L282) | Staff unable to upload project/blog media |
| **MEDIUM** | Deleting a staff account leaves active sessions valid until next database query | [`backend/src/routes/adminUsers.ts#L80`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/adminUsers.ts#L80) | Delayed session invalidation |
| **LOW** | Malformed JSON in `AdminUser.permissions` could cause unhandled exceptions if unparsed | [`backend/src/routes/adminUsers.ts#L59`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/routes/adminUsers.ts#L59) | Edge-case request failure |

---

## 10. Recommended RBAC Architecture

To achieve clean, robust, and backward-compatible authorization without requiring database schema changes or migrations, the following design is recommended:

### 10.1 Permission Parsing Utility
In `backend/src/lib/auth.ts` or `backend/src/middleware/authGuard.ts`:
```typescript
export function getUserPermissions(user: any): string[] {
  if (!user || !user.permissions) return [];
  if (Array.isArray(user.permissions)) return user.permissions;
  if (typeof user.permissions === "string") {
    try {
      const parsed = JSON.parse(user.permissions);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function hasPermission(user: any, required: string | string[]): boolean {
  if (!user) return false;
  // Super admin always has unrestricted access
  if (user.role === "admin") return true;

  const userPerms = getUserPermissions(user);
  if (Array.isArray(required)) {
    return required.some((perm) => userPerms.includes(perm));
  }
  return userPerms.includes(required);
}
```

### 10.2 Modular Middleware: `requirePermission`
```typescript
export function requirePermission(permission: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    authGuard(req, res, () => {
      const user = (req as any).user;
      if (!hasPermission(user, permission)) {
        return res.status(403).json({
          success: false,
          error: "Forbidden — Insufficient permissions",
        });
      }
      next();
    });
  };
}
```

### 10.3 Middleware Separation Strategy
- **`adminGuard`:** Retained strictly for Super Admin routes:
  - `/api/admin-users/*` (Staff account management)
  - `/api/hbs/seed` (Database seeding)
  - `PATCH /api/settings` (Global configuration & secrets)
- **`requirePermission(moduleKey)`:** Applied to all module mutations and protected listing endpoints:
  - Blogs: `requirePermission("blogs")`
  - About: `requirePermission("about")`
  - Projects: `requirePermission("projects")`
  - Services: `requirePermission("services")`
  - Leads / CRM: `requirePermission(["leads", "contacts", "quotes", "applications", "newsletter"])`
  - Uploads: `requirePermission(["upload", "projects", "blogs", "services", "about", "team", "testimonials", "hero", "hbs"])`
  - Group Ventures: `requirePermission("hbs")`, `requirePermission("empanelment")`, `requirePermission("automail")`

---

## 11. Exact Files Requiring Changes in Implementation Phase

1. **`backend/src/middleware/authGuard.ts`:**
   - Implement `getUserPermissions`, `hasPermission`, and `requirePermission`.
   - Preserve existing `authGuard` and `adminGuard` contracts.
2. **`backend/src/routes/blogs.ts`:**
   - Replace `adminGuard` with `requirePermission("blogs")` on POST, PATCH, DELETE.
3. **`backend/src/routes/about.ts`:**
   - Replace `adminGuard` with `requirePermission("about")` on PUT, PATCH.
4. **`backend/src/routes/upload.ts`:**
   - Replace `adminGuard` with permission check allowing `admin` or staff with content permissions.
5. **`backend/src/routes/settings.ts`:**
   - Replace `authGuard` with `adminGuard` on `PATCH /` to close critical configuration overwrite hole.
6. **`backend/src/routes/projects.ts`:**
   - Add `requirePermission("projects")` to POST, PATCH, DELETE.
7. **`backend/src/routes/services.ts`:**
   - Add `requirePermission("services")` to POST, PATCH, DELETE.
8. **`backend/src/routes/leads.ts`:**
   - Add permission enforcement for leads reading, status updates, and deletions.
9. **`backend/src/routes/contact.ts`, `quote.ts`, `applications.ts`, `newsletter.ts`:**
   - Add corresponding permission checks on read/update/delete.
10. **`backend/src/routes/adminUsers.ts`:**
    - On user deletion, immediately delete associated sessions (`prisma.adminSession.deleteMany({ where: { userId: id } })`).
11. **`backend/src/scripts/test_rbac_authorization.ts` (New test suite):**
    - Comprehensive unit and integration test suite validating role hierarchies, permission checks, staff access, and fail-closed behavior.

---

## 12. Regression Test Plan

1. **Preserve Batch 2A Behavior:**
   - Run `tsx src/scripts/test_sliding_session.ts` and confirm all 63/63 tests continue to pass.
   - Confirm CUID extraction, renewal throttling, optimistic concurrency, and zero-row handling remain untouched.
2. **Super Admin Unrestricted Access:**
   - Verify user with `role: "admin"` has 100% access to all 65+ endpoints across all modules without exception.
3. **Staff Access Validation:**
   - User with `role: "employee"` and `permissions: ["blogs"]`:
     - Can create, edit, delete blogs.
     - Can upload images for blogs.
     - Is rejected with HTTP 403 on `/api/projects`, `/api/settings`, `/api/leads`.
   - User with `role: "employee"` and `permissions: ["projects"]`:
     - Can create, edit, delete projects and upload images.
     - Is rejected with HTTP 403 on `/api/blogs`, `/api/settings`.
   - User with `role: "employee"` and `permissions: []`:
     - Can access dashboard stats.
     - Is rejected with HTTP 403 on all mutating endpoints across all modules.
4. **Security Hardening Validation:**
   - Verify non-admin is strictly rejected on `PATCH /api/settings`.
   - Verify non-admin is strictly rejected on `/api/admin-users/*`.
   - Verify malformed permissions string (`"invalid-json"` or `null`) fails closed to HTTP 403 Forbidden.

