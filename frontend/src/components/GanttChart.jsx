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

const CRITICAL_COLOR = '#ef4444';
const NORMAL_COLOR  = '#6366f1';

const ROW_H = 41;
const CHART_PAD = 30;
const MAX_VISIBLE_ROWS = 4;

function ganttHeight(n) { return n * ROW_H + CHART_PAD; }

export default function GanttChart({ tasks, projectEnd, allTasks, theme }) {
  const isDark = theme === 'dark';
  const [chartError, setChartError] = useState(null);
  const anchor = useMemo(() => getScheduleAnchor(), []);

  const source = (allTasks?.length ? allTasks : tasks) || [];
  const scheduled = source.filter(
    (t) => t.startDay != null && t.endDay != null && t.name
  );

  /* ── Empty state ── */
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
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Add tasks to see the timeline chart.
          </p>
        </div>
      </section>
    );
  }

  /* ── Tooltip helpers ── */
  const ttBg     = isDark ? '#18181b' : '#fff';
  const ttBorder = isDark ? '#27272a' : '#e2e8f0';
  const ttTitle  = isDark ? '#f4f4f5' : '#0f172a';
  const ttSub    = isDark ? '#a1a1aa' : '#64748b';

  /* ── Build rows ── */
  const rows = scheduled.map((t) => {
    const start = addDaysToAnchor(anchor, t.startDay);
    const end   = addDaysToAnchor(anchor, Math.max(t.endDay, t.startDay + 1));

    const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const crit = t.isCritical
      ? '<span style="background:#fef2f2;color:#dc2626;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;margin-left:6px;">Critical</span>'
      : '';

    const tooltip = `
      <div style="padding:10px 14px;font-family:Inter,system-ui,sans-serif;white-space:nowrap;border-radius:8px;border:1px solid ${ttBorder};background:${ttBg};box-shadow:0 4px 12px rgba(0,0,0,.15);">
        <div style="font-weight:600;color:${ttTitle};font-size:14px;margin-bottom:4px;display:flex;align-items:center;">${t.name}${crit}</div>
        <div style="color:${ttSub};font-size:12px;margin-bottom:2px;">📅 ${fmt(start)} – ${fmt(end)}</div>
        <div style="color:${ttSub};font-size:12px;">⏱ ${t.duration} day${t.duration !== 1 ? 's' : ''} &nbsp;|&nbsp; Day ${t.startDay} → ${t.endDay}</div>
      </div>`;

    return [t.name, t.name, tooltip, start, end];
  });

  /* ── Force 7-day span for short timelines ── */
  const maxEnd = Math.max(...scheduled.map((t) => t.endDay ?? 0));
  const barColors = scheduled.map((t) => (t.isCritical ? CRITICAL_COLOR : NORMAL_COLOR));
  
  if (maxEnd < 7 && scheduled.length > 0) {
    // Add a tiny, invisible 1-second bar to the first existing row at Day 7.
    // Colored the same as the background to perfectly hide it.
    const padStart = addDaysToAnchor(anchor, 7);
    const padEnd = new Date(padStart.getTime() + 1000);
    rows.push([scheduled[0].name, '', '', padStart, padEnd]);
    barColors.push(isDark ? '#09090b' : '#f8f9fc');
  }

  /* ── Dimensions ── */
  const visibleRows = scheduled.length;
  const chartH      = ganttHeight(visibleRows);
  const timelineEnd = Math.max(projectEnd ?? 0, 7);
  const minChartW   = Math.max(800, timelineEnd * 60 + 200);

  const shouldScroll = visibleRows > MAX_VISIBLE_ROWS;
  const containerH   = shouldScroll ? ganttHeight(MAX_VISIBLE_ROWS) : chartH;

  const criticalCount = scheduled.filter((t) => t.isCritical).length;
  const labelColor    = isDark ? '#e4e4e7' : '#475569';

  /* ── Error state ── */
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

  /* ── Render ── */
  return (
    <section className="card overflow-hidden animate-slide-up" aria-labelledby="gantt-title">
      {/* Header */}
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

      {/* Chart body */}
      <div className="p-4 sm:p-5">
        <div
          className="overflow-x-auto border border-slate-100/60 dark:border-zinc-800/40 custom-scrollbar"
          style={{ 
            height: shouldScroll ? containerH : chartH,
            overflowY: shouldScroll ? 'auto' : 'hidden' 
          }}
        >
          <div className="gantt-container" style={{ minWidth: minChartW }}>
            <Chart
              chartType="Timeline"
              width="100%"
              height={chartH}
              data={[COLUMNS, ...rows]}
              options={{
                timeline: {
                  showRowLabels: true,
                  colorByRowLabel: false,
                  barHeight: 28,
                  rowLabelStyle: {
                    fontSize: 13,
                    fontName: 'Inter, system-ui, sans-serif',
                    color: labelColor,
                  },
                  barLabelStyle: {
                    fontSize: 11,
                    fontName: 'Inter, system-ui, sans-serif',
                    color: '#ffffff',
                  },
                },
                colors: barColors,
                tooltip: { isHtml: true },
                backgroundColor: 'transparent',
                hAxis: {
                  minValue: addDaysToAnchor(anchor, 0),
                  maxValue: addDaysToAnchor(anchor, Math.max(projectEnd ?? 0, 7)),
                  format: 'MMM d',
                  textStyle: {
                    fontSize: 11,
                    color: labelColor,
                    fontName: 'Inter, system-ui, sans-serif',
                  },
                },
              }}
              chartEvents={[
                {
                  eventName: 'ready',
                  callback: () => {
                    const container = document.querySelector('.gantt-container');
                    if (!container) return;
                    
                    const taskNames = scheduled.map(t => t.name);
                    const labels = container.querySelectorAll('svg text[text-anchor="end"]');
                    
                    labels.forEach((label) => {
                      if (taskNames.includes(label.textContent)) {
                        const originalX = parseFloat(label.getAttribute('x'));
                        if (originalX && !label.dataset.centered) {
                          label.setAttribute('x', (originalX / 2).toString());
                          label.setAttribute('text-anchor', 'middle');
                          label.dataset.centered = 'true';
                        }
                      }
                    });
                  },
                },
                {
                  eventName: 'error',
                  callback: ({ message }) =>
                    setChartError(
                      message || 'Chart failed to load. Please check your internet connection.'
                    ),
                },
              ]}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-slate-100/60 pt-4 dark:border-zinc-800/40">
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="inline-block h-3 w-6 rounded-sm" style={{ background: NORMAL_COLOR }} />
            Normal Task
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span className="inline-block h-3 w-6 rounded-sm" style={{ background: CRITICAL_COLOR }} />
            Critical Path
          </span>
          <span className="ml-auto text-xs text-slate-400 dark:text-zinc-500">
            {visibleRows} {visibleRows === 1 ? 'task' : 'tasks'} scheduled
          </span>
        </div>
      </div>
    </section>
  );
}