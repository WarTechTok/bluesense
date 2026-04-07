// ============================================
// STAFF LAYOUT COMPONENT
// ============================================
// Main layout wrapper for all staff pages
// Includes collapsible sidebar with navigation menu
// Manages user logout and page routing
// Responsive design: sidebar collapses on mobile

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StaffLayout.css';

const StaffLayout = ({ children }) => {
  // ============================================
  // COMPONENT STATE
  // ============================================
  // sidebarOpen: controls sidebar expand/collapse visibility
  // navigate: React Router function for page navigation
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // ============================================
  // MENU ITEMS CONFIGURATION
  // ============================================
  // Array of navigation items displayed in sidebar
  // Each item has: id, label, emoji icon, and route path
  // Accessible only to authenticated staff users
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/staff/dashboard' },
    { id: 'tasks', label: 'Tasks', icon: '📋', path: '/staff/tasks' },
    { id: 'inspections', label: 'Inspections', icon: '🔍', path: '/staff/inspections' },
  ];

  // ============================================
  // HANDLE LOGOUT
  // ============================================
  // Clears auth token and user role from localStorage
  // Redirects user to /login page
  // Triggers on logout button click
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ============================================
  // HANDLE PAGE NAVIGATION
  // ============================================
  // Navigates to specified route path
  // Triggered when menu item is clicked
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="staff-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1>Staff Portal</h1>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="nav-item"
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="staff-content">
        {children}
      </main>
    </div>
  );
};

export default StaffLayout;