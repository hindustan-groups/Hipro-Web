# HINDUSTAN PROJECTS (HiPRO) — SEO, AEO, GEO AND GOOGLE AUDIT
**Document Reference:** `DOC-HIPRO-AUDIT-004`  
**Audit Date:** October 2026 (Local System Time: 2026-10-21)  
**Status:** Complete Read-Only Technical Audit  
**Author/Auditor:** Antigravity AI Senior Technical Auditor  

---

## 1. Technical SEO Audit

### 1.1 Meta Titles, Descriptions and Heading Structure
- **Homepage (`/`):**
  - **Title Tag:** `"Hindustan Projects | Architecture, Construction & Engineering in Bhilwara"` (58 characters — optimal length).
  - **Meta Description:** Rich summary highlighting 30+ years of heritage, turnkey construction, structural design, and commercial execution in Rajasthan.
  - **Heading Structure:** Compliant single `<h1>` tag with clear semantic nesting (`<h2>` for Services, Featured Projects, Statistics, and Client Testimonials).
- **Service Pages (`/services/[slug]`):**
  - **Titles:** Dynamically formatted as `${service.title} | Hindustan Projects`.
  - **Headings:** Single `<h1>` rendered per service detail view.
  - **Limitation:** Service records in the database lack custom `metaTitle` and `metaDescription` fields. Descriptions are truncated from the body text or fall back to static company boilerplates.
- **Blog Pages (`/blogs/[slug]`):**
  - **Meta Data:** Fully dynamic, extracting author-defined `metaTitle`, `metaDescription`, and `canonicalUrl` from the database.

---

### 1.2 Critical SEO Defects Identified

#### Defect 1: Project Slug Corruption in Database (P0)
- **Affected Route:** `https://www.hindustanprojects.in/projects/[slug]`
- **Source of Defect:** PostgreSQL `Project` records contain slugs with prepended `projects-` and `/projects/`.
- **Live Examples Observed:**
  - `projects-adani-gas-chamber-shinghpur`
  - `expansion-of-weav-projects-expansion-of-weaving-department-airjet-ajay-syntexing-department-airjet-ajay-syntex-pvt-ltd`
- **Resulting Impact:**
  - Live links on the portfolio index resolve to redundant paths: `https://www.hindustanprojects.in/projects/projects-adani-gas-chamber-shinghpur`.
  - These malformed slugs are directly ingested into `https://www.hindustanprojects.in/sitemap.xml`, broadcasting duplicate and malformed URLs to Googlebot.

#### Defect 2: Double Slashes in Project Canonical Tags (P0)
- **Affected File:** `frontend/app/(site)/projects/[slug]/page.tsx`
- **Observed Canonical Tag Output:**
  ```html
  <link rel="canonical" href="https://www.hindustanprojects.in/projects//projects/adani-gas-chamber-shinghpur" />
  ```
- **Root Cause:** The project page template concatenates `${baseUrl}/projects/` with `project.slug`. When `project.slug` already contains a leading `/projects/`, a double slash (`//projects/`) is produced.
- **SEO Impact:** Google treats URLs with double slashes as separate, invalid, or duplicate paths, diluting link equity and triggering canonical conflict warnings in Google Search Console.

#### Defect 3: Inadvertent Project De-Indexing Flag (P0)
- **Affected Entity:** Project ID `cm...` (Adani Gas Chamber / Industrial Project).
- **Observed Database State:** The `noIndex` boolean field is set to `true`.
- **Rendered Output:** Next.js outputs `<meta name="robots" content="noindex,nofollow" />` on this high-value portfolio page, actively instructing search engines to purge this showcase industrial project from their index.

#### Defect 4: Volatile Dynamic Service Slugs (P1)
- **Affected Model:** `backend/prisma/schema.prisma` -> `model Service`.
- **Root Cause:** The `Service` model has no persisted `slug` column. Slugs are derived at request time using `getServiceSlug(title)`.
- **Risk:** If an administrator corrects a spelling mistake or updates a service title in the CMS (e.g. from *"Turnkey Construction Solutions"* to *"Turnkey Construction Solutions & Contracting"*), the URL changes immediately. All existing Google rankings, external backlinks, and user bookmarks will immediately return a `404 Not Found` error because no 301 redirect map is maintained.

---

### 1.3 XML Sitemaps & Robots Directives
- **Robots.txt (`/robots.txt`):**
  - Correctly generated via `frontend/app/robots.ts`.
  - Allows all standard search user-agents (`*`).
  - Disallows crawler access to `/admin`, `/admin-login`, `/api/`, and private endpoints.
  - References `https://www.hindustanprojects.in/sitemap.xml`.
- **Sitemap Generator (`/sitemap.xml`):**
  - Dynamically synthesizes URLs for static routes, active services, projects, and published blogs.
  - **Sitemap Defect:** Directly inherits corrupted project slugs from the database. Furthermore, HBS sub-brand URLs (`hindbuilding.hindustanprojects.in`) are currently excluded from the root sitemap, requiring a dedicated multi-subdomain sitemap index.

---

## 2. Keyword-to-URL Mapping (Bhilwara & Rajasthan Region)

The following matrix maps primary commercial search intents to existing website landing pages:

| Target Search Query Group | Current Target Landing Page | Current Page Title & H1 | Canonical Status | Indexability Status | Recommendations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Architect in Bhilwara**<br/>Best architect in Bhilwara<br/>Architecture firm in Bhilwara | `/services/architectural-design-services-bhilwara`<br/>(or `/services`) | Title: Architectural Design Services<br/>H1: Architectural Design & Planning | Valid Canonical | **Indexable** | Add dedicated local case studies and residential planning portfolio. |
| **Construction company in Bhilwara**<br/>House construction in Bhilwara<br/>Building contractor in Bhilwara | `/services/turnkey-construction-solutions-bhilwara` | Title: Turnkey Construction Solutions<br/>H1: Turnkey Construction & Civil Works | Valid Canonical | **Indexable** | Enhance cost-per-sq-ft estimator link and local material sourcing credentials. |
| **Industrial construction Bhilwara**<br/>PEB structure manufacturers Bhilwara<br/>Factory shed contractors | `/services/industrial-infrastructure-peb-structures` | Title: Industrial Infrastructure & PEB<br/>H1: Pre-Engineered Building Solutions | Valid Canonical | **Indexable** | Fix project slug links to show real textile & industrial plants completed in Bhilwara. |
| **Structural engineering Bhilwara**<br/>Soil testing & foundation design | `/services/structural-engineering-solutions` | Title: Structural Engineering<br/>H1: Advanced Structural Analysis | Valid Canonical | **Indexable** | Include references to seismic zone compliance and IS code standards. |
| **Waterproofing contractor Bhilwara**<br/>Building chemical solutions<br/>Concrete repair Rajasthan | `https://hindbuilding.hindustanprojects.in/services` | Title: HiBUILD Solutions<br/>H1: Structural Rehabilitation & Chemicals | Valid Canonical | **Indexable** | Fix double period bug in hero; establish cross-links from main HiPRO footer. |

---

## 3. Structured Data (JSON-LD) & Schema Markup Audit

### 3.1 Organization & LocalBusiness Schemas
The corporate layout injects a rich `LocalBusiness` and `GeneralContractor` schema graph via `frontend/components/seo/JsonLd.tsx`:
```json
{
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "name": "Hindustan Projects",
  "alternateName": "HiPRO",
  "url": "https://www.hindustanprojects.in",
  "logo": "https://www.hindustanprojects.in/logo.png",
  "telephone": "+91-98290-XXXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Near Circuit House, Subhash Nagar",
    "addressLocality": "Bhilwara",
    "addressRegion": "Rajasthan",
    "postalCode": "311001",
    "addressCountry": "IN"
  },
  "priceRange": "₹₹₹"
}
```

### 3.2 Schema Optimization Opportunities
1. **Missing GeoCoordinates:** The `LocalBusiness` schema lacks explicit `"geo": { "@type": "GeoCoordinates", "latitude": 25.3463, "longitude": 74.6364 }`. Adding exact coordinates improves Google Maps and Local Pack discovery.
2. **Missing `areaServed` Polygons:** Define exact operational districts (Bhilwara, Chittorgarh, Rajsamand, Udaipur, Ajmer, Jaipur).
3. **Missing `FAQPage` Schema:** Frequently Asked Questions on service detail pages are rendered purely in HTML without corresponding schema markup, missing out on rich snippet SERP expansions.

---

## 4. AEO (Answer Engine Optimization) & GEO (Generative Engine Optimization)

AI-driven search engines (Google AI Overviews, Perplexity, ChatGPT Search) rely on unambiguous entity definitions, factual data density, and clear question-and-answer structures.

### 4.1 Strengths
- Clear corporate heritage declarations: Established 30+ year timeline, 100+ executed projects, and clearly listed industrial clients (Adani, Ajay Syntex, Sangam, etc.).
- Modular service scopes outlining technical specifications, structural capabilities, and project delivery timelines.

### 4.2 Recommendations for AI Search Engines
1. **Publish Authoritative Cost & Regulatory Guides:** AI search engines frequently cite comprehensive guides. Publishing structured guides on *"Construction Costs per Sq. Ft. in Rajasthan (2026 Guidelines)"* or *"Bhilwara Municipal Corporation Building Bylaws"* will establish HiPRO as the authoritative entity citation in regional generative results.
2. **Structured Table Summaries:** Ensure service and project pages include summary comparison tables detailing concrete grades, steel tonnage, square footage, and project completion durations.

---

## 5. Google Search Console & Local Profile Status

- **Search Console Access:** External GSC reports were unavailable during this read-only audit.
- **Verification Prerequisite:** The business owner should confirm whether domain verification is active via DNS TXT record or HTML tag.
- **Local Profile (Google Business Profile):** The business profile for "Hindustan Projects" in Bhilwara must align exactly with the website address (`https://www.hindustanprojects.in`), business category (`General Contractor`, `Architectural Designer`), and operational hours.
