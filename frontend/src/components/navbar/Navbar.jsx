// src/components/navbar/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LogoutConfirmModal from '../modals/LogoutConfirmModal';
import SaveConfirmModal from './SaveConfirmModal';
import PCView from './PCView';
import MobileView from './MobileView';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Load user data from localStorage on mount and when location changes
  useEffect(() => {
    loadUserFromStorage();
    
    // Listen for storage changes (for OAuth redirect)
    const handleStorageChange = () => {
      console.log('Storage changed, reloading user...');
      loadUserFromStorage();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [location.pathname]); // Re-run when URL changes

  const loadUserFromStorage = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('Navbar loading user:', { token, userStr }); // Debug log
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('✅ User loaded in Navbar:', user);
        console.log('🖼️ Avatar field:', user.avatar);
        console.log('🖼️ GoogleAvatar field:', user.googleAvatar);
        setUserRole(user.role);
        setUserData(user);
      } catch (e) {
        console.error('Failed to parse user:', e);
        setUserRole(null);
        setUserData(null);
      }
    } else {
      console.log('No user found in localStorage');
      setUserRole(null);
      setUserData(null);
    }
  };

  // Refresh user data from backend
  const refreshUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token || !userData?._id) return;

    try {
      const response = await axios.get('http://localhost:8080/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data) {
        const updatedUser = { ...userData, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setUserRole(updatedUser.role);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  useEffect(() => {
    if (showViewModal || showEditModal || showSaveConfirm) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showViewModal, showEditModal, showSaveConfirm]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setIsOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole(null);
    setUserData(null);
    setShowLogoutConfirm(false);
    setShowViewModal(false);
    setShowEditModal(false);
    navigate('/');
  };

  // FIXED: Better avatar URL handling
  const getAvatarSrc = () => {
    if (!userData) {
      console.log('No userData, returning null');
      return null;
    }
    
    console.log('getAvatarSrc called with userData:', userData);
    
    // Check for avatar field (this is what Google login saves)
    if (userData.avatar) {
      console.log('Found avatar field:', userData.avatar);
      // If it's a full URL (from Google), use it directly
      if (userData.avatar.startsWith('http')) {
        console.log('Using Google avatar URL directly');
        return userData.avatar;
      }
      // If it's a local path, add backend URL
      console.log('Using local avatar path');
      return `http://localhost:8080${userData.avatar}`;
    }
    
    // Fallback to googleAvatar
    if (userData.googleAvatar) {
      console.log('Using googleAvatar fallback');
      return userData.googleAvatar;
    }
    
    console.log('No avatar found, returning null');
    return null;
  };

  // Save profile to database
  const saveProfileToDatabase = async (updatedData) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const formData = new FormData();
      formData.append('name', updatedData.name);
      formData.append('phone', updatedData.phone || '');
      formData.append('address', updatedData.address || '');
      
      const response = await axios.put(
        'http://localhost:8080/api/auth/profile',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.user) {
        const updatedUser = { ...userData, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setUserRole(updatedUser.role);
        setShowSaveConfirm(false);
        setShowEditModal(false);
        console.log('Profile updated successfully!');
        await refreshUserData();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleSaveClick = (updatedData) => {
    setPendingSaveData(updatedData);
    setShowSaveConfirm(true);
  };

  const confirmSave = () => {
    if (pendingSaveData) {
      saveProfileToDatabase(pendingSaveData);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* LEFT - Logo */}
          <Link to="/" className="navbar-logo">
            <img 
              src="/images/logo/resort-logo.jpg" 
              alt="Catherine's Oasis" 
              className="navbar-logo-img"
            />
            <span className="navbar-logo-text">Catherine's Oasis</span>
          </Link>

          {/* CENTER - Desktop Navigation */}
          <div className="nav-center desktop-only">
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/oasis1">Oasis 1</Link></li>
              <li><Link to="/oasis2">Oasis 2</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
            </ul>
          </div>

          {/* PC View Component */}
          <PCView 
            userData={userData}
            userRole={userRole}
            getAvatarSrc={getAvatarSrc}
            onViewProfile={() => setShowViewModal(true)}
            onEditProfile={handleSaveClick}
            onLogout={handleLogout}
          />

          {/* Mobile Toggle */}
          <button className={`navbar-toggle ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(true)}>
            <span className="toggle-bar"></span>
            <span className="toggle-bar"></span>
            <span className="toggle-bar"></span>
          </button>
        </div>
      </nav>

      {/* Mobile View Component */}
      <MobileView 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        userData={userData}
        userRole={userRole}
        getAvatarSrc={getAvatarSrc}
        onViewProfile={() => setShowViewModal(true)}
        onEditProfile={handleSaveClick}
        onLogout={handleLogout}
      />

      {/* Logout Confirmation */}
      <LogoutConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />

      {/* Save Confirmation Modal */}
      <SaveConfirmModal 
        isOpen={showSaveConfirm}
        onClose={() => {
          setShowSaveConfirm(false);
          setPendingSaveData(null);
        }}
        onConfirm={confirmSave}
      />
    </>
  );
}

export default Navbar;