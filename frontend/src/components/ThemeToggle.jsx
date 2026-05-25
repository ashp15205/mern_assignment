export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
      className={`relative h-8 w-14 rounded-full transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-r from-brand-600 to-brand-500 shadow-md shadow-brand-500/20'
          : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 ${
          isDark ? 'left-[1.55rem]' : 'left-1'
        }`}
      >
        <span className="text-xs">{isDark ? '🌙' : '☀️'}</span>
      </span>
    </button>
  );
}
