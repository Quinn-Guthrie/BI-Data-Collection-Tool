-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'account_manager',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cycle" (
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

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryName" TEXT NOT NULL,
    "subregion" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "countryId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Plant_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessSegmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "definition" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Segment_businessSegmentId_fkey" FOREIGN KEY ("businessSegmentId") REFERENCES "BusinessSegment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Distributor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EnzymeCategory" (
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

-- CreateTable
CREATE TABLE "Entry" (
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

-- CreateTable
CREATE TABLE "EntryEnzymeValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "enzymeCategoryId" TEXT NOT NULL,
    "usageStatus" TEXT,
    "penetrationPercent" REAL,
    "iffMarketSharePercent" REAL,
    "novonesisMarketSharePercent" REAL,
    "dsmMarketSharePercent" REAL,
    "othersMarketSharePercent" REAL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    CONSTRAINT "EntryEnzymeValue_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntryEnzymeValue_enzymeCategoryId_fkey" FOREIGN KEY ("enzymeCategoryId") REFERENCES "EnzymeCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntryApproval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comments" TEXT,
    "approvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntryApproval_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntryApproval_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "AuditLog_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSegment_name_key" ON "BusinessSegment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSegment_slug_key" ON "BusinessSegment"("slug");

-- CreateIndex
CREATE INDEX "BusinessSegment_slug_idx" ON "BusinessSegment"("slug");

-- CreateIndex
CREATE INDEX "BusinessSegment_active_idx" ON "BusinessSegment"("active");

-- CreateIndex
CREATE INDEX "UserSegment_userId_idx" ON "UserSegment"("userId");

-- CreateIndex
CREATE INDEX "UserSegment_segmentId_idx" ON "UserSegment"("segmentId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSegment_userId_segmentId_key" ON "UserSegment"("userId", "segmentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_active_idx" ON "User"("active");

-- CreateIndex
CREATE INDEX "Cycle_segmentId_idx" ON "Cycle"("segmentId");

-- CreateIndex
CREATE INDEX "Cycle_status_idx" ON "Cycle"("status");

-- CreateIndex
CREATE INDEX "Cycle_createdBy_idx" ON "Cycle"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "Company_normalizedName_key" ON "Company"("normalizedName");

-- CreateIndex
CREATE INDEX "Company_active_idx" ON "Company"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Country_countryName_key" ON "Country"("countryName");

-- CreateIndex
CREATE INDEX "Country_active_idx" ON "Country"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_code_key" ON "Plant"("code");

-- CreateIndex
CREATE INDEX "Plant_countryId_idx" ON "Plant"("countryId");

-- CreateIndex
CREATE INDEX "Plant_active_idx" ON "Plant"("active");

-- CreateIndex
CREATE INDEX "Segment_businessSegmentId_idx" ON "Segment"("businessSegmentId");

-- CreateIndex
CREATE INDEX "Segment_active_idx" ON "Segment"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_businessSegmentId_name_key" ON "Segment"("businessSegmentId", "name");

-- CreateIndex
CREATE INDEX "Distributor_active_idx" ON "Distributor"("active");

-- CreateIndex
CREATE INDEX "EnzymeCategory_businessSegmentId_idx" ON "EnzymeCategory"("businessSegmentId");

-- CreateIndex
CREATE INDEX "EnzymeCategory_sortOrder_idx" ON "EnzymeCategory"("sortOrder");

-- CreateIndex
CREATE INDEX "EnzymeCategory_active_idx" ON "EnzymeCategory"("active");

-- CreateIndex
CREATE UNIQUE INDEX "EnzymeCategory_businessSegmentId_name_key" ON "EnzymeCategory"("businessSegmentId", "name");

-- CreateIndex
CREATE INDEX "Entry_businessSegmentId_idx" ON "Entry"("businessSegmentId");

-- CreateIndex
CREATE INDEX "Entry_status_idx" ON "Entry"("status");

-- CreateIndex
CREATE INDEX "Entry_approvalStatus_idx" ON "Entry"("approvalStatus");

-- CreateIndex
CREATE INDEX "Entry_accountManagerUserId_idx" ON "Entry"("accountManagerUserId");

-- CreateIndex
CREATE INDEX "Entry_cycleId_idx" ON "Entry"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_cycleId_businessSegmentId_companyId_countryId_segmentId_plantId_key" ON "Entry"("cycleId", "businessSegmentId", "companyId", "countryId", "segmentId", "plantId");

-- CreateIndex
CREATE INDEX "EntryEnzymeValue_entryId_idx" ON "EntryEnzymeValue"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "EntryEnzymeValue_entryId_enzymeCategoryId_key" ON "EntryEnzymeValue"("entryId", "enzymeCategoryId");

-- CreateIndex
CREATE INDEX "EntryApproval_entryId_idx" ON "EntryApproval"("entryId");

-- CreateIndex
CREATE INDEX "EntryApproval_approvedBy_idx" ON "EntryApproval"("approvedBy");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_changedAt_idx" ON "AuditLog"("changedAt");

-- CreateIndex
CREATE INDEX "AuditLog_changedBy_idx" ON "AuditLog"("changedBy");
