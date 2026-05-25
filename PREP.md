# Interview Preparation Guide: Mini Project Planner

This document contains a comprehensive list of potential interview questions based on the architecture, implementation, and algorithmic complexity of your MERN stack Project Planner assignment.

---

## 1. Algorithmic & Computer Science Questions

### Q: What exactly is a "Topological Sort"? Explain it to me simply.
**Answer:** Imagine getting dressed in the morning. You absolutely must put on your socks *before* your shoes. A Topological Sort is a computer science algorithm that takes a list of items with rules like "A must happen before B" and sorts them into a straight line where every rule is respected. In our app, it ensures we never accidentally try to schedule a task before its prerequisites are finished.

### Q: How does Kahn's Algorithm work in your scheduling engine?
**Answer:** Kahn's Algorithm is the specific set of steps I used to perform the Topological Sort. Here is how it works in plain English:
1. **Count Prerequisites:** First, the engine counts exactly how many dependencies every single task has (in graph theory, this is called the "in-degree").
2. **Find the Starters:** It finds all tasks that have ZERO dependencies (like "Design") and puts them in a waiting line (a Queue).
3. **Process and Subtract:** It takes a task out of the line and says "Okay, this task is scheduled!" Then, it looks at all the tasks that were waiting on this one, and *subtracts 1* from their dependency count.
4. **Queue the Next:** If any of those waiting tasks now have 0 dependencies left, they get pushed into the waiting line.
5. **Repeat:** It repeats this until the line is empty.

### Q: How do you handle Circular Dependencies (e.g., Task A depends on Task B, but Task B depends on Task A)?
**Answer:** Kahn's Algorithm naturally catches this! If there is a circle (Task A waits for B, B waits for A), they will both stay stuck with a prerequisite count of 1 forever. They will never reach 0, so they never get put into the waiting line. 
At the end of the algorithm, we just count how many tasks we successfully processed. If we processed 8 tasks, but there are 10 tasks total in the database, it mathematically proves 2 tasks are stuck in an infinite cycle. The backend catches this, stops the database save, and throws a `422 Unprocessable Entity` error.

### Q: What is the "Critical Path" and how do you calculate it?
**Answer:** The Critical Path is the chain of tasks that determines the absolute earliest the project can finish. If *any* task on this path is delayed by 1 day, the *entire* project is delayed by 1 day. These tasks have zero "wiggle room" (called float or slack).
**How it's calculated:** 
1. **Forward Pass:** As we schedule tasks, a task's `startDay` is strictly the highest `endDay` of all its prerequisites (e.g. if I depend on a 5-day task and a 10-day task, I can't start until Day 10).
2. **Backward Pass:** Once we know the final end date of the whole project, the engine works backward. It traces exactly which tasks were the "bottleneck" holding up the final date, and flags them with `isCritical: true`.

---

## 2. Architecture & Backend Questions

### Q: Why did you put the scheduling logic on the Backend instead of the Frontend?
**Answer:** Data integrity and security. The server must act as the Single Source of Truth. If the frontend calculated the schedule, a user with a stale browser tab could accidentally overwrite the correct schedule. By keeping it in the backend service, every time a task is created, updated, or deleted, the backend recalculates the entire schedule and executes a MongoDB `bulkWrite` in a single, safe transaction.

### Q: Why did you choose MongoDB and Mongoose for this assignment?
**Answer:** MongoDB's document model maps perfectly to JSON data, making the MERN stack highly efficient. Mongoose provided excellent schema validation (like ensuring durations cannot be negative) and allowed me to use `ObjectIds` to easily reference dependent tasks within the same collection.

### Q: How do you handle errors and API failures?
**Answer:** I built a custom `AppError` class and a global error-handling middleware. Operational errors (like a user causing a circular dependency) throw a `422` status. MongoDB schema errors throw a `400`. The frontend intercepts these errors cleanly and displays them in a user-friendly UI Alert instead of crashing the page.

---

## 3. Frontend & UI Questions

### Q: You didn't use a graphing library for the Dependency Graph. How did you build it?
**Answer:** I wanted to keep the bundle size lean and demonstrate my ability to work directly with the DOM and SVGs. I built a custom React component that mathematically calculates the 'depth level' of each task to assign X and Y coordinates. It then draws SVG Bezier curves (`<path>`) to connect the nodes and uses CSS keyframes for staggered entrance animations.

### Q: How did you implement Dark Mode?
**Answer:** I used Tailwind CSS's `dark:` modifier strategy. I built a custom React hook (`useTheme.js`) that checks the user's system preference and toggles a `dark` class on the HTML `<body>`. Most importantly, it saves the user's choice in the browser's `localStorage` so their preference is remembered even if they refresh the page. For third-party components like the Google Gantt Chart (which injects an SVG), I wrote custom CSS overrides targeting their specific `<rect>` and `<text>` elements to force them to match my dark 'zinc' palette.

### Q: Why and how do you use `localStorage` in this app?
**Answer:** I use `localStorage` for two critical UX features to ensure persistence across page reloads without needing a complex user authentication system:
1. **Theme Persistence:** Remembering if the user prefers Light Mode or Dark Mode.
2. **Project Start Date:** By default, scheduling apps often drift to "today". I built a feature that saves the specific anchor date (Day 0) of the project into `localStorage`. This allows the planner to maintain a true, fixed timeline over weeks or months, and the user can edit this baseline date directly from the sidebar.

### Q: Google Charts doesn't let you center the row labels in the Gantt chart. How did you center them?
**Answer:** I used direct DOM manipulation. I injected a `ready` event listener into the Google Chart. Once the SVG finishes rendering, the script dynamically calculates the exact computed pixel-width of the left column, updates the `<text>` element's anchoring to `middle`, and mathematically repositions the X coordinate to perfectly split the center of the column.

### Q: How do you manage State in React? Why didn't you use Redux?
**Answer:** Redux would be over-engineering for a project of this scope. I used React's `useState` and `useCallback` inside a custom hook (`useTasks.js`). This hook centralizes all the data fetching, filtering, and CRUD operations, passing clean data down to the Presentational Components (like the TaskList and GanttChart). 

---

## 4. System Design & Future Scalability

### Q: What is the Time Complexity of your scheduling algorithm?
**Answer:** The time complexity is **O(V + E)**, where V is the number of vertices (tasks) and E is the number of edges (dependencies). This is because topological sorting processes each node and edge exactly once. It is highly efficient and easily scales to thousands of tasks per project.

### Q: How would you scale this to handle thousands of concurrent users?
**Answer:** Since the Node.js API is completely stateless, I would scale it horizontally behind a Load Balancer (like AWS ALB or NGINX). For the database, MongoDB handles read-heavy workloads well, and I would ensure an index is placed on the `name` and `status` fields to optimize queries.

### Q: If two users are editing the same project at the same time, how would you handle real-time updates?
**Answer:** I would introduce **WebSockets** (e.g., using `Socket.io`). When User A updates a task, the backend would broadcast a `"schedule_updated"` event to all other connected clients. The frontend would listen for this event and silently refetch the updated data in the background, keeping everyone's screen in sync instantly.

### Q: What is the biggest weakness or trade-off in your current implementation?
**Answer:** Right now, every time a single task is modified, the engine recalculates the schedule for the *entire* project. For a project with 50 tasks, this is instantaneous. But for a project with 100,000 tasks, it would cause a bottleneck. The ideal optimization would be a localized graph traversal that only recalculates the tasks that are *downstream* from the specific task that was modified.
