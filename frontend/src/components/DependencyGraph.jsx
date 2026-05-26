const NODE_W = 160;
const NODE_H = 50;
const H_GAP = 50;
const V_GAP = 16;
const PAD = 20;

function layoutDependencyGraph(tasks) {
  const byId = new Map(tasks.map((t) => [String(t._id), t]));
  const level = new Map();

  function levelOf(id) {
    if (level.has(id)) return level.get(id);
    const t = byId.get(id);
    if (!t) return 0;
    const deps = (t.dependencies || []).map(String).filter((d) => byId.has(d));
    const l = deps.length === 0 ? 0 : Math.max(...deps.map(levelOf)) + 1;
    level.set(id, l);
    return l;
  }

  tasks.forEach((t) => levelOf(String(t._id)));

  const byLevel = new Map();
  tasks.forEach((t) => {
    const id = String(t._id);
    const l = level.get(id) ?? 0;
    if (!byLevel.has(l)) byLevel.set(l, []);
    byLevel.get(l).push({ id, name: t.name, critical: t.isCritical, duration: t.duration, status: t.status || 'Pending' });
  });

  for (const arr of byLevel.values()) arr.sort((a, b) => a.name.localeCompare(b.name));

  const maxLevel = Math.max(0, ...level.values());
  const maxInLevel = Math.max(1, ...[...byLevel.values()].map((a) => a.length));

  const nodes = [];
  for (let l = 0; l <= maxLevel; l++) {
    const group = byLevel.get(l) || [];
    const blockH = group.length * NODE_H + Math.max(0, group.length - 1) * V_GAP;
    const startY = PAD + (maxInLevel * (NODE_H + V_GAP) - blockH) / 2;
    group.forEach((n, i) => {
      nodes.push({
        ...n,
        x: PAD + l * (NODE_W + H_GAP),
        y: startY + i * (NODE_H + V_GAP) + NODE_H / 2,
        level: l,
      });
    });
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const edges = [];
  tasks.forEach((t) => {
    const to = nodeMap.get(String(t._id));
    (t.dependencies || []).forEach((dep) => {
      const from = nodeMap.get(String(dep));
      if (from && to) edges.push({ from, to, key: `${from.id}-${to.id}` });
    });
  });

  const width = PAD * 2 + (maxLevel + 1) * NODE_W + maxLevel * H_GAP;
  const height = PAD * 2 + maxInLevel * (NODE_H + V_GAP);

  return { nodes, edges, width, height, maxLevel };
}

function edgePath(from, to) {
  const x1 = from.x + NODE_W;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

export default function DependencyGraph({ tasks, theme }) {
  if (!tasks?.length) return null;

  const isDark = theme === 'dark';

  const { nodes, edges, width, height, maxLevel } = layoutDependencyGraph(tasks);
  const edgeCount = edges.length;

  return (
    <section className="card overflow-hidden animate-slide-up" aria-labelledby="dep-graph-title">
      {/* ── Header — matching Work Breakdown & Gantt ── */}
      <div className="panel-head">
        <div>
          <p className="section-label">Structure</p>
          <h2 id="dep-graph-title" className="section-heading">Dependency Graph</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium tabular-nums text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
            {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
          </span>
          {edgeCount > 0 && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium tabular-nums text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              {edgeCount} {edgeCount === 1 ? 'link' : 'links'}
            </span>
          )}
        </div>
      </div>

      {/* ── Graph body ── */}
      <div className="p-4 sm:p-5">
        <div className="overflow-x-auto border border-slate-100/60 bg-transparent dark:border-zinc-800/40">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="mx-auto block h-auto max-w-full shrink-0"
            style={{ width: `${width}px` }}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Dependency graph"
          >
            <defs>
              <marker id="dep-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0.5 L7,4 L0,7.5" fill="none" stroke={isDark ? '#4f46e5' : '#818cf8'} strokeWidth="1.2" />
              </marker>
              <marker id="dep-arrow-crit" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0.5 L7,4 L0,7.5" fill="none" stroke={isDark ? '#dc2626' : '#f87171'} strokeWidth="1.2" />
              </marker>
              <linearGradient id="node-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? '#27272a' : '#ffffff'} />
                <stop offset="100%" stopColor={isDark ? '#18181b' : '#f1f5f9'} />
              </linearGradient>
              <linearGradient id="node-grad-crit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? '#450a0a' : '#fff5f5'} />
                <stop offset="100%" stopColor={isDark ? '#220505' : '#fef2f2'} />
              </linearGradient>
              <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity={isDark ? "0.3" : "0.06"} />
              </filter>
            </defs>

            {/* ── Edges with animation ── */}
            {edges.map((e, i) => {
              const isCritEdge = e.from.critical && e.to.critical;
              return (
                <path
                  key={e.key}
                  d={edgePath(e.from, e.to)}
                  fill="none"
                  stroke={isCritEdge ? (isDark ? '#b91c1c' : '#fca5a5') : (isDark ? '#4338ca' : '#c7d2fe')}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  markerEnd={isCritEdge ? 'url(#dep-arrow-crit)' : 'url(#dep-arrow)'}
                  style={{
                    opacity: 0,
                    animation: `fadeIn 0.4s ease-out ${150 + i * 80}ms forwards`,
                  }}
                />
              );
            })}

            {/* ── Nodes with staggered animation ── */}
            {nodes.map((n, i) => (
              <g
                key={n.id}
                style={{
                  opacity: 0,
                  animation: `slideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms forwards`,
                }}
              >
                <rect
                  x={n.x}
                  y={n.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={12}
                  fill={n.critical ? 'url(#node-grad-crit)' : 'url(#node-grad)'}
                  stroke={
                    n.status === 'In Progress'
                      ? '#f59e0b'
                      : n.status === 'Completed'
                        ? '#10b981'
                        : n.critical
                          ? (isDark ? '#dc2626' : '#fca5a5')
                          : (isDark ? '#3f3f46' : '#e2e8f0')
                  }
                  strokeWidth={n.status === 'In Progress' || n.status === 'Completed' ? '2.5' : '1'}
                  strokeDasharray={n.status === 'In Progress' ? '6 4' : 'none'}
                  filter="url(#node-shadow)"
                />

                {/* Centered Node Contents via HTML */}
                <foreignObject 
                  x={n.x} 
                  y={n.y - NODE_H / 2} 
                  width={NODE_W} 
                  height={NODE_H}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center pt-0.5 leading-tight text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5 max-w-full px-2">
                      {n.critical ? (
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 animate-pulse" />
                      ) : (
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      )}
                      <span 
                        className={`truncate text-[12px] font-semibold tracking-wide ${n.critical ? (isDark ? 'text-red-300' : 'text-red-800') : (isDark ? 'text-slate-200' : 'text-slate-800')}`}
                        title={n.name}
                      >
                        {n.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {n.duration} {n.duration === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>

        {/* ── Legend ── */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100/60 pt-4 dark:border-zinc-800/40">
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="inline-block h-3 w-3 rounded-full bg-brand-400" /> Normal
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" /> Critical
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="inline-block h-3 w-3 rounded-full border-2" style={{ borderColor: '#f59e0b', borderStyle: 'dashed' }} /> In Progress
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="inline-block h-3 w-3 rounded-full border-2" style={{ borderColor: '#10b981' }} /> Completed
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
            Dependency
          </span>
          <span className="ml-auto text-xs text-slate-400 dark:text-zinc-500">
            {maxLevel + 1} {maxLevel + 1 === 1 ? 'level' : 'levels'} deep
          </span>
        </div>
      </div>
    </section>
  );
}
