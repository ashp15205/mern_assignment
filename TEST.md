# Manual Testing Guide — Mini Project Planner

Use this checklist to verify the app, API, and MongoDB Atlas data.

---

## Part A — MongoDB Atlas: what to check

### Where to look in Atlas

1. Log in → **Database** (left sidebar).
2. Click **Browse Collections** on your cluster.
3. You should see:

| Level | Name | Meaning |
|-------|------|---------|
| **Database** | `mini-project-planner` | From `MONGODB_URI` in `backend/.env` |
| **Collection** | `users` | Stores registered users |
| **Collection** | `tasks` | Mongoose pluralizes model `Task` → `tasks` |

If the database does not appear yet → create an account and one task in the UI first, then refresh Atlas.

### What each document looks like

After creating a task, open **tasks** → click a document. Example fields:

```json
{
  "_id": { "$oid": "674a1b2c3d4e5f6789012345" },
  "name": "Design",
  "duration": 3,
  "dependencies": [],
  "status": "Pending",
  "startDay": 0,
  "endDay": 3,
  "isCritical": true,
  "createdAt": { "$date": "..." },
  "updatedAt": { "$date": "..." },
  "__v": 0
}
```

| Field | Set by | What to verify |
|-------|--------|----------------|
| `userId` | Backend | Matches the `_id` of the user who created it |
| `name` | You (form) | Matches task name |
| `duration` | You (form) | Number ≥ 0 |
| `dependencies` | You (picker) | Array of `_id` strings (ObjectIds) of predecessor tasks |
| `status` | You (form/dropdown) | `Pending`, `In Progress`, or `Completed` |
| `startDay` | **Scheduling engine** | Earliest start (Day 0 = project start) |
| `endDay` | **Scheduling engine** | `startDay + duration` |
| `isCritical` | **Scheduling engine** | `true` on critical path tasks |
| `createdAt` / `updatedAt` | MongoDB | Auto timestamps |

### How to confirm data is saving

| Action in UI | What to check in Atlas |
|--------------|------------------------|
| Create task "Design" | New document appears; `name: "Design"` |
| Create "Frontend" depending on Design | `dependencies` contains Design’s `_id` |
| After create | `startDay` / `endDay` populated (not null) |
| Delete a task | Document removed; other tasks’ `dependencies` no longer reference it |
| Change status in table | Only `status` changes; `startDay`/`endDay` unchanged |
| Recalculate schedule | `startDay`, `endDay`, `isCritical` updated on all docs |

### Quick Atlas tests

- [ ] **T-ATLAS-1:** Empty app → no `mini-project-planner` DB (or empty `tasks`).
- [ ] **T-ATLAS-2:** Sign up new user → 1 document in `users`.
- [ ] **T-ATLAS-3:** Create 1 task → 1 document in `tasks`, check its `userId` matches the user.
- [ ] **T-ATLAS-4:** Create 4 assignment tasks → 4 documents.
- [ ] **T-ATLAS-4:** Delete one task → document gone in Atlas + UI.
- [ ] **T-ATLAS-5:** `dependencies` on Testing includes **two** ObjectIds (Frontend + Backend).

### Atlas troubleshooting

| Issue | Fix |
|-------|-----|
| No database | Backend not connected; check `/health` → `database: connected` |
| DB name different | Check `MONGODB_URI` path: `...mongodb.net/YOUR_DB_NAME` |
| Fields always null for schedule | Schedule not run; create task again or POST `/tasks/schedule` |
| Old data after reset | In Atlas: **tasks** → delete all documents, or drop collection |

---

## Part B — Pre-test setup

- [ ] MongoDB Atlas (or local) running
- [ ] `backend/.env` has correct `MONGODB_URI`
- [ ] Terminal 1: `npm run dev:backend` → `MongoDB connected`
- [ ] Terminal 2: `npm run dev:frontend`
- [ ] http://localhost:3000 loads
- [ ] http://localhost:5000/health → `"database": "connected"`

Optional — clear data before a full test run:

- Atlas: delete all documents in `tasks`, **or**
- PowerShell: delete each task from UI

---

## Part C — Assignment example (core requirement)

Create in order:

| # | Name | Duration | Dependencies |
|---|------|----------|--------------|
| 1 | Design | 3 | none |
| 2 | Frontend | 4 | Design |
| 3 | Backend | 5 | Design |
| 4 | Testing | 2 | Frontend + Backend |

### Expected schedule (table)

| Task | startDay | endDay | Critical? |
|------|----------|--------|-----------|
| Design | 0 | 3 | Yes |
| Frontend | 3 | 7 | No |
| Backend | 3 | 8 | Yes |
| Testing | 8 | 10 | Yes |

- [ ] **T-CORE-1:** All four rows match table above.
- [ ] **T-CORE-2:** Summary shows **Project end: Day 10**.
- [ ] **T-CORE-3:** Gantt bars start from **today** on X-axis.
- [ ] **T-CORE-4:** Dependency graph: Design → (Frontend, Backend) → Testing (not a single line).
- [ ] **T-CORE-5:** Atlas has 4 documents with matching `startDay` / `endDay`.

---

## Part D — UI functional tests

| ID | Steps | Expected | Pass |
|----|-------|----------|------|
| T-UI-01 | Open app unauthenticated | Shows Landing Page, dashboard hidden | [ ] |
| T-UI-02 | Sign up / Log in | Redirects to dashboard | [ ] |
| T-UI-03 | Log out | Clears session, returns to Landing Page | [ ] |
| T-UI-04 | Create task (name + duration) | Appears in table; Gantt updates | [ ] |
| T-UI-03 | Use dependency checkboxes | No manual ID typing needed | [ ] |
| T-UI-04 | Toggle dark mode → refresh | Theme remembered | [ ] |
| T-UI-05 | Search by task name | Table filters; Gantt still shows all tasks | [ ] |
| T-UI-06 | Filter by status | Table filters only | [ ] |
| T-UI-07 | Sort by Start Day | Order changes in table | [ ] |
| T-UI-08 | Change status dropdown | Status updates; schedule days unchanged | [ ] |
| T-UI-09 | Delete → Cancel confirm | Task remains | [ ] |
| T-UI-10 | Delete → Confirm | Task removed; schedule recalculated | [ ] |
| T-UI-13 | Recalculate Schedule button | All `startDay`/`endDay` refresh | [ ] |
| T-UI-14 | API banner when DB down | Warning shown; Retry works after DB up | [ ] |

---

## Part E — API tests (Requires Auth Token)

Base URL: `http://localhost:5000`

> **Note**: Because the API is now protected by JWT, standard PowerShell `Invoke-RestMethod` calls to `/tasks` will return `401 Unauthorized`. For API testing, you must first POST to `/auth/login` to get a token, and pass it in the `Authorization: Bearer <token>` header.

### Health

```powershell
Invoke-RestMethod http://localhost:5000/health
```

- [ ] **T-API-01:** `success: true`, `database: connected`

### Create task

```powershell
$body = @{ name = "API-Test"; duration = 2 } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:5000/tasks -ContentType "application/json" -Body $body
```

- [ ] **T-API-02:** Status 201; `data.tasks` includes new task with `startDay: 0`, `endDay: 2`

### List tasks

```powershell
Invoke-RestMethod http://localhost:5000/tasks
```

- [ ] **T-API-03:** Returns `data`, `allTasks`, `meta.projectEnd`

### Schedule

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:5000/tasks/schedule
```

- [ ] **T-API-04:** Returns updated schedule for all tasks

### Delete

```powershell
# Replace TASK_ID with real _id from GET /tasks
Invoke-RestMethod -Method DELETE -Uri http://localhost:5000/tasks/TASK_ID
```

- [ ] **T-API-05:** 200; task removed from GET /tasks

---

## Part F — Validation & error tests

| ID | How to test | Expected | Pass |
|----|-------------|----------|------|
| T-VAL-01 | Submit form with empty name | Red message on form; no API call crash | [ ] |
| T-VAL-02 | Duration = -1 in UI | Blocked on frontend | [ ] |
| T-VAL-03 | POST duration -1 via API | 400, negative not allowed | [ ] |
| T-VAL-04 | POST without name | 400 missing fields | [ ] |
| T-VAL-05 | Duplicate task name "Design" | 409 conflict | [ ] |
| T-VAL-06 | Dependency on self (if possible via API) | 400 cannot depend on itself | [ ] |
| T-VAL-07 | Invalid dependency ID `000000000000000000000001` | 400 invalid dependency | [ ] |
| T-VAL-08 | DELETE invalid id `not-an-id` | 400 invalid ID | [ ] |
| T-VAL-09 | DELETE non-existent valid ObjectId | 404 not found | [ ] |

### API examples for validation

```powershell
# Negative duration (expect 400)
Invoke-RestMethod -Method POST -Uri http://localhost:5000/tasks -ContentType "application/json" -Body '{"name":"X","duration":-1}'

# Missing name (expect 400)
Invoke-RestMethod -Method POST -Uri http://localhost:5000/tasks -ContentType "application/json" -Body '{"duration":5}'
```

---

## Part G — Edge cases (scheduling & dependencies)

| ID | Scenario | Steps | Expected | Pass |
|----|----------|-------|----------|------|
| T-EDGE-01 | Zero duration | Create "Milestone" duration 0 | `startDay === endDay` | [ ] |
| T-EDGE-02 | No dependencies | Single task 5 days | start 0, end 5 | [ ] |
| T-EDGE-03 | Linear chain | A(2)→B(3)→C(1) | B starts 2, C starts 5 | [ ] |
| T-EDGE-04 | Parallel join | A(4), B(2), C deps A+B duration 3 | C starts at day 4 | [ ] |
| T-EDGE-05 | Duplicate dependency | Same dep selected twice (UI dedupes) | One dep stored in Atlas | [ ] |
| T-EDGE-06 | Circular dependency | A→B, B→C, then C depends on A | 422 error; create rolled back | [ ] |
| T-EDGE-07 | Delete middle task | Delete B from A→B→C | C deps cleaned; schedule recalc | [ ] |
| T-EDGE-08 | Empty schedule | Delete all tasks → POST /schedule | Empty list, projectEnd 0 | [ ] |
| T-EDGE-09 | Filter + Gantt | Filter status Pending | Table filtered; Gantt shows **all** tasks | [ ] |
| T-EDGE-10 | Critical path | Assignment 4-task example | Design, Backend, Testing critical | [ ] |

### Circular dependency test (UI)

1. Create **Task A** (1 day).
2. Create **Task B** (1 day), depends on A.
3. Create **Task C** (1 day), depends on B.
4. Try editing C to depend on A only — OK.
5. Via API, PATCH C to also create cycle (C→A where A→B→C): expect **422 Circular dependency**.

---

## Part H — Reliability tests

| ID | Test | Expected | Pass |
|----|------|----------|------|
| T-REL-01 | Stop MongoDB / wrong URI → open app | Banner: DB unavailable; no white screen | [ ] |
| T-REL-02 | Fix DB → click Retry | Tasks load | [ ] |
| T-REL-03 | Stop backend → create task | Error alert; app does not crash | [ ] |
| T-REL-04 | Gantt CDN blocked (offline) | Fallback message; table still OK | [ ] |
| T-REL-05 | `npm run test:schedule --prefix backend` | All scheduling tests pass | [ ] |

---

## Part I — Data consistency (UI ↔ Atlas ↔ API)

Pick one task after the assignment example:

- [ ] **T-SYNC-1:** `name` in UI = `name` in Atlas document.
- [ ] **T-SYNC-2:** `duration` in UI = `duration` in Atlas.
- [ ] **T-SYNC-3:** Each checked dependency in UI = one ObjectId in Atlas `dependencies`.
- [ ] **T-SYNC-4:** `startDay`/`endDay` in UI table = same in Atlas and in GET `/tasks` JSON.
- [ ] **T-SYNC-5:** `isCritical` in UI badge = `isCritical` in Atlas.

---

## Part J — Test results log

| Date | Tester | Total passed | Total failed | Notes |
|------|--------|--------------|--------------|-------|
| | | / | / | |

---

## Quick command reference

```powershell
# Scheduling unit tests (no DB)
cd d:\impactcraft\backend
npm run test:schedule

# Health
Invoke-RestMethod http://localhost:5000/health

# List all tasks (see full JSON)
(Invoke-RestMethod http://localhost:5000/tasks) | ConvertTo-Json -Depth 6
```

---

## Related docs

- `TEST_CASES_DOC.md` — formal test case document (interview submission)
- `README.md` — setup and MongoDB Atlas guide
