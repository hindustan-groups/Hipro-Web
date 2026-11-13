# HiPRO Local SEO Master Plan
**Hindustan Projects (HiPRO) — `https://www.hindustanprojects.in`**

> **Document type:** Internal SEO reference — not a public page.  
> **Audience:** Developer/SEO team maintaining the HiPRO Next.js website (Runtime: Next.js 14.2.35 App Router).  
> **Runtime / Framework:** Next.js 14.2.35 (App Router). The active build and runtime in `node_modules` executes Next.js 14.2.35 LTS, while `package.json` specifies forward compatibility targets.  
> **Last updated:** 2026-11  
> **Status:** Active — update this document whenever site structure, metadata, or schema changes.

---

## Table of Contents

1. [Business & Geographic SEO Objectives](#1-business--geographic-seo-objectives)
2. [Keyword Clusters](#2-keyword-clusters)
3. [Keyword-to-Page Mapping](#3-keyword-to-page-mapping)
4. [Existing Page Inventory](#4-existing-page-inventory)
5. [On-Page SEO Requirements Per Page](#5-on-page-seo-requirements-per-page)
6. [Content Strategy](#6-content-strategy)
7. [Structured Data Plan](#7-structured-data-plan)
8. [Technical SEO](#8-technical-seo)
9. [Internal Linking Strategy](#9-internal-linking-strategy)
10. [Trust & Authority Signals](#10-trust--authority-signals)
11. [Performance Protection](#11-performance-protection)
12. [Measurement & Acceptance Criteria](#12-measurement--acceptance-criteria)

---

## 1. Business & Geographic SEO Objectives

### 1.1 Company Context

| Field             | Value                                                                             |
|-------------------|-----------------------------------------------------------------------------------|
| Legal name        | Hindustan Projects                                                                |
| Brand name        | HiPRO                                                                             |
| Site URL          | `https://www.hindustanprojects.in`                                                |
| Business type     | Engineering · Turnkey Civil Construction · Infrastructure                        |
| Primary office    | Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001 |
| Phone             | +91 75970 00601                                                                   |
| Email             | info@hindustanprojects.in                                                         |
| Founder           | Yogesh Kharol                                                                     |
| Coordinates       | 25.3510922, 74.6330429                                                            |
| Hours             | Mon–Sat, 09:00–19:00                                                              |

### 1.2 Geographic Targeting Hierarchy

The SEO strategy operates in three concentric geographic rings:

```
Ring 1 (Primary)   — Bhilwara city & district
Ring 2 (Secondary) — Rajasthan state
Ring 3 (Tertiary)  — India (sector-specific: industrial, infrastructure)
```

**Ring 1 — Bhilwara (highest priority)**  
All brand, service, and contact pages must signal Bhilwara intent. Local pack eligibility and NAP consistency are critical at this level.

**Ring 2 — Rajasthan**  
Industrial construction, water treatment, and project management keywords extend naturally to statewide searches. Service pages and blog content should reinforce Rajasthan coverage.

**Ring 3 — India (selective)**  
Reserved for sector-specialist queries (e.g., "water treatment plant contractor India", "industrial civil contractor") where the site can compete on expertise rather than proximity.

### 1.3 SEO Goal Hierarchy

| Priority | Objective                                                                 |
|----------|---------------------------------------------------------------------------|
| P1       | Rank in Google Local Pack for Bhilwara construction / contractor queries |
| P2       | Rank organically (positions 1–10) for Bhilwara + service combinations    |
| P3       | Rank for Rajasthan-scoped construction and industrial keywords            |
| P4       | Build topical authority in construction / civil engineering via blog       |
| P5       | Drive qualified lead conversions from organic & local traffic             |

---

## 2. Keyword Clusters

Keyword clusters are organized by intent and geography. No search volume or difficulty figures are stated here — these must be sourced from a live research tool (Google Search Console, Ahrefs, SEMrush) before prioritizing.

### 2.1 Cluster A — Brand & Local Identity

```
hindustan projects bhilwara
hipro construction
hindustan projects hipro
hipro bhilwara
hindustanprojects.in
```

**Target pages:** `/`, `/about`, `/contact`  
**Intent:** Navigational / branded  
**Priority:** Protect — ensure these return the official site in position 1.

---

### 2.2 Cluster B — Construction Company (Bhilwara)

```
construction company bhilwara
construction company in bhilwara
building contractor bhilwara
construction contractor bhilwara rajasthan
turnkey construction bhilwara
civil construction bhilwara
residential construction bhilwara
commercial construction bhilwara
```

**Target pages:** `/`, `/services`, `/services/professional-construction-services`  
**Intent:** Commercial investigation / transactional  
**Geographic scope:** Ring 1

---

### 2.3 Cluster C — Civil Contractor (Bhilwara)

```
civil contractor bhilwara
civil engineering contractor bhilwara
civil work contractor bhilwara
structural contractor bhilwara
building work contractor bhilwara rajasthan
```

**Target pages:** `/`, `/services/professional-construction-services`, `/why-us`  
**Intent:** Commercial / transactional  
**Geographic scope:** Ring 1

---

### 2.4 Cluster D — Architect & Planning (Bhilwara)

```
architect bhilwara
architectural firm bhilwara
building design bhilwara
house design bhilwara
construction planning bhilwara
architectural planning rajasthan
```

**Target pages:** `/services/architecture-planning`  
**Intent:** Commercial investigation  
**Geographic scope:** Ring 1–2

---

### 2.5 Cluster E — Industrial Construction (Rajasthan)

```
industrial construction rajasthan
industrial building contractor rajasthan
factory construction rajasthan
industrial civil contractor rajasthan
manufacturing plant construction rajasthan
industrial construction bhilwara
```

**Target pages:** `/services/professional-construction-services`, `/projects`  
**Intent:** Commercial / B2B transactional  
**Geographic scope:** Ring 2

---

### 2.6 Cluster F — Water Treatment Plant

```
water treatment plant construction rajasthan
wtp construction contractor india
water treatment plant contractor bhilwara
sewage treatment plant construction rajasthan
effluent treatment plant contractor
industrial water treatment rajasthan
```

**Target pages:** `/services/water-treatment-plant-construction`  
**Intent:** High-intent B2B transactional  
**Geographic scope:** Ring 2–3

---

### 2.7 Cluster G — Interior & Exterior Design

```
interior design bhilwara
interior designer bhilwara rajasthan
exterior design bhilwara
home interior design bhilwara
commercial interior design bhilwara
office interior design rajasthan
```

**Target pages:** `/services/interior-exterior-design`  
**Intent:** Commercial investigation  
**Geographic scope:** Ring 1–2

---

### 2.8 Cluster H — Surveying & Site Measurements

```
land surveying bhilwara
site survey contractor bhilwara
land measurement service rajasthan
topographic survey bhilwara
site measurements rajasthan
building survey contractor rajasthan
```

**Target pages:** `/services/surveying-site-measurements`  
**Intent:** Commercial investigation  
**Geographic scope:** Ring 1–2

---

### 2.9 Cluster I — Project Management & Consultancy

```
project management consultancy bhilwara
construction project management rajasthan
civil project consultant bhilwara
pmc contractor rajasthan
construction consultancy rajasthan
project management company bhilwara
```

**Target pages:** `/services/project-management-consultancy`  
**Intent:** B2B commercial  
**Geographic scope:** Ring 2

---

### 2.10 Cluster J — Cost Estimation Tool

```
construction cost estimator india
building cost calculator rajasthan
construction material cost bhilwara
estimate construction cost online
civil construction estimate tool
```

**Target pages:** `/cost-estimator`  
**Intent:** Informational / Tool  
**Geographic scope:** Ring 2–3

---

### 2.11 Cluster K — Projects Portfolio

```
construction projects bhilwara
civil projects rajasthan
commercial projects bhilwara
industrial projects rajasthan
hipro projects portfolio
```

**Target pages:** `/projects`, `/projects/[slug]`  
**Intent:** Informational / trust-building  
**Geographic scope:** Ring 1–2

---

### 2.12 Cluster L — Careers

```
civil engineering jobs bhilwara
construction jobs bhilwara
site engineer job rajasthan
civil contractor recruitment bhilwara
engineering careers bhilwara
```

**Target pages:** `/careers`  
**Intent:** Informational / transactional  
**Geographic scope:** Ring 1–2

---

## 3. Keyword-to-Page Mapping

The table below maps primary and secondary keywords to existing pages only. Each page should be optimized for one primary keyword cluster with supporting secondary terms.

| URL                                                | Primary Cluster      | Primary Keyword (Example)                       | Secondary Keywords                                                      |
|----------------------------------------------------|----------------------|-------------------------------------------------|-------------------------------------------------------------------------|
| `/`                                                | B, C, A              | construction company bhilwara                   | civil contractor bhilwara, turnkey construction bhilwara, hipro         |
| `/about`                                           | A                    | hindustan projects bhilwara                     | hipro about, construction firm rajasthan, yogesh kharol hipro           |
| `/why-us`                                          | C                    | why choose hipro bhilwara                       | trusted construction company bhilwara, civil contractor rajasthan       |
| `/services`                                        | B, C                 | construction services bhilwara                  | building services bhilwara, civil engineering services rajasthan        |
| `/services/architecture-planning`                  | D                    | architect bhilwara                              | architectural planning bhilwara, building design rajasthan              |
| `/services/professional-construction-services`     | B, C, E              | construction contractor bhilwara                | industrial construction rajasthan, turnkey civil contractor             |
| `/services/surveying-site-measurements`            | H                    | land surveying bhilwara                         | site measurement contractor rajasthan, topographic survey bhilwara      |
| `/services/interior-exterior-design`               | G                    | interior design bhilwara                        | exterior design bhilwara, interior designer rajasthan                   |
| `/services/water-treatment-plant-construction`     | F                    | water treatment plant construction rajasthan    | wtp contractor india, sewage treatment plant rajasthan                  |
| `/services/project-management-consultancy`         | I                    | project management consultancy bhilwara         | pmc contractor rajasthan, construction consultant bhilwara              |
| `/projects`                                        | K                    | construction projects bhilwara                  | civil projects rajasthan, hipro portfolio                               |
| `/projects/[slug]`                                 | K                    | [project-specific: location + type]             | [project-specific]                                                      |
| `/blogs`                                           | L (supporting)       | construction tips bhilwara                      | civil engineering blog india, construction guide rajasthan              |
| `/blogs/[slug]`                                    | (topic-specific)     | [blog-specific]                                 | [blog-specific]                                                         |
| `/careers`                                         | L                    | civil engineering jobs bhilwara                 | construction jobs rajasthan, site engineer vacancy bhilwara             |
| `/contact`                                         | A                    | contact hindustan projects bhilwara             | hipro contact, construction company contact bhilwara                    |
| `/cost-estimator`                                  | J                    | construction cost estimator                     | building cost calculator rajasthan, estimate civil construction cost    |

> **Rule:** One primary cluster per page. Secondary keywords appear in body copy, alt text, and schema — not forced into the title or meta description.

---

## 4. Existing Page Inventory

All public-facing pages in the `(site)` route group. Admin, empanelment, and HBS routes are excluded from this plan (they have separate SEO considerations).

| # | URL                                               | File Path (from `frontend/app/`)                        | Page Intent          | `<title>` Set? | Meta Description Set? | Canonical Set? | robots |
|---|---------------------------------------------------|---------------------------------------------------------|----------------------|----------------|-----------------------|----------------|--------|
| 1 | `/`                                               | `(site)/page.tsx`                                       | Transactional / Hub  | ✅ (layout.tsx) | ✅ (layout.tsx)       | ✅ `canonical: "/"` | index, follow |
| 2 | `/about`                                          | `(site)/about/page.tsx`                                 | Informational        | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 3 | `/why-us`                                         | `(site)/why-us/page.tsx`                                | Trust / Commercial   | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 4 | `/services`                                       | `(site)/services/page.tsx`                              | Category / Hub       | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 5 | `/services/architecture-planning`                 | `(site)/services/[slug]/page.tsx`                       | Transactional        | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 6 | `/services/professional-construction-services`    | `(site)/services/[slug]/page.tsx`                       | Transactional        | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 7 | `/services/surveying-site-measurements`           | `(site)/services/[slug]/page.tsx`                       | Transactional        | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 8 | `/services/interior-exterior-design`              | `(site)/services/[slug]/page.tsx`                       | Transactional        | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 9 | `/services/water-treatment-plant-construction`    | `(site)/services/[slug]/page.tsx`                       | Transactional        | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 10| `/services/project-management-consultancy`        | `(site)/services/[slug]/page.tsx`                       | Transactional        | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 11| `/projects`                                       | `(site)/projects/page.tsx`                              | Portfolio / Trust    | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 12| `/projects/[slug]`                                | `(site)/projects/[slug]/page.tsx`                       | Informational / Trust| ⚠️ verify      | ⚠️ verify             | ✅ (projectUrl lib) | conditional (noIndex flag) |
| 13| `/blogs`                                          | `(site)/blogs/page.tsx`                                 | Content Hub          | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 14| `/blogs/[slug]`                                   | `(site)/blogs/[slug]/page.tsx`                          | Informational        | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | conditional |
| 15| `/careers`                                        | `(site)/careers/page.tsx`                               | Informational        | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 16| `/contact`                                        | `(site)/contact/page.tsx`                               | Transactional        | ✅ (schema.ts)  | ✅ (schema.ts)        | ⚠️ verify      | index, follow |
| 17| `/cost-estimator`                                 | `(site)/cost-estimator/page.tsx`                        | Tool / Transactional | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 18| `/privacy-policy`                                 | `(site)/privacy-policy/page.tsx`                        | Legal                | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 19| `/terms`                                          | `(site)/terms/page.tsx`                                 | Legal                | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |
| 20| `/cookie-policy`                                  | `(site)/cookie-policy/page.tsx`                         | Legal                | ⚠️ verify      | ⚠️ verify             | ⚠️ verify      | index, follow |

> **Action item:** Audit each `⚠️ verify` page to confirm `generateMetadata()` or a static `export const metadata` object is present. Use `app/layout.tsx` global metadata only as a fallback — every page should export its own.

---

## 5. On-Page SEO Requirements Per Page

### 5.1 Global Requirements (all pages)

- **Title tag:** 50–60 characters. Format: `[Primary Keyword] | Hindustan Projects (HiPRO)`
- **Meta description:** 140–160 characters. Must include primary keyword and a CTA verb ("contact", "get a quote", "explore").
- **Canonical:** Self-referencing canonical on every page.
- **H1:** One per page, containing the primary keyword. Must match page intent.
- **H2–H6:** Hierarchical, keyword-rich without stuffing.
- **Image alt text:** Descriptive, includes location context where relevant (e.g., "water treatment plant construction Bhilwara Rajasthan").
- **Internal links:** Minimum 2 contextual internal links per page (see Section 9).
- **OG tags:** `og:title`, `og:description`, `og:image` (1200×630 JPG), `og:url`, `og:type`.
- **Twitter card:** `summary_large_image` with matching title and description.

---

### 5.2 Page-Specific Requirements

#### `/` — Home

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Construction Company in Bhilwara \| Hindustan Projects (HiPRO)` (≤60 chars)                |
| H1                | Contains "construction company" + "Bhilwara"                                                 |
| Meta description  | Mention Bhilwara, turnkey construction, year operating, contact CTA                           |
| Schema            | `WebSite` + `Organization`/`LocalBusiness`/`GeneralContractor` (already in `hiproJsonLd.ts`) |
| Body content      | Above-the-fold content must include city name and primary service                             |
| CTA               | Phone number and/or "Get a Quote" link visible above fold                                     |

#### `/about`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `About Hindustan Projects (HiPRO) — Civil Engineering Firm, Bhilwara`                        |
| H1                | Brand name + city + founding context                                                          |
| Meta description  | Who HiPRO is, what it builds, where (Bhilwara, Rajasthan)                                    |
| Schema            | `AboutPage` + reference to `#organization` entity                                             |
| Body content      | Founding year, founder name (Yogesh Kharol), mission, geographic focus                       |

#### `/why-us`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Why Choose HiPRO — Trusted Construction Company Bhilwara`                                   |
| H1                | Differentiator-focused, includes "Bhilwara"                                                  |
| Meta description  | List 1–2 concrete differentiators; CTA                                                       |
| Schema            | `WebPage` with `breadcrumb`                                                                  |
| Body content      | Specific, verifiable claims only — no made-up awards or certifications                        |

#### `/services`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Construction Services in Bhilwara, Rajasthan \| HiPRO`                                     |
| H1                | "Construction Services in Bhilwara" or similar                                               |
| Meta description  | Enumerate 2–3 service categories; mention Bhilwara & Rajasthan                               |
| Schema            | `CollectionPage` + `BreadcrumbList`                                                          |
| Body content      | Linked cards/list to all 6 service slug pages                                                |

#### `/services/architecture-planning`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Architectural Planning & Design Services Bhilwara \| HiPRO`                                |
| H1                | Contains "architecture" + "Bhilwara"                                                        |
| Meta description  | Service scope, areas served (Bhilwara, Rajasthan), CTA                                      |
| Schema            | `Service` via `generateServiceSchema()` in `lib/schema.ts`                                  |
| Body content      | What the service includes, areaServed, contact CTA                                           |

#### `/services/professional-construction-services`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Professional Construction Services Bhilwara \| HiPRO`                                      |
| H1                | Contains "construction services" + "Bhilwara"                                               |
| Meta description  | Residential, commercial, industrial scope; Bhilwara/Rajasthan coverage                      |
| Schema            | `Service` via `generateServiceSchema()`                                                     |
| Body content      | Cover residential, commercial, industrial verticals with specifics                           |

#### `/services/surveying-site-measurements`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Land Surveying & Site Measurement Services Bhilwara \| HiPRO`                              |
| H1                | "Land Surveying" + "Bhilwara" or "Rajasthan"                                                |
| Schema            | `Service` via `generateServiceSchema()`                                                     |

#### `/services/interior-exterior-design`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Interior & Exterior Design Services Bhilwara \| HiPRO`                                     |
| H1                | "Interior Design" + "Bhilwara"                                                              |
| Schema            | `Service` via `generateServiceSchema()`                                                     |

#### `/services/water-treatment-plant-construction`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Water Treatment Plant Construction Rajasthan \| HiPRO`                                     |
| H1                | "Water Treatment Plant" + "construction" + "Rajasthan"                                      |
| Schema            | `Service` via `generateServiceSchema()` with `areaServed: Rajasthan`                        |
| Note              | Rajasthan-first (Ring 2) — competitive at state level                                        |

#### `/services/project-management-consultancy`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Project Management Consultancy Bhilwara, Rajasthan \| HiPRO`                               |
| H1                | "Project Management Consultancy" + "Bhilwara"                                               |
| Schema            | `Service` via `generateServiceSchema()`                                                     |

#### `/projects`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Construction Projects Portfolio — Bhilwara & Rajasthan \| HiPRO`                           |
| H1                | "Our Construction Projects" or "Projects in Bhilwara, Rajasthan"                            |
| Schema            | `CollectionPage` + `BreadcrumbList`                                                         |
| Body content      | Filterable list; each project card links to slug page; structured location data shown       |

#### `/projects/[slug]`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `[Project Title] — [City/Type] Construction Project \| HiPRO` (dynamic)                     |
| Meta description  | Project description from DB; include city/type                                               |
| Schema            | `Article` via `generateProjectJsonLd()` + `BreadcrumbList` via `generateProjectBreadcrumbs()` + `FAQPage` via `generateProjectFaqSchema()` if FAQs present |
| Canonical         | Built by `buildProjectCanonicalUrl()` from `lib/projectUrl.ts`                              |
| robots            | Respect per-project `noIndex` flag; default: `index, follow`                                |

#### `/blogs`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Construction Insights & Guides — Blog \| HiPRO`                                            |
| H1                | "Construction Blog" or "HiPRO Insights"                                                     |
| Schema            | `Blog` or `CollectionPage`                                                                  |
| Body content      | Published posts only; pagination or load-more if many posts                                 |

#### `/blogs/[slug]`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `[Blog Title] \| HiPRO Construction Blog`                                                   |
| Schema            | `Article` with `author: Organization`, `publisher`, `datePublished`, `dateModified`         |
| Canonical         | Self-referencing canonical per slug                                                          |
| robots            | Only index published, non-draft posts                                                        |

#### `/careers`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Civil Engineering & Construction Careers in Bhilwara \| HiPRO`                             |
| H1                | "Careers at HiPRO" + mention of Bhilwara                                                   |
| Schema            | `JobPosting` per active listing (if individual listings are rendered server-side)           |
| Meta description  | "Join HiPRO's civil engineering team in Bhilwara, Rajasthan. View open positions."          |

#### `/contact`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Contact Hindustan Projects (HiPRO) — Bhilwara, Rajasthan`                                 |
| Schema            | `ContactPage` via `generateContactPageSchema()` in `lib/schema.ts` ✅ already implemented   |
| Body content      | Full NAP: address, phone (+91 75970 00601), email (info@hindustanprojects.in), map embed    |
| Map embed         | Google Maps iframe at office coordinates (25.3510922, 74.6330429)                           |

#### `/cost-estimator`

| Element           | Requirement                                                                                    |
|-------------------|-----------------------------------------------------------------------------------------------|
| Title             | `Free Construction Cost Estimator — HiPRO, Rajasthan`                                      |
| H1                | "Construction Cost Estimator"                                                               |
| Schema            | `WebApplication` or `SoftwareApplication` with `applicationCategory: "BusinessApplication"` |
| Meta description  | "Estimate your construction cost instantly with HiPRO's free online calculator. Serving Bhilwara and Rajasthan." |
| robots            | `index, follow` — this is a valuable differentiation page                                  |

#### `/privacy-policy`, `/terms`, `/cookie-policy`

| Element           | Requirement                                                                           |
|-------------------|---------------------------------------------------------------------------------------|
| robots            | `index, follow` (already set in sitemap.ts as low-priority `0.3`, `monthly`)        |
| Canonical         | Self-referencing                                                                      |
| Schema            | None required                                                                         |
| Priority          | Low — do not invest SEO effort here                                                  |

---

## 6. Content Strategy

### 6.1 Service Page Depth Requirements

Each service page at `/services/[slug]` should contain:

1. **Hero section** — H1 with primary keyword + city
2. **Overview** — 150–200-word description of what the service entails
3. **Scope / What's Included** — Bullet list of specific deliverables
4. **Process / How It Works** — 3–5 step breakdown
5. **Service Area** — Explicit mention of Bhilwara, surrounding districts, Rajasthan
6. **FAQ section** — Minimum 3 Q&A pairs; powers `FAQPage` schema via `generateFaqSchema()`
7. **CTA** — Phone number, email, or contact form link
8. **Related services** — 2–3 internal links to other service pages
9. **Image(s)** — With descriptive alt text including service + location

> **Water Treatment Plant page** should additionally mention Rajasthan-wide coverage and state/industrial context, as it targets Ring 2 keywords.

---

### 6.2 Blog Topic Clusters

Blog content should build topical authority in construction and support service page rankings. All topics should be tied to verifiable information — do not fabricate case studies, statistics, or project outcomes.

**Cluster: Local Construction Guides (Bhilwara)**
- "How to Choose a Civil Contractor in Bhilwara, Rajasthan"
- "Construction Permit Process in Bhilwara — What You Need to Know"
- "Cost of Building a House in Bhilwara: Key Factors to Consider"
- "Understanding Construction Material Costs in Rajasthan"

**Cluster: Technical Guides (Expertise)**
- "Turnkey Construction vs. Traditional Construction: What's the Difference?"
- "What Is Project Management Consultancy in Civil Construction?"
- "Land Surveying Before Construction: Why It Matters"
- "Water Treatment Plant Construction: Planning and Key Considerations"

**Cluster: Design & Architecture**
- "Interior vs. Exterior Design in Commercial Buildings: A Practical Guide"
- "Architectural Planning for Industrial Facilities: Key Steps"

**Cluster: Tools & Resources**
- "How to Use a Construction Cost Estimator: A Step-by-Step Guide"
- "Construction Estimation 101: Breaking Down Civil Work Costs"

**Publishing cadence:** Minimum 2 posts per month. Each post should:
- Target one keyword from the blog keyword cluster
- Link to at least 1 relevant service page
- Include a clear CTA at the bottom
- Export proper `Article` schema metadata

---

### 6.3 Content Governance Rules

- **No fabricated numbers** — do not publish statistics, rankings, or project counts without a verifiable source
- **No invented testimonials** — only use real, verifiable client feedback
- **No invented awards or certifications** — only reference genuine, documented credentials
- **Location accuracy** — always use verified address (Bhopal Ganj, Bhilwara, Rajasthan 311001)

---

## 7. Structured Data Plan

### 7.1 Existing Schema Implementation

| Schema Type                       | Location                                     | Status  | Notes                                                                 |
|-----------------------------------|----------------------------------------------|---------|-----------------------------------------------------------------------|
| `WebSite`                         | `lib/hiproJsonLd.ts` → `(site)/layout.tsx`  | ✅ Live  | Site-wide via `HIPRO_JSON_LD` array injected in `<script type="application/ld+json">` |
| `Organization` + `LocalBusiness` + `GeneralContractor` | `lib/hiproJsonLd.ts` → `(site)/layout.tsx` | ✅ Live | Multi-type entity with NAP, geo, hours, socials, hasOfferCatalog     |
| `BreadcrumbList`                  | `lib/schema.ts` → `generateBreadcrumbSchema()` | ✅ Impl | Called per-page — verify it is actually invoked on all inner pages   |
| `Service`                         | `lib/schema.ts` → `generateServiceSchema()` | ✅ Impl | Called from `/services/[slug]` — verify implementation in that page  |
| `ContactPage`                     | `lib/schema.ts` → `generateContactPageSchema()` | ✅ Impl | Verify it's injected in `/contact/page.tsx`                         |
| `FAQPage` (general)               | `lib/schema.ts` → `generateFaqSchema()`     | ✅ Impl | Used on pages with FAQ sections — verify active usage               |
| `Article` (projects)              | `lib/projectSchema.ts` → `generateProjectJsonLd()` | ✅ Impl | Used on `/projects/[slug]` — conditional fields only                |
| `BreadcrumbList` (projects)       | `lib/projectSchema.ts` → `generateProjectBreadcrumbs()` | ✅ Impl | Dedicated breadcrumb for project detail pages                       |
| `FAQPage` (projects)              | `lib/projectSchema.ts` → `generateProjectFaqSchema()` | ✅ Impl | Only injected if valid FAQ data present                             |

### 7.2 Schema Gaps — To Add

| Schema Type        | Target Page(s)                     | Priority | Implementation Notes                                                                           |
|--------------------|------------------------------------|----------|------------------------------------------------------------------------------------------------|
| `WebPage`          | `/about`, `/why-us`, `/careers`    | High     | Add `WebPage` or `AboutPage` referencing `#organization` entity. Implement in `generateMetadata` or as inline JSON-LD. |
| `CollectionPage`   | `/services`, `/projects`, `/blogs` | Medium   | Tag hub/listing pages as `CollectionPage` with `breadcrumb`.                                 |
| `Blog` / `BlogPosting` | `/blogs`, `/blogs/[slug]`     | High     | `/blogs` as `Blog` entity; each `/blogs/[slug]` as `BlogPosting` / `Article` with `datePublished`, `dateModified`, `author`, `publisher`. |
| `JobPosting`       | `/careers`                         | Medium   | If individual job listings are rendered, wrap each in `JobPosting` schema. Requires `title`, `hiringOrganization`, `jobLocation`, `datePosted`. |
| `WebApplication`   | `/cost-estimator`                  | Medium   | Schema for the estimator tool: `applicationCategory`, `operatingSystem: Web`, `offers`.     |
| `GeoCoordinates`   | `/contact`                         | Low      | Already in `hiproJsonLd.ts` on the organization entity; no separate addition needed if map embed is present. |
| `SiteLinksSearchBox` | `/` (root)                       | Low      | Only valuable if site search exists for users. Evaluate based on site search implementation. |

### 7.3 Schema Validation Checklist

After every schema addition or change:

1. Test with [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Test with [Schema.org Validator](https://validator.schema.org/)
3. Confirm `@id` consistency — all entities that reference `#organization` or `#website` must use the exact same IRI: `https://www.hindustanprojects.in/#organization`
4. Confirm no duplicate `@type` arrays causing validation warnings
5. Confirm `hasOfferCatalog` in `hiproJsonLd.ts` matches all 6 active service slugs

---

## 8. Technical SEO

### 8.1 Sitemap

**Implementation:** `frontend/app/sitemap.ts` (Next.js App Router `MetadataRoute.Sitemap`)

| Route Group     | changeFrequency | Priority | Notes                                                              |
|-----------------|-----------------|----------|--------------------------------------------------------------------|
| `/`             | weekly          | 1.0      | Highest priority                                                   |
| Static pages    | weekly          | 0.8      | `/about`, `/why-us`, `/services`, `/projects`, `/blogs`, `/careers`, `/contact`, `/cost-estimator` |
| Legal pages     | monthly         | 0.3      | `/privacy-policy`, `/terms`, `/cookie-policy`                      |
| `/blogs/[slug]` | monthly         | 0.7      | Only published, active, non-future posts included                  |
| `/projects/[slug]` | monthly      | 0.7      | Only `publishStatus: "published"`, not archived, `noIndex !== true` |
| `/services/[slug]` | monthly      | 0.7      | From active DB services or fallback to `COMPANY_INFO.services`     |
| HBS routes      | weekly/monthly  | 0.7–0.8  | `/hbs/**` — separate sub-brand                                     |

**Action items:**
- Submit sitemap at `https://www.hindustanprojects.in/sitemap.xml` to Google Search Console
- Verify sitemap renders correctly in production (all dynamic slugs appear)
- Monitor for 4xx URLs in sitemap via GSC "Coverage" report

### 8.2 Robots

**Current state:** No `robots.ts` or `robots.txt` file detected in `frontend/app/`. Next.js serves a permissive default.

**Required action:** Create `frontend/app/robots.ts`:

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/admin-login/', '/empanelment/'],
      },
    ],
    sitemap: 'https://www.hindustanprojects.in/sitemap.xml',
  };
}
```

> This is a **P1 technical task** — admin routes must be blocked from indexing.

### 8.3 Canonical URLs

| Implementation                | Location                         | Status  |
|-------------------------------|----------------------------------|---------|
| Root canonical `/`            | `app/layout.tsx` metadata        | ✅ Set  |
| Project slug canonical        | `lib/projectUrl.ts` → `buildProjectCanonicalUrl()` | ✅ Set |
| Service/blog slug canonicals  | Need verification per page       | ⚠️ Audit required |
| Contact page canonical        | Need verification                | ⚠️ Audit required |

**Rule:** Every page that can be reached via multiple URLs (pagination, query strings, case variants) must have an explicit self-referencing canonical. Use Next.js `generateMetadata` with `alternates: { canonical: '/path' }`.

### 8.4 Indexability

| Page Group        | Expected `robots` directive | Mechanism                                       |
|-------------------|-----------------------------|-------------------------------------------------|
| Public site pages | `index, follow`             | Root layout metadata `robots: { index: true, follow: true }` |
| `/admin/**`       | `noindex, nofollow`         | Via `robots.ts` disallow + per-layout metadata |
| `/admin-login/`   | `noindex, nofollow`         | Via `robots.ts` disallow                       |
| `/empanelment/**` | `noindex` (review needed)   | Via `robots.ts` disallow (unless intentionally public) |
| Draft blog posts  | `noindex`                   | Per-post conditional in `generateMetadata`     |
| `noIndex` projects | `noindex`                  | Per-project `noIndex` flag checked in sitemap.ts and page metadata |

### 8.5 Crawl Budget & URL Hygiene

- Avoid exposing admin routes in `<a>` tags on public pages — they add crawl noise
- Use `<link rel="canonical">` on all paginated listing pages
- Do not expose query-string variants of service or project pages publicly
- Confirm that dynamic slugs do not generate 404s for the 6 known service slugs: `architecture-planning`, `professional-construction-services`, `surveying-site-measurements`, `interior-exterior-design`, `water-treatment-plant-construction`, `project-management-consultancy`

### 8.6 Core Web Vitals — Technical Requirements

| Metric | Target         | Notes                                                                     |
|--------|----------------|---------------------------------------------------------------------------|
| LCP    | < 2.5 s        | Hero image must be `priority` / `fetchPriority="high"`. Cloudinary images should use `q_auto,f_auto`. |
| CLS    | < 0.1          | Reserve image dimensions with `width`/`height` props. Avoid layout shifts from font loading (font-display: swap ✅ already set). |
| FID/INP| < 200 ms       | Minimize main-thread blocking JS. Heavy components code-split with `dynamic()` ✅ already done on Home. |
| TTFB   | < 600 ms       | Confirm `revalidate = 60` ISR is correct on all data-fetching pages.     |

---

## 9. Internal Linking Strategy

### 9.1 Link Architecture

The site follows a hub-and-spoke model:

```
Home (/)
├── /services  ← links to all 6 service slugs
│   ├── /services/architecture-planning
│   ├── /services/professional-construction-services
│   ├── /services/surveying-site-measurements
│   ├── /services/interior-exterior-design
│   ├── /services/water-treatment-plant-construction
│   └── /services/project-management-consultancy
├── /projects  ← links to published project detail pages
├── /blogs     ← links to published blog posts
├── /about
├── /why-us
├── /contact
└── /cost-estimator
```

### 9.2 Cross-Linking Rules

| From Page          | Required Internal Links                                                                           |
|--------------------|---------------------------------------------------------------------------------------------------|
| Home (`/`)         | → `/services`, → `/projects`, → `/contact`, → `/cost-estimator`                                 |
| `/about`           | → `/services`, → `/why-us`, → `/contact`                                                        |
| `/why-us`          | → `/services`, → `/projects`, → `/contact`                                                      |
| `/services`        | → Each of the 6 service slug pages (card/grid links)                                            |
| Each service page  | → `/services` (parent), → `/contact`, → 2–3 related service pages, → `/cost-estimator` (where relevant) |
| `/projects`        | → Individual project pages, → `/services`, → `/contact`                                         |
| `/projects/[slug]` | → `/projects` (parent), → relevant service page, → `/contact`                                  |
| `/blogs`           | → Individual blog posts, → `/services`                                                          |
| `/blogs/[slug]`    | → Relevant service page, → `/contact` or `/cost-estimator`, → `/blogs` (parent)               |
| `/contact`         | → `/services`, → `/cost-estimator`                                                              |
| `/cost-estimator`  | → `/contact`, → `/services`                                                                     |
| `/careers`         | → `/about`, → `/contact`                                                                        |

### 9.3 Anchor Text Guidelines

- **Do:** Use descriptive, keyword-rich anchor text: "construction services in Bhilwara", "our water treatment plant projects"
- **Do not:** Use generic anchors: "click here", "read more", "learn more" in isolation
- **Do not:** Over-optimize with exact-match keyword anchors on every link (keep natural variation)
- Internal links should use `<Link href="...">` (Next.js) for client-side routing benefits

### 9.4 Breadcrumb Navigation

All inner pages (depth ≥ 2) must have:
1. Visual breadcrumb rendered in the UI
2. `BreadcrumbList` schema generated via `generateBreadcrumbSchema()` from `lib/schema.ts`

Standard breadcrumb patterns:

```
Home > Services > [Service Name]
Home > Projects > [Project Title]
Home > Blog > [Post Title]
Home > Contact
```

---

## 10. Trust & Authority Signals

### 10.1 NAP Consistency (Name, Address, Phone)

The following NAP must be **identical** across all on-site occurrences and off-site citations:

```
Name:    Hindustan Projects
Address: Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj,
         Bhilwara, Rajasthan 311001
Phone:   +91 75970 00601
Email:   info@hindustanprojects.in
```

**Audit checklist:**
- [ ] Footer — NAP visible and consistent
- [ ] Contact page — Full NAP displayed
- [ ] `hiproJsonLd.ts` — NAP in `address`, `telephone`, `email` fields ✅
- [ ] Google Business Profile — NAP matches exactly
- [ ] JustDial, IndiaMART, Sulekha, 99acres, and similar local directories — NAP consistent

### 10.2 Google Business Profile (GBP)

| Field                | Requirement                                                            |
|----------------------|------------------------------------------------------------------------|
| Business name        | Hindustan Projects (HiPRO)                                            |
| Category             | General Contractor (primary); Architectural Firm (secondary)          |
| Address              | Exact NAP as above                                                     |
| Phone                | +91 75970 00601                                                        |
| Website              | `https://www.hindustanprojects.in`                                     |
| Hours                | Mon–Sat 09:00–19:00                                                    |
| Photos               | Office exterior, project photos (at least 10 high-quality images)     |
| Services listed      | All 6 services — match service slug names                             |
| Posts                | Publish GBP posts monthly linking to blog or project pages            |
| Q&A                  | Seed with common customer questions                                   |

### 10.3 Social Proof Signals

- **Reviews:** Actively solicit Google reviews from clients — link directly from post-project emails
- **Testimonials:** Display verifiable testimonials on the site (already has `Testimonials` component); do not fabricate
- **Project photos:** High-quality before/after project imagery boosts engagement and trust

### 10.4 E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

| Signal           | Current State                      | Action Required                                               |
|------------------|------------------------------------|---------------------------------------------------------------|
| Author profiles  | Not visible                        | Add author byline (Yogesh Kharol or team) to blog posts      |
| About page depth | Unknown                            | Ensure `/about` covers founding, experience, team, mission   |
| Contact clarity  | ContactPage schema ✅               | Verify email, phone, address visible on contact page         |
| Privacy & legal  | Pages exist ✅                      | Keep privacy policy up to date                               |
| HTTPS            | ✅ (assumed from domain)           | Confirm TLS cert is valid; no mixed content                  |

---

## 11. Performance Protection

### 11.1 PageSpeed Baselines

| Metric           | Mobile Target | Desktop Target | Notes                                        |
|------------------|---------------|----------------|----------------------------------------------|
| Performance      | ≥ 98          | ≥ 99           | As established — do not regress below this   |
| Accessibility    | ≥ 90          | ≥ 90           | Maintain WCAG 2.1 AA compliance              |
| Best Practices   | ≥ 95          | ≥ 95           |                                              |
| SEO (Lighthouse) | 100           | 100            | All meta, canonical, robots must pass        |

### 11.2 SEO-Related Performance Rules

**Images:**
- Always specify `width` and `height` on `<Image>` components to prevent CLS
- Use `priority` prop on above-the-fold images (hero, OG thumbnails)
- Cloudinary images must use `q_auto,f_auto` transforms
- Do not use SVGs as OG images — the existing `resolveHbsOgImage()` in `hbsSeo.ts` already enforces JPG/PNG for social sharing ✅

**Fonts:**
- `font-display: swap` already configured via Next.js Google Fonts ✅ — do not change
- Limit font weights to those actually used to reduce font payload

**JavaScript:**
- Heavy components already code-split with `dynamic()` on Home page ✅ — apply the same pattern to other heavy pages (e.g., cost estimator, project gallery)
- Do not add third-party scripts without testing performance impact

**ISR (Incremental Static Regeneration):**
- `revalidate = 60` on `(site)/layout.tsx` and Home page ✅
- Apply consistent `revalidate` to all pages that fetch from DB

**Before merging any PR:**
1. Run `next build` and confirm no build errors
2. Run Lighthouse CI on `/`, `/services`, and one service slug page
3. Confirm Mobile Performance ≥ 98 and Desktop ≥ 99
4. Verify no new render-blocking resources introduced

### 11.3 Regression Prevention

```
# Recommended Lighthouse CI check (add to CI pipeline)
lighthouse https://www.hindustanprojects.in --output json \
  --chrome-flags="--headless" --only-categories=performance,seo
```

If a PR introduces a performance regression > 2 points on Mobile, it must be investigated before merging.

---

## 12. Measurement & Acceptance Criteria

### 12.1 Google Search Console (GSC)

**Setup checklist:**
- [ ] Site verified via `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env variable (already wired in `app/layout.tsx`)
- [ ] Sitemap submitted: `https://www.hindustanprojects.in/sitemap.xml`
- [ ] No coverage errors (4xx, 5xx) on key pages
- [ ] No manual actions

**Weekly monitoring:**
- Impressions and clicks for Bhilwara-local queries
- Average position for top 20 target keywords (from Clusters B–E)
- Coverage report: indexed pages count vs. total submitted

### 12.2 Google Analytics 4

**Tracking:**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` already wired in `app/layout.tsx` via `gtag.js` ✅
- `AnalyticsLinkTracker` component active ✅

**Key events to track:**
| Event                | Trigger                                                   |
|----------------------|-----------------------------------------------------------|
| `generate_lead`      | Contact form submission, phone click, email click         |
| `page_view`          | All pages (auto via GA4)                                  |
| `scroll_depth`       | 50%, 75%, 90% depth on service and project pages         |
| `tool_use`           | Cost estimator interaction                                |
| `outbound_click`     | Clicks to social profiles, maps, external links          |

### 12.3 Acceptance Criteria by Section

| Task                                      | Acceptance Criterion                                                               |
|-------------------------------------------|------------------------------------------------------------------------------------|
| Robots file                               | `GET /robots.txt` returns 200; `/admin/` and `/admin-login/` are disallowed       |
| All 20 pages with metadata                | Lighthouse SEO = 100 on each page; no missing title/description warnings          |
| Schema — all existing                     | Zero errors in Google Rich Results Test for all schema types                       |
| Schema — new additions                    | `BlogPosting`, `WebPage`, `CollectionPage` schemas pass Rich Results Test         |
| Sitemap                                   | All 20+ public pages + dynamic slugs appear in sitemap; no 404 URLs              |
| Canonical                                 | Every page has a self-referencing canonical; no duplicate canonicals              |
| NAP consistency                           | Footer, contact page, and `hiproJsonLd.ts` NAP are identical                     |
| Performance                               | Mobile ≥ 98, Desktop ≥ 99 on Lighthouse after all SEO changes                   |
| Internal linking                          | All service pages linked from `/services`; all service pages link back to parent |
| Blog content                              | Minimum 2 posts published per month; all posts have Article schema               |
| GSC                                       | Zero manual actions; sitemap indexed; no crawl errors on key pages               |
| GBP                                       | Listing live, NAP matches, 10+ photos uploaded, all services listed              |

### 12.4 KPI Tracking Cadence

| KPI                                     | Frequency  | Tool          |
|-----------------------------------------|------------|---------------|
| Organic sessions (Bhilwara local)       | Weekly     | GA4           |
| Impressions / clicks for target clusters | Weekly    | GSC           |
| Average position (top 20 keywords)      | Weekly     | GSC           |
| Indexed pages count                     | Weekly     | GSC Coverage  |
| Lighthouse scores (/, /services, slug)  | Per-deploy | Lighthouse CI |
| Google Local Pack appearance            | Monthly    | Manual check  |
| GBP reviews count                       | Monthly    | GBP Dashboard |
| Core Web Vitals (field data)            | Monthly    | GSC CWV report|
| Schema errors                           | Per-deploy | Rich Results Test |

---

## Appendix A — Service Slug Reference

| Service Name                    | Canonical Slug                                |
|---------------------------------|-----------------------------------------------|
| Architecture & Planning         | `architecture-planning`                       |
| Professional Construction Services | `professional-construction-services`      |
| Surveying & Site Measurements   | `surveying-site-measurements`                 |
| Interior & Exterior Design      | `interior-exterior-design`                    |
| Water Treatment Plant Construction | `water-treatment-plant-construction`        |
| Project Management & Consultancy | `project-management-consultancy`             |

---

## Appendix B — Schema File Reference

| File                             | Exports                                                                                            |
|----------------------------------|----------------------------------------------------------------------------------------------------|
| `frontend/lib/hiproJsonLd.ts`    | `HIPRO_JSON_LD` — site-wide `WebSite` + `Organization`/`LocalBusiness`/`GeneralContractor` array |
| `frontend/lib/schema.ts`         | `generateBreadcrumbSchema()`, `generateServiceSchema()`, `generateContactPageSchema()`, `generateFaqSchema()` |
| `frontend/lib/projectSchema.ts`  | `generateProjectBreadcrumbs()`, `generateProjectJsonLd()`, `generateProjectFaqSchema()`           |
| `frontend/lib/hbsSeo.ts`         | HBS-specific SEO utilities — OG image resolver, canonical URL, keywords (HBS sub-brand only)      |

---

## Appendix C — Key Environment Variables (SEO-Related)

| Variable                                | Purpose                                             |
|-----------------------------------------|-----------------------------------------------------|
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`  | Google Search Console site verification meta tag    |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`         | Google Analytics 4 measurement ID                   |
| `NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE`      | Controls HBS canonical URL resolution (subdomain vs. path) |

---

*End of HIPRO Local SEO Master Plan*
