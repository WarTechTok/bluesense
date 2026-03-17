// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Existing pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthRedirect from './pages/OAuthRedirect';

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import RoomManagement from "./pages/admin/RoomManagement";
import ReservationManagement from "./pages/admin/ReservationManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import SalesTracking from "./pages/admin/SalesTracking";
import Reports from "./pages/admin/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Anyone can access */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/oauth-redirect" element={<OAuthRedirect />} />

        {/* Protected Route - Admin/Staff ONLY */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard Routes (from Pauig) */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="rooms" element={<RoomManagement />} />
              <Route path="reservations" element={<ReservationManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="sales" element={<SalesTracking />} />
              <Route path="reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </AdminLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;