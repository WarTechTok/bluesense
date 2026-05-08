// backend/routes/admin/packages.js
// ============================================
// PACKAGE MANAGEMENT ROUTES — multi-image gallery
// ============================================

const express = require('express');
const router  = express.Router();
const Package = require('../../models/Package');
const { verifyToken, isStaff } = require('../../middleware/auth');
const { uploadPackageImage, uploadPackageImages } = require('../../middleware/upload');
const {
  uploadPackageImage: uploadToCloud,
  deleteFromCloudinary,
} = require('../../utils/cloudinary');

// ============================================
// HELPER: Check if pricing is PAX-based (Package C style)
// ============================================
const isPaxBasedPricing = (pricing) => {
  if (!pricing || typeof pricing !== 'object') return false;
  // Check if keys are like "50pax", "100pax", etc.
  const keys = Object.keys(pricing);
  return keys.some(key => key.includes('pax'));
};

// ============================================
// HELPER: Normalize pricing (convert single number to weekday/weekend)
// SKIPS normalization for PAX-based pricing (Package C)
// ============================================
const normalizePricing = (pricing, skipNormalize = false) => {
  if (skipNormalize) return pricing;
  if (!pricing || typeof pricing !== 'object') return pricing;
  
  // If it's PAX-based pricing (Package C), don't normalize
  if (isPaxBasedPricing(pricing)) {
    return pricing;
  }
  
  const normalized = {};
  for (const [key, val] of Object.entries(pricing)) {
    if (typeof val === 'number') {
      // New format: single number → convert to old format
      normalized[key] = { weekday: val, weekend: val };
    } else if (typeof val === 'object' && val !== null) {
      // Old format: keep as is
      normalized[key] = val;
    } else {
      normalized[key] = val;
    }
  }
  return normalized;
};

// ============================================
// PUBLIC
// ============================================

router.get('/public', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ oasis: 1, displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/public/oasis/:oasis', async (req, res) => {
  try {
    const packages = await Package.find({ oasis: req.params.oasis, isActive: true }).sort({ displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SINGLE IMAGE UPLOAD (backward compat)
// POST /api/admin/packages/upload-image
// ============================================
router.post('/upload-image', verifyToken, isStaff, uploadPackageImage, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const { url, publicId } = await uploadToCloud(req.file.buffer);
    res.json({ imageUrl: url, publicId });
  } catch (error) {
    console.error('❌ Package image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MULTI-IMAGE UPLOAD
// POST /api/admin/packages/upload-images
// Body: FormData with field "images" (1–10 files)
// Returns: { imageUrls: [...] }
// ============================================
router.post('/upload-images', verifyToken, isStaff, uploadPackageImages, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    // Upload all files to Cloudinary in parallel
    const uploadPromises = req.files.map((file) => uploadToCloud(file.buffer));
    const results = await Promise.all(uploadPromises);

    const imageUrls = results.map((r) => r.url);
    console.log(`✅ Uploaded ${imageUrls.length} package images`);

    res.json({ imageUrls });
  } catch (error) {
    console.error('❌ Multi-image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN CRUD
// ============================================

router.get('/', verifyToken, isStaff, async (req, res) => {
  try {
    const packages = await Package.find().sort({ oasis: 1, displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/oasis/:oasis', verifyToken, isStaff, async (req, res) => {
  try {
    const packages = await Package.find({ oasis: req.params.oasis, isActive: true }).sort({ displayOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE
router.post('/', verifyToken, isStaff, async (req, res) => {
  try {
    const body = { ...req.body };

    // Sync: if images array is provided but image field is not, use first image as primary
    if (body.images?.length > 0 && !body.image) {
      body.image = body.images[0];
    }
    // Sync: if image provided but images array empty, seed the array
    if (body.image && (!body.images || body.images.length === 0)) {
      body.images = [body.image];
    }

    // NORMALIZE PRICING: skip for PAX-based pricing (Package C)
    const skipNormalize = isPaxBasedPricing(body.pricing);
    if (body.pricing) {
      body.pricing = normalizePricing(body.pricing, skipNormalize);
    }
    if (body.pricePerPax) {
      body.pricePerPax = normalizePricing(body.pricePerPax, true);
    }

    // Mark isPaxBased flag for Package C
    if (body.name === 'Package C' || isPaxBasedPricing(body.pricing)) {
      body.isPaxBased = true;
    }

    const newPackage = new Package(body);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    console.error("Create error:", error);
    res.status(400).json({ error: error.message });
  }
});

// UPDATE
router.put('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const existing = await Package.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Package not found' });

    const body = { ...req.body };

    // Keep images[] and image in sync
    if (body.images?.length > 0) {
      body.image = body.images[0];
    } else if (body.image && (!body.images || body.images.length === 0)) {
      body.images = [body.image];
    }

    // NORMALIZE PRICING: skip for PAX-based pricing (Package C)
    const skipNormalize = isPaxBasedPricing(body.pricing) || existing.name === 'Package C';
    if (body.pricing) {
      body.pricing = normalizePricing(body.pricing, skipNormalize);
    }
    if (body.pricePerPax) {
      body.pricePerPax = normalizePricing(body.pricePerPax, true);
    }

    // Mark isPaxBased flag for Package C
    if (body.name === 'Package C' || (body.pricing && isPaxBasedPricing(body.pricing))) {
      body.isPaxBased = true;
    }

    // Delete old Cloudinary images that were removed
    if (body.images) {
      const oldImages = existing.images || (existing.image ? [existing.image] : []);
      const removedImages = oldImages.filter(
        (url) => url && url.includes('cloudinary.com') && !body.images.includes(url)
      );
      await Promise.all(removedImages.map((url) => deleteFromCloudinary(url)));
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    res.json(updatedPackage);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// DELETE SINGLE IMAGE FROM GALLERY
// DELETE /api/admin/packages/:id/image
// Body: { imageUrl: "https://res.cloudinary.com/..." }
// ============================================
router.delete('/:id/image', verifyToken, isStaff, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    // Remove from images array
    const newImages = (pkg.images || []).filter((url) => url !== imageUrl);

    // Update primary image
    const newPrimary = newImages[0] || '';

    await Package.findByIdAndUpdate(req.params.id, {
      images: newImages,
      image: newPrimary,
    });

    // Delete from Cloudinary (non-fatal)
    if (imageUrl.includes('cloudinary.com')) {
      await deleteFromCloudinary(imageUrl);
    }

    res.json({ message: 'Image removed', images: newImages, image: newPrimary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE PACKAGE (also remove all images from Cloudinary)
router.delete('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const allImages = pkg.images?.length > 0
      ? pkg.images
      : pkg.image ? [pkg.image] : [];

    await Promise.all(
      allImages
        .filter((url) => url && url.includes('cloudinary.com'))
        .map((url) => deleteFromCloudinary(url))
    );

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;