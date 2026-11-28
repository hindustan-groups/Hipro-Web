-- Add Mobile OTP verification, Work Experience/Scale, and Aadhaar Front/Back URLs to VendorApplication
ALTER TABLE "VendorApplication"
  ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "experienceYears" TEXT,
  ADD COLUMN IF NOT EXISTS "projectScale" TEXT,
  ADD COLUMN IF NOT EXISTS "aadharFrontUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "aadharBackUrl" TEXT;
