// backend/routes/tasks.js
// ============================================
// TASKS ROUTES - Handle task assignments
// ============================================

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authorizeAdminOrReceptionist } = require('../middleware/role');
const TaskAssignment = require('../models/TaskAssignment');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const { sendEmail } = require('../services/emailService');

// ============================================
// CREATE TASK ASSIGNMENT (Admin or receptionist)
// ============================================
router.post('/assign', authenticate, authorizeAdminOrReceptionist, async (req, res) => {
  try {
    const {
      staffId,
      title,
      description,
      priority,
      status,
      taskType,
      roomId,
      locationType,
      oasis,
      dueDate
    } = req.body;

    if (!staffId || !title) {
      return res.status(400).json({ error: 'Staff ID and title are required' });
    }
    const finalLocationType = locationType || (roomId ? 'Room' : 'Pool');
    if (!['Room', 'Pool'].includes(finalLocationType)) {
      return res.status(400).json({ error: 'Location type must be Room or Pool' });
    }
    if (finalLocationType === 'Room' && !roomId) {
      return res.status(400).json({ error: 'Room ID is required for room tasks' });
    }
    if (finalLocationType === 'Pool' && !['Oasis 1', 'Oasis 2'].includes(oasis)) {
      return res.status(400).json({ error: 'A valid Oasis is required for pool tasks' });
    }

    // Validate status is correct enum value
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    const finalStatus = validStatuses.includes(status) ? status : 'Pending';

    // Set due date - default to 3 days from now if not provided
    const finalDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // Create task assignment
    const newTask = new TaskAssignment({
      staffId,
      title,
      description: description || '',
      priority: priority || 'Medium',
      status: finalStatus,
      roomId: roomId || null,
      locationType: finalLocationType,
      oasis: oasis || null,
      taskType: taskType || 'Maintenance',
      dueDate: finalDueDate,
      assignedBy: req.user.id
    });

    const savedTask = await newTask.save();
    return res.status(201).json({
      success: true,
      message: 'Task assigned successfully',
      task: savedTask
    });
  } catch (error) {
    console.error('Error creating task assignment:', error);
    return res.status(500).json({ error: 'Error creating task assignment', details: error.message });
  }
});

router.get('/pool-monitoring', authenticate, authorizeAdminOrReceptionist, async (req, res) => {
  try {
    const { oasis } = req.query;
    if (!['Oasis 1', 'Oasis 2'].includes(oasis)) {
      return res.status(400).json({ error: 'A valid Oasis is required' });
    }

    const oasisNumber = oasis.slice(-1);
    const tasks = await TaskAssignment.find({
      reviewedAt: null,
      $or: [
        { locationType: 'Pool', oasis },
        {
          locationType: { $exists: false },
          title: { $regex: `Oasis\\s*${oasisNumber}`, $options: 'i' },
          description: { $regex: 'pool', $options: 'i' }
        }
      ]
    })
      .populate('staffId', 'name email position')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching pool monitoring assignments:', error);
    return res.status(500).json({ error: 'Error fetching pool monitoring assignments' });
  }
});

router.patch('/pool-monitoring/:taskId/review', authenticate, authorizeAdminOrReceptionist, async (req, res) => {
  try {
    const task = await TaskAssignment.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Pool monitoring task not found' });
    }
    const isLegacyPoolTask = /\bpool\b/i.test(`${task.title} ${task.description || ''}`)
      && /Oasis\s*[12]/i.test(`${task.title} ${task.description || ''}`);
    if (task.locationType !== 'Pool' && !isLegacyPoolTask) {
      return res.status(404).json({ error: 'Pool monitoring task not found' });
    }
    if (task.status !== 'Completed') {
      return res.status(409).json({ error: 'Only completed pool tasks can be reviewed' });
    }

    task.reviewedAt = task.reviewedAt || new Date();
    if (mongoose.Types.ObjectId.isValid(req.user.id)) {
      task.reviewedBy = req.user.id;
    }
    await task.save();

    return res.json({ success: true, task });
  } catch (error) {
    console.error('Error reviewing pool monitoring task:', error);
    return res.status(500).json({ error: 'Error reviewing pool monitoring task' });
  }
});

// ============================================
// GET TASKS BY STAFF (Staff can view their own)
// ============================================
router.get('/staff/:staffId', authenticate, async (req, res) => {
  try {
    const tasks = await TaskAssignment.find({ staffId: req.params.staffId })
      .populate('staffId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// ============================================
// UPDATE TASK STATUS
// ============================================
router.put('/:taskId', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedTask = await TaskAssignment.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // ============================================
    // KEEP ROOM ASSIGNMENT VISIBLE DURING TASK EXECUTION
    // ============================================
    // The staff member should remain linked to the room until the inspection
    // proof is submitted. Assignment cleanup therefore happens on the
    // inspection completion path rather than on task start/finish.

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Error updating task' });
  }
});

module.exports = router;
