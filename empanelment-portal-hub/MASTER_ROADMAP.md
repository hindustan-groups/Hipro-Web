# 🏛️ HINDUSTAN PROJECTS — EMPANELMENT PORTAL MASTER ROADMAP & MIGRATION HUB

**Project Target:** Complete Re-architecture & Unification of Vendor/Contractor Empanelment Portal into HiPRO Master Ecosystem (`Hipro-Web`)  
**Parent Organization:** Hindustan Projects (HiPRO)  
**Target Subdomain:** `empanelment.hindustanprojects.in`  
**Master Admin Route:** `/admin/empanelment`  
**Public Portal Route:** `/empanelment`  
**Unified Backend:** `Hipro-Web/backend` (Express + TypeScript + Prisma PostgreSQL)  
**Date Created:** October 12, 2026  

---

## 🛡️ CORE SAFETY RULES (ZERO DISRUPTION POLICY)

1. **Main Site Protection First**: Existing HiPRO and HiBUILD (HBS) public routes, CMS builders, and databases must NEVER be modified destructively. All new work is strictly isolated in dedicated modules.
2. **Modular Architecture**: No monolithic 250KB files (like the old `AdminPage.jsx`). Every module has a single responsibility.
3. **Database Consistency**: All models reside in `backend/prisma/schema.prisma` using PostgreSQL with clean relational integrity (no more disjointed SQLite files).
4. **Staff Permission Delegation**: Follow the exact pattern of `AdminAccessWrapper.tsx` so internal staff/employees can be given task-based access (e.g. only Applications, only Gate Passes, only Tenders).
5. **Mobile-First & Local-Vendor Friendly**: Indian contractors, small sub-contractors, and suppliers in Bhilwara / Rajasthan / Tier-2/3 India must be able to use the portal effortlessly on Android smartphones with camera compression and bilingual cues.

---

## 🗺️ PHASE-BY-PHASE EXECUTION MATRIX

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: DATABASE ARCHITECTURE (PRISMA POSTGRESQL)                     │
│ • VendorApplication (Master profiles, documents, class tiers)          │
│ • EmpanelmentTender & VendorBid (Procurement & quoting engine)         │
│ • SiteGatePass (Daily 24-hr site security QR access)                   │
│ • VendorWorkOrder & VendorInvoice (Milestones & payment tracking)      │
│ • EmpanelmentTicket (Vendor helpdesk & communications)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: UNIFIED BACKEND API SUITE (EXPRESS + TS + PRISMA)             │
│ • backend/src/routes/empanelment.ts                                    │
│ • backend/src/controllers/empanelment/                                 │
│   ├─ applications.controller.ts (Submit, Audit, Verify, Class Tier)    │
│   ├─ tenders.controller.ts (Create, Publish, Bid submissions)          │
│   ├─ gatepass.controller.ts (Generate, Validate QR, Site logs)         │
│   ├─ workorders.controller.ts & invoices.controller.ts (Billing)       │
│ • Cloudinary camera photo auto-compression & storage pipeline          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: MASTER ADMIN CONSOLE (/admin/empanelment)                     │
│ • Exact Hind Build (HBS) brand switcher & sidebar integration          │
│ • Staff task delegation & role-based access wrapper                    │
│ • Dedicated modular views:                                             │
│   ├─ Overview Dashboard (/admin/empanelment)                           │
│   ├─ Application Pipeline & Drawer Review (/admin/empanelment/apps)    │
│   ├─ Verified Vendor Directory & ID Card (/admin/empanelment/vendors)  │
│   ├─ Tenders & Bid Evaluation (/admin/empanelment/tenders)             │
│   ├─ Daily Gate Passes (/admin/empanelment/gate-passes)                │
│   ├─ Invoices & Milestones (/admin/empanelment/invoices)               │
│   ├─ Category & Criteria CMS (/admin/empanelment/settings)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: LOCAL VENDOR MOBILE PUBLIC PORTAL (/empanelment)              │
│ • 5-Step Registration Wizard with camera photo auto-compression        │
│ • Live GSTIN auto-decoder (State code extraction, entity type, PAN)    │
│ • Instant Tracking (/empanelment/track) with live audit stage bar      │
│ • Digital Smart PVC ID Card with 3D Lanyard & QR verification          │
│ • 24-Hour QR Site Gate Pass generator for active work sites            │
│ • Active Tenders Radar (/empanelment/tenders)                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: SUBDOMAIN ROUTING & PRODUCTION VALIDATION                     │
│ • Next.js middleware.ts rewrite for empanelment.hindustanprojects.in   │
│ • Zero-downtime VPS deployment preparation (Single unified backend)    │
│ • End-to-end automated testing & verification                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 PROGRESS TRACKER

- [x] Step 0: Clone & deep audit of `hindustan-groups/Empanelment-Portal`
- [x] Step 1: Create dedicated `empanelment-portal-hub/` workspace & rules
- [ ] Step 2: Implement Prisma PostgreSQL models in `schema.prisma`
- [ ] Step 3: Build backend route & controllers (`/api/empanelment/*`)
- [ ] Step 4: Integrate into Admin Sidebar & AdminAccessWrapper (Staff task delegation)
- [ ] Step 5: Build Master Admin Empanelment UI views
- [ ] Step 6: Build Public Mobile-First Vendor Wizard & Tracking Portal
- [ ] Step 7: Configure Next.js Subdomain rewrite & test on local & VPS
