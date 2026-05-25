/** Day 0 = start of today (local midnight). */
export function getScheduleAnchor() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDaysToAnchor(anchor, days) {
  const d = new Date(anchor);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatScheduleAnchor(anchor) {
  return anchor.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
