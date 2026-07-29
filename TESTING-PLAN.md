# 🧪 Complete Testing Plan

**Goal:** Ensure Brewing segment is 100% perfect before adding other segments  
**Date:** 2026-07-29

---

## ✅ Testing Status

### Infrastructure ✓
- [x] Server starts successfully
- [x] Database exists and connects
- [x] Environment variables loaded
- [x] API routes responding

### Issues Found 🔧
- [ ] TypeScript errors in carry-forward route (27 errors total)
- [ ] Field name mismatches (businessSegment vs segment)
- [ ] Missing businessSegmentId in some queries
- [ ] EntryWizard Step 0 props mismatch

---

## 📋 Manual Testing Checklist

### 1. Authentication & Access Control
- [ ] **Login Page**
  - [ ] Login with correct credentials works
  - [ ] Wrong password rejected with error
  - [ ] Session persists after browser refresh
  - [ ] Logout works and redirects to login
  
- [ ] **Role-Based Access**
  - [ ] Super admin sees all data
  - [ ] Account manager sees only their entries
  - [ ] Admin panel hidden from account managers
  - [ ] Cannot access admin routes via URL manipulation

---

### 2. Dashboard
- [ ] **Page Load**
  - [ ] Dashboard loads without errors
  - [ ] No console errors in browser
  - [ ] Active cycles display with correct colors
  
- [ ] **Stats Cards**
  - [ ] Total entries count correct
  - [ ] Not Started count correct
  - [ ] In Progress count correct
  - [ ] Finalized count correct
  - [ ] Pending Approval count correct
  
- [ ] **Charts Section** 📊
  - [ ] Entries by Segment pie chart renders
  - [ ] Entries by Status pie chart renders
  - [ ] Top Contributors bar chart renders
  - [ ] Confidence Distribution bar chart renders
  - [ ] Completion Trend line chart renders
  - [ ] Charts show real data (not empty)
  - [ ] Hover tooltips work
  - [ ] Colors match segment colors
  
- [ ] **Entries Table**
  - [ ] Recent entries display
  - [ ] Company, country, segment visible
  - [ ] Status badges show correct colors
  - [ ] View/Edit buttons work
  - [ ] Filter controls work
  
- [ ] **Activity Log**
  - [ ] Recent activities display
  - [ ] Timestamps are recent
  - [ ] User names show correctly

---

### 3. Entry Wizard (CRITICAL)

#### Step 0: Cycle Selection
- [ ] Page loads without error
- [ ] Shows all open cycles for user's segments
- [ ] Cycle cards display segment name and color
- [ ] Can select a cycle
- [ ] Selected cycle highlighted
- [ ] Continue button enabled when selected
- [ ] Auto-advances if only one cycle

#### Step 1: Account Information
- [ ] Region dropdown loads
- [ ] Subregion dropdown loads
- [ ] Existing customer radio buttons work
- [ ] Go-to-market selection works
- [ ] Distributor dropdown shows when "Distributor" selected
- [ ] Distributor hidden when "Direct" selected
- [ ] Next button works

#### Step 2: Plant Information
- [ ] Country dropdown loads with all countries
- [ ] Plant dropdown loads plants for selected country
- [ ] "Create new plant" option works
- [ ] Can proceed without plant (optional)
- [ ] Next button works

#### Step 3: Company Information
- [ ] Company dropdown loads
- [ ] Production HL/year accepts numbers
- [ ] Production HL validation works (≥0)
- [ ] "Create new company" option works
- [ ] Next button works

#### Step 4: Product Segment
- [ ] Segment dropdown loads (Brewing segments only)
- [ ] Production % accepts 0-100
- [ ] Production % validation works
- [ ] Next button works

#### Step 5: Enzyme Penetration
- [ ] All 8 enzyme categories display for Brewing
- [ ] Penetration % accepts 0-100
- [ ] Penetration % validation works
- [ ] Can enter 0% (means not used)
- [ ] Next button works

#### Step 6: Market Share
- [ ] Only shows enzymes with penetration > 0
- [ ] Four competitor fields show: IFF, Novonesis, DSM, Others
- [ ] Market share accepts 0-100
- [ ] **Validation: Total must = 100%**
- [ ] Error shows if total ≠ 100%
- [ ] Cannot proceed if total ≠ 100%
- [ ] Next button works

#### Step 7: Review
- [ ] All entered data displays correctly
- [ ] Account info visible
- [ ] Company info visible
- [ ] Segment info visible
- [ ] Enzyme data visible
- [ ] Market share data visible
- [ ] Confidence % slider works (0-100)
- [ ] Comments text area works
- [ ] **Save Draft button works**
- [ ] **Finalize Entry button works**

#### Navigation
- [ ] Progress bar shows current step
- [ ] Can click progress bar to jump to completed steps
- [ ] Previous button works
- [ ] Previous disabled on first step
- [ ] Data persists when going back/forward
- [ ] No data lost during navigation

---

### 4. Entry Management

#### View Entries
- [ ] All entries visible in table
- [ ] Can filter by status
- [ ] Can filter by segment
- [ ] Can search by company
- [ ] Pagination works (if >20 entries)

#### Edit Draft
- [ ] Can click Edit on draft entry
- [ ] Wizard opens with existing data
- [ ] All fields pre-filled correctly
- [ ] Can modify any field
- [ ] Save Draft updates entry
- [ ] Finalize works from edit mode

#### Finalized Entries
- [ ] Cannot edit finalized entries
- [ ] Edit button disabled or hidden
- [ ] Can view read-only
- [ ] Shows finalized date/time

#### Carried-Over Entries
- [ ] Entries cloned from previous cycle show 📋 icon
- [ ] Status = "Needs Confirmation"
- [ ] Badge says "Needs Confirmation"
- [ ] Can edit carried-over values
- [ ] Must confirm all values before finalizing
- [ ] Cannot finalize until all values confirmed

#### Delete Entry
- [ ] Can delete draft entries
- [ ] Cannot delete finalized entries
- [ ] Confirmation prompt shows
- [ ] Entry removed from list after delete

---

### 5. Admin Panel

#### User Management
- [ ] Can view all users
- [ ] **Create User**
  - [ ] Enter name, email, password
  - [ ] Assign role
  - [ ] Assign segments (multi-select)
  - [ ] User created successfully
  - [ ] Can login with new credentials
  
- [ ] **Edit User**
  - [ ] Can change name
  - [ ] Can change role
  - [ ] Can reassign segments
  - [ ] Changes save correctly
  
- [ ] **Delete User**
  - [ ] Confirmation prompt shows
  - [ ] User removed from system
  - [ ] Cannot login after deletion

#### Cycle Management
- [ ] **View Cycles**
  - [ ] All cycles listed
  - [ ] Shows segment, status, dates
  
- [ ] **Create Cycle**
  - [ ] Select business segment
  - [ ] Enter cycle name
  - [ ] Opens as "open" status
  - [ ] Appears in dashboard
  - [ ] Users can create entries in new cycle
  
- [ ] **Lock Cycle**
  - [ ] Can lock open cycle
  - [ ] Status changes to "locked"
  - [ ] Users cannot create new entries in locked cycle
  - [ ] Existing entries become read-only
  
- [ ] **Carry-Forward** 🚨 (BROKEN - needs fix)
  - [ ] Trigger carry-forward for new cycle
  - [ ] Clones all finalized entries from previous cycle
  - [ ] Sets status = "carried_over_unconfirmed"
  - [ ] Links sourceEntryId to original
  - [ ] Clears: confidencePercent, comments, finalizedAt
  - [ ] Sets confirmed=false on all enzyme values
  - [ ] New entries appear in dashboard

#### Approvals
- [ ] **View Pending**
  - [ ] All submitted entries show
  - [ ] Can filter by segment/user
  
- [ ] **Approve Entry**
  - [ ] Approval status updates
  - [ ] User notified (if notifications enabled)
  - [ ] Entry marked as approved
  
- [ ] **Reject Entry**
  - [ ] Can enter rejection reason
  - [ ] Entry returns to draft
  - [ ] User notified
  - [ ] Can re-edit and resubmit

#### Export
- [ ] **Export All**
  - [ ] Downloads CSV file
  - [ ] Opens in Excel
  - [ ] All entries included
  - [ ] All columns present
  
- [ ] **Export by Segment**
  - [ ] Filter by segment works
  - [ ] Only selected segment exported
  
- [ ] **Export by Cycle**
  - [ ] Filter by cycle works
  - [ ] Only selected cycle exported

---

### 6. Data Validation

#### Required Fields
- [ ] Cannot finalize without company
- [ ] Cannot finalize without country
- [ ] Cannot finalize without segment
- [ ] Cannot finalize without production HL
- [ ] Cannot finalize without penetration values
- [ ] Cannot finalize without market share (where penetration >0)

#### Numeric Validation
- [ ] Production HL ≥ 0
- [ ] Penetration % between 0-100
- [ ] Market share % between 0-100
- [ ] Confidence % between 0-100
- [ ] Production segment % between 0-100

#### Business Rules
- [ ] Market share totals exactly 100% (per enzyme)
- [ ] Cannot create duplicate entry (same company+country+segment+cycle)
- [ ] Carried-over values must be confirmed before finalization

---

### 7. Performance & UX

#### Load Times
- [ ] Dashboard loads in <2 seconds
- [ ] Entry wizard loads in <1 second
- [ ] Charts render in <1 second
- [ ] API calls respond in <500ms

#### Responsiveness
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)

#### Browser Compatibility
- [ ] Chrome
- [ ] Edge
- [ ] Firefox
- [ ] Safari (if available)

#### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Validation errors are clear
- [ ] No silent failures
- [ ] Console shows helpful debug info (dev mode)

---

### 8. Edge Cases

#### Empty States
- [ ] No cycles → shows helpful message
- [ ] No entries → shows empty state
- [ ] No chart data → shows "No data available"

#### Large Datasets
- [ ] 100+ entries load quickly
- [ ] Charts render with 100+ data points
- [ ] Pagination handles large lists

#### Concurrent Users
- [ ] Two users can edit different entries simultaneously
- [ ] No race conditions on save
- [ ] Last write wins (or conflict detection)

#### Browser Refresh
- [ ] Wizard data not lost on refresh (or warns user)
- [ ] Dashboard refreshes cleanly
- [ ] Session persists

---

## 🐛 Known Issues to Fix

### Critical (Blocks Usage)
1. **Carry-forward route broken** - TypeScript errors
2. **EntryWizard Step 0 props** - Type mismatch
3. **Missing businessSegmentId** - Several routes

### Medium (Degraded Experience)
4. Field name inconsistencies (businessSegment vs segment)
5. Missing error handling in some API routes

### Low (Nice to Have)
6. TypeScript strict mode compliance
7. Better loading states

---

## 🎯 Priority Fix Order

1. **Fix carry-forward route** (CRITICAL for multi-cycle workflow)
2. **Fix EntryWizard Step 0** (blocks new entries)
3. **Fix TypeScript errors** (code quality)
4. **Test complete entry flow** (end-to-end)
5. **Test carry-forward** (critical feature)

---

## 📝 Test Data Setup

To properly test, we need:
- ✅ Admin user (exists)
- ✅ At least 2 account managers
- ✅ At least 1 open Brewing cycle
- ✅ At least 10 test entries (various statuses)
- ✅ At least 5 companies
- ✅ At least 10 countries
- ✅ All 8 Brewing enzyme categories
- [ ] At least 1 locked cycle (for carry-forward testing)

---

## ✅ Testing Complete Checklist

- [ ] All TypeScript errors fixed
- [ ] All critical bugs fixed
- [ ] Complete entry creation flow tested
- [ ] Complete approval workflow tested
- [ ] Carry-forward tested
- [ ] CSV export tested
- [ ] Charts verified with real data
- [ ] Mobile responsiveness checked
- [ ] No console errors
- [ ] Performance acceptable

**When all boxes checked → App is production-ready for Brewing segment!**

---

## 🚀 Next: Backend Development

Once testing complete, we'll build:
1. Better error handling
2. API documentation
3. Rate limiting
4. Audit logging enhancements
5. Backup/restore
6. Health checks
7. Monitoring

---

*Testing started: 2026-07-29*  
*Status: In Progress*
