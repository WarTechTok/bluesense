const Room = require('../models/Room');
const { uploadRoomImage: uploadToCloud, deleteFromCloudinary } = require('../utils/cloudinary');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const TaskAssignment = require('../models/TaskAssignment');
const Staff = require('../models/Staff');
const User = require('../models/User');

/**
 * Room Controller
 * Handles CRUD operations for room management
 * Endpoints: GET, POST, PUT, DELETE rooms
 */

/**
 * GET /api/admin/rooms
 * Get all rooms in the resort
 */
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('assignedStaff.staffId', 'name email staffId');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/rooms/:id
 * Get a specific room by ID
 */
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('assignedStaff.staffId', 'name email staffId');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/rooms
 * Create a new room (Admin only)
 * Body: { name, capacity, description, status }
 * Note: price removed — pricing handled at the package level
 */
exports.createRoom = async (req, res) => {
  try {
    // ── Destructure ALL fields the frontend sends ──────────────
    const { name, capacity, description, status, oasis, packageName, image, appliances } = req.body;

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Room Name is required' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Room Name must be at least 2 characters' });
    }

    if (capacity === undefined || capacity === null || capacity === '') {
      return res.status(400).json({ error: 'Capacity is required' });
    }
    const parsedCapacity = parseInt(capacity);
    if (isNaN(parsedCapacity)) {
      return res.status(400).json({ error: 'Capacity must be a valid number' });
    }
    if (parsedCapacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be greater than 0' });
    }

    // Normalize appliances — frontend sends a comma-separated string OR an array
    let appliancesArray = [];
    if (Array.isArray(appliances)) {
      appliancesArray = appliances.filter(a => a && a.trim() !== '');
    } else if (typeof appliances === 'string' && appliances.trim()) {
      appliancesArray = appliances.split(',').map(a => a.trim()).filter(a => a !== '');
    }

    const room = new Room({
      name: name.trim(),
      capacity: parsedCapacity,
      description: description || '',
      status: status || 'Available',
      oasis: oasis || 'Oasis 1',
      packageName: packageName || null,
      image: image || null,          // ← Cloudinary URL saved here
      appliances: appliancesArray,
    });
    await room.save();
    console.log(`✅ Room created: ${room.name} | image: ${room.image || 'none'}`);
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/rooms/:id
 * Update room details (Admin only)
 * Note: price removed — pricing handled at the package level
 */
exports.updateRoom = async (req, res) => {
  try {
    // ── Destructure ALL fields the frontend may send ───────────
    const { name, capacity, description, status, oasis, packageName, image, appliances } = req.body;

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (name !== undefined && name !== null) {
      if (name.trim() === '') {
        return res.status(400).json({ error: 'Room Name is required' });
      }
      if (name.trim().length < 2) {
        return res.status(400).json({ error: 'Room Name must be at least 2 characters' });
      }
    }

    if (capacity !== undefined && capacity !== null) {
      const parsedCapacity = parseInt(capacity);
      if (isNaN(parsedCapacity)) {
        return res.status(400).json({ error: 'Capacity must be a valid number' });
      }
      if (parsedCapacity <= 0) {
        return res.status(400).json({ error: 'Capacity must be greater than 0' });
      }
    }

    // Normalize appliances — frontend sends a comma-separated string OR an array
    let appliancesArray;
    if (appliances !== undefined) {
      if (Array.isArray(appliances)) {
        appliancesArray = appliances.filter(a => a && a.trim() !== '');
      } else if (typeof appliances === 'string') {
        appliancesArray = appliances.trim()
          ? appliances.split(',').map(a => a.trim()).filter(a => a !== '')
          : [];
      }
    }

    // Build update object — only include fields that were sent
    const updateData = { name, capacity, description, status, oasis, packageName, image };
    if (appliancesArray !== undefined) updateData.appliances = appliancesArray;

    // Remove fields that were not sent (undefined) so we don't wipe existing values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    console.log(`✅ Room updated: ${room.name} | image: ${room.image || 'none'}`);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/admin/rooms/:id
 * Delete a room (Admin only)
 */
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// STAFF ASSIGNMENT ENDPOINTS
// ============================================

/**
 * PUT /api/admin/rooms/:id/assign-staff
 * Assign a staff member to check/maintain a room (Admin only)
 * Body: { staffId, notes?, taskType?, dueDate? }
 * Returns: Updated room with assigned staff
 * Also creates: Notification for staff + Task assignment
 */
exports.assignStaffToRoom = async (req, res) => {
  try {
    const { staffId, notes, taskType = 'Inspection', dueDate } = req.body;
    
    // Validate inputs
    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }

    // Get staff details
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(400).json({ error: 'Staff member not found' });
    }

    // Get room
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Add staff to room
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          assignedStaff: {
            staffId,
            notes,
            assignedDate: new Date()
          }
        }
      },
      { new: true }
    ).populate('assignedStaff.staffId', 'name email position');

    // Create task assignment
    const taskDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: tomorrow
    const task = await TaskAssignment.create({
      staffId,
      roomId: req.params.id,
      title: `${taskType} for ${room.name}`,
      description: notes || `${taskType} task for room assignment`,
      taskType,
      status: 'Pending',
      dueDate: taskDueDate,
      assignedBy: req.user.id,
      priority: 'Medium'
    });

    // Create notification for staff
    const notification = await Notification.create({
      staffId,
      type: 'Task Assignment',
      title: 'New Task Assignment',
      message: `You have been assigned to ${taskType.toLowerCase()} room "${room.name}" (Capacity: ${room.capacity})`,
      relatedId: task._id,
      relatedType: 'Task',
      priority: 'High',
      data: {
        taskId: task._id,
        roomId: room._id,
        roomName: room.name,
        taskType
      }
    });

    res.json({
      message: 'Staff assigned successfully',
      room: updatedRoom,
      task,
      notification
    });
  } catch (error) {
    console.error('Error assigning staff to room:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/rooms/:id/remove-staff/:staffId
 * Remove a staff member from room assignment (Admin only)
 * Returns: Updated room with staff removed
 */
exports.removeStaffFromRoom = async (req, res) => {
  try {
    const { id, staffId } = req.params;

    // Convert staffId string to ObjectId for proper comparison
    const staffObjectId = new mongoose.Types.ObjectId(staffId);

    // Find room and remove staff from assignedStaff array
    const room = await Room.findByIdAndUpdate(
      id,
      {
        $pull: {
          assignedStaff: { staffId: staffObjectId }
        }
      },
      { new: true }
    ).populate('assignedStaff.staffId', 'name email');

    if (!room) return res.status(404).json({ error: 'Room not found' });
    
    res.json({
      message: 'Staff removed successfully',
      room
    });
  } catch (error) {
    console.error('Error removing staff from room:', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/admin/rooms/:id/staff
 * Get all staff assigned to a room
 * Returns: Array of assigned staff with details
 */
exports.getRoomStaff = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('assignedStaff.staffId');
    
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room.assignedStaff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/rooms/upload-image
 * Upload a room image (Admin only)
 * Body: FormData with 'image' file
 * Returns: {imagePath: "/uploads/room-images/filename.jpg"}
 */
exports.uploadRoomImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload buffer to Cloudinary (memoryStorage — no local disk write)
    const { url, publicId } = await uploadToCloud(req.file.buffer);

    res.json({
      success: true,
      imagePath: url,   // Cloudinary HTTPS URL — persists across redeploys
      publicId,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading room image:', error);
    res.status(500).json({ error: error.message });
  }
};