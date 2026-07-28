# Signup Feature - Testing Guide

## Server Status
✅ Server is running at **http://localhost:3000**

## What Was Fixed
1. ✅ Fixed validation schema error (removed invalid `errorMap` parameters)
2. ✅ Fixed login page Suspense boundary issue (wrapped `useSearchParams()` properly)
3. ✅ Build completed successfully
4. ✅ Server started without errors

## Features Added

### Signup Page (`/signup`)
- **URL:** http://localhost:3000/signup
- **Form Fields:**
  - Full Name (required)
  - Email (required, must be valid format)
  - Region (optional dropdown - populated from database)
  - Password (required, minimum 6 characters)
  - Confirm Password (required, must match)
- **Validation:**
  - Email format check
  - Password length check (minimum 6 characters)
  - Password confirmation match
  - Duplicate email prevention
- **Auto-assigned:** `account_manager` role

### API Endpoint (`/api/auth/signup`)
- **Method:** POST
- **Body:** `{ email, password, name, region }`
- **Returns:** User object or error
- **Creates:** User record + audit log entry
- **Security:** Password hashed with bcryptjs (10 rounds)

### Login Page Updates
- **URL:** http://localhost:3000/login
- **New Features:**
  - "Create one" link to signup page
  - Success message display after signup
  - Suspense boundary for proper rendering

## Test Steps

### Test 1: Create New Account
1. Go to http://localhost:3000/signup
2. Fill in the form:
   - Name: `Test Manager`
   - Email: `testuser@foodbio.com`
   - Region: `Americas` (or leave blank)
   - Password: `test123`
   - Confirm Password: `test123`
3. Click "Create Account"
4. **Expected:** Redirect to login page with green success message

### Test 2: Login with New Account
1. Should be on login page after signup
2. Enter credentials:
   - Email: `testuser@foodbio.com`
   - Password: `test123`
3. Click "Sign In"
4. **Expected:** Redirect to dashboard showing 0 entries (new account)

### Test 3: Duplicate Email Prevention
1. Go to http://localhost:3000/signup
2. Try to create account with same email: `testuser@foodbio.com`
3. **Expected:** Error message "An account with this email already exists"

### Test 4: Password Validation
1. Go to http://localhost:3000/signup
2. Try password: `test` (only 4 characters)
3. **Expected:** Error message "Password must be at least 6 characters"

### Test 5: Password Mismatch
1. Go to http://localhost:3000/signup
2. Password: `test123`
3. Confirm Password: `test456`
4. **Expected:** Error message "Passwords do not match"

### Test 6: Invalid Email
1. Go to http://localhost:3000/signup
2. Email: `notanemail` (no @ symbol)
3. **Expected:** Error message "Please enter a valid email address"

### Test 7: Region Dropdown
1. Go to http://localhost:3000/signup
2. Click Region dropdown
3. **Expected:** See list of regions (Americas, EMEA, Asia Pacific, etc.)

### Test 8: Create Entry with New Account
1. Login as the new test user
2. Click "Add New Entry"
3. Complete wizard steps
4. **Expected:** Can create entries like any other account manager

## Database Check

After creating a test account, verify in database:

```bash
cd C:\Users\1309499\food-biosciences-data-collection
npx prisma studio
```

1. Open `User` table
2. **Expected:** New record with:
   - email: `testuser@foodbio.com`
   - role: `account_manager`
   - password: (hashed value, not plain text)
   - region: `Americas` (if selected)

3. Open `AuditLog` table
4. **Expected:** New record with:
   - entityType: `User`
   - action: `created`
   - newValue: JSON with user details

## Files Modified

1. **app/signup/page.tsx** (NEW)
   - Complete signup form component
   - Client-side validation
   - Region dropdown integration

2. **app/api/auth/signup/route.ts** (NEW)
   - POST endpoint for account creation
   - Password hashing
   - Duplicate check
   - Audit logging

3. **app/login/page.tsx** (MODIFIED)
   - Added Suspense boundary for useSearchParams
   - Added success message display
   - Added "Create one" link to signup

4. **lib/validations/entry.ts** (FIXED)
   - Removed invalid errorMap parameters from z.enum()

## Security Features

- ✅ Passwords hashed with bcryptjs (bcrypt rounds: 10)
- ✅ Email stored as lowercase (prevents case-sensitive duplicates)
- ✅ Server-side validation (client validation can be bypassed)
- ✅ Duplicate email prevention
- ✅ Audit trail for all account creations
- ✅ No plain text passwords stored

## Known Limitations

1. **No email verification** - Users can immediately login (acceptable for internal tool)
2. **No password reset** - Admin must reset via database (Phase 2 feature)
3. **No password strength requirements** - Only minimum 6 characters (could add uppercase/number requirements)
4. **Manual role assignment only** - All signups get `account_manager` role (by design)

## Next Steps (If Requested)

### Potential Enhancements:
1. Email verification workflow
2. Password reset via email
3. Stronger password requirements (uppercase, numbers, special chars)
4. CAPTCHA for bot prevention
5. Rate limiting for signup attempts
6. Admin approval workflow for new signups
7. Self-service profile editing (change name, region)

## Success Criteria

- ✅ Users can create accounts without admin intervention
- ✅ Passwords are securely hashed
- ✅ Duplicate emails are prevented
- ✅ New users can immediately login and create entries
- ✅ All user creation is logged in audit trail
- ✅ Region field is optional but functional
