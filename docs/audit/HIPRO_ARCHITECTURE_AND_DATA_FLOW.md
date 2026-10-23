# HINDUSTAN PROJECTS (HiPRO) — ARCHITECTURE AND DATA FLOW
**Document Reference:** `DOC-HIPRO-AUDIT-002`  
**Audit Date:** October 2026 (Local System Time: 2026-10-21)  
**Status:** Complete Read-Only Technical Audit  
**Author/Auditor:** Antigravity AI Senior Technical Auditor  

---

## 1. High-Level Ecosystem Topology

The Hindustan Projects ecosystem is structured as a decoupled full-stack architecture featuring a Next.js 14 frontend, an Express/TypeScript REST API backend, a PostgreSQL relational database on Neon Serverless, and Cloudinary for media assets.

```mermaid
graph TD
    subgraph Clients ["Public Users & Administrators"]
        U1["Desktop & Mobile Users"]
        U2["HBS Sub-brand Visitors"]
        U3["Vendors / Subcontractors"]
        A1["HiPRO Admin & Marketing Team"]
    end

    subgraph Ingress ["Edge & Ingress Routing (Vercel)"]
        D1["www.hindustanprojects.in"]
        D2["hindbuilding.hindustanprojects.in"]
        D3["empanelment.hindustanprojects.in"]
        MW["Next.js Edge Middleware<br/>(middleware.ts)"]
    end

    subgraph FrontendApp ["Next.js 14.2 App Router (Vercel)"]
        R1["(site) Route Group<br/>HiPRO Corporate Pages"]
        R2["hbs Route Group<br/>HiBUILD Specialized CMS Pages"]
        R3["empanelment Route Group<br/>Vendor Onboarding Portal"]
        R4["admin Route Group<br/>Unified Multi-Console CMS"]
        PROXY["Next.js Proxy Rewrites<br/>(/api/:path* -> Render)"]
    end

    subgraph BackendApp ["Express REST API (Render Docker)"]
        SRV["Express Server (server.ts)"]
        AUTH["Auth Middleware (adminSession)"]
        CTRL["Domain Controllers & Services"]
        MAIL["Automail Engine (Nodemailer)"]
    end

    subgraph DataStore ["Cloud Persistence & Storage"]
        NEON[("Neon PostgreSQL 16<br/>Serverless Connection Pool")]
        CDN["Cloudinary Media CDN<br/>Images & PDF Documents"]
        SMTP["Hostinger SMTP Gateway<br/>Corporate Outbound Email"]
    end

    U1 --> D1
    U2 --> D2
    U3 --> D3
    A1 --> D1

    D1 --> MW
    D2 --> MW
    D3 --> MW

    MW --> R1
    MW --> R2
    MW --> R3
    MW --> R4

    R1 -.->|SSR / Fetch| PROXY
    R2 -.->|SSR / Fetch| PROXY
    R3 -.->|Client API Calls| PROXY
    R4 -.->|Mutations with Cookie| PROXY

    PROXY --> SRV
    SRV --> AUTH
    AUTH --> CTRL
    CTRL -->|Prisma 5.22| NEON
    CTRL -->|Upload Stream| CDN
    CTRL --> MAIL
    MAIL --> SMTP
```

---

## 2. Frontend Application Architecture (Next.js 14.2)

### 2.1 Framework & Core Technologies
- **Framework:** Next.js 14.2.5 (App Router).
- **Runtime:** Node.js 18+ on Vercel Edge/Serverless functions.
- **Styling:** TailwindCSS 3.4.10, Tailwind Typography, Tailwind Animate, Framer Motion 11.3.28, Lucide React icons.
- **Typography:** Montserrat (Body & Display), Playfair Display (Luxury/Accent Headings), JetBrains Mono (Technical/Data figures).

### 2.2 Hostname Routing Middleware (`frontend/middleware.ts`)
The multi-domain ecosystem routes distinct hostnames to specific subtrees within the App Router:
- **`hindbuilding.hindustanprojects.in`** (or `hindbuilding.localhost:3000`): Rewrites the incoming request to `/hbs/*`.
- **`empanelment.hindustanprojects.in`** (or `empanelment.localhost:3000`): Rewrites the incoming request to `/empanelment/*`.
- **`www.hindustanprojects.in`** (and root domain): Renders default corporate routes from `frontend/app/(site)/*`.
- **Admin Access:** `/admin` and `/admin-login` remain accessible across hostnames or via the primary domain.

### 2.3 Route Tree Breakdown
```
frontend/app/
├── (site)/                  # Primary HiPRO Public Corporate Website
│   ├── page.tsx             # Homepage (Hero, Services, Projects, Stats, Testimonials, CTA)
│   ├── about/               # About Us, Vision, Philosophy, Leadership, Milestone timeline
│   ├── services/            # Services Grid Listing & Filter
│   │   └── [slug]/          # Service Detail (Scope, Process, Deliverables, FAQs, Related Projects)
│   ├── projects/            # Architectural & Construction Portfolio Showcase
│   │   └── [slug]/          # Project Detail (Specifications, Gallery, Impact, Scope)
│   ├── blogs/               # Industry Insights & Educational Articles
│   │   └── [slug]/          # Blog Post Reader & Category Filters
│   ├── cost-estimator/      # Multi-step Interactive Construction Estimator
│   ├── contact/             # Contact Form, Corporate Office Map, Inquiries
│   ├── quotations/          # Formal Project RFP & Quotation Submission Form
│   ├── why-us/              # Value Proposition & Engineering Excellence
│   ├── privacy-policy/      # Legal & Privacy Disclosures
│   └── terms/               # Terms of Service
├── hbs/                     # Hind Building Solutions (HiBUILD) Sub-brand Portal
│   ├── layout.tsx           # Distinct HBS Layout, Header, Red Theme & Navigation
│   ├── page.tsx             # HBS Homepage (Hero, Chemical Services, Projects, Testimonials)
│   ├── services/            # HBS Building Solutions Catalog
│   │   └── [id]/            # HBS Service Detail
│   ├── projects/            # Structural Repair & Waterproofing Case Studies
│   │   └── [id]/            # HBS Project Detail
│   ├── contact/             # HBS Technical Advisory & Consultation Request
│   └── privacy-policy/      # HBS Brand Disclosures
├── empanelment/             # Vendor & Contractor Empanelment Portal
│   ├── layout.tsx           # Empanelment Shell & Navigation
│   ├── page.tsx             # Portal Landing & Tier Requirements
│   ├── register/            # Multi-step Contractor Registration Form & Document Upload
│   ├── status/              # Registration Tracking & Application Lookup
│   └── vendor-terms/        # Vendor Agreement & Compliance Rules
├── admin/                   # Unified Multi-Console Admin CMS
│   ├── layout.tsx           # Admin Shell with PortalSwitcherDropdown.tsx
│   ├── page.tsx             # Master Dashboard & System Metrics
│   ├── services/            # HiPRO Services Management
│   ├── projects/            # HiPRO Projects Showcase Management
│   ├── blogs/               # Blog Publishing & SEO Metadata Management
│   ├── leads/               # Unified Inquiries, Quotes & Estimator Leads
│   ├── automail/            # Multi-Brand Email Campaign Automation Engine
│   ├── hbs/                 # Dedicated HiBUILD CMS Console
│   └── empanelment/         # Empanelment Applications & Document Review
└── admin-login/             # Secure Single-Page Admin Authentication
```

### 2.4 API Ingress Proxy (`frontend/next.config.mjs`)
To eliminate Cross-Origin Resource Sharing (CORS) complications and cookie blocking in modern browsers, Next.js rewrites incoming `/api/:path*` requests directly to the Render backend service:
```javascript
// frontend/next.config.mjs
async rewrites() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hipro-backend-749v.onrender.com';
  return [
    {
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    },
  ];
}
```

---

## 3. Backend Application Architecture (Express + TypeScript)

### 3.1 Framework & Server Configuration
- **Server:** Express 4.22.2 compiled with TypeScript 5.6 and executed with `tsx`.
- **Security Middlewares:** `helmet` for HTTP headers, `cors` for cross-origin origin filtering, `cookieParser` for session management, and `express-rate-limit` for DDoS/brute-force mitigation.
- **Port:** Configured via `PORT` environment variable (defaults to `5000` locally, assigned dynamically by Render in production).
- **Health Check Endpoint:** `GET /health` returns JSON status `{ status: "ok", timestamp: ... }`.

### 3.2 Authentication & Session Architecture
The backend uses a secure, database-backed HTTP-only cookie authentication scheme:
1. **Login Request (`POST /api/admin/login`):** Validates email and password using `crypto.scryptSync` password hashing.
2. **Session Creation:** Generates a secure session token stored in PostgreSQL `AdminSession` table (or fallback token if table is uninitialized) with a 24-hour expiration.
3. **Session Delivery:** Dispatches an HTTP-only, secure, `SameSite=Lax` cookie named `adminSession`.
4. **Authentication Middleware (`authMiddleware.ts`):** Validates `req.cookies.adminSession` against the active session in PostgreSQL before granting access to protected CMS routes.

### 3.3 API Route Registry & Controller Mapping
| Router Path | Handler File | Primary Operations | Auth Required |
| :--- | :--- | :--- | :---: |
| `/api/services` | `services.routes.ts` | List services, fetch service by slug, create, update, delete | Mutate only |
| `/api/projects` | `projects.routes.ts` | List projects, fetch project by slug, create, update, delete | Mutate only |
| `/api/blogs` | `blogs.routes.ts` | List published blogs, search, get blog by slug, CMS manage | Mutate only |
| `/api/about` | `about.routes.ts` | Get corporate about profile, update singleton records | Mutate only |
| `/api/hero` | `hero.routes.ts` | Get active homepage hero slides, create/update slides | Mutate only |
| `/api/estimator` | `estimator.routes.ts` | Ingest cost calculator leads, list leads for admin | Read leads only |
| `/api/contact` | `contact.routes.ts` | Ingest contact inquiries, admin lead management | Read leads only |
| `/api/quotes` | `quotes.routes.ts` | Ingest formal RFPs/quotations, admin review | Read leads only |
| `/api/testimonials`| `testimonials.routes.ts`| Fetch approved reviews, CMS management | Mutate only |
| `/api/faqs` | `faqs.routes.ts` | Fetch categorized FAQs, CMS management | Mutate only |
| `/api/team` | `team.routes.ts` | Fetch leadership profiles, CMS management | Mutate only |
| `/api/careers` | `careers.routes.ts` | Fetch job postings, submit resumes, CMS manage | Mutate only |
| `/api/hbs/*` | `hbs.routes.ts` | HBS content, services, projects, leads CMS | Mutate only |
| `/api/empanelment/*`| `empanelment.routes.ts`| Vendor applications, file uploads, approval status | Mutate only |
| `/api/automail/*` | `automail.routes.ts` | Campaign creation, template builder, email dispatch | Yes (All) |
| `/api/upload` | `upload.routes.ts` | Image and PDF document uploads via Cloudinary | Yes (All) |
| `/api/admin/*` | `admin.routes.ts` | Admin auth, session verification, user profile | Yes (Except login) |

---

## 4. Database Layer & Model Architecture (Prisma & Neon)

### 4.1 Database Specification
- **Engine:** PostgreSQL 16.
- **Hosting:** Neon Serverless PostgreSQL (`ep-rapid-salad-azar0h0l.c-3.ap-southeast-1.aws.neon.tech`).
- **ORM:** Prisma Client 5.22.0.
- **Connection Mode:** Pooled connection string with SSL enabled (`sslmode=require`).

### 4.2 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    AdminUser ||--o{ AdminSession : "has active"
    
    Service ||--o{ Project : "related to"
    ServiceCategory ||--o{ Service : "categorizes"
    
    BlogCategory ||--o{ Blog : "categorizes"
    
    HbsService ||--o{ HbsProject : "tagged in"
    
    VendorApplication ||--o{ VendorDocument : "submits"
    
    AutomailCampaign ||--o{ AutomailRecipient : "targets"
    AutomailTemplate ||--o{ AutomailCampaign : "uses"

    AdminUser {
        string id PK
        string email UK
        string passwordHash
        string role
        datetime createdAt
    }

    AdminSession {
        string id PK
        string token UK
        string userId FK
        datetime expiresAt
    }

    Service {
        string id PK
        string title
        string description
        string features
        string icon
        string image
        boolean isPopular
        int order
    }

    Project {
        string id PK
        string title
        string slug UK
        string client
        string location
        string category
        string description
        string heroImage
        string galleryImages
        boolean featured
        boolean noIndex
    }

    Blog {
        string id PK
        string title
        string slug UK
        string excerpt
        string content
        string coverImage
        boolean published
        string metaTitle
        string metaDescription
    }

    HbsContent {
        string id PK
        string heroTitle
        string heroSubtitle
        string aboutTitle
        string aboutText
        string contactPhone
        string contactEmail
    }

    HbsLead {
        string id PK
        string name
        string email
        string phone
        string serviceType
        string message
        string status
    }

    VendorApplication {
        string id PK
        string trackingId UK
        string companyName
        string contactName
        string email
        string phone
        string pan
        string gstin
        string category
        string status
    }

    AutomailCampaign {
        string id PK
        string name
        string brand
        string subject
        string status
        int sentCount
        datetime scheduledAt
    }
```

---

## 5. Media & Asset Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin CMS User
    participant Frontend as Next.js Admin (/admin)
    participant Backend as Express API (/api/upload)
    participant Cloudinary as Cloudinary CDN (res.cloudinary.com)
    participant DB as Neon PostgreSQL

    Admin->>Frontend: Select Image / PDF File (Drag & Drop)
    Frontend->>Backend: Multipart Form-Data (file, folder)
    Note over Backend: Multer parses memory buffer
    Backend->>Cloudinary: Upload Stream (folder: hipro/...)
    Cloudinary-->>Backend: 200 OK (secure_url, public_id, format)
    Backend-->>Frontend: JSON Response { url: "https://res.cloudinary.com/..." }
    Frontend->>Admin: Preview Rendered in CMS Form
    Admin->>Frontend: Click "Save Changes"
    Frontend->>Backend: PUT/POST with image URL
    Backend->>DB: Store secure_url string in Model Column
    DB-->>Backend: Record Saved
    Backend-->>Frontend: 200 Success
```

---

## 6. Detailed Data Flow Sequences

### 6.1 Public User Page Request (SSR / Cache Pipeline)
```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Web Browser
    participant Vercel as Vercel Edge Server
    participant NextSSR as Next.js Page Renderer
    participant Render as Express API (Render)
    participant DB as Neon PostgreSQL

    Visitor->>Vercel: GET /projects/adani-gas-chamber-shinghpur
    Vercel->>NextSSR: Invoke Route Handler
    NextSSR->>Render: GET /api/projects/adani-gas-chamber-shinghpur
    Render->>DB: prisma.project.findUnique({ where: { slug } })
    DB-->>Render: Project Data Record
    Render-->>NextSSR: 200 OK (JSON Data)
    NextSSR->>NextSSR: Generate SEO Metadata (Title, Schema, Canonical)
    NextSSR->>NextSSR: Render HTML with Tailwind & Components
    NextSSR-->>Vercel: Hydrated HTML + Static Cache Tags
    Vercel-->>Visitor: Deliver Optimized HTML / CSS Response
```

### 6.2 Customer Lead & Quotation Ingestion Flow
```mermaid
sequenceDiagram
    autonumber
    actor Client as Prospective Client
    participant Form as Next.js Lead Component
    participant Proxy as Next.js API Proxy
    participant Backend as Express Lead Controller
    participant DB as Neon PostgreSQL
    participant Mailer as Nodemailer Engine
    participant Team as HiPRO Project Team

    Client->>Form: Submit Cost Estimator / Quotation Request
    Form->>Form: Validate Inputs (Zod / HTML5)
    Form->>Proxy: POST /api/quotes or /api/estimator
    Proxy->>Backend: Forward POST Body
    Backend->>DB: prisma.quote.create(...) or prisma.estimatorLead.create(...)
    DB-->>Backend: Record Persisted (UUID)
    Backend->>Mailer: Dispatch Internal Notification Email
    Mailer->>Team: Email Alert: "New Project Lead Received"
    Backend-->>Proxy: 201 Created { success: true, id: "..." }
    Proxy-->>Form: 201 Response
    Form->>Client: Display Confirmation & Reference ID
```

---

## 7. Security & Compliance Architecture

- **CORS Strategy:** Origin whitelist limited to `hindustanprojects.in`, `*.hindustanprojects.in`, and verified local development ports.
- **Rate Limiting:** `express-rate-limit` enforces strict request throttling on lead submission routes and login endpoints to block spam bots and brute-force attempts.
- **Environment Isolation:** Zero credentials or private keys hardcoded in version control; all credentials ingested via environment variables at runtime on Vercel and Render.
