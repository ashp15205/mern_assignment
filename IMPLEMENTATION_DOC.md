# Implementation Document — Mini Project Planner

## 1. Folder Structure

### Backend

| Path | Purpose |
|------|---------|
| `server.js` | App entry, middleware, route mounting |
| `config/db.js` | MongoDB connection |
| `models/Task.js` | Mongoose schema |
| `routes/taskRoutes.js` | HTTP route definitions |
| `controllers/taskController.js` | Request/response formatting |
| `services/taskService.js` | Business logic orchestration |
| `utils/schedulingEngine.js` | Core scheduling algorithm |
| `utils/taskValidation.js` | Input validation helpers |
| `utils/errors.js` | `AppError` class |
| `utils/asyncHandler.js` | Async route wrapper |
| `middleware/errorHandler.js` | Global error middleware |
| `middleware/validateRequest.js` | Required body fields |

### Frontend

| Path | Purpose |
|------|---------|
| `src/App.jsx` | Root component |
| `src/pages/PlannerPage.jsx` | Main page layout |
| `src/hooks/useTasks.js` | Task CRUD + schedule state |
| `src/hooks/useTheme.js` | Dark/light persistence |
| `src/services/api.js` | Axios client + endpoints |
| `src/components/*` | UI components |

## 2. Database Schema

**Collection:** `tasks`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `name` | String | Task name (required, max 200) |
| `duration` | Number | Days (≥ 0) |
| `dependencies` | ObjectId[] | Predecessor task IDs |
| `status` | Enum | Pending, In Progress, Completed |
| `startDay` | Number | Computed schedule start |
| `endDay` | Number | Computed schedule end |
| `isCritical` | Boolean | On critical path |
| `createdAt` / `updatedAt` | Date | Timestamps |

## 3. API Layer

### Routes (`routes/taskRoutes.js`)

| Method | Path | Controller |
|--------|------|------------|
| GET | `/tasks` | `getTasks` |
| POST | `/tasks` | `createTask` |
| POST | `/tasks/schedule` | `generateSchedule` |
| PATCH | `/tasks/:id` | `updateTask` |
| DELETE | `/tasks/:id` | `deleteTask` |

### Controller pattern

Controllers are thin: call service, return `{ success, message?, data }` with appropriate HTTP status.

### Service layer (`taskService.js`)

- Validates all inputs via `taskValidation.js`
- On create: insert → cycle check → rollback if cycle → `recalculateAndSave()`
- On delete: remove task, `$pull` from dependencies, reschedule
- `recalculateAndSave()`: loads all tasks, runs engine, `bulkWrite` updates
- `getTasks()`: returns filtered `tasks`, unfiltered `allTasks`, and `meta` (project-wide stats)
- `getScheduleMeta()`: computes `projectEnd` / `criticalPath` from all tasks (filter-independent)

### Middleware (`requireDb.js`)

Returns **503** when MongoDB is not connected — prevents Mongoose errors from surfacing as 500s during demos.

## 4. Scheduling Algorithm

**File:** `utils/schedulingEngine.js`

### Step 1: Topological sort (Kahn's algorithm)

Build adjacency list from dependencies. Process nodes with in-degree 0. If processed count < total nodes → **cycle detected**.

### Step 2: Forward pass (earliest start)

For each task in topological order:

```
startDay = 0                                    if no dependencies
startDay = MAX(predecessor.endDay)              otherwise
endDay   = startDay + duration
```

### Step 3: Critical path

Dynamic programming on topo order: longest path length to each node. Backtrack from max endpoint to mark `isCritical`.

### Pseudocode

```
order = topologicalSort(tasks)
for id in order:
  start[id] = max(end[dep] for dep in deps[id]) or 0
  end[id] = start[id] + duration[id]

critical = backtrack(longestPath(tasks))
```

## 5. Dependency Resolution

1. Client sends dependency IDs in POST body
2. `validateDependencies()` checks:
   - Array type
   - Valid ObjectIds
   - IDs exist in DB
   - No self-reference
   - Duplicates removed
3. Engine validates graph is a DAG at schedule time

## 6. Frontend State Management

**`useApiHealth`** — polls `GET /health` every 15s; drives `ApiStatusBanner`.

**`useDebouncedValue`** — 400ms debounce on search input to reduce API churn.

**`useTasks` hook** centralizes:

| State | Description |
|-------|-------------|
| `tasks` | Filtered task list (table) |
| `allTasks` | Full project (Gantt + dependency graph) |
| `projectEnd` | From `meta` — full project, not filtered subset |
| `criticalPath` | From `meta` |
| `totalTasks` | From `meta.totalTasks` |
| `loading` | Initial fetch |
| `actionLoading` | Mutations in progress |
| `error` | Last API error message |
| `filters` | sort, status, search |

No Redux — React `useState` + `useCallback` keeps the demo simple and explainable.

## 7. Validation Handling

| Layer | Examples |
|-------|----------|
| Frontend | Empty name, negative duration, confirm delete |
| Backend route | `requireBody(['name', 'duration'])` |
| Backend service | Invalid IDs, self-dep, duplicate name |
| Mongoose | Schema min/enum constraints |

## 8. Error Handling Strategy

```javascript
// Operational errors
throw new AppError('Circular dependency detected', 422);

// Global handler maps:
// - ValidationError → 400
// - CastError → 400
// - 11000 duplicate → 409
// - Unknown → 500 (logged in dev)
```

Frontend: Axios interceptor unwraps `response.data.message`. `ErrorBoundary` catches render crashes.

## 9. Important Functions

| Function | Module | Role |
|----------|--------|------|
| `computeSchedule()` | schedulingEngine | Main schedule + critical path |
| `topologicalSort()` | schedulingEngine | Ordering + cycle detection |
| `recalculateAndSave()` | taskService | Persist schedule to DB |
| `validateDependencies()` | taskValidation | Dep ID validation |
| `useTasks()` | hooks | Frontend data layer |
| `GanttChart` | components | Google Charts Timeline rendering |

## 10. Gantt Integration

Tasks mapped to Google Charts Timeline rows:

- `start` = anchorDate + startDay
- `end` = anchorDate + endDay (minimum 1-day bar for visibility when duration &gt; 0)
- `style` column colors critical tasks red (`#ef4444`)

## 11. Auto Schedule Recalculation

Schedule recalculates on:

- `POST /tasks` (create)
- `PATCH /tasks/:id` (update)
- `DELETE /tasks/:id` (delete)
- `POST /tasks/schedule` (manual)

This ensures the UI always reflects consistent server state.
