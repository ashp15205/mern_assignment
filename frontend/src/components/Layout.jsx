import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Layout({ children, theme, onToggleTheme, projectEnd, totalTasks }) {
  const { user, logout, deleteAccount } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* Center — Greeting */}
          {user && (
            <div className="hidden flex-1 items-center justify-center sm:flex">
              <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">
                Hi {user.name.split(' ')[0]} 👋
              </span>
            </div>
          )}

          {/* Right — Stats & toggle & profile */}
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

            {/* Profile Dropdown */}
            {user && (
              <div className="relative ml-2" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <User className="h-4 w-4" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="border-b border-slate-100 px-4 py-2 dark:border-zinc-800">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-zinc-100">{user.name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-zinc-400">{user.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete your account? This will permanently delete all your tasks.')) {
                          deleteAccount();
                        }
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
