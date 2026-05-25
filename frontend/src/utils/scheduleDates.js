/** Day 0 = project start date (saved in localStorage, defaults to today). */
export function getScheduleAnchor() {
  const saved = localStorage.getItem('projectStartDate');
  if (saved) {
    const d = new Date(parseInt(saved, 10));
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  localStorage.setItem('projectStartDate', d.getTime().toString());
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
