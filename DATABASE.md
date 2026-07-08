# DAGDAG PUHUNAN — Database Documentation

## Technology: PostgreSQL via Supabase

---

## Entity Relationship Overview

```
users ─────────────────────── loan_applications
  │                                │    │
  │ (borrower_id)                  │    │
  │                                │    ├── verification_checklists (1:1)
  │                                │    ├── ci_reports (1:many)
  │                                │    └── repayments (1:1)
  │                                │              │
  │                                │              └── penalties (1:many)
  │
  └── audit_logs (actions)
      notifications (system-wide)
```

---

## Tables

### users
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PK | Auto-increment |
| name | TEXT | NOT NULL | Full name |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| password | TEXT | NOT NULL | bcrypt hash |
| role | TEXT | CHECK | lgu_admin / coop_officer / msme_borrower / city_councilor |
| status | TEXT | DEFAULT Active | Active / Inactive |
| cooperative | TEXT | | Coop name (officers only) |
| business | TEXT | | Business name (MSME only) |
| barangay | TEXT | | Home barangay (MSME only) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Registration date |

### loan_applications
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PK | Auto-increment |
| ref | TEXT | UNIQUE | e.g. DP-2026-0001 |
| borrower_id | INT | FK → users | Submitting borrower |
| name | TEXT | | Borrower name (denormalised for reporting) |
| category | TEXT | ENUM | Business category |
| amount | NUMERIC(12,2) | CHECK > 0 | Loan amount in PHP |
| term | INT | CHECK 3-36 | Repayment months |
| status | TEXT | ENUM | Current lifecycle stage |
| fund_source | TEXT | ENUM | LGU or City_Councilor |

**Status lifecycle:**
```
Pending → Under Verification → Under CI → Approved → Released → Active → Closed
                                                         └──────────→ Rejected
                                                                → Overdue
```

### repayments
One record per active loan. Updated with each payment.

| Column | Type | Description |
|---|---|---|
| loaned | NUMERIC | Original loan amount |
| paid | NUMERIC | Total amount paid to date |
| balance | NUMERIC | Remaining balance (loaned - paid + penalties) |
| due | NUMERIC | Monthly installment amount |
| due_date | DATE | Next payment due date |

### penalties
Immutable audit trail of every penalty applied.

| Column | Type | Description |
|---|---|---|
| repayment_id | INT FK | Associated repayment |
| days_overdue | INT | Total days past due date |
| grace_days | INT | Grace period applied |
| rate | NUMERIC | Daily rate used (0.001 = 0.1%) |
| amount | NUMERIC | Penalty amount charged |
| applied_by | INT FK | User who applied the penalty |

---

## Indexes

```sql
idx_users_email          -- Fast login lookup
idx_users_role           -- Role-based filtering
idx_apps_status          -- Dashboard status counts
idx_apps_borrower_id     -- MSME "my applications" queries
idx_apps_ref             -- Reference number lookup
idx_repayments_status    -- Overdue detection
idx_repayments_due_date  -- Upcoming payment queries
idx_audit_logs_created_at -- Log chronological ordering
idx_notifications_is_read -- Unread notification count
```

---

## Views

### loan_summary
Joins loan_applications + repayments + users for reporting:
```sql
SELECT a.*, r.paid, r.balance, r.due_date, r.status AS repay_status, u.email AS borrower_email
FROM loan_applications a
LEFT JOIN repayments r ON r.application_id = a.id
LEFT JOIN users u ON u.id = a.borrower_id;
```

---

## Backup

Supabase provides automated daily backups on the free tier (7-day retention).

Manual export:
```bash
# From Supabase dashboard → Settings → Database → Backups
# Or via pg_dump:
pg_dump "postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres" > backup.sql
```
