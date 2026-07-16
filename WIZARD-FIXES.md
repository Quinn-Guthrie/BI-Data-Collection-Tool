# ✅ Wizard Fixes Complete

## Issues Fixed

### 1. Can't Enter Confidence Level
**Problem:** Confidence % field was read-only in Step 7 Review  
**Fix:** Made field editable with number input (0-100)  
**Location:** [Step7Review.tsx:154-166](components/wizard/steps/Step7Review.tsx#L154-L166)

### 2. Can't Save Draft
**Problem:** Validation required ALL fields even for drafts, preventing save  
**Fix:** Validation now distinguishes between drafts and finalized entries  
**Location:** [route.ts:35-48](app/api/entries/route.ts#L35-L48)

## What Changed

### Step 7 Review - Editable Fields
```typescript
// Before: Read-only
<input type="number" value={data.confidencePercent || ''} readOnly />

// After: Editable
<input
  type="number"
  min="0"
  max="100"
  value={data.confidencePercent || ''}
  onChange={(e) => updateData({ confidencePercent: Number(e.target.value) })}
/>
```

**Comments field also made editable:**
- Can enter any text
- Optional for both drafts and finalized
- Auto-saves with draft

### API Validation - Draft vs Finalized

**Always Required** (database constraints):
- ✅ Cycle ID
- ✅ Company
- ✅ Country
- ✅ Region
- ✅ Subregion
- ✅ Existing Customer (yes/no)
- ✅ Go-to-Market (direct/distributor)
- ✅ Segment

**Required ONLY for Finalized:**
- ✅ Confidence % (0-100)
- ✅ Distributor name (if goToMarket = 'distributor')
- ✅ Market share totals = 100% (for enzymes with penetration > 0)

**Optional for Both:**
- Plant
- Production HL/year
- Production %
- Comments
- Enzyme data

## How to Use

### Save Draft
1. Fill in the minimum required fields:
   - Step 2: Country (auto-fills region/subregion)
   - Step 3: Company, Customer Status, Go-to-Market, Production
   - Step 4: Segment
2. Click "Save Draft" button (available on ANY step)
3. Draft saved, redirects to dashboard
4. Can edit later from dashboard

### Finalize Entry
1. Complete ALL steps through Step 7
2. In Step 7 Review:
   - Enter **Confidence %** (required)
   - Add comments (optional)
3. Click "Finalize Entry"
4. System validates:
   - All required fields present
   - Market share = 100% for each enzyme with penetration > 0
   - No duplicate entries exist
5. Entry finalized, goes to approval workflow

## Testing Steps

### Test 1: Save Draft Immediately
1. Login: http://localhost:3000/login (`john@brewing.com` / `admin123`)
2. Click "New Entry"
3. Step 2: Select Country "United States"
4. Step 3: Select Company "AB InBev", Existing Customer "yes", Go-to-Market "direct", Production "500000"
5. Step 4: Select Segment "Normal beer"
6. Click "Save Draft" (skip enzyme data)
7. **Expected:** Draft saved, redirects to dashboard
8. **Verify:** Entry appears in dashboard with status "draft"

### Test 2: Save Draft After Partial Enzyme Entry
1. New Entry
2. Complete Steps 2-4
3. Step 5: Enter Enzyme "Alpha-amylase" penetration 50%
4. Click "Save Draft" (don't enter market share yet)
5. **Expected:** Draft saved
6. Edit draft later, complete market share, finalize

### Test 3: Enter Confidence and Finalize
1. New Entry
2. Complete all steps including enzyme data with market share = 100%
3. Step 7 Review:
   - **Type in Confidence %:** `85`
   - **Type in Comments:** `Data confirmed with brewery manager`
4. Click "Finalize Entry"
5. **Expected:** Entry finalized successfully
6. **Verify:** Entry shows status "finalized" in dashboard

### Test 4: Can't Finalize Without Confidence
1. New Entry
2. Complete all steps
3. Step 7: Leave confidence blank
4. Click "Finalize Entry"
5. **Expected:** Error message "Confidence percentage is required for finalized entries"

### Test 5: Can't Finalize with Invalid Market Share
1. New Entry
2. Complete through Step 6
3. Step 6: Enter market shares that DON'T total 100%
   - IFF: 50%
   - Novonesis: 30%
   - DSM: 15%
   - Others: 10%
   - Total: 105% ❌
4. Step 7: Enter confidence 85%
5. Click "Finalize Entry"
6. **Expected:** Error "Alpha-amylase market share must total 100% (currently 105.0%)"

## Files Modified

1. **[components/wizard/steps/Step7Review.tsx](components/wizard/steps/Step7Review.tsx)**
   - Made confidence % input editable
   - Made comments textarea editable
   - Added `updateData` prop to component
   - Added onChange handlers
   - Added required indicator (*) to confidence label

2. **[app/api/entries/route.ts](app/api/entries/route.ts)**
   - Reorganized validation logic
   - Always validate database-required fields
   - Only validate confidence for finalized entries
   - Maintained market share validation for finalized only

## Key Behaviors

### Auto-Save
- **NOT** implemented currently
- Use "Save Draft" button manually
- Future: Could add auto-save every 30 seconds

### Draft Status
- Drafts have `finalized: false`
- Drafts have `status: 'draft'`
- Can edit drafts unlimited times
- Can delete drafts

### Finalized Status
- Finalized have `finalized: true`
- Finalized have `status: 'finalized'`
- Finalized are **read-only** (cannot edit)
- Finalized go to approval workflow

### Confidence Level Guide
- **0-25%:** Very uncertain, rough estimate
- **26-50%:** Some confidence, needs verification
- **51-75%:** Fairly confident, minor gaps
- **76-90%:** High confidence, well-researched
- **91-100%:** Completely confident, verified data

## Current State

✅ **Server Running:** http://localhost:3000  
✅ **Confidence field editable**  
✅ **Comments field editable**  
✅ **Draft saving works**  
✅ **Finalization validation works**  
✅ **Market share validation works**

## Known Behaviors

### Minimum Required for Draft
You MUST fill:
- Country (Step 2)
- Company, Customer Status, Go-to-Market (Step 3)
- Segment (Step 4)

These are database constraints, cannot be bypassed.

### Can Skip for Draft
- Plant
- Production amount
- Production %
- All enzyme data
- Confidence % (only required for finalize)
- Comments

### Validation Happens
- **Client-side:** Basic checks (confidence 0-100, market share total)
- **Server-side:** All validation rules enforced
- **Database-side:** Constraints prevent invalid data

## Success!

Both issues are fixed:
1. ✅ Can now enter confidence % in Step 7
2. ✅ Can now save drafts without all fields

Test it: http://localhost:3000/dashboard/entries/new
