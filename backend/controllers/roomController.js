const Room = require('../models/Room');

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
    const rooms = await Room.find();
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
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/rooms
 * Create a new room (Admin only)
 * Body: { name, capacity, price, description, status }
 */
exports.createRoom = async (req, res) => {
  try {
    const { name, capacity, price, description, status } = req.body;
    const room = new Room({ name, capacity, price, description, status });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/rooms/:id
 * Update room details (Admin only)
 */
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ error: 'Room not found' });
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
 * Body: { staffId, notes? }
 * Returns: Updated room with assigned staff
 */
exports.assignStaffToRoom = async (req, res) => {
  try {
    const { staffId, notes } = req.body;
    
    // Validate inputs
    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }

    // Find room and add staff to assignedStaff array
    const room = await Room.findByIdAndUpdate(
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
    ).populate('assignedStaff.staffId', 'name email');

    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
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

    // Find room and remove staff from assignedStaff array
    const room = await Room.findByIdAndUpdate(
      id,
      {
        $pull: {
          assignedStaff: { staffId }
        }
      },
      { new: true }
    ).populate('assignedStaff.staffId', 'name email');

    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
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
