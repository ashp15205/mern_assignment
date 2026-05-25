import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useDebouncedValue } from './useDebouncedValue';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [projectEnd, setProjectEnd] = useState(0);
  const [criticalPath, setCriticalPath] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ sort: 'start', status: 'all', search: '' });

  const debouncedSearch = useDebouncedValue(filters.search, 400);
  const queryFilters = { ...filters, search: debouncedSearch };

  const applyScheduleData = (data) => {
    if (data?.tasks) {
      setTasks(data.tasks);
      setAllTasks(data.tasks);
      setProjectEnd(data.projectEnd ?? 0);
      setCriticalPath(data.criticalPath ?? []);
      setTotalTasks(data.tasks.length);
    } else if (Array.isArray(data)) {
      setTasks(data);
    }
  };

  const applyMeta = (meta) => {
    if (!meta) return;
    setProjectEnd(meta.projectEnd ?? 0);
    setCriticalPath(meta.criticalPath ?? []);
    setTotalTasks(meta.totalTasks ?? 0);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.getTasks({
        sort: queryFilters.sort,
        status: queryFilters.status === 'all' ? undefined : queryFilters.status,
        search: queryFilters.search || undefined,
      });
      setTasks(data.data || []);
      setAllTasks(data.allTasks || data.data || []);
      applyMeta(data.meta);
    } catch (e) {
      setError(e.message);
      // Keep last good data visible during transient failures (demo stability)
    } finally {
      setLoading(false);
    }
  }, [queryFilters.sort, queryFilters.status, queryFilters.search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const runAction = async (fn) => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (result?.data) applyScheduleData(result.data);
      else await fetchTasks();
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setActionLoading(false);
    }
  };

  const createTask = (payload) =>
    runAction(async () => {
      const { data } = await api.createTask(payload);
      return data;
    });

  const deleteTask = (id) =>
    runAction(async () => {
      const { data } = await api.deleteTask(id);
      return data;
    });

  const updateTask = (id, payload) =>
    runAction(async () => {
      const { data } = await api.updateTask(id, payload);
      return data;
    });

  const regenerateSchedule = () =>
    runAction(async () => {
      const { data } = await api.generateSchedule();
      return data;
    });

  const clearError = () => setError(null);

  return {
    tasks,
    allTasks,
    projectEnd,
    criticalPath,
    totalTasks,
    loading,
    actionLoading,
    error,
    filters,
    setFilters,
    fetchTasks,
    createTask,
    deleteTask,
    updateTask,
    regenerateSchedule,
    clearError,
  };
}
