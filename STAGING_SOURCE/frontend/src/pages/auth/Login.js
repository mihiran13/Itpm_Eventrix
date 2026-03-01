import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Auth.css';

const Login = () => {
  const { login, googleLogin, isAuthenticated, loading: authLoading, user: authUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hook must be declared unconditionally before any early returns
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        await googleLogin(response.access_token);
      } catch (error) {
        // Error handled in auth context
      }
    },
    onError: () => {}
  });

  if (authLoading) return <LoadingSpinner fullScreen />;
  if (isAuthenticated) {
    if (authUser?.role === 'admin') return <Navigate to="/admin" replace />;
    if (authUser?.role === 'organizer') return <Navigate to="/organizer/dashboard" replace />;
    return <Navigate to="/feed" replace />;
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData);
    } catch (error) {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card animate-slideUp">
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span>🎉</span> Eventrix
            </Link>
            <h1>Welcome Back</h1>
            <p>Sign in to continue to your account</p>
          </div>

          {/* Google Login */}
          <button className="google-btn" onClick={() => handleGoogleLogin()} type="button">
            <FcGoogle className="google-icon" />
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                <FiMail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="username"
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                <FiLock className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" text="" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>

      {/* Background */}
      <div className="auth-bg">
        <div className="auth-bg-content">
          <h2>Discover Amazing Events</h2>
          <p>Join thousands of people finding and creating memorable events every day.</p>
          <div className="auth-bg-features">
            <div className="bg-feature">✓ Browse 1000+ events</div>
            <div className="bg-feature">✓ Create & manage events easily</div>
            <div className="bg-feature">✓ Connect with like-minded people</div>
            <div className="bg-feature">✓ Get real-time notifications</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
