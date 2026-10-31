import path from "node:path";
import { parse } from "csv-parse/sync";
import ExcelJS from "exceljs";

export interface ParsedContact {
  email: string;
  name: string;
}

export interface ParseResult {
  contacts: ParsedContact[];
  errors: string[];
  totalParsed: number;
}

// Defensible processing bounds for Automail contact import
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_WORKSHEET_ROWS = 5000;
export const MAX_WORKSHEET_COLUMNS = 50;
export const MAX_ACCEPTED_CONTACTS = 5000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Check if buffer has ZIP archive signature (used by OpenXML .xlsx files)
 * Standard local file header signature: 50 4B 03 04, 50 4B 05 06 (empty), or 50 4B 07 08 (spanned)
 */
export function hasZipMagicBytes(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 4) return false;
  return (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)
  );
}

/**
 * Check if buffer contains binary null bytes (indicates non-text files)
 */
export function containsBinaryBytes(buffer: Buffer, sampleLength: number = 4096): boolean {
  const limit = Math.min(buffer.length, sampleLength);
  for (let i = 0; i < limit; i++) {
    if (buffer[i] === 0x00) return true;
  }
  return false;
}

/**
 * Safely extract text from any ExcelJS Cell value type without evaluation or external traversal
 */
export function extractSafeCellValue(cell: ExcelJS.Cell): string {
  const val = cell.value;
  if (val === null || val === undefined) {
    return "";
  }

  // Primitive strings, numbers, booleans
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("{") && trimmed.includes("hyperlink")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.text) return String(parsed.text).trim();
        if (parsed.hyperlink) {
          const link = String(parsed.hyperlink).trim();
          return link.toLowerCase().startsWith("mailto:") ? link.slice(7).trim() : link;
        }
      } catch {
        // Not JSON, continue with normal string
      }
    }
    return trimmed;
  }
  if (typeof val === "number" || typeof val === "boolean") {
    return String(val).trim();
  }

  // Dates
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? "" : val.toISOString();
  }

  // Complex ExcelJS Cell Object representations
  if (typeof val === "object") {
    // 1. Formula cell: { formula: string, result: any }
    // Do NOT evaluate formula; safely extract static calculated result
    if ("result" in val && val.result !== undefined && val.result !== null) {
      if (typeof val.result === "string" || typeof val.result === "number" || typeof val.result === "boolean") {
        return String(val.result).trim();
      }
      if (val.result instanceof Date) {
        return isNaN(val.result.getTime()) ? "" : val.result.toISOString();
      }
      return "";
    }

    // 2. Rich Text: { richText: Array<{ text: string }> }
    if ("richText" in val && Array.isArray((val as any).richText)) {
      return (val as any).richText
        .map((chunk: any) => (chunk && typeof chunk.text === "string" ? chunk.text : ""))
        .join("")
        .trim();
    }

    // 3. Hyperlink: { text: string, hyperlink: string }
    // Do NOT follow external link. If text exists, use it. If text missing and hyperlink is mailto:..., extract email.
    if ("hyperlink" in val) {
      const textVal = (val as any).text ? String((val as any).text).trim() : "";
      if (textVal) return textVal;
      const link = String((val as any).hyperlink || "").trim();
      if (link.toLowerCase().startsWith("mailto:")) {
        return link.slice(7).trim();
      }
      return link;
    }

    // 4. Error cell: { error: string }
    if ("error" in val) {
      return "";
    }

    // 5. Generic object with .text string
    if ("text" in val && typeof (val as any).text === "string") {
      return (val as any).text.trim();
    }
  }

  return "";
}

/**
 * Universal Parser: Parses either CSV or Excel buffer into valid contact records
 */
export async function parseContactsFile(buffer: Buffer, filename: string = "contacts.csv"): Promise<ParseResult> {
  // 1. Empty buffer check
  if (!buffer || buffer.length === 0) {
    return {
      contacts: [],
      errors: ["Uploaded file is empty (0 bytes)."],
      totalParsed: 0,
    };
  }

  // 2. File size limit check
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      contacts: [],
      errors: [
        `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 10 MB.`,
      ],
      totalParsed: 0,
    };
  }

  // 3. Normalized extension checks
  const rawFilename = (filename || "contacts.csv").trim();
  const ext = path.extname(rawFilename).toLowerCase();

  // Explicit rejection of legacy .xls (BIFF8) format
  if (ext === ".xls") {
    return {
      contacts: [],
      errors: [
        "Unsupported file format: Legacy Excel (.xls, BIFF8) is not supported. Please save and upload your file as modern Excel (.xlsx) or CSV (.csv).",
      ],
      totalParsed: 0,
    };
  }

  // Reject unsupported extensions
  if (ext !== ".xlsx" && ext !== ".csv") {
    return {
      contacts: [],
      errors: [
        `Unsupported file extension "${ext || "none"}": Only modern Excel (.xlsx) and CSV (.csv) files are supported.`,
      ],
      totalParsed: 0,
    };
  }

  let rawRows: Record<string, any>[] = [];

  // 4. XLSX processing
  if (ext === ".xlsx") {
    // Content validation: must have ZIP magic bytes signature
    if (!hasZipMagicBytes(buffer)) {
      return {
        contacts: [],
        errors: [
          "Invalid XLSX file: File lacks valid OpenXML/ZIP archive header signature. If this is a CSV or plain text file, please rename it to .csv.",
        ],
        totalParsed: 0,
      };
    }

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (!workbook.worksheets || workbook.worksheets.length === 0) {
        return {
          contacts: [],
          errors: ["Invalid XLSX workbook: Archive contains no worksheets."],
          totalParsed: 0,
        };
      }

      const worksheet = workbook.worksheets[0];

      // Enforce declared worksheet dimension bounds
      if (worksheet.rowCount > MAX_WORKSHEET_ROWS) {
        return {
          contacts: [],
          errors: [
            `Worksheet exceeds maximum allowed row limit (${worksheet.rowCount} declared rows > ${MAX_WORKSHEET_ROWS} limit).`,
          ],
          totalParsed: 0,
        };
      }

      if (worksheet.columnCount > MAX_WORKSHEET_COLUMNS) {
        return {
          contacts: [],
          errors: [
            `Worksheet exceeds maximum allowed column limit (${worksheet.columnCount} declared columns > ${MAX_WORKSHEET_COLUMNS} limit).`,
          ],
          totalParsed: 0,
        };
      }

      // Map header row (row 1)
      const headers: string[] = [];
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= MAX_WORKSHEET_COLUMNS) {
          headers[colNumber] = extractSafeCellValue(cell);
        }
      });

      // Extract row data starting from row 2 with strict row cap
      let actualRowCount = 0;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        actualRowCount++;
        if (actualRowCount > MAX_WORKSHEET_ROWS) return;

        const rowObj: Record<string, any> = {};
        let hasAnyValue = false;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber > MAX_WORKSHEET_COLUMNS) return;
          const header = headers[colNumber] || `col_${colNumber}`;
          const strVal = extractSafeCellValue(cell);
          if (strVal) hasAnyValue = true;
          rowObj[header] = strVal;
        });

        if (hasAnyValue) {
          rawRows.push(rowObj);
        }
      });

      if (actualRowCount > MAX_WORKSHEET_ROWS) {
        return {
          contacts: [],
          errors: [
            `Worksheet exceeds maximum allowed row limit (${actualRowCount} actual rows > ${MAX_WORKSHEET_ROWS} limit).`,
          ],
          totalParsed: 0,
        };
      }
    } catch (err: any) {
      return {
        contacts: [],
        errors: [`Excel Parse Error: ${err.message || "Failed to parse workbook archive"}`],
        totalParsed: 0,
      };
    }
  } else {
    // 5. CSV processing
    // Content validation: must NOT be a ZIP file
    if (hasZipMagicBytes(buffer)) {
      return {
        contacts: [],
        errors: [
          "Invalid CSV file: File appears to be a binary ZIP/XLSX archive incorrectly named as .csv. Please rename to .xlsx.",
        ],
        totalParsed: 0,
      };
    }

    // Binary null byte check
    if (containsBinaryBytes(buffer)) {
      return {
        contacts: [],
        errors: [
          "Invalid CSV file: Binary characters detected. CSV files must be valid UTF-8/ASCII text.",
        ],
        totalParsed: 0,
      };
    }

    const content = buffer.toString("utf-8");
    if (!content.trim()) {
      return {
        contacts: [],
        errors: ["Uploaded CSV file is empty."],
        totalParsed: 0,
      };
    }

    try {
      rawRows = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        to: MAX_WORKSHEET_ROWS + 1, // Cap parsed rows to prevent runaway parse
      });

      if (rawRows.length > MAX_WORKSHEET_ROWS) {
        return {
          contacts: [],
          errors: [
            `CSV file exceeds maximum allowed row limit (${rawRows.length} rows > ${MAX_WORKSHEET_ROWS} limit).`,
          ],
          totalParsed: 0,
        };
      }
    } catch (err: any) {
      return {
        contacts: [],
        errors: [`CSV Parse Error: ${err.message || "Failed to parse CSV records"}`],
        totalParsed: 0,
      };
    }
  }

  // 6. Contact extraction, normalization, and validation
  const contacts: ParsedContact[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, index) => {
    let email = "";
    let name = "";

    // Case-insensitive header matching with aliases
    for (const [key, val] of Object.entries(row)) {
      const lowerKey = key.trim().toLowerCase();
      const stringVal = String(val || "").trim();

      if (
        !email &&
        (lowerKey === "email" ||
          lowerKey === "email address" ||
          lowerKey === "mail" ||
          lowerKey === "contact email")
      ) {
        email = stringVal;
      }
      if (
        !name &&
        (lowerKey === "name" ||
          lowerKey === "full name" ||
          lowerKey === "contact name" ||
          lowerKey === "client name" ||
          lowerKey === "first name")
      ) {
        name = stringVal;
      }
    }

    // Fallback: If not found by named columns, inspect row values for an email regex match
    if (!email) {
      for (const val of Object.values(row)) {
        const str = String(val || "").trim();
        if (EMAIL_REGEX.test(str)) {
          email = str;
          break;
        }
      }
    }

    if (!email) {
      errors.push(`Row ${index + 2}: No valid email found`);
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      errors.push(`Row ${index + 2}: Invalid email format "${email}"`);
      return;
    }

    contacts.push({
      email: cleanEmail,
      name: name.trim(),
    });
  });

  // 7. Deduplicate entries by email address
  const seen = new Set<string>();
  const uniqueContacts: ParsedContact[] = [];
  for (const c of contacts) {
    if (!seen.has(c.email)) {
      seen.add(c.email);
      uniqueContacts.push(c);
    }
  }

  // 8. Enforce total accepted contacts limit
  if (uniqueContacts.length > MAX_ACCEPTED_CONTACTS) {
    return {
      contacts: [],
      errors: [
        `Total valid contacts (${uniqueContacts.length}) exceeds maximum allowed import limit of ${MAX_ACCEPTED_CONTACTS}.`,
      ],
      totalParsed: rawRows.length,
    };
  }

  return {
    contacts: uniqueContacts,
    errors,
    totalParsed: rawRows.length,
  };
}
