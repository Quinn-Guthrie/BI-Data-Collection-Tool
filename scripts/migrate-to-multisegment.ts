import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting Multi-Segment Migration...\n')

  // This script will be run AFTER manually updating the schema
  // For now, just generate SQL commands to execute manually

  console.log('📋 Multi-Segment Migration SQL Commands:')
  console.log('=' . repeat(60))
  console.log(`
-- Step 1: Create BusinessSegment table
CREATE TABLE IF NOT EXISTS "BusinessSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Step 2: Insert 4 business segments
INSERT OR IGNORE INTO "BusinessSegment" ("id", "name", "slug", "description", "color", "createdAt", "updatedAt") VALUES
  ('brewing_seg', 'Brewing', 'brewing', 'Beer and brewing sales data', '#3b82f6', datetime('now'), datetime('now')),
  ('bakery_seg', 'Bakery', 'bakery', 'Bakery and bread sales data', '#f59e0b', datetime('now'), datetime('now')),
  ('dairy_seg', 'Fresh Dairy', 'dairy', 'Fresh dairy products', '#10b981', datetime('now'), datetime('now')),
  ('cheese_seg', 'Cheese', 'cheese', 'Cheese products', '#f97316', datetime('now'), datetime('now'));

-- Step 3: Create UserSegment join table
CREATE TABLE IF NOT EXISTS "UserSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'account_manager',
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    CONSTRAINT "UserSegment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "UserSegment_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "BusinessSegment" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserSegment_userId_segmentId_key" ON "UserSegment"("userId", "segmentId");

-- Step 4: Grant all existing users access to Brewing segment as segment_admin
INSERT OR IGNORE INTO "UserSegment" ("id", "userId", "segmentId", "role", "assignedAt")
SELECT
  'userseg_' || u."id",
  u."id",
  'brewing_seg',
  CASE WHEN u."role" = 'admin' THEN 'segment_admin' ELSE 'account_manager' END,
  datetime('now')
FROM "User" u;

-- Done! Now update your schema.prisma file and run: npx prisma db pull
`)

  console.log('=' . repeat(60))
  console.log('\n✅ SQL commands generated!')
  console.log('\n📝 Next Steps:')
  console.log('1. Copy SQL commands above')
  console.log('2. Run them against your database')
  console.log('3. Update prisma/schema.prisma with new multi-segment schema')
  console.log('4. Run: npx prisma generate')
  console.log('5. Update code to use new schema')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
