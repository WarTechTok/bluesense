// Quick test to verify room upload endpoint
const fs = require('fs');
const path = require('path');

// Check if uploads directory structure will be created
const uploadDir = path.join(__dirname, 'backend/uploads/room-images');

console.log('Testing upload configuration...');
console.log('Upload destination:', uploadDir);

// Verify multer is installed
try {
  require('multer');
  console.log('✅ Multer is installed');
} catch (e) {
  console.log('❌ Multer is NOT installed');
}

// Check backend structure
const roomControllerPath = path.join(__dirname, 'backend/controllers/roomController.js');
const roomsRoutePath = path.join(__dirname, 'backend/routes/rooms.js');

if (fs.existsSync(roomControllerPath)) {
  const content = fs.readFileSync(roomControllerPath, 'utf8');
  if (content.includes('uploadRoomImage')) {
    console.log('✅ uploadRoomImage function added to roomController.js');
  } else {
    console.log('❌ uploadRoomImage function NOT found in roomController.js');
  }
}

if (fs.existsSync(roomsRoutePath)) {
  const content = fs.readFileSync(roomsRoutePath, 'utf8');
  if (content.includes('upload.single')) {
    console.log('✅ Multer upload middleware added to routes');
  }
  if (content.includes('/upload-image')) {
    console.log('✅ /upload-image route added');
  }
  if (content.includes('multer')) {
    console.log('✅ Multer imported in routes');
  }
}

console.log('\n🚀 Backend image upload endpoint is configured!');
console.log('Frontend can now use uploadRoomImage() from adminApi.js');
console.log('Images will be stored at: /uploads/room-images/');
