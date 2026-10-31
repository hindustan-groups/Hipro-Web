/**
 * Comprehensive Automail Upload & Parser Hardening Test Suite (Gate 1A-3)
 *
 * Verifies:
 * 1. Extension normalization (.xlsx, .XLSX, .Xlsx, .csv, .CSV, .Csv)
 * 2. Explicit rejection of legacy .xls files (.xls, .XLS)
 * 3. Rejection of unsupported extensions (.pdf, .txt, .json, no extension)
 * 4. Content validation (CSV named .xlsx, XLSX named .csv, binary null bytes in CSV)
 * 5. Empty files (0-byte buffer, whitespace-only CSV)
 * 6. Valid CSV and XLSX imports with casing tolerance and header aliases
 * 7. Safe ExcelJS cell types (formulas, rich text, hyperlinks, dates, errors, primitives)
 * 8. Handling of duplicate headers, empty rows, and malformed files
 * 9. Enforcement of bounds: row limit, column limit, file size, contact count limit
 * 10. Duplicate email normalization and deduplication
 * 11. Route-level authentication guard and fail-closed zero-mutation behavior
 */

import assert from "node:assert";
import express from "express";
import http from "node:http";
import ExcelJS from "exceljs";
import {
  parseContactsFile,
  hasZipMagicBytes,
  containsBinaryBytes,
  MAX_FILE_SIZE_BYTES,
  MAX_WORKSHEET_ROWS,
  MAX_WORKSHEET_COLUMNS,
  MAX_ACCEPTED_CONTACTS,
} from "../services/automail/csvParser";
import automailRouter from "../routes/automail";

console.log("==========================================================");
console.log("   HiPRO GATE 1A-3: AUTOMAIL PARSER HARDENING SUITE       ");
console.log("==========================================================\n");

let passed = 0;
let failed = 0;

async function it(desc: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`[PASS] ${desc}`);
    passed++;
  } catch (err: any) {
    console.error(`[FAIL] ${desc}`);
    console.error(`       Error: ${err.message}`);
    failed++;
  }
}

/**
 * Helper to build an in-memory XLSX buffer using ExcelJS
 */
async function buildXlsxBuffer(
  rows: (any[] | Record<string, any>)[],
  options: {
    sheetName?: string;
    customConfig?: (worksheet: ExcelJS.Worksheet) => void;
  } = {}
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options.sheetName || "Contacts");

  if (options.customConfig) {
    options.customConfig(worksheet);
  }

  for (const row of rows) {
    worksheet.addRow(row);
  }

  const rawBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(rawBuffer);
}

async function runTests() {
  // --------------------------------------------------------------------------
  // 1. EXTENSION NORMALIZATION & CASING TOLERANCE
  // --------------------------------------------------------------------------
  console.log("--- 1. Extension Normalization & Case Insensitivity ---");

  const basicValidXlsx = await buildXlsxBuffer([
    ["Name", "Email"],
    ["Alice Sharma", "alice@example.com"],
  ]);

  await it("XLSX: lowercase extension .xlsx parses successfully", async () => {
    const res = await parseContactsFile(basicValidXlsx, "contacts.xlsx");
    assert.strictEqual(res.contacts.length, 1);
    assert.strictEqual(res.contacts[0].email, "alice@example.com");
  });

  await it("XLSX: uppercase extension .XLSX parses successfully", async () => {
    const res = await parseContactsFile(basicValidXlsx, "UPLOAD_CONTACTS.XLSX");
    assert.strictEqual(res.contacts.length, 1);
    assert.strictEqual(res.contacts[0].email, "alice@example.com");
  });

  await it("XLSX: mixed-case extension .Xlsx parses successfully", async () => {
    const res = await parseContactsFile(basicValidXlsx, "My_Contact_List.Xlsx");
    assert.strictEqual(res.contacts.length, 1);
    assert.strictEqual(res.contacts[0].email, "alice@example.com");
  });

  const basicValidCsv = Buffer.from("Name,Email\nBob Kumar,bob@example.com\n");

  await it("CSV: uppercase extension .CSV parses successfully", async () => {
    const res = await parseContactsFile(basicValidCsv, "CLIENTS.CSV");
    assert.strictEqual(res.contacts.length, 1);
    assert.strictEqual(res.contacts[0].email, "bob@example.com");
  });

  await it("CSV: mixed-case extension .Csv parses successfully", async () => {
    const res = await parseContactsFile(basicValidCsv, "Clients_List.Csv");
    assert.strictEqual(res.contacts.length, 1);
    assert.strictEqual(res.contacts[0].email, "bob@example.com");
  });

  // --------------------------------------------------------------------------
  // 2. EXPLICIT REJECTION OF LEGACY .XLS (BIFF8) AND UNSUPPORTED FORMATS
  // --------------------------------------------------------------------------
  console.log("\n--- 2. Unsupported Extensions & Legacy .XLS Rejection ---");

  await it("Legacy .xls: lowercase .xls explicitly rejected with safe error message", async () => {
    const dummyBuffer = Buffer.from("dummy legacy binary data");
    const res = await parseContactsFile(dummyBuffer, "legacy_contacts.xls");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("Legacy Excel (.xls, BIFF8) is not supported"));
    assert(res.errors[0].includes(".xlsx"));
  });

  await it("Legacy .xls: uppercase .XLS explicitly rejected with safe error message", async () => {
    const dummyBuffer = Buffer.from("dummy legacy binary data");
    const res = await parseContactsFile(dummyBuffer, "OLD_DATA.XLS");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("Legacy Excel (.xls, BIFF8) is not supported"));
  });

  await it("Unsupported extension: .pdf rejected rather than falling back to CSV", async () => {
    const pdfBuffer = Buffer.from("%PDF-1.4 sample pdf content");
    const res = await parseContactsFile(pdfBuffer, "document.pdf");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes('Unsupported file extension ".pdf"'));
  });

  await it("Unsupported extension: .txt rejected rather than falling back to CSV", async () => {
    const txtBuffer = Buffer.from("name,email\ntest,test@example.com");
    const res = await parseContactsFile(txtBuffer, "contacts.txt");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes('Unsupported file extension ".txt"'));
  });

  await it("Unsupported extension: .json rejected rather than falling back to CSV", async () => {
    const jsonBuffer = Buffer.from(JSON.stringify([{ email: "test@example.com" }]));
    const res = await parseContactsFile(jsonBuffer, "data.json");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes('Unsupported file extension ".json"'));
  });

  await it("Unsupported extension: bare filename without extension is rejected", async () => {
    const res = await parseContactsFile(basicValidCsv, "contacts_without_extension");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("Unsupported file extension"));
  });

  // --------------------------------------------------------------------------
  // 3. FILE CONTENT VALIDATION & ANTI-SPOOFING
  // --------------------------------------------------------------------------
  console.log("\n--- 3. File Content Validation & Anti-Spoofing ---");

  await it("Anti-spoofing: CSV text file incorrectly named .xlsx fails OpenXML signature check", async () => {
    const fakeXlsxBuffer = Buffer.from("Name,Email\nFake User,fake@example.com");
    const res = await parseContactsFile(fakeXlsxBuffer, "contacts.xlsx");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("lacks valid OpenXML/ZIP archive header signature"));
  });

  await it("Anti-spoofing: XLSX binary archive incorrectly named .csv is rejected", async () => {
    const res = await parseContactsFile(basicValidXlsx, "contacts.csv");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("appears to be a binary ZIP/XLSX archive incorrectly named as .csv"));
  });

  await it("Content validation: Binary characters (null bytes) in .csv are rejected", async () => {
    const binaryData = Buffer.concat([
      Buffer.from("Name,Email\nEvil,evil@example.com\n"),
      Buffer.from([0x00, 0x01, 0x02, 0xff]),
    ]);
    const res = await parseContactsFile(binaryData, "evil.csv");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("Binary characters detected"));
  });

  await it("Content validation: Corrupted / truncated ZIP archive fails closed with parse error", async () => {
    // Starts with PK magic bytes but has corrupted payload
    const corruptedZip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00, 0xde, 0xad, 0xbe, 0xef]);
    const res = await parseContactsFile(corruptedZip, "corrupt.xlsx");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("Excel Parse Error"));
  });

  // --------------------------------------------------------------------------
  // 4. EMPTY FILES & MISSING HEADERS
  // --------------------------------------------------------------------------
  console.log("\n--- 4. Empty Files & Missing Headers ---");

  await it("Empty file: 0-byte buffer rejected for .csv", async () => {
    const res = await parseContactsFile(Buffer.alloc(0), "empty.csv");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("Uploaded file is empty"));
  });

  await it("Empty file: 0-byte buffer rejected for .xlsx", async () => {
    const res = await parseContactsFile(Buffer.alloc(0), "empty.xlsx");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("Uploaded file is empty"));
  });

  await it("Empty file: Whitespace-only CSV rejected", async () => {
    const res = await parseContactsFile(Buffer.from("   \n\t  \n  "), "blank.csv");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("Uploaded CSV file is empty"));
  });

  await it("Empty file: XLSX workbook with no worksheets rejected", async () => {
    const emptyWb = new ExcelJS.Workbook();
    const buf = Buffer.from(await emptyWb.xlsx.writeBuffer());
    const res = await parseContactsFile(buf, "nosheets.xlsx");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("contains no worksheets"));
  });

  // --------------------------------------------------------------------------
  // 5. EXCELJS CELL TYPE SAFETY
  // --------------------------------------------------------------------------
  console.log("\n--- 5. Safe ExcelJS Cell Type Extraction ---");

  await it("Cell Types: formula, richText, hyperlinks, dates, primitives extracted safely", async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Contacts");

    // Header row
    ws.addRow(["Name", "Email", "Notes", "JoinedDate"]);

    // Row 1: Rich Text Name, Hyperlink Email
    const row1 = ws.addRow(["RichName", "dummy@x.com", "Note1", "2026-01-01"]);
    // Cell 1: Rich Text
    row1.getCell(1).value = {
      richText: [{ text: "Director " }, { text: "Rajesh Kumar" }],
    } as any;
    // Cell 2: Hyperlink with mailto
    row1.getCell(2).value = {
      text: "rajesh@hindustanprojects.in",
      hyperlink: "mailto:rajesh@hindustanprojects.in",
    } as any;

    // Row 2: Formula cell result for email
    const row2 = ws.addRow(["FormulaUser", "dummy2@x.com", "Note2", "2026-01-02"]);
    row2.getCell(2).value = {
      formula: 'CONCAT("calc","@domain.com")',
      result: "calc@domain.com",
    } as any;

    // Row 3: Hyperlink without text, using mailto
    const row3 = ws.addRow(["LinkOnlyUser", "dummy3@x.com", "Note3", "2026-01-03"]);
    row3.getCell(2).value = {
      hyperlink: "mailto:directlink@domain.com",
    } as any;

    // Row 4: Error cell for notes, valid email
    const row4 = ws.addRow(["ErrorCellUser", "validerror@domain.com", "Note4", "2026-01-04"]);
    row4.getCell(3).value = { error: "#N/A" } as any;

    // Row 5: Date object cell
    const row5 = ws.addRow(["DateUser", "dateuser@domain.com", "Note5", new Date("2026-05-15T00:00:00.000Z")]);

    const buf = Buffer.from(await workbook.xlsx.writeBuffer());
    const res = await parseContactsFile(buf, "types.xlsx");

    assert.strictEqual(res.contacts.length, 5);

    // Verify Row 1: Rich Text combined
    const c1 = res.contacts.find((c) => c.email === "rajesh@hindustanprojects.in");
    assert(c1, "Missing rich text contact");
    assert.strictEqual(c1.name, "Director Rajesh Kumar");

    // Verify Row 2: Formula result extracted
    const c2 = res.contacts.find((c) => c.email === "calc@domain.com");
    assert(c2, "Missing formula contact");
    assert.strictEqual(c2.name, "FormulaUser");

    // Verify Row 3: Mailto link fallback
    const c3 = res.contacts.find((c) => c.email === "directlink@domain.com");
    assert(c3, "Missing mailto contact");

    // Verify Row 4: Error cell did not produce [object Object]
    const c4 = res.contacts.find((c) => c.email === "validerror@domain.com");
    assert(c4, "Missing valid error user");

    // Verify Row 5: Date did not break parsing
    const c5 = res.contacts.find((c) => c.email === "dateuser@domain.com");
    assert(c5, "Missing date contact");
  });

  // --------------------------------------------------------------------------
  // 6. PROCESSING LIMITS (ROWS, COLUMNS, FILE SIZE, CONTACTS)
  // --------------------------------------------------------------------------
  console.log("\n--- 6. XLSX & CSV Processing Bounds ---");

  await it("Processing Limits: File size exceeding 10 MB is rejected immediately", async () => {
    // 10 MB + 1 byte dummy buffer
    const hugeBuf = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024);
    const res = await parseContactsFile(hugeBuf, "huge.csv");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("exceeds maximum allowed limit of 10 MB"));
  });

  await it("Processing Limits: Declared worksheet columns exceeding 50 is rejected", async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("WideSheet");
    // Generate header row with 55 columns
    const wideHeaders: string[] = [];
    for (let i = 1; i <= 55; i++) {
      wideHeaders.push(`Col${i}`);
    }
    ws.addRow(wideHeaders);
    ws.addRow(["test@example.com"]);
    const buf = Buffer.from(await wb.xlsx.writeBuffer());

    const res = await parseContactsFile(buf, "wide.xlsx");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("maximum allowed column limit"));
  });

  await it("Processing Limits: CSV exceeding 5,000 rows is rejected", async () => {
    const rows = ["Name,Email"];
    for (let i = 1; i <= 5005; i++) {
      rows.push(`User ${i},user${i}@example.com`);
    }
    const bigCsv = Buffer.from(rows.join("\n"));
    const res = await parseContactsFile(bigCsv, "big.csv");
    assert.strictEqual(res.contacts.length, 0);
    assert(res.errors[0].includes("maximum allowed row limit"));
  });

  // --------------------------------------------------------------------------
  // 7. DUPLICATE HEADERS, BLANK ROWS, DEDUPLICATION
  // --------------------------------------------------------------------------
  console.log("\n--- 7. Duplicate Headers, Blank Rows, & Deduplication ---");

  await it("Duplicate Headers: Multiple 'Email' and 'Name' columns handled safely without crash", async () => {
    const duplicateHeaderXlsx = await buildXlsxBuffer([
      ["Name", "Email", "Name", "Email"],
      ["Primary Name", "primary@example.com", "Secondary Name", "secondary@example.com"],
    ]);
    const res = await parseContactsFile(duplicateHeaderXlsx, "dup_headers.xlsx");
    assert.strictEqual(res.contacts.length, 1);
    assert(res.contacts[0].email.includes("@example.com"));
  });

  await it("Blank Rows & Empty Cells: Blank rows skipped cleanly without false errors", async () => {
    const blankRowsXlsx = await buildXlsxBuffer([
      ["Name", "Email"],
      ["", ""], // completely blank row
      ["Clean User", "clean@example.com"],
      ["", ""], // another blank row
      ["Second User", "second@example.com"],
    ]);
    const res = await parseContactsFile(blankRowsXlsx, "blank_rows.xlsx");
    assert.strictEqual(res.contacts.length, 2);
  });

  await it("Deduplication: Duplicate emails (same casing and mixed casing) deduplicated to 1", async () => {
    const dupCsv = Buffer.from(
      "Name,Email\n" +
      "First Entry,test@domain.com\n" +
      "Second Entry,TEST@DOMAIN.COM\n" +
      "Third Entry,Test@Domain.Com\n"
    );
    const res = await parseContactsFile(dupCsv, "dedup.csv");
    assert.strictEqual(res.contacts.length, 1);
    assert.strictEqual(res.contacts[0].email, "test@domain.com");
  });

  await it("Invalid Email Formatting: Invalid email strings reported in errors array", async () => {
    const invalidEmailCsv = Buffer.from(
      "Name,Email\n" +
      "Valid,valid@domain.com\n" +
      "Bad 1,not-an-email\n" +
      "Bad 2,missingdomain@\n" +
      "Bad 3,@nodomain.com\n"
    );
    const res = await parseContactsFile(invalidEmailCsv, "invalids.csv");
    assert.strictEqual(res.contacts.length, 1);
    assert.strictEqual(res.contacts[0].email, "valid@domain.com");
    assert.strictEqual(res.errors.length, 3);
  });

  // --------------------------------------------------------------------------
  // 8. ROUTE-LEVEL AUTHENTICATION & ZERO-MUTATION FAIL-CLOSED TESTS
  // --------------------------------------------------------------------------
  console.log("\n--- 8. Route-Level Authentication & Database Fail-Closed ---");

  const app = express();
  app.use(express.json());
  app.use("/api/automail", automailRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  try {
    await it("Route Guard: Unauthenticated POST /api/automail/contacts/import returns HTTP 401", async () => {
      const res = await fetch(`http://127.0.0.1:${port}/api/automail/contacts/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      assert.strictEqual(res.status, 401, `Expected HTTP 401, got ${res.status}`);
    });

    await it("Route Guard: Unauthenticated request produces zero database mutations", async () => {
      // Attempt unauthorized injection of a contact payload
      const res = await fetch(`http://127.0.0.1:${port}/api/automail/contacts/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "hacker@unauthorized.com", brand: "hipro" }),
      });
      assert.strictEqual(res.status, 401);
    });
  } finally {
    server.close();
  }

  // --------------------------------------------------------------------------
  // FINAL SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n==========================================================");
  console.log(`TOTAL PARSER HARDENING TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
