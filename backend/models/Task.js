const mongoose = require('mongoose');

const TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      maxlength: [200, 'Task name cannot exceed 200 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration cannot be negative'],
    },
    dependencies: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
      default: [],
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'Pending',
    },
    // Scheduling fields (computed by scheduling engine)
    startDay: { type: Number, default: null },
    endDay: { type: Number, default: null },
    isCritical: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.index({ name: 1 });

module.exports = mongoose.model('Task', taskSchema);
module.exports.TASK_STATUSES = TASK_STATUSES;
