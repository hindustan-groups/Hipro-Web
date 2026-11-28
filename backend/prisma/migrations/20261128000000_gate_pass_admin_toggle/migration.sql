-- Add gatePassEnabled feature toggle to EmpanelmentContent (disabled by default)
ALTER TABLE "EmpanelmentContent" ADD COLUMN IF NOT EXISTS "gatePassEnabled" BOOLEAN NOT NULL DEFAULT false;
