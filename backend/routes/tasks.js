// backend/routes/tasks.js
// ============================================
// TASKS ROUTES - Handle task assignments
// ============================================

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../middleware/role');
const TaskAssignment = require('../models/TaskAssignment');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const { sendEmail } = require('../services/emailService');

// ============================================
// CREATE TASK ASSIGNMENT (Admin only)
// ============================================
router.post('/assign', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { staffId, title, description, priority, status, taskType, roomId, dueDate } = req.body;

    if (!staffId || !title) {
      return res.status(400).json({ error: 'Staff ID and title are required' });
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
      roomId: roomId || staffId, // Use provided roomId or fallback to staffId
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
    // AUTO-REMOVE STAFF FROM ROOM WHEN TASK ACCEPTED
    // ============================================
    // When staff accepts task (status changes to 'In Progress'), 
    // automatically remove them from room's assignedStaff list
    if (status === 'In Progress' && updatedTask.roomId) {
      try {
        const staffObjectId = new mongoose.Types.ObjectId(updatedTask.staffId);
        
        await Room.findByIdAndUpdate(
          updatedTask.roomId,
          {
            $pull: {
              assignedStaff: { staffId: staffObjectId }
            }
          },
          { new: true }
        );

        console.log(`✅ Staff automatically removed from room assignment after accepting task`);
      } catch (error) {
        console.error('⚠️ Error removing staff from room after task acceptance:', error);
        // Don't fail the entire operation if this fails
      }
    }

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
