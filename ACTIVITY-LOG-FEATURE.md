# Activity Log Feature

## Overview
Real-time activity tracking displaying recent actions by users across the system.

## Files Created

1. **[app/api/activity/route.ts](app/api/activity/route.ts)** - API endpoint for fetching activity logs
2. **[components/dashboard/ActivityLog.tsx](components/dashboard/ActivityLog.tsx)** - Activity log display component

## Files Modified

1. **[app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx)** - Added activity log to admin dashboard
2. **[app/dashboard/page.tsx](app/dashboard/page.tsx)** - Added activity log to main dashboard

## Features

### 1. Real-Time Activity Feed
- Shows recent actions by users
- Auto-refreshes on page load
- Customizable limit (default: 10-15 items)

### 2. Activity Types Tracked
- ➕ **Created** - New entry created
- ✏️ **Updated** - Entry modified
- ✅ **Finalized** - Entry finalized
- 👍 **Approved** - Entry approved by admin
- ❌ **Rejected** - Entry rejected by admin
- 📤 **Submitted** - Entry submitted for approval

### 3. Activity Details
Each activity shows:
- **Icon** - Visual indicator of action type
- **Description** - "User Name action entry Name"
- **Timestamp** - Relative time (e.g., "5m ago", "2h ago")
- **Action badge** - Color-coded action type
- **Clickable links** - Click entry name to view/edit

### 4. Permission-Based Display
- **Admin/Approver**: See ALL system activity
- **Account Managers**: See only THEIR OWN activity

### 5. Smart Time Formatting
- Just now (< 1 minute)
- Xm ago (< 1 hour)
- Xh ago (< 1 day)
- Xd ago (< 1 week)
- Full date (> 1 week)

## Display Locations

### Main Dashboard
- **Location**: Bottom of main dashboard
- **Title**: "Your Recent Activity"
- **Limit**: 10 activities
- **Shows**: User's own actions

### Admin Dashboard
- **Location**: Bottom of admin panel
- **Title**: "Recent Activity"
- **Limit**: 15 activities
- **Shows**: All system activity

## How It Works

### Data Flow:
1. Component loads → Calls `/api/activity?limit=10`
2. API fetches audit logs from database
3. API enriches with entry details (company, country, segment)
4. Component displays formatted activities
5. User clicks entry link → Navigate to edit page

### API Endpoint:
```
GET /api/activity?limit=20
```

**Response:**
```json
[
  {
    "id": "log-123",
    "entityType": "Entry",
    "entityId": "entry-456",
    "action": "finalized",
    "changedBy": "user-789",
    "changedAt": "2026-07-16T10:30:00Z",
    "user": {
      "id": "user-789",
      "name": "Admin User",
      "email": "admin@foodbio.com"
    },
    "entityDetails": {
      "company": { "name": "Heineken" },
      "country": { "countryName": "Germany" },
      "segment": { "name": "Normal beer" },
      "status": "finalized",
      "approvalStatus": "pending"
    }
  }
]
```

## UI Design

### Activity Item Structure:
```
┌─────────────────────────────────────────────────────────┐
│ 🔵  Admin User finalized entry                    Updated│
│     Heineken - Germany - Normal beer                     │
│     5m ago                                               │
└─────────────────────────────────────────────────────────┘
```

### Color Coding:
- **Blue** - Created
- **Yellow** - Updated
- **Green** - Finalized/Approved
- **Red** - Rejected
- **Purple** - Submitted
- **Gray** - Other actions

## Database Schema Used

**AuditLog model:**
- `id` - Unique identifier
- `entityType` - Type of entity (Entry, User, etc.)
- `entityId` - ID of affected entity
- `action` - Action performed
- `changedBy` - User who performed action
- `changedAt` - Timestamp
- `user` - Relation to User model

## Examples

### Activity Descriptions:

1. **Entry Created:**
   > "Admin User created entry Heineken - Germany - Normal beer"

2. **Entry Updated:**
   > "Admin User updated entry Carlsberg - UK - Light beer"

3. **Entry Finalized:**
   > "Admin User finalized entry Anheuser-Busch - USA - Adjunct beer"

4. **Entry Approved:**
   > "Admin User approved entry Heineken - Germany - Normal beer"

5. **Entry Rejected:**
   > "Admin User rejected entry Carlsberg - UK - Light beer"

## Integration Points

### Audit Log Creation
Activity logs are automatically created when:
- New entry created (POST /api/entries)
- Entry updated (PUT /api/entries/[id])
- Entry approved/rejected (POST /api/admin/approvals/[id])

### Example audit log creation:
```typescript
await prisma.auditLog.create({
  data: {
    entityType: 'Entry',
    entityId: entry.id,
    action: 'finalized',
    changedBy: session.user.id,
    newValue: JSON.stringify({ status: 'finalized' }),
  },
})
```

## Performance

- **Query optimization**: Indexed on `changedAt` and `changedBy`
- **Limit parameter**: Prevents loading too much data
- **Efficient joins**: Includes only necessary related data
- **Client-side caching**: Component doesn't refetch on navigation

## Future Enhancements

### Potential improvements:
1. **Real-time updates** - WebSocket for live activity feed
2. **Filters** - Filter by action type, user, date range
3. **Export** - Download activity log as CSV
4. **Detailed view** - Click activity to see full change details
5. **Search** - Search activities by entry name, user
6. **Pagination** - Load more activities on scroll
7. **Activity graph** - Visual timeline of activities
8. **Notifications** - Alert users of relevant activities

## Testing

### Test Activity Log:
1. Log in as admin
2. Go to dashboard
3. Scroll down to "Your Recent Activity"
4. Should see your recent actions
5. Go to Admin Panel
6. Scroll down to "Recent Activity"
7. Should see all users' actions

### Test Activity Creation:
1. Create a new entry
2. Refresh dashboard
3. Should see "created entry" activity
4. Edit an entry
5. Should see "updated entry" activity
6. Finalize an entry
7. Should see "finalized entry" activity

### Test Links:
1. Click on an entry name in activity
2. Should navigate to edit page
3. Should load with entry data

## Troubleshooting

**No activities showing:**
- Check if any entries exist
- Check if audit logs are being created
- Check API response in browser console

**Wrong activities showing:**
- Admin should see all activities
- Users should only see their own
- Check session.user.role

**Timestamps wrong:**
- Check server timezone
- Check database timestamps
- formatTimeAgo function in component

## Security

✅ Permission checks in API route
✅ Users can only see their own activity (non-admin)
✅ No sensitive data exposed
✅ Proper session validation
