// frontend/src/utils/apiBase.js
// Provides a centralized API base URL that prefers the configured backend
// and falls back to the deployed Render backend when the app is running locally.

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const FALLBACK_BACKEND = 'https://bluesense.onrender.com';

const getConfiguredApiBase = () => process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL;

export const getApiBase = () => {
  const configuredApiBase = getConfiguredApiBase();

  try {
    const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname)
      ? window.location.hostname
      : '';
    const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);

    if (isLocalHost && (configuredApiBase.includes('localhost') || configuredApiBase.includes('127.0.0.1'))) {
      return FALLBACK_BACKEND;
    }
  } catch (e) {
    // ignore
  }

  return configuredApiBase;
};

export const getApiUrl = (path = '') => {
  const base = getApiBase();
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const BASE_API = getApiBase();

export default BASE_API;
