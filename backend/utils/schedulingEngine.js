/**
 * Scheduling engine: topological sort, cycle detection, earliest-start scheduling,
 * and critical path (longest path in DAG).
 */

function buildGraph(tasks) {
  const byId = new Map(tasks.map((t) => [String(t._id), t]));
  const adj = new Map();
  const inDegree = new Map();

  for (const t of tasks) {
    const id = String(t._id);
    adj.set(id, []);
    inDegree.set(id, 0);
  }

  for (const t of tasks) {
    const id = String(t._id);
    const deps = (t.dependencies || []).map(String);
    for (const depId of deps) {
      if (!byId.has(depId)) continue;
      adj.get(depId).push(id);
      inDegree.set(id, (inDegree.get(id) || 0) + 1);
    }
  }

  return { byId, adj, inDegree };
}

/** Kahn's algorithm — returns order or throws on cycle */
function topologicalSort(tasks) {
  const { byId, adj, inDegree } = buildGraph(tasks);
  const queue = [];
  const order = [];

  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  while (queue.length > 0) {
    const id = queue.shift();
    order.push(id);
    for (const next of adj.get(id) || []) {
      inDegree.set(next, inDegree.get(next) - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    }
  }

  if (order.length !== tasks.length) {
    return { ok: false, error: 'Circular dependency detected' };
  }
  return { ok: true, order };
}

/**
 * Earliest start: no deps → Day 0; multiple deps → max(end of deps).
 * End = start + duration (zero-duration tasks occupy a point on the timeline).
 */
function computeSchedule(tasks) {
  const sortResult = topologicalSort(tasks);
  if (!sortResult.ok) return sortResult;

  const byId = new Map(tasks.map((t) => [String(t._id), { ...t.toObject?.() ?? t }]));
  const schedule = new Map();

  for (const id of sortResult.order) {
    const task = byId.get(id);
    const deps = (task.dependencies || []).map(String);
    let startDay = 0;

    if (deps.length > 0) {
      const depEnds = deps
        .filter((d) => schedule.has(d))
        .map((d) => schedule.get(d).endDay);
      if (depEnds.length > 0) startDay = Math.max(...depEnds);
    }

    const duration = Math.max(0, Number(task.duration) || 0);
    const endDay = startDay + duration;
    schedule.set(id, { startDay, endDay, duration });
  }

  // Critical path: longest path (forward DP on topo order)
  const dist = new Map();
  const pred = new Map();
  for (const id of sortResult.order) {
    const task = byId.get(id);
    const dur = Math.max(0, Number(task.duration) || 0);
    const deps = (task.dependencies || []).map(String);

    if (deps.length === 0) {
      dist.set(id, dur);
      pred.set(id, null);
    } else {
      let best = -1;
      let bestPred = null;
      for (const d of deps) {
        const pathLen = (dist.get(d) ?? 0);
        if (pathLen > best) {
          best = pathLen;
          bestPred = d;
        }
      }
      dist.set(id, best + dur);
      pred.set(id, bestPred);
    }
  }

  let maxDist = -1;
  let endNode = null;
  for (const [id, d] of dist) {
    if (d > maxDist) {
      maxDist = d;
      endNode = id;
    }
  }

  const criticalSet = new Set();
  let cur = endNode;
  while (cur) {
    criticalSet.add(cur);
    cur = pred.get(cur);
  }

  const results = tasks.map((t) => {
    const id = String(t._id);
    const s = schedule.get(id) || { startDay: 0, endDay: 0, duration: 0 };
    return {
      ...((t.toObject && t.toObject()) || t),
      startDay: s.startDay,
      endDay: s.endDay,
      isCritical: criticalSet.has(id),
    };
  });

  return {
    ok: true,
    tasks: results,
    projectEnd: Math.max(0, ...results.map((r) => r.endDay ?? 0)),
    criticalPath: [...criticalSet],
  };
}

module.exports = {
  topologicalSort,
  computeSchedule,
  buildGraph,
};
