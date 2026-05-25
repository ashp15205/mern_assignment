import { useMemo, useState } from 'react';
import { Chart } from 'react-google-charts';
import { addDaysToAnchor, formatScheduleAnchor, getScheduleAnchor } from '../utils/scheduleDates';

const COLUMNS = [
  { type: 'string', id: 'Row' },
  { type: 'string', id: 'Bar' },
  { type: 'string', role: 'tooltip', p: { html: true } },
  { type: 'date', id: 'Start' },
  { type: 'date', id: 'End' },
];

function ganttHeight(rowCount) {
  return Math.max(100, rowCount * 41 + 55);
}

export default function GanttChart({ tasks, projectEnd, allTasks, theme }) {
  const isDark = theme === 'dark';
  const [chartError, setChartError] = useState(null);
  const anchor = useMemo(() => getScheduleAnchor(), []);

  const source = (allTasks?.length ? allTasks : tasks) || [];
  const scheduled = source.filter((t) => t.startDay != null && t.endDay != null);

  if (!scheduled.length) {
    return (
      <section className="card overflow-hidden">
        <div className="panel-head">
          <div>
            <p className="section-label">Timeline</p>
            <h2 className="section-heading">Gantt Chart</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
            0 bars
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl dark:bg-zinc-800">
            📊
          </div>
          <p className="section-heading">Gantt Timeline</p>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">Add tasks to see the timeline chart.</p>
        </div>
      </section>
    );
  }

  const rows = scheduled.map((t) => {
    const start = addDaysToAnchor(anchor, t.startDay);
    const end = addDaysToAnchor(anchor, Math.max(t.endDay, t.startDay + (t.duration === 0 ? 0 : 1)));
    
    const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const tooltipBg = isDark ? '#18181b' : '#ffffff';
    const tooltipBorder = isDark ? '#27272a' : '#e2e8f0';
    const tooltipText1 = isDark ? '#f4f4f5' : '#0f172a';
    const tooltipText2 = isDark ? '#a1a1aa' : '#64748b';
    
    const tooltip = `
      <div style="padding: 10px 14px; font-family: Inter, system-ui, sans-serif; white-space: nowrap; border-radius: 8px; border: 1px solid ${tooltipBorder}; background: ${tooltipBg};">
        <div style="font-weight: 600; color: ${tooltipText1}; font-size: 14px; margin-bottom: 4px;">${t.name}</div>
        <div style="color: ${tooltipText2}; font-size: 13px;">${startStr} – ${endStr}</div>
      </div>
    `;

    return [t.name, t.name, tooltip, start, end];
  });

  const chartH = ganttHeight(scheduled.length);
  const minChartW = Math.max(600, (projectEnd ?? 0) * 35 + 150);
  const criticalCount = scheduled.filter((t) => t.isCritical).length;
  
  let critIndex = 0;
  let normIndex = 0;
  const barColors = scheduled.map((t) => {
    if (t.isCritical) {
      critIndex++;
      return `#ef444${critIndex % 10}`;
    } else {
      normIndex++;
      return `#6366f${normIndex % 10}`;
    }
  });

  const labelColor = isDark ? '#e4e4e7' : '#475569';

  if (chartError) {
    return (
      <section className="card overflow-hidden">
        <div className="panel-head">
          <div>
            <p className="section-label">Timeline</p>
            <h2 className="section-heading">Gantt Chart</h2>
          </div>
        </div>
        <div className="flex items-center gap-3 p-5 text-sm text-amber-700 dark:text-amber-300">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">⚠️</span>
          <span>{chartError}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden animate-slide-up" aria-labelledby="gantt-title">
      {/* ── Header — matching Work Breakdown ── */}
      <div className="panel-head">
        <div>
          <p className="section-label">Timeline</p>
          <h2 id="gantt-title" className="section-heading">Gantt Chart</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium tabular-nums text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
            {formatScheduleAnchor(anchor)} · Day {projectEnd ?? 0}
          </span>
          {criticalCount > 0 && (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium tabular-nums text-red-600 ring-1 ring-red-200/50 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800/40">
              {criticalCount} critical
            </span>
          )}
        </div>
      </div>

      {/* ── Chart body ── */}
      <div className="p-4 sm:p-5">
        <div className="overflow-x-auto overflow-y-hidden border border-slate-100/60 bg-transparent dark:border-zinc-800/40">
          <div className="gantt-container flex flex-col" style={{ minWidth: minChartW }}>
            <Chart
              chartType="Timeline"
              width="100%"
              height={chartH}
              data={[COLUMNS, ...rows]}
              options={{
                timeline: {
                  showRowLabels: true,
                  colorByRowLabel: false,
                  barHeight: 30,
                  rowLabelStyle: { fontSize: 13, fontName: 'Inter', color: labelColor },
                  barLabelStyle: { fontSize: 12, fontName: 'Inter', color: labelColor },
                },
                colors: barColors,
                tooltip: { isHtml: true },
                backgroundColor: 'transparent',
              }}
              chartEvents={[
                {
                  eventName: 'ready',
                  callback: () => {
                    const container = document.querySelector('.gantt-container');
                    if (!container) return;
                    const labels = container.querySelectorAll('svg text[text-anchor="end"]');
                    labels.forEach((label) => {
                      const originalX = parseFloat(label.getAttribute('x'));
                      if (originalX && !label.dataset.centered) {
                        const center = (originalX + 5) / 2;
                        label.setAttribute('x', center.toString());
                        label.setAttribute('text-anchor', 'middle');
                        label.dataset.centered = 'true';
                      }
                    });
                  },
                },
                {
                  eventName: 'error',
                  callback: () => setChartError('Chart failed to load. Please check your internet connection.'),
                },
              ]}
            />
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="mt-4 flex items-center gap-5 border-t border-slate-100/60 pt-4 dark:border-zinc-800/40">
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="inline-block h-3 w-6 rounded-md bg-brand-500 shadow-sm" /> Normal Task
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="inline-block h-3 w-6 rounded-md bg-red-500 shadow-sm" /> Critical Path
          </span>
          <span className="ml-auto text-xs text-slate-400 dark:text-zinc-500">
            {scheduled.length} {scheduled.length === 1 ? 'task' : 'tasks'} scheduled
          </span>
        </div>
      </div>
    </section>
  );
}
