import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiGlobe, FiSave, FiArrowLeft } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Profile.css';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    socialLinks: {
      website: user?.socialLinks?.website || '',
      twitter: user?.socialLinks?.twitter || '',
      linkedin: user?.socialLinks?.linkedin || ''
    }
  });
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (formData.phone && !/^[\d+\-() ]{7,15}$/.test(formData.phone)) e.phone = 'Invalid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
      setAvatarPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, avatar: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.bio) data.append('bio', formData.bio);
      data.append('socialLinks', JSON.stringify(formData.socialLinks));
      if (formData.avatar) data.append('avatar', formData.avatar);

      const res = await usersAPI.updateProfile(data);
      updateUser(res.data.data || res.data.user);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="container">
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="back-link"><FiArrowLeft /> Back</button>
          <h1>Edit Profile</h1>
          <p>Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Avatar */}
          <div className="form-section">
            <h3>Profile Picture</h3>
            <div className="avatar-upload" onClick={() => document.getElementById('avatarInput').click()}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="avatar-preview" />
              ) : (
                <div className="avatar-placeholder"><FiUser size={32} /></div>
              )}
              <span className="avatar-edit-label">Change Photo</span>
              <input id="avatarInput" type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </div>
          </div>

          {/* Personal Info */}
          <div className="form-section">
            <h3><FiUser /> Personal Information</h3>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={`form-control ${errors.firstName ? 'error' : ''}`} />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={`form-control ${errors.lastName ? 'error' : ''}`} />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-control disabled"><FiMail /> {user?.email}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (234) 567-8900" className={`form-control ${errors.phone ? 'error' : ''}`} />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Tell us about yourself..." className="form-control" />
            </div>
          </div>

          {/* Social Links */}
          <div className="form-section">
            <h3><FiGlobe /> Social Links</h3>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input type="url" name="social.website" value={formData.socialLinks.website} onChange={handleChange} placeholder="https://yourwebsite.com" className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label">Twitter</label>
              <input type="url" name="social.twitter" value={formData.socialLinks.twitter} onChange={handleChange} placeholder="https://twitter.com/username" className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn</label>
              <input type="url" name="social.linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" className="form-control" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <LoadingSpinner size="small" text="" /> : <><FiSave /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
