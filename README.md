<<<<<<< HEAD
# DAGDAG PUHUNAN, ZERO INTEREST
## Loan Management Information System
### LGU San Pedro, Laguna — Capstone Thesis Project

---

## Overview

Dagdag Puhunan is a full-stack web-based Loan Management Information System (LMIS) built for LGU San Pedro, Laguna. It manages the complete lifecycle of zero-interest micro-enterprise loans from application submission to full repayment closure.

### Key Features
- **4 User Roles**: LGU Admin, Cooperative Officer, MSME Borrower, City Councilor
- **Full Loan Lifecycle**: Submit → Verify → Credit Investigation → Approve → Release → Collect → Close
- **Real-time Dashboards** with priority alerts (overdue, pending, upcoming dues)
- **Audit Logging** of every system action
- **CSV Report Downloads** for all loan data
- **OCR Digitizer** for handwritten forms
- **OWASP ZAP** security testing ready
- **Mobile Responsive** with liquid glass UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Recharts |
| Backend (Option A) | Node.js + Express + Supabase (PostgreSQL) |
| Backend (Option B) | Supabase only (no server — REST API direct) |
| Database | PostgreSQL via Supabase |
| Hosting | Vercel (frontend) + Supabase (database) |
| Email | Resend (transactional email) |
| Auth | JWT (server) or Supabase Auth |

---

## Quick Start (Local)

```bash
# 1. Clone and install
git clone https://github.com/shan132131/puhunan-system.git
cd puhunan-system
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Set up database
# Go to supabase.com → SQL Editor → paste database/schema.sql → Run

# 4. Start frontend
npm run dev
# Open http://localhost:5173

# 5. (Optional) Start backend API server
cd server && npm install && npm run dev
# Server runs on http://localhost:3001
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| LGU Admin | maria@lgusanpedro.ph | Admin@2026 |
| Coop Officer | jose@coop.ph | Coop@2026 |
| MSME Borrower | ana@gmail.com | Msme@2026 |
| City Councilor | councilor.ligaya@sanpedro.ph | Council@2026 |

---

## Project Structure

```
puhunan-system/
├── src/
│   ├── App.jsx              # Main React application (2,800+ lines)
│   └── main.jsx             # React entry point
├── server/                  # Optional Express API server
│   ├── index.js             # Server entry point
│   ├── routes/              # API route handlers
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth, validation, rate limiting
│   ├── models/              # Database models
│   ├── services/            # Email, notifications
│   ├── emails/              # Email templates
│   └── config/              # Database, JWT config
├── database/
│   ├── schema.sql           # Full database schema
│   ├── seed.sql             # Seed data
│   └── migrations/          # Version-controlled schema changes
├── tests/                   # Unit + integration tests
├── docs/                    # Documentation
├── index.html               # Vite HTML entry
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies
├── vercel.json              # Vercel deployment config
└── .env.example             # Environment variable template
```

---

## Deployment

See [DEPLOY_STEPS.md](DEPLOY_STEPS.md) for Vercel deployment.  
See [BACKEND_SETUP.md](BACKEND_SETUP.md) for Supabase setup.  
See [ZAP_TESTING_GUIDE.md](ZAP_TESTING_GUIDE.md) for security testing.

---

## Security

- JWT authentication with role-based access control
- All inputs validated server-side
- SQL injection prevention via parameterised queries
- Security headers via Vercel (X-Frame-Options, CSP, HSTS)
- Audit logs for every privileged action
- Rate limiting on authentication endpoints
- OWASP ZAP tested

---

## License

Academic capstone project — LGU San Pedro, Laguna, 2026.
=======
# dagdag-puhunan
>>>>>>> aaa64d8657c78e2700db0e34dfc7f35e484a89ff
