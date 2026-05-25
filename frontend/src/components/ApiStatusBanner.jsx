const COPY = {
  checking: 'Checking connection…',
  ok: null,
  degraded: 'Database is not connected. Some features may be unavailable.',
  offline: 'API server is offline. Please start the backend.',
};

export default function ApiStatusBanner({ status, onRetry }) {
  const text = COPY[status];
  if (!text) return null;

  const isOffline = status === 'offline';

  return (
    <div
      className={`card flex items-center justify-between gap-3 px-5 py-3.5 text-sm backdrop-blur-xl animate-slide-down ${
        isOffline
          ? 'border-red-200/60 bg-red-50/80 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300'
          : 'border-amber-200/60 bg-amber-50/80 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base">{isOffline ? '🔴' : '🟡'}</span>
        <span>{text}</span>
      </div>
      {status !== 'checking' && (
        <button type="button" onClick={onRetry} className="toolbar-btn !py-1.5 !text-xs">
          Retry
        </button>
      )}
    </div>
  );
}
