// frontend/src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./components/admin/AdminLayout";
import ReceptionistLayout from "./components/receptionist/ReceptionistLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Tasks from "./pages/staff/Tasks";
import Inspections from "./pages/staff/Inspections";
import Rooms from "./pages/staff/Rooms";
import RoomManagement from "./pages/admin/RoomManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import BookingManagement from "./pages/admin/BookingManagement";
import SalesTracking from "./pages/admin/SalesTracking";
import Reports from "./pages/admin/Reports";
import MaintenanceManagement from "./pages/admin/MaintenanceManagement";
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
import MyBookings from "./pages/booking/MyBookings";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";  // ADD THIS IMPORT
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthRedirect from './pages/OAuthRedirect';

// ScrollToTop component - resets scroll position on page change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Component to redirect users based on role - checks if already logged in
function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  // If logged in as admin, redirect to admin dashboard
  if (token && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // If logged in as staff, redirect to staff dashboard
  if (token && user?.role === 'staff') {
    return <Navigate to="/staff/dashboard" replace />;
  }
  
  // If not logged in, show Home page
  return <Home />;
}

// Component for /dashboard endpoint (legacy support)
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
      <ScrollToTop />
      <Routes>
        {/* Home - Auto-redirect if logged in */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/oasis-1" element={<Oasis1 />} />
        <Route path="/oasis-2" element={<Oasis2 />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />  {/* ADD THIS ROUTE */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/oauth-redirect" element={<OAuthRedirect />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } 
        />

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
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Staff Tasks - Staff ONLY (With Sidebar) */}
        <Route 
          path="/staff/tasks" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <Tasks />
            </ProtectedRoute>
          } 
        />

        {/* Staff Inspections - Staff ONLY (With Sidebar) */}
        <Route 
          path="/staff/inspections" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <Inspections />
            </ProtectedRoute>
          } 
        />

        {/* Staff Assigned Rooms - Staff ONLY (With Sidebar) */}
        <Route 
          path="/staff/rooms" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <Rooms />
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
          path="/admin/bookings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <BookingManagement />
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

        <Route 
          path="/admin/maintenance" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <MaintenanceManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        {/* ============================================
            RECEPTIONIST ROUTES - Role: staff, Position: Receptionist
            ============================================ */}
        <Route 
          path="/receptionist/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <ReceptionistLayout>
                <ReceptionistDashboard />
              </ReceptionistLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/receptionist/bookings" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <ReceptionistLayout>
                <BookingManagement />
              </ReceptionistLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/receptionist/rooms" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <ReceptionistLayout>
                <RoomManagement />
              </ReceptionistLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/receptionist/inventory" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <ReceptionistLayout>
                <InventoryManagement />
              </ReceptionistLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/receptionist/sales" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <ReceptionistLayout>
                <SalesTracking />
              </ReceptionistLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/receptionist/reports" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <ReceptionistLayout>
                <Reports />
              </ReceptionistLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;