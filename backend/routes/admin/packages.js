// backend/routes/admin/packages.js
// ============================================
// PACKAGE MANAGEMENT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Package = require('../../models/Package');
const { verifyToken, isStaff } = require('../../middleware/auth');

// ============================================
// IMAGE UPLOAD CONFIGURATION
// ============================================

const packageImageDir = path.join(__dirname, '../../../uploads/package-images');
if (!fs.existsSync(packageImageDir)) {
  fs.mkdirSync(packageImageDir, { recursive: true });
  console.log('✅ Created uploads/package-images folder');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, packageImageDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(new Error('Only images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// GET active packages for customers (public)
router.get('/public', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ oasis: 1, displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET packages by oasis (public)
router.get('/public/oasis/:oasis', async (req, res) => {
  try {
    const { oasis } = req.params;
    const packages = await Package.find({ oasis, isActive: true }).sort({ displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// IMAGE UPLOAD ROUTE
// ============================================

// POST upload package image (admin only)
router.post('/upload-image', verifyToken, isStaff, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imageUrl = `/uploads/package-images/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN ROUTES - Authentication required
// ============================================

// GET all packages (admin only)
router.get('/', verifyToken, isStaff, async (req, res) => {
  try {
    const packages = await Package.find().sort({ oasis: 1, displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET packages by oasis (admin only)
router.get('/oasis/:oasis', verifyToken, isStaff, async (req, res) => {
  try {
    const { oasis } = req.params;
    const packages = await Package.find({ oasis, isActive: true }).sort({ displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single package
router.get('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE package
router.post('/', verifyToken, isStaff, async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE package
router.put('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPackage) return res.status(404).json({ error: 'Package not found' });
    res.json(updatedPackage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE package
router.delete('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const deletedPackage = await Package.findByIdAndDelete(req.params.id);
    if (!deletedPackage) return res.status(404).json({ error: 'Package not found' });
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;