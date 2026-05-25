export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="empty-state" role="status">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-zinc-700" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-500 dark:border-t-brand-400" />
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}
