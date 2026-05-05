// backend/routes/admin/packages.js
// ============================================
// PACKAGE MANAGEMENT ROUTES (Cloudinary version)
// ============================================

const express = require('express');
const router  = express.Router();
const Package = require('../../models/Package');
const { verifyToken, isStaff } = require('../../middleware/auth');
const { uploadPackageImage } = require('../../middleware/upload');
const { uploadPackageImage: uploadToCloud, deleteFromCloudinary } = require('../../utils/cloudinary');

// ============================================
// PUBLIC ROUTES — no authentication required
// ============================================

// GET active packages for customers
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
    const packages = await Package.find({ oasis: req.params.oasis, isActive: true }).sort({ displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// IMAGE UPLOAD ROUTE — Cloudinary
// ============================================

// POST /api/admin/packages/upload-image
router.post('/upload-image', verifyToken, isStaff, uploadPackageImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { url, publicId } = await uploadToCloud(req.file.buffer);

    res.json({ imageUrl: url, publicId });
  } catch (error) {
    console.error('❌ Package image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN ROUTES — authentication required
// ============================================

// GET all packages
router.get('/', verifyToken, isStaff, async (req, res) => {
  try {
    const packages = await Package.find().sort({ oasis: 1, displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET packages by oasis (admin)
router.get('/oasis/:oasis', verifyToken, isStaff, async (req, res) => {
  try {
    const packages = await Package.find({ oasis: req.params.oasis, isActive: true }).sort({ displayOrder: 1 });
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

// UPDATE package — if a new image is uploaded, delete the old Cloudinary image
router.put('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const existing = await Package.findById(req.params.id);

    // If image URL is being replaced and the old one was on Cloudinary, delete it
    if (
      existing &&
      req.body.image &&
      existing.image &&
      existing.image !== req.body.image &&
      existing.image.includes('cloudinary.com')
    ) {
      await deleteFromCloudinary(existing.image);
    }

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

// DELETE package — also remove image from Cloudinary
router.delete('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    if (pkg.image && pkg.image.includes('cloudinary.com')) {
      await deleteFromCloudinary(pkg.image);
    }

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;