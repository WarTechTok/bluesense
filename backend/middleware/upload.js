// backend/middleware/upload.js
// ============================================
// MULTER UPLOAD MIDDLEWARE (Cloudinary-ready)
// Uses memoryStorage — NO files written to disk.
// ============================================

const multer = require('multer');

const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png',
    'image/gif', 'image/webp', 'image/bmp',
    'image/tiff', 'image/svg+xml'
  ];
  const allowedExtensions = /jpeg|jpg|png|gif|webp|bmp|tiff|svg/i;
  const mimeOk = allowedMimeTypes.includes(file.mimetype);
  const extOk  = allowedExtensions.test(file.originalname.split('.').pop());
  const isImage = file.mimetype.toLowerCase().startsWith('image/');

  if ((mimeOk || extOk || isImage) && file.mimetype !== 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed. Got: ${file.originalname} (${file.mimetype})`), false);
  }
};

const memoryStorage = multer.memoryStorage();

// Single image helpers
const uploadSingle = (fieldName = 'image') =>
  multer({ storage: memoryStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter }).single(fieldName);

const uploadPaymentProof = multer({
  storage: memoryStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFilter,
}).single('paymentProof');

const uploadRefundProof = multer({
  storage: memoryStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFilter,
}).single('proof');

const uploadAvatar = multer({
  storage: memoryStorage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: imageFilter,
}).single('avatar');

// Single package image (kept for backward compat)
const uploadPackageImage = multer({
  storage: memoryStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter,
}).single('image');

// ============================================
// MULTI-IMAGE: up to 10 package images at once
// Field name: "images"  (FormData.append('images', file) × N)
// ============================================
const uploadPackageImages = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5 MB per file
    files: 10,                    // max 10 files per request
  },
  fileFilter: imageFilter,
}).array('images', 10);

module.exports = {
  uploadSingle,
  uploadPaymentProof,
  uploadRefundProof,
  uploadAvatar,
  uploadPackageImage,
  uploadPackageImages,   // ← new
};