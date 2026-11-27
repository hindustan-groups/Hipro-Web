# Hindustan Projects (HiPRO) — Web Ecosystem

Production monorepo for **Hindustan Projects (HiPRO)**, powering the corporate website, **Hind Building Solutions (HBS)** sub-brand portal, **Vendor Empanelment & Partner Portal**, and the **Master Admin & CRM Command Center**.

---

## Architecture Overview

The repository is organized as a two-service TypeScript monorepo (`frontend` + `backend`) with root-level build and test orchestration:

| Module | Route / Domain | Description |
| :--- | :--- | :--- |
| **HiPRO Corporate** | `/` (`www.hindustanprojects.in`) | Corporate showcase, services, project portfolio, interactive cost estimator, careers, blogs, partner verification, and policy pages. |
| **Hind Building Solutions (HBS)** | `/hbs` (`hindbuilding.hindustanprojects.in`) | Dedicated sub-brand storefront with independent services, projects, testimonials, and lead capture. |
| **Vendor Empanelment Portal** | `/empanelment` (`empanelment.hindustanprojects.in`) | Vendor/contractor onboarding, application tracking, tenders & bidding, work orders, invoices, site gate passes (`/gate-pass`, `/verify-pass`), and support tickets. |
| **Master Admin & CRM** | `/admin` | RBAC-protected command center for CMS (HiPRO, HBS, Empanelment), leads/quotes/applications, AutoMail campaigns, CRM mail, security, and backups. |
| **REST API & Workers** | `:5000` (`/api/*`) | Express + Prisma API server handling auth, sliding sessions, RBAC, uploads, SMTP/AutoMail, Web Push, and PostgreSQL persistence. |

---

## Tech Stack

### Frontend (`frontend/`)
- **Framework:** Next.js `15.5.28` (App Router, Turbopack in dev)
- **UI:** React `18.3.1`, TypeScript `5`, Tailwind CSS `3.4.10`, `lucide-react`

### Backend (`backend/`)
- **Runtime & Server:** Node.js, Express `4.22.3`, TypeScript `5.6`, `tsx`
- **Database & ORM:** PostgreSQL with Prisma `5.22.0`
- **Email & Notifications:** `nodemailer`, `hostinger-mail-api-sdk`, `web-push` (VAPID)
- **Data, Files & Auth:** `exceljs`, `csv-parse`, `multer`, `otplib`, `qrcode`, `cookie-parser`

---

## Repository Structure

```text
Hipro-Web/
├── package.json                 # Root build, lint, and test orchestration
├── frontend/                    # Next.js 15 App Router application
│   ├── app/
│   │   ├── (site)/              # HiPRO corporate pages
│   │   ├── hbs/                 # Hind Building Solutions portal
│   │   ├── empanelment/         # Vendor empanelment, tenders & gate passes
│   │   ├── admin/               # Master Admin & CRM dashboard
│   │   ├── admin-login/         # Admin authentication gateway
│   │   └── api/                 # Next.js route handlers / proxies
│   ├── components/              # Shared, HBS, Empanelment, and Admin UI components
│   ├── lib/                     # API clients, SEO helpers, and utilities
│   ├── test/                    # Unit and redirect smoke tests
│   └── next.config.mjs          # Strict BACKEND_API_URL & image/rewrite config
├── backend/                     # Express + Prisma API server
│   ├── prisma/                  # schema.prisma and seed scripts
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Auth, RBAC, security headers, upload hardening
│   │   ├── routes/              # 27 modular /api/* route groups
│   │   ├── services/            # AutoMail, CRM mail, and domain services
│   │   ├── scripts/             # Admin bootstrap and security/unit test suites
│   │   └── index.ts             # Express app entry point & health checks
│   └── .env.example             # Backend environment variable template
├── empanelment-portal-hub/      # Empanelment architecture specs & roadmap
└── docs/                        # Audit, security, RBAC, and release reports
```

---

## Local Development Setup

### Prerequisites
- **Node.js** 20+ and **npm**
- **PostgreSQL** database (local or Docker)

### 1. Install Dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
Copy `backend/.env.example` to `backend/.env` and configure your local database and secrets:

```bash
cp backend/.env.example backend/.env
```

Key variables in `backend/.env`:
- `PORT=5000`
- `NODE_ENV=development`
- `DATABASE_URL="postgresql://postgres:password@localhost:5432/hipro_db?schema=public"`
- `JWT_SECRET` — Secret key for signing admin & vendor sessions
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` — Initial root admin credentials
- `ALLOWED_ORIGINS` — Comma-separated CORS origins (includes `http://localhost:3000` by default)

**Frontend (`frontend/.env.local`):**
Create `frontend/.env.local`:

```env
BACKEND_API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> **Note:** `frontend/next.config.mjs` enforces a fail-closed check in non-production environments—`BACKEND_API_URL` must be explicitly set to a valid `http://` or `https://` origin without paths, queries, or credentials, and will refuse to fall back to the production Render backend in local development.

### 3. Initialize Database & Seed Data

```bash
# Push Prisma schema to PostgreSQL
npm run db:push --prefix backend

# Create initial root admin user
npm run create-admin --prefix backend

# Seed vendor empanelment categories
npm run seed:vendor-categories --prefix backend
```

### 4. Start Development Servers

Run the backend and frontend in separate terminals:

```bash
# Terminal 1 — Express API (http://localhost:5000)
npm run dev --prefix backend

# Terminal 2 — Next.js Frontend (http://localhost:3000)
npm run dev --prefix frontend
```

Health check endpoints are available at `GET /health` and `GET /api/health` on the backend.

---

## Scripts & Testing

Run from the repository root (`Hipro-Web/`):

| Command | Description |
| :--- | :--- |
| `npm test` | Runs both backend and frontend unit test suites |
| `npm run test:backend` | Runs backend security, RBAC, Auth, AutoMail, and parser tests |
| `npm run test:frontend` | Runs frontend CMS, SEO, schema alignment, and safety tests |
| `npm run test:integration` | Runs backend integration test suite |
| `npm run test:smoke` | Runs frontend redirect smoke tests |
| `npm run lint` | Runs Next.js ESLint checks on `frontend/` |
| `npm run build` | Compiles TypeScript backend (`tsc`) and builds Next.js frontend |

---

## Security & Safety Guards

This codebase includes strict fail-closed protections to prevent accidental production side effects during local development:

- **Email Interception:** Outside `NODE_ENV=production`, `emailSender.ts` intercepts outbound emails so live SMTP messages are never sent from dev/test environments.
- **Upload Guard:** `ALLOW_DEV_CLOUDINARY_UPLOADS` defaults to `false`, returning mock URLs in development unless explicitly enabled.
- **Database Seed Guards:** Production and remote seeding require explicit confirmation flags (`ALLOW_PRODUCTION_SEED`, `ALLOW_REMOTE_SEED`, `TARGET_DB_HOST_CONFIRMATION`, `TARGET_DB_NAME_CONFIRMATION`).
- **API Hardening:** Explicit CORS allowlist, custom security headers middleware (`X-Powered-By` disabled), sliding session validation, RBAC enforcement, and secret scanning via `.gitleaks.toml`.

---

## Additional Documentation

- **Empanelment Specs:** See [`empanelment-portal-hub/`](./empanelment-portal-hub) for database schema specs, feature extraction maps, and standards.
- **Audit & Engineering Reports:** See [`docs/`](./docs) for security reviews, RBAC audits, SEO reports, and release checklists.
