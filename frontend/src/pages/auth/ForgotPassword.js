import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page single">
        <div className="auth-container">
          <div className="auth-card animate-slideUp" style={{ textAlign: 'center' }}>
            <FiCheckCircle size={60} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h2>Check Your Email</h2>
            <p style={{ color: 'var(--gray-500)', margin: '1rem 0' }}>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSent(false)}
                style={{ color: 'var(--primary-500)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                try again
              </button>
            </p>
            <Link to="/login" className="auth-submit-btn" style={{ display: 'block', marginTop: '1.5rem', textAlign: 'center' }}>
              Back to Login
            </Link>
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
            <Link to="/login" className="back-link">
              <FiArrowLeft /> Back to Login
            </Link>
            <h1>Forgot Password?</h1>
            <p>Enter your email and we'll send you a reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className={`input-wrapper ${error ? 'error' : ''}`}>
                <FiMail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="form-input"
                />
              </div>
              {error && <span className="error-text">{error}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" text="" /> : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
