const mongoose = require('mongoose');

/**
 * Task Assignment Model
 * Stores task assignments from admin to staff
 * Tracks task progress and completion status
 */
const TaskAssignmentSchema = new mongoose.Schema({
  // Staff member assigned to this task
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
    index: true
  },

  // Room associated with this task
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },

  // Task title
  title: {
    type: String,
    required: true
  },

  // Task description
  description: {
    type: String
  },

  // Task type
  taskType: {
    type: String,
    enum: ['Cleaning', 'Maintenance', 'Inspection', 'Setup', 'Repair', 'Other'],
    required: true
  },

  // Task priority
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },

  // Task status
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },

  // Due date for task
  dueDate: {
    type: Date,
    required: true
  },

  // Start date (when staff starts working on it)
  startedAt: {
    type: Date,
    default: null
  },

  // Completion date
  completedAt: {
    type: Date,
    default: null
  },

  // Estimated hours required
  estimatedHours: {
    type: Number,
    default: 1
  },

  // Actual hours spent
  actualHours: {
    type: Number,
    default: 0
  },

  // Completion notes
  notes: {
    type: String,
    default: ''
  },

  // Admin who assigned this task
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Created timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Last updated timestamp
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TaskAssignment', TaskAssignmentSchema);
