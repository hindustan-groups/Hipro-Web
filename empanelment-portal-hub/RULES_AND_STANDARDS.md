# 📋 HINDUSTAN PROJECTS — EMPANELMENT ARCHITECTURAL RULES & CODING STANDARDS

## 1. Zero Disruption Rules (Main Site Protection)
1. **Never edit existing HiPRO models destructively**: The `Project`, `Service`, `HbsLead`, and `AutomailCampaign` models must remain untouched. All empanelment models are strictly additive.
2. **Never change existing `/admin` core files directly without backwards compatibility**: The existing admin dashboard, HBS modules, and SnapTech links must continue functioning exactly as they do today.
3. **Dedicated Namespaces**:
   - Backend APIs: All routes live under `/api/empanelment/*`.
   - Frontend Public: All routes live under `/empanelment/*` (with middleware rewriting `empanelment.hindustanprojects.in` ➔ `/empanelment`).
   - Frontend Admin: All admin routes live under `/admin/empanelment/*`.
   - Component Directory: `frontend/components/empanelment/` (public) and `frontend/components/admin/empanelment/` (admin).

---

## 2. Staff & Task-Based Delegation Standards (Employee Access)
To allow the company to delegate specific tasks to different employees/staff:
1. Every sub-page in `/admin/empanelment` is protected by `AdminAccessWrapper.tsx`.
2. Available granular permission keys:
   - `empanelment`: Grants master access to the entire Empanelment Suite.
   - `empanelment-applications`: Staff member can ONLY view, verify, and grade vendor applications.
   - `empanelment-tenders`: Staff member can ONLY publish tenders and review incoming vendor bids.
   - `empanelment-gatepasses`: Site supervisor or security guard can ONLY approve and scan daily 24-hr site gate passes.
   - `empanelment-billing`: Accounts executive can ONLY verify invoices, TDS, and milestone payouts.
3. If an employee logs in with only `empanelment-gatepasses`, they will see ONLY the gate pass module, preventing accidental tampering with tenders or master settings.

---

## 3. Local Vendor Friendly UI & Mobile UX Standards
1. **Bilingual Guidance**:
   - English heading with clear Hindi context subtitle.
   - Example: `<label>Bank Account Number <span className="text-slate-400 font-normal">/ बैंक खाता संख्या</span></label>`.
2. **Phone Camera Photo Auto-Compression**:
   - Small contractors take 10MB-15MB high-resolution camera photos of their documents.
   - On the client side before sending to the server, canvas-based image compression scales images to max 1600px width and 85% JPEG quality (~200KB-350KB), ensuring 100% upload success even on 3G/4G networks.
3. **1-Click GSTIN Auto-Decoder**:
   - When 15 digits of GSTIN are entered:
     - Regex validates `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`.
     - First 2 digits decode State (e.g. `08` ➔ *Rajasthan*, `07` ➔ *Delhi*).
     - Digits 3 to 12 auto-populate the PAN Card Number.
     - 4th character decodes Entity Type (`C` ➔ *Company*, `P` ➔ *Proprietorship*, `F` ➔ *Partnership*).
4. **Instant WhatsApp Helpline Button**:
   - Floating WhatsApp button pre-filled with: *"Hello HiPRO Empanelment Team, my tracking ID is [ID]. Please assist me with my application."*

---

## 4. Technical Stack Compliance
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend**: Express 4, TypeScript, Prisma ORM, PostgreSQL.
- **Authentication**: JWT Cookie + Role-based access via `AdminAccessWrapper`.
- **Media Storage**: Cloudinary / Local VPS media engine with sanitized filenames and MIME validation.
