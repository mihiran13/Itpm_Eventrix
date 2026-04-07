import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password = 'Must include uppercase, lowercase, number, and special character';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authAPI.resetPassword(token, formData);
      setSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page single">
        <div className="auth-container">
          <div className="auth-card animate-slideUp" style={{ textAlign: 'center' }}>
            <FiCheckCircle size={60} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h2>Password Reset Successful!</h2>
            <p style={{ color: 'var(--gray-500)', margin: '1rem 0' }}>
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page single">
      <div className="auth-container">
        <div className="auth-card animate-slideUp">
          <div className="auth-header">
            <h1>Reset Password</h1>
            <p>Enter your new password below</p>
          </div>

          {errors.general && (
            <div className="alert alert-error">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({}); }}
                  className="form-input"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
                <FiLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setErrors({}); }}
                  className="form-input"
                />
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" text="" /> : 'Reset Password'}
            </button>
          </form>

          <p className="auth-footer-text">
            Remember your password?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
