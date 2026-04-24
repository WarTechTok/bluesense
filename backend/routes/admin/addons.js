// backend/routes/admin/addons.js
// ============================================
// ADD-ON MANAGEMENT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const AddOn = require('../../models/AddOn');
const { verifyToken, isStaff } = require('../../middleware/auth');

// GET all add-ons
router.get('/', verifyToken, isStaff, async (req, res) => {
  try {
    const addons = await AddOn.find().sort({ displayOrder: 1 });
    res.json(addons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET active add-ons for frontend
router.get('/active', async (req, res) => {
  try {
    const addons = await AddOn.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(addons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE add-on
router.post('/', verifyToken, isStaff, async (req, res) => {
  try {
    const newAddOn = new AddOn(req.body);
    await newAddOn.save();
    res.status(201).json(newAddOn);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE add-on
router.put('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const updatedAddOn = await AddOn.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAddOn) return res.status(404).json({ error: 'Add-on not found' });
    res.json(updatedAddOn);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE add-on
router.delete('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const deletedAddOn = await AddOn.findByIdAndDelete(req.params.id);
    if (!deletedAddOn) return res.status(404).json({ error: 'Add-on not found' });
    res.json({ message: 'Add-on deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;