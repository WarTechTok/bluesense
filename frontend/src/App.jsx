// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./components/admin/AdminLayout";
import StaffLayout from "./components/staff/StaffLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Tasks from "./pages/staff/Tasks";
import Inspections from "./pages/staff/Inspections";
import RoomManagement from "./pages/admin/RoomManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import ReservationManagement from "./pages/admin/ReservationManagement";
import SalesTracking from "./pages/admin/SalesTracking";
import Reports from "./pages/admin/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthRedirect from './pages/OAuthRedirect';

// Component to redirect users based on role
function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === 'staff') {
    return <Navigate to="/staff/dashboard" replace />;
  }
  return <Dashboard />;
}

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

        {/* Protected Route - Admin/Staff ONLY - Admin redirect to admin dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <DashboardRedirect />
            </ProtectedRoute>
          } 
        />

        {/* Staff Dashboard - Staff ONLY (With Sidebar) */}
        <Route 
          path="/staff/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffLayout>
                <StaffDashboard />
              </StaffLayout>
            </ProtectedRoute>
          } 
        />

        {/* Staff Tasks - Staff ONLY (With Sidebar) */}
        <Route 
          path="/staff/tasks" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffLayout>
                <Tasks />
              </StaffLayout>
            </ProtectedRoute>
          } 
        />

        {/* Staff Inspections - Staff ONLY (With Sidebar) */}
        <Route 
          path="/staff/inspections" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffLayout>
                <Inspections />
              </StaffLayout>
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard - Admin ONLY (With Sidebar) */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        {/* Admin Management Pages - Admin ONLY (With Sidebar) */}
        <Route 
          path="/admin/rooms" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <RoomManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/staff" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <StaffManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/inventory" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <InventoryManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/reservations" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <ReservationManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/sales" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <SalesTracking />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <Reports />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;