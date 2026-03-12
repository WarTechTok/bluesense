import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Existing pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Monitoring dashboard (existing) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Dashboard Routes */}
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
        
        {/* Default redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;