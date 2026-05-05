// backend/middleware/upload.js
// ============================================
// MULTER UPLOAD MIDDLEWARE (Cloudinary-ready)
// Uses memoryStorage — NO files written to disk.
// Buffers are passed directly to Cloudinary.
// ============================================

const multer = require('multer');

// ============================================
// FILE FILTER — images only
// ============================================
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = /jpeg|jpg|png|gif|webp/;
  const mimeOk = allowedMimeTypes.test(file.mimetype);
  const extOk  = allowedMimeTypes.test(file.originalname.split('.').pop().toLowerCase());

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// ============================================
// MEMORY STORAGE — no disk writes
// ============================================
const memoryStorage = multer.memoryStorage();

// ============================================
// EXPORT CONFIGURED MULTER INSTANCES
// ============================================

// General-purpose: single image, 5 MB limit
const uploadSingle = (fieldName = 'image') =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: imageFilter,
  }).single(fieldName);

// For payment proofs (named field)
const uploadPaymentProof = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('paymentProof');

// For refund proofs (named field)
const uploadRefundProof = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('proof');

// For avatar uploads (named field)
const uploadAvatar = multer({
  storage: memoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB for avatars
  fileFilter: imageFilter,
}).single('avatar');

// For package images (named field)
const uploadPackageImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('image');

module.exports = {
  uploadSingle,
  uploadPaymentProof,
  uploadRefundProof,
  uploadAvatar,
  uploadPackageImage,
};