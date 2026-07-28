# Edit Entry Feature Added

## What Was Added

Full edit functionality for entries, including rejected entries.

## New Files Created

1. **[app/dashboard/entries/[id]/edit/page.tsx](app/dashboard/entries/[id]/edit/page.tsx)** - Edit entry page
2. **[app/api/entries/[id]/route.ts](app/api/entries/[id]/route.ts)** - API routes for GET and PUT operations on individual entries

## Modified Files

1. **[components/wizard/EntryWizard.tsx](components/wizard/EntryWizard.tsx)** - Added edit mode support
   - New props: `entryId`, `existingEntry`
   - Pre-populates wizard with existing data when editing
   - Uses PUT request for updates instead of POST

## Features

### 1. Edit Any Entry
- Click "Edit" button on any entry in the dashboard
- Opens the same 7-step wizard with pre-filled data
- All fields editable

### 2. Edit Rejected Entries
- Rejected entries show rejection reason at the top of edit page
- Red banner displays admin's rejection message
- User can fix issues and resubmit
- Rejection reason is cleared when entry is updated
- Approval status resets to "pending"

### 3. Permissions
- **Admin**: Can edit any entry
- **Account Managers**: Can only edit their own entries
- Unauthorized users redirected to dashboard

### 4. Data Preservation
- All existing data pre-populated in wizard
- Enzyme values loaded correctly
- Can navigate between steps without losing data

### 5. Validation
- Same validation rules as new entries
- Draft saves don't require complete data
- Finalization requires all required fields

## How It Works

### Edit Flow:
1. User clicks "Edit" on an entry in the dashboard
2. Page loads entry data from database
3. Wizard initializes with existing values
4. User can modify any step
5. Clicking "Save Draft" or "Finalize Entry" sends PUT request
6. Entry is updated (not duplicated)
7. User redirected to dashboard

### API Endpoints:
- **GET /api/entries/[id]** - Fetch single entry with all relations
- **PUT /api/entries/[id]** - Update existing entry

### Database Updates:
- Entry record updated
- Old enzyme values deleted, new ones created
- Rejection reason cleared
- Approval status reset to "pending"
- Audit log created for the update

## Rejection Workflow

When an entry is rejected:
1. Admin sets `approvalStatus: 'rejected'`
2. Admin sets `status: 'needs_correction'`
3. Admin provides `rejectionReason`

When user edits rejected entry:
1. Opens edit page with rejection banner
2. User fixes issues
3. Saves or finalizes entry
4. `rejectionReason` is cleared
5. `approvalStatus` resets to `pending`
6. Entry goes back for review

## Testing

### Test Edit Feature:
1. Log in as admin
2. Go to dashboard
3. Click "Edit" on any entry
4. Modify some fields
5. Click "Save Draft"
6. Verify changes saved

### Test Rejection Edit:
1. Admin rejects an entry with reason: "Fix production numbers"
2. User sees red banner with rejection reason
3. User edits entry and fixes issue
4. User finalizes entry
5. Entry goes back to pending approval

## Security

✅ Permission checks in place
✅ Only owner or admin can edit
✅ Session validation required
✅ Proper 401/403/404 responses

## Notes

- Enzyme values are completely replaced (delete old, create new)
- Audit log tracks all updates
- Duplicate entry check not needed for updates (same unique constraint)
- All wizard steps work identically in edit mode
