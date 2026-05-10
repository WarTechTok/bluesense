// src/components/navbar/MobileView.jsx
// ============================================
// MOBILE VIEW - Sidebar menu, view profile,
// and edit profile for mobile screens
// ============================================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./styles/MobileView.css";

function MobileView({
  isOpen,
  setIsOpen,
  userData,
  userRole,
  getAvatarSrc,
  onViewProfile,
  onEditProfile,
  onLogout,
}) {
  const [showViewSection, setShowViewSection] = useState(false);
  const [avatarError, setAvatarError] = useState({
    main: false,
    view: false,
  });

  // ============================================
  // FIX 1: Lock background scroll when any panel is open
  // FIX 3: Reset state when everything is closed
  // ============================================
  useEffect(() => {
    const anyOpen = isOpen || showViewSection;
    if (anyOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Reset avatar errors when fully closed
      setAvatarError({ main: false, view: false, edit: false });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, showViewSection]);

  if (!isOpen && !showViewSection) return null;

  const handleAvatarError = (type) => {
    setAvatarError((prev) => ({ ...prev, [type]: true }));
  };

  // ============================================
  // Close all panels and reset state
  // ============================================
  const closeAll = () => {
    setIsOpen(false);
    setShowViewSection(false);
    setAvatarError({ main: false, view: false });
  };

  const handleViewProfile = () => {
    setIsOpen(false);
    setShowViewSection(true);
    setAvatarError((prev) => ({ ...prev, view: false }));
  };

  // ============================================
  // MOBILE VIEW PROFILE PANEL
  // ============================================
  const MobileViewProfile = () => {
    const avatarSrc = getAvatarSrc();
    const hasAvatar = avatarSrc && !avatarError.view;

    return (
      <>
        {/* FIX 2: Overlay behind panel — click to close */}
        <div
          className="mobile-sidebar-overlay active"
          onClick={() => setShowViewSection(false)}
        />
        <div className="mobile-view-sidebar">
          <div className="mobile-view-header">
            <h3>Profile</h3>
            <button
              className="mobile-view-close"
              onClick={() => setShowViewSection(false)}
            >
              ✕
            </button>
          </div>
          <div className="mobile-view-content">
            <div className="mobile-view-avatar">
              {hasAvatar ? (
                <img
                  src={avatarSrc}
                  alt={userData?.name}
                  onError={() => handleAvatarError("view")}
                />
              ) : (
                <span>{userData?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="mobile-view-name">{userData?.name}</div>
            <div className="mobile-view-email">{userData?.email}</div>

            {userData?.phone && (
              <div className="mobile-view-info">
                <span>📞</span> {userData.phone}
              </div>
            )}

            {userData?.address && (
              <div className="mobile-view-info">
                <span>📍</span> {userData.address}
              </div>
            )}

            {userData?.googleId && (
              <div className="mobile-view-google">Connected with Google</div>
            )}

            <button
              className="mobile-view-edit-btn"
              onClick={() => {
                setShowViewSection(false);
                // Opens the shared EditProfileModal in Navbar (same one desktop uses)
                if (onEditProfile) onEditProfile();
              }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </>
    );
  };

  // ============================================
  // GET AVATAR FOR MAIN MENU
  // ============================================
  const getMainAvatar = () => {
    const avatarSrc = getAvatarSrc();
    if (!avatarSrc || avatarError.main) {
      return (
        <span className="mobile-avatar-initials">
          {userData?.name?.charAt(0).toUpperCase()}
        </span>
      );
    }
    return (
      <img
        src={avatarSrc}
        alt={userData?.name}
        className="mobile-avatar-img"
        onError={() => handleAvatarError("main")}
      />
    );
  };

  // ============================================
  // MAIN MENU SIDEBAR
  // ============================================
  const MainMenu = () => (
    <>
      {/* FIX 2: Click overlay to close sidebar */}
      <div
        className="mobile-sidebar-overlay active"
        onClick={() => setIsOpen(false)}
      />
      <div className="mobile-sidebar active">
        <div className="mobile-sidebar-header">
          <h3>Menu</h3>
          <button className="mobile-close" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <div className="mobile-sidebar-content">
          {userData ? (
            <>
              <div className="mobile-profile-section">
                <div className="mobile-profile-header">
                  <div className="mobile-avatar">{getMainAvatar()}</div>
                  <div className="mobile-user-info">
                    <div className="mobile-user-name">{userData.name}</div>
                    <div className="mobile-user-email">{userData.email}</div>
                  </div>
                </div>

                <div className="mobile-profile-actions">
                  <button
                    className="mobile-profile-btn"
                    onClick={handleViewProfile}
                  >
                    <span className="mobile-profile-icon">👤</span>
                    View Profile
                  </button>
                  {(userRole === "admin" || userRole === "staff") && (
                    <Link
                      to="/dashboard"
                      className="mobile-profile-btn"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mobile-profile-icon">📋</span>
                      Dashboard
                    </Link>
                  )}
                </div>
              </div>

              <div className="mobile-divider"></div>

              <ul className="mobile-nav-links">
                <li><Link to="/" onClick={closeAll}>Home</Link></li>
                <li><Link to="/oasis-1" onClick={closeAll}>Oasis 1</Link></li>
                <li><Link to="/oasis-2" onClick={closeAll}>Oasis 2</Link></li>
                <li><Link to="/about-us" onClick={closeAll}>About Us</Link></li>
                <li><Link to="/contact-us" onClick={closeAll}>Contact Us</Link></li>
                <li><Link to="/gallery" onClick={closeAll}>Gallery</Link></li>
                <li><Link to="/my-bookings" onClick={closeAll}>My Bookings</Link></li>
              </ul>
            </>
          ) : (
            <div className="mobile-auth-section">
              <Link to="/login" className="mobile-login-btn" onClick={closeAll}>
                Log in
              </Link>
              <Link to="/register" className="mobile-register-btn" onClick={closeAll}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {userData && (
          <div className="mobile-signout-bottom">
            <button
              className="mobile-profile-btn logout"
              onClick={() => {
                closeAll();
                onLogout();
              }}
            >
              <span className="mobile-profile-icon">↪</span>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {isOpen && <MainMenu />}
      {showViewSection && <MobileViewProfile />}
    </>
  );
}

export default MobileView;