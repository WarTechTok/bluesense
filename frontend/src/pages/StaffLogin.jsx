import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import "./Login.css";

/**
 * Staff Login Page - For Receptionists, Housekeepers, and other staff members
 */
function StaffLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Add no-navbar class when on login page
  useEffect(() => {
    document.body.classList.add('no-navbar');
    return () => {
      document.body.classList.remove('no-navbar');
    };
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await login(form.email, form.password);
      
      console.log("🔍 Login Response:", data);

      if (data.token && data.user) {
        console.log("✅ Login successful! Staff data:", data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Route based on role/position
        const role = data.user.role;
        const position = data.user.position;
        
        console.log("📍 Routing - Role:", role, "Position:", position);
        
        if (position === "Receptionist") {
          console.log("→ Redirecting to receptionist/dashboard");
          navigate("/receptionist/dashboard");
        } else if (position === "Housekeeper" || position === "Maintenance" || position === "Chef") {
          console.log("→ Redirecting to staff/dashboard");
          navigate("/staff/dashboard");
        } else if (role === "staff") {
          console.log("→ Redirecting to staff/dashboard (role-based)");
          navigate("/staff/dashboard");
        } else {
          console.log("→ Redirecting to staff/dashboard (default)");
          navigate("/staff/dashboard");
        }
      } else {
        console.log("❌ Login failed - No token or user data:", data);
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Link to="/" className="login-logo-link">
        <img
          src="/images/logo/Logo-NoBackground.png"
          alt="Catherine's Oasis"
          className="login-logo"
        />
      </Link>

      <div className="login-content">
        {/* Left side - Promotional */}
        <div className="login-promo">
          <div className="promo-card">
            <div className="promo-images">
              <img
                src="/images/hero/oasis1.jpg"
                alt="Oasis 1"
                className="promo-img main-img"
              />
              <img
                src="/images/hero/oasis2.jpg"
                alt="Oasis 2"
                className="promo-img stacked-img img1"
              />
              <img
                src="/images/hero/pool-area.jpg"
                alt="Pool"
                className="promo-img stacked-img img2"
              />
            </div>
            <h2 className="promo-title">Staff Portal</h2>
            <p className="promo-text">
              Access your staff dashboard to manage tasks, bookings, and operations at Catherine's Oasis.
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-form-card">
            <h1 className="form-title">Staff Login</h1>
            <p className="form-subtitle">Sign in to your staff account</p>

            {error && (
              <div className="login-error">
                {error}
                {cooldown > 0 && <span className="error-timer">{cooldown}s</span>}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={cooldown > 0}
                  className={cooldown > 0 ? "disabled" : ""}
                />
              </div>

              <div className="form-group">
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    disabled={cooldown > 0}
                    className={cooldown > 0 ? "disabled" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="eye-button"
                    disabled={cooldown > 0}
                  >
                    {showPassword ? (
                      <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading || cooldown > 0}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Customer login?{" "}
                <Link to="/login" className="login-link">
                  Go to customer login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
