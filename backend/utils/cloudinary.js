// backend/utils/cloudinary.js
// ============================================
// CLOUDINARY UPLOAD UTILITY
// Replaces local disk storage for all image uploads
// Handles: package images, payment proofs, avatars, refund proofs
// ============================================

const cloudinary = require('cloudinary').v2;

// ============================================
// CLOUDINARY CONFIGURATION
// Uses env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// UPLOAD FOLDERS (organized by type)
// ============================================
const FOLDERS = {
  PACKAGE_IMAGES: 'bluesense/package-images',
  PAYMENT_PROOFS: 'bluesense/payment-proofs',
  REFUND_PROOFS:  'bluesense/refund-proofs',
  AVATARS:        'bluesense/avatars',
  ROOM_IMAGES:    'bluesense/room-images',
};

// ============================================
// UPLOAD FROM BUFFER (works with multer memoryStorage)
// Returns: { url, publicId }
// ============================================
const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          return reject(error);
        }
        console.log(`✅ Cloudinary upload success: ${result.secure_url}`);
        resolve({
          url:      result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

// ============================================
// DELETE FROM CLOUDINARY (for cleanup on re-upload)
// ============================================
const deleteFromCloudinary = async (publicIdOrUrl) => {
  try {
    // Accept either a publicId or a full Cloudinary URL
    let publicId = publicIdOrUrl;
    if (publicIdOrUrl && publicIdOrUrl.startsWith('http')) {
      // Extract publicId from URL
      // e.g. https://res.cloudinary.com/cloud/image/upload/v123/bluesense/avatars/abc.jpg
      // → bluesense/avatars/abc
      const parts = publicIdOrUrl.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex !== -1) {
        // Skip 'upload' and the version segment (v12345...)
        const afterUpload = parts.slice(uploadIndex + 2); // skip version
        publicId = afterUpload.join('/').replace(/\.[^/.]+$/, ''); // remove extension
      }
    }
    if (!publicId) return;
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Cloudinary delete: ${publicId} → ${result.result}`);
  } catch (err) {
    // Non-fatal — log but don't crash the request
    console.warn('⚠️  Cloudinary delete warning:', err.message);
  }
};

// ============================================
// SHORTCUT UPLOAD FUNCTIONS
// ============================================
const uploadPackageImage = (buffer) =>
  uploadToCloudinary(buffer, FOLDERS.PACKAGE_IMAGES, {
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  });

const uploadRoomImage = (buffer) =>
  uploadToCloudinary(buffer, FOLDERS.ROOM_IMAGES, {
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  });

const uploadPaymentProof = (buffer) =>
  uploadToCloudinary(buffer, FOLDERS.PAYMENT_PROOFS, {
    transformation: [{ width: 2000, height: 2000, crop: 'limit', quality: 'auto' }],
  });

const uploadRefundProof = (buffer) =>
  uploadToCloudinary(buffer, FOLDERS.REFUND_PROOFS, {
    transformation: [{ width: 2000, height: 2000, crop: 'limit', quality: 'auto' }],
  });

const uploadAvatar = (buffer, userId) =>
  uploadToCloudinary(buffer, FOLDERS.AVATARS, {
    public_id: `avatar-${userId}`, // overwrite same user's avatar automatically
    overwrite: true,
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
  });

module.exports = {
  uploadPackageImage,
  uploadRoomImage,
  uploadPaymentProof,
  uploadRefundProof,
  uploadAvatar,
  deleteFromCloudinary,
  FOLDERS,
};