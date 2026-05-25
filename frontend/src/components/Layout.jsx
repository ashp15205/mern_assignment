import ThemeToggle from './ThemeToggle';

export default function Layout({ children, theme, onToggleTheme, projectEnd, totalTasks }) {
  return (
    <div className="min-h-screen">
      {/* ── Premium header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-2xl dark:border-zinc-800/50 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5 lg:px-8">
          {/* Left — Logo & brand */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 shadow-md shadow-brand-500/20">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <div className="min-w-0">
              <h1 className="page-heading truncate !text-lg">Mini Project Planner</h1>
              <p className="truncate text-xs text-slate-400 dark:text-zinc-500">Gantt & Dependency Tracker</p>
            </div>
          </div>

          {/* Right — Stats & toggle */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full bg-slate-100/80 px-3.5 py-1.5 text-xs font-medium tabular-nums text-slate-600 dark:bg-zinc-800/80 dark:text-zinc-400">
                {totalTasks ?? 0} tasks
              </span>
              <span className="rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold tabular-nums text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                Day {projectEnd ?? 0}
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200 dark:bg-zinc-700" />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
