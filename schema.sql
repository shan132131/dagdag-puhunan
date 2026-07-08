-- ============================================================
-- DAGDAG PUHUNAN, ZERO INTEREST — Complete Database Schema
-- PostgreSQL via Supabase
-- Run in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── CLEAN SLATE (safe re-run) ───────────────────────────────
DROP TABLE IF EXISTS audit_logs             CASCADE;
DROP TABLE IF EXISTS notifications          CASCADE;
DROP TABLE IF EXISTS penalties              CASCADE;
DROP TABLE IF EXISTS repayments             CASCADE;
DROP TABLE IF EXISTS ci_reports             CASCADE;
DROP TABLE IF EXISTS verification_checklists CASCADE;
DROP TABLE IF EXISTS loan_applications      CASCADE;
DROP TABLE IF EXISTS users                  CASCADE;

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT        NOT NULL,  -- bcrypt hash
  role        TEXT        NOT NULL   CHECK (role IN ('lgu_admin','coop_officer','msme_borrower','city_councilor')),
  status      TEXT        NOT NULL   DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  cooperative TEXT        DEFAULT '',
  business    TEXT        DEFAULT '',
  barangay    TEXT        DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ─── LOAN APPLICATIONS ───────────────────────────────────────
CREATE TABLE loan_applications (
  id           SERIAL PRIMARY KEY,
  ref          TEXT UNIQUE NOT NULL,
  borrower_id  INT  REFERENCES users(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  business     TEXT DEFAULT '',
  category     TEXT DEFAULT 'sari-sari'
               CHECK (category IN ('sari-sari','food-business','tricycle','agri-processor','other')),
  barangay     TEXT DEFAULT '',
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  purpose      TEXT DEFAULT '',
  term         INT  NOT NULL DEFAULT 12 CHECK (term BETWEEN 3 AND 36),
  status       TEXT NOT NULL DEFAULT 'Pending'
               CHECK (status IN ('Pending','Under Verification','Under CI','Approved','Released','Active','Overdue','Closed','Rejected')),
  officer      TEXT DEFAULT 'Jose Reyes',
  fund_source  TEXT DEFAULT 'LGU' CHECK (fund_source IN ('LGU','City_Councilor')),
  submitted    DATE DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apps_status      ON loan_applications(status);
CREATE INDEX idx_apps_borrower_id ON loan_applications(borrower_id);
CREATE INDEX idx_apps_ref         ON loan_applications(ref);
CREATE INDEX idx_apps_submitted   ON loan_applications(submitted);

-- ─── VERIFICATION CHECKLISTS ─────────────────────────────────
CREATE TABLE verification_checklists (
  id                   SERIAL PRIMARY KEY,
  application_id       INT  REFERENCES loan_applications(id) ON DELETE CASCADE,
  valid_id             BOOLEAN DEFAULT FALSE,
  proof_income         BOOLEAN DEFAULT FALSE,
  residence            BOOLEAN DEFAULT FALSE,
  barangay_clearance   BOOLEAN DEFAULT FALSE,
  "references"           BOOLEAN DEFAULT FALSE,
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (application_id)
);

-- ─── CI REPORTS ──────────────────────────────────────────────
CREATE TABLE ci_reports (
  id                   SERIAL PRIMARY KEY,
  application_id       INT  REFERENCES loan_applications(id) ON DELETE CASCADE,
  officer_name         TEXT,
  visit_date           DATE,
  employment_status    TEXT,
  visit_notes          TEXT DEFAULT '',
  character_notes      TEXT DEFAULT '',
  score_financial      INT  CHECK (score_financial BETWEEN 1 AND 10),
  score_character      INT  CHECK (score_character BETWEEN 1 AND 10),
  score_collateral     INT  CHECK (score_collateral BETWEEN 1 AND 10),
  recommendation       TEXT,
  submitted_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REPAYMENTS ──────────────────────────────────────────────
CREATE TABLE repayments (
  id             SERIAL PRIMARY KEY,
  application_id INT  REFERENCES loan_applications(id) ON DELETE CASCADE,
  ref            TEXT NOT NULL,
  name           TEXT NOT NULL,
  loaned         NUMERIC(12,2) NOT NULL CHECK (loaned > 0),
  paid           NUMERIC(12,2) DEFAULT 0 CHECK (paid >= 0),
  balance        NUMERIC(12,2) NOT NULL CHECK (balance >= 0),
  due            NUMERIC(12,2) NOT NULL CHECK (due > 0),
  due_date       DATE,
  status         TEXT DEFAULT 'Active' CHECK (status IN ('Active','Overdue','Closed')),
  collector      TEXT DEFAULT 'Jose Reyes',
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repayments_status   ON repayments(status);
CREATE INDEX idx_repayments_ref      ON repayments(ref);
CREATE INDEX idx_repayments_due_date ON repayments(due_date);

-- ─── PENALTIES ───────────────────────────────────────────────
CREATE TABLE penalties (
  id             SERIAL PRIMARY KEY,
  repayment_id   INT  REFERENCES repayments(id) ON DELETE CASCADE,
  days_overdue   INT  NOT NULL DEFAULT 0,
  grace_days     INT  NOT NULL DEFAULT 3,
  rate           NUMERIC(6,4) NOT NULL DEFAULT 0.001,
  amount         NUMERIC(12,2) NOT NULL,
  applied_by     INT  REFERENCES users(id) ON DELETE SET NULL,
  applied_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE notifications (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ─── AUDIT LOGS ──────────────────────────────────────────────
CREATE TABLE audit_logs (
  id         SERIAL PRIMARY KEY,
  username   TEXT NOT NULL,
  role       TEXT NOT NULL,
  action     TEXT NOT NULL,
  record     TEXT NOT NULL,
  ip         TEXT DEFAULT '0.0.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_username   ON audit_logs(username);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ─── VIEWS ───────────────────────────────────────────────────
CREATE OR REPLACE VIEW loan_summary AS
  SELECT
    a.id, a.ref, a.name, a.business, a.category, a.barangay,
    a.amount, a.purpose, a.term, a.status, a.officer,
    a.fund_source, a.submitted,
    r.paid, r.balance, r.due, r.due_date, r.status AS repay_status,
    u.email AS borrower_email
  FROM loan_applications a
  LEFT JOIN repayments r ON r.application_id = a.id
  LEFT JOIN users u      ON u.id = a.borrower_id;

-- ─── ROW LEVEL SECURITY (disabled for MVP, enable for production) ──
ALTER TABLE users                   DISABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications       DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_checklists DISABLE ROW LEVEL SECURITY;
ALTER TABLE ci_reports              DISABLE ROW LEVEL SECURITY;
ALTER TABLE repayments              DISABLE ROW LEVEL SECURITY;
ALTER TABLE penalties               DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications           DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs              DISABLE ROW LEVEL SECURITY;
