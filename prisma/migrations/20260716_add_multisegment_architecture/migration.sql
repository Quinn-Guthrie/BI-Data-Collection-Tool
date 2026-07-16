-- CreateTable: BusinessSegment
CREATE TABLE "BusinessSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable: UserSegment (Join Table)
CREATE TABLE "UserSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'account_manager',
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    CONSTRAINT "UserSegment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserSegment_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "BusinessSegment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Insert 4 Business Segments
INSERT INTO "BusinessSegment" ("id", "name", "slug", "description", "color", "active", "createdAt", "updatedAt") VALUES
  ('brewing_segment_id', 'Brewing', 'brewing', 'Beer and brewing sales data', '#3b82f6', true, datetime('now'), datetime('now')),
  ('bakery_segment_id', 'Bakery', 'bakery', 'Bakery and bread sales data', '#f59e0b', true, datetime('now'), datetime('now')),
  ('dairy_segment_id', 'Fresh Dairy', 'dairy', 'Fresh dairy products sales data', '#10b981', true, datetime('now'), datetime('now')),
  ('cheese_segment_id', 'Cheese', 'cheese', 'Cheese products sales data', '#f97316', true, datetime('now'), datetime('now'));

-- Add segmentId columns with temporary NULL allowed
ALTER TABLE "Cycle" ADD COLUMN "segmentId" TEXT;
ALTER TABLE "Entry" ADD COLUMN "businessSegmentId" TEXT;
ALTER TABLE "Segment" ADD COLUMN "businessSegmentId" TEXT;
ALTER TABLE "EnzymeCategory" ADD COLUMN "businessSegmentId" TEXT;

-- Migrate existing data to Brewing segment
UPDATE "Cycle" SET "segmentId" = 'brewing_segment_id';
UPDATE "Entry" SET "businessSegmentId" = 'brewing_segment_id';
UPDATE "Segment" SET "businessSegmentId" = 'brewing_segment_id';
UPDATE "EnzymeCategory" SET "businessSegmentId" = 'brewing_segment_id';

-- Create UserSegment records for existing admin user (give them access to Brewing)
INSERT INTO "UserSegment" ("id", "userId", "segmentId", "role", "assignedAt")
SELECT
  'userseg_' || "id",
  "id",
  'brewing_segment_id',
  'segment_admin',
  datetime('now')
FROM "User";

-- RedefineTables: Update User table
-- Drop old columns and update role enum
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'account_manager',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy data (map old admin role to super_admin)
INSERT INTO "new_User" SELECT
  "id",
  "email",
  "name",
  "password",
  CASE
    WHEN "role" = 'admin' THEN 'super_admin'
    WHEN "role" = 'reviewer' THEN 'account_manager'
    WHEN "role" = 'approver' THEN 'account_manager'
    ELSE 'account_manager'
  END as "role",
  "active",
  "createdAt",
  "updatedAt"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- Update Entry unique constraint to include businessSegmentId
DROP INDEX IF EXISTS "Entry_cycleId_companyId_countryId_segmentId_plantId_key";

-- RedefineTables: Update Entry table with new constraint
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessSegmentId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "sourceEntryId" TEXT,
    "accountManagerUserId" TEXT NOT NULL,
    "plantId" TEXT,
    "companyId" TEXT NOT NULL,
    "subregion" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "existingCustomer" TEXT NOT NULL,
    "goToMarket" TEXT NOT NULL,
    "distributorId" TEXT,
    "productionBeerHlYear" REAL,
    "segmentId" TEXT NOT NULL,
    "productionPercent" REAL,
    "confidencePercent" REAL,
    "comments" TEXT,
    "rejectionReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "finalizedAt" DATETIME,
    "submittedForApprovalAt" DATETIME,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    CONSTRAINT "Entry_businessSegmentId_fkey" FOREIGN KEY ("businessSegmentId") REFERENCES "BusinessSegment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_accountManagerUserId_fkey" FOREIGN KEY ("accountManagerUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entry_sourceEntryId_fkey" FOREIGN KEY ("sourceEntryId") REFERENCES "Entry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Entry" SELECT * FROM "Entry";
DROP TABLE "Entry";
ALTER TABLE "new_Entry" RENAME TO "Entry";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- RedefineTables: Update Cycle table
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Cycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "segmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "Cycle_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "BusinessSegment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Cycle_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Cycle" SELECT * FROM "Cycle";
DROP TABLE "Cycle";
ALTER TABLE "new_Cycle" RENAME TO "Cycle";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- RedefineTables: Update Segment table
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Segment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessSegmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "definition" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Segment_businessSegmentId_fkey" FOREIGN KEY ("businessSegmentId") REFERENCES "BusinessSegment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Segment" SELECT * FROM "Segment";
DROP TABLE "Segment";
ALTER TABLE "new_Segment" RENAME TO "Segment";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- RedefineTables: Update EnzymeCategory table
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_EnzymeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessSegmentId" TEXT,
    "name" TEXT NOT NULL,
    "productReference" TEXT,
    "helperText" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnzymeCategory_businessSegmentId_fkey" FOREIGN KEY ("businessSegmentId") REFERENCES "BusinessSegment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_EnzymeCategory" SELECT * FROM "EnzymeCategory";
DROP TABLE "EnzymeCategory";
ALTER TABLE "new_EnzymeCategory" RENAME TO "EnzymeCategory";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex: BusinessSegment
CREATE UNIQUE INDEX "BusinessSegment_name_key" ON "BusinessSegment"("name");
CREATE UNIQUE INDEX "BusinessSegment_slug_key" ON "BusinessSegment"("slug");
CREATE INDEX "BusinessSegment_slug_idx" ON "BusinessSegment"("slug");
CREATE INDEX "BusinessSegment_active_idx" ON "BusinessSegment"("active");

-- CreateIndex: UserSegment
CREATE UNIQUE INDEX "UserSegment_userId_segmentId_key" ON "UserSegment"("userId", "segmentId");
CREATE INDEX "UserSegment_userId_idx" ON "UserSegment"("userId");
CREATE INDEX "UserSegment_segmentId_idx" ON "UserSegment"("segmentId");

-- CreateIndex: User
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_active_idx" ON "User"("active");

-- CreateIndex: Entry
CREATE UNIQUE INDEX "Entry_cycleId_businessSegmentId_companyId_countryId_segmentId_plantId_key" ON "Entry"("cycleId", "businessSegmentId", "companyId", "countryId", "segmentId", "plantId");
CREATE INDEX "Entry_businessSegmentId_idx" ON "Entry"("businessSegmentId");
CREATE INDEX "Entry_status_idx" ON "Entry"("status");
CREATE INDEX "Entry_approvalStatus_idx" ON "Entry"("approvalStatus");
CREATE INDEX "Entry_accountManagerUserId_idx" ON "Entry"("accountManagerUserId");
CREATE INDEX "Entry_cycleId_idx" ON "Entry"("cycleId");

-- CreateIndex: Cycle
CREATE INDEX "Cycle_segmentId_idx" ON "Cycle"("segmentId");
CREATE INDEX "Cycle_status_idx" ON "Cycle"("status");
CREATE INDEX "Cycle_createdBy_idx" ON "Cycle"("createdBy");

-- CreateIndex: Segment
CREATE UNIQUE INDEX "Segment_businessSegmentId_name_key" ON "Segment"("businessSegmentId", "name");
CREATE INDEX "Segment_businessSegmentId_idx" ON "Segment"("businessSegmentId");
CREATE INDEX "Segment_active_idx" ON "Segment"("active");

-- CreateIndex: EnzymeCategory
CREATE UNIQUE INDEX "EnzymeCategory_businessSegmentId_name_key" ON "EnzymeCategory"("businessSegmentId", "name");
CREATE INDEX "EnzymeCategory_businessSegmentId_idx" ON "EnzymeCategory"("businessSegmentId");
CREATE INDEX "EnzymeCategory_sortOrder_idx" ON "EnzymeCategory"("sortOrder");
CREATE INDEX "EnzymeCategory_active_idx" ON "EnzymeCategory"("active");

-- CreateIndex: Company
CREATE INDEX "Company_active_idx" ON "Company"("active");

-- CreateIndex: Country
CREATE INDEX "Country_active_idx" ON "Country"("active");

-- CreateIndex: Plant
CREATE INDEX "Plant_countryId_idx" ON "Plant"("countryId");
CREATE INDEX "Plant_active_idx" ON "Plant"("active");

-- CreateIndex: Distributor
CREATE INDEX "Distributor_active_idx" ON "Distributor"("active");
