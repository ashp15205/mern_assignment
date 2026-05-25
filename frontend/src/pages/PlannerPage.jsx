import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useApiHealth } from '../hooks/useApiHealth';
import Layout from '../components/Layout';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import GanttChart from '../components/GanttChart';
import DependencyGraph from '../components/DependencyGraph';
import FilterBar from '../components/FilterBar';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import ApiStatusBanner from '../components/ApiStatusBanner';
import ScheduleSummary from '../components/ScheduleSummary';
import SidebarToolbar from '../components/SidebarToolbar';

export default function PlannerPage({ theme, onToggleTheme }) {
  const {
    tasks,
    allTasks,
    projectEnd,
    totalTasks,
    criticalPath,
    loading,
    actionLoading,
    error,
    filters,
    setFilters,
    createTask,
    deleteTask,
    updateTask,
    regenerateSchedule,
    clearError,
    fetchTasks,
  } = useTasks();

  const { status: apiStatus, retry: retryApi } = useApiHealth();

  const [editingTask, setEditingTask] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return;
    await deleteTask(id);
  };

  const taskOptions = allTasks.length ? allTasks : tasks;

  return (
    <Layout theme={theme} onToggleTheme={onToggleTheme} projectEnd={projectEnd} totalTasks={totalTasks}>
      {/* ── Alerts ── */}
      {(apiStatus !== 'ok' || error) && (
        <div className="mb-5 space-y-3 animate-slide-down">
          <ApiStatusBanner status={apiStatus} onRetry={() => { retryApi(); fetchTasks(); }} />
          <Alert message={error} onDismiss={clearError} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] xl:gap-8">
        {/* ── Left sidebar ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:z-10 lg:self-start">
          <TaskForm 
            tasks={taskOptions} 
            editingTask={editingTask}
            onCancelEdit={() => setEditingTask(null)}
            onSubmit={async (payload) => {
              if (editingTask) {
                const res = await updateTask(editingTask._id, payload);
                if (res?.ok) setEditingTask(null);
                return res;
              }
              return createTask(payload);
            }} 
            loading={actionLoading} 
          />
          <SidebarToolbar
            onRecalculate={() => regenerateSchedule()}
            onRefresh={() => fetchTasks()}
            recalcDisabled={actionLoading || !totalTasks}
            refreshDisabled={loading}
          />
        </div>

        {/* ── Main content ── */}
        <div className="min-w-0 space-y-5">
          <ScheduleSummary
            projectEnd={projectEnd}
            totalTasks={totalTasks}
            criticalCount={criticalPath?.length ?? 0}
            filteredCount={tasks.length}
          />

          <FilterBar filters={filters} onChange={setFilters} disabled={loading} />

          {loading ? (
            <LoadingSpinner label="Loading project…" />
          ) : (
            <div className="space-y-5 animate-fade-in">
              {/* ── 1. Work Breakdown ── */}
              <TaskList
                tasks={tasks}
                onEdit={setEditingTask}
                onDelete={handleDelete}
                onStatusChange={updateTask}
                loading={actionLoading}
              />

              {/* ── 2. Gantt Chart ── */}
              <GanttChart tasks={tasks} allTasks={allTasks} projectEnd={projectEnd} theme={theme} />

              {/* ── 3. Dependency Graph ── */}
              {allTasks.length > 0 && <DependencyGraph tasks={allTasks} theme={theme} />}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
