// backend/routes/admin/sessions.js
// ============================================
// SESSION MANAGEMENT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const Session = require('../../models/Session');
const { verifyToken, isStaff } = require('../../middleware/auth');

// GET all sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single session
router.get('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE session
router.post('/', verifyToken, isStaff, async (req, res) => {
  try {
    const newSession = new Session(req.body);
    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE session
router.put('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSession) return res.status(404).json({ error: 'Session not found' });
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE session
router.delete('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const deletedSession = await Session.findByIdAndDelete(req.params.id);
    if (!deletedSession) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;