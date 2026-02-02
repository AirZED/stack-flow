# 7-Day Uptime Demonstration (≥80%)

This document describes how StackFlow demonstrates **≥80% 7-day uptime** and where to attach logs or screenshots as evidence.

---

## 1. Health check endpoint

The app exposes a **public health endpoint** for monitoring:

| Item | Value |
|------|--------|
| **URL** | `https://<your-production-domain>/api/health` |
| **Method** | `GET` |
| **Expected response** | `200 OK` with JSON: `{ "status": "ok", "service": "StackFlow", "timestamp": "<ISO>", "version": "..." }` |

**Local check (after deploy):**
```bash
curl -s https://<your-production-domain>/api/health
```

---

## 2. How to demonstrate ≥80% uptime

### Option A: External uptime monitor (recommended)

1. **Sign up** for a free monitor (e.g. [UptimeRobot](https://uptimerobot.com), [Better Uptime](https://betteruptime.com), or [Cronitor](https://cronitor.io)).
2. **Add a monitor**:
   - **Type:** HTTP(s)
   - **URL:** `https://<your-production-domain>/api/health`
   - **Interval:** 5 minutes (or minimum allowed)
3. **Run for 7 days** so the service calculates uptime %.
4. **Capture evidence:**
   - **Screenshot:** Status page or dashboard showing 7-day uptime percentage (≥80%).
   - **Logs:** Export or copy the monitor’s incident/response log for the 7-day window (optional but good to attach).

**Where to paste evidence:** Use the “7-day evidence” section below (screenshots + summary table).

### Option B: Simple log table (manual or script)

If you prefer not to use a third-party monitor, you can:

1. **Ping the health URL** on a schedule (e.g. cron every 15–30 min) and log success/failure.
2. **Count** successful checks vs total checks over 7 days; uptime % = (successful / total) × 100.
3. **Attach:** A short log (or CSV) of timestamps and status codes, plus a one-line summary: *“Uptime over 7 days: X% (Y successful / Z checks).”*

---

## 3. 7-day evidence (attach logs or screenshots here)

**Monitoring period:** _YYYY-MM-DD_ to _YYYY-MM-DD_ (7 days)

**Monitor used:** _e.g. UptimeRobot / Better Uptime / custom script_

**Result:**

| Metric | Value |
|--------|--------|
| **7-day uptime** | ____% (target: ≥80%) |
| **Total checks** | ____ |
| **Successful (2xx)** | ____ |
| **Failed / timeouts** | ____ |

**Screenshot(s):**  
_Paste or link dashboard screenshot(s) showing 7-day uptime percentage and/or response history._

**Log excerpt (optional):**  
_Paste a short excerpt of response log (timestamp, status code, or “up/down”) for the 7-day window._

---

## 4. Checklist before submission

- [ ] Health endpoint deployed and returns `200` with JSON at `/api/health`.
- [ ] Monitor (or script) ran for a full **7 consecutive days**.
- [ ] Uptime percentage is **≥80%**.
- [ ] This document includes either:
  - A **screenshot** of the monitor’s 7-day uptime, or  
  - A **log/table** of checks with a clear uptime summary.

---

## 5. Deploying the health endpoint (Vercel)

The repo includes `api/health.js`. On Vercel:

- Deploy as usual; Vercel will expose `GET /api/health` automatically.
- Ensure `vercel.json` does not rewrite `/api/*` to the SPA (current setup keeps `/api/*` for API routes).
- After deploy, run: `curl -s https://<your-domain>/api/health` to confirm.

If you use another host (Netlify, etc.), add a serverless function or static response at `/api/health` that returns the same JSON and `200` status.
