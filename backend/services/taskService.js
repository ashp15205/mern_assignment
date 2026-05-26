const Task = require('../models/Task');
const { AppError } = require('../utils/errors');
const { computeSchedule } = require('../utils/schedulingEngine');
const {
  validateName,
  validateDuration,
  validateStatus,
  validateDependencies,
  parseObjectId,
} = require('../utils/taskValidation');

async function getAllTaskIds(userId) {
  const tasks = await Task.find({ user: userId }, '_id').lean();
  return new Set(tasks.map((t) => String(t._id)));
}

async function createTask(body, userId) {
  const name = validateName(body.name);
  const duration = validateDuration(body.duration);
  const status = validateStatus(body.status) || 'Pending';
  const existingIds = await getAllTaskIds(userId);
  const depIds = validateDependencies(body.dependencies, null, existingIds);

  const duplicate = await Task.findOne({
    user: userId,
    name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });
  if (duplicate) {
    throw new AppError('A task with this name already exists', 409);
  }

  const task = await Task.create({
    user: userId,
    name,
    duration,
    dependencies: depIds,
    status,
  });

  // Validate no circular dependencies after insert
  const allTasks = await Task.find({ user: userId });
  const { computeSchedule: sched } = require('../utils/schedulingEngine');
  const check = sched(allTasks);
  if (!check.ok) {
    await Task.findByIdAndDelete(task._id);
    throw new AppError(check.error, 422);
  }

  return recalculateAndSave(userId);
}

/** Project-wide schedule stats (unaffected by list filters). */
async function getScheduleMeta(userId) {
  const all = await Task.find({ user: userId }).lean();
  if (!all.length) {
    return { projectEnd: 0, criticalPath: [], totalTasks: 0 };
  }
  const ends = all.map((t) => (t.endDay != null ? t.endDay : 0));
  return {
    projectEnd: Math.max(0, ...ends),
    criticalPath: all.filter((t) => t.isCritical).map((t) => String(t._id)),
    totalTasks: all.length,
  };
}

async function getTasks(query = {}, userId) {
  const { sort = 'name', status, search } = query;
  const filter = { user: userId };
  if (status && status !== 'all') filter.status = status;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const sortMap = {
    name: { name: 1 },
    duration: { duration: -1 },
    start: { startDay: 1 },
    status: { status: 1 },
  };

  const [tasks, allTasks, meta] = await Promise.all([
    Task.find(filter).sort(sortMap[sort] || sortMap.name).lean(),
    Task.find({ user: userId }).sort({ startDay: 1, name: 1 }).lean(),
    getScheduleMeta(userId),
  ]);

  return { tasks, allTasks, meta };
}

async function deleteTask(id, userId) {
  parseObjectId(id);
  const task = await Task.findOneAndDelete({ _id: id, user: userId });
  if (!task) throw new AppError('Task not found', 404);

  // Remove deleted task from other tasks' dependencies
  await Task.updateMany(
    { user: userId, dependencies: task._id },
    { $pull: { dependencies: task._id } }
  );

  return recalculateAndSave(userId);
}

async function generateSchedule(userId) {
  return recalculateAndSave(userId);
}

/**
 * Run scheduling engine and persist start/end/critical flags on all tasks.
 */
async function recalculateAndSave(userId) {
  const tasks = await Task.find({ user: userId });
  if (tasks.length === 0) {
    return { tasks: [], projectEnd: 0, criticalPath: [], message: 'No tasks to schedule' };
  }

  const result = computeSchedule(tasks);
  if (!result.ok) {
    throw new AppError(result.error, 422);
  }

  const bulkOps = result.tasks.map((t) => ({
    updateOne: {
      filter: { _id: t._id, user: userId },
      update: {
        $set: {
          startDay: t.startDay,
          endDay: t.endDay,
          isCritical: t.isCritical,
        },
      },
    },
  }));

  await Task.bulkWrite(bulkOps);
  const updated = await Task.find({ user: userId }).sort({ startDay: 1, name: 1 }).lean();

  return {
    tasks: updated,
    projectEnd: result.projectEnd,
    criticalPath: result.criticalPath,
  };
}

async function updateTask(id, body, userId) {
  parseObjectId(id);
  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) throw new AppError('Task not found', 404);

  const existingIds = await getAllTaskIds(userId);

  if (body.name !== undefined) {
    const name = validateName(body.name);
    const duplicate = await Task.findOne({
      user: userId,
      _id: { $ne: task._id },
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (duplicate) throw new AppError('A task with this name already exists', 409);
    task.name = name;
  }
  if (body.duration !== undefined) task.duration = validateDuration(body.duration);
  if (body.status !== undefined) task.status = validateStatus(body.status) || task.status;

  if (body.dependencies !== undefined) {
    const deps = validateDependencies(body.dependencies, id, existingIds);
    // Pre-check cycle if we add these deps
    const hypothetical = await Task.find({ user: userId }).lean();
    const idx = hypothetical.findIndex((t) => String(t._id) === id);
    if (idx >= 0) hypothetical[idx] = { ...hypothetical[idx], dependencies: deps };
    const { computeSchedule: sched } = require('../utils/schedulingEngine');
    const check = sched(
      hypothetical.map((t) => ({
        ...t,
        toObject: () => t,
      }))
    );
    if (!check.ok) throw new AppError(check.error, 422);
    task.dependencies = deps;
  }

  await task.save();
  return recalculateAndSave(userId);
}

module.exports = {
  createTask,
  getTasks,
  getScheduleMeta,
  deleteTask,
  generateSchedule,
  updateTask,
  recalculateAndSave,
};
