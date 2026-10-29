# Testing the App in GitHub Codespaces

Steps to run a shareable test copy of the app. The database is SQLite, so no extra services are needed.

## 1. Open a Codespace

1. Go to the repo on GitHub and switch to the `main` branch.
2. Click **Code → Codespaces → Create codespace on main**.

## 2. Install and set up the database

In the Codespace terminal:

```bash
npm install
npx prisma migrate deploy
npm run db:seed
```

## 3. Create `.env.local`

Create `.env.local` in the project root:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<any long random string>"
NEXTAUTH_URL="<forwarded URL from step 5>"
```

Use `.env.example` as a reference for other settings.

## 4. Start the app

```bash
npm run dev
```

## 5. Make the port public

1. Open the **Ports** tab.
2. Find port `3000`, set **Visibility** to **Public**.
3. Copy the URL and set it as `NEXTAUTH_URL` in `.env.local`.
4. Restart `npm run dev`.

## 6. Log in

Test accounts are created by the seed script in `prisma/seed.ts`.

## Notes

- Codespaces stop after about 30 minutes idle. Restart the Codespace and `npm run dev` to bring the app back. The forwarded URL may change, so update `NEXTAUTH_URL` if it does.
- Anyone with the public URL can use the test accounts. Don't enter real data.
- Never commit `.env.local`. It is gitignored.
