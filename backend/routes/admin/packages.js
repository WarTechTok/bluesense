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
// HELPER: Detect whether a pricing object is PAX-based
// A key is "pax-based" when it matches /^\d+pax$/i  (e.g. "50pax", "100pax", "30pax")
// This is intentionally dynamic — the pax values come from minCapacity / maxCapacity
// and are never hardcoded here.
// ============================================
const isPaxKey = (key) => /^\d+pax$/i.test(key);

const isPaxBasedPricing = (pricing) => {
  if (!pricing || typeof pricing !== 'object') return false;
  return Object.keys(pricing).some(isPaxKey);
};

// ============================================
// HELPER: Normalize pricing for storage
//
// There are three valid shapes that can arrive from the frontend:
//
//  1. Regular session pricing (new simplified format):
//       { "Day": 9000, "Night": 10000, "22hrs": 16500 }
//     → stored as-is
//
//  2. Regular session pricing (legacy weekday/weekend format):
//       { "Day": { weekday: 9000, weekend: 10000 }, ... }
//     → stored as-is for backward compat
//
//  3. PAX-based pricing (Package C — any min/max pax combination):
//       { "50pax": { "Day": 19000, "Night": 20000, "22hrs": 26000 },
//         "100pax": { "Day": 20000, ... } }
//     → stored AS-IS; never flattened to weekday/weekend
//
// Root cause of the original bug: the old normalizePricing treated
// every top-level value as a session price and tried to wrap it in
// { weekday, weekend }.  When the value was itself an object (the per-session
// sub-map under "50pax"), that produced { weekday: 0, weekend: 0 }.
// Fix: detect pax keys first and short-circuit immediately.
// ============================================
const normalizePricing = (pricing) => {
  if (!pricing || typeof pricing !== 'object') return pricing;

  // If ANY top-level key is a pax key the entire object is PAX-based —
  // preserve it completely without touching any values.
  if (isPaxBasedPricing(pricing)) {
    console.log('✅ normalizePricing: PAX-based pricing detected — storing as-is');
    return pricing;
  }

  // Regular session pricing: pass through unchanged.
  // Both { "Day": 9000 } (flat number) and { "Day": { weekday: 9000, weekend: 9500 } }
  // are valid and accepted by the schema.
  console.log('✅ normalizePricing: session-based pricing — storing as-is');
  return pricing;
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

// ============================================
// CREATE
// ============================================
router.post('/', verifyToken, isStaff, async (req, res) => {
  try {
    const body = { ...req.body };

    // Sync image fields
    if (body.images?.length > 0 && !body.image) {
      body.image = body.images[0];
    }
    if (body.image && (!body.images || body.images.length === 0)) {
      body.images = [body.image];
    }

    // Normalize pricing (preserves pax-based structure intact)
    if (body.pricing) {
      body.pricing = normalizePricing(body.pricing);
    }

    // isPaxBased is derived dynamically from pricing keys — never from the package name.
    // This means it works for any minCapacity/maxCapacity pair ("30pax", "80pax", etc.)
    body.isPaxBased = isPaxBasedPricing(body.pricing);

    console.log('📦 CREATE package:', body.name, '| isPaxBased:', body.isPaxBased);
    if (body.isPaxBased) {
      console.log('   pax tiers:', Object.keys(body.pricing || {}));
    }

    const newPackage = new Package(body);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    console.error('❌ Create error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// UPDATE
// ============================================
router.put('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const existing = await Package.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Package not found' });

    const body = { ...req.body };

    // Sync image fields
    if (body.images?.length > 0) {
      body.image = body.images[0];
    } else if (body.image && (!body.images || body.images.length === 0)) {
      body.images = [body.image];
    }

    // Normalize pricing (preserves pax-based structure intact)
    if (body.pricing) {
      body.pricing = normalizePricing(body.pricing);
    }

    // Derive isPaxBased from the incoming pricing.
    // If no pricing is in the request body, fall back to the existing flag.
    if (body.pricing !== undefined) {
      body.isPaxBased = isPaxBasedPricing(body.pricing);
    } else {
      body.isPaxBased = existing.isPaxBased ?? false;
    }

    console.log('📦 UPDATE package:', existing.name, '| isPaxBased:', body.isPaxBased);
    if (body.isPaxBased) {
      console.log('   pax tiers:', Object.keys(body.pricing || {}));
    }

    // Delete Cloudinary images that were removed from the gallery
    if (body.images) {
      const oldImages = existing.images || (existing.image ? [existing.image] : []);
      const removedImages = oldImages.filter(
        (url) => url && url.includes('cloudinary.com') && !body.images.includes(url)
      );
      await Promise.all(removedImages.map((url) => deleteFromCloudinary(url)));
    }

    // IMPORTANT: use runValidators:false so Mongoose does not re-cast the pricing
    // Map through the strict { weekday, weekend } sub-schema validator.
    // That validator is what originally coerced "50pax": { Day: 19000 } into
    // { weekday: 0, weekend: 0 } — bypassing it here is safe because
    // normalizePricing() has already validated the shape above.
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true, runValidators: false }
    );
    res.json(updatedPackage);
  } catch (error) {
    console.error('❌ Update error:', error);
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

    const newImages = (pkg.images || []).filter((url) => url !== imageUrl);
    const newPrimary = newImages[0] || '';

    await Package.findByIdAndUpdate(req.params.id, {
      images: newImages,
      image: newPrimary,
    });

    if (imageUrl.includes('cloudinary.com')) {
      await deleteFromCloudinary(imageUrl);
    }

    res.json({ message: 'Image removed', images: newImages, image: newPrimary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DELETE PACKAGE (also removes all Cloudinary images)
// ============================================
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