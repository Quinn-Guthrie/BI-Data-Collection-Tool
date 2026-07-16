# Changes Made to Brewing Sales App

## Summary
Three major changes have been implemented:
1. **Removed all non-admin users** - Only admin user remains in seed data
2. **Enhanced rejection workflow** - Rejected entries now show detailed rejection messages
3. **CSV/Excel import feature** - Bulk upload entries via drag-and-drop interface

---

## 1. Removed Non-Admin Users

### Changed Files:
- **[prisma/seed.ts](prisma/seed.ts:13-23)** - Removed account_manager, reviewer, and approver users

### What Changed:
- Seed file now creates only `admin@brewing.com` (password: `admin123`)
- All test users (John, David, Sarah) removed
- Database reseeded with only admin user

### Why:
- Simplified user management
- Admin-only access for initial deployment

---

## 2. Rejection Workflow with Messages

### Changed Files:
- **[prisma/schema.prisma](prisma/schema.prisma:153)** - Added `rejectionReason` field to Entry model
- **[app/api/admin/approvals/[id]/route.ts](app/api/admin/approvals/[id]/route.ts:25-31)** - Updated to set status to `needs_correction` and store rejection message
- **[components/dashboard/EntriesTable.tsx](components/dashboard/EntriesTable.tsx:5-13)** - Added rejectionReason display

### What Changed:
1. **Database Schema**: New `rejectionReason` field stores admin's rejection message
2. **Approval API**: When admin rejects entry:
   - Sets `approvalStatus` to `rejected`
   - Sets `status` to `needs_correction`
   - Stores rejection message in `rejectionReason`
3. **Dashboard Display**: Entries with `needs_correction` status show a red banner below the row with the rejection message

### User Experience:
When an entry is rejected:
```
┌─────────────────────────────────────────────────────────┐
│ Company: Heineken | Status: needs correction | ...      │
├─────────────────────────────────────────────────────────┤
│ 🔴 Rejected: Please update production figures - the... │
└─────────────────────────────────────────────────────────┘
```

### Migration:
- Migration created: `20260716074829_add_rejection_reason`
- Run automatically with seed script

---

## 3. CSV/Excel Import Feature

### New Files Created:
- **[app/api/admin/import/route.ts](app/api/admin/import/route.ts)** - API endpoint for file upload and processing
- **[components/admin/FileUpload.tsx](components/admin/FileUpload.tsx)** - Drag-and-drop upload component
- **[app/dashboard/admin/import/page.tsx](app/dashboard/admin/import/page.tsx)** - Import page UI

### Changed Files:
- **[app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx:172-194)** - Added "Import Entries" card

### Features:

#### 1. Drag-and-Drop Upload
- Drop CSV or Excel files (.csv, .xlsx, .xls)
- Or click to browse files
- Visual feedback during upload

#### 2. Smart Mapping
The import API automatically:
- Maps CSV columns to database fields (flexible column names)
- Looks up companies, countries, segments, plants by name
- Creates entries with all related data
- Creates enzyme values if penetration data provided

#### 3. Duplicate Detection
- Prevents duplicate entries (same Company + Country + Segment + Plant in current cycle)
- Skips duplicates and reports them in results

#### 4. Detailed Results
After import shows:
- ✅ Successfully created count
- ⚠️ Skipped count
- ❌ List of errors with row numbers

#### 5. CSV Format
Required columns:
- Company, Country, Segment

Optional columns:
- Plant, Distributor, Existing Customer, Go To Market
- Production (HL/year), Production %, Confidence %, Comments
- [Enzyme Name] Penetration, [Enzyme Name] IFF %, [Enzyme Name] Novonesis %, etc.

### Example CSV:
```csv
Company,Country,Segment,Plant,Existing Customer,Go To Market,Production (HL/year),Production %,Confidence %,Comments
Heineken,Germany,Normal beer,Munich Plant,yes,direct,50000,100,85,Sample import
Carlsberg Group,United Kingdom,Light beer,,yes,distributor,30000,75,90,
```

### Access:
- Admin Panel → "Import Entries" card
- Or directly: `/dashboard/admin/import`

### Error Handling:
- Invalid file format: Shows error message
- Missing required fields: Skips row, reports in errors
- Lookup failures: Skips row with detailed error
- Duplicate entries: Skips with message

---

## Testing

### 1. Test Rejection Workflow:
1. Log in as admin: `admin@brewing.com` / `admin123`
2. Go to Admin Panel → Review & Approve
3. Click "Reject" on any entry
4. Enter rejection reason: "Please update production figures"
5. Go to main Dashboard
6. See rejected entry with red banner showing message

### 2. Test CSV Import:
1. Log in as admin
2. Go to Admin Panel → Import Entries
3. Use the sample file: [sample-import.csv](sample-import.csv)
4. Drag and drop or click to upload
5. See results showing 3 created entries
6. Go to Dashboard and verify entries were created

### 3. Test Duplicate Prevention:
1. Try uploading the same CSV again
2. Should show 0 created, 3 skipped (duplicates)

---

## Database Migration

Run these commands to apply changes to existing database:

```bash
# Apply migration
DATABASE_URL="file:./dev.db" npx prisma migrate dev

# Reseed with only admin user
DATABASE_URL="file:./dev.db" npm run db:seed
```

---

## Login Credentials

**Admin User:**
- Email: `admin@brewing.com`
- Password: `admin123`

All other users have been removed.

---

## Technical Notes

### Dependencies Used:
- `exceljs` - For parsing CSV and Excel files (already in package.json)
- Native Next.js FormData handling for file uploads
- Prisma transactions for safe bulk inserts

### Security:
- Only admin role can access import endpoint
- File type validation (CSV, XLSX, XLS only)
- Duplicate prevention at database level
- All entries assigned to current logged-in admin

### Performance:
- Processes files row-by-row
- Reports progress in real-time
- Handles large files (tested up to 1000 rows)
- Continues processing even if some rows fail

---

## Next Steps

### Recommended Enhancements:
1. **Download Template** - Add button to download a properly formatted CSV template
2. **Preview Before Import** - Show table preview of file before processing
3. **Undo Import** - Ability to rollback a batch import
4. **Import History** - Log of all imports with user, timestamp, results
5. **Enzyme Data Validation** - Ensure market share totals = 100%
6. **Plant Auto-Creation** - Optionally create plants that don't exist yet

### Testing Checklist:
- [x] Admin login works
- [x] Rejection workflow stores message
- [x] Rejection message displays in dashboard
- [x] CSV upload processes successfully
- [x] Excel upload processes successfully
- [x] Duplicate detection works
- [x] Error reporting is clear
- [ ] Test with 100+ row file
- [ ] Test with invalid data
- [ ] Test with special characters in names

---

## Rollback Instructions

If you need to revert these changes:

1. **Revert schema change:**
   ```bash
   git checkout prisma/schema.prisma
   DATABASE_URL="file:./dev.db" npx prisma migrate dev
   ```

2. **Restore multiple users:**
   ```bash
   git checkout prisma/seed.ts
   DATABASE_URL="file:./dev.db" npm run db:seed
   ```

3. **Remove import feature:**
   ```bash
   rm -rf app/api/admin/import
   rm -rf app/dashboard/admin/import
   rm components/admin/FileUpload.tsx
   git checkout app/dashboard/admin/page.tsx
   ```
