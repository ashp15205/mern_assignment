export default function ScheduleSummary({ projectEnd, totalTasks, criticalCount, filteredCount }) {
  const items = [
    { label: 'Total Tasks', value: totalTasks, icon: '📊' },
    { label: 'Showing', value: filteredCount, icon: '👁' },
    { label: 'Project End', value: `Day ${projectEnd ?? 0}`, accent: true, icon: '🎯' },
    { label: 'Critical', value: criticalCount, icon: '⚡' },
  ];

  return (
    <div className="stat-strip animate-slide-up">
      {items.map((item, idx) => (
        <div key={item.label} className="stat-card" style={{ animationDelay: `${idx * 80}ms` }}>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-sm">{item.icon}</span>
            <p className="section-label">{item.label}</p>
          </div>
          <p className={item.accent ? 'stat-value-accent' : 'stat-value'}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
