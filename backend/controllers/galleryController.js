// backend/controllers/galleryController.js
// ============================================
// GALLERY CONTROLLER - Cloudinary upload, CRUD, reorder
// ============================================

const Gallery = require('../models/Gallery');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const GALLERY_FOLDER = 'bluesense/gallery-images';

// ============================================
// GET ALL IMAGES (public)
// GET /api/gallery
// ============================================
const getAllImages = async (req, res) => {
  try {
    const images = await Gallery.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, images });
  } catch (error) {
    console.error('❌ Gallery fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL IMAGES ADMIN (includes inactive)
// GET /api/gallery/admin
// ============================================
const getAllImagesAdmin = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, images });
  } catch (error) {
    console.error('❌ Gallery admin fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UPLOAD IMAGE
// POST /api/gallery
// Body: multipart/form-data — image file + title + description
// ============================================
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, GALLERY_FOLDER, {
      transformation: [{ width: 1600, height: 1200, crop: 'limit', quality: 'auto:good' }],
    });

    // Get current highest order
    const lastImage = await Gallery.findOne().sort({ order: -1 });
    const nextOrder = lastImage ? lastImage.order + 1 : 0;

    const image = await Gallery.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      imageUrl: result.url,
      publicId: result.publicId,
      order: nextOrder,
      uploadedBy: req.user?.id,
    });

    console.log(`✅ Gallery image uploaded: ${image.title}`);
    res.status(201).json({ success: true, image });
  } catch (error) {
    console.error('❌ Gallery upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UPDATE TITLE / DESCRIPTION / ACTIVE STATUS
// PUT /api/gallery/:id
// ============================================
const updateImage = async (req, res) => {
  try {
    const { title, description, isActive } = req.body;
    const update = {};

    if (title !== undefined) update.title = title.trim();
    if (description !== undefined) update.description = description.trim();
    if (isActive !== undefined) update.isActive = isActive;

    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    res.json({ success: true, image });
  } catch (error) {
    console.error('❌ Gallery update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// REORDER — batch update order values
// PUT /api/gallery/reorder
// Body: { orderedIds: ['id1', 'id2', 'id3', ...] }
// ============================================
const reorderImages = async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ success: false, message: 'orderedIds array is required.' });
    }

    // Bulk write — assign each id its array index as order
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));

    await Gallery.bulkWrite(bulkOps);

    const images = await Gallery.find().sort({ order: 1 });
    res.json({ success: true, images });
  } catch (error) {
    console.error('❌ Gallery reorder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DELETE IMAGE
// DELETE /api/gallery/:id
// ============================================
const deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    // Delete from Cloudinary first
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    await Gallery.findByIdAndDelete(req.params.id);

    console.log(`🗑️  Gallery image deleted: ${image.title}`);
    res.json({ success: true, message: 'Image deleted successfully.' });
  } catch (error) {
    console.error('❌ Gallery delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllImages,
  getAllImagesAdmin,
  uploadImage,
  updateImage,
  reorderImages,
  deleteImage,
};