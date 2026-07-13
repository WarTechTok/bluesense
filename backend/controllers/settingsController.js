// backend/controllers/settingsController.js
// ============================================
// SETTINGS CONTROLLER — gallery layout (extendable)
// ============================================

const Settings = require('../models/Settings');

const VALID_LAYOUTS = ['grid', 'masonry', 'horizontal', 'vertical', 'slideshow'];
const GALLERY_LAYOUT_KEY = 'galleryLayout';
const DEFAULT_LAYOUT = 'grid';

// ============================================
// GET GALLERY LAYOUT
// GET /api/settings/gallery-layout
// Public — no auth required
// ============================================
const getGalleryLayout = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: GALLERY_LAYOUT_KEY });
    const layout = setting?.value ?? DEFAULT_LAYOUT;
    res.json({ success: true, layout });
  } catch (error) {
    console.error('❌ Settings getGalleryLayout error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UPDATE GALLERY LAYOUT
// PUT /api/settings/gallery-layout
// Admin only
// Body: { layout: 'grid' | 'masonry' | 'horizontal' | 'vertical' | 'slideshow' }
// ============================================
const updateGalleryLayout = async (req, res) => {
  try {
    const { layout } = req.body;

    if (!layout || !VALID_LAYOUTS.includes(layout)) {
      return res.status(400).json({
        success: false,
        message: `Invalid layout. Must be one of: ${VALID_LAYOUTS.join(', ')}`,
      });
    }

    // Upsert — creates the doc on first save, updates thereafter
    const setting = await Settings.findOneAndUpdate(
      { key: GALLERY_LAYOUT_KEY },
      { value: layout },
      { upsert: true, new: true, runValidators: true }
    );

    console.log(`✅ Gallery layout updated to: ${layout}`);
    res.json({ success: true, layout: setting.value });
  } catch (error) {
    console.error('❌ Settings updateGalleryLayout error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGalleryLayout, updateGalleryLayout };