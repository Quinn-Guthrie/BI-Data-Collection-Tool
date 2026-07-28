# 📁 Project Structure

Clean, organized file structure for Food Biosciences Data Collection platform.

---

## 🗂️ Root Directory

```
food-biosciences-data-collection/
├── 00-START-HERE.md          # 👈 START HERE - Master navigation
├── SESSION-SUMMARY.md         # Complete work log
├── README.md                  # Project overview & setup
├── CLAUDE.md                  # Development guidelines
├── PROJECT-STRUCTURE.md       # This file
│
├── docs/                      # 📚 All documentation
│   ├── README.md             # Documentation index
│   ├── guides/               # Active guides (4 files)
│   └── archive/              # Historical docs (29 files)
│
├── app/                       # Next.js pages & API routes
│   ├── api/                  # Backend API endpoints
│   ├── dashboard/            # Main application
│   ├── login/                # Authentication
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage (redirects to login)
│   └── globals.css           # Global styles
│
├── components/               # React components
│   ├── dashboard/           # Dashboard UI components
│   └── wizard/              # Entry wizard components
│       └── steps/           # Individual wizard steps
│
├── lib/                      # Utilities & shared code
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   └── validations/         # Zod schemas
│
├── prisma/                   # Database
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Seed data script
│   └── migrations/          # Database migrations
│
├── public/                   # Static assets
│
├── node_modules/            # Dependencies (gitignored)
├── .next/                   # Build output (gitignored)
├── dev.db                   # SQLite database (gitignored)
│
├── .env                     # Environment variables (gitignored)
├── .env.example             # Example env file
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
├── next.config.js           # Next.js config
└── tailwind.config.js       # Tailwind CSS config
```

---

## 📚 Documentation Structure

### Root Docs (4 files)
Essential files kept in project root for quick access:

- **00-START-HERE.md** - Master navigation (start here!)
- **SESSION-SUMMARY.md** - Complete work history
- **README.md** - Project setup & overview
- **CLAUDE.md** - Development guidelines

### `/docs/guides/` (4 files)
Active, current guides for implementation:

- **CARRY-FORWARD-COMPLETE.md** - Full carry-forward guide
- **CARRY-FORWARD-READY.txt** - Quick 15-min test
- **MULTI-SEGMENT-STATUS.md** - Multi-segment status
- **RENAME-FOLDER-INSTRUCTIONS.md** - Folder rename guide

### `/docs/archive/` (29 files)
Historical documentation kept for reference:

- Feature implementation logs
- Interim status reports
- Old completion markers
- Superseded guides

See [docs/README.md](docs/README.md) for complete documentation index.

---

## 🔧 Application Structure

### `/app` - Next.js Application

```
app/
├── api/                      # Backend API Routes
│   ├── admin/               # Admin endpoints
│   │   ├── users/          # User management
│   │   ├── cycles/         # Cycle management
│   │   │   └── [id]/carry-forward/  # Carry-forward feature
│   │   ├── approvals/      # Entry approvals
│   │   ├── export/         # CSV export
│   │   └── import/         # Data import
│   ├── entries/            # Entry CRUD
│   │   └── [id]/          # Single entry ops
│   ├── cycles/             # Cycle queries
│   │   └── current/        # Current open cycles
│   ├── lookups/            # Dropdown data
│   │   └── [type]/        # Dynamic lookup type
│   ├── segments/           # Business segments
│   └── auth/              # NextAuth (auto-generated)
│
├── dashboard/              # Main Application
│   ├── admin/             # Admin panel
│   │   ├── users/         # User management UI
│   │   ├── cycles/        # Cycle management UI
│   │   ├── approvals/     # Approval workflow UI
│   │   └── export/        # Export UI
│   ├── entries/           # Entry management
│   │   ├── new/          # Create entry wizard
│   │   └── [id]/edit/    # Edit entry
│   ├── layout.tsx         # Dashboard layout + auth
│   └── page.tsx           # Dashboard home
│
├── login/                  # Login page
│   └── page.tsx
│
├── layout.tsx              # Root layout
├── page.tsx                # Homepage (redirects)
└── globals.css             # Global styles
```

### `/components` - React Components

```
components/
├── dashboard/              # Dashboard Components
│   ├── DashboardHeader.tsx
│   ├── StatsSection.tsx
│   ├── EntriesTable.tsx
│   ├── EntriesFilter.tsx
│   ├── FilteredEntriesSection.tsx
│   ├── ActivityLog.tsx
│   └── DashboardCharts.tsx
│
├── wizard/                 # Entry Wizard
│   ├── EntryWizard.tsx    # Main wizard shell
│   └── steps/             # Wizard steps
│       ├── Step0CycleSelection.tsx
│       ├── Step1Account.tsx
│       ├── Step2Plant.tsx
│       ├── Step3Company.tsx
│       ├── Step4Segment.tsx
│       ├── Step5Enzymes.tsx
│       ├── Step6MarketShare.tsx
│       └── Step7Review.tsx
│
└── SessionProvider.tsx     # NextAuth session provider
```

### `/lib` - Utilities

```
lib/
├── auth.ts                 # NextAuth configuration
├── prisma.ts               # Prisma client singleton
└── validations/            # Zod validation schemas
    └── wizardValidation.ts
```

### `/prisma` - Database

```
prisma/
├── schema.prisma           # Database schema (multi-segment)
├── seed.ts                 # Seed script (4 segments)
└── migrations/             # Migration history
```

---

## 🎯 Key Files

### Must Read
- **00-START-HERE.md** - Your entry point
- **README.md** - Setup instructions
- **CLAUDE.md** - How to develop

### Configuration
- **.env** - Environment variables (DATABASE_URL, NEXTAUTH_SECRET)
- **package.json** - Dependencies & scripts
- **prisma/schema.prisma** - Database schema

### Main Application
- **app/dashboard/page.tsx** - Dashboard home
- **app/api/entries/route.ts** - Entry creation
- **components/wizard/EntryWizard.tsx** - Data entry wizard

---

## 🗑️ Ignored Files

See `.gitignore` for complete list:

- `/node_modules/` - Dependencies
- `/.next/` - Build output
- `/dev.db` - SQLite database
- `.env*` - Environment variables
- `*.log` - Log files
- `test-*.js`, `check-*.js` - Temp test files

---

## 📊 File Count

- **Documentation:** 37 files (4 root + 4 guides + 29 archive)
- **Application Code:** ~80 TypeScript/TSX files
- **Total Lines of Code:** ~15,000 lines
- **Database Tables:** 15 tables

---

## 🧭 Navigation Tips

### Starting from scratch?
1. Read **00-START-HERE.md**
2. Follow **README.md** for setup
3. Check **docs/guides/** for features

### Looking for something specific?
- Use **00-START-HERE.md** quick navigation
- Browse **docs/README.md** for all docs
- Check **docs/archive/** for historical context

### Want to understand the code?
- Read **CLAUDE.md** for architecture
- Check `app/` for pages and APIs
- Check `components/` for UI components
- Check `prisma/schema.prisma` for data model

---

**Everything is organized, documented, and ready to use!** 🎉

Start here: [00-START-HERE.md](00-START-HERE.md)
