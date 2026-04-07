import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Auth.css';

const Register = () => {
  const { register, googleLogin, isAuthenticated, loading: authLoading, user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;
    return strength;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password = 'Must include uppercase, lowercase, number, and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData);
    } catch (error) {
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach((err) => {
          apiErrors[err.field] = err.message;
        });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return { label: 'Weak', color: '#ef4444' };
    if (passwordStrength <= 2) return { label: 'Fair', color: '#f97316' };
    if (passwordStrength <= 3) return { label: 'Good', color: '#eab308' };
    if (passwordStrength <= 4) return { label: 'Strong', color: '#22c55e' };
    return { label: 'Very Strong', color: '#10b981' };
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card animate-slideUp">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span>🎉</span> Eventrix
            </Link>
            <h1>Create Account</h1>
            <p>Sign up to start discovering and creating events</p>
          </div>

          <button className="google-btn" onClick={() => handleGoogleLogin()} type="button">
            <FcGoogle className="google-icon" />
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider">
            <span>or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <div className={`input-wrapper ${errors.firstName ? 'error' : ''}`}>
                  <FiUser className="input-icon" />
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <div className={`input-wrapper ${errors.lastName ? 'error' : ''}`}>
                  <FiUser className="input-icon" />
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">I want to</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                  style={{ appearance: 'auto', paddingLeft: '40px' }}
                >
                  <option value="user">Attend Events (Student)</option>
                  <option value="organizer">Organize Events (Organizer)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                <FiMail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                <FiLock className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="strength-bar"
                        style={{
                          backgroundColor: passwordStrength >= level ? getStrengthLabel().color : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: getStrengthLabel().color }}>
                    {getStrengthLabel().label}
                  </span>
                </div>
              )}
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
                <FiLock className="input-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" text="" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-bg">
        <div className="auth-bg-content">
          <h2>Join Eventrix Today</h2>
          <p>Create your free account and be part of the largest event community.</p>
          <div className="auth-bg-features">
            <div className="bg-feature">✓ Free to sign up</div>
            <div className="bg-feature">✓ Create unlimited events</div>
            <div className="bg-feature">✓ Manage registrations easily</div>
            <div className="bg-feature">✓ Secure and reliable platform</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
