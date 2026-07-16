# Troubleshooting Guide

## 🚨 Quick Fixes

### Issue: Server Won't Start

**Error:** "Port 3000 is already in use"

```bash
# Find what's using port 3000
netstat -ano | grep :3000

# Kill the process (replace <PID> with the number shown)
taskkill /PID <PID> /F

# Start server
npm run dev
```

---

### Issue: Can't Login

**Symptoms:** "Invalid credentials" error

**Fix 1: Reset database**
```bash
npm run db:seed
```

**Fix 2: Check password**
- Use: `admin123` (not Admin123 or ADMIN123)
- Email: `john@foodbio.com` (lowercase)

**Fix 3: Clear browser cache**
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

---

### Issue: Wizard Not Appearing

**Symptoms:** Blank page or "Loading..." forever

**Check 1: Is server running?**
```bash
# You should see: "Ready in X ms"
# If not, restart: npm run dev
```

**Check 2: Go to correct URL**
```
✓ http://localhost:3000/dashboard/entries/new
✗ http://localhost:3000/entries/new (missing /dashboard)
```

**Check 3: Browser console**
- Press F12
- Look for red errors in Console tab
- Check Network tab for failed API calls

---

### Issue: Can't See Test Entries

**Symptoms:** Dashboard shows 0 entries

**Check login:**
```
✓ john@foodbio.com - Has 2 test entries
✗ admin@foodbio.com - Sees all entries (may be empty if fresh DB)
```

**Re-add test entries:**
```bash
npx tsx prisma/seed-test-entries.ts
```

---

### Issue: Wizard Won't Save

**Symptoms:** Click "Finalize" but nothing happens

**Check 1: Browser console (F12)**
Look for validation errors like:
- "Market share must total 100%"
- "Company is required"
- "Penetration % required for used enzymes"

**Check 2: Required fields**
- Step 2: Country selected?
- Step 3: Company selected?
- Step 4: Segment selected?
- Step 6: All market shares = 100%?

**Check 3: Server terminal**
- Look for error messages
- Check if API call reached server

---

### Issue: Market Share Won't Validate

**Error:** "Market share must total 100%"

**Fix: Use decimals**
```
✗ 33 + 33 + 33 = 99%  (blocked)
✓ 33.3 + 33.3 + 33.4 = 100%  (works)
```

**Quick totals:**
- 50 / 50 / 0 / 0 = 100%
- 25 / 25 / 25 / 25 = 100%
- 60 / 30 / 10 / 0 = 100%

---

### Issue: Database Errors

**Error:** "Prisma Client not initialized"

```bash
npx prisma generate
```

**Error:** "Can't reach database"

Check `.env.local` exists:
```env
DATABASE_URL="file:./prisma/dev.db"
```

**Error:** "Table doesn't exist"

```bash
# Reset database
npx prisma migrate reset --force
npm run db:seed
```

---

### Issue: Changes Not Showing

**Symptoms:** Made code changes but nothing updates

**Fix: Hard refresh**
- Ctrl+F5 (Windows)
- Cmd+Shift+R (Mac)

**Fix: Restart server**
```bash
# Stop server: Ctrl+C
# Start again: npm run dev
```

**Fix: Clear Next.js cache**
```bash
# Delete .next folder
rm -rf .next
npm run dev
```

---

## 🔍 Debugging Tools

### View Database Contents

```bash
npx prisma studio
```
Opens at: http://localhost:5555

**Check:**
- `Entry` table → Your entries
- `EntryEnzymeValue` table → Enzyme data
- `User` table → All 4 test accounts exist?
- `Cycle` table → "2026 Annual" status = "open"?

---

### Browser Developer Tools (F12)

**Console Tab:**
- Shows JavaScript errors
- Shows API responses
- Shows validation messages

**Network Tab:**
- See all API calls
- Click on failed requests (red)
- Check "Response" tab for error details

**Application Tab:**
- Check cookies (session should exist)
- Check Local Storage (should be empty - we use DB now)

---

### Server Logs

**Good signs:**
```
✓ Ready in 582ms
GET /api/lookups/countries 200
POST /api/entries 201
```

**Bad signs:**
```
✗ Error: Prisma Client not found
✗ 500 Internal Server Error
✗ TypeError: Cannot read property 'id' of undefined
```

---

## 📊 Validate Your Data

### Check Entry Saved

1. Open Prisma Studio: `npx prisma studio`
2. Go to `Entry` table
3. Find your entry by company name
4. Click to see full details

### Check Enzyme Values

1. In Prisma Studio, go to `EntryEnzymeValue` table
2. Filter by `entryId` (your entry ID)
3. Should see 8 rows (one per enzyme category)
4. Check market shares total 100%

---

## 🔄 Reset Everything

**Nuclear option - start fresh:**

```bash
# 1. Delete database
rm prisma/dev.db

# 2. Recreate
npx prisma migrate reset --force

# 3. Add seed data
npm run db:seed

# 4. Add test entries
npx tsx prisma/seed-test-entries.ts

# 5. Restart server
npm run dev
```

---

## 🆘 Still Stuck?

### Collect This Information:

1. **What were you trying to do?**
   - Create entry? View dashboard? Login?

2. **What happened instead?**
   - Error message?
   - Blank screen?
   - Wrong data?

3. **Browser console errors (F12)**
   - Copy/paste any red errors

4. **Server terminal output**
   - Copy/paste last 20 lines

5. **Your environment**
   - Browser: Chrome/Firefox/Edge?
   - URL you're accessing?
   - Which test account?

---

## 📝 Common Error Messages

**"Invalid credentials"**
→ Check email/password spelling (use lowercase)

**"An entry already exists for this combination"**
→ You're creating duplicate Company+Country+Segment
→ Edit existing entry instead

**"Validation failed"**
→ Check browser console for specific field errors
→ Verify all required fields filled

**"Failed to fetch"**
→ Server not running or crashed
→ Restart: `npm run dev`

**"Prisma Client not generated"**
→ Run: `npx prisma generate`

**"Port 3000 in use"**
→ Kill existing process (see Quick Fixes above)

---

**Last Updated:** 2026-07-15
