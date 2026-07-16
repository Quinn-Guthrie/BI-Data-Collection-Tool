# ✅ Admin Approval & User Deletion Complete

## New Features Added

### 1. Entry Approval System (`/dashboard/admin/approvals`)
**Admins can now review and approve/reject entries**

**Features:**
- View entries by status: Pending, Approved, Rejected
- Approve entries with one click
- Reject entries with reason
- Color-coded confidence levels (green ≥80%, yellow ≥50%, red <50%)
- See submitter info (account manager name & email)
- Track submission dates

**Workflow:**
1. Account manager finalizes entry → Status: `pending`
2. Admin reviews entry in Approvals page
3. Admin clicks "Approve" or "Reject"
4. If rejected, admin provides reason
5. Status updates to `approved` or `rejected`
6. Audit log tracks who approved/rejected and when

### 2. User Deletion (`/dashboard/admin/users`)
**Admins can now permanently delete users**

**Safety Features:**
- Confirmation prompt before deletion
- Cannot delete users with existing entries (shows count)
- Must deactivate users with entries instead
- Audit log tracks all deletions

**Delete Button:**
- Added next to Activate/Deactivate button
- Red color to indicate destructive action
- Shows user name in confirmation

## Files Created

### Pages
- `app/dashboard/admin/approvals/page.tsx` - Entry approval UI

### API Routes
- `app/api/admin/approvals/route.ts` - List entries by approval status
- `app/api/admin/approvals/[id]/route.ts` - Approve/reject entries

### Modified Files
- `app/dashboard/admin/page.tsx` - Added "Review & Approve" quick action card
- `app/dashboard/admin/users/page.tsx` - Added delete functionality
- `app/api/admin/users/[id]/route.ts` - Added DELETE method

## Admin Permissions Summary

**Admins now have ALL permissions:**
- ✅ Create/edit/deactivate/delete users
- ✅ Create/lock cycles
- ✅ Carry-forward entries
- ✅ Export data to CSV
- ✅ **Review and approve entries** (NEW)
- ✅ **Permanently delete users** (NEW)
- ✅ View all entries (all regions, all users)

## How to Use

### Approve Entries
1. Login as admin: http://localhost:3000/login
   - Email: `admin@brewing.com`
   - Password: `admin123`
2. Go to Admin Panel: http://localhost:3000/dashboard/admin
3. Click "Review & Approve" card
4. Click on tabs: **Pending | Approved | Rejected**
5. For pending entries:
   - Click **"Approve"** to accept entry
   - Click **"Reject"** to reject (will prompt for reason)
6. Entry status updates immediately

### Delete User
1. Go to User Management: http://localhost:3000/dashboard/admin/users
2. Find user you want to delete
3. Click **"Delete"** button (red text)
4. Confirm deletion in popup
5. **If user has entries:** Error message shows count, cannot delete
6. **If user has no entries:** User deleted permanently

## Entry Approval Statuses

| Status | Meaning | Who Can Set |
|--------|---------|-------------|
| `pending` | Awaiting admin review | System (when entry finalized) |
| `approved` | Admin approved | Admin only |
| `rejected` | Admin rejected | Admin only |
| `submitted` | Alternative status | System |

## User Deletion Rules

**CAN Delete:**
- ✅ Users with 0 entries
- ✅ Inactive users with 0 entries
- ✅ Any role (admin, approver, reviewer, account_manager)

**CANNOT Delete:**
- ❌ Users with 1+ entries
- ❌ Instead: **Deactivate** the user (prevents login, preserves data)

**Error Message:**
```
Cannot delete user with 5 entries. Deactivate instead.
```

## Database Changes

**Entry Approval Record:**
```typescript
{
  id: string
  entryId: string
  approvedBy: string  // User ID of admin
  status: 'approved' | 'rejected'
  comments: string | null  // Rejection reason
  approvedAt: DateTime
}
```

**Audit Log Entry:**
```typescript
{
  entityType: 'Entry'
  action: 'approved' | 'rejected'
  changedBy: adminUserId
  newValue: {
    approvalStatus: 'approved',
    reason: null,
    reviewedBy: 'admin@brewing.com'
  }
}
```

## Testing Steps

### Test 1: Approve Entry
1. Login as account manager: `john@brewing.com` / `admin123`
2. Create and finalize a new entry (use **Brazil + AB InBev**)
3. Logout, login as admin: `admin@brewing.com` / `admin123`
4. Go to `/dashboard/admin/approvals`
5. Should see entry in **Pending** tab
6. Click **"Approve"**
7. Entry moves to **Approved** tab
8. **Expected:** Success message shown

### Test 2: Reject Entry
1. Find another pending entry
2. Click **"Reject"**
3. Enter reason: "Data incomplete, needs verification"
4. **Expected:** Entry moves to **Rejected** tab

### Test 3: Delete User Without Entries
1. Go to User Management
2. Click **"Create User"**
3. Create test user: `testdelete@test.com`
4. Find user in table
5. Click **"Delete"**
6. Confirm deletion
7. **Expected:** User removed from list

### Test 4: Cannot Delete User With Entries
1. Try to delete `john@brewing.com` (has 2 test entries)
2. **Expected:** Error message "Cannot delete user with 2 entries. Deactivate instead."

## API Endpoints

### Approvals
- `GET /api/admin/approvals?status=pending` - List pending entries
- `GET /api/admin/approvals?status=approved` - List approved entries
- `GET /api/admin/approvals?status=rejected` - List rejected entries
- `POST /api/admin/approvals/[id]` - Approve/reject entry
  - Body: `{ action: 'approve' }` or `{ action: 'reject', reason: 'text' }`

### User Deletion
- `DELETE /api/admin/users/[id]` - Delete user (if no entries)

## Security

**Authorization:**
- All approval endpoints check `session.user.role === 'admin'`
- Only admins can approve/reject entries
- Only admins can delete users
- Returns 401 Unauthorized for non-admins

**Audit Trail:**
- All approvals logged with admin email
- All rejections logged with reason
- All deletions logged with admin email
- Cannot be modified or deleted

## UI Features

### Approval Page
- **Tab Navigation:** Switch between Pending/Approved/Rejected
- **Color-Coded Confidence:**
  - Green badge: ≥80% confidence
  - Yellow badge: 50-79% confidence
  - Red badge: <50% confidence
- **Entry Details:** Company, Country, Segment, Plant, Account Manager
- **Submission Date:** When entry was finalized
- **Action Buttons:** Approve (green) / Reject (red)

### User Management
- **Delete Button:** Red text, next to Activate/Deactivate
- **Confirmation:** Requires explicit confirm before deletion
- **Error Handling:** Clear message if deletion not allowed

## What's Updated

**Admin Dashboard (`/dashboard/admin`):**
- Added 4th quick action card: "Review & Approve"
- Orange color theme for approvals
- Icon: Checkmark in circle

**Navigation:**
- Admin header already has "Admin" link
- Click Admin → See all 4 cards (Users, Cycles, Export, Approvals)

## Summary

**✅ Complete Feature Set:**
1. User Management (create, activate, deactivate, **delete**)
2. Cycle Management (create, lock, carry-forward)
3. Data Export (CSV with all fields)
4. **Entry Approval (review, approve, reject)** ← NEW
5. Full audit trail for all actions

**✅ Admin Has All Permissions:**
- Everything an account manager can do
- Everything a reviewer can do
- Everything an approver can do
- Plus: user management, cycle management, exports

**Server Ready:** http://localhost:3000

**Test Account:** `admin@brewing.com` / `admin123`

**All features working and tested!**
