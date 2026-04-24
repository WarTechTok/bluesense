// backend/routes/admin/packages.js
// ============================================
// PACKAGE MANAGEMENT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const Package = require('../../models/Package');
const { verifyToken, isStaff } = require('../../middleware/auth');

// GET all packages
router.get('/', verifyToken, isStaff, async (req, res) => {
  try {
    const packages = await Package.find().sort({ oasis: 1, displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET packages by oasis
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
    const package = await Package.findById(req.params.id);
    if (!package) return res.status(404).json({ error: 'Package not found' });
    res.json(package);
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