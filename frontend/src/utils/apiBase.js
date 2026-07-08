// frontend/src/utils/apiBase.js
// Provides a centralized API base URL that prefers REACT_APP_API_URL
// but falls back to the deployed Render backend when the frontend is not localhost.

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const getApiBase = () => {
  const FALLBACK_BACKEND = 'https://bluesense.onrender.com';
  try {
    const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : '';
    if ((API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1'))
        && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return FALLBACK_BACKEND;
    }
  } catch (e) {
    // ignore
  }
  return API_BASE_URL;
};

export const BASE_API = getApiBase();

export default BASE_API;
