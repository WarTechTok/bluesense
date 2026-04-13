// src/components/navbar/Navbar.jsx
// ============================================
// NAVBAR - Fixed navigation with GLASS EFFECT on scroll
// ============================================

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import LogoutConfirmModal from "../modals/LogoutConfirmModal";
import EditProfileModal from "./EditProfileModal";
import PCView from "./PCView";
import MobileView from "./MobileView";
import "./Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Scroll state for glass effect
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // AUTO-SCROLL TO TOP ON PAGE NAVIGATION
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  // Detect scroll for glass effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    loadUserFromStorage();

    const handleStorageChange = () => {
      loadUserFromStorage();
    };

    // Listen for profile updates from other components
    const handleProfileUpdated = (event) => {
      if (event.detail) {
        setUserData(event.detail);
        setUserRole(event.detail.role);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    window.addEventListener("profileUpdated", handleProfileUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
      window.removeEventListener("profileUpdated", handleProfileUpdated);
    };
  }, [location.pathname]);

  const loadUserFromStorage = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        setUserData(user);
      } catch (e) {
        console.error("Failed to parse user:", e);
        setUserRole(null);
        setUserData(null);
      }
    } else {
      setUserRole(null);
      setUserData(null);
    }
  };

  useEffect(() => {
    if (showViewModal || showEditModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showViewModal, showEditModal]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setIsOpen(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserRole(null);
    setUserData(null);
    setShowLogoutConfirm(false);
    setShowViewModal(false);
    setShowEditModal(false);
    navigate("/");
  };

  const getAvatarSrc = () => {
    if (!userData) return null;

    if (userData.avatar) {
      if (userData.avatar.startsWith("http")) {
        return userData.avatar;
      }
      return `http://localhost:8080${userData.avatar}`;
    }

    if (userData.googleAvatar) {
      return userData.googleAvatar;
    }

    return null;
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveFromModal = async (updatedData) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Phone number from EditProfileModal is already cleaned (just digits)
      // Send it as-is to the backend
      const response = await axios.put(
        "http://localhost:8080/api/auth/profile",
        {
          name: updatedData.name,
          phone: updatedData.phone || "",
          address: updatedData.address || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.user) {
        // Update localStorage with the response from backend
        const updatedUser = { 
          ...userData, 
          ...response.data.user
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setUserRole(updatedUser.role);

        // Close edit modal
        setShowEditModal(false);

        // Dispatch event for other components
        window.dispatchEvent(
          new CustomEvent("profileUpdated", { detail: updatedUser }),
        );

        // Show success message
        // You can add a toast notification here if you have one
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to save profile. Please try again."
      );
    }
  };



  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
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

          {/* CENTER - Desktop Navigation with Simple Underline */}
          <div className="nav-center desktop-only">
            <ul className="nav-links">
              <li>
                <Link to="/" className={isActive("/") ? "active" : ""}>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/oasis-1"
                  className={isActive("/oasis-1") ? "active" : ""}
                >
                  Oasis 1
                </Link>
              </li>
              <li>
                <Link
                  to="/oasis-2"
                  className={isActive("/oasis-2") ? "active" : ""}
                >
                  Oasis 2
                </Link>
              </li>
              <li>
                <Link
                  to="/about-us"
                  className={isActive("/about-us") ? "active" : ""}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-us"
                  className={isActive("/contact-us") ? "active" : ""}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className={isActive("/gallery") ? "active" : ""}
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/my-bookings"
                  className={isActive("/my-bookings") ? "active" : ""}
                >
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* PC View Component */}
          <PCView
            userData={userData}
            userRole={userRole}
            getAvatarSrc={getAvatarSrc}
            onViewProfile={() => setShowViewModal(true)}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
          />

          {/* Mobile Toggle */}
          <button
            className={`navbar-toggle ${isOpen ? "active" : ""}`}
            onClick={() => setIsOpen(true)}
          >
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
        onEditProfile={handleEditProfile}
        onLogout={handleLogout}
      />

      {/* Logout Confirmation */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userData={userData}
        getAvatarSrc={getAvatarSrc}
        onSave={handleSaveFromModal}
      />
    </>
  );
}

export default Navbar;