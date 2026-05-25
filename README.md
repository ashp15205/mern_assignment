# Mini Project Planner with Gantt View

Production-quality MERN stack project planner for **ImpactCraft AI** interview assignment. Create tasks, define precedence dependencies, auto-generate schedules, and visualize timelines in a Gantt chart.

## Features

- **Task management** — full CRUD (create, read, update/edit, delete) for name, duration, dependencies, and status
- **Scheduling engine** — earliest-start scheduling; multiple dependencies use MAX(predecessor end)
- **Gantt chart** — Google Charts Timeline with auto-centered text, dynamic dark mode, and critical path highlighting
- **Dependency graph** — animated SVG visualization with staggered node entrances
- **Critical path** — dynamic programming identifies the longest chain; highlighted in table + chart
- **Edge-case safe** — cycles, self-deps, invalid IDs, duplicates, negative/zero duration, empty lists
- **Premium UI** — glassmorphism cards, gradient buttons, micro-animations, Inter + Space Grotesk typography
- **Dark / Light mode** — theme toggle with persistence across sessions
- **Filters & search** — debounced search, status filter, sort by name/duration/start/status
- **Reliability** — MongoDB retry + graceful 503, chart fallback, stale data kept on fetch errors
- **Auto-recalculation** — schedule updates on create, update, delete

## Architecture Diagram

```mermaid
graph TD
    subgraph Frontend [React SPA]
        UI[Components: Gantt, Graph, Table]
        State[Hooks: useTasks, useTheme]
    end

    subgraph Backend [Node.js / Express API]
        Controller[Task Controller]
        Service[Task Service]
        Engine[Scheduling Engine\nKahn's Algo + CPM]
    end

    subgraph Database [MongoDB]
        DB[(Tasks Collection)]
    end

    UI -->|Axios REST Calls| Controller
    Controller --> Service
    Service <-->|CRUD & Fetch| DB
    Service -->|Calculate Schedule| Engine
    Engine -->|Update Start/End Dates| DB
```

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite, Tailwind CSS, react-google-charts, Axios |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB (Atlas or local) |

## User Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant API as Express Server
    participant Engine as Scheduling Engine
    participant DB as MongoDB Database

    User->>UI: Fills out Task Form
    UI->>API: POST /tasks
    API->>API: Validates Input
    API->>DB: Saves Initial Task
    API->>Engine: Triggers schedule recalculation
    Engine->>Engine: Topological Sort (Detects cycles)
    Engine->>Engine: Forward/Backward Pass (Critical Path)
    Engine->>DB: Bulk updates start/end days
    API-->>UI: Returns updated schedule
    UI->>User: Re-renders Gantt Chart & Dependency Graph
```

## System Flow (Scheduling Algorithm)

```mermaid
flowchart TD
    Start([Trigger Recalculation]) --> Fetch[Fetch all tasks from MongoDB]
    Fetch --> TopoSort{Topological Sort\nKahn's Algorithm}
    
    TopoSort -- Cycle Detected --> Error[Throw 422 Error]
    Error --> Rollback[Rollback DB changes]
    
    TopoSort -- Successful DAG --> ForwardPass[Forward Pass:\nstartDay = MAX(predecessors' endDay)]
    ForwardPass --> BackwardPass[Backward Pass:\nIdentify Critical Path]
    BackwardPass --> BulkWrite[MongoDB BulkWrite:\nUpdate start, end, isCritical]
    BulkWrite --> End([Return 200 OK])
```

## Project Structure

```
mern_assignment/
├── backend/                # Express API
│   ├── config/             # MongoDB connection
│   ├── controllers/        # Request/response handlers
│   ├── middleware/          # Error handler, DB check, validation
│   ├── models/             # Mongoose schema
│   ├── routes/             # HTTP route definitions
│   ├── services/           # Business logic
│   ├── tests/              # Scheduling engine unit tests
│   └── utils/              # Scheduling engine, validation, errors
├── frontend/               # React UI
│   └── src/
│       ├── components/     # UI components (TaskForm, TaskList, GanttChart, etc.)
│       ├── hooks/          # Custom hooks (useTasks, useTheme, useApiHealth)
│       ├── pages/          # PlannerPage
│       ├── services/       # Axios API client
│       └── utils/          # Constants, formatters, validation
├── DESIGN_DOC.md           # System architecture & design decisions
├── IMPLEMENTATION_DOC.md   # Technical implementation details
├── TEST_CASES_DOC.md       # Formal test case document
├── TEST.md                 # Hands-on testing guide + MongoDB Atlas verification
└── docker-compose.yml      # Docker setup for MongoDB
```

## Prerequisites

| Tool | Version | Verify |
|------|---------|--------|
| **Node.js** | 18+ | `node -v` |
| **npm** | (bundled with Node) | `npm -v` |
| **MongoDB** | 6+ local, Docker, or Atlas | see [MongoDB setup](#mongodb-setup) below |

---

## Getting Started

### 1. Install dependencies

Open a terminal in the project root:

```bash
npm run install:all
```

This installs packages for both `backend/` and `frontend/`.

### 2. Environment variables

**Backend** — create `backend/.env` if it does not exist:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API port | `5000` |
| `MONGODB_URI` | Mongo connection string | `mongodb://127.0.0.1:27017/mini-project-planner` |
| `NODE_ENV` | Environment | `development` |

Example `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mini-project-planner
NODE_ENV=development
```

**Frontend** (`frontend/.env` — optional for local dev):

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `''` (Vite proxies `/tasks` and `/health` to port 5000) |

No manual database creation is required — MongoDB creates the `mini-project-planner` database on first write.

### MongoDB setup

Pick **one** option.

#### Option A — MongoDB Community (local)

1. Download: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Install and start the service on port **27017**.
3. Verify:

```bash
mongosh
```

You should see the Mongo shell. Type `exit` to quit.

#### Option B — Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/):

```bash
docker compose up -d
```

MongoDB listens on `localhost:27017`. Keep the default `MONGODB_URI` in `backend/.env`.

#### Option C — MongoDB Atlas (cloud, recommended)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → add a database user (username + password).
3. **Network Access** → allow your IP (or `0.0.0.0/0` for local dev only).
4. **Connect** → **Drivers** → copy the connection string and set in `backend/.env`:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/mini-project-planner
```

Replace `USER`, `PASSWORD`, and the host with your Atlas values.

### 3. Run the application

Use **two terminals** from the project root.

**Terminal 1 — Backend API**

```bash
npm run dev:backend
```

Wait for:

```
MongoDB connected
Server running on port 5000
```

**Terminal 2 — Frontend UI**

```bash
npm run dev:frontend
```

| Service | URL |
|---------|-----|
| **App (open in browser)** | http://localhost:3000 |
| **API** | http://localhost:5000 |
| **Health check** | http://localhost:5000/health |

Stop either process with `Ctrl+C`.

### 4. Verify the stack

**Health check:**

```bash
curl http://localhost:5000/health
```

When MongoDB is connected:

```json
{ "success": true, "message": "API is running", "database": "connected" }
```

If `"database": "disconnected"` or HTTP `503` → complete [MongoDB setup](#mongodb-setup), wait a few seconds, then click **Retry** in the app banner.

**Scheduling engine** (no MongoDB required):

```bash
cd backend
npm run test:schedule
```

Expected: `All scheduling engine tests passed.`

### 5. Try the assignment example

Open http://localhost:3000 and create tasks in this order:

| Step | Name | Duration (days) | Dependencies |
|------|------|-----------------|--------------|
| 1 | Design | 3 | none |
| 2 | Frontend | 4 | Design |
| 3 | Backend | 5 | Design |
| 4 | Testing | 2 | Frontend **and** Backend |

Use the **dependency checkboxes** under "Predecessors".

**Expected schedule:**

| Task | Start | End | Critical? |
|------|-------|-----|-----------|
| Design | Day 0 | Day 3 | ✅ |
| Frontend | Day 3 | Day 7 | |
| Backend | Day 3 | Day 8 | ✅ |
| Testing | Day 8 | Day 10 | ✅ |

The Work Breakdown table, Gantt chart, and Dependency Graph update automatically after each create.

### Quick reference

| Action | Command |
|--------|---------|
| Install all deps | `npm run install:all` |
| Dev API | `npm run dev:backend` |
| Dev UI | `npm run dev:frontend` |
| Production API | `npm run start:backend` |
| Build UI | `npm run build:frontend` |
| Schedule unit tests | `npm run test:schedule --prefix backend` |

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `Database is unavailable` / health returns 503 | Start MongoDB ([setup](#mongodb-setup)); confirm `MONGODB_URI` in `backend/.env` |
| `EADDRINUSE` on port 5000 | Stop the other process or change `PORT` in `backend/.env` |
| UI cannot load tasks | Ensure backend is running; use http://localhost:3000 (not 5000) |
| Gantt chart empty | Create tasks first; schedule runs automatically on create |
| Gantt does not render | Google Charts loads from CDN — check internet; schedule still appears in the table |

### Optional: production-style run

```bash
npm run build:frontend
npm run start:backend

cd frontend
npm run preview
```

For demos and development, `npm run dev:backend` + `npm run dev:frontend` is sufficient.

---

## API Documentation

Base URL: `http://localhost:5000`

### `GET /health`
Health check (includes database status).

**Response (connected):**
```json
{ "success": true, "message": "API is running", "database": "connected" }
```

**Response (DB down):** HTTP `503`, `"database": "disconnected"`

---

### `GET /tasks`
List tasks with optional filters.

**Query:** `sort` (name|duration|start|status), `status`, `search`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [/* filtered tasks */],
  "allTasks": [/* full project — used for Gantt */],
  "meta": { "projectEnd": 10, "criticalPath": ["..."], "totalTasks": 5 }
}
```

---

### `POST /tasks`
Create a task and recalculate schedule.

**Body:**
```json
{
  "name": "Build API",
  "duration": 5,
  "dependencies": ["<taskId>"],
  "status": "Pending"
}
```

**Status codes:** `201` success, `400` validation, `409` duplicate name, `422` circular dependency

---

### `POST /tasks/schedule`
Regenerate schedule for all tasks.

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [],
    "projectEnd": 10,
    "criticalPath": ["..."]
  }
}
```

---

### `PATCH /tasks/:id`
Update task fields; schedule auto-recalculates.

---

### `DELETE /tasks/:id`
Delete task, clean up references, recalculate schedule.

---

## UI Enhancements

The frontend features a premium, modern design inspired by Apple's design language:

- **Glassmorphism cards** — semi-transparent backgrounds with backdrop blur
- **Gradient accents** — indigo-to-purple gradient on buttons and branding
- **Micro-animations** — staggered entrance animations, scale-on-click, hover reveals
- **Inter + Space Grotesk** — clean, professional typography
- **Responsive layout** — sidebar + main content grid that adapts to screen size
- **Dark mode** — OLED-black dark theme with purple-tinted gradients
- **Animated dependency graph** — nodes slide in sequentially, critical nodes pulse

## Design Decisions

1. **Earliest-start scheduling** — industry-standard CPM-style forward pass; easy to explain in interviews.
2. **Server-side scheduling** — single source of truth; frontend only displays results.
3. **Topological sort for cycles** — Kahn's algorithm detects cycles before scheduling.
4. **react-google-charts** — reliable React Timeline chart; avoids custom chart code.
5. **Error boundary + structured API errors** — demo stability priority.
6. **Glassmorphism + animations** — premium feel that differentiates from typical CRUD apps.

## Scalability

- Stateless API → horizontal scaling behind a load balancer
- MongoDB indexes on `name`; bulk writes for schedule updates
- Scheduling is O(V+E) — suitable for hundreds of tasks per project
- Future: project scoping, user auth, WebSocket live updates, pagination

## Future Improvements

- Multi-project workspaces
- Drag-and-drop Gantt editing
- Export to PDF/MS Project
- Persistent undo/redo
- Unit/integration test suite in CI

## Documentation

| Document | Purpose |
|----------|---------|
| [DESIGN_DOC.md](./DESIGN_DOC.md) | System architecture, component hierarchy, edge-case handling |
| [IMPLEMENTATION_DOC.md](./IMPLEMENTATION_DOC.md) | Code-level details, algorithm pseudocode, state management |
| [TEST_CASES_DOC.md](./TEST_CASES_DOC.md) | Formal test cases (functional, API, UI, edge-cases) |
| [TEST.md](./TEST.md) | Hands-on testing checklist with MongoDB Atlas verification |

## License

MIT — built for educational/interview purposes.
