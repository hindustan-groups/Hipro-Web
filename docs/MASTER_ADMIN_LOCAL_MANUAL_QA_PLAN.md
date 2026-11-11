# MASTER ADMIN — LOCAL MANUAL QA EXECUTION PLAN & CHECKLIST

**Target Worktree:** `D:\HindustanProjects\Hipro-Website\Hipro-Main`  
**Branch:** `main`  
**Base Commit:** `da1174182d1cb1f6386b698090c36c96848d0f29`  
**Prepared Date:** November 9, 2026  
**Status:** **READY FOR USER MANUAL EXECUTION (READ-ONLY PREPARATION)**

---

## 1. Safety & Boundary Confirmation

This manual QA plan was prepared following strict read-only safety rules:
- **No file modifications or deletions:** No code, schema, seed, or test files have been altered for this QA preparation.
- **No production access:** Zero production database calls, zero cloud queries, zero deployments.
- **No secret exposure:** Passwords, session cookies, tokens, and secrets are strictly excluded.
- **Worktree integrity:** `Hipro-Main` remains clean with Batch 1, Batch 2A, Batch 2B, and URL security remediations intact. `Hipro-Web` remains 100% untouched with all 16 pre-existing dirty working tree entries preserved.
- **Manual QA Execution Role:** This document provides the instructions, URLs, preconditions, and tracking framework for the **user to personally execute** on localhost. The agent makes no false claims of test completion.

---

## 2. Inspected Implementation Files

The following files were inspected to map exact routes, components, permissions, and behavior:

1. **Routing & Edge Middleware:**
   - `frontend/middleware.ts` — Edge session cookie inspection, subdomain canonical redirection (`https://www.hindustanprojects.in`).
   - `frontend/next.config.mjs` — Security headers, `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: no-store`, API rewrites (`http://localhost:5000`).
2. **Layout & Access Control:**
   - `frontend/app/admin/layout.tsx` — Root admin layout, `getSessionUser()` server component check, redirect to `/admin-login`.
   - `frontend/components/admin/AdminAccessWrapper.tsx` — Client-side RBAC guard for employees, scroll locking, "Access Denied" view.
   - `frontend/components/admin/AdminSidebar.tsx` — Navigation categories, dynamic permission filtering, portal switchers.
   - `frontend/components/admin/AdminHeader.tsx` — Title display, search bar, portal dropdown, notifications, logout trigger, mobile menu toggle.
3. **Authentication & Session Lifecycle:**
   - `frontend/app/admin-login/page.tsx` — Login form, pre-warm `/api/health`, sanitized `returnTo` callback handling.
   - `frontend/app/admin-login/layout.tsx` — `robots: { index: false, follow: false, nocache: true }`.
   - `frontend/lib/auth.ts` — `getSessionUser()`, in-memory 60s session cache, cookie extraction, logout caller.
   - `frontend/lib/authUrl.ts` — `sanitizeReturnUrl` callback scope validation.
   - `backend/src/lib/auth.ts` — `createSession`, `getSessionUser`, sliding session (7-day slide, 30-day cap), CUID v1 timestamp parsing, atomic OCC `updateMany`.
   - `backend/src/middleware/authGuard.ts` — `authGuard`, `adminGuard`, `requirePermission`, `hasPermission`, `getUserPermissions`.
4. **User Management & APIs:**
   - `frontend/app/admin/users/page.tsx` — Staff accounts table, 22 permission keys (excludes `settings`), modal form.
   - `backend/src/routes/adminUsers.ts` — `adminGuard` protected CRUD endpoints.
   - `backend/src/middleware/rateLimiter.ts` — `authLoginLimiter` (5 attempts / 15 min / IP).

---

## 3. Local Environment Startup Guide

Before beginning manual QA, the user must ensure both the Express backend and Next.js frontend are running locally on their standard development ports.

### A. Start the Local Backend (Port 5000)
Open a terminal in the project directory:
```powershell
# Navigate to backend and start the dev server
cd D:\HindustanProjects\Hipro-Website\Hipro-Main\backend
npm run dev
```
*Expected Terminal Output:*
```text
Standalone Express backend is running on port 5000
```
> [!NOTE]
> If `node_modules` is hosted in the primary worktree `Hipro-Web`, run:
> ```powershell
> $env:NODE_PATH="D:\HindustanProjects\Hipro-Website\Hipro-Web\backend\node_modules"
> node "D:\HindustanProjects\Hipro-Website\Hipro-Web\backend\node_modules\tsx\dist\cli.mjs" watch src/index.ts
> ```

### B. Start the Local Frontend (Port 3000)
Open a separate terminal:
```powershell
cd D:\HindustanProjects\Hipro-Website\Hipro-Main\frontend
npm run dev
```
*Expected Terminal Output:*
```text
▲ Next.js 14.2.35
- Local: http://localhost:3000
- Environments: .env.production / .env.local
✓ Ready in 1.8s
```

### C. Verify Local Endpoints
Open a browser and navigate to:
- Frontend Health: `http://localhost:3000/api/health` -> `{"status":"OK", ...}`
- Admin Login Page: `http://localhost:3000/admin-login` -> Renders Login Card cleanly.

---

## 4. Test Account Prerequisites

To execute the full matrix of tests, three distinct accounts are required in the local test database:

| Account Type | Required Role | Required Permissions | Purpose in QA | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Account 1: Super Admin** | `admin` | Unrestricted (`"[]"` or bypass) | Verify full administrative access across all 53 pages, site settings, and staff management. | Prerequisite |
| **Account 2: Single-Module Staff** | `employee` | `["leads"]` or `["blogs"]` | Verify strict least-privilege isolation: access granted only to assigned module, blocked from others. | Prerequisite |
| **Account 3: Multi-Module Staff** | `employee` | `["leads", "quotes", "projects"]` | Verify multi-section access and absence of Super Admin options (Users, Site Settings). | Prerequisite |

> [!IMPORTANT]
> **Safety Rule:** Never create, delete, or modify real accounts in production. If an employee test account is not available in your local development database, mark those specific employee tests as **BLOCKED** until a local test account is seeded.

---

## 5. Step-by-Step Manual QA Checklist

---

### PART A: Super Admin End-to-End Scenarios

#### Test ID: TC-A01 — Super Admin Login & Dashboard Access
- **Local URL:** `http://localhost:3000/admin-login`
- **Required Role:** Super Admin (`admin`)
- **Preconditions:** Local frontend (3000) and backend (5000) running; user not logged in.
- **Action Steps:**
  1. Open a browser (incognito recommended) and navigate to `http://localhost:3000/admin-login`.
  2. Enter authorized local Super Admin email and password.
  3. Click **"Secure Login"**.
- **Expected Observations:**
  - Button text briefly updates to `"Authenticating..."`.
  - Browser executes a full page navigation to `http://localhost:3000/admin`.
  - Header displays "Dashboard", user avatar with initial, and role indicator `"admin"`.
  - Main KPI dashboard renders stats, graphs, and quick links without loading errors.
- **Evidence / Screenshot:** Screenshot of `/admin` showing Super Admin header and KPIs.
- **Recovery:** If login fails, check backend console logs for connection or credential errors.

---

#### Test ID: TC-A02 — Super Admin Primary Navigation & CMS Modules
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** Super Admin (`admin`)
- **Preconditions:** Logged in as Super Admin.
- **Action Steps:** Click each of the following sidebar links sequentially and observe page rendering:
  1. `/admin/stats` (Site Stats & Analytics)
  2. `/admin/leads` (Unified Leads Hub)
  3. `/admin/automail` (AutoMail Studio)
  4. `/admin/quotes` (Quote Requests)
  5. `/admin/contacts` (Contact Inquiries)
  6. `/admin/applications` (Job Applications)
  7. `/admin/newsletter` (Newsletter Subscribers)
  8. `/admin/projects` (Projects Portfolio)
  9. `/admin/services` (Services Management)
  10. `/admin/blogs` (Blog Articles)
  11. `/admin/testimonials` (Client Reviews)
  12. `/admin/team` (Team Members)
- **Expected Observations:**
  - Each page loads cleanly without 401, 403, or React error boundaries.
  - Active navigation item in sidebar highlights with a red indicator pip or navy background.
  - Header title matches the page title (e.g., "Leads Hub", "Projects Portfolio").
- **Evidence / Screenshot:** Verification check of leads table and projects list.

---

#### Test ID: TC-A03 — Super Admin Pages CMS & Site Builders
- **Local URL:** `http://localhost:3000/admin/hero`
- **Required Role:** Super Admin (`admin`)
- **Preconditions:** Logged in as Super Admin.
- **Action Steps:** Navigate through the Pages & CMS sections:
  1. `/admin/hero` (Hero Banner CMS)
  2. `/admin/image-showcase` (Image Showcase CMS)
  3. `/admin/projects-hero` (Projects Hero CMS)
  4. `/admin/blogs-hero` (Blogs Hero CMS)
  5. `/admin/about` (About Page CMS)
  6. `/admin/contact-page` (Contact Page CMS)
  7. `/admin/cost-estimator` (Cost Estimator CMS)
  8. `/admin/jobs` (Job Postings CMS)
  9. `/admin/cta-management` (CTA Management)
  10. `/admin/navigation` (Navigation Menus CMS)
- **Expected Observations:**
  - All form controls, image uploader fields, and text inputs render properly.
  - No "Access Denied" screens appear for Super Admin.

---

#### Test ID: TC-A04 — Group Ventures Portal Switcher (HBS & Empanelment)
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** Super Admin (`admin`)
- **Preconditions:** Logged in as Super Admin.
- **Action Steps:**
  1. In the top header, click the **Portal Switcher Dropdown** (labeled "HiPRO Master" or showing the grid icon).
  2. Select **"Hind Building Solutions (HBS)"**.
  3. Observe sidebar transitions to the Hind Build Apple-frosted glass layout (`/admin/hbs`).
  4. Click through `/admin/hbs/home`, `/admin/hbs/services`, `/admin/hbs/leads`.
  5. In Portal Switcher, select **"Vendor Empanelment"**.
  6. Observe sidebar transitions to Empanelment layout (`/admin/empanelment`).
  7. In Portal Switcher, select **"HiPRO Master Admin"** to return.
- **Expected Observations:**
  - Portal switching occurs instantly without losing authentication.
  - Sub-portals display dedicated color schemes (HBS: slate/red glass, Empanelment: amber/gold).
- **Evidence / Screenshot:** Screenshot of HBS admin dashboard and Empanelment dashboard.

---

#### Test ID: TC-A05 — Super Admin Only Sections (Settings & Staff Users)
- **Local URL:** `http://localhost:3000/admin/settings` and `http://localhost:3000/admin/users`
- **Required Role:** Super Admin (`admin`)
- **Preconditions:** Logged in as Super Admin.
- **Action Steps:**
  1. Click **"Users & Roles"** (`/admin/users`) in the bottom of the sidebar.
  2. Observe the staff accounts table, role badges, and permission pills.
  3. Click **"Site Settings"** (`/admin/settings`) in the sidebar.
  4. Observe site configuration tabs (SEO, Branding, Social Links, Maintenance mode).
- **Expected Observations:**
  - Both `/admin/users` and `/admin/settings` load with full administrative controls.
  - No authorization errors.
- **Evidence / Screenshot:** Screenshot of `/admin/users` showing user list.

---

#### Test ID: TC-A06 — Super Admin Logout Flow
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** Super Admin (`admin`)
- **Preconditions:** Logged in as Super Admin.
- **Action Steps:**
  1. Click the **Logout** button (door icon in header or "Logout" in sidebar footer).
  2. Observe network activity in DevTools (POST `/api/auth/logout` -> status 200).
- **Expected Observations:**
  - Browser redirects immediately to `http://localhost:3000/admin-login`.
  - In DevTools > Application > Cookies, the `admin_session` cookie is deleted / expired.
- **Evidence / Screenshot:** Screenshot of login page post-logout.

---

#### Test ID: TC-A07 — Post-Logout Direct Admin URL Access
- **Local URL:** `http://localhost:3000/admin/leads`
- **Required Role:** Logged out (Unauthenticated)
- **Preconditions:** TC-A06 completed (user just logged out).
- **Action Steps:**
  1. In the browser address bar, directly type: `http://localhost:3000/admin/leads`.
  2. Press Enter.
- **Expected Observations:**
  - Next.js Edge Middleware immediately intercepts the request (missing session cookie).
  - Browser is redirected to `http://localhost:3000/admin-login?returnTo=%2Fadmin%2Fleads`.
  - Admin leads page is NOT rendered; zero SSR data leaked.
- **Evidence / Screenshot:** Address bar displaying the `returnTo` parameter on the login page.

---

### PART B: Employee Least-Privilege RBAC Scenarios

#### Test ID: TC-B01 — Employee Login & Assigned Module Access
- **Local URL:** `http://localhost:3000/admin-login`
- **Required Role:** Employee (e.g., assigned `["leads"]`)
- **Preconditions:** Test employee account exists in local database.
- **Action Steps:**
  1. Navigate to `http://localhost:3000/admin-login`.
  2. Enter employee email and password, click **"Secure Login"**.
  3. Observe dashboard view.
  4. Navigate to assigned section (e.g. `http://localhost:3000/admin/leads`).
- **Expected Observations:**
  - Header displays employee's name and role `"employee"`.
  - Sidebar shows only assigned categories (unpermitted links are hidden).
  - Navigating to `/admin/leads` renders the leads table cleanly.
- **Evidence / Screenshot:** Screenshot of sidebar showing reduced items for employee.

---

#### Test ID: TC-B02 — Employee Unauthorized Route Navigation (Access Denied View)
- **Local URL:** `http://localhost:3000/admin/settings` (or any unpermitted module, e.g. `/admin/quotes`)
- **Required Role:** Employee without `settings` permission
- **Preconditions:** Logged in as employee lacking the target permission.
- **Action Steps:**
  1. In the browser address bar, manually type `http://localhost:3000/admin/settings`.
  2. Press Enter.
- **Expected Observations:**
  - `AdminAccessWrapper` blocks page rendering.
  - A centered Access Denied screen appears:
    - Large `ShieldAlert` icon.
    - Heading: **"Access Denied"**.
    - Description: *"You do not have permission to view or manage the settings section. Please contact your administrator if you believe this is an error."*
  - The actual settings form and inputs are completely omitted from the DOM.
- **Evidence / Screenshot:** Screenshot of the Access Denied screen.

---

#### Test ID: TC-B03 — Employee Attempt to Access User Management
- **Local URL:** `http://localhost:3000/admin/users`
- **Required Role:** Employee (`role === "employee"`)
- **Preconditions:** Logged in as employee.
- **Action Steps:**
  1. In the browser address bar, enter: `http://localhost:3000/admin/users`.
  2. Press Enter.
- **Expected Observations:**
  - The sidebar does NOT display the "Users & Roles" link.
  - Direct navigation displays the Access Denied screen.
  - No user accounts or permission configurations are exposed.
- **Evidence / Screenshot:** Screenshot of `/admin/users` showing Access Denied.

---

#### Test ID: TC-B04 — Direct API Authorization Check (DevTools Console)
- **Local URL:** Browser DevTools on any admin page
- **Required Role:** Employee (without `settings` permission)
- **Preconditions:** Logged in as employee.
- **Action Steps:**
  1. Open browser DevTools (F12) > Console tab.
  2. Run the following command:
     ```javascript
     fetch('/api/admin-users').then(res => console.log('Admin-Users Status:', res.status));
     ```
  3. Run a second command for another unpermitted module:
     ```javascript
     fetch('/api/settings').then(res => console.log('Settings Status:', res.status));
     ```
- **Expected Observations:**
  - Both fetch requests log `403` in the console.
  - Network tab shows response: `{"success":false,"error":"Forbidden — Insufficient permissions"}` or `"Forbidden - Admin access required"`.
- **Evidence / Screenshot:** DevTools console log showing HTTP 403 responses.

---

#### Test ID: TC-B05 — Employee Logout & Direct Access Re-test
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** Employee
- **Preconditions:** Logged in as employee.
- **Action Steps:**
  1. Click Logout.
  2. Attempt to navigate back using browser back button or direct URL (`/admin/leads`).
- **Expected Observations:**
  - Redirected to `/admin-login`.
  - Cache-Control prevents restoring prior employee screens.

---

### PART C: Authentication & Boundary Edge Scenarios

#### Test ID: TC-C01 — No Session Cookie
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** None (Cookie absent)
- **Preconditions:** No active session.
- **Action Steps:**
  1. Open an Incognito window.
  2. Navigate directly to `http://localhost:3000/admin`.
- **Expected Observations:**
  - Edge middleware intercepts immediately.
  - Browser lands on `http://localhost:3000/admin-login`.
  - DevTools Network tab shows HTTP 307 Temporary Redirect from `/admin` to `/admin-login`.

---

#### Test ID: TC-C02 — Callback URL Sanitization (Open Redirect Defense)
- **Local URL:** Various crafted login URLs
- **Required Role:** Super Admin or Employee
- **Preconditions:** User not logged in.
- **Action Steps:**
  1. Navigate to: `http://localhost:3000/admin-login?returnTo=https://evil.com`
     - Login with test credentials.
     - **Expected Observation:** Redirected to `/admin`, NOT `evil.com`.
  2. Navigate to: `http://localhost:3000/admin-login?returnTo=//evil.com`
     - Login with test credentials.
     - **Expected Observation:** Redirected to `/admin`.
  3. Navigate to: `http://localhost:3000/admin-login?returnTo=/administrator`
     - Login with test credentials.
     - **Expected Observation:** Redirected to `/admin` (substring scope escalation blocked).
  4. Navigate to: `http://localhost:3000/admin-login?returnTo=/admin/leads`
     - Login with test credentials.
     - **Expected Observation:** Smoothly redirected to `/admin/leads` (legitimate relative admin path preserved).
- **Evidence / Screenshot:** URL bar destination after each login attempt.

---

#### Test ID: TC-C03 — Forged / Fake Session Cookie
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** Forged cookie
- **Preconditions:** Browser on `http://localhost:3000`.
- **Action Steps:**
  1. Open DevTools > Application > Storage > Cookies > `http://localhost:3000`.
  2. Create a manual cookie: Name = `admin_session`, Value = `c_fake_cuid_random_99999`, Path = `/`.
  3. In the address bar, navigate to `http://localhost:3000/admin`.
- **Expected Observations:**
  - Edge middleware allows request through (cookie presence check).
  - Server Component `AdminLayout` calls `/api/auth/me` with the forged cookie.
  - Backend checks database, finds 0 matching sessions, returns 401.
  - `AdminLayout` catches 401, clears cookie, and redirects user to `http://localhost:3000/admin-login`.
  - User cannot view any admin dashboard content with a forged cookie.
- **Evidence / Screenshot:** Browser landing on `/admin-login` after forged cookie attempt.

---

#### Test ID: TC-C04 — Robots & Noindex Headers Inspection
- **Local URL:** `http://localhost:3000/admin` and `http://localhost:3000/admin-login`
- **Required Role:** None / Super Admin
- **Preconditions:** Browser DevTools open on Network tab.
- **Action Steps:**
  1. In DevTools > Network tab, reload `http://localhost:3000/admin-login`.
  2. Click the document request (`admin-login`) and inspect **Response Headers**.
  3. Right-click page > "View Page Source" and inspect `<head>`.
- **Expected Observations:**
  - Response Header includes: `X-Robots-Tag: noindex, nofollow, noarchive`.
  - Response Header includes: `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`.
  - HTML source contains: `<meta name="robots" content="noindex, nofollow, nocache"/>`.
- **Evidence / Screenshot:** DevTools Response Headers inspection pane showing `X-Robots-Tag` and `Cache-Control`.

---

#### Test ID: TC-C05 — Brute-Force Rate Limiting on `/api/auth/login`
- **Local URL:** `http://localhost:3000/admin-login`
- **Required Role:** None
- **Preconditions:** Browser DevTools open.
- **Action Steps:**
  1. Attempt to log in with an intentionally incorrect password 5 consecutive times.
  2. Observe the 6th login attempt.
- **Expected Observations:**
  - Attempts 1 to 5 return `"Invalid credentials"`.
  - Attempt 6 returns red alert: `"Too many login attempts. Please try again after 15 minutes."`.
  - Network tab shows HTTP 429 Too Many Requests with headers `RateLimit-Limit: 5`, `RateLimit-Remaining: 0`, and `Retry-After`.
- **Recovery:** Wait 15 minutes or test from an alternate IP/browser session.

---

### PART D: User Management & Permission Configuration

#### Test ID: TC-D01 — Staff Directory Inspection
- **Local URL:** `http://localhost:3000/admin/users`
- **Required Role:** Super Admin (`admin`)
- **Preconditions:** Logged in as Super Admin.
- **Action Steps:**
  1. Navigate to `/admin/users`.
  2. Inspect the user directory table columns: Name, Email, Role, Permissions, Created Date.
- **Expected Observations:**
  - Super Admin accounts display a dark navy/gold `admin` badge.
  - Employee accounts display an `employee` badge with individual permission pills (e.g., `leads`, `blogs`).

---

#### Test ID: TC-D02 — New User Modal Permission Selection Inspection
- **Local URL:** `http://localhost:3000/admin/users`
- **Required Role:** Super Admin (`admin`)
- **Preconditions:** Logged in as Super Admin.
- **Action Steps:**
  1. Click the **"+ Add User"** button to open the modal.
  2. Inspect the available permission checkboxes.
  3. Verify that the list contains exactly the 22 safe module permissions (including `hbs`, `empanelment`, `automail`).
  4. Confirm that **`settings`** is NOT in the list (SEC-B2B-02 compliance).
  5. Close the modal by clicking outside or the Cancel button.
- **Expected Observations:**
  - Modal opens cleanly.
  - Super Admin `settings` cannot be assigned to employees.
  - No database write is performed.

---

### PART E: Responsive Design & Usability

#### Test ID: TC-E01 — Desktop Layout (>= 1280px)
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** Super Admin
- **Preconditions:** Desktop monitor or maximized browser window.
- **Action Steps:** Observe layout positioning and scroll behavior:
  1. Left sidebar remains fixed at 260px width.
  2. Top header remains fixed at 70px height (`sticky top-0`).
  3. Scroll down the main content viewport: header and sidebar remain locked in place.
- **Expected Observations:**
  - No horizontal page scrollbars. Outer body scroll is locked.
  - Clean layout alignment.

---

#### Test ID: TC-E02 — Tablet Layout (768px - 1024px)
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** Super Admin
- **Preconditions:** Browser DevTools device simulation set to "iPad Air" or width 820px.
- **Action Steps:**
  1. Resize viewport to 820px.
  2. Observe header search bar and user profile pill adaptation.
  3. Verify sidebar navigation and main content responsiveness.
- **Expected Observations:**
  - Search bar collapses gracefully.
  - Grid columns on dashboard reflow from 4 columns to 2 columns.

---

#### Test ID: TC-E03 — Mobile Viewport & Hamburger Menu (< 768px)
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** Super Admin
- **Preconditions:** DevTools device simulation set to "iPhone 14 Pro" (width 393px).
- **Action Steps:**
  1. Load `/admin` at width 393px.
  2. Observe sidebar is hidden off-screen.
  3. Click the **Hamburger Menu button** (top left).
  4. Observe sidebar slides in smoothly over the content with an overlay backdrop.
  5. In the sidebar, click **"Projects"**.
- **Expected Observations:**
  - Clicking "Projects" closes the mobile sidebar automatically and loads `/admin/projects`.
  - Brand logo displays cleanly in header on mobile.

---

#### Test ID: TC-E04 — Sidebar Real-Time Keyword Filter
- **Local URL:** `http://localhost:3000/admin`
- **Required Role:** Super Admin
- **Preconditions:** Sidebar visible.
- **Action Steps:**
  1. In the sidebar search bar ("Search menus..."), type: `leads`.
  2. Observe sidebar navigation links.
  3. Clear the input.
- **Expected Observations:**
  - Sidebar filters instantly: only items containing "leads" (e.g. "Leads Hub", "Customer Leads") remain visible.
  - Clearing the search restores all navigation categories immediately.

---

#### Test ID: TC-E05 — Login Page Responsiveness & Error States
- **Local URL:** `http://localhost:3000/admin-login`
- **Required Role:** None
- **Preconditions:** Logged out.
- **Action Steps:**
  1. View `/admin-login` on desktop (1440px) and mobile (375px).
  2. Submit form with empty fields -> browser validation prompts for email.
  3. Enter valid format email and wrong password, submit -> observe red alert card.
- **Expected Observations:**
  - Card remains centered and readable across all screen sizes.
  - HiPRO logo renders sharply with `mix-blend-multiply`.
  - Error messages display inside a red alert card with `ShieldAlert` icon.

---

## 6. Master QA Execution Tracking Table

Use this checklist during manual testing to record results:

| Test ID | Category | Description | Target Local URL | Role | Result | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **TC-A01** | Super Admin | Super Admin Login & Dashboard | `/admin-login` -> `/admin` | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-A02** | Super Admin | Primary Navigation & CRM Links | `/admin/*` | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-A03** | Super Admin | Pages & CMS Site Builders | `/admin/hero` to `/admin/about` | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-A04** | Super Admin | Group Ventures Portal Switcher | `/admin/hbs`, `/admin/empanelment` | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-A05** | Super Admin | Settings & Staff Users | `/admin/settings`, `/admin/users` | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-A06** | Super Admin | Super Admin Logout Flow | Header / Sidebar Logout | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-A07** | Super Admin | Post-Logout Direct URL Access | `/admin/leads` | Unauth | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-B01** | Employee RBAC | Employee Login & Assigned Sections | `/admin-login` -> `/admin/leads` | `employee` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-B02** | Employee RBAC | Access Denied View on Unassigned Section | `/admin/settings` | `employee` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-B03** | Employee RBAC | User Management Direct Access Denied | `/admin/users` | `employee` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-B04** | Employee RBAC | Direct API 403 Forbidden Check | `/api/admin-users` (Console) | `employee` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-B05** | Employee RBAC | Employee Logout & Direct Access | Logout -> `/admin/leads` | `employee` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-C01** | Auth & Edge | Missing Session Cookie (Edge 307) | `/admin` | None | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-C02** | Auth & Edge | Open Redirect Sanitization Matrix | `/admin-login?returnTo=...` | Super Admin | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-C03** | Auth & Edge | Forged Cookie Rejection | Cookie `c_fake_cuid_...` | Forged | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-C04** | Auth & Edge | Robots & Noindex Headers Check | DevTools Network Headers | None | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-C05** | Auth & Edge | Brute-Force Rate Limiter (HTTP 429) | `/admin-login` (5+ failures) | None | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-D01** | Users & Roles| Staff Directory Inspection | `/admin/users` | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-D02** | Users & Roles| Modal Permissions Check (No Settings) | `/admin/users` (Add Modal) | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-E01** | Usability | Desktop Layout & Fixed Scroll | `/admin` (>= 1280px) | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-E02** | Usability | Tablet Viewport Adaptation | `/admin` (820px) | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-E03** | Usability | Mobile Hamburger Menu & Drawer | `/admin` (< 768px) | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-E04** | Usability | Sidebar Search Keyword Filtering | Sidebar Search Box | `admin` | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |
| **TC-E05** | Usability | Login Card Layout & Error States | `/admin-login` | None | `[ ] PASS`<br>`[ ] FAIL`<br>`[ ] BLOCKED` | |

---

## 7. Known Limitations & Safe Testing Boundary

1. **Subdomain Testing on Localhost:**
   Testing subdomain routing (`hindbuilding.hindustanprojects.in`, `empanelment.hindustanprojects.in`) requires local DNS host mapping in `C:\Windows\System32\drivers\etc\hosts`. In standard localhost browsing, subdomain isolation is verified via automated simulations in `test_admin_url_security.ts`.
2. **Read-Only Inspection of Staff Management:**
   During manual testing, do not submit destructive deletions or account creations on live databases. Use the modal purely to inspect permission pills and form fields.
3. **Rate Limiting Lockout Window:**
   Executing TC-C05 locks the tester's IP address out of `/api/auth/login` for 15 minutes. It is recommended to perform TC-C05 as the final test in the sequence.

---

## 8. Safe Recovery Instructions

If an unexpected error or unexpected session state occurs during testing:
1. **Clear Browser State:**
   In Chrome/Edge: Open DevTools > Application > Storage > Click **"Clear site data"**.
2. **Restart Frontend Development Server:**
   Press `Ctrl + C` in the frontend terminal, then restart:
   ```powershell
   npm run dev
   ```
3. **Verify Express Backend Health:**
   Open a browser to `http://localhost:5000/api/health` to confirm the backend process is healthy and connected to the local database.

---

## 9. Final Confirmation

- **No Code Modifications:** Zero application, test, or config files were altered.
- **No Database Changes:** Zero SQL, Prisma, or seed commands were run.
- **No Git State Changes:** `Hipro-Main` and `Hipro-Web` remain identical to their post-audit baseline.
- **Ready for User Execution:** The manual checklist is complete, unambiguous, and ready for browser validation on localhost.

