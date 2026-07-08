-- ============================================================
-- DAGDAG PUHUNAN — Seed Data
-- Run AFTER schema.sql
-- Passwords are bcrypt hashed (rounds=12)
-- Plain text passwords for testing:
--   Admin@2026 | Coop@2026 | Msme@2026 | Council@2026
-- ============================================================

-- ─── USERS ───────────────────────────────────────────────────
-- Note: In production, use the hash_password() function or your backend's
-- bcrypt to hash passwords. The hashes below are pre-computed for testing.
-- To generate: node -e "const b=require('bcryptjs');console.log(b.hashSync('Admin@2026',12))"

INSERT INTO users (name, email, password, role, cooperative, business, barangay) VALUES
  ('Maria Santos',
   'maria@lgusanpedro.ph',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeJf85bL8MFHB.K/uR9FKR.NK',
   'lgu_admin', '', '', ''),

  ('Jose Reyes',
   'jose@coop.ph',
   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWEKGu',
   'coop_officer', 'San Pedro Central Coop', '', ''),

  ('Ana Cruz',
   'ana@gmail.com',
   '$2b$12$Xp3ZqW8Kv2N5mY.Rb7tJTe3VZgPqR4sM6nEUcWL9hD8xQJzF2iOe',
   'msme_borrower', '', 'Cruz Sari-Sari Store', 'Poblacion'),

  ('Hon. Ligaya Dela Cruz',
   'councilor.ligaya@sanpedro.ph',
   '$2b$12$2mKQ5P9Nf8aVjZ3mH7wLXuZ9B4nK8pRzY6cQdF1mWs7tE3vXaG5ye',
   'city_councilor', '', '', ''),

  ('Pedro Santos',
   'pedro@gmail.com',
   '$2b$12$Xp3ZqW8Kv2N5mY.Rb7tJTe3VZgPqR4sM6nEUcWL9hD8xQJzF2iOe',
   'msme_borrower', '', 'Santos General Store', 'Bambang');

-- ─── LOAN APPLICATIONS ───────────────────────────────────────
INSERT INTO loan_applications
  (ref, borrower_id, name, business, category, barangay, amount, purpose, term, status, officer, fund_source, submitted)
VALUES
  ('DP-2026-0001', 3, 'Ana Cruz',           'Cruz Sari-Sari Store',   'sari-sari',     'Poblacion',  25000, 'Stock replenishment for the wet season',        12, 'Active',             'Jose Reyes', 'City_Councilor', '2026-01-10'),
  ('DP-2026-0002', 5, 'Roberto Dela Torre', 'Dela Torre Lechon',       'food-business', 'Bambang',    50000, 'Purchase of lechon equipment and supplies',      24, 'Under CI',           'Jose Reyes', 'LGU',            '2026-02-05'),
  ('DP-2026-0003', 5, 'Marilou Bautista',  'Bautista Ukay-Ukay',     'sari-sari',     'Landayan',   15000, 'Capital expansion and new display racks',        6,  'Pending',            'Jose Reyes', 'LGU',            '2026-03-01'),
  ('DP-2026-0004', 5, 'Fernando Ramos',    'Ramos Tricycle Services', 'tricycle',      'Estrella',   30000, 'Tricycle motor overhaul and body repair',        12, 'Overdue',            'Jose Reyes', 'City_Councilor', '2025-10-15'),
  ('DP-2026-0005', 5, 'Elvira Mendoza',    'Mendoza Kakanin',         'food-business', 'San Roque',  20000, 'Commercial kitchen equipment expansion',         12, 'Approved',           'Jose Reyes', 'LGU',            '2026-03-10'),
  ('DP-2026-0006', 5, 'Andres Villanueva', 'Villanueva Agri Farm',    'agri-processor','Cuyab',      45000, 'Purchase of seedlings and fertilizers for Q2',  18, 'Under Verification', 'Jose Reyes', 'LGU',            '2026-04-01'),
  ('DP-2026-0007', 5, 'Teresita Lim',      'Lim''s Home Bakery',      'food-business', 'Magsaysay',  10000, 'Commercial oven and baking equipment',          6,  'Closed',             'Jose Reyes', 'City_Councilor', '2025-06-01'),
  ('DP-2026-0008', 5, 'Domingo Santos',    'Santos Sari-Sari',        'sari-sari',     'Santo Niño', 20000, 'Restocking basic goods and beverages',          12, 'Released',           'Jose Reyes', 'LGU',            '2026-04-10');

-- ─── REPAYMENTS ──────────────────────────────────────────────
INSERT INTO repayments (application_id, ref, name, loaned, paid, balance, due, due_date, status, collector) VALUES
  (1, 'DP-2026-0001', 'Ana Cruz',       25000, 10000, 15000, 2500, '2026-08-01', 'Active',  'Jose Reyes'),
  (4, 'DP-2026-0004', 'Fernando Ramos', 30000, 5000,  25000, 2500, '2026-05-01', 'Overdue', 'Jose Reyes'),
  (7, 'DP-2026-0007', 'Teresita Lim',   10000, 10000, 0,    0,    '2026-01-01', 'Closed',  'Jose Reyes'),
  (8, 'DP-2026-0008', 'Domingo Santos', 20000, 2000,  18000, 2000, '2026-08-05', 'Active',  'Jose Reyes');

-- ─── NOTIFICATIONS ───────────────────────────────────────────
INSERT INTO notifications (title, message, is_read) VALUES
  ('Loan Approved',              'DP-2026-0005 — Elvira Mendoza''s loan of P20,000 has been approved.',   FALSE),
  ('Payment Due Reminder',       'DP-2026-0001 — Ana Cruz payment of P2,500 due on August 1.',             FALSE),
  ('Document Digitized via OCR', 'Handwritten form for DP-2026-0006 successfully digitized.',              TRUE),
  ('Application Forwarded to CI','DP-2026-0002 — Roberto Dela Torre forwarded to Credit Investigation.',   TRUE),
  ('Repayment Posted',           'Ana Cruz repayment of P2,500 posted — DP-2026-0001.',                    TRUE);

-- ─── AUDIT LOGS ──────────────────────────────────────────────
INSERT INTO audit_logs (username, role, action, record, ip) VALUES
  ('Maria Santos',  'LGU Admin',    'Approved loan application',               'DP-2026-0005', '192.168.1.10'),
  ('Jose Reyes',    'Coop Officer', 'Submitted CI report',                     'DP-2026-0002', '192.168.1.15'),
  ('Jose Reyes',    'Coop Officer', 'Recorded repayment P2,500',               'DP-2026-0001', '192.168.1.15'),
  ('Ana Cruz',      'MSME Borrower','Submitted new loan application',           'DP-2026-0001', '192.168.1.22'),
  ('Maria Santos',  'LGU Admin',    'Released loan disbursement',               'DP-2026-0008', '192.168.1.10'),
  ('Jose Reyes',    'Coop Officer', 'Completed verification checklist',         'DP-2026-0006', '192.168.1.15'),
  ('Maria Santos',  'LGU Admin',    'User login',                               'maria@lgusanpedro.ph', '192.168.1.10'),
  ('Jose Reyes',    'Coop Officer', 'Forwarded to Credit Investigation',        'DP-2026-0002', '192.168.1.15');

-- ─── VERIFICATION CHECKLIST SAMPLE ───────────────────────────
INSERT INTO verification_checklists (application_id, valid_id, proof_income, residence, barangay_clearance, references) VALUES
  (6, TRUE, TRUE, TRUE, FALSE, FALSE);  -- DP-2026-0006: 60% complete

-- ─── CI REPORT SAMPLE ────────────────────────────────────────
INSERT INTO ci_reports (application_id, officer_name, visit_date, employment_status, visit_notes, character_notes, score_financial, score_character, score_collateral, recommendation) VALUES
  (2, 'Jose Reyes', '2026-02-15', 'Self-employed', 'Business is operational and generating stable income.', 'Community members speak highly of the applicant.', 8, 9, 6, 'Recommend Approval');
