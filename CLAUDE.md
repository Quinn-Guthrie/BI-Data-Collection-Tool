# Brewing Sales Exercise Data Collection App

## Project Overview

Web application for collecting brewing sales data from 100+ account managers across multiple reporting cycles. Replaces Excel-based workflow with guided data entry, validation, and cycle-over-cycle carry-forward.

**Current Status:** HTML/localStorage prototype (single-user)  
**Target:** Next.js + PostgreSQL production app (multi-user)

## Core Requirements

### Business Rules

1. **One entry per:** Company + Country + Segment + Cycle
2. **Recurring cycles:** Annual data collection, previous cycle prefills current cycle
3. **Role-based access:**
   - Account Managers: see only their assigned entries
   - Reviewers: see entries in their region
   - Admins: see all data, manage users/cycles
4. **Data quality:** Required fields, validation rules, confidence tracking

### Key Features

- 6-step wizard for guided data entry
- 8 enzyme categories with penetration + market share (4 suppliers)
- Auto-save drafts, finalize when complete
- Carry-forward from previous cycle (main UX feature)
- CSV export for analysis
- Audit trail for all changes

## Technical Stack

### Current (Prototype)
- Pure HTML/CSS/JavaScript
- localStorage for data
- No backend
- **Limitation:** Each user's data isolated to their browser

### Target (Production)
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes (serverless)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Supabase Auth (manual account creation by admin)
- **Hosting:** Vercel (frontend) + Neon/Supabase (database)
- **Validation:** Zod schemas (shared client/server)
- **Export:** exceljs for CSV generation

## Data Model

### Core Tables

**users**
- Roles: admin, reviewer, account_manager
- Region assignment for reviewers

**cycles**
- Status: open (active data entry) | locked (read-only archive)
- Only one open cycle at a time

**entries**
- Main sales data record
- Links to: cycle, user, company, country, segment
- Unique constraint: `cycleId + companyId + countryId + segmentId`
- `sourceEntryId`: links to previous cycle entry for carry-forward tracking

**entry_enzyme_values**
- Penetration % per enzyme category
- Market share split: IFF, Novonesis, DSM, Others (must total 100%)
- `confirmed`: tracks if carried-over value has been reviewed

**Lookups (admin-managed):**
- companies, countries, segments, distributors, enzyme_categories

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

## Known Limitations (Current Prototype)

- ❌ localStorage = no data sharing between users
- ❌ No real authentication (passwords in localStorage)
- ❌ No carry-forward implementation
- ❌ No reviewer workflow (return for correction)
- ❌ No admin UIs for user/lookup management
- ❌ No live segment total calculator
- ❌ No audit trail display
- ⚠️ CSV export works but manual consolidation needed

## Migration Path

1. **User gets Node.js approval**
2. **Setup (~1 hour):**
   - Create Next.js project
   - Setup Supabase account + database
   - Configure Prisma
3. **Development (~17 hours):**
   - Implement auth, wizard, dashboard, admin panel
   - Build carry-forward logic
   - Add validation + CSV export
4. **Deployment (~1 hour):**
   - Deploy to Vercel
   - Create 100 user accounts in Supabase
   - Send credentials to account managers
5. **Go-live**

## Reference Documents

- **Handover Brief:** `c:\Users\1309499\Downloads\brewing sales exercise app handover v2.md`
  - Complete requirements specification
  - All field definitions, validation rules, user workflows
  - Database schema, technical stack recommendations
  
- **Current Prototype:** `C:\Users\1309499\brewing-sales-app\`
  - Reference for field structure, seed data
  - UI flow and validation logic
  - Not suitable for 100+ users (localStorage limitation)

- **Gap Analysis:** See agent report (saved in conversation)
  - ~45% complete for prototype
  - ~15% production-ready (missing database, carry-forward, multi-user)

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
