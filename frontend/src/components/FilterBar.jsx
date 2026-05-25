import { SORT_OPTIONS, TASK_STATUSES } from '../utils/constants';

export default function FilterBar({ filters, onChange, disabled }) {
  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          disabled={disabled}
          className="input-field !pl-10"
          aria-label="Search tasks"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 sm:justify-end">
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          disabled={disabled}
          className="input-field sm:w-36"
        >
          <option value="all">All Tasks</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          disabled={disabled}
          className="input-field sm:w-32"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
