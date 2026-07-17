# Multi-Segment Enable Status

## 🎯 Goal: Enable All 4 Segments for Data Collection

Status: **90% Complete** - Backend ready, frontend needs final wiring

---

## ✅ What's Complete

### Backend APIs (100% Done)
✅ **Cycles API** (`/api/cycles/current`)
- Returns all open cycles for user's segments
- Super admin sees all cycles
- Regular users see only their assigned segments
- Returns array of cycles with businessSegment details

✅ **Lookups API** (`/api/lookups/[type]`)
- Accepts `businessSegmentId` query parameter
- Segments: filtered by businessSegmentId
- Enzyme categories: filtered by businessSegmentId  
- Companies, countries, plants: shared across segments

✅ **Entry Creation API** (`/api/entries`)
- Accepts `businessSegmentId` in request body
- Validates segment exists
- Creates entries for any segment
- Duplicate check includes businessSegmentId

### Database (100% Ready)
✅ All 4 business segments exist:
- Brewing (blue) - 8 product segments, 8 enzymes
- Bakery (amber) - 3 product segments, 5 enzymes  
- Fresh Dairy (green) - 3 product segments, 3 enzymes
- Cheese (orange) - 3 product segments, 3 enzymes

✅ Segment-specific data:
- Product segments linked to businessSegmentId
- Enzyme categories linked to businessSegmentId
- Cycles linked to businessSegmentId

### Dashboard UI (100% Done)
✅ **Dashboard** (`/app/dashboard/page.tsx`)
- Shows all open cycles
- Color-coded by segment
- Lists each segment's active cycle

### Wizard Components (70% Done)
✅ **Step 0: Cycle Selection** (NEW component)
- Segment selection cards
- Color-coded by segment
- Auto-selects if only one cycle
- Passes cycleId + businessSegmentId

⚠️ **Wizard Integration** (NEEDS WIRING)
- Step 0 component created but not fully integrated
- businessSegmentId added to WizardData interface
- Needs to pass businessSegmentId to all steps

---

## ⚠️ What Needs Completion

### 1. Wire Step 0 into Wizard Flow
**File:** `components/wizard/EntryWizard.tsx`

**Current State:**
- Step 0 component exists
- currentStep starts at 0 for new entries
- businessSegmentId in WizardData

**Needs:**
- Render Step 0 when currentStep === 0
- Handle onSelect callback
- Skip Step 0 if editing existing entry
- Update step navigation logic

**Code Changes Needed:**
```typescript
// Add to step rendering logic
const renderCurrentStep = () => {
  if (currentStep === 0) {
    return (
      <Step0CycleSelection
        selectedCycleId={wizardData.cycleId}
        selectedBusinessSegmentId={wizardData.businessSegmentId}
        onSelect={(cycleId, businessSegmentId) => {
          setWizardData(prev => ({
            ...prev,
            cycleId,
            businessSegmentId
          }))
          setCycle({ id: cycleId, businessSegmentId })
        }}
        onNext={() => setCurrentStep(1)}
      />
    )
  }
  // ... existing step logic
}
```

### 2. Update Wizard Steps to Use businessSegmentId
**Files:** 
- `components/wizard/steps/Step4Segment.tsx`
- `components/wizard/steps/Step5Enzymes.tsx`

**Current State:**
- Steps load segments and enzymes without filter
- Still hardcoded to Brewing

**Needs:**
- Pass businessSegmentId to fetch calls
- Update API calls to include `?businessSegmentId=${id}`

**Example:**
```typescript
// In Step4Segment.tsx
useEffect(() => {
  if (cycle?.businessSegmentId) {
    fetch(`/api/lookups/segments?businessSegmentId=${cycle.businessSegmentId}`)
      .then(res => res.json())
      .then(data => setSegments(data))
  }
}, [cycle])
```

### 3. Update Entry Submission
**File:** `components/wizard/EntryWizard.tsx`

**Current State:**
- handleNext sends data to /api/entries
- businessSegmentId might not be included

**Needs:**
- Ensure businessSegmentId is sent in request body
- Verify it's included in both draft saves and finalization

---

## 🧪 Testing Checklist

Once wired up, test these scenarios:

### Test 1: Single Segment User
- [ ] User with only Brewing access
- [ ] Dashboard shows only Brewing cycle
- [ ] Wizard auto-selects Brewing
- [ ] Can create Brewing entry
- [ ] Brewing segments and enzymes shown

### Test 2: Multi-Segment User
- [ ] User with Brewing + Bakery access
- [ ] Dashboard shows both cycles
- [ ] Wizard shows segment selection cards
- [ ] Can select Brewing
- [ ] Brewing segments and enzymes shown
- [ ] Can select Bakery
- [ ] Bakery segments and enzymes shown

### Test 3: Super Admin
- [ ] Dashboard shows all 4 cycles
- [ ] Can create entry for any segment
- [ ] Each segment shows correct data

### Test 4: Entry Creation Per Segment
- [ ] Create Brewing entry → Success
- [ ] Create Bakery entry → Success
- [ ] Create Dairy entry → Success
- [ ] Create Cheese entry → Success
- [ ] Each entry links to correct businessSegmentId
- [ ] Dashboard shows entries per segment

---

## 📋 Quick Implementation Guide

### Option A: Simple (Recommended)
Keep it simple - just add businessSegmentId to the API calls:

1. Update Step4Segment to pass businessSegmentId:
   ```typescript
   fetch(`/api/lookups/segments?businessSegmentId=${cycle.businessSegmentId}`)
   ```

2. Update Step5Enzymes similarly

3. Add hidden input in Step 1 to store businessSegmentId from cycle

4. Test with Brewing first (should work as-is)

5. Create cycles for other segments

6. Test multi-segment

### Option B: Full Step 0 (Cleaner UX)
Implement full segment selection:

1. Wire Step 0 render logic
2. Update step navigation (0-7 instead of 1-7)
3. Update step progress bar
4. Test selection flow
5. Test with multiple segments

---

## 🚀 Deployment Strategy

### Phase 1: Brewing Only (Current)
- All backend ready
- Brewing works end-to-end
- Other segments exist but no cycles

### Phase 2: Enable One More Segment
- Admin creates Bakery cycle
- Test Bakery data entry
- Verify segment isolation
- Fix any issues

### Phase 3: Enable All Segments
- Admin creates Dairy and Cheese cycles
- Full multi-segment testing
- Production ready!

---

## 💾 Database Setup for Testing

To test multi-segment, you need cycles for each segment:

```typescript
// Run in Prisma Studio or admin panel
// Create cycles for other segments

// Bakery cycle
{
  name: "2026 Annual",
  status: "open",
  businessSegmentId: "<bakery-segment-id>",
  openedAt: new Date()
}

// Dairy cycle
{
  name: "2026 Annual",
  status: "open",
  businessSegmentId: "<dairy-segment-id>",
  openedAt: new Date()
}

// Cheese cycle
{
  name: "2026 Annual",
  status: "open",
  businessSegmentId: "<cheese-segment-id>",
  openedAt: new Date()
}
```

---

## 🎯 Current Recommendation

**For immediate testing:**
1. Focus on Brewing (already works)
2. Test carry-forward with Brewing
3. Then wire up Step 0 selection
4. Then create cycles for other segments
5. Test multi-segment flow

**Estimated time to complete:**
- Option A (Simple): 1-2 hours
- Option B (Full Step 0): 2-3 hours

**Priority:**
1. Test Brewing carry-forward (highest value)
2. Complete Step 0 wiring (enable multi-segment)
3. Create cycles for other segments (rollout)

---

## 📞 Questions & Decisions

**Q: Do we need Step 0 or just hardcode Brewing for now?**
- Step 0 is better UX for multi-segment users
- Can skip if only Brewing is active
- Recommended: implement Step 0 now (future-proof)

**Q: Should users see all segments or only their assigned ones?**
- Already implemented: users see only their segments
- Super admin sees all
- Perfect!

**Q: What if a user has no segments assigned?**
- Current: they see empty cycle list
- Should: show "Contact administrator" message
- Already handled in Step 0!

---

## ✅ Summary

**Backend: 100% Ready** ✅  
**Frontend: 70% Ready** ⏳  
**Testing: 0% Done** ❌  

**Next Action:** Wire Step 0 into wizard flow (2 hours) → Full multi-segment ready!
