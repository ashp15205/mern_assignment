export default function Alert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      className="card flex items-start gap-3 border-red-200/60 bg-red-50/80 px-5 py-4 text-sm text-red-800 backdrop-blur-xl animate-slide-down dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
      role="alert"
    >
      <span className="mt-0.5 shrink-0 text-base">⚠️</span>
      <span className="flex-1 leading-relaxed">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 opacity-50 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
