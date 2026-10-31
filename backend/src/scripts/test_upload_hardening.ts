import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import zlib from "zlib";
import { prisma } from "../lib/db";
import uploadRouter from "../routes/upload";

// Mock Prisma for admin sessions, admin users, and settings
const originalFindSession = prisma.adminSession.findUnique;
const originalFindUser = prisma.adminUser.findUnique;
const originalFindSettings = prisma.settings.findMany;

(prisma.settings as any).findMany = async () => {
  return [
    {
      id: "global",
      cloudinaryCloudName: "fczoredh",
      cloudinaryUploadPreset: "ml_default",
      companyEmail: "info@hindustanprojects.in",
      companyPhone: "+91 75970 00601",
      companyAddress: "Bhilwara, Rajasthan",
      socialLinks: JSON.stringify({ instagram: "https://instagram.com" }),
      pageContent: "{}",
      navigationConfig: "[]",
      updatedAt: new Date(),
    },
  ];
};

(prisma.adminSession as any).findUnique = async ({ where }: any) => {
  if (where?.id === "valid-admin-session") {
    return {
      id: "valid-admin-session",
      userId: "admin-user-id",
      expiresAt: new Date(Date.now() + 86400000),
    };
  }
  if (where?.id === "non-admin-session") {
    return {
      id: "non-admin-session",
      userId: "viewer-user-id",
      expiresAt: new Date(Date.now() + 86400000),
    };
  }
  return null;
};

(prisma.adminUser as any).findUnique = async ({ where }: any) => {
  if (where?.id === "admin-user-id") {
    return {
      id: "admin-user-id",
      email: "admin@hindustanprojects.in",
      name: "Super Admin",
      role: "admin",
    };
  }
  if (where?.id === "viewer-user-id") {
    return {
      id: "viewer-user-id",
      email: "viewer@example.com",
      name: "Viewer",
      role: "viewer",
    };
  }
  return null;
};

// Express test app mounting upload route
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use("/api/upload", uploadRouter);

// -----------------------------------------------------------------------------
// Structurally Complete, Valid Image Generators
// -----------------------------------------------------------------------------

// Complete valid 1x1 JPEG with SOI, APP0, DQT, SOF0 (1x1), SOS, and EOI
function createValidJpeg(): Buffer {
  return Buffer.from([
    0xff, 0xd8, // SOI
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, // APP0
    0xff, 0xdb, 0x00, 0x43, 0x00, ...Array(64).fill(1), // DQT
    0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, // SOF0 (1x1, 8-bit)
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, // SOS
    0x00, // Scan data
    0xff, 0xd9, // EOI
  ]);
}

// Complete valid 1x1 PNG with signature, IHDR (1x1, 8-bit truecolor), IDAT, and IEND with verified CRC32
function createValidPng(): Buffer {
  const ihdrData = Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]); // 1x1, 8-bit truecolor
  const ihdrCrc = zlib.crc32(Buffer.concat([Buffer.from("IHDR"), ihdrData]));
  const idatData = zlib.deflateSync(Buffer.from([0, 0, 0, 0])); // filter byte 0, RGB (0,0,0)
  const idatCrc = zlib.crc32(Buffer.concat([Buffer.from("IDAT"), idatData]));
  const iendCrc = zlib.crc32(Buffer.from("IEND"));

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.from([0, 0, 0, 13]), Buffer.from("IHDR"), ihdrData,
    Buffer.from([ihdrCrc >> 24 & 0xff, ihdrCrc >> 16 & 0xff, ihdrCrc >> 8 & 0xff, ihdrCrc & 0xff]),
    Buffer.from([0, 0, 0, idatData.length]), Buffer.from("IDAT"), idatData,
    Buffer.from([idatCrc >> 24 & 0xff, idatCrc >> 16 & 0xff, idatCrc >> 8 & 0xff, idatCrc & 0xff]),
    Buffer.from([0, 0, 0, 0]), Buffer.from("IEND"),
    Buffer.from([iendCrc >> 24 & 0xff, iendCrc >> 16 & 0xff, iendCrc >> 8 & 0xff, iendCrc & 0xff]),
  ]);
}

// Complete valid 1x1 WebP (VP8 lossy keyframe)
function createValidWebpLossy(): Buffer {
  const vp8Data = Buffer.from([
    0x10, 0x00, 0x00, // frame tag: keyframe=0, version=0, show_frame=1
    0x9d, 0x01, 0x2a, // VP8 keyframe start code
    0x01, 0x00, // width: 1
    0x01, 0x00, // height: 1
    0x00, // Payload byte
  ]);
  const vp8ChunkSize = vp8Data.length;
  const totalSize = 12 + 8 + vp8ChunkSize + (vp8ChunkSize % 2);
  const riffSize = totalSize - 8;

  return Buffer.concat([
    Buffer.from("RIFF"),
    Buffer.from([riffSize & 0xff, (riffSize >> 8) & 0xff, (riffSize >> 16) & 0xff, (riffSize >> 24) & 0xff]),
    Buffer.from("WEBP"),
    Buffer.from("VP8 "),
    Buffer.from([vp8ChunkSize & 0xff, (vp8ChunkSize >> 8) & 0xff, (vp8ChunkSize >> 16) & 0xff, (vp8ChunkSize >> 24) & 0xff]),
    vp8Data,
    (vp8ChunkSize % 2 !== 0 ? Buffer.from([0]) : Buffer.alloc(0)),
  ]);
}

// Complete valid 1x1 WebP (VP8L lossless)
function createValidWebpLossless(): Buffer {
  const vp8lData = Buffer.from([
    0x2f, // Lossless signature byte
    0x00, 0x00, 0x00, 0x00, // Packed 1x1 dimensions
    0x00, 0x00,
  ]);
  const vp8lChunkSize = vp8lData.length;
  const totalSize = 12 + 8 + vp8lChunkSize + (vp8lChunkSize % 2);
  const riffSize = totalSize - 8;

  return Buffer.concat([
    Buffer.from("RIFF"),
    Buffer.from([riffSize & 0xff, (riffSize >> 8) & 0xff, (riffSize >> 16) & 0xff, (riffSize >> 24) & 0xff]),
    Buffer.from("WEBP"),
    Buffer.from("VP8L"),
    Buffer.from([vp8lChunkSize & 0xff, (vp8lChunkSize >> 8) & 0xff, (vp8lChunkSize >> 16) & 0xff, (vp8lChunkSize >> 24) & 0xff]),
    vp8lData,
    (vp8lChunkSize % 2 !== 0 ? Buffer.from([0]) : Buffer.alloc(0)),
  ]);
}

const adminHeaders = {
  Cookie: "admin_session=valid-admin-session",
};

async function runUploadHardeningSuite() {
  console.log("================================================================================");
  console.log("   HiPRO GATE 1A-9R: COMPREHENSIVE UPLOAD & STRUCTURAL VALIDATION REVIEW SUITE  ");
  console.log("================================================================================\n");

  let totalCases = 0;
  let passedCases = 0;
  let failedCases = 0;

  let totalAssertions = 0;
  let passedAssertions = 0;
  let failedAssertions = 0;

  let currentCasePassed = true;

  function startCase(name: string) {
    totalCases++;
    currentCasePassed = true;
    console.log(`\n[Test Case ${totalCases}] ${name}`);
  }

  function assert(condition: boolean, assertionDesc: string, detail?: string) {
    totalAssertions++;
    if (condition) {
      console.log(`  ├── [PASS] ${assertionDesc}`);
      passedAssertions++;
    } else {
      console.error(`  ├── [FAIL] ${assertionDesc}${detail ? ` - ${detail}` : ""}`);
      failedAssertions++;
      currentCasePassed = false;
    }
  }

  function endCase() {
    if (currentCasePassed) {
      passedCases++;
      console.log(`  └── RESULT: CASE PASSED`);
    } else {
      failedCases++;
      console.error(`  └── RESULT: CASE FAILED`);
    }
  }

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    async function postUpload({
      buffer,
      filename,
      mimeType,
      headers = adminHeaders,
      extraFields = {},
    }: {
      buffer?: Buffer;
      filename?: string;
      mimeType?: string;
      headers?: Record<string, string>;
      extraFields?: Record<string, string>;
    }) {
      const formData = new FormData();
      if (buffer && filename) {
        formData.append("file", new Blob([buffer], { type: mimeType || "application/octet-stream" }), filename);
      }
      for (const [key, value] of Object.entries(extraFields)) {
        formData.append(key, value);
      }
      const res = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        body: formData,
        headers,
      });
      const data = (await res.json().catch(() => ({}))) as any;
      return { status: res.status, data };
    }

    // =========================================================================
    // GROUP 1: Allowed Image Formats & Complete Valid Structures
    // =========================================================================
    console.log("--- GROUP 1: Allowed Formats with Complete Valid Structures ---");

    startCase("Allowed: .jpg file with complete JPEG structure (SOI, APP0, DQT, SOF0, SOS, EOI)");
    {
      const res = await postUpload({
        buffer: createValidJpeg(),
        filename: "valid_photo.jpg",
        mimeType: "image/jpeg",
      });
      assert(res.status === 200, "Responds with HTTP 200 OK");
      assert(res.data.success === true, "Response payload returns success: true");
      assert(Boolean(res.data.url), "Response payload returns media URL");
    }
    endCase();

    startCase("Allowed: .jpeg extension with complete JPEG structure");
    {
      const res = await postUpload({
        buffer: createValidJpeg(),
        filename: "valid_photo.jpeg",
        mimeType: "image/jpeg",
      });
      assert(res.status === 200, "Responds with HTTP 200 OK");
      assert(res.data.success === true, "Response payload returns success: true");
    }
    endCase();

    startCase("Allowed: .png file with complete PNG structure (Signature, IHDR, IDAT, IEND, valid CRCs)");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "valid_graphic.png",
        mimeType: "image/png",
      });
      assert(res.status === 200, "Responds with HTTP 200 OK");
      assert(res.data.success === true, "Response payload returns success: true");
    }
    endCase();

    startCase("Allowed: .webp file with complete WebP lossy VP8 structure");
    {
      const res = await postUpload({
        buffer: createValidWebpLossy(),
        filename: "valid_banner.webp",
        mimeType: "image/webp",
      });
      assert(res.status === 200, "Responds with HTTP 200 OK");
      assert(res.data.success === true, "Response payload returns success: true");
    }
    endCase();

    startCase("Allowed: .webp file with complete WebP lossless VP8L structure");
    {
      const res = await postUpload({
        buffer: createValidWebpLossless(),
        filename: "valid_lossless.webp",
        mimeType: "image/webp",
      });
      assert(res.status === 200, "Responds with HTTP 200 OK");
      assert(res.data.success === true, "Response payload returns success: true");
    }
    endCase();

    // =========================================================================
    // GROUP 2: Disallowed Image Formats (Extension / MIME rejection)
    // =========================================================================
    console.log("\n--- GROUP 2: Disallowed Image Formats ---");

    startCase("Rejected: SVG image (.svg, image/svg+xml)");
    {
      const res = await postUpload({
        buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'><circle r='5'/></svg>"),
        filename: "vector.svg",
        mimeType: "image/svg+xml",
      });
      assert(res.status === 400, "Rejected with HTTP 400 Bad Request");
      assert(res.data.error?.includes("Invalid file extension"), "Error references invalid file extension");
    }
    endCase();

    startCase("Rejected: AVIF image (.avif, image/avif)");
    {
      const res = await postUpload({
        buffer: Buffer.concat([Buffer.alloc(4), Buffer.from("ftypavif"), Buffer.alloc(10)]),
        filename: "photo.avif",
        mimeType: "image/avif",
      });
      assert(res.status === 400, "Rejected with HTTP 400 Bad Request");
      assert(res.data.error?.includes("Invalid file extension"), "Error references invalid file extension");
    }
    endCase();

    startCase("Rejected: GIF image (.gif, image/gif)");
    {
      const res = await postUpload({
        buffer: Buffer.from("GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"),
        filename: "animation.gif",
        mimeType: "image/gif",
      });
      assert(res.status === 400, "Rejected with HTTP 400 Bad Request");
      assert(res.data.error?.includes("Invalid file extension"), "Error references invalid file extension");
    }
    endCase();

    startCase("Rejected: BMP image (.bmp, image/bmp)");
    {
      const res = await postUpload({
        buffer: Buffer.from("BM\x1e\x00\x00\x00\x00\x00\x00\x00\x1a\x00\x00\x00\x0c\x00\x00\x00\x01\x00\x01\x00\x01\x00\x18\x00"),
        filename: "drawing.bmp",
        mimeType: "image/bmp",
      });
      assert(res.status === 400, "Rejected with HTTP 400 Bad Request");
    }
    endCase();

    startCase("Rejected: TIFF image (.tiff, image/tiff)");
    {
      const res = await postUpload({
        buffer: Buffer.from("II*\x00\x08\x00\x00\x00"),
        filename: "image.tiff",
        mimeType: "image/tiff",
      });
      assert(res.status === 400, "Rejected with HTTP 400 Bad Request");
    }
    endCase();

    // =========================================================================
    // GROUP 3: Dangerous Script & Executable File Extensions
    // =========================================================================
    console.log("\n--- GROUP 3: Prohibited Script & Executable Extensions ---");

    startCase("Prohibited: Windows Executable (.exe)");
    {
      const res = await postUpload({
        buffer: Buffer.from("MZ\x90\x00\x03\x00\x00\x00"),
        filename: "payload.exe",
        mimeType: "application/x-msdownload",
      });
      assert(res.status === 400, "Blocked with HTTP 400");
      assert(res.data.error?.includes("prohibited"), "Error explicitly mentions prohibited");
    }
    endCase();

    startCase("Prohibited: Shell script (.sh)");
    {
      const res = await postUpload({
        buffer: Buffer.from("#!/bin/bash\nrm -rf /"),
        filename: "script.sh",
        mimeType: "application/x-sh",
      });
      assert(res.status === 400, "Blocked with HTTP 400");
      assert(res.data.error?.includes("prohibited"), "Error explicitly mentions prohibited");
    }
    endCase();

    startCase("Prohibited: PHP script (.php)");
    {
      const res = await postUpload({
        buffer: Buffer.from("<?php system($_GET['cmd']); ?>"),
        filename: "shell.php",
        mimeType: "application/x-httpd-php",
      });
      assert(res.status === 400, "Blocked with HTTP 400");
      assert(res.data.error?.includes("prohibited"), "Error explicitly mentions prohibited");
    }
    endCase();

    startCase("Prohibited: HTML file (.html)");
    {
      const res = await postUpload({
        buffer: Buffer.from("<html><script>alert(1)</script></html>"),
        filename: "page.html",
        mimeType: "text/html",
      });
      assert(res.status === 400, "Blocked with HTTP 400");
      assert(res.data.error?.includes("prohibited"), "Error explicitly mentions prohibited");
    }
    endCase();

    startCase("Prohibited: JavaScript file (.js)");
    {
      const res = await postUpload({
        buffer: Buffer.from("console.log('malicious');"),
        filename: "exploit.js",
        mimeType: "application/javascript",
      });
      assert(res.status === 400, "Blocked with HTTP 400");
      assert(res.data.error?.includes("prohibited"), "Error explicitly mentions prohibited");
    }
    endCase();

    // =========================================================================
    // GROUP 4: Disallowed MIME Types
    // =========================================================================
    console.log("\n--- GROUP 4: Disallowed MIME Types ---");

    startCase("Rejected: Plain text MIME (text/plain)");
    {
      const res = await postUpload({
        buffer: Buffer.from("plain text content"),
        filename: "doc.txt",
        mimeType: "text/plain",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
    }
    endCase();

    startCase("Rejected: PDF document (application/pdf)");
    {
      const res = await postUpload({
        buffer: Buffer.from("%PDF-1.7"),
        filename: "report.pdf",
        mimeType: "application/pdf",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
    }
    endCase();

    startCase("Rejected: Binary stream (application/octet-stream)");
    {
      const res = await postUpload({
        buffer: Buffer.from([0x00, 0x01, 0x02, 0x03]),
        filename: "blob.bin",
        mimeType: "application/octet-stream",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
    }
    endCase();

    // =========================================================================
    // GROUP 5: Extension <-> MIME Type Pairing Mismatches
    // =========================================================================
    console.log("\n--- GROUP 5: Extension <-> MIME Pairing Mismatches ---");

    startCase("Mismatch: .png extension declared with image/jpeg MIME");
    {
      const res = await postUpload({
        buffer: createValidJpeg(),
        filename: "photo.png",
        mimeType: "image/jpeg",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("does not match the file extension"), "Error specifies mismatch");
    }
    endCase();

    startCase("Mismatch: .jpg extension declared with image/png MIME");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "photo.jpg",
        mimeType: "image/png",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("does not match the file extension"), "Error specifies mismatch");
    }
    endCase();

    startCase("Mismatch: .webp extension declared with image/jpeg MIME");
    {
      const res = await postUpload({
        buffer: createValidJpeg(),
        filename: "photo.webp",
        mimeType: "image/jpeg",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("does not match the file extension"), "Error specifies mismatch");
    }
    endCase();

    startCase("Mismatch: .jpeg extension declared with image/webp MIME");
    {
      const res = await postUpload({
        buffer: createValidWebpLossy(),
        filename: "photo.jpeg",
        mimeType: "image/webp",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("does not match the file extension"), "Error specifies mismatch");
    }
    endCase();

    // =========================================================================
    // GROUP 6: Magic Bytes Signature Anti-Spoofing (Cross-Format Spoofing)
    // =========================================================================
    console.log("\n--- GROUP 6: Magic Bytes Signature Anti-Spoofing ---");

    startCase("Anti-Spoof: Declared PNG (.png, image/png) containing valid JPEG binary");
    {
      const res = await postUpload({
        buffer: createValidJpeg(),
        filename: "spoofed.png",
        mimeType: "image/png",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error identifies signature/structure mismatch");
    }
    endCase();

    startCase("Anti-Spoof: Declared JPEG (.jpg, image/jpeg) containing valid PNG binary");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "spoofed.jpg",
        mimeType: "image/jpeg",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error identifies signature/structure mismatch");
    }
    endCase();

    startCase("Anti-Spoof: Declared WebP (.webp, image/webp) containing valid PNG binary");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "spoofed.webp",
        mimeType: "image/webp",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error identifies signature/structure mismatch");
    }
    endCase();

    startCase("Anti-Spoof: Declared JPEG (.jpg, image/jpeg) containing valid WebP binary");
    {
      const res = await postUpload({
        buffer: createValidWebpLossy(),
        filename: "spoofed.jpg",
        mimeType: "image/jpeg",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error identifies signature/structure mismatch");
    }
    endCase();

    // =========================================================================
    // GROUP 7: Correct Magic Bytes but Truncated / Incomplete / Malformed Image Data
    // =========================================================================
    console.log("\n--- GROUP 7: Valid Magic Bytes with Truncated / Incomplete / Malformed Structure ---");

    startCase("Structural Failure: Truncated JPEG (starts with FF D8 FF E0 magic bytes, but only 6 bytes total, no SOF, no EOI)");
    {
      const truncatedJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const res = await postUpload({
        buffer: truncatedJpeg,
        filename: "truncated.jpg",
        mimeType: "image/jpeg",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error specifies signature or structure mismatch");
    }
    endCase();

    startCase("Structural Failure: Incomplete JPEG (valid SOI, APP0, DQT, SOF0, but missing terminating EOI FF D9 marker)");
    {
      const fullJpeg = createValidJpeg();
      const incompleteJpeg = fullJpeg.subarray(0, fullJpeg.length - 2); // Strip EOI
      const res = await postUpload({
        buffer: incompleteJpeg,
        filename: "missing_eoi.jpg",
        mimeType: "image/jpeg",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error specifies signature or structure mismatch");
    }
    endCase();

    startCase("Structural Failure: Corrupted JPEG (valid SOI, but marker segment declared length overflows file buffer)");
    {
      const corruptedJpeg = Buffer.from([
        0xff, 0xd8, // SOI
        0xff, 0xe0, 0xff, 0xff, // Declared length 65535 on an 8-byte file
        0x01, 0x02, 0x03, 0x04,
      ]);
      const res = await postUpload({
        buffer: corruptedJpeg,
        filename: "overflow_marker.jpg",
        mimeType: "image/jpeg",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error specifies signature or structure mismatch");
    }
    endCase();

    startCase("Structural Failure: Truncated PNG (valid 8-byte PNG signature only, no IHDR chunk)");
    {
      const truncatedPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const res = await postUpload({
        buffer: truncatedPng,
        filename: "truncated_header.png",
        mimeType: "image/png",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error specifies signature or structure mismatch");
    }
    endCase();

    startCase("Structural Failure: Incomplete PNG (valid signature + IHDR, but truncated before IDAT and IEND)");
    {
      const fullPng = createValidPng();
      const incompletePng = fullPng.subarray(0, 33); // Signature (8) + IHDR chunk (25) only
      const res = await postUpload({
        buffer: incompletePng,
        filename: "missing_idat_iend.png",
        mimeType: "image/png",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error specifies signature or structure mismatch");
    }
    endCase();

    startCase("Structural Failure: Corrupted PNG (valid signature and structure, but corrupted chunk CRC32 checksum)");
    {
      const fullPng = createValidPng();
      const corruptedCrcPng = Buffer.from(fullPng);
      corruptedCrcPng[30] = (corruptedCrcPng[30] + 1) % 256; // Corrupt IHDR CRC byte
      const res = await postUpload({
        buffer: corruptedCrcPng,
        filename: "bad_crc.png",
        mimeType: "image/png",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error specifies signature or structure mismatch");
    }
    endCase();

    startCase("Structural Failure: Invalid PNG dimensions (valid PNG signature and IHDR, but width = 0)");
    {
      const ihdrData = Buffer.from([0, 0, 0, 0, 0, 0, 0, 1, 8, 2, 0, 0, 0]); // width=0, height=1
      const ihdrCrc = zlib.crc32(Buffer.concat([Buffer.from("IHDR"), ihdrData]));
      const invalidDimPng = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.from([0, 0, 0, 13]), Buffer.from("IHDR"), ihdrData,
        Buffer.from([ihdrCrc >> 24 & 0xff, ihdrCrc >> 16 & 0xff, ihdrCrc >> 8 & 0xff, ihdrCrc & 0xff]),
        Buffer.from([0, 0, 0, 0]), Buffer.from("IEND"), Buffer.from([0xae, 0x42, 0x60, 0x82]),
      ]);
      const res = await postUpload({
        buffer: invalidDimPng,
        filename: "zero_width.png",
        mimeType: "image/png",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
    }
    endCase();

    startCase("Structural Failure: Truncated WebP (valid 12-byte RIFF....WEBP signature only, no format chunk)");
    {
      const truncatedWebp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP")]);
      const res = await postUpload({
        buffer: truncatedWebp,
        filename: "truncated.webp",
        mimeType: "image/webp",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
    }
    endCase();

    startCase("Structural Failure: Incomplete WebP (valid RIFF/WEBP, but truncated VP8 chunk payload)");
    {
      const incompleteWebp = Buffer.concat([
        Buffer.from("RIFF"), Buffer.from([0x14, 0x00, 0x00, 0x00]),
        Buffer.from("WEBP"), Buffer.from("VP8 "),
        Buffer.from([0x04, 0x00, 0x00, 0x00]), // 4 bytes declared payload, but buffer truncated
        Buffer.from([0x10, 0x00]),
      ]);
      const res = await postUpload({
        buffer: incompleteWebp,
        filename: "truncated_vp8.webp",
        mimeType: "image/webp",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
    }
    endCase();

    startCase("Structural Failure: Corrupted WebP (valid RIFF/WEBP signature, but invalid format chunk FourCC 'FAIL')");
    {
      const corruptedWebp = Buffer.concat([
        Buffer.from("RIFF"), Buffer.from([0x20, 0x00, 0x00, 0x00]),
        Buffer.from("WEBP"), Buffer.from("FAIL"),
        Buffer.from([0x10, 0x00, 0x00, 0x00]),
        Buffer.alloc(16),
      ]);
      const res = await postUpload({
        buffer: corruptedWebp,
        filename: "bad_chunk.webp",
        mimeType: "image/webp",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
    }
    endCase();

    startCase("Structural Failure: Corrupted WebP (valid RIFF/WEBP and VP8 chunk, but invalid VP8 keyframe start code)");
    {
      const badCodeWebp = Buffer.concat([
        Buffer.from("RIFF"), Buffer.from([0x20, 0x00, 0x00, 0x00]),
        Buffer.from("WEBP"), Buffer.from("VP8 "),
        Buffer.from([0x0b, 0x00, 0x00, 0x00]),
        Buffer.from([0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00]), // Bad start code
      ]);
      const res = await postUpload({
        buffer: badCodeWebp,
        filename: "bad_startcode.webp",
        mimeType: "image/webp",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
    }
    endCase();

    startCase("Structural Failure: Plain ASCII text disguised as PNG");
    {
      const res = await postUpload({
        buffer: Buffer.from("Plain text content pretending to be an image file."),
        filename: "plain_text.png",
        mimeType: "image/png",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
    }
    endCase();

    startCase("Structural Failure: Polyglot SVG payload disguised as .jpg");
    {
      const polyglotBuffer = Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'><script>alert('xss')</script></svg>");
      const res = await postUpload({
        buffer: polyglotBuffer,
        filename: "polyglot.jpg",
        mimeType: "image/jpeg",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("signature or structure"), "Error identifies signature/structure mismatch");
    }
    endCase();

    // =========================================================================
    // GROUP 8: Authentication, Authorization & Security Limits
    // =========================================================================
    console.log("\n--- GROUP 8: Authentication, Authorization, & Security Limits ---");

    startCase("Auth Guard: Unauthenticated POST upload request without cookie");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "test.png",
        mimeType: "image/png",
        headers: {},
      });
      assert(res.status === 401, "Returns HTTP 401 Unauthorized");
      assert(res.data.error === "Unauthorized", "Error message is strictly 'Unauthorized'");
    }
    endCase();

    startCase("Auth Guard: Forged or invalid session token");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "test.png",
        mimeType: "image/png",
        headers: { Cookie: "admin_session=forged_session_token_xyz" },
      });
      assert(res.status === 401, "Returns HTTP 401 Unauthorized");
    }
    endCase();

    startCase("Role Guard: Authenticated user with non-admin role (viewer)");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "test.png",
        mimeType: "image/png",
        headers: { Cookie: "admin_session=non-admin-session" },
      });
      assert(res.status === 403, "Returns HTTP 403 Forbidden");
      assert(res.data.error?.includes("Admin access required"), "Error specifies admin access required");
    }
    endCase();

    startCase("Size Limit: Oversized file exceeding strict 5MB limit");
    {
      const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024);
      const res = await postUpload({
        buffer: oversizedBuffer,
        filename: "huge.png",
        mimeType: "image/png",
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("5MB"), "Error message references 5MB limit");
    }
    endCase();

    startCase("Resource Type: Arbitrary non-image resource_type (e.g. 'raw') blocked");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "test.png",
        mimeType: "image/png",
        extraFields: { resource_type: "raw" },
      });
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("resource types are forbidden"), "Error specifies only image uploads permitted");
    }
    endCase();

    startCase("Path Traversal Sanitization: Folder parameter containing traversal tokens (../../etc/passwd)");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "test.png",
        mimeType: "image/png",
        extraFields: { folder: "../../etc/passwd" },
      });
      assert(res.status === 200, "Upload proceeds with HTTP 200 after sanitization");
      assert(res.data.success === true, "Response returns success: true");
      assert(res.data.folder === "hipro_cms", "Sanitized folder value is strictly reset to 'hipro_cms'");
      assert(res.data.url?.includes("/hipro_cms/"), "Media destination URL resides strictly within '/hipro_cms/'");
      assert(!res.data.url?.includes(".."), "Media destination URL contains zero path traversal tokens ('..')");
      assert(!res.data.url?.includes("passwd"), "Media destination URL contains zero traversal target names");
    }
    endCase();

    startCase("Development Safety Guard: Prevents live Cloudinary uploads in non-production");
    {
      const res = await postUpload({
        buffer: createValidPng(),
        filename: "safety_test.png",
        mimeType: "image/png",
      });
      assert(res.status === 200, "Responds with HTTP 200");
      assert(res.data.isMock === true, "Confirms isMock flag is true");
      assert(!res.data.url?.includes("api.cloudinary.com"), "Never executes server-to-server POST to live Cloudinary API");
    }
    endCase();

    startCase("Empty Payload: Request submitted without a file");
    {
      const res = await postUpload({});
      assert(res.status === 400, "Rejected with HTTP 400");
      assert(res.data.error?.includes("No file provided"), "Error specifies no file provided");
    }
    endCase();

  } finally {
    server.close();
    (prisma.adminSession as any).findUnique = originalFindSession;
    (prisma.adminUser as any).findUnique = originalFindUser;
    (prisma.settings as any).findMany = originalFindSettings;
  }

  console.log(`\n================================================================================`);
  console.log(`SUMMARY: ${passedCases}/${totalCases} TEST CASES PASSED (${failedCases} FAILED)`);
  console.log(`ASSERTIONS: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED (${failedAssertions} FAILED)`);
  console.log(`================================================================================\n`);

  if (failedCases > 0 || failedAssertions > 0) {
    process.exit(1);
  }
}

runUploadHardeningSuite().catch((err) => {
  console.error("Test suite crashed:", err);
  process.exit(1);
});
