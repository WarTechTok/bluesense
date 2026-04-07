// frontend/src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import Oasis1 from "./pages/Oasis1";
import Oasis2 from "./pages/Oasis2";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Gallery from "./pages/Gallery";
import Booking from "./pages/booking/Booking";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthRedirect from './pages/OAuthRedirect';

// ============================================
// AUTO REDIRECT COMPONENT - Checks for existing login
// ============================================
function AutoRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on dashboard or auth page
        const isOnDashboard = currentPath.includes('/admin/') || 
                             currentPath.includes('/staff/') ||
                             currentPath === '/dashboard';
        const isOnAuthPage = currentPath === '/login' || 
                            currentPath === '/register' ||
                            currentPath.includes('/reset-password') ||
                            currentPath === '/forgot-password';
        
        // Only redirect if not already on a dashboard or auth page
        if (!isOnDashboard && !isOnAuthPage) {
          if (user.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else if (user.role === 'staff') {
            navigate('/staff/dashboard', { replace: true });
          }
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [navigate]);
  
  return null;
}

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
      <AutoRedirect /> {/* This checks for existing login on app start */}
      <Routes>
        {/* Public Routes - Anyone can access */}
        <Route path="/" element={<Home />} />
        <Route path="/oasis-1" element={<Oasis1 />} />
        <Route path="/oasis-2" element={<Oasis2 />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/booking" element={<Booking />} />
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