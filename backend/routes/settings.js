// backend/routes/settings.js
// ============================================
// SETTINGS ROUTES
// Public:  GET  /api/settings/gallery-layout
// Admin:   PUT  /api/settings/gallery-layout
// ============================================

const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getGalleryLayout, updateGalleryLayout } = require('../controllers/settingsController');

// Public — anyone can fetch the active layout
router.get('/gallery-layout', getGalleryLayout);

// Admin only — change the layout
router.put('/gallery-layout', verifyToken, isAdmin, updateGalleryLayout);

module.exports = router;