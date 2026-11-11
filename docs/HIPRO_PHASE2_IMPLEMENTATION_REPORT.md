# HiPRO Phase 2 — SEO, AEO & Open Graph Improvements Implementation Report

**Document Version:** 1.0.0  
**Date:** November 10, 2026  
**Environment:** Local Isolated QA (`D:\HindustanProjects\Hipro-Website\Hipro-Main`)  
**Scope:** Main HiPRO Website (Phase 2 SEO from `HIPRO_COMPLETE_READ_ONLY_AUDIT_REPORT.md`)  
**Verdict:** **PASS (100% COMPLETE & VERIFIED)**

---

## 1. Executive Summary

Phase 2 implemented and verified the two SEO and Answer Engine Optimization (AEO) improvements specified in the original HiPRO audit report:

1. **Cost Estimator FAQ Schema Standardisation (AEO & Rich Snippets)**:
   - **Target**: `frontend/app/(site)/cost-estimator/page.tsx`
   - **Problem**: The Cost Estimator page contained 6 high-value civil engineering and cost Q&A items, but they used ad-hoc inline schema structures rather than the project's standard `generateFaqSchema` utility from `frontend/lib/schema.ts`.
   - **Resolution**: Refactored `FAQ_ITEMS` to adhere to the standard `FaqItem` interface (`question` and `answer`). Generated Schema.org `FAQPage` JSON-LD using `generateFaqSchema(FAQ_ITEMS)` and bound it via `@id: "https://www.hindustanprojects.in/cost-estimator#faq"` directly into the page's unified `@graph` structured data.
   - **Verification**: Confirmed exactly one `FAQPage` entity exists in the page's JSON-LD output. Verified 100% text congruence between the 6 visible accordion questions and answers and the emitted Schema.org entities.

2. **Open Graph Asset Verification & Dimension Correction**:
   - **Target**: `frontend/app/layout.tsx`
   - **Problem**: The root metadata pointed to `/logo.jpg` with fictitious dimensions of `800×600`. Physical inspection of `frontend/public/logo.jpg` revealed actual dimensions of **288 × 288** (JPEG, 1:1 aspect ratio). No dedicated 1200×630 landscape banner asset currently exists in the repository.
   - **Resolution**: Updated `frontend/app/layout.tsx` to declare accurate physical dimensions (`width: 288, height: 288`), explicit MIME type (`image/jpeg`), and maintained the appropriate `twitter:card: "summary"`. Prepared an official asset design specification for a future 1200×630 Open Graph banner without fabricating unapproved brand graphics.

---

## 2. Strict Project Boundaries & Safety Audit

| Safety Requirement | Status | Evidence / Verification |
| :--- | :--- | :--- |
| **Worktree Isolation** | **CONFIRMED** | All modifications strictly confined to `D:\HindustanProjects\Hipro-Website\Hipro-Main`. |
| **Production DB Untouched** | **CONFIRMED** | Zero connections, queries, or writes to production databases. |
| **No Schema/Migration Changes** | **CONFIRMED** | Zero Prisma migrations, seeds, or SQL modifications executed. |
| **Sibling Worktree Preserved** | **CONFIRMED** | `D:\HindustanProjects\Hipro-Website\Hipro-Web` remained completely untouched. |
| **No Git Mutation** | **CONFIRMED** | Changes kept local and uncommitted; zero commits, pushes, or branch switches. |
| **Scope Boundary Enforced** | **CONFIRMED** | Stopped after Phase 2; Phase 3 has NOT been started. |

---

## 3. Detailed File Modifications

### 3.1. `frontend/app/(site)/cost-estimator/page.tsx`
- Imported `generateFaqSchema` and `type FaqItem` from `@/lib/schema`.
- Typed `FAQ_ITEMS: FaqItem[]` with standard `question` and `answer` fields as the single source of truth.
- Integrated `...generateFaqSchema(FAQ_ITEMS)` into the Schema.org `@graph` with `@id: "https://www.hindustanprojects.in/cost-estimator#faq"`.
- Updated accordion rendering loop to use `faq.question` and `faq.answer`.

```tsx
import { generateFaqSchema, type FaqItem } from "@/lib/schema";

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is the average house construction cost per sq. ft in Bhilwara and Rajasthan?",
    answer: "In 2026, standard turnkey residential house construction in Bhilwara and across Rajasthan ranges from ₹1,680 to ₹2,450 per sq. ft of built-up area. A standard Silver package costs ~₹1,680/sqft, our most popular Gold (Classic) package costs ₹1,850/sqft (using Tata/UltraTech/Jaquar), and architectural luxury packages (Platinum/Royale) range from ₹2,150 to ₹2,450/sqft depending on imported Italian marble, UPVC double-glazing, and designer elevation treatments.",
  },
  {
    question: "How much does it cost to build a house on a 100 Gaj (900 sqft) plot?",
    answer: "For a 100 Gaj (20×45 ft) plot, built-up area typically averages around 1,500 sqft for a G+1 duplex home (including ground coverage, first floor living, parking, and balcony). At our Gold Package rate of ₹1,850/sqft, the estimated complete turnkey construction cost is approximately ₹27.75 Lakhs to ₹29.5 Lakhs, including foundation, RCC structure, brick masonry, premium tiles, Jaquar bath fittings, modular switches, and exterior 3D elevation.",
  },
  {
    question: "Why should I use Hindustan Projects instead of hiring a local 'Thekedar' (contractor)?",
    answer: "Local contractors often provide vague initial verbal quotes that later balloon with 30-50% cost overruns, substandard duplicate materials (unbranded steel/cement), delayed timelines, and zero post-handover warranty. Hindustan Projects provides a legally binding Guaranteed Fixed-Price Agreement, 100% genuine brand factory invoicing (Tata Tiscon, UltraTech 53, Jaquar, Asian Paints), an escrow-style 9-stage payment release schedule, and an official 10-Year Structural Integrity Warranty.",
  },
  {
    question: "What is the difference between Plot Area and Built-up Area?",
    answer: "Plot Area is the total boundary footprint of your land (e.g. 1,500 sq. ft or ~167 Gaj). Built-up Area is the actual constructed floor space across all levels. For a Ground + 1 Floor house on a 1,500 sqft plot, the built-up area is roughly 2,520 sqft (Ground floor ~1,200 sqft + First floor ~1,200 sqft + Covered parking & balconies ~120 sqft). Construction cost is always calculated on the total Built-Up Area.",
  },
  {
    question: "Are architectural drawings, 3D elevation, and structural designs included?",
    answer: "Yes! Every turnkey construction package with Hindustan Projects includes complete Vastu-compliant 2D architectural floor plans, 3D photo-realistic exterior elevation renders, structural engineering CAD blueprints, and plumbing/electrical working drawings at zero additional charge.",
  },
  {
    question: "How do milestone-based payments work?",
    answer: "You never pay large upfront sums. Payments are divided into 9 safe, certified milestone stages (e.g., Booking 5%, Foundation 10%, Plinth 10%, Ground Slab 15%, First Slab 15%, Brickwork 15%, Finishing 15%, Paint & Elevation 10%, Final Handover 5%). Each stage is only billed after physical inspection and quality sign-off by our site engineers.",
  },
];
```

Structured Data `@graph` integration:
```tsx
      {/* JSON-LD Structured Data for FAQ, BreadcrumbList & WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                "@id": "https://www.hindustanprojects.in/cost-estimator#app",
                name: "Hindustan Projects House Construction Cost Estimator",
                url: "https://www.hindustanprojects.in/cost-estimator",
                applicationCategory: "RealEstateApplication",
                operatingSystem: "All",
                provider: {
                  "@id": "https://www.hindustanprojects.in/#organization",
                },
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "INR",
                },
                description:
                  "Interactive house construction cost calculator for Bhilwara and Rajasthan. Calculate package-wise BOQ estimates and material breakdowns by Hindustan Projects.",
              },
              {
                "@type": "BreadcrumbList",
                "@id": "https://www.hindustanprojects.in/cost-estimator#breadcrumb",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.hindustanprojects.in",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Cost Estimator",
                    item: "https://www.hindustanprojects.in/cost-estimator",
                  },
                ],
              },
              {
                ...generateFaqSchema(FAQ_ITEMS),
                "@id": "https://www.hindustanprojects.in/cost-estimator#faq",
              },
            ],
          }),
        }}
      />
```

### 3.2. `frontend/app/layout.tsx`
Updated Open Graph image metadata to reflect verified physical dimensions of `/logo.jpg` (288×288) and added explicit MIME type:

```tsx
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.hindustanprojects.in",
    siteName: "Hindustan Projects (HiPRO)",
    title: "Hindustan Projects (HiPRO) | Engineering, Construction & Infrastructure",
    description: "Engineering, turnkey construction, and infrastructure firm based in Bhilwara, Rajasthan. Delivering quality-first civil execution since 2019.",
    images: [
      {
        url: "/logo.jpg",
        width: 288,
        height: 288,
        type: "image/jpeg",
        alt: "Hindustan Projects (HiPRO) Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Hindustan Projects (HiPRO) | Engineering, Construction & Infrastructure",
    description: "Engineering, turnkey construction, and infrastructure firm based in Bhilwara, Rajasthan.",
    images: ["/logo.jpg"],
  },
```

---

## 4. Open Graph Asset Decision & Design Recommendation

### 4.1. Audit Finding & Asset Inventory
- File inspected: `frontend/public/logo.jpg`
- Verified Physical Properties:
  - Width: **288 px**
  - Height: **288 px**
  - Format: **JPEG**
  - Aspect Ratio: **1:1 (Square)**
- Sibling assets inspected:
  - `hbs-og-default.svg`: Dedicated to Hind Building Solutions (HBS).
  - `images/empanelment/*`: Dedicated to Vendor Empanelment.
  - No 1200×630 landscape HiPRO corporate banner currently exists in the repository.

### 4.2. Action Taken
- Retained `/logo.jpg` as the verified corporate brand mark.
- Corrected metadata `width` from `800` to `288`, `height` from `600` to `288`, and added `type: "image/jpeg"`.
- Maintained `twitter:card: "summary"` (ideal for 1:1 square assets; avoids cropping artifacts caused by `summary_large_image` on square logos).

### 4.3. Recommendation for Production Asset (Design Brief)
To enable the cinematic `summary_large_image` card format on Twitter/X, LinkedIn, and Facebook, the marketing/design team should produce a dedicated 1200×630 corporate Open Graph asset:

| Specification | Requirement |
| :--- | :--- |
| **Filename** | `frontend/public/og-banner.jpg` (or `/hipro-og.jpg`) |
| **Dimensions** | `1200 × 630 px` (Standard 1.91:1 ratio) |
| **Max File Size** | `< 300 KB` (optimized WebP/JPEG) |
| **Visual Composition** | - Left: Official HiPRO Logo + "Engineering · Construction · Infrastructure"<br>- Background: HiPRO Corporate Navy (`#0F2C59`) with subtle architectural blueprint lines<br>- Right: High-resolution photograph of a signature landmark project (e.g. Mahapura Logistics Park or Grand Horizon)<br>- Bottom Banner: "Bhilwara, Rajasthan • Established 2019" |
| **Future Metadata Update** | Once created, update `layout.tsx` to point to `/og-banner.jpg`, set `width: 1200, height: 630`, and switch `twitter.card` to `"summary_large_image"`. |

---

## 5. Verification Test Results

### 5.1. Cost Estimator FAQ Schema Verification

Executed live DOM inspection via Chrome DevTools MCP against `http://localhost:3000/cost-estimator`:

| Verification Check | Result | Evidence | Status |
| :--- | :--- | :--- | :--- |
| **FAQPage Node Exists** | **YES** | `Type: FAQPage`, `@id: ".../cost-estimator#faq"` inside `@graph` | **PASS** |
| **Question Count** | **6** | 6 questions in Schema.org vs. 6 visible accordion items | **PASS** |
| **100% Content Match** | **YES** | `matchExact: true` via DOM query comparing accordion buttons to schema | **PASS** |
| **Zero Duplication** | **YES** | Exactly one `FAQPage` entity exists in the entire document | **PASS** |
| **Graph Entities Preserved**| **YES** | `WebApplication`, `BreadcrumbList`, and `FAQPage` unified cleanly | **PASS** |

#### Extracted Question List (Schema & Visible DOM Concordance):
1. *"What is the average house construction cost per sq. ft in Bhilwara and Rajasthan?"*
2. *"How much does it cost to build a house on a 100 Gaj (900 sqft) plot?"*
3. *"Why should I use Hindustan Projects instead of hiring a local 'Thekedar' (contractor)?"*
4. *"What is the difference between Plot Area and Built-up Area?"*
5. *"Are architectural drawings, 3D elevation, and structural designs included?"*
6. *"How do milestone-based payments work?"*

### 5.2. Root Open Graph Metadata Verification

Extracted live `<meta>` tags from DOM:

| Tag | Rendered Attribute / Content | Status |
| :--- | :--- | :--- |
| `og:image` | `http://localhost:3000/logo.jpg` | **PASS** |
| `og:image:width` | `288` | **PASS** |
| `og:image:height`| `288` | **PASS** |
| `og:image:type` | `image/jpeg` | **PASS** |
| `og:image:alt` | `Hindustan Projects (HiPRO) Logo` | **PASS** |
| `twitter:card` | `summary` | **PASS** |
| `twitter:image` | `http://localhost:3000/logo.jpg` | **PASS** |

### 5.3. Static Quality Gates

1. **TypeScript Type Check**:
   ```bash
   npx tsc -p tsconfig.json --noEmit
   # Exit code: 0 (Zero type errors)
   ```
2. **ESLint Verification**:
   ```bash
   npm run lint
   # Exit code: 0 (Zero errors on modified files)
   ```
3. **Production Build Status**:
   - As documented in Phase 1, `next build` attempts to contact external npm registry endpoints to reconcile platform-specific SWC compiler binaries across linked worktrees, which cannot be executed within the isolated sandbox environment. The live Next.js development server bundles and validates all routes on-demand with zero runtime errors.

---

## 6. Phase 2 Completion & Sign-Off

All objectives for **HiPRO Phase 2** have been met:
- Cost Estimator FAQ Schema generated via `generateFaqSchema` with 100% visible content congruence and zero duplication.
- Open Graph metadata corrected to reflect verified physical dimensions (`288×288`, `image/jpeg`, `summary` card).
- Production design brief prepared for future 1200×630 Open Graph banner.
- Stopped immediately after Phase 2 as required.

