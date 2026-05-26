const taskService = require('../services/taskService');

const createTask = async (req, res) => {
  const result = await taskService.createTask({ ...req.body, user: req.user.id }, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Task created and schedule updated',
    data: result,
  });
};

const getTasks = async (req, res) => {
  const { tasks, allTasks, meta } = await taskService.getTasks(req.query, req.user.id);
  res.json({
    success: true,
    count: tasks.length,
    data: tasks,
    allTasks,
    meta,
  });
};

const deleteTask = async (req, res) => {
  const result = await taskService.deleteTask(req.params.id, req.user.id);
  res.json({
    success: true,
    message: 'Task deleted and schedule recalculated',
    data: result,
  });
};

const generateSchedule = async (req, res) => {
  const result = await taskService.generateSchedule(req.user.id);
  res.json({
    success: true,
    message: result.message || 'Schedule generated',
    data: result,
  });
};

const updateTask = async (req, res) => {
  const result = await taskService.updateTask(req.params.id, req.body, req.user.id);
  res.json({
    success: true,
    message: 'Task updated and schedule recalculated',
    data: result,
  });
};

module.exports = {
  createTask,
  getTasks,
  deleteTask,
  generateSchedule,
  updateTask,
};
