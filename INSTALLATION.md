# DAGDAG PUHUNAN — Complete Local Installation Guide

## Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ LTS | nodejs.org |
| npm | 9+ | (bundled with Node) |
| Git | Latest | git-scm.com |
| Supabase account | Free | supabase.com |

---

## Step 1 — Clone the project

```bash
git clone https://github.com/shan132131/puhunan-system.git
cd puhunan-system
```

Or download the ZIP from GitHub and extract it.

---

## Step 2 — Set up the database (Supabase)

1. Go to **supabase.com** → Sign up free → New project
   - Name: `puhunan-system`
   - Region: Southeast Asia (Singapore)
   - Wait ~2 minutes for it to provision

2. Go to **SQL Editor** → **New Query**

3. Paste the contents of `database/schema.sql` → Click **Run**

4. Paste the contents of `database/seed.sql` → Click **Run**

5. Go to **Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Step 3 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
JWT_SECRET=generate-with-node-crypto-randomBytes-64
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 4 — Install dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies  
cd server && npm install && cd ..
```

---

## Step 5 — Run the frontend (React)

```bash
npm run dev
```
Open **http://localhost:5173**

---

## Step 6 — Run the backend API server (optional)

```bash
npm run server:dev
```
Server runs on **http://localhost:3001**

The frontend works without the backend server (uses Supabase REST API directly).  
The backend server is needed for: email notifications, advanced reports, and automated penalties.

---

## Step 7 — Login and test

Use these credentials:

| Role | Email | Password |
|---|---|---|
| LGU Admin | maria@lgusanpedro.ph | Admin@2026 |
| Coop Officer | jose@coop.ph | Coop@2026 |
| MSME Borrower | ana@gmail.com | Msme@2026 |
| City Councilor | councilor.ligaya@sanpedro.ph | Council@2026 |

---

## Step 8 — Run tests

```bash
# Penalty calculator unit tests (no DB required)
cd server && npm test -- tests/penalty.test.js

# All tests (requires .env with real DB)
cd server && npm test
```

---

## Build for production

```bash
npm run build
# Output in dist/ folder
```

---

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules && npm install
cd server && rm -rf node_modules && npm install
```

### Database connection fails
- Verify `VITE_SUPABASE_URL` and keys in `.env`
- Check Supabase project is active (not paused)
- Make sure you ran `schema.sql` and `seed.sql`

### Blank screen / white page
- Open browser DevTools → Console tab
- Look for JavaScript errors
- Most common: missing `.env` values

### "Invalid token" after login
- Check `JWT_SECRET` is set in `.env`
- Clear browser localStorage: `localStorage.clear()` in DevTools console

### Port already in use
```bash
# Kill process on port 5173
npx kill-port 5173
# Kill process on port 3001
npx kill-port 3001
```

### Email notifications not sending
- Set `RESEND_API_KEY` in `.env`
- Get a free key at resend.com
- Check `logs/app.log` for email errors

---

## Directory Structure Reference

```
puhunan-system/
├── src/
│   ├── App.jsx          ← Main React app — rename from puhunan-system.jsx
│   └── main.jsx         ← Entry point
├── server/
│   ├── index.js         ← Express server
│   ├── routes/          ← API endpoints
│   ├── controllers/     ← Business logic
│   ├── middleware/       ← Auth, validation, error handling
│   ├── services/        ← Email, audit
│   ├── emails/          ← Email templates
│   ├── config/          ← Database client
│   └── utils/           ← Logger
├── database/
│   ├── schema.sql       ← Run first
│   └── seed.sql         ← Run second
├── tests/               ← Unit + integration tests
├── docs/                ← API docs, guides
├── index.html           ← Vite entry
├── vite.config.js       ← Vite config
├── package.json         ← Frontend deps
├── vercel.json          ← Vercel config
└── .env.example         ← Copy to .env
```
