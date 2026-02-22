// src/services/api.js

// ============================================
// NETWORK CONFIG - CHANGE THIS WHEN YOU MOVE!
// ============================================

// OPTION 1: Home WiFi
const API_BASE_URL = "http://192.168.100.224:8080";

// OPTION 2: Redmi Hotspot (current)
//const API_BASE_URL = "http://10.122.57.40:8080";

// OPTION 3: School WiFi
// const API_BASE_URL = "http://[SCHOOL-IP-HERE]:8080";

// OPTION 4: Laptop
// const API_BASE_URL = "http://192.168.100.152:8080";

// ============================================
// Don't change below
// ============================================

export async function getLatestReading() {
  const res = await fetch(`${API_BASE_URL}/api/readings/latest`);
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${API_BASE_URL}/api/readings/history`);
  return res.json();
}