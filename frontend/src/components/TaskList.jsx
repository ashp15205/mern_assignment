import { useState } from 'react';
import { formatDayRange } from '../utils/formatters';
import { TASK_STATUSES } from '../utils/constants';

const statusConfig = {
  Pending: { badge: 'badge-pending', dot: 'bg-slate-400' },
  'In Progress': { badge: 'badge-progress', dot: 'bg-amber-500' },
  Completed: { badge: 'badge-completed', dot: 'bg-emerald-500' },
};

/**
 * Returns true if the task is blocked from progressing (some dep not yet Completed).
 * allTasks is the full unfiltered task list used to look up dep statuses.
 */
function isStatusLocked(task, allTasks) {
  if (!task.dependencies || task.dependencies.length === 0) return false;
  const byId = new Map(allTasks.map((t) => [String(t._id), t]));
  return task.dependencies.some((depId) => {
    const dep = byId.get(String(depId));
    return dep && dep.status !== 'Completed';
  });
}

function getBlockerNames(task, allTasks) {
  if (!task.dependencies || task.dependencies.length === 0) return [];
  const byId = new Map(allTasks.map((t) => [String(t._id), t]));
  return task.dependencies
    .map((depId) => byId.get(String(depId)))
    .filter((dep) => dep && dep.status !== 'Completed')
    .map((dep) => dep.name);
}

export default function TaskList({ tasks, allTasks = [], onEdit, onDelete, onStatusChange, loading }) {
  const [rowError, setRowError] = useState({}); // { taskId: errorMsg }

  async function handleStatusChange(taskId, update) {
    setRowError((prev) => ({ ...prev, [taskId]: null }));
    const result = await onStatusChange(taskId, update);
    if (result?.error) {
      setRowError((prev) => ({ ...prev, [taskId]: result.error }));
    }
  }

  if (!tasks.length) {
    return (
      <section className="card overflow-hidden">
        <div className="panel-head">
          <div>
            <p className="section-label">Overview</p>
            <h2 className="section-heading">Work Breakdown</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium tabular-nums text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
            0 tasks
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl dark:bg-zinc-800">
            📋
          </div>
          <p className="section-heading">No tasks yet</p>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Create your first task using the form on the left.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      {/* ── Header ── */}
      <div className="panel-head">
        <div>
          <p className="section-label">Overview</p>
          <h2 className="section-heading">Work Breakdown</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium tabular-nums text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* ── Mobile cards ── */}
      <div className="space-y-3 p-4 md:hidden">
        {tasks.map((task) => {
          const { days, dates } = formatDayRange(task.startDay, task.endDay);
          const locked = isStatusLocked(task, allTasks);
          const blockers = getBlockerNames(task, allTasks);
          const err = rowError[task._id];
          return (
            <div
              key={task._id}
              className={`rounded-xl border border-slate-100/80 bg-slate-50/40 p-4 transition-all duration-200 dark:border-zinc-800/60 dark:bg-zinc-800/20 ${task.isCritical ? 'ring-1 ring-red-200/60 dark:ring-red-800/40' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${statusConfig[task.status]?.dot || 'bg-slate-400'}`} />
                    <span className="text-[15px] font-semibold text-slate-800 dark:text-zinc-100">{task.name}</span>
                    {task.isCritical && <span className="badge badge-critical text-[10px]">Critical</span>}
                  </div>
                  <div className="mt-1 pl-4 text-sm text-slate-500 dark:text-zinc-400">
                    <span className="block text-slate-700 dark:text-zinc-300">{days}</span>
                    {dates && <span className="block text-[13px]">{dates}</span>}
                  </div>
                </div>
                <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold tabular-nums text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {task.duration}d
                </span>
              </div>

              {/* Inline error */}
              {err && (
                <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  <span className="shrink-0">⚠</span>
                  <span>{err}</span>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-3 dark:border-zinc-800/60">
                <div className="flex items-center gap-1.5">
                  {locked && (
                    <span
                      title={`Blocked by: ${blockers.join(', ')}`}
                      className="text-base leading-none"
                    >
                      🔒
                    </span>
                  )}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, { status: e.target.value })}
                    disabled={loading || locked}
                    title={locked ? `Complete first: ${blockers.join(', ')}` : undefined}
                    className={`badge border-0 ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${statusConfig[task.status]?.badge || 'badge-pending'}`}
                  >
                    {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(task._id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100/80 bg-slate-50/40 dark:border-zinc-800/60 dark:bg-zinc-800/20">
              {['Task', 'Duration', 'Schedule', 'Deps', 'Status', ''].map((h) => (
                <th
                  key={h || 'actions'}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60 dark:divide-zinc-800/40">
            {tasks.map((task) => {
              const { days, dates } = formatDayRange(task.startDay, task.endDay);
              const locked = isStatusLocked(task, allTasks);
              const blockers = getBlockerNames(task, allTasks);
              const err = rowError[task._id];
              return (
                <tr
                  key={task._id}
                  className={`group transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 ${
                    task.isCritical ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-2 w-2 shrink-0 rounded-full ${statusConfig[task.status]?.dot || 'bg-slate-400'}`} />
                        <span className="font-medium text-slate-800 dark:text-zinc-100">{task.name}</span>
                        {task.isCritical && (
                          <span className="badge badge-critical text-[10px]">Critical</span>
                        )}
                      </div>
                      {/* Inline error below task name */}
                      {err && (
                        <div className="flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                          <span className="shrink-0">⚠</span>
                          <span>{err}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 tabular-nums text-slate-600 dark:text-zinc-400">
                    {task.duration} {task.duration === 1 ? 'day' : 'days'}
                  </td>
                  <td className="max-w-[220px] px-5 py-4 text-sm text-slate-500 dark:text-zinc-400">
                    <span className="block text-slate-700 dark:text-zinc-300">{days}</span>
                    {dates && <span className="block text-[13px] text-slate-400 dark:text-zinc-500">{dates}</span>}
                  </td>
                  <td className="px-5 py-4">
                    {(task.dependencies || []).length > 0 ? (
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                        {(task.dependencies || []).length}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {locked && (
                        <span
                          title={`Complete first: ${blockers.join(', ')}`}
                          className="text-base leading-none"
                        >
                          🔒
                        </span>
                      )}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, { status: e.target.value })}
                        disabled={loading || locked}
                        title={locked ? `Complete first: ${blockers.join(', ')}` : undefined}
                        className={`badge border-0 ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${statusConfig[task.status]?.badge || 'badge-pending'}`}
                      >
                        {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        disabled={loading}
                        className="rounded-lg px-3 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task._id)}
                        disabled={loading}
                        className="rounded-lg px-3 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
