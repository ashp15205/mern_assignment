export default function DependencyPicker({ tasks, selectedIds, onChange, disabled }) {
  if (!tasks?.length) {
    return (
      <div className="rounded-xl bg-slate-50/80 px-4 py-4 text-center text-sm text-slate-400 dark:bg-zinc-800/40 dark:text-zinc-500">
        Create a task first to add dependencies.
      </div>
    );
  }

  const toggle = (id) => {
    const set = new Set(selectedIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange([...set]);
  };

  return (
    <ul className="max-h-36 space-y-1 overflow-y-auto rounded-xl bg-slate-50/80 p-2 dark:bg-zinc-800/40">
      {tasks.map((t) => {
        const checked = selectedIds.includes(t._id);
        return (
          <li key={t._id}>
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                checked
                  ? 'bg-white shadow-sm ring-1 ring-brand-200/60 dark:bg-zinc-700 dark:ring-brand-800/40'
                  : 'hover:bg-white/60 dark:hover:bg-zinc-700/40'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(t._id)}
                disabled={disabled}
                className="h-4 w-4 rounded-md border-slate-300 text-brand-500 focus:ring-brand-500/30 dark:border-zinc-600"
              />
              <span className="flex-1 truncate font-medium text-slate-700 dark:text-zinc-200">{t.name}</span>
              <span className="text-xs tabular-nums text-slate-400 dark:text-zinc-500">{t.duration}d</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
