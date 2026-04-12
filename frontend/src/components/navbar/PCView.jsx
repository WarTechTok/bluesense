// src/components/navbar/PCView.jsx
// ============================================
// PC VIEW - Desktop navbar right side with
// profile dropdown, view profile, edit modal
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import './styles/PCView.css';

function PCView({ userData, userRole, getAvatarSrc, onViewProfile, onEditProfile, onLogout }) {
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [avatarError, setAvatarError] = useState({});

  const mainDropdownRef = useRef(null);

  useEffect(() => {
    if (showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEditModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mainDropdownRef.current && !mainDropdownRef.current.contains(event.target)) {
        setShowMainDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFirstName = () => userData?.name ? userData.name.split(' ')[0] : '';

  const handleAvatarError = (type) => {
    setAvatarError(prev => ({ ...prev, [type]: true }));
  };

  const ViewProfileDropdown = () => {
    const avatarSrc = getAvatarSrc();
    const hasAvatar = avatarSrc && !avatarError['view'];

    return (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1000,
          }}
          onClick={() => setShowViewDropdown(false)}
        />
        <div className="pc-dropdown view-dropdown" style={{ zIndex: 1001 }}>
          <div className="view-dropdown-header">
            <div className="view-dropdown-avatar">
              {hasAvatar ? (
                <img
                  src={avatarSrc}
                  alt={userData?.name}
                  onError={() => handleAvatarError('view')}
                />
              ) : (
                <span>{userData?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="view-dropdown-info">
              <div className="view-dropdown-name">{userData?.name}</div>
              <div className="view-dropdown-email">{userData?.email}</div>
            </div>
          </div>

          {userData?.phone && (
            <div className="view-dropdown-detail">
              <span className="detail-icon">📞</span>
              <span className="detail-text">{userData.phone}</span>
            </div>
          )}

          {userData?.address && (
            <div className="view-dropdown-detail">
              <span className="detail-icon">📍</span>
              <span className="detail-text">{userData.address}</span>
            </div>
          )}

          {userData?.googleId && (
            <div className="view-dropdown-google">Connected with Google</div>
          )}

          <div className="view-dropdown-actions">
            <button
              className="view-dropdown-edit-btn"
              onClick={() => {
                setShowViewDropdown(false);
                setShowEditModal(true);
              }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </>
    );
  };

  const getMainAvatar = () => {
    const avatarSrc = getAvatarSrc();
    if (!avatarSrc || avatarError['main']) {
      return (
        <span className="avatar-initials">
          {userData?.name?.charAt(0).toUpperCase()}
        </span>
      );
    }
    return (
      <img
        src={avatarSrc}
        alt={userData?.name}
        className="avatar-img"
        onError={() => handleAvatarError('main')}
      />
    );
  };

  // Debug: log the onEditProfile function
  console.log('onEditProfile in PCView:', onEditProfile);

  return (
    <div className="nav-right desktop-only">
      {userData ? (
        <>
          {(userRole === 'admin' || userRole === 'staff') && (
            <Link to="/dashboard" className="dashboard-link">Dashboard</Link>
          )}

          <div className="dropdown-container" ref={mainDropdownRef}>
            <button
              onClick={() => {
                setShowMainDropdown(!showMainDropdown);
                setShowViewDropdown(false);
              }}
              className="user-profile-btn"
            >
              <span className="user-name">{getFirstName()}</span>
              <div className="avatar-with-indicator">
                <div className="avatar-circle">
                  {getMainAvatar()}
                </div>
                <span className="avatar-arrow">▼</span>
              </div>
            </button>

            {showMainDropdown && (
              <div className="pc-dropdown main-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowMainDropdown(false);
                    setShowViewDropdown(true);
                    setAvatarError(prev => ({ ...prev, view: false }));
                  }}
                >
                  <span className="dropdown-icon">👤</span>
                  View Profile
                </button>
                {(userRole === 'admin' || userRole === 'staff') && (
                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setShowMainDropdown(false)}
                  >
                    <span className="dropdown-icon">📋</span>
                    Dashboard
                  </Link>
                )}
                <button
                  className="dropdown-item logout"
                  onClick={() => {
                    setShowMainDropdown(false);
                    onLogout();
                  }}
                >
                  <span className="dropdown-icon">↪</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {showViewDropdown && <ViewProfileDropdown />}

          <EditProfileModal
            isOpen={showEditModal}
            onClose={() => {
              console.log('Closing edit modal');
              setShowEditModal(false);
            }}
            userData={userData}
            getAvatarSrc={getAvatarSrc}
            onSave={(data) => {
              console.log('EditProfileModal onSave called with:', data);
              if (onEditProfile) {
                onEditProfile(data);
              } else {
                console.error('onEditProfile is undefined!');
              }
            }}
          />
        </>
      ) : (
        <div className="auth-buttons">
          <Link to="/login" className="login-link">Login</Link>
          <Link to="/register" className="register-link">Sign Up</Link>
        </div>
      )}
    </div>
  );
}

export default PCView;