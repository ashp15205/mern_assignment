const mongoose = require('mongoose');
const { AppError } = require('./errors');

function parseObjectId(id, label = 'Task ID') {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
  return id;
}

function normalizeDependencies(deps) {
  if (deps === undefined || deps === null) return [];
  if (!Array.isArray(deps)) {
    throw new AppError('Dependencies must be an array', 400);
  }
  return [...new Set(deps.map(String))];
}

function validateDuration(duration) {
  const num = Number(duration);
  if (Number.isNaN(num)) {
    throw new AppError('Duration must be a number', 400);
  }
  if (num < 1) {
    throw new AppError('Duration must be at least 1 day', 400);
  }
  return num;
}

function validateName(name) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('Task name is required', 400);
  }
  return name.trim();
}

function validateStatus(status) {
  const allowed = ['Pending', 'In Progress', 'Completed'];
  if (status && !allowed.includes(status)) {
    throw new AppError(`Status must be one of: ${allowed.join(', ')}`, 400);
  }
  return status;
}

/** Self-deps, invalid IDs, duplicates */
function validateDependencies(depIds, taskId = null, existingTaskIds = new Set()) {
  const normalized = normalizeDependencies(depIds);

  if (taskId && normalized.includes(String(taskId))) {
    throw new AppError('A task cannot depend on itself', 400);
  }

  for (const depId of normalized) {
    parseObjectId(depId, 'dependency ID');
    if (!existingTaskIds.has(depId)) {
      throw new AppError(`Invalid dependency: task ${depId} does not exist`, 400);
    }
  }

  return normalized;
}

module.exports = {
  parseObjectId,
  normalizeDependencies,
  validateDuration,
  validateName,
  validateStatus,
  validateDependencies,
};
