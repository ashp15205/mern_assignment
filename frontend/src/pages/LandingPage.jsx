import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../hooks/useTheme';

export default function LandingPage() {
  const { login, signup, loading } = useAuth();
  const { theme, toggle } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);

  const authSectionRef = useRef(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    let res;
    if (isLogin) {
      res = await login(email, password);
    } else {
      res = await signup(name, email, password);
    }

    if (!res.success) {
      setError(res.error);
    }
  };

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Automatically switch to sign up if they click "Get Started"
    setIsLogin(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-50 selection:bg-brand-500/30">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-500 shadow-sm shadow-brand-500/20">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="font-semibold tracking-tight">Mini Project Planner</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} onToggle={toggle} />
            <button
              onClick={() => {
                authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                setIsLogin(true);
              }}
              className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400"
            >
              Sign In
            </button>
            <button
              onClick={scrollToAuth}
              className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 sm:block"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 text-center lg:px-8 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100/40 via-slate-50 to-slate-50 dark:from-brand-900/20 dark:via-zinc-950 dark:to-zinc-950" />

        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Master your project timeline
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-zinc-400 sm:text-xl">
            The ultimate Gantt chart and dependency tracker. Automatically calculate your critical path, prevent scheduling bottlenecks, and deliver your projects on time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={scrollToAuth}
              className="flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-500 hover:shadow-brand-500/40 active:scale-95"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mx-auto mt-20 max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Topological Sort</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Instantly detects circular dependencies and strictly orders your tasks so you know exactly what to do next.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Critical Path Method</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Highlights the longest sequence of tasks. If a critical task is delayed, the entire project is delayed.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Multi-Tenant Isolation</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Your schedules are strictly private. Securely authenticate to view and manage your isolated project data.</p>
          </div>
        </div>
      </section>

      {/* ── Auth Section ── */}
      <section ref={authSectionRef} className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-20 pb-32">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/60 bg-white/70 p-8 shadow-xl shadow-brand-500/5 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/70">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
              {isLogin ? 'Sign in to access your planner' : 'Join today to start planning'}
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-brand-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-brand-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-brand-500"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-md shadow-brand-500/20 transition-colors hover:bg-brand-700 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-zinc-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
