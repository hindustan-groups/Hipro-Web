# HINDUSTAN PROJECTS (HiPRO) — DEPLOYMENT AND GIT WORKFLOW
**Document Reference:** `DOC-HIPRO-AUDIT-005`  
**Audit Date:** October 2026 (Local System Time: 2026-10-21)  
**Status:** Complete Read-Only Technical Audit  
**Author/Auditor:** Antigravity AI Senior Technical Auditor  

---

## 1. Production Hosting & Infrastructure Topology

The Hindustan Projects production ecosystem is distributed across specialized cloud service providers to optimize performance, scalability, and operational reliability:

```
+--------------------------------------------------------------------------------+
|                           PRODUCTION DNS (CLOUDFLARE / REGISTRAR)              |
+--------------------------------------------------------------------------------+
        |                                   |                            |
        | CNAME / A                         | CNAME                      | CNAME
        v                                   v                            v
+-----------------------+       +------------------------+      +----------------+
|  VERCEL PRODUCTION    |       |  VERCEL PRODUCTION     |      | VERCEL / HOST  |
|  hindustanprojects.in |       |  hindbuilding.         |      | empanelment.   |
|  www.hindustan...     |       |  hindustanprojects.in  |      | hindustan...   |
+-----------------------+       +------------------------+      +----------------+
        |                                   |                            |
        +-----------------------------------+----------------------------+
                                            |
                                            | (Next.js Ingress Rewrite: /api/*)
                                            v
                        +---------------------------------------+
                        |      RENDER MANAGED WEB SERVICE       |
                        |      hipro-backend-749v.onrender.com  |
                        |      Docker / Node.js Runtime         |
                        +---------------------------------------+
                                            |
                                            v
                        +---------------------------------------+
                        |       NEON SERVERLESS POSTGRES        |
                        |       AWS Region: ap-southeast-1      |
                        |       Pooled Connection String        |
                        +---------------------------------------+
```

### 1.1 Service Hosting Breakdown
| Layer | Cloud Provider | Resource Name / ID | Production URL / Endpoint |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Vercel | `hipro-web` | `https://www.hindustanprojects.in` |
| **HBS Sub-brand** | Vercel | Custom Subdomain Rewrite | `https://hindbuilding.hindustanprojects.in` |
| **Empanelment Portal** | Vercel / Static | Standalone SPA Build (Current deployment reality; DEF-006 defect — repository architecture is Next.js App Router route group) | `https://empanelment.hindustanprojects.in` |
| **Backend REST API** | Render | `hipro-backend-749v` | `https://hipro-backend-749v.onrender.com` |
| **Relational Database** | Neon Tech | `ep-rapid-salad-azar0h0l` | `neondb` (PostgreSQL 16) |
| **Media & Asset CDN** | Cloudinary | `fczoredh` | `https://res.cloudinary.com/fczoredh/` |
| **Corporate Email** | Hostinger | Business Mail SMTP | `smtp.hostinger.com:465` |

---

## 2. Git Repository Status & Branch Topology

### 2.1 Repository Metadata
- **Remote Origin URL:** `https://github.com/hindustan-groups/Hipro-Web`
- **Active Working Branch:** `feature/automail-corporate-header-footer`
- **Head Commit SHA:** `7a27285` (`feat(automail): implement official corporate header and footer across all email dispatches`)
- **Production Base Branch:** `main` at commit `18c69d8` (`fix(typography): unify Hind Build mobile fonts with desktop...`)
- **Working Tree State:** Contains active changes (12 modified tracked files and 4 untracked items present at audit time).

### 2.2 Branch Topology Analysis
The repository currently maintains several active feature and hotfix branches:
- `main`: Production release branch. Auto-deploys to Vercel production on merge.
- `develop`: Integration and pre-release validation branch.
- `feature/automail-corporate-header-footer`: Active development branch containing the upgraded Automail multi-brand header and footer templates.
- `feature/hbs-subbrand-cms`: Feature branch containing HBS CMS integration enhancements.

---

## 3. Mandatory Engineering Change-Management Governance

To protect the live corporate website, strict release management rules must be observed for all future development:

```
[Issue Verified]
       │
       ▼
[Branch from 'main']  ───>  git checkout -b fix/issue-description
       │
       ▼
[Local Remediation]   ───>  Minimal, atomic commits + local testing
       │
       ▼
[Pull Request (PR)]   ───>  Automated build verification (no direct push to main)
       │
       ▼
[Owner Review]        ───>  Owner explicitly reviews scope & diff
       │
       ▼
[Owner Approval]      ───>  PR merged into 'main'
       │
       ▼
[Deploy to Prod]      ───>  Vercel / Render release verification
```

### 3.1 Rules of Engagement
1. **Zero Direct Pushes:** Direct commits and pushes to `main` are strictly prohibited.
2. **Branch Naming Standard:**
   - Bugfixes: `fix/<issue-id>-short-description` (e.g., `fix/def-001-project-slugs`)
   - Features: `feature/<feature-name>` (e.g., `feature/seo-schema-upgrade`)
3. **Owner Authorization Gate:** A passing build or merged PR does **not** grant automatic deployment authority. Explicit owner sign-off is mandatory before initiating production releases.
4. **Credential Safety:** Never commit `.env` files or hardcode API keys, database credentials, or secret tokens.

---

## 4. Build, Compilation & Verification Commands

### 4.1 Frontend Build Pipeline
```bash
# In directory: frontend/
npm install              # Install dependencies (Next 14, React 18, Tailwind)
npm run build            # Next.js build and static page generation
npm run start            # Start Next.js production server on port 3000
npm run lint             # Execute ESLint verification
```

### 4.2 Backend Build Pipeline
```bash
# In directory: backend/
npm install              # Install Express, Prisma, TypeScript dependencies
npm run build            # Compile TypeScript files into dist/ via tsc
npm run start            # Execute compiled dist/server.js
npm run dev              # Execute live server via tsx watch src/server.ts
```

### 4.3 Database Synchronization Commands
- **Current Approach:** `npm run db:push` (`prisma db push`) synchronizes schema changes directly without tracking migration history.
- **Recommended Remediation:** Migrate to tracked migrations:
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```

---

## 5. Rollback & Disaster Recovery Procedures

### 5.1 Frontend Rollback (Vercel)
In the event of a regression or broken build deployed to production:
1. Navigate to the **Vercel Project Dashboard** -> **Deployments**.
2. Locate the previous stable deployment (e.g., deployment corresponding to commit `18c69d8`).
3. Click the three dots (`...`) menu and select **Instant Rollback**.
4. Vercel routes 100% of incoming production traffic to the previous build within seconds.

### 5.2 Backend Rollback (Render)
1. Navigate to the **Render Dashboard** -> Web Service `hipro-backend-749v`.
2. Under the **Events** or **Deploy History** tab, locate the last known working release.
3. Select **Rollback to this deploy** to immediately relaunch the previous stable Docker container image.

### 5.3 Database Recovery (Neon Serverless)
Neon provides instantaneous Point-In-Time Recovery (PITR) and branching:
1. Access the **Neon Console** -> Project `ep-rapid-salad-azar0h0l`.
2. To recover from an accidental data corruption or schema push error, create a point-in-time branch at the specific timestamp preceding the incident.
3. Repoint the Render `DATABASE_URL` connection pooler to the restored branch.
