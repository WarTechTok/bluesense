// ============================================
// ROOMS MANAGEMENT ROUTES
// ============================================
// All room/pool management endpoints
// READ operations for authenticated users
// CREATE/UPDATE/DELETE operations for Admin only

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const roomController = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// MULTER CONFIGURATION - Image Upload
// ============================================
const uploadDir = path.join(__dirname, '../uploads/room-images');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'room-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ============================================
// GET ALL ROOMS - retrieve all available rooms/pools
// ============================================
router.get('/', authenticate, roomController.getAllRooms);

// ============================================
// GET ROOM BY ID - retrieve specific room details
// ============================================
router.get('/:id', authenticate, roomController.getRoomById);

// ============================================
// CREATE ROOM - add new room/pool (Admin only)
// ============================================
router.post('/', authenticate, authorize('admin'), roomController.createRoom);

// ============================================
// UPDATE ROOM - modify room/pool details (Admin only)
// ============================================
router.put('/:id', authenticate, authorize('admin'), roomController.updateRoom);

// ============================================
// STAFF ASSIGNMENT ROUTES (Admin only)
// ============================================

// ============================================
// ASSIGN STAFF TO ROOM - add staff member to check room
// ============================================
router.put('/:id/assign-staff', authenticate, authorize('admin'), roomController.assignStaffToRoom);

// ============================================
// REMOVE STAFF FROM ROOM - unassign staff from room
// ============================================
router.delete('/:id/remove-staff/:staffId', authenticate, authorize('admin'), roomController.removeStaffFromRoom);

// ============================================
// GET ROOM STAFF - retrieve all assigned staff for a room
// ============================================
router.get('/:id/staff', authenticate, roomController.getRoomStaff);

// ============================================
// DELETE ROOM - remove room/pool from system (Admin only)
// ============================================
router.delete('/:id', authenticate, authorize('admin'), roomController.deleteRoom);

// ============================================
// UPLOAD ROOM IMAGE - upload image for room/pool (Admin only)
// ============================================
router.post('/upload-image', authenticate, authorize('admin'), upload.single('image'), roomController.uploadRoomImage);

module.exports = router;
