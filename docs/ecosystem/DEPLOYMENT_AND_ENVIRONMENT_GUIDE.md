# Deployment & Environment Configuration Guide

## 1. Hosting Architecture Overview

The Hindustan Projects monorepo ecosystem is deployed across two decoupled cloud hosting platforms to maximize edge performance, dynamic SSR capabilities, and secure background compute:

```
                          [ Internet / Users ]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [ Vercel Edge Network ]                  [ Render Cloud Platform ]
      (Next.js 15 Frontend)                   (Express / Node.js API)
      Project: hipro-web-r7y9                 Service: hipro-backend-749v
              │                                         │
              │ (API Calls via HTTPS)                   │ (Prisma ORM)
              └────────────────────► ◄──────────────────┘
                                     │
                                     ▼
                          [ PostgreSQL Database ]
                         (Neon / Render PostgreSQL)
```

---

## 2. Frontend Platform: Vercel

- **Vercel Project:** `hipro-web-r7y9`
- **Framework:** Next.js 15 (App Router, React Server Components)
- **Node.js Runtime:** Node.js 18.x / 20.x
- **Build Command:** `npm run build` (or `pnpm build`)
- **Output Directory:** `.next`
- **Root Directory:** `frontend`
- **Edge Middleware:** `frontend/middleware.ts` runs globally at Vercel's edge network, intercepting requests to handle:
  - Subdomain rewrites (`hindbuilding.*` to `app/hbs/`, `empanelment.*` to `app/empanelment/`).
  - Host isolation (redirecting `/admin` and `/admin-login` to canonical `www.hindustanprojects.in`).
  - Admin sliding session cookie verification (`admin_session`).

### Domain & DNS Configuration on Vercel
All DNS records point to Vercel's global edge network (`76.76.21.21` or `cname.vercel-dns.com`):

| Hostname | Type | Target / Routing Behavior |
| :--- | :--- | :--- |
| `hindustanprojects.in` | ALIAS / A | Apex domain; 308-redirected to `www.hindustanprojects.in`. |
| `www.hindustanprojects.in` | CNAME | Primary corporate web origin serving `app/(site)/*` and `/admin/*`. |
| `hindbuilding.hindustanprojects.in` | CNAME | HBS sub-brand rewritten to `app/hbs/*`. |
| `empanelment.hindustanprojects.in` | CNAME | Vendor Portal rewritten to `app/empanelment/*`. |
| `vendor.hindustanprojects.in` | CNAME | Alternative vendor portal alias rewritten to `app/empanelment/*`. |

---

## 3. Backend Platform: Render

- **Render Service Name:** `hipro-backend-749v`
- **Live URL:** `https://hipro-backend-749v.onrender.com`
- **Environment:** Node.js / Linux Container
- **Root Directory:** `backend`
- **Build Command:** `npm run build` (runs `prisma generate && tsc`)
- **Start Command:** `npm run start` (runs `node dist/index.js`)
- **Health Check Path:** `/health`
- **Keep-Alive Daemon:** Includes a background ping timer (`KEEP_ALIVE_INTERVAL_MS=600000` / 10 minutes) to prevent free-tier instances from spinning down during business hours.

---

## 4. Local Development Environment Setup

### Prerequisites
1. **Node.js:** v18.18+ or v20+
2. **Package Manager:** `npm` (v9+) or `pnpm` (v8+)
3. **Database:** PostgreSQL instance running on `localhost:5432`

### Step-by-Step Setup

```bash
# 1. Clone repository
git clone https://github.com/hindustan-groups/Hipro-Web.git
cd Hipro-Web

# 2. Configure Backend Environment
cd backend
cp .env.example .env
# Edit .env and set local DATABASE_URL (must be localhost / 127.0.0.1)

# 3. Install Backend Dependencies & Generate Prisma Client
npm install
npx prisma generate
npx prisma db push

# 4. Start Backend Development Server (Port 5000)
npm run dev

# 5. Configure Frontend Environment (in a new terminal)
cd ../frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000

# 6. Install Frontend Dependencies & Start Server (Port 3000)
npm install
npm run dev
```

### Local Multi-Domain Testing
To test subdomain rewrites locally without public DNS:
Add the following entries to your OS `hosts` file (`C:\Windows\System32\drivers\etc\hosts` on Windows or `/etc/hosts` on macOS/Linux):
```
127.0.0.1  localhost
127.0.0.1  hindbuilding.localhost
127.0.0.1  empanelment.localhost
```
You can then visit `http://hindbuilding.localhost:3000` and `http://empanelment.localhost:3000`.

---

## 5. Environment Variable Reference Guide

> [!CAUTION]
> This guide documents variable keys and their functional purposes only.
> **Never commit real secret values, passwords, or private API keys to source control.**

### Frontend Environment Variables (`frontend/.env.production`, Vercel Dashboard)

| Variable Name | Required | Purpose & Allowed Values |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | Fully qualified URL of backend API (e.g. `https://hipro-backend-749v.onrender.com` in prod, `http://localhost:5000` in dev). |
| `BACKEND_API_URL` | **Yes** | Server-side internal API URL for Server Components. |
| `NEXT_PUBLIC_BASE_URL` | Optional | Canonical site base URL (`https://www.hindustanprojects.in`). |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Optional | Public Cloudinary cloud identifier for media optimization. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`| Optional | Upload preset for unsigned client uploads. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | Google Analytics 4 measurement tag ID (`G-XXXXXXXXXX`). |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`| Optional | Google Search Console verification token. |

### Backend Environment Variables (`backend/.env`, Render Dashboard)

| Variable Name | Required | Purpose & Allowed Values |
| :--- | :--- | :--- |
| `PORT` | **Yes** | Port for Express server (defaults to `5000` in dev; set dynamically by Render in prod). |
| `NODE_ENV` | **Yes** | Runtime mode: `development`, `test`, or `production`. Governs security guards. |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (`postgresql://user:pass@host:5432/dbname?schema=public`). Must resolve to loopback in dev. |
| `ALLOWED_ORIGINS` | **Yes** | Comma-delimited CORS origin whitelist. Must include `https://www.hindustanprojects.in`, `https://hindbuilding.hindustanprojects.in`, `https://empanelment.hindustanprojects.in`. |
| `JWT_SECRET` | **Yes** | Cryptographic secret for signing administrative tokens. |
| `ADMIN_EMAIL` | Optional | Initial root administrator account email seeded on fresh database boot. |
| `ADMIN_PASSWORD` | Optional | Initial root administrator password seeded on fresh database boot. |
| `ADMIN_NAME` | Optional | Display name for the initial root administrator. |
| `SMTP_HOST` | Optional | Outbound SMTP server hostname (e.g. `smtp.hostinger.com`). |
| `SMTP_PORT` | Optional | Outbound SMTP port (`465` for SSL, `587` for STARTTLS). |
| `SMTP_USER` | Optional | Corporate mail account username (`info@hindustanprojects.in`). |
| `SMTP_PASS` | Optional | Corporate mail account password. |
| `HOSTINGER_API_TOKEN` | Optional | Hostinger Mail API REST token for port-443 delivery auto-rescue. |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary storage cloud identifier. |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API access key. |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API private secret. |

---

## 6. Safety Guards & Fail-Closed Gating Policies

The codebase enforces strict, fail-closed isolation gates across multiple operational layers:

1. **Email Safety Guard (Permanent Fail-Closed):**
   `ENABLE_LIVE_EMAIL_IN_DEV` has been completely eliminated. In any environment where `NODE_ENV !== "production"`, real outbound SMTP sockets and Hostinger API HTTPS dispatches are **prohibited and intercepted**. No environment flag can override this guard.
2. **Database Loopback Guard (`databaseSafety.ts`):**
   When `NODE_ENV !== "production"`, any database connection string pointing to an external hostname is immediately rejected, preventing test scripts from modifying live production databases.
3. **Production Seed Authorization:**
   Running seeds against a production database requires three matching confirmations:
   - `ALLOW_PRODUCTION_SEED=true` (or `ALLOW_REMOTE_SEED=true`)
   - `TARGET_DB_HOST_CONFIRMATION=<parsed-hostname>`
   - `TARGET_DB_NAME_CONFIRMATION=<parsed-dbname>`
4. **Dev Cloudinary Media Mocking:**
   `ALLOW_DEV_CLOUDINARY_UPLOADS=false` ensures that media uploads in local development return mock placeholder URLs rather than consuming Cloudinary bandwidth and storage quotas.

