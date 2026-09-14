import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import { adminGuard } from "../middleware/authGuard";
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

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
]);

// Explicitly blocked dangerous extensions
const DANGEROUS_EXTENSIONS = [
  ".exe", ".sh", ".bat", ".cmd", ".php", ".phtml", ".pl", ".py",
  ".js", ".ts", ".html", ".htm", ".bin", ".dll", ".jar", ".msi",
  ".vbs", ".ps1", ".apk", ".cgi"
];

// Helper to inspect magic bytes / file signatures
function validateMagicBytes(buffer: Buffer, mimeType: string, extension: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (extension === ".jpg" || extension === ".jpeg" || mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (extension === ".png" || mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  // GIF: 47 49 46 38 ("GIF8")
  if (extension === ".gif" || mimeType === "image/gif") {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    );
  }

  // WebP: "RIFF" (0..3) and "WEBP" (8..11)
  if (extension === ".webp" || mimeType === "image/webp") {
    if (buffer.length < 12) return false;
    const riff = buffer.toString("ascii", 0, 4);
    const webp = buffer.toString("ascii", 8, 12);
    return riff === "RIFF" && webp === "WEBP";
  }

  // AVIF: check ftyp box at 4..12 contains avif or avis
  if (extension === ".avif" || mimeType === "image/avif") {
    if (buffer.length < 12) return false;
    const brand = buffer.toString("ascii", 4, 12);
    return brand.includes("avif") || brand.includes("avis");
  }

  // SVG: text containing <svg and not containing executable script tags
  if (extension === ".svg" || mimeType === "image/svg+xml") {
    const text = buffer.toString("utf-8", 0, Math.min(buffer.length, 4096)).toLowerCase();
    const hasSvgTag = text.includes("<svg");
    const hasScriptTag = text.includes("<script") || text.includes("javascript:") || text.includes("onload=") || text.includes("onerror=");
    return hasSvgTag && !hasScriptTag;
  }

  return false;
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

// POST /api/upload — Admin authenticated upload
router.post(
  "/",
  adminGuard,
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
          error: `Invalid file extension (${ext}). Allowed extensions: JPG, PNG, WebP, GIF, SVG, AVIF.`,
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

      // 5. Inspect Magic Bytes / Signature
      const isValidSignature = validateMagicBytes(file.buffer, mimeType, ext);
      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          error: "File content signature does not match a valid image format.",
        } as ApiResponse);
      }

      // 6. Sanitize folder path
      let folder = (req.body.folder || "hipro_cms").trim();
      // Allow only alphanumeric, dashes, underscores, and forward slashes (no path traversal ..)
      if (!/^[a-zA-Z0-9_\-\/]+$/.test(folder) || folder.includes("..")) {
        folder = "hipro_cms";
      }

      // 7. Cloudinary server-side credentials
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
