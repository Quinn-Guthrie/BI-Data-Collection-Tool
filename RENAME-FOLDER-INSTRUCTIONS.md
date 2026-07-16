# Folder Rename Instructions

## ⚠️ Important: Manual Rename Required

The folder cannot be renamed while the dev server or any processes are running inside it. Follow these steps:

### Step 1: Stop All Processes

1. **Stop the dev server** if running:
   - Press `Ctrl+C` in the terminal where `npm run dev` is running
   - Wait for it to fully stop

2. **Close all applications** that may have files open:
   - Close VS Code (or any IDE with this folder open)
   - Close any file explorer windows showing this folder
   - Close any terminals with this folder as the working directory

### Step 2: Rename the Folder

**Option A: File Explorer (Windows)**
```
1. Navigate to: C:\Users\1309499\
2. Find folder: brewing-sales-app-v2
3. Right-click → Rename
4. New name: food-biosciences-data-collection
5. Press Enter
```

**Option B: Command Prompt**
```bash
cd C:\Users\1309499
ren brewing-sales-app-v2 food-biosciences-data-collection
```

**Option C: PowerShell**
```powershell
cd C:\Users\1309499
Rename-Item brewing-sales-app-v2 food-biosciences-data-collection
```

### Step 3: Verify and Restart

1. **New path should be:**
   ```
   C:\Users\1309499\food-biosciences-data-collection
   ```

2. **Navigate to new folder:**
   ```bash
   cd C:\Users\1309499\food-biosciences-data-collection
   ```

3. **Verify files are intact:**
   ```bash
   ls
   ```
   You should see: app/, components/, lib/, prisma/, package.json, etc.

4. **Start the server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Step 4: Update Git Remote (if applicable)

If you have a remote repository, update the repository name on GitHub/GitLab:

1. Go to repository settings
2. Rename repository to: `food-biosciences-data-collection`
3. Update local remote URL:
   ```bash
   git remote set-url origin <new-repo-url>
   ```

---

## ✅ What's Already Updated

All code and documentation already uses the new name:

✅ package.json: `"name": "food-biosciences-data-collection"`
✅ All documentation references updated
✅ Login email: `admin@foodbio.com`
✅ App title: "Food Biosciences Data Collection"
✅ Export filenames: `food_biosciences_*`
✅ All 40+ .md and .txt files updated

**Only the folder name needs manual rename!**

---

## 🔍 Troubleshooting

**Error: "The action can't be completed because the folder is open"**
- Close all programs accessing the folder
- Check Task Manager for node.exe processes and end them
- Try again

**Error: "Access is denied"**
- Run Command Prompt as Administrator
- Use the rename command

**Git issues after rename:**
```bash
cd C:\Users\1309499\food-biosciences-data-collection
git status  # Should work normally
```

Git tracks by folder content, not name, so your git history is preserved!

---

## 📊 Summary

**OLD:** `C:\Users\1309499\brewing-sales-app-v2`  
**NEW:** `C:\Users\1309499\food-biosciences-data-collection`

This matches the rebrand from "Brewing Sales Exercise" to "Food Biosciences Data Collection" multi-segment platform.
