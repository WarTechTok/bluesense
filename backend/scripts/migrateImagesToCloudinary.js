// backend/scripts/migrateImagesToCloudinary.js
// ============================================
// ONE-TIME MIGRATION SCRIPT
// Uploads all existing local images to Cloudinary
// and updates MongoDB records with new Cloudinary URLs.
//
// Run: node scripts/migrateImagesToCloudinary.js
// ============================================

require('dotenv').config();
const fs       = require('fs');
const path     = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Package = require('../models/Package');
const Booking = require('../models/Booking');
const User    = require('../models/User');

// ============================================
// HELPER: Upload a local file to Cloudinary
// ============================================
const uploadFile = (localPath, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      localPath,
      { folder, resource_type: 'image', ...options },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
  });
};

// ============================================
// MIGRATE PACKAGE IMAGES
// Packages with an image path like /uploads/package-images/xxx.jpg
// ============================================
async function migratePackageImages() {
  console.log('\n📦 Migrating package images...');
  const packages = await Package.find({ image: { $regex: '^/uploads/', $options: 'i' } });
  console.log(`   Found ${packages.length} packages with local image paths.`);

  for (const pkg of packages) {
    const localFile = path.join(__dirname, '..', pkg.image);
    if (!fs.existsSync(localFile)) {
      console.warn(`   ⚠️  File not found, skipping: ${localFile}`);
      continue;
    }

    try {
      const url = await uploadFile(localFile, 'bluesense/package-images');
      await Package.findByIdAndUpdate(pkg._id, { image: url });
      console.log(`   ✅ ${pkg.name}: ${url}`);
    } catch (err) {
      console.error(`   ❌ ${pkg.name}: ${err.message}`);
    }
  }
}

// ============================================
// MIGRATE PAYMENT PROOFS
// ============================================
async function migratePaymentProofs() {
  console.log('\n💳 Migrating payment proofs...');
  const bookings = await Booking.find({ paymentProof: { $regex: '^/uploads/', $options: 'i' } });
  console.log(`   Found ${bookings.length} bookings with local payment proofs.`);

  for (const booking of bookings) {
    const localFile = path.join(__dirname, '..', booking.paymentProof);
    if (!fs.existsSync(localFile)) {
      console.warn(`   ⚠️  File not found (already wiped from Render?), clearing DB reference: ${booking.paymentProof}`);
      await Booking.findByIdAndUpdate(booking._id, { paymentProof: null });
      continue;
    }

    try {
      const url = await uploadFile(localFile, 'bluesense/payment-proofs');
      await Booking.findByIdAndUpdate(booking._id, { paymentProof: url });
      console.log(`   ✅ Booking ${booking.bookingNumber || booking._id}: ${url}`);
    } catch (err) {
      console.error(`   ❌ Booking ${booking._id}: ${err.message}`);
    }
  }
}

// ============================================
// MIGRATE REFUND PROOFS
// ============================================
async function migrateRefundProofs() {
  console.log('\n🔄 Migrating refund proofs...');
  const bookings = await Booking.find({ refundProof: { $regex: '^/uploads/', $options: 'i' } });
  console.log(`   Found ${bookings.length} bookings with local refund proofs.`);

  for (const booking of bookings) {
    const localFile = path.join(__dirname, '..', booking.refundProof);
    if (!fs.existsSync(localFile)) {
      console.warn(`   ⚠️  File not found, clearing DB reference: ${booking.refundProof}`);
      await Booking.findByIdAndUpdate(booking._id, { refundProof: null });
      continue;
    }

    try {
      const url = await uploadFile(localFile, 'bluesense/refund-proofs');
      await Booking.findByIdAndUpdate(booking._id, { refundProof: url });
      console.log(`   ✅ Booking ${booking._id}: ${url}`);
    } catch (err) {
      console.error(`   ❌ Booking ${booking._id}: ${err.message}`);
    }
  }
}

// ============================================
// MIGRATE AVATARS
// ============================================
async function migrateAvatars() {
  console.log('\n👤 Migrating user avatars...');
  const users = await User.find({ avatar: { $regex: '^/uploads/', $options: 'i' } });
  console.log(`   Found ${users.length} users with local avatar paths.`);

  for (const user of users) {
    const localFile = path.join(__dirname, '..', user.avatar);
    if (!fs.existsSync(localFile)) {
      console.warn(`   ⚠️  File not found, clearing avatar: ${user.avatar}`);
      await User.findByIdAndUpdate(user._id, { avatar: null });
      continue;
    }

    try {
      const url = await uploadFile(localFile, 'bluesense/avatars', {
        public_id: `avatar-${user._id}`,
        overwrite: true,
      });
      await User.findByIdAndUpdate(user._id, { avatar: url });
      console.log(`   ✅ ${user.email}: ${url}`);
    } catch (err) {
      console.error(`   ❌ ${user.email}: ${err.message}`);
    }
  }
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('🚀 Starting Cloudinary migration...');
  console.log('   Cloud:', process.env.CLOUDINARY_CLOUD_NAME);

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await migratePackageImages();
  await migratePaymentProofs();
  await migrateRefundProofs();
  await migrateAvatars();

  console.log('\n🎉 Migration complete!');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('💥 Migration failed:', err);
  process.exit(1);
});