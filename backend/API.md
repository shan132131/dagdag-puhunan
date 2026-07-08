# DAGDAG PUHUNAN — API Documentation
## Base URL: `http://localhost:3001` (dev) | `https://api.puhunan.vercel.app` (prod)

---

## Authentication

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

Tokens are obtained from `POST /api/auth/login`.

---

## Endpoints

### AUTH

#### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Body:**
```json
{ "email": "maria@lgusanpedro.ph", "password": "Admin@2026" }
```

**Response 200:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 1, "name": "Maria Santos", "email": "maria@lgusanpedro.ph",
    "role": "lgu_admin", "status": "Active", "cooperative": ""
  }
}
```

**Errors:** `401 Invalid email or password` | `403 Account deactivated` | `429 Too many attempts`

---

#### GET /api/auth/me
Get the authenticated user's profile.

**Auth:** Required

**Response 200:**
```json
{ "user": { "id": 1, "name": "Maria Santos", "role": "lgu_admin", ... } }
```

---

### APPLICATIONS

#### GET /api/applications
List loan applications. MSME borrowers see only their own.

**Auth:** Required  
**Query params:** `?status=Active&search=Ana`

**Response 200:**
```json
{ "applications": [{ "id": 1, "ref": "DP-2026-0001", "name": "Ana Cruz", "status": "Active", ... }] }
```

---

#### POST /api/applications
Submit a new loan application.

**Auth:** Required | **Roles:** MSME Borrower, LGU Admin, City Councilor

**Body:**
```json
{
  "business": "Cruz Sari-Sari Store",
  "category": "sari-sari",
  "barangay": "Poblacion",
  "amount": 25000,
  "purpose": "Stock replenishment",
  "term": 12
}
```

**Response 201:**
```json
{ "application": { "ref": "DP-2026-0009", "status": "Pending", ... }, "message": "Application DP-2026-0009 submitted successfully." }
```

**Side effects:** Sends confirmation email to borrower with reference number.

---

#### PATCH /api/applications/:id/status
Update the status of an application.

**Auth:** Required | **Roles:** LGU Admin, Coop Officer, City Councilor

**Body:**
```json
{ "status": "Approved" }
```

**Valid statuses:** `Pending | Under Verification | Under CI | Approved | Released | Active | Overdue | Closed | Rejected`

**Side effects:** Sends status update email to borrower. Auto-creates repayment record on `Released`.

---

#### PUT /api/applications/:id/checklist
Save verification checklist progress.

**Auth:** Required | **Roles:** Coop Officer, City Councilor

**Body:**
```json
{ "applicationId": 6, "validId": true, "proofIncome": true, "residence": true, "barangayClearance": false, "references": false }
```

**Note:** If all 5 items are true, application is automatically forwarded to CI.

---

#### POST /api/applications/:id/ci
Submit a Credit Investigation report.

**Auth:** Required | **Roles:** Coop Officer, City Councilor

**Body:**
```json
{
  "applicationId": 2,
  "visitDate": "2026-02-15",
  "employmentStatus": "Self-employed",
  "visitNotes": "Business is operational.",
  "characterNotes": "Well-regarded in the community.",
  "scoreFinancial": 8,
  "scoreCharacter": 9,
  "scoreCollateral": 6,
  "recommendation": "Recommend Approval"
}
```

---

### REPAYMENTS

#### GET /api/repayments
List repayment records.

**Auth:** Required

---

#### POST /api/repayments/:id/pay
Record a payment for a repayment record.

**Auth:** Required | **Roles:** Coop Officer, LGU Admin, City Councilor

**Side effects:** Sends payment receipt email. Closes loan if balance reaches 0.

---

#### POST /api/repayments/:id/penalty
Apply an automated penalty to an overdue account.

**Auth:** Required | **Roles:** Coop Officer, LGU Admin, City Councilor

**Algorithm:**
- Grace period: 3 days (no penalty within grace period)
- Rate: 0.1% per day on outstanding balance
- Cap: 20% of original principal
- `penalty = balance × 0.001 × max(0, daysOverdue - 3)`

**Response 200:**
```json
{
  "repayment": { ... },
  "penaltyDetails": {
    "daysOverdue": 15, "graceDays": 3, "penaltyDays": 12,
    "rate": 0.001, "amount": 300.00
  }
}
```

---

#### GET /api/repayments/overdue
Get all overdue accounts with calculated days overdue and estimated penalty.

---

### USERS

#### GET /api/users
List all system users.

**Auth:** Required | **Roles:** LGU Admin, City Councilor

---

#### PATCH /api/users/:id/status
Toggle user active/inactive status.

**Auth:** Required | **Roles:** LGU Admin, City Councilor

---

### REPORTS

All report endpoints require: **LGU Admin, Coop Officer, or City Councilor** role.

| Endpoint | Description | Format |
|---|---|---|
| `GET /api/reports/applications` | Full loan applications list | CSV |
| `GET /api/reports/collections`  | Repayment records          | CSV |
| `GET /api/reports/delinquency`  | Overdue accounts           | CSV |
| `GET /api/reports/renewal`      | Closed loans eligible for renewal | CSV |
| `GET /api/reports/analytics`    | Dashboard KPIs + recent activity | JSON |

---

### NOTIFICATIONS

#### GET /api/notifications
Get recent notifications (last 30).

#### PATCH /api/notifications/read-all
Mark all notifications as read.

---

### AUDIT LOGS

#### GET /api/audit
Get audit log entries (last 100 by default).

**Auth:** Required | **Roles:** LGU Admin, City Councilor

**Query params:** `?limit=50`

---

## Error Responses

All errors follow this format:
```json
{ "error": "Human-readable error message.", "details": [...] }
```

| Code | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
