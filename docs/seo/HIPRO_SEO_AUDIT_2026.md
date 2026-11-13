# HiPRO Website — Full SEO Audit Report 2026
**Site:** https://www.hindustanprojects.in  
**Framework:** Next.js 15 (App Router)  
**Audit Date:** November 2026  
**Auditor:** SEO Audit Agent (seo-audit)  
**Branch under audit:** feat/hind-build-seo-social-share  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Issue Priority Matrix](#2-issue-priority-matrix)
3. [Root Layout & Global SEO Configuration](#3-root-layout--global-seo-configuration)
4. [Site Layout & Global Schema](#4-site-layout--global-schema)
5. [Per-Page SEO Findings](#5-per-page-seo-findings)
6. [robots.txt Audit](#6-robotstxt-audit)
7. [sitemap.ts Audit](#7-sitemapsts-audit)
8. [Schema / Structured Data Audit](#8-schema--structured-data-audit)
9. [Canonical URL Consistency Audit](#9-canonical-url-consistency-audit)
10. [OG Image Audit](#10-og-image-audit)
11. [Summary of All Issues](#11-summary-of-all-issues)
12. [Recommended Action Plan](#12-recommended-action-plan)

---

## 1. Executive Summary

The HiPRO website has a **solid SEO foundation** with a well-configured root layout, comprehensive LocalBusiness/Organization schema injected globally, and consistent use of breadcrumb and page-specific schemas across most content pages. However, the audit uncovered **9 primary issues** and several medium-priority gaps that need attention before the site reaches full SEO maturity.

### Top Critical Findings
| # | Severity | Issue |
|---|----------|-------|
| 1 | 🔴 HIGH | `og-banner.jpg` referenced in root layout exists in `/public` ✅ but `/og-image.jpg` (used by Projects & Blogs pages) **does NOT exist** in `/public` |
| 2 | 🔴 HIGH | Canonical inconsistency: `cost-estimator/layout.tsx` uses an **absolute URL** (`https://www.hindustanprojects.in/cost-estimator`); all other pages use **relative paths** (`/services`, `/about`, etc.) |
| 3 | 🟠 MEDIUM | `sitemap.ts` includes **HBS routes** (`/hbs/*`) alongside HiPRO routes — these are a different brand entity and should not be in the HiPRO sitemap unless HBS is confirmed as a subpath of this same domain |
| 4 | 🟠 MEDIUM | **About page metadata is CMS-driven** via `generateMetadata()` fetching `/api/about` — if the CMS content is empty, falls back to generic text; canonical is also CMS-controlled (potential canonical drift) |
| 5 | 🟠 MEDIUM | **Why Us page** (`/why-us`) has **no OG/Twitter tags** and **no structured data** (no breadcrumb, no WebPage schema) |
| 6 | 🟠 MEDIUM | **Careers page** (`/careers`) has **no OG/Twitter tags** and **no structured data** |
| 7 | 🟠 MEDIUM | **Privacy Policy / Terms pages** have **no OG/Twitter tags** |
| 8 | 🟡 LOW | **Service detail page** (`/services/[slug]`) OG block is missing `locale`, `siteName`, and `type` fields — relies on root layout fallback |
| 9 | 🟡 LOW | **Blog detail page** canonical uses a **relative path** (`/blogs/${slug}`) while some other pages use absolute URLs — creates minor inconsistency |
| 10 | 🟡 LOW | **Contact page** missing Twitter card metadata |
| 11 | 🟡 LOW | Homepage has no explicit `metadata` export — inherits from root layout (acceptable but means title = default, not page-specific) |
| 12 | 🟡 LOW | **Cost estimator page** is `"use client"` — no server-rendered metadata export at page level; all metadata comes from the layout |

---

## 2. Issue Priority Matrix

```
Priority Legend:
🔴 HIGH   — Likely impacting indexing, ranking, or social sharing right now
🟠 MEDIUM — Gaps reducing crawl quality or missed rich snippet opportunities
🟡 LOW    — Inconsistencies or hygiene issues; low immediate impact
✅ GOOD   — No action needed
```

| Issue | Severity | Pages Affected | Effort to Fix |
|-------|----------|----------------|---------------|
| `/og-image.jpg` missing from `/public` | 🔴 HIGH | /projects, /blogs | Low (add file) |
| Canonical absolute vs. relative inconsistency | 🔴 HIGH | /cost-estimator vs. all others | Low (normalize) |
| HBS routes in HiPRO sitemap | 🟠 MEDIUM | sitemap.ts | Medium |
| CMS-driven About metadata (canonical drift risk) | 🟠 MEDIUM | /about | Medium |
| Why Us — no OG/Twitter/Schema | 🟠 MEDIUM | /why-us | Low |
| Careers — no OG/Twitter/Schema | 🟠 MEDIUM | /careers | Low |
| Privacy Policy / Terms — no OG/Twitter | 🟠 MEDIUM | /privacy-policy, /terms | Low |
| Service detail OG missing locale/siteName/type | 🟡 LOW | /services/[slug] | Low |
| Blog detail canonical relative vs. absolute inconsistency | 🟡 LOW | /blogs/[slug] | Low |
| Contact — no Twitter card | 🟡 LOW | /contact | Low |
| Homepage title = default (no page-level metadata export) | 🟡 LOW | / | Low |
| Cost Estimator client component / no page metadata | 🟡 LOW | /cost-estimator | Low |

---

## 3. Root Layout & Global SEO Configuration

**File:** `frontend/app/layout.tsx`

### Configuration
| Field | Value |
|-------|-------|
| `metadataBase` | `https://www.hindustanprojects.in` ✅ |
| Default Title | `Hindustan Projects (HiPRO) \| Engineering, Construction & Infrastructure` |
| Title Template | `%s \| Hindustan Projects (HiPRO)` |
| Description | "Hindustan Projects (HiPRO) is an engineering, turnkey construction, and infrastructure firm based in Bhilwara, Rajasthan, delivering residential, commercial, and industrial developments." |
| Keywords | 11 keywords covering brand + local terms ✅ |
| Root Canonical | `/` (relative) |
| OG Type | `website` |
| OG Locale | `en_IN` ✅ |
| OG Image | `/og-banner.jpg` (1200×630, exists in public ✅) |
| Twitter Card | `summary_large_image` ✅ |
| Icon | `/logo.jpg` ✅ |
| Robots | `index: true, follow: true` ✅ |
| Google Verification | `process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (env-driven ✅) |
| Geo Tags | `geo.region`, `geo.placename`, `geo.position`, `ICBM` all set ✅ |
| Analytics | GA4 via `NEXT_PUBLIC_GA_MEASUREMENT_ID` env variable (lazyOnload ✅) |

### Issues
- None critical. The root layout is well-configured.

### Recommendations
- Consider adding `manifest` icon path for PWA-readiness.
- The description (181 chars) is slightly over the optimal 155-160 char limit for search snippets; trim by ~25 chars.

---

## 4. Site Layout & Global Schema

**File:** `frontend/app/(site)/layout.tsx`

### Configuration
- Injects `HIPRO_JSON_LD` from `lib/hiproJsonLd.ts` as a `<script type="application/ld+json">` on **every** page inside the `(site)` route group.
- Provides: `WebSite` schema (with `@id`) + combined `Organization/LocalBusiness/GeneralContractor` schema.

### Schema Assessment (`lib/hiproJsonLd.ts`)
| Schema Type | Present | Quality |
|-------------|---------|---------|
| `WebSite` | ✅ | Good — has `@id`, `url`, `name`, `publisher` reference |
| `Organization` | ✅ | Excellent — `@id`, `name`, `legalName`, `address`, `geo`, `openingHours`, `areaServed`, `telephone`, `email`, `sameAs`, `knowsAbout`, `hasOfferCatalog` |
| `LocalBusiness` | ✅ (combined type) | Good — `GeneralContractor` subtype included |
| `Person` (Founder) | Referenced in `about` page, not in global schema | Acceptable |

### Issues
- The `logo` field in Organization schema points to `/logo.jpg`, not `/og-banner.jpg`. Google's structured data guidelines prefer a rectangular logo (600×60 max). Using `logo.jpg` (a square icon) may not fully satisfy the logo guidelines.
- `areaServed` only lists `Bhilwara` and `Rajasthan` — could be expanded to include major cities served (Jaipur, Jodhpur, Ajmer, etc.) for broader local SEO coverage.

---

## 5. Per-Page SEO Findings

---

### 5.1 Homepage — `/`

**File:** `frontend/app/(site)/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/` |
| Title | *(inherits root default)* `Hindustan Projects (HiPRO) \| Engineering, Construction & Infrastructure` |
| Meta Description | *(inherits root)* "Hindustan Projects (HiPRO) is an engineering, turnkey construction..." |
| H1 | Dynamic hero heading (from CMS `slidedata`) — not visible in static code |
| Canonical | `/` (via root layout) |
| Schema | `WebPage` with `@id`, BreadcrumbList (single item: Home), + global Organization schema |
| OG Tags | ✅ Inherits from root layout (og-banner.jpg 1200×630) |
| Twitter Card | ✅ Inherits from root layout |

#### Issues
1. **No dedicated `metadata` export** — the homepage title/description falls back to root layout defaults. This means the `<title>` tag does not include page-level keyword optimizations like "Construction Company Bhilwara".
2. **H1 is fully dynamic** (CMS-controlled hero slide heading) — if the CMS is empty or the slide is inactive, there may be no H1 on the page at all. This should have a hardcoded fallback.
3. The home JSON-LD `WebPage` block uses an **inline BreadcrumbList** nested inside `WebPage.breadcrumb` rather than a standalone script. While technically valid, a standalone `BreadcrumbList` script is more reliably parsed by Google.

#### Recommendations
- Add a `metadata` export to `page.tsx` with a homepage-optimized title: `"Construction Company in Bhilwara | Hindustan Projects (HiPRO)"` and a unique, keyword-rich description.
- Ensure hero component always has a fallback H1 when CMS slides are empty.
- Extract breadcrumb into its own `<script type="application/ld+json">` block.

---

### 5.2 About — `/about`

**File:** `frontend/app/(site)/about/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/about` |
| Title | **CMS-driven** via `content?.metaTitle \|\| "About Us — Engineering & Construction Firm"` |
| Meta Description | **CMS-driven** via `content?.metaDescription \|\| "Hindustan Projects (HiPRO) is..."` |
| H1 | Dynamic: `{heroHeadingPrefix} {heroHeadingAccent} {heroHeadingSuffix}` (CMS + fallback) |
| Canonical | **CMS-driven**: `content?.canonicalUrl \|\| "/about"` ⚠️ |
| Schema | `AboutPage`, `BreadcrumbList`, `Person` (Founder) — all present ✅ |
| OG Tags | ✅ Present — `ogTitle`, `ogDesc`, `ogImage` all CMS-driven with fallbacks |
| Twitter Card | ✅ Present — CMS-driven with fallbacks |

#### Issues
1. **CMS-driven canonical is a risk.** If a CMS user accidentally sets `canonicalUrl` to an external URL or a wrong path, it creates a non-canonical canonical — one of the most damaging SEO mistakes. The canonical should be enforced as `/about` from code, with CMS overriding only allowed for the `hreflang` alternate at most.
2. **CMS-driven metadata title** strips the template suffix (` | Hindustan Projects (HiPRO)`) — if CMS sets a title without enough brand context, it may be too generic. Code confirms the strip logic exists; needs content governance.
3. **OG image falls back to `/logo.jpg`** (not `og-banner.jpg`) when CMS has no image set. The logo is not an ideal OG image for social sharing (too small/square).
4. The About page **does not export `generateStaticParams`** and uses `revalidate = 60`, meaning initial SSR is required. If the backend API is down at build time, the fallback title "About Us — Engineering & Construction Firm" appears in search results without the brand name — weak for CTR.

#### Recommendations
- **Lock canonical to `/about` in code** — do not let CMS control it. CMS OG image/title/description should be CMS-editable, canonical should not.
- Change OG image fallback from `/logo.jpg` to `/og-banner.jpg` for consistent social card appearance.
- Add a code-level brand suffix check: if the CMS title lacks "Hindustan Projects" or "HiPRO", append " | Hindustan Projects (HiPRO)" automatically.

---

### 5.3 Services Listing — `/services`

**File:** `frontend/app/(site)/services/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/services` |
| Title | `Construction & Engineering Services in Bhilwara & Rajasthan` |
| Rendered Title | `Construction & Engineering Services in Bhilwara & Rajasthan \| Hindustan Projects (HiPRO)` |
| Meta Description | "Comprehensive civil construction, architectural planning, digital surveying, interior design, and project management services by Hindustan Projects (HiPRO)." |
| H1 | "Engineering Services Built for *Real-World Execution*" |
| Canonical | `/services` (relative) ✅ |
| Schema | `CollectionPage` + `BreadcrumbList` (via `@graph`) ✅ |
| OG Tags | ⚠️ **Missing** — no `openGraph` block in metadata export |
| Twitter Card | ⚠️ **Missing** — no `twitter` block in metadata export |

#### Issues
1. **No OG / Twitter tags** — when this page is shared on social media, it will fall back to root layout OG (generic og-banner.jpg + generic brand description), which is suboptimal for a core service listing page.
2. Description is 162 chars — slightly over ideal 155 char limit.
3. H1 "Engineering Services Built for Real-World Execution" does not include the geo-keyword "Bhilwara" or "Rajasthan" — a missed local SEO opportunity.

#### Recommendations
- Add `openGraph` and `twitter` blocks to the metadata export, using the services-specific title/description and `/og-banner.jpg`.
- Revise H1 to: "Engineering & Construction Services in Bhilwara, Rajasthan" for local keyword alignment.
- Trim description to ≤155 chars.

---

### 5.4 Service Detail — `/services/[slug]`

**File:** `frontend/app/(site)/services/[slug]/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/services/{slug}` |
| Title | `richContent.metaTitle \|\| "{cleanTitle} \| Hindustan Projects (HiPRO)"` — uses `title.absolute` to bypass template |
| Meta Description | `richContent.metaDescription \|\| service.description` |
| H1 | `{displayTitle}` (service title from DB) ✅ |
| Canonical | `/services/{canonicalSlug}` (relative) ✅ |
| Schema | `BreadcrumbList` + `Service` schema + optional `FAQPage` ✅ |
| OG Tags | ⚠️ Partial — `title`, `description`, `url`, `images` present; **missing `locale`, `siteName`, `type`** |
| Twitter Card | ⚠️ **No Twitter block** in metadata |

#### Issues
1. **OG block incomplete** — missing `locale: "en_IN"`, `siteName: "Hindustan Projects (HiPRO)"`, and `type: "website"`. These are inherited from root layout, but explicit declaration is best practice and more reliable.
2. **No Twitter card** — service detail pages are highly shareable; missing Twitter metadata.
3. **Fallback title `"Service Details"`** when service is not found (line 190) — this would appear in SERPs for any broken slug before it triggers `notFound()`.
4. OG image uses `service.image` (Unsplash URL) — Unsplash images can break if the CDN changes URLs. Should have a fallback to `/og-banner.jpg`.

#### Recommendations
- Extend the OG block with `locale`, `siteName`, and `type`.
- Add `twitter` metadata block.
- Improve the not-found title to something like `"Service Not Found | Hindustan Projects"`.
- Add `/og-banner.jpg` as a fallback for OG image.

---

### 5.5 Projects Listing — `/projects`

**File:** `frontend/app/(site)/projects/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/projects` |
| Title | `Project Portfolio — Turnkey Engineering` → rendered as `Project Portfolio — Turnkey Engineering \| Hindustan Projects (HiPRO)` |
| Meta Description | "Explore verified industrial, commercial, institutional, and turnkey construction projects delivered by Hindustan Projects (HiPRO) across Rajasthan and India." |
| H1 | Dynamic (from `ProjectsHero` component / CMS) |
| Canonical | `https://www.hindustanprojects.in/projects` (**absolute URL** ⚠️) |
| Schema | `BreadcrumbList` ✅ |
| OG Tags | ✅ Full OG block present |
| Twitter Card | ✅ Full Twitter block present |

#### Issues
1. **Canonical uses absolute URL** (`https://www.hindustanprojects.in/projects`) while most other pages use relative paths (`/services`, `/about`). This inconsistency could cause confusion if the base URL ever changes, but is functionally correct.
2. **OG image** references `https://www.hindustanprojects.in/og-image.jpg` — **this file does NOT exist** in `/public`. The public folder contains `og-banner.jpg` but NOT `og-image.jpg`. This means social sharing for the Projects page will produce a broken/missing image card. 🔴
3. Title "Project Portfolio — Turnkey Engineering" is good but lacks geo context ("Rajasthan" or "Bhilwara").
4. No `CollectionPage` or additional `ItemList` schema for the project grid — a missed rich snippet opportunity.

#### Recommendations
- **Immediately**: Create `/public/og-image.jpg` (1200×630) or update the OG `images` reference to `/og-banner.jpg`.
- Normalize canonical to relative path `/projects` for consistency.
- Add "Rajasthan" to the page title.
- Consider adding an `ItemList` schema for top projects.

---

### 5.6 Project Detail — `/projects/[slug]`

**File:** `frontend/app/(site)/projects/[slug]/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/projects/{slug}` |
| Title | `p.metaTitle \|\| "{p.title} \| {p.category} Case Study"` |
| Meta Description | `p.metaDescription \|\| p.shortDescription \|\| p.description[:160]` |
| H1 | `{project.title}` ✅ |
| Canonical | Absolute — built via `buildProjectCanonicalUrl(cleanSlug)` ✅ |
| Schema | `BreadcrumbList` + `CreativeWork`/`Project` JSON-LD + optional `FAQPage` ✅ |
| OG Tags | ✅ Full — `title`, `description`, `url`, `siteName`, `locale`, `type: "article"`, `images` |
| Twitter Card | ✅ Full |
| noIndex support | ✅ Respects `p.noIndex` and `p.noFollow` flags |

#### Issues
1. **Project title template** strips " | Hindustan Projects" suffix from `metaTitle` (line 153-155), which is correct behavior. However, the base title `"{p.title} | {p.category} Case Study"` can produce very long titles (e.g., "Expansion of Weaving Department (Airjet) – Ajay Syntex Pvt. Ltd. | Industrial Construction Case Study") — over 70 chars.
2. **OG image is optional** — if no `ogImage` or `image` on the project record, the OG block gets `images: undefined`, causing the root layout's `og-banner.jpg` to be used. This is acceptable as a fallback.
3. **Fallback title** "Project Case Study" is returned when project is not found (before `notFound()`) — same issue as services.

#### Recommendations
- Enforce a max title length of 60 chars; truncate `p.category` portion if needed.
- Ensure all published projects have at least a cover image for OG.

---

### 5.7 Blogs Listing — `/blogs`

**File:** `frontend/app/(site)/blogs/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/blogs` |
| Title | `Construction Blog & Industry Insights` → rendered: `Construction Blog & Industry Insights \| Hindustan Projects (HiPRO)` |
| Meta Description | "Read the latest news, tips, and insights on construction, architecture, and infrastructure development in India from Hindustan Projects." |
| H1 | Dynamic (from `BlogsHero` CMS config) |
| Canonical | `https://www.hindustanprojects.in/blogs` (**absolute** ⚠️) |
| Schema | `BreadcrumbList` + `Blog` schema ✅ |
| OG Tags | ✅ Present |
| Twitter Card | ✅ Present |

#### Issues
1. **OG image references `https://www.hindustanprojects.in/og-image.jpg`** — **does NOT exist** in `/public`. 🔴 Same critical issue as Projects page.
2. Canonical uses absolute URL — inconsistent with other pages using relative paths.
3. Meta description (148 chars) is good length ✅.
4. `Blog` schema's `blogPost` array uses `post.image` directly — if a blog post has no image, this produces `undefined` entries in the structured data array.

#### Recommendations
- **Immediately**: Change OG image to `/og-banner.jpg` (or create `og-image.jpg`).
- Normalize canonical to relative path `/blogs`.
- Add null check in Blog schema `blogPost` array for `image` field.

---

### 5.8 Blog Detail — `/blogs/[slug]`

**File:** `frontend/app/(site)/blogs/[slug]/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/blogs/{slug}` |
| Title | `post.metaTitle \|\| post.title` |
| Meta Description | `post.metaDescription \|\| post.excerpt` |
| H1 | `{post.title}` ✅ |
| Canonical | `/blogs/${decodedSlug}` (**relative**) |
| Schema | `BlogPosting` + `BreadcrumbList` + optional `FAQPage` ✅ |
| OG Tags | ✅ Full — `title`, `description`, `images`, `type: "article"`, `publishedTime`, `authors`, `section` |
| Twitter Card | ✅ Full |

#### Issues
1. **Canonical is relative** (`/blogs/${slug}`) while sibling listing page `/blogs` uses an **absolute URL** canonical — inconsistency within the same section.
2. **OG `images` uses `[post.image]` directly** — if `post.image` is null/undefined, the OG block becomes `images: [undefined]`, which is invalid. Should be `post.image ? [post.image] : undefined`.
3. **No `locale` or `siteName`** in the OG block — relies on root layout. Should be explicit.
4. Twitter `images: [post.image]` has the same null-safety issue as OG images.
5. Fallback `{ title: "Blog Not Found" }` when post is not found — no description, no robots noindex. Should add `robots: { index: false }` to the not-found fallback.

#### Recommendations
- Change canonical to absolute URL for consistency: `` `https://www.hindustanprojects.in/blogs/${decodedSlug}` ``.
- Guard `post.image` in OG and Twitter: `post.image ? [post.image] : undefined`.
- Add `locale` and `siteName` to OG block.
- Add `robots: { index: false, follow: false }` to the not-found metadata return.

---

### 5.9 Contact — `/contact`

**File:** `frontend/app/(site)/contact/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/contact` |
| Title | CMS-driven: `contactContent.metaTitle \|\| "Contact Office — Bhilwara, Rajasthan"` |
| Meta Description | CMS-driven with fallback "Get in touch with Hindustan Projects (HiPRO)..." |
| H1 | CMS-driven: `{headingPrefix} {headingAccent}` (default: "Get In *Touch*") |
| Canonical | `/contact` (relative) ✅ |
| Schema | `BreadcrumbList` + `ContactPage` ✅ |
| OG Tags | ✅ Present — but `images` uses `logo.jpg` (not `og-banner.jpg`) |
| Twitter Card | ⚠️ **Missing** — no `twitter` block in `generateMetadata()` |

#### Issues
1. **No Twitter card** — `generateMetadata()` does not include a `twitter` block. Social sharing via Twitter/X will produce a plain link card.
2. **OG image is `logo.jpg`** (small square icon, 800×600) — not an ideal social share image. Should be `og-banner.jpg` (1200×630) for consistent branding.
3. CMS-driven title has the same canonical drift risk as the About page (though canonical is code-locked here ✅).

#### Recommendations
- Add `twitter: { card: "summary_large_image", title, description, images: ["/og-banner.jpg"] }` to `generateMetadata()`.
- Change OG image from `/logo.jpg` to `/og-banner.jpg`.

---

### 5.10 Why Us — `/why-us`

**File:** `frontend/app/(site)/why-us/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/why-us` |
| Title | `Why Us \| Engineering Discipline & Execution Reliability` → rendered: `Why Us \| Engineering Discipline & Execution Reliability \| Hindustan Projects (HiPRO)` |
| Meta Description | "Learn why clients choose Hindustan Projects (HiPRO) for integrated architectural planning, precision land surveying, turnkey civil construction, and project management in Bhilwara and Rajasthan." |
| H1 | "Why Hindustan Projects: Built On Technical Discipline & *Structural Reliability*" ✅ |
| Canonical | `/why-us` (relative) ✅ |
| Schema | ⚠️ **None** — no structured data whatsoever |
| OG Tags | ⚠️ **Missing** — no `openGraph` in metadata export |
| Twitter Card | ⚠️ **Missing** — no `twitter` in metadata export |

#### Issues
1. **No OG/Twitter tags** — full social sharing will use root layout defaults only.
2. **No structured data** — not even a `WebPage` or `BreadcrumbList`.
3. **Title template produces a very long title** ("Why Us | Engineering Discipline & Execution Reliability | Hindustan Projects (HiPRO)") — this is 76 chars, well over the 60 char display limit. The title will be truncated in SERPs.

#### Recommendations
- Add `openGraph` and `twitter` metadata blocks.
- Add `BreadcrumbList` and `WebPage` structured data.
- Shorten title: `"Why Choose HiPRO | Bhilwara Construction Firm"` (47 chars).

---

### 5.11 Careers — `/careers`

**File:** `frontend/app/(site)/careers/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/careers` |
| Title | `Careers & Opportunities` → rendered: `Careers & Opportunities \| Hindustan Projects (HiPRO)` |
| Meta Description | "Explore career opportunities at Hindustan Projects (HiPRO). Join our technical engineering, project management, and construction supervision team in Bhilwara, Rajasthan." |
| H1 | "Build Your *Career* With Us" ✅ |
| Canonical | `/careers` (relative) ✅ |
| Schema | ⚠️ **None** — no structured data |
| OG Tags | ⚠️ **Missing** |
| Twitter Card | ⚠️ **Missing** |

#### Issues
1. **No OG/Twitter tags**.
2. **No structured data** — at minimum a `BreadcrumbList` and optionally `JobPosting` schema for active job listings (which would appear as rich results in Google Jobs).
3. Good description (172 chars) — slightly long, trim to ≤155 chars.

#### Recommendations
- Add `openGraph` and `twitter` metadata blocks.
- Add `BreadcrumbList` schema.
- Add `JobPosting` schema for each active job listing (significant rich result opportunity for recruitment SEO).
- Trim description by ~17 chars.

---

### 5.12 Cost Estimator — `/cost-estimator`

**File:** `frontend/app/(site)/cost-estimator/layout.tsx` + `page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/cost-estimator` |
| Title | `House Construction Cost Calculator in Bhilwara` → rendered: `House Construction Cost Calculator in Bhilwara \| Hindustan Projects (HiPRO)` |
| Meta Description | "Calculate indicative house construction costs in Bhilwara and Rajasthan. Get package-wise estimates for residential construction from ₹1,680/sqft by Hindustan Projects." |
| H1 | Dynamic (CMS-driven from client component) |
| Canonical | `https://www.hindustanprojects.in/cost-estimator` (**absolute URL** in layout.tsx) 🔴 |
| Schema | `FAQPage` schema generated in `page.tsx` (client component — verify SSR renders it) |
| OG Tags | ⚠️ **Missing** from layout — no `openGraph` block |
| Twitter Card | ⚠️ **Missing** from layout — no `twitter` block |

#### Issues
1. **Canonical is absolute** (`https://www.hindustanprojects.in/cost-estimator`) — the ONLY page using an absolute canonical in layout. All other pages use relative paths. This is the canonical inconsistency called out in the brief. Normalize to `/cost-estimator`. 🔴
2. **No OG/Twitter tags** in the layout metadata export — no social sharing metadata for one of the most valuable lead-gen pages.
3. **Page component is `"use client"`** — the `FAQPage` JSON-LD schema is generated inside a client component. Verify that Next.js is correctly server-rendering this via the `ssr: true` Suspense boundary or that the script tag is included in initial HTML. If it's client-side only, Googlebot may not see the FAQ schema.
4. **No BreadcrumbList** schema.
5. The page metadata is entirely in `layout.tsx`, which is acceptable for a nested layout. However, page-level `generateStaticParams` / static metadata would allow better static optimization.

#### Recommendations
- **Change canonical** from absolute to `/cost-estimator`.
- Add `openGraph` and `twitter` blocks to the layout metadata.
- Verify FAQ schema is in SSR HTML output (inspect page source).
- Add `BreadcrumbList` schema (either in layout or page component server wrapper).

---

### 5.13 Privacy Policy — `/privacy-policy`

**File:** `frontend/app/(site)/privacy-policy/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/privacy-policy` |
| Title | `Privacy Policy` → rendered: `Privacy Policy \| Hindustan Projects (HiPRO)` |
| Meta Description | "Read the Privacy Policy for Hindustan Projects (HiPRO). Learn how we handle project inquiries, consultation requests, job applications, advertising cookies, and website data." |
| H1 | "Privacy *Policy*" ✅ |
| Canonical | `/privacy-policy` (relative) ✅ |
| Schema | ⚠️ **None** |
| OG Tags | ⚠️ **Missing** |
| Twitter Card | ⚠️ **Missing** |
| Robots | `index: true, follow: true` ✅ |

#### Issues
- No OG/Twitter tags — lower priority than commercial pages, but still affects link sharing.
- No structured data (acceptable for legal pages, but a `WebPage` schema could help).

#### Recommendations
- Add minimal OG: `title`, `description`, `type: "website"`, `images: ["/og-banner.jpg"]`.
- Priority: Low. Legal pages rarely drive organic traffic or social sharing.

---

### 5.14 Terms of Service — `/terms`

**File:** `frontend/app/(site)/terms/page.tsx`

| Attribute | Value |
|-----------|-------|
| URL | `https://www.hindustanprojects.in/terms` |
| Title | `Terms of Service` → rendered: `Terms of Service \| Hindustan Projects (HiPRO)` |
| Meta Description | "Review the Terms of Service for Hindustan Projects (HiPRO). Understand website terms, service inquiries, and our construction cost estimator disclaimer." |
| H1 | "Terms of *Service*" ✅ |
| Canonical | `/terms` (relative) ✅ |
| Schema | ⚠️ **None** |
| OG Tags | ⚠️ **Missing** |
| Twitter Card | ⚠️ **Missing** |
| Robots | `index: true, follow: true` ✅ |

#### Issues
- Same as Privacy Policy: missing OG/Twitter. Low priority.

---

## 6. robots.txt Audit

**File:** `frontend/public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /admin-login
Disallow: /api/

Sitemap: https://www.hindustanprojects.in/sitemap.xml
```

### Assessment

| Check | Result |
|-------|--------|
| Blocks admin routes | ✅ `/admin`, `/admin/`, `/admin-login` blocked |
| Blocks API routes | ✅ `/api/` blocked |
| Accidentally blocks public pages | ✅ No — `Allow: /` before all disallows covers all public routes |
| Sitemap declaration | ✅ Correct absolute URL |
| Cookie policy page | ✅ Not blocked (exists but not in Disallow) |
| HBS routes | ⚠️ `/hbs/*` routes are NOT blocked — if HBS is a separate entity on this domain, its routes will be crawled |

### Issues
1. **No `/hbs/` Disallow** — if the HBS sub-site is intended to be indexed as part of this domain, this is fine. If HBS routes are under a separate brand identity that should not be mixed with HiPRO's organic footprint, consider a separate `User-agent: *` rule or a dedicated `Disallow: /hbs/` with their own robots segment.
2. **`/admin-login`** (without trailing slash) is blocked but `/admin-login/` is not explicitly blocked — though the `Allow: /` + specificity rules should handle this correctly in most crawlers.

### Recommendations
- If HBS is a distinct domain/subdomain experience that just happens to live at `/hbs/*`, consider whether it should be indexed under hindustanprojects.in. If so, the sitemap entries are appropriate. If not, block with `Disallow: /hbs/`.
- Add `Disallow: /admin-login/` for completeness.

---

## 7. sitemap.ts Audit

**File:** `frontend/app/sitemap.ts`

### Static Routes Coverage

| Route | Priority | Change Freq | In Sitemap |
|-------|----------|-------------|------------|
| `/` (homepage) | 1.0 | weekly | ✅ |
| `/about` | 0.8 | weekly | ✅ |
| `/why-us` | 0.8 | weekly | ✅ |
| `/services` | 0.8 | weekly | ✅ |
| `/projects` | 0.8 | weekly | ✅ |
| `/blogs` | 0.8 | weekly | ✅ |
| `/careers` | 0.8 | weekly | ✅ |
| `/contact` | 0.8 | weekly | ✅ |
| `/cost-estimator` | 0.8 | weekly | ✅ |
| `/privacy-policy` | 0.3 | monthly | ✅ |
| `/terms` | 0.3 | monthly | ✅ |
| `/cookie-policy` | 0.3 | monthly | ✅ |

### Dynamic Routes Coverage

| Route Type | Filtering | Priority | In Sitemap |
|------------|-----------|----------|------------|
| `/blogs/[slug]` | published, active, not future-dated | 0.7 | ✅ |
| `/projects/[slug]` | publishStatus=published, not archived, not noIndex | 0.7 | ✅ |
| `/services/[slug]` | active, from DB or COMPANY_INFO fallback | 0.7 | ✅ |
| `/hbs/` (static) | n/a | 0.8 | ⚠️ Present (see below) |
| `/hbs/services/[slug]` | DEFAULT_HBS_SERVICES | 0.7 | ⚠️ Present |
| `/hbs/projects/[slug]` | fetchHbsProjects() | 0.7 | ⚠️ Present |

### Issues

1. **HBS Routes Mixed In** 🟠 — The sitemap includes `/hbs`, `/hbs/about`, `/hbs/services`, `/hbs/projects`, `/hbs/contact`, `/hbs/why-choose-us` and all their dynamic children alongside HiPRO routes. These are entries for a **completely different brand** (Hind Building Solutions). Google's sitemap guidelines recommend that a sitemap should cover pages relevant to the site's primary entity. Mixing Hind Building Solutions pages in the HiPRO sitemap:
   - May confuse Google's understanding of the site's topical authority.
   - If HBS has its own domain eventually, these will need to be removed.
   - At minimum, these should be in a separate `/hbs-sitemap.xml` referenced from `/hbs/robots.txt`.

2. **`lastModified` for all static routes is `new Date()`** — this means every time the sitemap is regenerated (every 60s via revalidate), all static pages report today's date. Google may ignore `lastModified` signals when they appear inaccurate (always "today"). Use actual known last-modified dates where possible, or simply omit the `lastModified` field for static pages.

3. **Priority values** — All commercial pages at 0.7 and 0.8 is reasonable. Consider elevating `/cost-estimator` and `/contact` to `1.0` or `0.9` as they are primary conversion pages.

4. **`changeFrequency: "weekly"` for all commercial pages** — Only some pages actually change weekly. `/why-us`, `/about`, and legal pages change rarely; `monthly` would be more accurate for those.

5. **Blog routes use `updatedAt`/`createdAt`** for `lastModified` ✅ — this is correct behavior.

6. **`cookie-policy` page** exists in sitemap but there is no corresponding page file identified in the audit brief. Confirm `/cookie-policy` has a proper page file.

### Recommendations
- Split HBS routes into a separate `frontend/app/hbs-sitemap.ts` or conditionally exclude them.
- Remove `lastModified: new Date()` from static routes or use a fixed build date.
- Elevate `/cost-estimator` and `/contact` priority to `0.9`.

---

## 8. Schema / Structured Data Audit

### Global Schemas (injected on every (site) page)

| Schema | @type | @id | Quality |
|--------|-------|-----|---------|
| WebSite | `WebSite` | `/#website` | ✅ Good |
| Organization | `Organization, LocalBusiness, GeneralContractor` | `/#organization` | ✅ Excellent |

### Per-Page Schema Summary

| Page | Schemas Present | Missing |
|------|-----------------|---------|
| Homepage | `WebPage`, `BreadcrumbList` (inline) | Standalone BreadcrumbList |
| About | `AboutPage`, `BreadcrumbList`, `Person` (Founder) | ✅ Complete |
| Services listing | `CollectionPage`, `BreadcrumbList` | OG/Twitter |
| Service detail | `BreadcrumbList`, `Service`, optional `FAQPage` | ✅ Good |
| Projects listing | `BreadcrumbList` | `CollectionPage` or `ItemList` |
| Project detail | `BreadcrumbList`, `CreativeWork`, optional `FAQPage` | ✅ Good |
| Blogs listing | `BreadcrumbList`, `Blog` | ✅ Good |
| Blog detail | `BlogPosting`, `BreadcrumbList`, optional `FAQPage` | ✅ Good |
| Contact | `BreadcrumbList`, `ContactPage` | ✅ Good |
| Why Us | **None** | WebPage, BreadcrumbList |
| Careers | **None** | WebPage, BreadcrumbList, JobPosting |
| Cost Estimator | `FAQPage` (client-rendered ⚠️) | BreadcrumbList, verify SSR |
| Privacy Policy | None | WebPage (low priority) |
| Terms | None | WebPage (low priority) |

### Duplicate Entity Risks

| Entity | Declared In | Risk |
|--------|-------------|------|
| `Organization @id/#organization` | `hiproJsonLd.ts` (global), referenced in all page schemas | ✅ No duplication — correctly uses `@id` references |
| `Person @id/#founder` | `about/page.tsx`, referenced in blogs | ✅ No duplication |
| `WebSite @id/#website` | `hiproJsonLd.ts` (global) | ✅ Correct |
| `BreadcrumbList` | Each page independently | ✅ No duplication (page-specific breadcrumbs) |

No duplicate entity declarations found. The use of `@id` references is consistent and correct.

---

## 9. Canonical URL Consistency Audit

### Pattern Analysis

| Page | Canonical Type | Value |
|------|---------------|-------|
| Root layout | Relative | `/` |
| About | CMS-driven (default: `/about`) | Relative |
| Services listing | Relative | `/services` |
| Service detail | Relative | `/services/{slug}` |
| **Projects listing** | **Absolute** | `https://www.hindustanprojects.in/projects` |
| Project detail | Absolute | `https://www.hindustanprojects.in/projects/{slug}` |
| **Blogs listing** | **Absolute** | `https://www.hindustanprojects.in/blogs` |
| Blog detail | **Relative** | `/blogs/{slug}` |
| Contact | Relative | `/contact` |
| Why Us | Relative | `/why-us` |
| Careers | Relative | `/careers` |
| **Cost Estimator** | **Absolute** | `https://www.hindustanprojects.in/cost-estimator` |
| Privacy Policy | Relative | `/privacy-policy` |
| Terms | Relative | `/terms` |

### Assessment

Since `metadataBase` is set to `https://www.hindustanprojects.in` in the root layout, Next.js automatically resolves relative canonical paths to absolute URLs in the rendered HTML. This means **both approaches produce the same HTML output**. However:

1. **Inconsistency creates maintenance risk** — a developer changing `metadataBase` would only affect relative canonicals; hardcoded absolute URLs would remain pointing to the old domain.
2. **Best practice**: Use **relative paths** throughout and rely on `metadataBase` to resolve them. This is the Next.js-recommended pattern.
3. The cost-estimator layout is the most egregious inconsistency because it is the only layout-level canonical that uses absolute format while all other layouts use relative.

### Recommended Standard
> All `alternates.canonical` values should use **relative paths** (e.g., `/cost-estimator`). The `metadataBase` in `layout.tsx` resolves them to absolute URLs consistently.

---

## 10. OG Image Audit

### Images Referenced as OG/Social Images

| Reference | File Path | Exists? | Dimensions | Used By |
|-----------|-----------|---------|------------|---------|
| `/og-banner.jpg` | `public/og-banner.jpg` | ✅ **Yes** (180 KB) | Assumed 1200×630 | Root layout, About (fallback) |
| `/og-image.jpg` | `public/og-image.jpg` | 🔴 **NO** | — | Projects listing, Blogs listing |
| `/logo.jpg` | `public/logo.jpg` | ✅ **Yes** (8 KB) | Small/square | About OG fallback, Contact OG |
| `service.image` (Unsplash URL) | External CDN | Conditional | Variable | Service detail OG |
| `post.image` | CMS/External URL | Conditional | Variable | Blog detail OG |
| `p.ogImage \|\| p.image` | CMS/External URL | Conditional | Variable | Project detail OG |

### Critical Finding
**`/og-image.jpg` does NOT exist** in `public/`. The Projects and Blogs listing pages reference this file for their OG `images` metadata. When these pages are shared on social media (Facebook, Twitter/X, LinkedIn, WhatsApp, iMessage), the preview card will either:
- Show a broken image placeholder
- Fall back to the OG image from the referring link's `<link>` tag (browser behavior)
- Show no image at all

### Recommendations
1. **Option A (Quick Fix)**: Copy `og-banner.jpg` as `og-image.jpg` in `/public/`.
2. **Option B (Clean Fix)**: Update Projects and Blogs `page.tsx` metadata to reference `/og-banner.jpg` instead of `/og-image.jpg`.
3. **Option B is preferred** — avoids image duplication and aligns with the root layout's image naming convention.

---

## 11. Summary of All Issues

| # | Issue | Severity | File(s) | Action |
|---|-------|----------|---------|--------|
| 1 | `/og-image.jpg` does not exist in `/public/` | 🔴 HIGH | projects/page.tsx, blogs/page.tsx | Replace reference with `/og-banner.jpg` or create file |
| 2 | Cost Estimator canonical is absolute URL | 🔴 HIGH | cost-estimator/layout.tsx | Change to `/cost-estimator` |
| 3 | HBS routes in HiPRO sitemap | 🟠 MEDIUM | sitemap.ts | Move to separate HBS sitemap |
| 4 | About page canonical is CMS-controllable (drift risk) | 🟠 MEDIUM | about/page.tsx | Lock canonical in code |
| 5 | Why Us — no OG/Twitter/Schema | 🟠 MEDIUM | why-us/page.tsx | Add OG, Twitter, BreadcrumbList |
| 6 | Careers — no OG/Twitter/Schema | 🟠 MEDIUM | careers/page.tsx | Add OG, Twitter, BreadcrumbList, JobPosting |
| 7 | Privacy Policy / Terms — no OG/Twitter | 🟠 MEDIUM | privacy-policy/page.tsx, terms/page.tsx | Add minimal OG/Twitter |
| 8 | Services listing — no OG/Twitter | 🟠 MEDIUM | services/page.tsx | Add OG, Twitter blocks |
| 9 | Contact — no Twitter card | 🟡 LOW | contact/page.tsx | Add twitter block |
| 10 | Service detail OG — missing locale/siteName/type | 🟡 LOW | services/[slug]/page.tsx | Add missing OG fields |
| 11 | Blog detail canonical is relative (siblings use absolute) | 🟡 LOW | blogs/[slug]/page.tsx | Normalize to absolute |
| 12 | Blog detail OG/Twitter — null-safety on `post.image` | 🟡 LOW | blogs/[slug]/page.tsx | Guard `post.image ? [post.image] : undefined` |
| 13 | Homepage — no dedicated metadata export | 🟡 LOW | (site)/page.tsx | Add page-specific metadata |
| 14 | Why Us — title too long (76 chars) | 🟡 LOW | why-us/page.tsx | Shorten title |
| 15 | Cost Estimator FAQPage schema — verify SSR rendering | 🟡 LOW | cost-estimator/page.tsx | Inspect page source |
| 16 | Projects listing — no CollectionPage schema | 🟡 LOW | projects/page.tsx | Add CollectionPage + ItemList |
| 17 | Sitemap `lastModified: new Date()` for static routes | 🟡 LOW | sitemap.ts | Use fixed date or omit |
| 18 | Contact OG image — uses logo.jpg not og-banner.jpg | 🟡 LOW | contact/page.tsx | Update to og-banner.jpg |
| 19 | About OG fallback — uses logo.jpg not og-banner.jpg | 🟡 LOW | about/page.tsx | Update fallback image |
| 20 | Root layout description 181 chars (over 160 ideal) | 🟡 LOW | layout.tsx | Trim description |

---

## 12. Recommended Action Plan

### Phase 1 — Immediate Fixes (1–2 days) 🔴
These issues are breaking social sharing or introducing canonical confusion:

1. **Fix OG image references** in `projects/page.tsx` and `blogs/page.tsx`: change `og-image.jpg` → `og-banner.jpg`.
2. **Fix cost-estimator canonical**: change `"https://www.hindustanprojects.in/cost-estimator"` → `"/cost-estimator"` in `cost-estimator/layout.tsx`.
3. **Lock About page canonical** in code: replace `content?.canonicalUrl || "/about"` with the hardcoded `"/about"`.

### Phase 2 — High-Value SEO Gaps (1 week) 🟠
These add rich snippets, social sharing, and schema coverage:

4. **Add OG + Twitter blocks** to: Why Us, Careers, Privacy Policy, Terms, Services listing.
5. **Add BreadcrumbList schema** to: Why Us, Careers, Cost Estimator.
6. **Add `JobPosting` schema** to Careers page (rich result opportunity in Google Jobs).
7. **Add Twitter card** to Contact page.
8. **Fix Contact + About OG image**: change `/logo.jpg` → `/og-banner.jpg`.

### Phase 3 — Quality Improvements (2 weeks) 🟡

9. **Add page-specific metadata** to Homepage (`(site)/page.tsx`).
10. **Fix blog detail null-safety** for OG/Twitter `images` field.
11. **Add complete OG fields** to Service detail (locale, siteName, type).
12. **Normalize all canonicals** to relative paths across projects/listing and blogs/listing.
13. **Shorten Why Us title** to under 60 chars.
14. **Add `CollectionPage` + `ItemList`** schema to Projects listing.
15. **Verify Cost Estimator FAQPage** appears in SSR HTML (`curl -s https://www.hindustanprojects.in/cost-estimator | grep -i "faqpage"`).
16. **Revise sitemap**: remove or separate HBS routes; fix `lastModified` on static routes.

### Phase 4 — Strategic Enhancements (Ongoing)
17. Consider adding `hreflang: en` alternate tags for international search clarity.
18. Consider `areaServed` expansion in Organization schema (Jaipur, Jodhpur, Ajmer).
19. Add `ServiceType` to `Service` schema entries in `generateServiceSchema()`.
20. Develop a **meta description style guide** for CMS editors to prevent weak/generic descriptions from being published.

---

*Audit completed. All findings are based on static code analysis of the source files listed in the audit brief. Dynamic content (CMS data, DB records) may further affect runtime metadata — test with real CMS content using Google Search Console's URL Inspection tool and the Rich Results Test (https://search.google.com/test/rich-results).*
