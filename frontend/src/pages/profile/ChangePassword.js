import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Profile.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.currentPassword) e.currentPassword = 'Current password is required';
    if (!formData.newPassword) {
      e.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      e.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.newPassword)) {
      e.newPassword = 'Must include uppercase, lowercase, number, and special character';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    if (formData.currentPassword === formData.newPassword) {
      e.newPassword = 'New password must be different from current password';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await usersAPI.changePassword(formData);
      toast.success('Password changed successfully!');
      navigate('/profile');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password';
      toast.error(message);
      if (message.toLowerCase().includes('current')) {
        setErrors({ currentPassword: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="change-password-page">
      <div className="container">
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="back-link"><FiArrowLeft /> Back</button>
          <h1>Change Password</h1>
          <p>Update your account password</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form" style={{ maxWidth: 500 }}>
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <div className="password-input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => { setFormData({ ...formData, currentPassword: e.target.value }); setErrors({}); }}
                  className={`form-control ${errors.currentPassword ? 'error' : ''}`}
                  placeholder="Enter current password"
                />
                <button type="button" className="pw-toggle" onClick={() => toggleShow('current')}>
                  {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <div className="password-input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => { setFormData({ ...formData, newPassword: e.target.value }); setErrors({}); }}
                  className={`form-control ${errors.newPassword ? 'error' : ''}`}
                  placeholder="Enter new password"
                />
                <button type="button" className="pw-toggle" onClick={() => toggleShow('new')}>
                  {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <div className="password-input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setErrors({}); }}
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm new password"
                />
                <button type="button" className="pw-toggle" onClick={() => toggleShow('confirm')}>
                  {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <LoadingSpinner size="small" text="" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
