// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles, requiredPermission }) {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // If not logged in, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not allowed, redirect to home
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (
    user.role === 'admin' &&
    requiredPermission &&
    user.permissions &&
    user.permissions[requiredPermission] === false &&
    user.email?.toLowerCase() !== 'admin@bluesense.com'
  ) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If allowed, render the protected component
  return children;
}

export default ProtectedRoute;