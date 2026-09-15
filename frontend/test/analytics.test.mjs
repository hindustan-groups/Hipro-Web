/**
 * Focused regression test suite for GA4 conversion tracking & zero-PII protection.
 * Run directly with Node: node frontend/test/analytics.test.mjs
 */

import assert from "node:assert";

// Import modules directly
import {
  ALLOWED_EVENT_PARAMS,
  PROHIBITED_KEYS,
  sanitizeEventParams,
  trackEvent,
} from "../lib/analytics.ts";

console.log("==========================================================");
console.log("       GA4 CONVERSIONS & PII REGRESSION TEST SUITE        ");
console.log("==========================================================\n");

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

// -------------------------------------------------------------
// 1. Event Definitions and Allowlist Coverage
// -------------------------------------------------------------
console.log("--- 1. Event Names & Parameter Allowlists ---");

const EXPECTED_EVENTS = [
  "generate_lead",
  "submit_application",
  "contact_whatsapp_click",
  "contact_phone_click",
  "contact_email_click",
  "calculate_cost_estimate",
];

it("All 6 required event names are defined in ALLOWED_EVENT_PARAMS", () => {
  for (const ev of EXPECTED_EVENTS) {
    assert(ALLOWED_EVENT_PARAMS[ev] instanceof Set, `Event "${ev}" must be present in allowlist`);
  }
  assert.strictEqual(Object.keys(ALLOWED_EVENT_PARAMS).length, 6);
});

it("generate_lead allowlist permits only [form_id, service_category, state, district]", () => {
  const allowed = ALLOWED_EVENT_PARAMS["generate_lead"];
  assert.deepStrictEqual(
    Array.from(allowed).sort(),
    ["district", "form_id", "service_category", "state"].sort()
  );
});

it("submit_application allowlist permits only [job_role]", () => {
  const allowed = ALLOWED_EVENT_PARAMS["submit_application"];
  assert.deepStrictEqual(Array.from(allowed), ["job_role"]);
});

it("contact click events permit only [location]", () => {
  assert.deepStrictEqual(Array.from(ALLOWED_EVENT_PARAMS["contact_whatsapp_click"]), ["location"]);
  assert.deepStrictEqual(Array.from(ALLOWED_EVENT_PARAMS["contact_phone_click"]), ["location"]);
  assert.deepStrictEqual(Array.from(ALLOWED_EVENT_PARAMS["contact_email_click"]), ["location"]);
});

it("calculate_cost_estimate allowlist permits only [project_type, construction_tier]", () => {
  const allowed = ALLOWED_EVENT_PARAMS["calculate_cost_estimate"];
  assert.deepStrictEqual(
    Array.from(allowed).sort(),
    ["construction_tier", "project_type"].sort()
  );
});

// -------------------------------------------------------------
// 2. Strict PII Protection & Parameter Sanitization
// -------------------------------------------------------------
console.log("\n--- 2. PII Stripping & Allowlist Enforcement ---");

it("Strips all PII keys even if passed in event payload", () => {
  const dirtyPayload = {
    form_id: "contact_page",
    service_category: "Civil Construction",
    name: "Mohan Sharma",
    full_name: "Mohan Sharma",
    email: "mohan@example.com",
    phone: "+91 9876543210",
    phone_number: "9876543210",
    message: "Need 2500 sqft construction in Jaipur",
    resume: "https://example.com/cv.pdf",
    cv: "https://example.com/resume.pdf",
    address: "123 MG Road, Bhilwara",
    street: "MG Road",
  };

  const clean = sanitizeEventParams("generate_lead", dirtyPayload);

  assert.strictEqual(clean.form_id, "contact_page");
  assert.strictEqual(clean.service_category, "Civil Construction");
  assert.strictEqual(clean.name, undefined);
  assert.strictEqual(clean.full_name, undefined);
  assert.strictEqual(clean.email, undefined);
  assert.strictEqual(clean.phone, undefined);
  assert.strictEqual(clean.phone_number, undefined);
  assert.strictEqual(clean.message, undefined);
  assert.strictEqual(clean.resume, undefined);
  assert.strictEqual(clean.cv, undefined);
  assert.strictEqual(clean.address, undefined);
  assert.strictEqual(clean.street, undefined);
});

it("Strips job application personal data, retaining only job_role", () => {
  const applicationPayload = {
    name: "Anita Verma",
    email: "anita@domain.com",
    phone: "9876500000",
    experience: "5 Years",
    cvUrl: "https://res.cloudinary.com/cv123.pdf",
    job_role: "Senior Civil Engineer",
  };

  const clean = sanitizeEventParams("submit_application", applicationPayload);

  assert.deepStrictEqual(clean, { job_role: "Senior Civil Engineer" });
});

it("Strips accidental email address passed inside allowed parameter value", () => {
  const leakedEmailInParam = {
    form_id: "contact_page",
    service_category: "leak@hindustanprojects.in",
  };

  const clean = sanitizeEventParams("generate_lead", leakedEmailInParam);

  assert.strictEqual(clean.form_id, "contact_page");
  assert.strictEqual(clean.service_category, undefined, "Email in value must be scrubbed");
});

it("Strips accidental phone number passed inside allowed parameter value", () => {
  const leakedPhoneInParam = {
    location: "+91 9876543210",
  };

  const clean = sanitizeEventParams("contact_phone_click", leakedPhoneInParam);

  assert.strictEqual(clean.location, undefined, "Phone number in value must be scrubbed");
});

it("Strips undefined, null, and empty string values", () => {
  const emptyParams = {
    form_id: "consultation_popup",
    state: "",
    district: undefined,
  };

  const clean = sanitizeEventParams("generate_lead", emptyParams);

  assert.deepStrictEqual(clean, { form_id: "consultation_popup" });
});

// -------------------------------------------------------------
// 3. Dispatch Logic & Safe No-Op
// -------------------------------------------------------------
console.log("\n--- 3. trackEvent Safe Execution & Dispatch ---");

it("Cleanly no-ops when measurement ID is unset", () => {
  delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  let gtagCalled = false;
  global.window = {
    gtag: () => { gtagCalled = true; },
  };

  trackEvent("calculate_cost_estimate", {
    project_type: "Residential Construction",
    construction_tier: "Premium",
  });

  assert.strictEqual(gtagCalled, false, "gtag should not be called when measurement ID is unset");
});

it("Cleanly no-ops when window.gtag is not a function", () => {
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-Q6BWT0JES5";
  global.window = {};

  assert.doesNotThrow(() => {
    trackEvent("calculate_cost_estimate", {
      project_type: "Residential Construction",
      construction_tier: "Royale",
    });
  });
});

it("Dispatches properly structured and sanitized payload when GA4 is initialized", () => {
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-Q6BWT0JES5";

  const recordedCalls = [];
  global.window = {
    gtag: (cmd, action, params) => {
      recordedCalls.push({ cmd, action, params });
    },
  };

  // 1. generate_lead contact_page
  trackEvent("generate_lead", {
    form_id: "contact_page",
    service_category: "Turnkey Construction",
    name: "John Leaker",
  });

  // 2. generate_lead consultation_popup
  trackEvent("generate_lead", {
    form_id: "consultation_popup",
    state: "Rajasthan",
    district: "Bhilwara",
    phone: "9999999999",
  });

  // 3. generate_lead estimator_lead
  trackEvent("generate_lead", {
    form_id: "estimator_lead",
    phone: "9999999999",
  });

  // 4. submit_application
  trackEvent("submit_application", {
    job_role: "Project Manager",
    cv: "https://cv.pdf",
  });

  // 5. contact_whatsapp_click
  trackEvent("contact_whatsapp_click", {
    location: "mobile_sticky_bar",
  });

  // 6. contact_phone_click
  trackEvent("contact_phone_click", {
    location: "footer",
  });

  // 7. contact_email_click
  trackEvent("contact_email_click", {
    location: "cta_section",
  });

  // 8. calculate_cost_estimate
  trackEvent("calculate_cost_estimate", {
    project_type: "Residential Construction",
    construction_tier: "Classic",
  });

  assert.strictEqual(recordedCalls.length, 8);

  assert.deepStrictEqual(recordedCalls[0], {
    cmd: "event",
    action: "generate_lead",
    params: { form_id: "contact_page", service_category: "Turnkey Construction" },
  });

  assert.deepStrictEqual(recordedCalls[1], {
    cmd: "event",
    action: "generate_lead",
    params: { form_id: "consultation_popup", state: "Rajasthan", district: "Bhilwara" },
  });

  assert.deepStrictEqual(recordedCalls[2], {
    cmd: "event",
    action: "generate_lead",
    params: { form_id: "estimator_lead" },
  });

  assert.deepStrictEqual(recordedCalls[3], {
    cmd: "event",
    action: "submit_application",
    params: { job_role: "Project Manager" },
  });

  assert.deepStrictEqual(recordedCalls[4], {
    cmd: "event",
    action: "contact_whatsapp_click",
    params: { location: "mobile_sticky_bar" },
  });

  assert.deepStrictEqual(recordedCalls[5], {
    cmd: "event",
    action: "contact_phone_click",
    params: { location: "footer" },
  });

  assert.deepStrictEqual(recordedCalls[6], {
    cmd: "event",
    action: "contact_email_click",
    params: { location: "cta_section" },
  });

  assert.deepStrictEqual(recordedCalls[7], {
    cmd: "event",
    action: "calculate_cost_estimate",
    params: { project_type: "Residential Construction", construction_tier: "Classic" },
  });
});

console.log("\n==========================================================");
console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
console.log("==========================================================");

if (failed > 0) {
  process.exit(1);
}
