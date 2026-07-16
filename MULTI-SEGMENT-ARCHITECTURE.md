# Multi-Segment Architecture Plan

## Overview
Transform the brewing-only app into a multi-segment platform supporting:
- **Brewing** (existing)
- **Bakery** (new)
- **Fresh Dairy** (new)
- **Cheese** (new)

## User Access Model

### User Types:
1. **Super Admin** (1 user)
   - Access to ALL segments
   - Can promote users to segment admins
   - Manages global settings
   - Current `admin@brewing.com` becomes super admin

2. **Segment Admin** (multiple per segment)
   - Full admin rights within their segment(s)
   - Can manage users in their segment
   - Can approve/reject entries in their segment
   - Can be admin of multiple segments

3. **Account Manager** (regular users)
   - Access to one or more segments
   - Create/edit entries in their segments
   - View only their own data per segment

### Access Logic:
- Users select segments during signup (multi-select)
- Users can be granted access to more segments later by admins
- Each segment has isolated data (entries, lookups, cycles)
- Users see a segment switcher in the UI
- Admin sees "All Segments" option

## Database Schema Changes

### New Tables:

#### BusinessSegment
```prisma
model BusinessSegment {
  id          String   @id @default(cuid())
  name        String   @unique // "Brewing", "Bakery", "Fresh Dairy", "Cheese"
  slug        String   @unique // "brewing", "bakery", "dairy", "cheese"
  description String?
  active      Boolean  @default(true)
  color       String   @default("#3b82f6") // Brand color for UI
  createdAt   DateTime @default(now())
  
  // Relations
  userSegments    UserSegment[]
  cycles          Cycle[]
  entries         Entry[]
  enzymeCategories EnzymeCategory[]
  // ... other segment-specific data
}
```

#### UserSegment (Join Table)
```prisma
model UserSegment {
  id              String   @id @default(cuid())
  userId          String
  segmentId       String
  role            SegmentRole @default(account_manager) // account_manager, segment_admin
  assignedAt      DateTime @default(now())
  
  user    User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  segment BusinessSegment @relation(fields: [segmentId], references: [id], onDelete: Cascade)
  
  @@unique([userId, segmentId])
}

enum SegmentRole {
  account_manager
  segment_admin
}
```

### Modified Tables:

#### User
```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  name     String
  password String
  role     UserRole @default(account_manager) // Add super_admin
  active   Boolean  @default(true)
  
  // Remove region/subregion (now segment-specific)
  userSegments UserSegment[]
  entries      Entry[]
}

enum UserRole {
  super_admin      // NEW: Can do anything
  account_manager  // Regular user
}
```

#### Entry (Add segment)
```prisma
model Entry {
  // ... existing fields
  segmentId String
  segment   BusinessSegment @relation(fields: [segmentId], references: [id])
  
  // Unique constraint updated
  @@unique([cycleId, segmentId, companyId, countryId, plantId])
}
```

#### Cycle (Add segment)
```prisma
model Cycle {
  id        String @id @default(cuid())
  segmentId String
  segment   BusinessSegment @relation(fields: [segmentId], references: [id])
  // ... existing fields
}
```

#### EnzymeCategory (Add segment)
```prisma
model EnzymeCategory {
  id        String @id @default(cuid())
  segmentId String?  // NULL = shared across all segments
  segment   BusinessSegment? @relation(fields: [segmentId], references: [id])
  // ... existing fields
}
```

## UI Changes

### Navigation:
1. **Segment Switcher** (top-right)
   - Dropdown showing available segments
   - Current segment highlighted
   - Quick switch between segments
   - Super admin sees "All Segments" view

2. **Dashboard Per Segment**
   - Each segment has isolated dashboard
   - Stats show only current segment data
   - Activity log filtered by segment
   - Charts filtered by segment

3. **Admin Panel Changes**
   - Super Admin: Sees all segments, can switch
   - Segment Admin: Only sees their segment(s)
   - User Management: Assign users to segments
   - Promotion: Promote users to segment admin

### New Pages:

#### `/signup` - Enhanced
- Email, Name, Password fields
- **NEW: Multi-select segment checkboxes**
- "Select the business segments you work with"
- Allows multiple selections

#### `/dashboard/admin/segments` - NEW
- List of all segments (super admin only)
- Create new segments
- Activate/deactivate segments
- Manage segment-specific settings

#### `/dashboard/admin/user-segments` - NEW
- Manage user access to segments
- Promote users to segment admin
- View user-segment assignments

### Modified Pages:

#### `/dashboard`
- Add segment switcher in header
- Filter all data by current segment
- Show segment name prominently

#### `/dashboard/admin/users`
- Show segments each user has access to
- Add "Manage Segments" button per user
- Show if user is segment admin

## Migration Steps

### Phase 1: Database Migration
1. Create BusinessSegment table
2. Create UserSegment table
3. Seed 4 segments (Brewing, Bakery, Dairy, Cheese)
4. Add segmentId to Entry, Cycle, EnzymeCategory
5. Migrate existing data to "Brewing" segment
6. Update User model (add super_admin role)
7. Promote current admin to super_admin

### Phase 2: Backend API Updates
1. Update all API routes to filter by segment
2. Add segment access middleware
3. Add user-segment assignment endpoints
4. Add segment switching logic
5. Update auth to include segment context

### Phase 3: Frontend Updates
1. Create SegmentSwitcher component
2. Update signup with segment selection
3. Add segment context provider
4. Update all pages to use segment filter
5. Create segment management UI

### Phase 4: Admin Features
1. User promotion to segment admin
2. Segment-specific user management
3. Cross-segment reporting (super admin)

## Segment-Specific Data

### Brewing (Existing):
- Enzyme categories (8 existing)
- Beer segments (Normal, Light, Adjunct)
- Breweries/Plants

### Bakery (New):
- Enzyme categories: Amylases, Xylanases, Lipases, Glucose Oxidases, etc.
- Bakery segments: Bread, Pastry, Cookies, Cakes
- Bakeries/Facilities

### Fresh Dairy (New):
- Enzyme categories: Lactases, Lipases, Proteases
- Dairy segments: Milk, Yogurt, Cream, Butter
- Dairy facilities

### Cheese (New):
- Enzyme categories: Chymosins, Lipases, Lysozymes
- Cheese segments: Soft, Hard, Blue, Fresh
- Cheese facilities

## Data Isolation

### Rules:
1. **Entries** - Isolated per segment
2. **Cycles** - Each segment has its own cycles
3. **Lookups** - Can be segment-specific or shared
4. **Activity Log** - Shows segment context
5. **Charts/Analytics** - Filtered by segment

### Super Admin View:
- Toggle "All Segments" to see aggregate data
- Compare across segments
- Export cross-segment reports

## Example User Flows

### Scenario 1: New User Signup
1. User goes to `/signup`
2. Enters email, name, password
3. Sees checkboxes: ☐ Brewing ☐ Bakery ☐ Fresh Dairy ☐ Cheese
4. Selects: ☑ Brewing ☑ Cheese
5. Account created with access to both segments
6. Lands on dashboard, sees "Brewing" (default to first selected)
7. Can switch to "Cheese" via segment switcher

### Scenario 2: Segment Admin Promotion
1. Super admin goes to User Management
2. Finds user "john@example.com"
3. Clicks "Manage Segments"
4. Sees: Brewing (Account Manager) | Cheese (Account Manager)
5. Promotes to: Brewing (Segment Admin) | Cheese (Account Manager)
6. John can now approve entries in Brewing, but not Cheese

### Scenario 3: Creating Entry
1. User switches to "Bakery" segment
2. Clicks "Add New Entry"
3. Wizard shows bakery-specific:
   - Bakery companies
   - Bakery segments (Bread, Pastry, etc.)
   - Bakery enzyme categories
4. Entry saved to Bakery segment only
5. Not visible when switched to Brewing segment

## Technical Considerations

### Session Management:
- Store current segment in session/cookie
- Default to first available segment
- Remember last used segment per user

### Performance:
- Index segmentId on all tables
- Use WHERE segmentId = ? in all queries
- Cache segment-specific lookups

### Security:
- Middleware checks segment access
- API routes validate segment permissions
- Prevent cross-segment data leaks

## Implementation Priority

### High Priority (Week 1):
1. ✅ Database schema changes
2. ✅ Migration script
3. ✅ Segment switcher UI
4. ✅ Basic segment filtering

### Medium Priority (Week 2):
5. ✅ Signup flow with segment selection
6. ✅ User-segment management
7. ✅ Segment admin promotion
8. ✅ Segment-specific lookups

### Lower Priority (Week 3):
9. Cross-segment reporting
10. Segment comparison charts
11. Bulk user segment assignment
12. Segment-specific branding

## Rollout Strategy

### Step 1: Migration
- Migrate existing data to "Brewing" segment
- All existing users get Brewing access
- Current admin becomes super_admin

### Step 2: Soft Launch
- Enable segment switcher (only Brewing visible)
- Test multi-segment architecture
- Verify data isolation

### Step 3: Add Segments
- Activate Bakery segment
- Create bakery-specific lookups
- Onboard bakery users

### Step 4: Full Launch
- Activate all segments
- Open signup to multi-segment selection
- Enable cross-segment reporting

## Success Metrics

- ✅ Users can access multiple segments
- ✅ Data properly isolated per segment
- ✅ Segment admins can manage their segment
- ✅ Super admin has full control
- ✅ No cross-segment data leaks
- ✅ Easy segment switching (<2 clicks)

---

This architecture supports unlimited segments in the future (Meat, Beverages, Pet Food, etc.) without major refactoring.
