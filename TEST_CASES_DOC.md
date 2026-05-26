# Test Cases Document — Mini Project Planner

## 1. Functional Test Cases

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| F1 | Create independent task | POST name="A", duration=3 | startDay=0, endDay=3 |
| F2 | Create dependent task | A then B depends on A, duration=2 | B starts Day 3, ends Day 5 |
| F3 | Multiple dependencies | A(3d), B(2d), C depends on A+B (4d) | C starts Day 5 (max of 3,2) |
| F4 | Delete task | DELETE A | B deps cleaned, schedule recalculated |
| F5 | Manual reschedule | POST /tasks/schedule | All tasks updated |
| F6 | Status update (locked) | Try marking B In Progress before A Completed | 400 error; dropdown locked (🔒) |
| F7 | Status update (valid) | Mark A Completed, then B In Progress | B status saved |
| F8 | Status revert blocked | Mark B In Progress, try reverting A to Pending | 400 error: B already started |
| F9 | Filter by status | GET ?status=Pending | Only pending tasks |
| F10 | Search | GET ?search=API | Matching names only |
| F11 | Min duration | POST duration=0 | 400 error: must be at least 1 day |

## 2. API Test Cases

### POST /tasks

| Case | Body | Status | Message |
|------|------|--------|---------|
| Valid | `{ "name":"T1", "duration":5 }` | 201 | success |
| Missing name | `{ "duration":5 }` | 400 | Missing required fields |
| Zero duration | `{ "name":"T", "duration":0 }` | 400 | must be at least 1 day |
| Negative duration | `{ "name":"T", "duration":-1 }` | 400 | must be at least 1 day |
| Invalid dep ID | `{ "name":"T", "duration":1, "dependencies":["bad"] }` | 400 | Invalid dependency |
| Duplicate name | Same name twice | 409 | already exists |

### GET /tasks

| Case | Expected |
|------|----------|
| Empty DB | `{ count: 0, data: [] }` |
| With tasks | Array with schedule fields |

### POST /tasks/schedule

| Case | Expected |
|------|----------|
| Empty | `{ tasks: [], projectEnd: 0 }` |
| Valid graph | Updated start/end on all |

### PATCH /tasks/:id (status workflow)

| Case | Condition | Status | Message |
|------|-----------|--------|---------|
| Mark In Progress | Dep not Completed | 400 | Cannot mark — dep names listed |
| Mark Completed | Dep not Completed | 400 | Cannot mark — dep names listed |
| Mark In Progress | All deps Completed | 200 | success |
| Revert to Pending | Dependent is In Progress | 400 | Cannot revert — dependent names listed |
| Revert to Pending | No dependents started | 200 | success |

### DELETE /tasks/:id

| Case | Expected |
|------|----------|
| Valid ID | 200, task removed |
| Invalid ID | 400 Invalid ID |
| Not found | 404 |

## 3. UI Test Cases

| ID | Test | Expected |
|----|------|----------|
| U1 | Load app | Spinner then task list or empty state |
| U2 | Create via form | Task appears in table + Gantt |
| U3 | API offline | Error alert, no white screen |
| U4 | Toggle dark mode | Theme persists on reload |
| U5 | Delete with cancel | No change |
| U6 | Delete confirm | Task removed |
| U7 | Empty Gantt | Placeholder message |
| U8 | Critical badge | Red badge on critical tasks |
| U9 | Locked status dropdown | 🔒 icon shown, dropdown disabled when dep not Completed |
| U10 | In Progress Gantt border | Dashed amber border on In Progress bar |
| U11 | Completed Gantt border | Solid green border on Completed bar |
| U12 | Dep graph status border | Amber (dashed) / green borders on graph nodes |
| U13 | Min duration input | Cannot enter 0; form shows error |
| U14 | Day display | Shows Day 1–3 format (1-indexed) |

## 4. Validation Test Cases

| Input | Layer | Result |
|-------|-------|--------|
| Empty name | Frontend | Local error message |
| Empty name | Backend | 400 |
| duration="abc" | Frontend | Local error |
| duration=-5 | Backend | 400 |

## 5. Edge-Case Testing

### Circular dependency

```
A → B → C → A
```

| Step | Expected |
|------|----------|
| Create A, B, C sequentially with cycle-forcing deps | 422 on the edge that completes cycle |
| Rollback | Partial task not left in invalid state |

### Self-dependency

```json
{ "dependencies": ["<sameTaskId>"] }
```
**Expected:** 400 — cannot depend on itself

### Minimum duration

| Task | duration | Expected |
|------|----------|----------|
| Any task | 0 | 400 — Duration must be at least 1 day |
| Any task | 1 | ✅ Accepted |

### Status workflow

| Scenario | Expected |
|----------|----------|
| Mark task In Progress when dep is Pending | 400 — error with dep name |
| Mark task Completed when dep is In Progress | 400 — error with dep name |
| Revert dep to Pending when child is In Progress | 400 — error with child name |
| Mark task In Progress when all deps Completed | ✅ 200 success |

### Duplicate dependencies

`dependencies: [id1, id1, id2]` → stored as `[id1, id2]`

## 6. Scheduling Logic Tests

### Example 1: Linear chain

| Task | Duration | Deps | start | end |
|------|----------|------|-------|-----|
| A | 2 | — | 0 | 2 |
| B | 3 | A | 2 | 5 |
| C | 1 | B | 5 | 6 |

**projectEnd:** 6

### Example 2: Parallel + join

| Task | Duration | Deps | start | end |
|------|----------|------|-------|-----|
| A | 4 | — | 0 | 4 |
| B | 2 | — | 0 | 2 |
| C | 3 | A,B | 4 | 7 |

C starts at MAX(4,2)=4.

### Expected vs Actual (manual verification)

Run after seeding via API:

```bash
# Create A
curl -X POST http://localhost:5000/tasks -H "Content-Type: application/json" -d "{\"name\":\"A\",\"duration\":2}"
# Note _id, create B depending on A
curl -X POST http://localhost:5000/tasks -H "Content-Type: application/json" -d "{\"name\":\"B\",\"duration\":3,\"dependencies\":[\"<A_ID>\"]}"
curl http://localhost:5000/tasks
```

**Expected B:** `startDay: 2, endDay: 5`

## 7. Screenshot Placeholders

| Screenshot | Path | Status |
|------------|------|--------|
| Task list | `docs/screenshots/task-list.png` | Pending |
| Gantt chart | `docs/screenshots/gantt.png` | Pending |
| Circular error | `docs/screenshots/cycle-error.png` | Pending |
| Dark mode | `docs/screenshots/dark-mode.png` | Pending |

## 8. Reliability & Enhancement Tests

| ID | Test | Expected |
|----|------|----------|
| R1 | Start API without MongoDB | Server stays up; `/health` → 503; `/tasks` → 503 with clear message |
| R2 | Start MongoDB after API | `/health` → 200 after retry; tasks work |
| R3 | Filter tasks by status | `meta.projectEnd` unchanged; Gantt shows `allTasks` |
| R4 | API offline during session | Banner shows offline; last tasks remain visible |
| R5 | Select deps via picker | No manual ID paste; valid schedule created |
| R6 | Google Charts CDN blocked | Gantt shows fallback message; table still works |
| R7 | Rename task to duplicate name | PATCH → 409 |

## 9. Final Results Summary

| Category | Total | Pass criteria |
|----------|-------|---------------|
| Functional | 8 | All core flows work |
| API | 15+ | Correct status codes & JSON |
| UI | 8 | No crashes, states visible |
| Edge cases | 10+ | Graceful errors, no data corruption |
| Scheduling | 5+ | Matches manual calculations |

**Stability goal:** Application must not crash during live demo; all failures return user-readable messages.

## 10. Quick API Test Script

```bash
# Health (503 if MongoDB down)
curl http://localhost:5000/health

# List with meta
curl http://localhost:5000/tasks

# Negative duration (expect 400)
curl -X POST http://localhost:5000/tasks -H "Content-Type: application/json" -d "{\"name\":\"X\",\"duration\":-1}"

# Schedule empty (expect 200, empty)
curl -X POST http://localhost:5000/tasks/schedule
```
