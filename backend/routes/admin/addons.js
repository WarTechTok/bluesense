// backend/routes/admin/addons.js
// ============================================
// ADD-ON MANAGEMENT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const AddOn = require('../../models/AddOn');
const { verifyToken, isStaff } = require('../../middleware/auth');

// GET all add-ons (admin)
router.get('/', verifyToken, isStaff, async (req, res) => {
  try {
    const addons = await AddOn.find().sort({ displayOrder: 1 });
    res.json(addons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET active add-ons for frontend
// Optional query param: ?session=Day|Night|22hrs
//
// Filtering rules:
//   - availableForSessions includes 'All'  → always show
//   - availableForSessions includes the requested session → show
//   - no ?session param supplied            → return all active (backwards compat)
//
// Examples:
//   /api/admin/addons/active            → all active add-ons (no filter)
//   /api/admin/addons/active?session=Day     → Day + All add-ons only
//   /api/admin/addons/active?session=Night   → Night + All add-ons only
//   /api/admin/addons/active?session=22hrs   → 22hrs + All add-ons only
router.get('/active', async (req, res) => {
  try {
    const { session } = req.query;

    // Fetch all active add-ons first
    const allActive = await AddOn.find({ isActive: true }).sort({ displayOrder: 1 });

    // If no session filter requested, return everything (backwards compat)
    if (!session) {
      return res.json(allActive);
    }

    // Validate the session value
    const validSessions = ['Day', 'Night', '22hrs'];
    if (!validSessions.includes(session)) {
      return res.status(400).json({
        error: `Invalid session. Must be one of: ${validSessions.join(', ')}`
      });
    }

    // Filter: keep add-ons that are for 'All' OR specifically for the requested session
    const filtered = allActive.filter((addon) => {
      const sessions = addon.availableForSessions || [];

      // Show if assigned to All sessions
      if (sessions.includes('All')) return true;

      // Show if assigned specifically to this session
      if (sessions.includes(session)) return true;

      // Hide everything else
      return false;
    });

    res.json(filtered);
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