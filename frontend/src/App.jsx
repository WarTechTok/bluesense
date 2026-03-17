// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute"; // ← ADD THIS
import OAuthRedirect from './pages/OAuthRedirect';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;