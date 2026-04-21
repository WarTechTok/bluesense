// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../services/api";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(null);

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

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const userRole = data.user.role;

        const urlParams = new URLSearchParams(location.search);
        const redirectUrl = urlParams.get('redirect');

        if (redirectUrl) {
          navigate(redirectUrl);
        } 
        else if (userRole === "admin") {
          navigate("/admin/dashboard");
        } 
        else if (userRole === "staff") {
          navigate("/staff/dashboard");
        } 
        else {
          navigate("/");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      if (err.response?.status === 429 && err.response.data?.waitTime) {
        setCooldown(err.response.data.waitTime);
        setError(err.response.data.message);
        setAttemptsLeft(null);
      } else if (err.response?.data?.attemptsLeft !== undefined) {
        setAttemptsLeft(err.response.data.attemptsLeft);
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
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
            <h2 className="promo-title">Experience Paradise</h2>
            <p className="promo-text">
              Two stunning oases, crystal-clear pools, and cozy cottages waiting
              for you.
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-form-card">
            <h1 className="form-title">Welcome back</h1>
            <p className="form-subtitle">Sign in to continue</p>

            {error && (
              <div className="login-error">
                {error}
                {cooldown > 0 && <span className="error-timer">{cooldown}s</span>}
              </div>
            )}

            {attemptsLeft !== null && attemptsLeft > 0 && !error && (
              <div className="login-attempts">
                {attemptsLeft} attempt{attemptsLeft > 1 ? "s" : ""} remaining
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

                <div className="forgot-wrapper">
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className={`login-submit-btn ${loading || cooldown > 0 ? "disabled" : ""}`}
                disabled={loading || cooldown > 0}
              >
                {loading ? "Signing in..." : cooldown > 0 ? `Wait ${cooldown}s` : "Sign in"}
              </button>
            </form>

            <div className="login-divider">
              <span className="divider-line"></span>
              <span className="divider-text">or</span>
              <span className="divider-line"></span>
            </div>

            <GoogleLoginButton buttonText="Sign in with Google" />

            <div className="login-footer">
              <p>
                Don't have an account? <Link to="/register">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;