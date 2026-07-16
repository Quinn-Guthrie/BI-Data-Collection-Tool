# Multi-Segment Migration Guide

## Overview

This guide walks through migrating from the single-segment (Brewing-only) app to the multi-segment architecture supporting Brewing, Bakery, Fresh Dairy, and Cheese.

**⚠️ IMPORTANT:** This is a breaking schema change. Back up your database first!

## Prerequisites

- ✅ Database backup created (`prisma/dev.db.backup`)
- ✅ Schema backup created (`prisma/schema.prisma.backup`)
- ✅ New schema ready (`prisma/schema-multisegment.prisma`)

## Migration Strategy

Because this is a complex migration with:
- New tables (BusinessSegment, UserSegment)
- Modified tables (User, Entry, Cycle, Segment, EnzymeCategory)
- Data migration (existing data → Brewing segment)
- Role changes (admin → super_admin)

We'll do it in **phases** rather than one big migration.

---

## Phase 1: Fresh Database Approach (RECOMMENDED)

The cleanest way is to start with a fresh database using the new schema.

### Step 1: Stop Dev Server
```bash
# Kill any running dev servers
taskkill /F /IM node.exe  # Windows
# OR
pkill -f "next dev"  # Mac/Linux
```

### Step 2: Create Fresh Database with New Schema
```bash
# Backup old database (already done)
cp prisma/dev.db prisma/dev-old.db

# Use new schema
cp prisma/schema-multisegment.prisma prisma/schema.prisma

# Delete old database to start fresh
rm prisma/dev.db
rm prisma/dev.db-journal  # if exists

# Create fresh database with new schema
DATABASE_URL="file:./dev.db" npx prisma migrate dev --name init_multisegment
```

### Step 3: Seed New Database
```bash
# Run seed script (will create segments + admin user)
npm run seed
```

### Step 4: Manually Recreate Test Data (Optional)
If you had test entries in the old database, you can:
- Use the CSV import feature to re-import them
- Or manually create a few test entries via the UI
- Or write a data migration script (see Phase 2)

### Step 5: Update Code
All existing code will continue to work because:
- Prisma client auto-generates from new schema
- We'll add segment filtering in Phase 2 (Backend)

---

## Phase 2: In-Place Migration (ADVANCED)

If you MUST keep existing data, here's the manual approach:

### Step 1: Add New Tables Only

Create a migration file:
```sql
-- prisma/migrations/20260716000000_add_segments/migration.sql

CREATE TABLE "BusinessSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "UserSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'account_manager',
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("segmentId") REFERENCES "BusinessSegment" ("id") ON DELETE CASCADE
);

-- Insert 4 segments
INSERT INTO "BusinessSegment" VALUES
  ('brewing_seg', 'Brewing', 'brewing', 'Beer sales', '#3b82f6', 1, datetime('now'), datetime('now')),
  ('bakery_seg', 'Bakery', 'bakery', 'Bakery sales', '#f59e0b', 1, datetime('now'), datetime('now')),
  ('dairy_seg', 'Fresh Dairy', 'dairy', 'Dairy sales', '#10b981', 1, datetime('now'), datetime('now')),
  ('cheese_seg', 'Cheese', 'cheese', 'Cheese sales', '#f97316', 1, datetime('now'), datetime('now'));

-- Grant existing users access to Brewing
INSERT INTO "UserSegment" ("id", "userId", "segmentId", "role", "assignedAt")
SELECT
  'userseg_' || id,
  id,
  'brewing_seg',
  'segment_admin',
  datetime('now')
FROM "User";
```

### Step 2: Add Nullable Foreign Keys

```sql
-- Add columns as nullable first
ALTER TABLE "Cycle" ADD COLUMN "segmentId" TEXT;
ALTER TABLE "Entry" ADD COLUMN "businessSegmentId" TEXT;
ALTER TABLE "Segment" ADD COLUMN "businessSegmentId" TEXT;
ALTER TABLE "EnzymeCategory" ADD COLUMN "businessSegmentId" TEXT;

-- Populate with Brewing segment
UPDATE "Cycle" SET "segmentId" = 'brewing_seg';
UPDATE "Entry" SET "businessSegmentId" = 'brewing_seg';
UPDATE "Segment" SET "businessSegmentId" = 'brewing_seg';
UPDATE "EnzymeCategory" SET "businessSegmentId" = 'brewing_seg';
```

### Step 3: Make Columns Required

This requires recreating tables in SQLite (no ALTER COLUMN support):

```sql
-- Example for Cycle table
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Cycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "segmentId" TEXT NOT NULL,  -- NOW REQUIRED
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    FOREIGN KEY ("segmentId") REFERENCES "BusinessSegment" ("id"),
    FOREIGN KEY ("createdBy") REFERENCES "User" ("id")
);

INSERT INTO "new_Cycle" SELECT * FROM "Cycle";
DROP TABLE "Cycle";
ALTER TABLE "new_Cycle" RENAME TO "Cycle";

PRAGMA foreign_keys=ON;
```

*Repeat for Entry, Segment, EnzymeCategory tables.*

### Step 4: Update User Table

```sql
-- Update role enum (admin → super_admin)
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'account_manager',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Map old roles to new
INSERT INTO "new_User" SELECT
  id, email, name, password,
  CASE role
    WHEN 'admin' THEN 'super_admin'
    ELSE 'account_manager'
  END,
  active, createdAt, updatedAt
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

PRAGMA foreign_keys=ON;
```

---

## Phase 3: Code Updates

After database migration, update code to use segments:

### 1. Update API Routes

Add segment filtering to all data queries:

```typescript
// app/api/entries/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const segmentId = req.headers.get('x-segment-id') // From UI

  const entries = await prisma.entry.findMany({
    where: {
      businessSegmentId: segmentId,  // NEW: Filter by segment
      // ... other filters
    }
  })
}
```

### 2. Add Segment Context Provider

```typescript
// components/SegmentContext.tsx
'use client'

import { createContext, useContext, useState } from 'react'

const SegmentContext = createContext<{
  currentSegment: string
  setSegment: (id: string) => void
}>({ currentSegment: '', setSegment: () => {} })

export function SegmentProvider({ children }: { children: React.ReactNode }) {
  const [currentSegment, setCurrentSegment] = useState('brewing_seg')

  return (
    <SegmentContext.Provider value={{ currentSegment, setSegment: setCurrentSegment }}>
      {children}
    </SegmentContext.Provider>
  )
}

export const useSegment = () => useContext(SegmentContext)
```

### 3. Add Segment Switcher Component

```typescript
// components/SegmentSwitcher.tsx
'use client'

import { useSegment } from './SegmentContext'

export function SegmentSwitcher({ segments }: { segments: BusinessSegment[] }) {
  const { currentSegment, setSegment } = useSegment()

  return (
    <select
      value={currentSegment}
      onChange={(e) => setSegment(e.target.value)}
      className="px-4 py-2 border rounded"
    >
      {segments.map((seg) => (
        <option key={seg.id} value={seg.id}>
          {seg.name}
        </option>
      ))}
    </select>
  )
}
```

### 4. Update Dashboard Layout

```typescript
// app/dashboard/layout.tsx
import { SegmentProvider } from '@/components/SegmentContext'
import { SegmentSwitcher } from '@/components/SegmentSwitcher'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const segments = await prisma.businessSegment.findMany({ where: { active: true } })

  return (
    <SegmentProvider>
      <div>
        <header>
          <SegmentSwitcher segments={segments} />
        </header>
        {children}
      </div>
    </SegmentProvider>
  )
}
```

---

## Verification Checklist

After migration, verify:

- [ ] Database has 4 BusinessSegment records
- [ ] All users have UserSegment records (link to Brewing)
- [ ] Admin user has role = 'super_admin'
- [ ] All existing entries have businessSegmentId = 'brewing_seg'
- [ ] All cycles have segmentId = 'brewing_seg'
- [ ] Segment switcher appears in UI
- [ ] Can create new entry (assigns to current segment)
- [ ] Switching segments filters dashboard data
- [ ] Super admin can see all segments
- [ ] Regular users only see their assigned segments

---

## Rollback Plan

If migration fails:

```bash
# Stop dev server
pkill -f "next dev"

# Restore backups
cp prisma/dev.db.backup prisma/dev.db
cp prisma/schema.prisma.backup prisma/schema.prisma

# Regenerate Prisma client
npx prisma generate

# Restart dev server
npm run dev
```

---

## Recommended Approach

**For Development:** Use **Phase 1 (Fresh Database)**
- Fastest and cleanest
- No risk of migration errors
- Can recreate test data easily

**For Production:** Use **Phase 2 (In-Place)** + Professional DBA Review
- Preserves all existing data
- Test on staging environment first
- Consider downtime window

---

## Next Steps After Migration

1. ✅ Test basic functionality (login, dashboard, create entry)
2. ✅ Build segment management UI (`/dashboard/admin/segments`)
3. ✅ Add user-segment assignment UI
4. ✅ Implement segment switcher
5. ✅ Add segment filtering to all API routes
6. ✅ Test multi-segment workflows
7. ✅ Create segment-specific lookups (enzyme categories for Bakery, Dairy, Cheese)
8. ✅ Update signup flow with segment selection
9. ✅ Add segment context to activity logs
10. ✅ Build cross-segment reporting (super admin only)

---

## Need Help?

Check these files:
- [MULTI-SEGMENT-ARCHITECTURE.md](MULTI-SEGMENT-ARCHITECTURE.md) - Full architecture plan
- [CLAUDE.md](CLAUDE.md) - Project documentation
- Prisma docs: https://www.prisma.io/docs/concepts/components/prisma-migrate
