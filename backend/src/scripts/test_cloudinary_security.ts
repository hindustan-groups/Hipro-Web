import express, { Request as ExpressRequest, Response as ExpressResponse } from "express";
import cookieParser from "cookie-parser";
import http from "http";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/db";

// Mock Prisma lookups for settings, admin sessions, and admin users
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

// Express test app mounting actual routes
const app = express();
app.use(cookieParser());
app.use(express.json());

import settingsRouter from "../routes/settings";
import uploadRouter from "../routes/upload";

app.use("/api/settings", settingsRouter);
app.use("/api/upload", uploadRouter);

// Preserve original global fetch
const originalFetch = global.fetch;

async function runTests() {
  console.log("==================================================");
  console.log("   CLOUDINARY UPLOAD SECURITY REGRESSION SUITE    ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  // Start test server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // ----------------------------------------------------
    // TEST 1: Public GET /api/settings has NO cloudinaryUploadPreset
    // ----------------------------------------------------
    const settingsRes = await fetch(`${baseUrl}/api/settings`);
    const settingsData = (await settingsRes.json()) as any;

    assert(settingsRes.status === 200, "GET /api/settings responds with HTTP 200");
    assert(settingsData.success === true, "GET /api/settings returns success: true");
    assert(
      settingsData.data?.cloudinaryUploadPreset === undefined,
      "Public GET /api/settings NEVER exposes cloudinaryUploadPreset"
    );
    assert(
      settingsData.data?.companyEmail !== undefined,
      "Public GET /api/settings still exposes safe public contact info"
    );

    // ----------------------------------------------------
    // TEST 2: Unauthenticated POST /api/upload is REJECTED (401)
    // ----------------------------------------------------
    const unauthFormData = new FormData();
    const dummyBlob = new Blob(["dummy content"], { type: "image/png" });
    unauthFormData.append("file", dummyBlob, "test.png");

    const unauthRes = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: unauthFormData,
    });
    const unauthData = (await unauthRes.json()) as any;

    assert(
      unauthRes.status === 401,
      "Unauthenticated POST /api/upload returns HTTP 401 Unauthorized"
    );
    assert(
      unauthData.success === false && unauthData.error === "Unauthorized",
      "Unauthenticated upload response has error: 'Unauthorized'"
    );

    // ----------------------------------------------------
    // TEST 3: Invalid / Forged Session Token is REJECTED (401)
    // ----------------------------------------------------
    const invalidAuthRes = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: unauthFormData,
      headers: {
        Cookie: "admin_session=invalid_or_forged_session_token",
      },
    });

    assert(
      invalidAuthRes.status === 401,
      "Invalid session token is rejected with HTTP 401 Unauthorized"
    );

    // ----------------------------------------------------
    // TEST 4: Non-Admin Role User is REJECTED (403)
    // ----------------------------------------------------
    const nonAdminRes = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: unauthFormData,
      headers: {
        Cookie: "admin_session=non-admin-session",
      },
    });
    const nonAdminData = (await nonAdminRes.json()) as any;

    assert(
      nonAdminRes.status === 403,
      "Authenticated user with non-admin role is rejected with HTTP 403 Forbidden"
    );
    assert(
      nonAdminData.error?.includes("Admin access required"),
      "403 response specifies 'Admin access required'"
    );

    const adminHeaders = {
      Cookie: "admin_session=valid-admin-session",
    };

    // ----------------------------------------------------
    // TEST 5: Authenticated Admin Upload - Disallowed MIME type rejected (400)
    // ----------------------------------------------------
    const textFormData = new FormData();
    textFormData.append("file", new Blob(["echo hello"], { type: "text/plain" }), "script.txt");

    const textRes = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: textFormData,
      headers: adminHeaders,
    });
    const textData = (await textRes.json()) as any;

    assert(
      textRes.status === 400,
      "Authenticated admin upload with invalid MIME type returns HTTP 400 Bad Request"
    );
    assert(
      textData.error?.includes("Invalid") || textData.error?.includes("MIME"),
      "Error specifies invalid file extension or MIME type"
    );

    // ----------------------------------------------------
    // TEST 6: Authenticated Admin Upload - Dangerous executable rejected (400)
    // ----------------------------------------------------
    const exeFormData = new FormData();
    exeFormData.append("file", new Blob(["MZ...binary"], { type: "application/octet-stream" }), "malware.exe");

    const exeRes = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: exeFormData,
      headers: adminHeaders,
    });
    const exeData = (await exeRes.json()) as any;

    assert(
      exeRes.status === 400,
      "Executable (.exe) upload is strictly rejected with HTTP 400"
    );
    assert(
      exeData.error?.includes("prohibited") || exeData.error?.includes("Invalid"),
      "Error specifies executable files are prohibited"
    );

    // ----------------------------------------------------
    // TEST 7: Authenticated Admin Upload - Oversized file (>5MB) rejected (400)
    // ----------------------------------------------------
    const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024); // 5.5 MB
    const oversizedFormData = new FormData();
    oversizedFormData.append("file", new Blob([oversizedBuffer], { type: "image/png" }), "large.png");

    const oversizedRes = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: oversizedFormData,
      headers: adminHeaders,
    });
    const oversizedData = (await oversizedRes.json()) as any;

    assert(
      oversizedRes.status === 400,
      "Oversized file (>5MB) is rejected at the multipart layer with HTTP 400"
    );
    assert(
      oversizedData.error?.includes("5MB") || oversizedData.error?.includes("limit"),
      "Error message explicitly references 5MB limit"
    );

    // ----------------------------------------------------
    // TEST 8: Authenticated Admin Upload - Arbitrary resource_type rejected (400)
    // ----------------------------------------------------
    const validPngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
    ]);

    const arbitraryTypeFormData = new FormData();
    arbitraryTypeFormData.append("file", new Blob([validPngBuffer], { type: "image/png" }), "valid.png");
    arbitraryTypeFormData.append("resource_type", "raw");

    const arbitraryRes = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: arbitraryTypeFormData,
      headers: adminHeaders,
    });
    const arbitraryData = (await arbitraryRes.json()) as any;

    assert(
      arbitraryRes.status === 400,
      "Attempt to specify non-image resource_type (e.g. 'raw') is rejected with HTTP 400"
    );
    assert(
      arbitraryData.error?.includes("resource type") || arbitraryData.error?.includes("image"),
      "Error message specifies only image uploads are permitted"
    );

    // ----------------------------------------------------
    // TEST 9: Authenticated Admin Upload - Magic Bytes spoofing rejected (400)
    // ----------------------------------------------------
    const spoofedFormData = new FormData();
    spoofedFormData.append("file", new Blob(["NOT_A_REAL_PNG"], { type: "image/png" }), "fake.png");

    const spoofedRes = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: spoofedFormData,
      headers: adminHeaders,
    });
    const spoofedData = (await spoofedRes.json()) as any;

    assert(
      spoofedRes.status === 400,
      "File with .png extension but spoofed/invalid binary magic bytes is rejected with HTTP 400"
    );
    assert(
      spoofedData.error?.includes("signature") || spoofedData.error?.includes("format"),
      "Error specifies file content signature does not match"
    );

    // ----------------------------------------------------
    // TEST 10: Authenticated Admin Upload - Valid image succeeds (200)
    // ----------------------------------------------------
    // Intercept server-to-server Cloudinary fetch for this test
    (global as any).fetch = async (input: any, init?: any) => {
      const urlStr = typeof input === "string" ? input : input.toString();
      if (urlStr.includes("cloudinary.com")) {
        return {
          status: 200,
          json: async () => ({
            secure_url: "https://res.cloudinary.com/fczoredh/image/upload/v1234567890/hipro_cms/valid.png",
          }),
        };
      }
      return originalFetch(input, init);
    };

    const validFormData = new FormData();
    validFormData.append("file", new Blob([validPngBuffer], { type: "image/png" }), "valid.png");

    const validRes = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: validFormData,
      headers: adminHeaders,
    });
    const validData = (await validRes.json()) as any;

    assert(
      validRes.status === 200,
      "Authenticated admin upload with valid image returns HTTP 200"
    );
    assert(
      validData.success === true,
      "Upload response returns success: true"
    );
    assert(
      validData.url === "https://res.cloudinary.com/fczoredh/image/upload/v1234567890/hipro_cms/valid.png",
      "Upload response returns secure Cloudinary URL"
    );

    // Restore original fetch
    global.fetch = originalFetch;

    // ----------------------------------------------------
    // TEST 11: Code Consumer Integrity - FileUpload.tsx
    // ----------------------------------------------------
    const fileUploadPath = path.resolve(__dirname, "../../../frontend/components/FileUpload.tsx");
    const fileUploadSource = fs.readFileSync(fileUploadPath, "utf-8");
    assert(
      !fileUploadSource.includes("cloudinary.com"),
      "FileUpload.tsx has NO direct Cloudinary API calls"
    );
    assert(
      !fileUploadSource.includes("auto/upload"),
      "FileUpload.tsx has NO /auto/upload endpoints"
    );
    assert(
      !fileUploadSource.includes("cloudinaryUploadPreset"),
      "FileUpload.tsx does not request or use cloudinaryUploadPreset"
    );
    assert(
      fileUploadSource.includes("onChange"),
      "FileUpload.tsx preserves the onChange(url) contract for Careers modal"
    );

    // ----------------------------------------------------
    // TEST 12: Code Consumer Integrity - ImageUpload.tsx
    // ----------------------------------------------------
    const imageUploadPath = path.resolve(__dirname, "../../../frontend/components/admin/ImageUpload.tsx");
    const imageUploadSource = fs.readFileSync(imageUploadPath, "utf-8");
    assert(
      !imageUploadSource.includes("api.cloudinary.com"),
      "ImageUpload.tsx has NO direct browser calls to Cloudinary API"
    );
    assert(
      !imageUploadSource.includes("upload_preset"),
      "ImageUpload.tsx does NOT send upload_preset from the browser"
    );
    assert(
      imageUploadSource.includes('fetch("/api/upload"'),
      "ImageUpload.tsx uses secure backend endpoint /api/upload"
    );
    assert(
      imageUploadSource.includes('credentials: "include"'),
      "ImageUpload.tsx passes admin credentials with upload requests"
    );

    // ----------------------------------------------------
    // TEST 13: Code Consumer Integrity - MultiImageUpload.tsx
    // ----------------------------------------------------
    const multiUploadPath = path.resolve(__dirname, "../../../frontend/components/admin/MultiImageUpload.tsx");
    const multiUploadSource = fs.readFileSync(multiUploadPath, "utf-8");
    assert(
      !multiUploadSource.includes("api.cloudinary.com"),
      "MultiImageUpload.tsx has NO direct browser calls to Cloudinary API"
    );
    assert(
      !multiUploadSource.includes("upload_preset"),
      "MultiImageUpload.tsx does NOT send upload_preset from the browser"
    );
    assert(
      multiUploadSource.includes('fetch("/api/upload"'),
      "MultiImageUpload.tsx uses secure backend endpoint /api/upload"
    );

    // ----------------------------------------------------
    // TEST 14: CMS Consumer Integrity (About, Blogs, Projects)
    // ----------------------------------------------------
    const aboutAdmin = fs.readFileSync(
      path.resolve(__dirname, "../../../frontend/app/admin/about/page.tsx"),
      "utf-8"
    );
    const blogAdmin = fs.readFileSync(
      path.resolve(__dirname, "../../../frontend/app/admin/blogs/page.tsx"),
      "utf-8"
    );
    const projectAdmin = fs.readFileSync(
      path.resolve(__dirname, "../../../frontend/app/admin/projects/page.tsx"),
      "utf-8"
    );

    assert(
      aboutAdmin.includes("<ImageUpload"),
      "About CMS uses upgraded ImageUpload component for founder/content images"
    );
    assert(
      blogAdmin.includes("<ImageUpload"),
      "Blog CMS uses upgraded ImageUpload component for blog featured images"
    );
    assert(
      projectAdmin.includes("<ImageUpload") && projectAdmin.includes("<MultiImageUpload"),
      "Project CMS uses upgraded ImageUpload and MultiImageUpload components"
    );

    // ----------------------------------------------------
    // TEST 15: Route Architecture Rules
    // ----------------------------------------------------
    const uploadRoutePath = path.resolve(__dirname, "../routes/upload.ts");
    const uploadRouteSource = fs.readFileSync(uploadRoutePath, "utf-8");

    assert(
      uploadRouteSource.includes("MAX_FILE_SIZE = 5 * 1024 * 1024"),
      "Upload route strictly enforces MAX_FILE_SIZE = 5MB"
    );
    assert(
      uploadRouteSource.includes("adminGuard"),
      "Upload route strictly requires adminGuard"
    );
    assert(
      uploadRouteSource.includes("validateMagicBytes"),
      "Upload route performs magic bytes / file signature inspection"
    );
    assert(
      uploadRouteSource.includes('rawResourceType.toLowerCase().trim() !== "image"'),
      "Upload route rejects non-image resource types"
    );
    assert(
      uploadRouteSource.includes("CLOUDINARY_API_SECRET"),
      "Upload route supports authenticated/signed uploads with API key & secret"
    );
    assert(
      !uploadRouteSource.includes("auto/upload"),
      "Upload route never posts to /auto/upload"
    );

  } finally {
    server.close();
    global.fetch = originalFetch;
    (prisma.adminSession as any).findUnique = originalFindSession;
    (prisma.adminUser as any).findUnique = originalFindUser;
    (prisma.settings as any).findMany = originalFindSettings;
  }

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test suite crashed:", e);
  process.exit(1);
});
