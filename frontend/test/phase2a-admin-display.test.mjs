import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DRAWER_PATH = path.resolve('components/admin/empanelment/ApplicationReviewDrawer.tsx');
const DIRECTORY_PATH = path.resolve('app/admin/empanelment/directory/page.tsx');

test('Phase 2A — ApplicationReviewDrawer field mappings and interface', () => {
  assert.ok(fs.existsSync(DRAWER_PATH), 'ApplicationReviewDrawer.tsx must exist');
  const content = fs.readFileSync(DRAWER_PATH, 'utf8');

  // 1. Verify VendorApplicationDetail interface includes canonical Prisma columns
  assert.match(content, /accountNumber\?: string \| null;/, 'VendorApplicationDetail must define accountNumber');
  assert.match(content, /ifscCode\?: string \| null;/, 'VendorApplicationDetail must define ifscCode');
  assert.match(content, /establishmentYear\?: string \| null;/, 'VendorApplicationDetail must define establishmentYear');
  assert.match(content, /teamSize\?: string \| null;/, 'VendorApplicationDetail must define teamSize');

  // 2. Verify Bank Account Number reads from canonical accountNumber with fallback
  assert.match(
    content,
    /application\.accountNumber \|\| application\.bankAccountNumber \|\| ["']—["']/,
    'Account Number must read from application.accountNumber with fallback'
  );

  // 3. Verify IFSC Code reads from canonical ifscCode with fallback
  assert.match(
    content,
    /application\.ifscCode \|\| application\.bankIfsc \|\| ["']—["']/,
    'IFSC Code must read from application.ifscCode with fallback'
  );

  // 4. Verify Year of Establishment reads strictly from canonical establishmentYear with fallback "—"
  assert.match(
    content,
    /application\.establishmentYear \|\| ["']—["']/,
    'Year of Establishment must read from application.establishmentYear with "—" fallback'
  );

  // 4b. Explicitly assert yearsInBusiness is NOT used as fallback for Year of Establishment
  assert.doesNotMatch(
    content,
    /application\.establishmentYear\s*\|\|\s*\(?application\.yearsInBusiness/,
    'yearsInBusiness duration must never be used as a fallback for Year of Establishment'
  );

  // 5. Verify Workforce Capacity reads from canonical teamSize with fallback
  assert.match(
    content,
    /application\.teamSize \|\| \(application\.workforceCount \? `\$\{application\.workforceCount\} Personnel` : ["']—["']\)/,
    'Workforce Capacity must read from application.teamSize with fallback'
  );

  // 6. Verify responsive grid classes
  assert.match(
    content,
    /grid grid-cols-2 sm:grid-cols-3 gap-3/,
    'Tax & Banking Registry must use responsive grid-cols-2 sm:grid-cols-3'
  );
});

test('Phase 2A — Vendor Directory Tier filter values match database schema', () => {
  assert.ok(fs.existsSync(DIRECTORY_PATH), 'directory/page.tsx must exist');
  const content = fs.readFileSync(DIRECTORY_PATH, 'utf8');

  // 1. Verify CLASS_A, CLASS_B, CLASS_C options exist
  assert.match(content, /<option value="CLASS_A">Tier A \(&gt; ₹2 Crore\)<\/option>/, 'CLASS_A option must exist with Tier A label');
  assert.match(content, /<option value="CLASS_B">Tier B \(₹50 Lakh – ₹2 Cr\)<\/option>/, 'CLASS_B option must exist with Tier B label');
  assert.match(content, /<option value="CLASS_C">Tier C \(₹10 Lakh – ₹50L\)<\/option>/, 'CLASS_C option must exist with Tier C label');

  // 2. Verify legacy TIER_A, TIER_B, TIER_C, TIER_D are completely removed
  assert.doesNotMatch(content, /value="TIER_A"/, 'TIER_A must not be used as select option value');
  assert.doesNotMatch(content, /value="TIER_B"/, 'TIER_B must not be used as select option value');
  assert.doesNotMatch(content, /value="TIER_C"/, 'TIER_C must not be used as select option value');
  assert.doesNotMatch(content, /value="TIER_D"/, 'TIER_D must not be used as select option value');

  // 3. Verify ALL option preserves all-records behavior
  assert.match(content, /<option value="ALL">All Tiers/, 'ALL option must exist');
  assert.match(
    content,
    /if \(tierFilter !== "ALL"\) params\.append\("tier", tierFilter\);/,
    'tierFilter must only be appended when not equal to ALL'
  );
});
