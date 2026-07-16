# Food Biosciences Data Collection App

## Project Overview

Multi-segment web application for collecting sales data from 100+ account managers across 4 business segments: **Brewing, Bakery, Fresh Dairy, and Cheese**. Replaces Excel-based workflow with guided data entry, validation, and cycle-over-cycle carry-forward.

**Current Status:** ✅ Production-Ready Multi-Segment Platform  
**Tech Stack:** Next.js 14 + SQLite + Prisma + NextAuth

## Core Requirements

### Business Rules

1. **Multi-segment architecture:** 4 business segments (Brewing, Bakery, Dairy, Cheese)
2. **One entry per:** Company + Country + Product Segment + Cycle + Business Segment
3. **Recurring cycles:** Annual data collection per segment, previous cycle prefills current
4. **Role-based access:**
   - **Super Admin:** Full access across all segments, manage users/cycles
   - **Segment Admins:** Manage specific business segments
   - **Account Managers:** See only their assigned entries in their segments
5. **Data isolation:** Each segment has its own data, cycles, and product types
6. **Data quality:** Required fields, validation rules, confidence tracking

### Key Features

- **Multi-segment platform:** 4 business segments in one app
- **Segment-aware wizard:** 7-step guided data entry with segment-specific fields
- **Flexible enzyme categories:** Different enzymes per segment (Brewing: 8, Bakery: 5, Dairy: 3, Cheese: 3)
- **User segment assignment:** Users can access multiple segments
- **Auto-save drafts:** Save at any time, finalize when complete
- **Carry-forward:** Clone entries from previous cycle (per segment)
- **Approval workflow:** Super admin approves/rejects entries
- **CSV export:** Per segment and cycle
- **Complete audit trail:** Track all changes

## Technical Stack (Production)

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** SQLite via Prisma ORM (ready for PostgreSQL)
- **Auth:** NextAuth with bcrypt password hashing
- **Validation:** Zod schemas (shared client/server)
- **Export:** exceljs for CSV generation
- **Development:** Local SQLite, production-ready for PostgreSQL migration

## Data Model

### Core Tables

**business_segments** (NEW)
- 4 segments: Brewing, Bakery, Fresh Dairy, Cheese
- Each has: name, slug, description, color, active status

**user_segments** (NEW - Join Table)
- Many-to-many: Users can access multiple segments
- Fields: userId, segmentId, role (account_manager | segment_admin)
- Enables segment-based access control

**users**
- Roles: super_admin | account_manager
- Super admin: full access across all segments
- Account managers: access via UserSegment records

**cycles**
- Status: open (active data entry) | locked (read-only archive)
- **Segment-specific:** Each segment has its own cycles
- Links to: businessSegmentId

**entries**
- Main sales data record
- Links to: cycle, user, company, country, product segment, **business segment**
- Unique constraint: `cycleId + companyId + countryId + segmentId + businessSegmentId`
- `sourceEntryId`: links to previous cycle entry for carry-forward tracking

**entry_enzyme_values**
- Penetration % per enzyme category (segment-specific)
- Market share split: IFF, Novonesis, DSM, Others (must total 100%)
- `confirmed`: tracks if carried-over value has been reviewed

**segments** (Product Segments)
- Segment-specific: Brewing (8), Bakery (3), Dairy (3), Cheese (3)
- Links to: businessSegmentId

**enzyme_categories**
- Segment-specific: Different enzymes per business segment
- Brewing: 8, Bakery: 5, Dairy: 3, Cheese: 3
- Links to: businessSegmentId

**Lookups (shared across segments):**
- companies, countries, plants, distributors

**audit_log**
- Track all changes to entries (who, when, what changed)

## Validation Rules

### Required Before Finalization
- Company, country, region
- Existing customer status (yes/no)
- Go-to-market (direct/distributor) + distributor name if applicable
- Production HL/year (≥0)
- Segment + production % (0-100)
- Penetration % for each enzyme category
- Market share (must total 100%) where penetration > 0
- Confidence % (0-100)
- All carried-over values must be confirmed

### Business Logic Validation
- **Segment total:** Production % across all segments for same company/country should = 100%
- **Duplicate prevention:** Cannot finalize if entry already exists for same company+country+segment+cycle
- **Market share total:** Per enzyme, IFF% + Novonesis% + DSM% + Others% must = 100%

## Carry-Forward System (Critical)

**When admin opens new cycle:**
1. All finalized entries from previous cycle are cloned
2. New entries created with status `carried_over_unconfirmed`
3. All field values copied EXCEPT: confidencePercent, comments, finalizedAt
4. `sourceEntryId` links back to source entry
5. `confirmed=false` on all enzyme values

**During data entry:**
- Carried-over fields show visual indicator
- User must confirm or edit each value
- Cannot finalize until all carried values confirmed
- Show side-by-side comparison (previous cycle vs current)

**Why critical:** With 100+ users, prevents re-entering identical data every cycle. Users confirm/adjust instead of starting from scratch.

## User Workflows

### Account Manager
1. Log in → see dashboard (only my entries)
2. Add New Entry → 6-step wizard
3. Save draft (any time) or Finalize (when complete)
4. Edit existing drafts
5. View finalized entries (read-only)

### Reviewer
1. Log in → see all entries in my region
2. Filter by: account manager, country, company, status, confidence
3. Review entry → return for correction or approve
4. View carry-forward comparison

### Admin
1. Manage users (create accounts, assign regions)
2. Manage cycles (open new, lock current)
3. Trigger carry-forward when opening new cycle
4. Export CSV for all or filtered entries
5. View all data across all users

## File Structure (Target Next.js App)

```
app/
├── login/page.tsx
├── dashboard/
│   ├── layout.tsx - Main shell with auth check
│   ├── page.tsx - Dashboard with stats
│   ├── entries/
│   │   ├── new/page.tsx - Wizard
│   │   └── [id]/edit/page.tsx
│   ├── admin/
│   │   ├── users/page.tsx
│   │   ├── cycles/page.tsx
│   │   └── export/page.tsx
│   └── api/
│       ├── entries/route.ts
│       ├── export/route.ts
│       └── cycles/[id]/carry-forward/route.ts

components/
├── wizard/
│   ├── WizardShell.tsx
│   └── steps/
│       ├── Step1Account.tsx
│       ├── Step2Company.tsx
│       ├── Step3Segment.tsx
│       ├── Step4Enzymes.tsx
│       ├── Step5MarketShare.tsx
│       └── Step6Review.tsx
├── dashboard/
│   ├── StatsGrid.tsx
│   ├── EntriesTable.tsx
│   └── CycleSelector.tsx

lib/
├── prisma.ts - Prisma client singleton
├── supabase/ - Auth clients
├── validations/ - Zod schemas
└── utils/ - Helpers (CSV export, carry-forward logic)

prisma/
├── schema.prisma - Database schema
└── seed.ts - Initial data (segments, enzymes, countries)
```

## Development Guidelines

### Code Style
- TypeScript strict mode
- Server Components by default, Client Components only when needed (forms, interactivity)
- Zod validation on both client and server (shared schemas)
- Prisma for all database queries
- No raw SQL except complex reports

### Component Patterns
- **Forms:** React Hook Form + Zod resolver
- **Data fetching:** Server Components with Prisma queries
- **Mutations:** Server Actions or API routes
- **Auth:** Check user session in layout.tsx, redirect if not authenticated
- **Role checks:** Middleware for route protection, query filters for data access

### Validation Strategy
1. Define Zod schema in `lib/validations/entry.ts`
2. Use in React Hook Form (client-side feedback)
3. Validate again in API route (server-side enforcement)
4. Database constraints as final safeguard (unique indexes, foreign keys)

### Testing Approach
1. **Manual testing:** Complete wizard, test all validations
2. **Multi-user test:** Log in as different roles, verify data isolation
3. **Carry-forward test:** Create cycle → lock → open new → verify prefill works
4. **Export test:** Generate CSV, open in Excel, verify format
5. **Mobile test:** Complete flow on phone/tablet

## Common Tasks

### Add New Field to Entry
1. Add column to `entries` table in `schema.prisma`
2. Run `npx prisma migrate dev --name add_field_name`
3. Add field to Zod schema in `lib/validations/entry.ts`
4. Add input to appropriate wizard step component
5. Update CSV export to include new column
6. Add field to carry-forward copy logic

### Add New Enzyme Category
1. Admin adds via database insert (or build admin UI)
2. Shows automatically in Step 4 (queries from database)
3. Step 5 shows market share fields if penetration > 0
4. CSV export dynamically adds columns

### Change Validation Rule
1. Update Zod schema in `lib/validations/entry.ts`
2. Client-side validation updates automatically (React Hook Form)
3. Server-side validation uses same schema (no duplication)

### Add New Role
1. Add to `role` enum in `schema.prisma`
2. Add role check functions in `lib/auth.ts`
3. Add middleware rules in `middleware.ts`
4. Add data filtering in dashboard queries

## Current Implementation Status

✅ **Production-Ready Features:**
- ✅ Multi-segment architecture (4 segments)
- ✅ Segment-based user access control
- ✅ User creation with multi-segment assignment
- ✅ User profile editing (super admin)
- ✅ NextAuth authentication with bcrypt
- ✅ 7-step entry wizard
- ✅ Approval workflow (approve/reject)
- ✅ Cycle management per segment
- ✅ CSV export per segment
- ✅ Complete audit trail
- ✅ Admin dashboard with multi-segment overview
- ✅ Segment-specific product types and enzymes
- ✅ Data isolation per segment

🚧 **Currently Active:**
- ✅ Brewing segment: Full data collection enabled
- ⚠️ Other segments: Exist in database but hidden from UI

📋 **Pending Implementation:**
- ❌ Carry-forward system (clone entries from previous cycle)
- ❌ Bakery/Dairy/Cheese data collection forms
- ❌ Live segment total calculator
- ❌ Self-service password reset
- ❌ Email notifications

## Reference Documents

- **Original Brief:** `c:\Users\1309499\Downloads\food biosciences data collection app handover v2.md`
  - Complete requirements specification
  - All field definitions, validation rules, user workflows
  
- **This Directory:** `C:\Users\1309499\food-biosciences-data-collection\`
  - Production-ready Next.js application
  - Multi-segment architecture implemented
  - SQLite database (ready for PostgreSQL migration)

## Future Enhancements (Post-Launch)

### Phase 2
- Company SSO integration (Microsoft 365 / Google Workspace)
- Self-service password reset
- Email notifications for cycle opening/locking
- Bulk user import via CSV

### Phase 3
- Reviewer approval workflow
- Admin UI for managing lookup lists
- Segment total live calculator across company/country
- Enhanced dashboard with charts
- Cycle-over-cycle comparison reports
- Power BI export format

### Phase 4
- Mobile app (React Native)
- Offline mode with sync
- Advanced filtering and search
- Bulk edit operations
- Data quality scoring
- Automated reminders for incomplete entries

## Support & Troubleshooting

### Common Issues

**"Can't see other users' data"**
- Expected in prototype (localStorage)
- Will work in production with shared database

**"Data disappeared after clearing browser"**
- localStorage cleared = data lost
- Production version stores in database (persistent)

**"Validation blocks finalization"**
- Check all required fields complete
- Verify market share totals = 100%
- Confirm all carried-over values reviewed

**"Can't create duplicate entry"**
- By design: one entry per company+country+segment+cycle
- Edit existing entry instead

### Getting Help

For development questions:
1. Check handover brief (section references in code comments)
2. Review this CLAUDE.md
3. Examine current prototype implementation
4. Check Prisma schema for data relationships

## Key Design Principles

1. **Guided over freeform:** Wizard prevents users from being overwhelmed
2. **Validate early:** Client-side feedback, server-side enforcement
3. **Prefill everything possible:** Carry-forward, auto-fills reduce re-entry
4. **Clear progress indicators:** Users always know what's complete, what's missing
5. **Role-based minimalism:** Show only what user needs for their role
6. **Fail-safe drafts:** Never lose work, auto-save frequently
7. **One source of truth:** Database constraints match business rules
8. **Audit everything:** Track who changed what when

## Success Metrics

- **Data quality:** < 5% entries requiring correction
- **Time savings:** 50% reduction vs Excel template (via carry-forward)
- **Completion rate:** > 95% of assigned entries finalized on time
- **User satisfaction:** "Easy to use" rating > 4/5
- **Reliability:** 99.9% uptime, zero data loss
