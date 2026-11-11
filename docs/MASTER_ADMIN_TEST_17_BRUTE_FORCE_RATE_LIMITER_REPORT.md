# GATE 5 — TEST 17 (TC-C05): BRUTE-FORCE RATE LIMITER VERIFICATION REPORT

**Test ID:** TC-C05  
**Execution Date:** 2026-11-10  
**Target Worktree:** `D:\HindustanProjects\Hipro-Website\Hipro-Main` (branch: `main`)  
**Target Endpoint:** `http://127.0.0.1:5000/api/auth/login` (Backend) / `http://localhost:3000/api/auth/login` (Frontend Proxy)  
**Database:** Isolated local QA PostgreSQL on port `5433` (`hipro_local_dev`)  
**Client IP Bound:** `127.0.0.5` (Consistent isolated local loopback client)  
**Test Account:** `ratelimit.test@nonexistent-qa.local` (Dedicated non-existent QA account)  
**Overall Verdict:** **PASS**

---

## 1. Environment & Production Isolation Confirmation

- **Loopback Enforcement:** All requests were strictly directed to loopback addresses (`127.0.0.1:5000` and `127.0.0.5`).
- **Production Isolation:** Zero requests were sent to production domains, APIs, Render backends, or Vercel edge routes.
- **Account Protection:** A dedicated non-existent QA identity (`ratelimit.test@nonexistent-qa.local`) was used with dummy credentials. No real administrator or employee accounts (`admin@hindustanprojects.in`, `staff.leads@hindustanprojects.in`, `staff.multi@hindustanprojects.in`) were targeted or affected.
- **Code & Config Integrity:** No code, environment, or configuration files were modified.

---

## 2. Rate-Limiting Policy & Configuration

Inspected in [`backend/src/middleware/rateLimiter.ts`](file:///D:/HindustanProjects/Hipro-Website/Hipro-Main/backend/src/middleware/rateLimiter.ts#L67-L72):

```typescript
export const authLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes (900,000 ms)
  max: 5,                   // Maximum 5 attempts per window per IP
  message: "Too many login attempts. Please try again after 15 minutes.",
});
```

- **Threshold:** Exactly **5 attempts**.
- **Sliding Window:** **15 minutes** (`900 seconds`).
- **Granularity:** Per client IP (`req.ip || req.socket.remoteAddress || "127.0.0.1"`).
- **Standards Headers:** `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After`.

---

## 3. Controlled Sequence Execution Results

From consistent local client IP `127.0.0.5`, 6 sequential login attempts were dispatched targeting `http://127.0.0.1:5000/api/auth/login` using the dedicated non-existent account:

```
+---------+--------------------------+--------+-----------------+---------------------+-------------------+-------------+------------------------------------+
| Attempt | Timestamp (UTC)          | Status | RateLimit-Limit | RateLimit-Remaining | RateLimit-Reset   | Retry-After | Response Error Body                |
+---------+--------------------------+--------+-----------------+---------------------+-------------------+-------------+------------------------------------+
| 1       | 2026-11-10T05:17:29.375Z | 401    | 5               | 4                   | 1794288750 (Unix) | —           | "Invalid credentials"              |
| 2       | 2026-11-10T05:17:29.664Z | 401    | 5               | 3                   | 1794288750 (Unix) | —           | "Invalid credentials"              |
| 3       | 2026-11-10T05:17:29.929Z | 401    | 5               | 2                   | 1794288750 (Unix) | —           | "Invalid credentials"              |
| 4       | 2026-11-10T05:17:30.202Z | 401    | 5               | 1                   | 1794288750 (Unix) | —           | "Invalid credentials"              |
| 5       | 2026-11-10T05:17:30.467Z | 401    | 5               | 0                   | 1794288750 (Unix) | —           | "Invalid credentials"              |
| 6       | 2026-11-10T05:17:30.725Z | 429    | 5               | 0                   | 1794288750 (Unix) | 899s        | "Too many login attempts.          |
|         |                          |        |                 |                     |                   |             |  Please try again after 15 min."   |
+---------+--------------------------+--------+-----------------+---------------------+-------------------+-------------+------------------------------------+
```

### Detailed Observations:
1. **Attempts 1–5 (Status 401):**
   - The server processed credential verification, failed on non-existent account, and returned `401 Unauthorized`.
   - `RateLimit-Remaining` accurately decremented from `4` down to `0`.
   - Security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) were returned on all responses.
2. **Attempt 6 (Status 429 — Too Many Requests):**
   - The rate-limiting middleware intercepted the request before credential processing or database access.
   - HTTP Status returned: **`429 Too Many Requests`**.
   - `Retry-After` header returned: **`899`** seconds (precisely reflecting the remaining window of the ~15-minute sliding period).
   - Response Body: `{"success":false,"error":"Too many login attempts. Please try again after 15 minutes."}`.
   - Effective lockout duration confirmed: **15 minutes**.
3. **Post-429 Discipline:**
   - As mandated, testing halted immediately upon receiving the HTTP 429 response. No repeated requests were issued.

---

## 4. Database Invariants Verification

| Invariant Table | Pre-Test Baseline | Post-Test Final | Delta | State |
| :--- | :---: | :---: | :---: | :---: |
| `AdminUser` | **3** | **3** | **0** | **UNMODIFIED** |
| `AdminSession` | **6** | **6** | **0** | **UNMODIFIED** |

- Zero database records created, updated, or deleted.
- Zero sessions generated.

---

## 5. Security & Verification Conclusion

The Master Admin login endpoint enforces strict brute-force rate-limiting:
- 5 attempts allowed per 15-minute rolling window per IP.
- The 6th attempt is reliably blocked at the middleware layer with HTTP 429.
- Full RFC-compliant `Retry-After` and `RateLimit-*` headers are populated.
- No information leakage, password exposure, or session generation occurred.

**Test TC-C05 is confirmed: PASS.**

