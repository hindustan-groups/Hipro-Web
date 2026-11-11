import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import zlib from "zlib";
import { requirePermission } from "../middleware/authGuard";
import { findAll } from "../lib/db";
import type { Settings, ApiResponse } from "../lib/types";

const router = Router();

// Configure multer with memory storage and strict 5MB limit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// Allowed MIME types and extensions (strictly restricted to JPEG, PNG, and WebP)
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

// Mapping of allowed extension to valid MIME types
const EXTENSION_MIME_MAP: Record<string, string[]> = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
};

// Explicitly blocked dangerous extensions
const DANGEROUS_EXTENSIONS = [
  ".exe", ".sh", ".bat", ".cmd", ".php", ".phtml", ".pl", ".py",
  ".js", ".ts", ".html", ".htm", ".bin", ".dll", ".jar", ".msi",
  ".vbs", ".ps1", ".apk", ".cgi"
];

// Helper to detect actual image format from raw magic bytes
function detectImageFormatFromMagicBytes(buffer: Buffer): "jpeg" | "png" | "webp" | null {
  if (buffer.length < 3) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  // WebP: "RIFF" (0..3) and "WEBP" (8..11)
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

// Structural validator for JPEG files: validates markers, segment lengths, SOF dimensions, and EOI
function validateJpegStructure(buffer: Buffer): boolean {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return false;

  let offset = 2;
  let hasSof = false;
  let hasEoi = false;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }
    while (offset < buffer.length && buffer[offset] === 0xff) {
      offset++;
    }
    if (offset >= buffer.length) break;

    const marker = buffer[offset++];

    if (marker === 0xd9) {
      hasEoi = true;
      break;
    }

    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01 || marker === 0x00) {
      continue;
    }

    if (offset + 2 > buffer.length) return false;
    const markerLen = buffer.readUInt16BE(offset);
    if (markerLen < 2 || offset + markerLen > buffer.length) return false;

    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isSof && markerLen >= 7) {
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      if (width > 0 && height > 0) {
        hasSof = true;
      }
    }

    offset += markerLen;
  }

  return hasSof && hasEoi;
}

// Structural validator for PNG files: validates chunk stream, IHDR dimensions, CRC32, IDAT, and IEND
function validatePngStructure(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;
  const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== pngSig[i]) return false;
  }

  let offset = 8;
  let hasIhdr = false;
  let hasIdat = false;
  let hasIend = false;

  while (offset + 12 <= buffer.length) {
    const chunkDataLen = buffer.readUInt32BE(offset);
    const chunkType = buffer.toString("ascii", offset + 4, offset + 8);
    const totalChunkLen = 12 + chunkDataLen;

    if (offset + totalChunkLen > buffer.length) return false;

    const expectedCrc = buffer.readUInt32BE(offset + 8 + chunkDataLen);
    const actualCrc = zlib.crc32(buffer.subarray(offset + 4, offset + 8 + chunkDataLen));
    if (expectedCrc !== actualCrc) return false;

    if (!hasIhdr) {
      if (chunkType !== "IHDR" || chunkDataLen !== 13) return false;
      const width = buffer.readUInt32BE(offset + 8);
      const height = buffer.readUInt32BE(offset + 12);
      if (width === 0 || height === 0) return false;
      hasIhdr = true;
    } else if (chunkType === "IDAT") {
      hasIdat = true;
    } else if (chunkType === "IEND") {
      if (chunkDataLen !== 0) return false;
      hasIend = true;
      break;
    }

    offset += totalChunkLen;
  }

  return hasIhdr && hasIdat && hasIend;
}

// Structural validator for WebP files: validates RIFF envelope, format chunk, dimensions, and chunk bounds
function validateWebpStructure(buffer: Buffer): boolean {
  if (buffer.length < 26) return false;
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return false;
  }

  const riffSize = buffer.readUInt32LE(4);
  if (buffer.length < riffSize + 8 && buffer.length < riffSize + 7) return false;

  const fourcc = buffer.toString("ascii", 12, 16);
  const chunkSize = buffer.readUInt32LE(16);
  if (20 + chunkSize > buffer.length + 1) return false;

  if (fourcc === "VP8 ") {
    if (chunkSize < 10) return false;
    const frameTag = buffer[20] | (buffer[21] << 8) | (buffer[22] << 16);
    const keyFrame = (frameTag & 1) === 0;
    if (!keyFrame) return false;
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) return false;
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return width > 0 && height > 0;
  } else if (fourcc === "VP8L") {
    if (chunkSize < 5) return false;
    if (buffer[20] !== 0x2f) return false;
    const b1 = buffer[21], b2 = buffer[22], b3 = buffer[23], b4 = buffer[24];
    const width = (b1 | ((b2 & 0x3f) << 8)) + 1;
    const height = (((b2 >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10))) + 1;
    return width > 0 && height > 0;
  } else if (fourcc === "VP8X") {
    if (chunkSize < 10) return false;
    const canvasWidth = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
    const canvasHeight = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
    return canvasWidth > 0 && canvasHeight > 0;
  }

  return false;
}

// Master image signature and structural validator
function validateImageStructure(buffer: Buffer, mimeType: string, extension: string): boolean {
  if (buffer.length < 4) return false;

  const detected = detectImageFormatFromMagicBytes(buffer);
  if (!detected) return false;

  const isJpeg = (extension === ".jpg" || extension === ".jpeg") && mimeType === "image/jpeg";
  const isPng = extension === ".png" && mimeType === "image/png";
  const isWebp = extension === ".webp" && mimeType === "image/webp";

  if (detected === "jpeg" && isJpeg) {
    return validateJpegStructure(buffer);
  }
  if (detected === "png" && isPng) {
    return validatePngStructure(buffer);
  }
  if (detected === "webp" && isWebp) {
    return validateWebpStructure(buffer);
  }

  return false;
}

// Helper to inspect magic bytes / file signatures against expected MIME and extension
function validateMagicBytes(buffer: Buffer, mimeType: string, extension: string): boolean {
  return validateImageStructure(buffer, mimeType, extension);
}

// Multer error handling wrapper middleware
function multerUploadMiddleware(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: "File size exceeds the 5MB maximum limit.",
          } as ApiResponse);
        }
        return res.status(400).json({
          success: false,
          error: "Multipart upload error: " + err.message,
        } as ApiResponse);
      }
      return res.status(400).json({
        success: false,
        error: "Failed to parse upload request.",
      } as ApiResponse);
    }
    next();
  });
}

// POST /api/upload — Admin/Staff authenticated upload with content or upload permission
router.post(
  "/",
  requirePermission(["upload", "projects", "blogs", "services", "about", "team", "testimonials", "hero", "hbs"]),
  multerUploadMiddleware,
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No file provided for upload.",
        } as ApiResponse);
      }

      // 1. Strict Resource Type Enforcement: only image is allowed
      const rawResourceType = req.body.resource_type;
      if (rawResourceType && rawResourceType.toLowerCase().trim() !== "image") {
        return res.status(400).json({
          success: false,
          error: "Arbitrary resource types are forbidden. Only image uploads are permitted.",
        } as ApiResponse);
      }

      // 2. Validate file size explicitly
      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          error: "File size exceeds the 5MB limit.",
        } as ApiResponse);
      }

      // 3. Validate filename & extension
      const originalName = file.originalname || "image.jpg";
      const ext = path.extname(originalName).toLowerCase();

      // Check dangerous extensions
      const lowerName = originalName.toLowerCase();
      for (const dangerous of DANGEROUS_EXTENSIONS) {
        if (lowerName.endsWith(dangerous)) {
          return res.status(400).json({
            success: false,
            error: "Executable or script file types are strictly prohibited.",
          } as ApiResponse);
        }
      }

      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return res.status(400).json({
          success: false,
          error: `Invalid file extension (${ext}). Allowed extensions: JPG, JPEG, PNG, WebP.`,
        } as ApiResponse);
      }

      // 4. Validate MIME type
      const mimeType = (file.mimetype || "").toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid MIME type (${mimeType}). Only image files are allowed.`,
        } as ApiResponse);
      }

      // 5. Enforce consistent Extension <-> MIME type pairing
      const validMimes = EXTENSION_MIME_MAP[ext];
      if (!validMimes || !validMimes.includes(mimeType)) {
        return res.status(400).json({
          success: false,
          error: `MIME type (${mimeType}) does not match the file extension (${ext}).`,
        } as ApiResponse);
      }

      // 6. Inspect Magic Bytes / Signature
      const isValidSignature = validateImageStructure(file.buffer, mimeType, ext);
      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          error: "File content signature or structure does not match a valid image format.",
        } as ApiResponse);
      }

      // 6. Sanitize folder path
      let folder = (req.body.folder || "hipro_cms").trim();
      // Allow only alphanumeric, dashes, underscores, and forward slashes (no path traversal ..)
      if (!/^[a-zA-Z0-9_\-\/]+$/.test(folder) || folder.includes("..")) {
        folder = "hipro_cms";
      }

      // 8. Cloudinary server-side credentials
      let dbSettings: Partial<Settings> = {};
      try {
        const settingsList = await findAll<Settings>("settings");
        if (settingsList && settingsList.length > 0) {
          dbSettings = settingsList[0];
        }
      } catch {
        // Fall back gracefully to environment variables if DB is unavailable
      }

      const cloudName =
        process.env.CLOUDINARY_CLOUD_NAME ||
        dbSettings.cloudinaryCloudName ||
        "fczoredh";

      // ============================================================
      // DEVELOPMENT SAFETY GUARD: Cloudinary Asset Isolation
      // ============================================================
      const isDev = process.env.NODE_ENV !== "production";
      const allowDevUploads = process.env.ALLOW_DEV_CLOUDINARY_UPLOADS === "true";

      // In development mode, strictly intercept and isolate media uploads:
      // 1. Refuse to write to the production account ("fczoredh") under any circumstance in dev.
      // 2. Unless an isolated dev cloud is explicitly configured and ALLOW_DEV_CLOUDINARY_UPLOADS=true,
      //    return a deterministic mock media URL.
      if (isDev && (!allowDevUploads || cloudName === "fczoredh")) {
        console.log(
          `[DEV MEDIA INTERCEPTED] Cloudinary live upload blocked in development.\n` +
          `  ├── File: ${originalName} (${mimeType}, ${file.buffer.length} bytes)\n` +
          `  ├── Cloud: ${cloudName} (Protected)\n` +
          `  ├── Folder: ${folder}\n` +
          `  └── Guard: Production media protection active. Using local mock asset.`
        );

        const mockHash = crypto.createHash("md5").update(file.buffer).digest("hex").substring(0, 10);
        const mockUrl = `https://res.cloudinary.com/hipro-dev-isolated/image/upload/v1/${folder}/${mockHash}_${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

        return res.json({
          success: true,
          url: mockUrl,
          folder,
          isMock: true,
          message: "Development safety guard: live Cloudinary upload blocked. Using isolated mock asset.",
        });
      }

      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      const uploadPreset =
        process.env.CLOUDINARY_UPLOAD_PRESET ||
        dbSettings.cloudinaryUploadPreset;

      // Fail safely if no Cloudinary configuration exists on server
      if (!cloudName || (!apiSecret && !uploadPreset)) {
        console.error("[Upload] Secure Cloudinary credentials not configured on server.");
        return res.status(500).json({
          success: false,
          error: "Cloudinary upload service is not configured on the server.",
        } as ApiResponse);
      }

      // Build FormData for server-to-server Cloudinary POST
      const cloudinaryFormData = new FormData();
      const blob = new Blob([file.buffer], { type: mimeType });
      cloudinaryFormData.append("file", blob, originalName);
      cloudinaryFormData.append("folder", folder);

      if (apiKey && apiSecret) {
        // Option A: Authenticated signed upload using API Key and Secret
        const timestamp = Math.floor(Date.now() / 1000).toString();
        cloudinaryFormData.append("timestamp", timestamp);
        cloudinaryFormData.append("api_key", apiKey);

        // Compute signature: sorted query parameters + apiSecret
        // Key sorted order: folder, timestamp
        const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(toSign).digest("hex");
        cloudinaryFormData.append("signature", signature);
      } else if (uploadPreset) {
        // Option B: Server-side preset upload (preset never exposed to browser)
        cloudinaryFormData.append("upload_preset", uploadPreset);
      }

      // Upload server-to-server strictly to /image/upload
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const cloudRes = await fetch(cloudinaryUrl, {
        method: "POST",
        body: cloudinaryFormData,
      });

      const cloudData = (await cloudRes.json()) as any;

      if (cloudData && cloudData.secure_url) {
        return res.json({
          success: true,
          url: cloudData.secure_url,
          folder,
        });
      } else {
        const errorMsg = cloudData?.error?.message || "Cloudinary upload failed";
        console.error("[Upload] Cloudinary upload error:", errorMsg);
        return res.status(500).json({
          success: false,
          error: "Failed to upload image to media storage.",
        } as ApiResponse);
      }
    } catch (err) {
      console.error("[Upload] Unexpected error during upload processing");
      return res.status(500).json({
        success: false,
        error: "Internal server error during upload processing.",
      } as ApiResponse);
    }
  }
);

export default router;
