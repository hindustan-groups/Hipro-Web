# 🔍 HINDUSTAN PROJECTS — EMPANELMENT REPOSITORY FEATURES EXTRACTION MAP

This document analyzes every component, utility, modal, and workflow from the previous repository (`hindustan-groups/Empanelment-Portal`) and defines how each will be ported and enhanced in the new unified architecture.

---

## 1. COMPONENT PORTING & ENHANCEMENT MATRIX

| Old Component (`src/components/`) | Original Role | Issues in Old Repo | Enhanced Implementation in Hipro-Web |
| :--- | :--- | :--- | :--- |
| `EmpanelmentForm.jsx` (117 KB) | 5-Step registration form wizard | Monolithic file, state resets on reload, heavy bundle | Split into clean modular steps (`Step1Category.tsx`, `Step2Statutory.tsx`, `Step3Financials.tsx`, `Step4Documents.tsx`, `Step5Declaration.tsx`) with `localStorage` draft saving and phone camera auto-compressor. |
| `GstVerifier.jsx` (7 KB) | Decodes 15-digit GSTIN | Only extracted state and entity | Upgraded with real checksum validation, auto-populates PAN field, displays green verification badge, handles composition vs regular dealer tags. |
| `EligibilityCalculator.jsx` (13 KB) | Score engine (0-100) based on turnover & years | Hardcoded scoring tiers | Dynamic scoring engine connected to admin-configured weights. Assigns Class A (₹5Cr+), Class B (₹1Cr+), or Class C (<₹1Cr). |
| `VendorIdCardModal.jsx` (54 KB) | Dual CR80 Smart PVC Card with Lanyard mockup | React hook ordering bug (`11005a3`), heavy inline SVG | Clean SVG vector card engine with dynamic QR code (links to `/empanelment/verify?id=...`), blood group, validity stamp, print-ready CSS (`@media print`). |
| `GatePassModal.jsx` (12 KB) | Generates 24-hr QR Site Gate Pass | Static data, no server verification | Connected to PostgreSQL `SiteGatePass` model. Generates real secure 24-hr token QR. Site security guard can scan from phone to verify authenticity. |
| `VendorDossierA4Modal.jsx` (52 KB) | Printable multi-page A4 dossier & certificate | Unreliable pagination, CSS print overflow | Ultra-crisp multi-page A4 Dossier with corporate header, CEO digital stamp, compliance audit summary, and watermarked printable layout. |
| `ActiveTenders.jsx` (8.7 KB) | Lists active tenders on homepage | Mock data array | Real-time database tenders from `EmpanelmentTender` model. Vendors can download RFP documents and submit digital bids directly. |
| `ContractManager.jsx` (35 KB) | Milestone payouts & contracts | Fragmented state | Integrated with `VendorWorkOrder` and `VendorInvoice` models in the master admin. |
| `DigitalSignature.jsx` (5.8 KB) | Canvas signature pad | Failed on mobile touch | Touch-optimized HTML5 canvas signature engine with smooth smoothing curve, clear, undo, and PNG export. |
| `SecurityCaptcha.jsx` (3.2 KB) | Math anti-bot challenge | Client-only validation | Cryptographically signed timestamped anti-bot challenge preventing spam submissions. |
| `SuccessModal.jsx` (28 KB) | Confetti & receipt after submit | Hardcoded contact details | Modern success modal with dynamic tracking code, 1-click PDF download, and WhatsApp share link. |
| `SupportWidget.jsx` (6.5 KB) | Floating helpdesk widget | Static phone/email | Multi-channel floating widget (Direct WhatsApp, Toll-free helpline, Email, and live Track Application button). |

---

## 2. PAGES PORTING & ENHANCEMENT MATRIX

| Old Page (`src/pages/`) | Original Route | New Route in Hipro-Web | Modernized Enhancements |
| :--- | :--- | :--- | :--- |
| `Home.jsx` | `/` | `/empanelment` | Brand-aligned hero, trust metrics, quick category cards, live tender ticker, eligibility calculator preview. |
| `ApplyPage.jsx` | `/apply` | `/empanelment/apply` | Guided 5-step registration wizard with auto-save draft, step validation, and camera compression. |
| `TrackPage.jsx` | `/track` | `/empanelment/track` | Live audit progress tracker (Application Received ➔ Under Review ➔ Technical Audit ➔ Approved) with instant ID card download. |
| `TendersPage.jsx` | `/tenders` | `/empanelment/tenders` | Searchable tender opportunities radar with category filter, budget indicators, and RFP download. |
| `GuidelinesPage.jsx` | `/guidelines` | `/empanelment/guidelines` | Official NBC 2016 compliance standards, vendor code of conduct, and document requirement checklist. |
| `VerifyPassPage.jsx` | `/verify-pass` | `/empanelment/verify-pass` | Mobile-friendly QR scanner page for site security guards to verify worker gate passes on active sites. |
| `AdminPage.jsx` (241 KB) | `/admin` | `/admin/empanelment/*` | Replaced monolithic file with HBS-style multi-module admin suite (Applications, Vendors, Tenders, Gate Passes, Invoices, Settings). |
| `AdminLoginPage.jsx` | `/admin-login` | Removed / Unified | Replaced by single unified HiPRO Master Admin login with Role-Based Access Control (`AdminAccessWrapper`). |
