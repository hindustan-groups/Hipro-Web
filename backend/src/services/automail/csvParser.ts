import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

export interface ParsedContact {
  email: string;
  name: string;
}

export interface ParseResult {
  contacts: ParsedContact[];
  errors: string[];
  totalParsed: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Universal Parser: Parses either CSV or Excel buffer into valid contact records
 */
export function parseContactsFile(buffer: Buffer, filename: string = "contacts.csv"): ParseResult {
  const isExcel = filename.endsWith(".xlsx") || filename.endsWith(".xls");

  let rawRows: Record<string, any>[] = [];

  if (isExcel) {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
    } catch (err: any) {
      return { contacts: [], errors: [`Excel Parse Error: ${err.message}`], totalParsed: 0 };
    }
  } else {
    try {
      const content = buffer.toString("utf-8");
      rawRows = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });
    } catch (err: any) {
      return { contacts: [], errors: [`CSV Parse Error: ${err.message}`], totalParsed: 0 };
    }
  }

  const contacts: ParsedContact[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, index) => {
    // Look up email column with case-insensitivity
    let email = "";
    let name = "";

    for (const [key, val] of Object.entries(row)) {
      const lowerKey = key.trim().toLowerCase();
      const stringVal = String(val || "").trim();

      if (!email && (lowerKey === "email" || lowerKey === "email address" || lowerKey === "mail" || lowerKey === "contact email")) {
        email = stringVal;
      }
      if (!name && (lowerKey === "name" || lowerKey === "full name" || lowerKey === "contact name" || lowerKey === "client name" || lowerKey === "first name")) {
        name = stringVal;
      }
    }

    // Fallback: If not found by named columns, inspect values for an email string
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

  // Deduplicate entries by email address
  const seen = new Set<string>();
  const uniqueContacts: ParsedContact[] = [];
  for (const c of contacts) {
    if (!seen.has(c.email)) {
      seen.add(c.email);
      uniqueContacts.push(c);
    }
  }

  return {
    contacts: uniqueContacts,
    errors,
    totalParsed: rawRows.length,
  };
}
