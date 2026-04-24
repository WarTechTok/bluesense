// frontend/src/services/admin/index.js
// ============================================
// ADMIN API - Main entry point (re-exports all modules)
// Your existing imports like "import * as adminApi from '../../services/admin'" will continue to work!
// ============================================

export * from './apiClient';
export * from './dashboard';
export * from './bookings';
export * from './rooms';
export * from './inventory';
export * from './staff';
export * from './sales';
export * from './reports';
export * from './maintenance';
// Add to the exports
export * from './packages';
export * from './addons';
export * from './sessions';