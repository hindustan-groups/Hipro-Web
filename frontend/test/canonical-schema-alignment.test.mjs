/**
 * HiPRO Canonical & Schema URL Alignment Test Suite (TASK-P0-2B)
 *
 * Verifies that project URL normalization is authoritative, safe,
 * and 100% aligned across:
 * - HTML Metadata Canonical Tag
 * - OpenGraph URL
 * - Schema.org Article Structured Data (@id & url)
 * - Schema.org BreadcrumbList Structured Data
 * - XML Sitemap URL Generation
 * - Homepage & Archive Project Card Links
 */

import assert from "node:assert";
import {
  HIPRO_BASE_URL,
  normalizeProjectSlug,
  buildProjectCanonicalUrl,
  buildProjectHref,
  isValidProjectSlug,
} from "../lib/projectUrl.ts";

/**
 * Matches frontend/lib/projectSchema.ts implementation using shared projectUrl helpers
 */
function generateProjectBreadcrumbs(title, slug) {
  const cleanSlug = normalizeProjectSlug(slug);
  const itemUrl = cleanSlug
    ? `${HIPRO_BASE_URL}/projects/${cleanSlug}`
    : `${HIPRO_BASE_URL}/projects`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: HIPRO_BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${HIPRO_BASE_URL}/projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: itemUrl,
      },
    ],
  };
}

function generateProjectJsonLd(project, canonicalUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    author: {
      "@type": "Organization",
      "@id": `${HIPRO_BASE_URL}/#organization`,
      name: "Hindustan Projects",
      url: HIPRO_BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${HIPRO_BASE_URL}/#organization`,
      name: "Hindustan Projects",
      url: HIPRO_BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${HIPRO_BASE_URL}/logo.jpg`,
      },
    },
  };
}

console.log("==================================================================");
console.log("   HiPRO TASK-P0-2B: CANONICAL & SCHEMA ALIGNMENT TEST SUITE      ");
console.log("==================================================================\n");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`[PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${desc}`);
    console.error(`       Error: ${err.message}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────
// 1. Slug Normalization Unit Tests
// ─────────────────────────────────────────────────────────────
it("1. Normal valid slug is preserved exactly", () => {
  const input = "adani-gas-chamber-shinghpur";
  assert.strictEqual(normalizeProjectSlug(input), "adani-gas-chamber-shinghpur");
  assert.strictEqual(isValidProjectSlug(input), true);
});

it("2. Single and multiple leading slashes are stripped cleanly", () => {
  assert.strictEqual(normalizeProjectSlug("/adani-gas-chamber-shinghpur"), "adani-gas-chamber-shinghpur");
  assert.strictEqual(normalizeProjectSlug("////adani-gas-chamber-shinghpur"), "adani-gas-chamber-shinghpur");
});

it("3. Trailing slashes are stripped to conform with Next.js trailingSlash=false", () => {
  assert.strictEqual(normalizeProjectSlug("adani-gas-chamber-shinghpur/"), "adani-gas-chamber-shinghpur");
  assert.strictEqual(normalizeProjectSlug("adani-gas-chamber-shinghpur////"), "adani-gas-chamber-shinghpur");
});

it("4. Slashes at both leading and trailing ends are stripped simultaneously", () => {
  assert.strictEqual(normalizeProjectSlug("///adani-gas-chamber-shinghpur///"), "adani-gas-chamber-shinghpur");
});

it("5. Single 'projects/' prefix is stripped", () => {
  assert.strictEqual(normalizeProjectSlug("projects/adani-gas-chamber-shinghpur"), "adani-gas-chamber-shinghpur");
  assert.strictEqual(normalizeProjectSlug("/projects/adani-gas-chamber-shinghpur"), "adani-gas-chamber-shinghpur");
});

it("6. Duplicated and triplicated 'projects/' prefixes are stripped completely", () => {
  assert.strictEqual(normalizeProjectSlug("projects/projects/adani-gas-chamber-shinghpur"), "adani-gas-chamber-shinghpur");
  assert.strictEqual(normalizeProjectSlug("/projects/projects/projects/adani-gas-chamber-shinghpur/"), "adani-gas-chamber-shinghpur");
});

it("7. Mixed-case duplicate 'projects/' prefixes are stripped case-insensitively", () => {
  assert.strictEqual(normalizeProjectSlug("/PROJECTS/projects/Projects/adani-gas-chamber-shinghpur/"), "adani-gas-chamber-shinghpur");
});

it("8. Surrounding and internal leading/trailing whitespace is trimmed", () => {
  assert.strictEqual(normalizeProjectSlug("   /projects/adani-gas-chamber-shinghpur   "), "adani-gas-chamber-shinghpur");
});

it("9. Empty, whitespace-only, null, and undefined return empty string", () => {
  assert.strictEqual(normalizeProjectSlug(""), "");
  assert.strictEqual(normalizeProjectSlug("   "), "");
  assert.strictEqual(normalizeProjectSlug(null), "");
  assert.strictEqual(normalizeProjectSlug(undefined), "");
  assert.strictEqual(normalizeProjectSlug(123), "");
  assert.strictEqual(isValidProjectSlug(""), false);
  assert.strictEqual(isValidProjectSlug(null), false);
});

it("10. Naked prefix strings ('/', '/projects', '/projects/') return empty string safely", () => {
  assert.strictEqual(normalizeProjectSlug("/"), "");
  assert.strictEqual(normalizeProjectSlug("///"), "");
  assert.strictEqual(normalizeProjectSlug("/projects"), "");
  assert.strictEqual(normalizeProjectSlug("/projects/"), "");
  assert.strictEqual(normalizeProjectSlug("/projects/projects/"), "");
});

it("11. Path traversal attempts are rejected safely (return empty string)", () => {
  assert.strictEqual(normalizeProjectSlug("../etc/passwd"), "");
  assert.strictEqual(normalizeProjectSlug("../../projects/foo"), "");
  assert.strictEqual(normalizeProjectSlug("foo/../bar"), "");
});

it("12. Malformed characters (HTML, script tags, quotes, spaces) are rejected safely", () => {
  assert.strictEqual(normalizeProjectSlug("<script>alert(1)</script>"), "");
  assert.strictEqual(normalizeProjectSlug("foo bar"), "");
  assert.strictEqual(normalizeProjectSlug('project"name'), "");
  assert.strictEqual(normalizeProjectSlug("project'name"), "");
  assert.strictEqual(normalizeProjectSlug("project`name"), "");
});

// ─────────────────────────────────────────────────────────────
// 2. Canonical URL Construction Tests
// ─────────────────────────────────────────────────────────────
it("13. buildProjectCanonicalUrl generates authoritative absolute canonical URL", () => {
  const url = buildProjectCanonicalUrl("adani-gas-chamber-shinghpur");
  assert.strictEqual(url, "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur");
});

it("14. buildProjectCanonicalUrl normalizes dirty inputs and prevents double slashes", () => {
  const url = buildProjectCanonicalUrl("///projects///projects///adani-gas-chamber-shinghpur///");
  assert.strictEqual(url, "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur");
  assert(!url.includes("//projects/"), "Must not contain //projects/");
  assert(!url.includes("/projects/projects/"), "Must not contain /projects/projects/");
});

it("15. buildProjectCanonicalUrl returns null for invalid inputs to prevent bare '/projects/'", () => {
  assert.strictEqual(buildProjectCanonicalUrl(""), null);
  assert.strictEqual(buildProjectCanonicalUrl("/projects/"), null);
  assert.strictEqual(buildProjectCanonicalUrl(null), null);
  assert.strictEqual(buildProjectCanonicalUrl(undefined), null);
  assert.strictEqual(buildProjectCanonicalUrl("../passwd"), null);
});

// ─────────────────────────────────────────────────────────────
// 3. Schema.org Structured Data Alignment Tests
// ─────────────────────────────────────────────────────────────
it("16. Schema.org Article URL and @id align 100% with HTML canonical URL", () => {
  const mockProject = {
    id: "proj-1",
    title: "Adani Gas Chamber",
    slug: "/projects/projects/adani-gas-chamber-shinghpur/",
    category: "Industrial Construction",
    description: "Heavy industrial structure execution.",
  };

  const canonicalUrl = buildProjectCanonicalUrl(mockProject.slug);
  const articleSchema = generateProjectJsonLd(mockProject, canonicalUrl);

  const expectedCanonical = "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur";
  assert.strictEqual(canonicalUrl, expectedCanonical);
  assert.strictEqual(articleSchema.url, expectedCanonical);
  assert.strictEqual(articleSchema.mainEntityOfPage["@id"], expectedCanonical);
});

it("17. Schema.org BreadcrumbList item URL aligns 100% with HTML canonical URL", () => {
  const dirtySlug = "///projects///adani-gas-chamber-shinghpur///";
  const breadcrumbs = generateProjectBreadcrumbs("Adani Gas Chamber", dirtySlug);

  const expectedItem = "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur";
  assert.strictEqual(breadcrumbs.itemListElement.length, 3);
  assert.strictEqual(breadcrumbs.itemListElement[0].item, "https://www.hindustanprojects.in");
  assert.strictEqual(breadcrumbs.itemListElement[1].item, "https://www.hindustanprojects.in/projects");
  assert.strictEqual(breadcrumbs.itemListElement[2].item, expectedItem);
});

// ─────────────────────────────────────────────────────────────
// 4. Sitemap Generation Simulation Tests
// ─────────────────────────────────────────────────────────────
it("18. Sitemap generation safely normalizes clean projects and skips invalid entries", () => {
  const mockProjects = [
    { slug: "adani-gas-chamber-shinghpur", publishStatus: "published", noIndex: false },
    { slug: "/expansion-of-weaving-department-airjet-ajay-syntex-pvt-ltd/", publishStatus: "published", noIndex: false },
    { slug: "projects/projects/valid-project-3", publishStatus: "published", noIndex: false },
    { slug: "", publishStatus: "published", noIndex: false }, // empty
    { slug: "/projects/", publishStatus: "published", noIndex: false }, // bare prefix
    { slug: "draft-project", publishStatus: "draft", noIndex: false }, // draft
    { slug: "noindex-project", publishStatus: "published", noIndex: true }, // noIndex
  ];

  const seenUrls = new Set();
  const sitemapUrls = mockProjects
    .filter((p) => p.publishStatus === "published" && !p.noIndex && p.slug)
    .map((p) => {
      const url = buildProjectCanonicalUrl(p.slug);
      if (!url) return null;
      if (seenUrls.has(url)) return null;
      seenUrls.add(url);
      return url;
    })
    .filter(Boolean);

  assert.strictEqual(sitemapUrls.length, 3);
  assert.strictEqual(sitemapUrls[0], "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur");
  assert.strictEqual(sitemapUrls[1], "https://www.hindustanprojects.in/projects/expansion-of-weaving-department-airjet-ajay-syntex-pvt-ltd");
  assert.strictEqual(sitemapUrls[2], "https://www.hindustanprojects.in/projects/valid-project-3");
});

// ─────────────────────────────────────────────────────────────
// 5. Card Navigation Link Construction Tests
// ─────────────────────────────────────────────────────────────
it("19. buildProjectHref constructs clean internal card links", () => {
  assert.strictEqual(buildProjectHref("adani-gas-chamber-shinghpur"), "/projects/adani-gas-chamber-shinghpur");
  assert.strictEqual(buildProjectHref("/projects/adani-gas-chamber-shinghpur/"), "/projects/adani-gas-chamber-shinghpur");
});

it("20. buildProjectHref falls back to project ID when slug is missing", () => {
  assert.strictEqual(buildProjectHref("", "cuid-12345"), "/projects/cuid-12345");
  assert.strictEqual(buildProjectHref(null, "cuid-12345"), "/projects/cuid-12345");
  assert.strictEqual(buildProjectHref(undefined, "cuid-12345"), "/projects/cuid-12345");
});

it("21. buildProjectHref returns null when both slug and ID are missing or invalid", () => {
  assert.strictEqual(buildProjectHref("", ""), null);
  assert.strictEqual(buildProjectHref(null, null), null);
  assert.strictEqual(buildProjectHref(undefined, undefined), null);
  assert.strictEqual(buildProjectHref("/projects/", ""), null);
});

// ─────────────────────────────────────────────────────────────
// 6. Preservation of Verified Canonical Projects
// ─────────────────────────────────────────────────────────────
it("22. Both verified portfolio showcase slugs remain exact matches", () => {
  const p1 = "adani-gas-chamber-shinghpur";
  const p2 = "expansion-of-weaving-department-airjet-ajay-syntex-pvt-ltd";

  assert.strictEqual(normalizeProjectSlug(p1), p1);
  assert.strictEqual(normalizeProjectSlug(p2), p2);
  assert.strictEqual(buildProjectCanonicalUrl(p1), `https://www.hindustanprojects.in/projects/${p1}`);
  assert.strictEqual(buildProjectCanonicalUrl(p2), `https://www.hindustanprojects.in/projects/${p2}`);
});

console.log("\n------------------------------------------------------------------");
console.log(`TOTAL ALIGNMENT TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
