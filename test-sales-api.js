// Test script to diagnose sales API issues
const axios = require('axios');

const API_BASE = 'http://localhost:8080/api/admin';
const token = 'YOUR_JWT_TOKEN_HERE';

async function testSalesAPI() {
  const headers = { Authorization: `Bearer ${token}` };
  
  console.log('🔍 Testing Sales API Endpoints...\n');
  
  try {
    // Test 1: Get all sales
    console.log('1️⃣  Get All Sales: GET /api/admin/sales');
    const allSales = await axios.get(`${API_BASE}/sales`, { headers });
    console.log('✅ Response:', allSales.data);
    console.log('');
    
    // Test 2: Get daily sales
    console.log('2️⃣  Get Daily Sales: GET /api/admin/sales/daily?date=2026-04-14');
    const todayDate = new Date().toISOString().split('T')[0];
    const dailySales = await axios.get(`${API_BASE}/sales/daily`, { 
      headers,
      params: { date: todayDate }
    });
    console.log('✅ Response:', dailySales.data);
    console.log('');
    
    // Test 3: Get weekly sales
    console.log('3️⃣  Get Weekly Sales: GET /api/admin/sales/weekly');
    const weeklySales = await axios.get(`${API_BASE}/sales/weekly`, { headers });
    console.log('✅ Response:', weeklySales.data);
    console.log('');
    
    // Test 4: Get monthly sales
    console.log('4️⃣  Get Monthly Sales: GET /api/admin/sales/monthly?month=3&year=2026');
    const monthlySales = await axios.get(`${API_BASE}/sales/monthly`, {
      headers,
      params: { month: 3, year: 2026 }
    });
    console.log('✅ Response:', monthlySales.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSalesAPI();
