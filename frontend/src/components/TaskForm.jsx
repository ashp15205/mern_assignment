import { useState, useEffect } from 'react';
import { TASK_STATUSES } from '../utils/constants';
import { validateDependencyIds } from '../utils/validation';
import DependencyPicker from './DependencyPicker';

const emptyForm = { name: '', duration: '0', dependencyIds: [], status: 'Pending' };

export default function TaskForm({ tasks, editingTask, onCancelEdit, onSubmit, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setForm({
        name: editingTask.name,
        duration: editingTask.duration.toString(),
        dependencyIds: editingTask.dependencies || [],
        status: editingTask.status || 'Pending',
      });
      setLocalError('');
    } else {
      setForm(emptyForm);
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const name = form.name.trim();
    const duration = Number(form.duration);
    if (!name) { setLocalError('Task name is required'); return; }
    if (Number.isNaN(duration) || duration < 0) { setLocalError('Invalid duration'); return; }
    const depErr = validateDependencyIds(form.dependencyIds);
    if (depErr) { setLocalError(depErr); return; }

    const result = await onSubmit({
      name,
      duration,
      dependencies: form.dependencyIds,
      status: form.status,
    });
    if (result?.ok) setForm({ ...emptyForm, duration: '3' });
    else if (result?.error) setLocalError(result.error);
  };

  return (
    <form onSubmit={handleSubmit} className="card overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="panel-head">
        <div>
          <p className="section-label">{editingTask ? 'Edit' : 'New'}</p>
          <h2 className="section-heading">{editingTask ? 'Update Task' : 'Create Task'}</h2>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-sm dark:bg-brand-950/40">
          ✦
        </span>
      </div>

      <div className="space-y-4 p-5">
        {/* Error */}
        {localError && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200/60 animate-scale-in dark:bg-red-950/30 dark:text-red-300 dark:ring-red-800/40" role="alert">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>{localError}</span>
          </div>
        )}

        {/* Task name */}
        <div>
          <label className="section-label mb-1.5 block" htmlFor="task-name">Task Name</label>
          <input
            id="task-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="e.g. Design System, API Setup…"
            disabled={loading}
          />
        </div>

        {/* Duration + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-label mb-1.5 block" htmlFor="task-duration">Duration (days)</label>
            <input
              id="task-duration"
              type="number"
              min={0}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="input-field"
              disabled={loading}
            />
          </div>
          <div>
            <label className="section-label mb-1.5 block" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input-field"
              disabled={loading}
            >
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <label className="section-label mb-1.5 block">Predecessors</label>
          <DependencyPicker
            tasks={tasks.filter(t => !editingTask || t._id !== editingTask._id)}
            selectedIds={form.dependencyIds}
            onChange={(ids) => setForm({ ...form, dependencyIds: ids })}
            disabled={loading}
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-2">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving…
              </>
            ) : (
              editingTask ? 'Update Task' : 'Add & Schedule'
            )}
          </button>
          {editingTask && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={loading}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 underline dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
