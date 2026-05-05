// backend/middleware/upload.js
// ============================================
// MULTER UPLOAD MIDDLEWARE (Cloudinary-ready)
// Uses memoryStorage — NO files written to disk.
// Buffers are passed directly to Cloudinary.
// ============================================

const multer = require('multer');

// ============================================
// FILE FILTER — all common image formats
// ============================================
const imageFilter = (req, file, cb) => {
  // Allowed mime types (expanded)
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/svg+xml'
  ];
  
  // Allowed extensions
  const allowedExtensions = /jpeg|jpg|png|gif|webp|bmp|tiff|svg/i;
  
  const mimeOk = allowedMimeTypes.includes(file.mimetype);
  const extOk = allowedExtensions.test(file.originalname.split('.').pop());
  
  // Also check for common variations
  const lowerMime = file.mimetype.toLowerCase();
  const isImage = lowerMime.startsWith('image/');
  
  if ((mimeOk || extOk || isImage) && file.mimetype !== 'application/octet-stream') {
    cb(null, true);
  } else {
    console.log(`❌ File rejected: ${file.originalname} - MIME: ${file.mimetype}`);
    cb(new Error(`Only image files are allowed. You uploaded: ${file.originalname} (${file.mimetype})`), false);
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

// For payment proofs (named field) - increased to 10MB for better quality
const uploadPaymentProof = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB for payment proofs
  fileFilter: imageFilter,
}).single('paymentProof');

// For refund proofs (named field)
const uploadRefundProof = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB for refund proofs
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