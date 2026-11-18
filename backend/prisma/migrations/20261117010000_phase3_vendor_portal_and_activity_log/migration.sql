-- Phase 3: Vendor Portal Authentication, Sessions, and Activity Audit Log
-- Additive migration for VendorAccount, VendorSession, and VendorActivityLog tables.
-- Strictly additive and non-destructive.

-- CreateTable
CREATE TABLE "VendorAccount" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_ACTIVATION',
    "activationToken" TEXT,
    "activationExpiry" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetExpiry" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorSession" (
    "id" TEXT NOT NULL,
    "vendorAccountId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorActivityLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "vendorAccountId" TEXT,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorAccount_applicationId_key" ON "VendorAccount"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorAccount_email_key" ON "VendorAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VendorAccount_activationToken_key" ON "VendorAccount"("activationToken");

-- CreateIndex
CREATE UNIQUE INDEX "VendorAccount_resetToken_key" ON "VendorAccount"("resetToken");

-- CreateIndex
CREATE INDEX "VendorAccount_email_idx" ON "VendorAccount"("email");

-- CreateIndex
CREATE INDEX "VendorAccount_status_idx" ON "VendorAccount"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSession_token_key" ON "VendorSession"("token");

-- CreateIndex
CREATE INDEX "VendorSession_token_idx" ON "VendorSession"("token");

-- CreateIndex
CREATE INDEX "VendorSession_vendorAccountId_idx" ON "VendorSession"("vendorAccountId");

-- CreateIndex
CREATE INDEX "VendorActivityLog_applicationId_idx" ON "VendorActivityLog"("applicationId");

-- CreateIndex
CREATE INDEX "VendorActivityLog_createdAt_idx" ON "VendorActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "VendorAccount" ADD CONSTRAINT "VendorAccount_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "VendorApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSession" ADD CONSTRAINT "VendorSession_vendorAccountId_fkey" FOREIGN KEY ("vendorAccountId") REFERENCES "VendorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorActivityLog" ADD CONSTRAINT "VendorActivityLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "VendorApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorActivityLog" ADD CONSTRAINT "VendorActivityLog_vendorAccountId_fkey" FOREIGN KEY ("vendorAccountId") REFERENCES "VendorAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

