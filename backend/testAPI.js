const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:8080/api/admin/rooms';

// Create a test JWT token for admin user
const testToken = jwt.sign(
  { id: 'test-id', email: 'admin@bluesense.com', role: 'admin' },
  process.env.JWT_SECRET || 'your_jwt_secret_key_bluesense_2026',
  { expiresIn: '7d' }
);

console.log('🔍 Testing Room Creation API...');
console.log(`🔗 API URL: ${API_URL}`);
console.log('');

// Test data
const testRoom = {
  name: 'Test Room ' + Date.now(),
  capacity: 4,
  price: 150,
  description: 'Test room for verification',
  status: 'Available'
};

const jsonData = JSON.stringify(testRoom);

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/admin/rooms',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(jsonData),
    'Authorization': `Bearer ${testToken}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:', data);
    process.exit(res.statusCode === 201 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

req.write(jsonData);
req.end();

// Timeout
setTimeout(() => {
  console.error('Timeout - backend not responding');
  process.exit(1);
}, 10000);
