export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'duration', label: 'Duration' },
  { value: 'start', label: 'Start Day' },
  { value: 'status', label: 'Status' },
];

export const API_BASE = import.meta.env.VITE_API_URL || '';
