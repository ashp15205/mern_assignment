import { useState } from 'react';
import { getScheduleAnchor } from '../utils/scheduleDates';

export default function SidebarToolbar() {
  const anchorDate = getScheduleAnchor();

  // Format as YYYY-MM-DD in local time for the HTML date input
  const tzOffset = anchorDate.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(anchorDate - tzOffset)).toISOString().split('T')[0];

  // Calculate today's date for the 'min' attribute
  const today = new Date();
  const todayISOTime = (new Date(today - (today.getTimezoneOffset() * 60000))).toISOString().split('T')[0];

  const [dateValue, setDateValue] = useState(localISOTime);

  const handleApplyDate = () => {
    const [year, month, day] = dateValue.split('-');
    if (!year || !month || !day) return;
    const newDate = new Date(year, month - 1, day);
    newDate.setHours(0, 0, 0, 0);
    localStorage.setItem('projectStartDate', newDate.getTime().toString());
    window.location.reload();
  };

  return (
    <div className="card p-4">
      <div className="border-slate-100 dark:border-zinc-800/60">
        <label className="section-label mb-1.5 block">Project Start Date</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateValue}
            min={todayISOTime}
            onChange={(e) => setDateValue(e.target.value)}
            className="input-field w-full"
          />
          <button
            type="button"
            onClick={handleApplyDate}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-500"
          >
            Apply
          </button>
        </div>
      </div>

    </div>
  );
}
