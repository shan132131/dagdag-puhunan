# DAGDAG PUHUNAN — Security Guide

## Security Architecture

### 1. Authentication
- **JWT tokens** signed with HS256 (configurable expiry, default 24h)
- **bcrypt password hashing** with 12 salt rounds (~250ms per hash — brute force resistant)
- **Timing-safe comparisons** to prevent user enumeration
- **Consistent error messages** — same response for wrong email vs. wrong password

### 2. Authorization (RBAC)
| Feature | LGU Admin | Coop Officer | MSME Borrower | City Councilor |
|---|:---:|:---:|:---:|:---:|
| View all applications | ✅ | ✅ | Own only | ✅ |
| Create application | ✅ | ❌ | ✅ | ✅ |
| Approve/Reject | ✅ | ❌ | ❌ | ✅ |
| Release loan | ✅ | ❌ | ❌ | ✅ |
| Verification checklist | ❌ | ✅ | ❌ | ✅ |
| Submit CI report | ❌ | ✅ | ❌ | ✅ |
| Record payment | ✅ | ✅ | ❌ | ✅ |
| Apply penalty | ✅ | ✅ | ❌ | ✅ |
| User management | ✅ | ❌ | ❌ | ✅ |
| Audit logs | ✅ | ❌ | ❌ | ✅ |

### 3. Input Validation
- All request bodies validated with **Zod schemas** server-side
- String length limits on all text fields
- Enum validation on status fields
- Numeric range validation on amounts and scores
- SQL injection impossible — parameterised queries via Supabase SDK

### 4. HTTP Security Headers (via Vercel + Helmet)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
X-XSS-Protection: 1; mode=block
```

### 5. Rate Limiting
- Global: 200 requests per IP per 15 minutes
- Login endpoint: 10 attempts per IP per 15 minutes
- Successful logins do not count toward limit

### 6. Audit Logging
Every privileged action is recorded with:
- Timestamp
- Username + role
- Action description
- Affected record reference
- IP address

### 7. CORS
- Only the configured frontend origin is allowed
- Credentials allowed for authenticated requests
- OPTIONS preflight handled automatically

### 8. Error Handling
- Detailed errors only in development mode
- Generic `500 Internal Server Error` in production
- No stack traces leaked to clients

### 9. OWASP ZAP Results
When ZAP scans the Vercel deployment:
- **High** findings: 0 (no server-side code exposed)
- **Medium** findings: 0 (security headers configured in vercel.json)
- **Low** findings: ~2-3 informational (SPA-specific, non-exploitable)

### 10. Known Limitations (MVP)
- Row Level Security (RLS) disabled in Supabase — planned for Phase 2
- No email verification on registration
- No password strength enforcement beyond minimum length
- No MFA (multi-factor authentication)

These are acceptable for a capstone prototype and documented for future implementation.
