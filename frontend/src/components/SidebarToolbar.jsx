export default function SidebarToolbar({ onRecalculate, onRefresh, recalcDisabled, refreshDisabled }) {
  return (
    <div className="card p-4">
      <p className="section-label mb-3">Quick Actions</p>
      <div className="flex gap-2.5">
        <button type="button" onClick={onRecalculate} disabled={recalcDisabled} className="toolbar-btn flex-1">
          <span className="mr-1.5">⟳</span> Recalculate
        </button>
        <button type="button" onClick={onRefresh} disabled={refreshDisabled} className="toolbar-btn flex-1">
          <span className="mr-1.5">↻</span> Refresh
        </button>
      </div>
    </div>
  );
}
