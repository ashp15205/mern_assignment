import { addDaysToAnchor, formatScheduleAnchor, getScheduleAnchor } from './scheduleDates';

export function formatDayRange(start, end) {
  if (start == null || end == null) return { days: '—', dates: null };
  const anchor = getScheduleAnchor();
  if (start === end) {
    return {
      days: `Day ${start}`,
      dates: formatShortDate(addDaysToAnchor(anchor, start))
    };
  }
  return {
    days: `Day ${start}→${end}`,
    dates: `${formatShortDate(addDaysToAnchor(anchor, start))} – ${formatShortDate(addDaysToAnchor(anchor, end))}`
  };
}

function formatShortDate(d) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDayZeroLabel() {
  return formatScheduleAnchor(getScheduleAnchor());
}

export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? `${str.slice(0, len)}…` : str;
}
