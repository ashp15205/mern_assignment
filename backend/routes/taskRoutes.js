const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { requireBody } = require('../middleware/validateRequest');
const requireDb = require('../middleware/requireDb');
const taskController = require('../controllers/taskController');

router.use(requireDb);

router.get('/', asyncHandler(taskController.getTasks));
router.post('/', requireBody(['name', 'duration']), asyncHandler(taskController.createTask));
router.post('/schedule', asyncHandler(taskController.generateSchedule));
router.patch('/:id', asyncHandler(taskController.updateTask));
router.delete('/:id', asyncHandler(taskController.deleteTask));

module.exports = router;
