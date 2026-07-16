# Brewing Sales Exercise - Data Collection App

**Version:** 2.0 - Production Ready  
**Status:** ✅ All Features Complete  
**Server:** http://localhost:3000

## Quick Start

### 1. Start the Server
```bash
cd C:\Users\1309499\brewing-sales-app-v2
npm run dev
```

Server starts at: **http://localhost:3000**

### 2. Login
**Admin Account (Full Permissions):**
- Email: `admin@brewing.com`
- Password: `admin123`

**Test Accounts:**
- Account Manager: `john@brewing.com` / `admin123`
- Reviewer: `david@brewing.com` / `admin123`
- Approver: `sarah@brewing.com` / `admin123`

### 3. Create New Account (Self-Signup)
- Go to: http://localhost:3000/signup
- Fill: Name, Email, Password, Region (optional)
- Role: Automatically set to `account_manager`
- Immediate access after signup

## Features Complete

### ✅ User Management
- Self-signup for account managers
- Admin creates users with any role
- Activate/deactivate users
- **Delete users** (only if no entries)
- 4 roles: admin, approver, reviewer, account_manager

### ✅ Data Entry Wizard (7 Steps)
1. Account (auto-filled)
2. Plant & Country (with region auto-fill)
3. Company Details (customer status, go-to-market, production)
4. Segment (with production %)
5. Enzymes (8 categories: usage status + penetration %)
6. Market Share (IFF, Novonesis, DSM, Others - must = 100%)
7. Review & Finalize (enter confidence % + comments)

### ✅ Save & Finalize
- **Save Draft:** Anytime during wizard (requires basic fields only)
- **Finalize Entry:** Complete all steps, enters approval workflow
- **Edit Drafts:** Can edit unlimited times before finalize
- **Read-only:** Finalized entries cannot be edited

### ✅ Approval Workflow (Admin)
- **Review entries:** Pending | Approved | Rejected tabs
- **Approve:** One-click approval
- **Reject:** Add rejection reason, saves to database
- **Track:** Who approved/rejected and when
- **Color-coded confidence:** Green (≥80%), Yellow (≥50%), Red (<50%)

### ✅ Cycle Management (Admin)
- Create new cycles (only 1 open at a time)
- Lock cycles (permanent, read-only archive)
- **Carry-forward:** Copy finalized entries from previous cycle
- Entry counts per cycle
- Audit trail for all cycle operations

### ✅ Export Data (Admin)
- Select any cycle
- Download complete CSV export
- Includes: All fields + 8 enzyme categories (48 enzyme columns)
- Opens in Excel/Google Sheets
- Filename: `brewing_sales_[CycleName]_[Date].csv`

### ✅ Admin Dashboard
- User stats (total, active)
- Cycle info (current open cycle)
- Entry counts across all cycles
- Quick actions: Users, Cycles, Export, Approvals

### ✅ Security & Audit
- NextAuth with bcrypt password hashing
- Role-based access control
- Complete audit trail (all CRUD operations)
- Session-based authentication
- Cannot delete users with entries

## Admin Features Quick Reference

| Feature | URL | Description |
|---------|-----|-------------|
| Dashboard | `/dashboard/admin` | Overview + quick actions |
| User Management | `/dashboard/admin/users` | Create, activate, deactivate, delete |
| Cycle Management | `/dashboard/admin/cycles` | Create, lock, carry-forward |
| Entry Approval | `/dashboard/admin/approvals` | Approve/reject entries |
| Export Data | `/dashboard/admin/export` | Download CSV |

## Database

**Type:** SQLite  
**Location:** `./dev.db`  
**ORM:** Prisma v6.19.3

**Commands:**
```bash
npx prisma studio         # View database (http://localhost:5555)
npx prisma migrate reset  # Reset database
npx prisma db seed       # Seed data
```

## Debugging

### Start Server
```bash
cd C:\Users\1309499\brewing-sales-app-v2
npm run dev
```

### Check Server Running
```bash
netstat -ano | findstr :3000
```

### Kill Server
```bash
taskkill /PID [PID] /F
```

### View Database
```bash
npx prisma studio
```

### Check Logs
Server logs show in terminal where `npm run dev` is running

### Common Issues

**Can't save entry:**
- Using duplicate combination? Use Brazil/China instead of US/Germany
- See: ENTRY-FIX-COMPLETE.md

**Can't finalize:**
- Confidence % entered? (required)
- Market share = 100%? (required for enzymes with penetration > 0)
- See: WIZARD-FIXES.md

**Database error:**
- Check `dev.db` exists in root directory
- Restart server

**Port in use:**
```bash
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

## Documentation

- **README.md** - This file (overview + quick start)
- **ADMIN-APPROVAL-COMPLETE.md** - Approval workflow
- **ADMIN-PANEL-COMPLETE.md** - Admin panel features
- **ENTRY-FIX-COMPLETE.md** - Save/finalize issues
- **HOW-TO-REJECT.md** - Reject entries guide
- **WIZARD-FIXES.md** - Confidence + draft saving
- **TROUBLESHOOTING.md** - Common errors

## Technology Stack

- Next.js 14 (App Router) + TypeScript
- SQLite + Prisma ORM
- NextAuth.js + bcrypt
- Tailwind CSS
- Zod validation

---

**Server:** http://localhost:3000  
**Admin Login:** `admin@brewing.com` / `admin123`
