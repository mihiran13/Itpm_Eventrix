import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, categoriesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  FiImage, FiCalendar, FiMapPin, FiUsers,
  FiPlus, FiTrash2, FiSave, FiEye
} from 'react-icons/fi';
import './Events.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  useAuth(); // ensure auth context is available
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    eventType: 'in-person',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venue: { name: '', address: '', city: '', state: '', country: '', zipCode: '' },
    virtualLink: '',
    capacity: '',
    isFree: true,
    ticketPrice: '',
    isPublic: true,
    requiresApproval: false,
    allowWaitlist: true,
    speakers: [],
    agenda: [],
    faqs: [],
    faculty: 'All'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    categoriesAPI
      .getAll()
      .then((res) => setCategories(res.data.categories || res.data.data || []))
      .catch(console.error);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.eventType !== 'virtual' && !formData.venue.name) newErrors.venue = 'Venue name is required';
    if (formData.eventType === 'virtual' && !formData.virtualLink) newErrors.virtualLink = 'Virtual link is required';
    if (!formData.isFree && (!formData.ticketPrice || formData.ticketPrice <= 0)) newErrors.ticketPrice = 'Valid ticket price is required';
    if (formData.capacity && formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';

    // Date validation
    if (formData.startDate && formData.startTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      if (start < new Date()) newErrors.startDate = 'Start date must be in the future';

      if (formData.endDate && formData.endTime) {
        const end = new Date(`${formData.endDate}T${formData.endTime}`);
        if (end <= start) newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('venue.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({ ...prev, venue: { ...prev.venue, [field]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setCoverPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, coverImage: file }));
    }
  };

  // Dynamic fields helpers
  const addSpeaker = () => {
    setFormData((prev) => ({ ...prev, speakers: [...prev.speakers, { name: '', title: '', bio: '' }] }));
  };

  const updateSpeaker = (index, field, value) => {
    const updated = [...formData.speakers];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, speakers: updated }));
  };

  const removeSpeaker = (index) => {
    setFormData((prev) => ({ ...prev, speakers: prev.speakers.filter((_, i) => i !== index) }));
  };

  const addAgendaItem = () => {
    setFormData((prev) => ({ ...prev, agenda: [...prev.agenda, { time: '', title: '', description: '' }] }));
  };

  const updateAgenda = (index, field, value) => {
    const updated = [...formData.agenda];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, agenda: updated }));
  };

  const removeAgenda = (index) => {
    setFormData((prev) => ({ ...prev, agenda: prev.agenda.filter((_, i) => i !== index) }));
  };

  const addFAQ = () => {
    setFormData((prev) => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }));
  };

  const updateFAQ = (index, field, value) => {
    const updated = [...formData.faqs];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, faqs: updated }));
  };

  const removeFAQ = (index) => {
    setFormData((prev) => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (status = 'published') => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('eventType', formData.eventType);
      data.append('isPublic', formData.isPublic);
      data.append('requiresApproval', formData.requiresApproval);
      data.append('allowWaitlist', formData.allowWaitlist);
      data.append('status', status);

      if (formData.tags) data.append('tags', formData.tags);
      if (formData.faculty) data.append('faculty', formData.faculty);

      const startDate = new Date(`${formData.startDate}T${formData.startTime}`);
      data.append('startDate', startDate.toISOString());

      if (formData.endDate && formData.endTime) {
        const endDate = new Date(`${formData.endDate}T${formData.endTime}`);
        data.append('endDate', endDate.toISOString());
      }

      if (formData.eventType !== 'virtual') {
        data.append('venue', JSON.stringify(formData.venue));
      }
      if (formData.eventType !== 'in-person') {
        data.append('virtualLink', formData.virtualLink);
      }

      if (formData.capacity) data.append('capacity', formData.capacity);
      data.append('isFree', formData.isFree);
      if (!formData.isFree) data.append('ticketPrice', formData.ticketPrice);

      if (formData.speakers.length) data.append('speakers', JSON.stringify(formData.speakers));
      if (formData.agenda.length) data.append('agenda', JSON.stringify(formData.agenda));
      if (formData.faqs.length) data.append('faqs', JSON.stringify(formData.faqs));

      if (formData.coverImage) data.append('coverImage', formData.coverImage);

      const res = await eventsAPI.create(data);
      toast.success(status === 'draft' ? 'Event saved as draft!' : 'Event created successfully!');
      const createdEventId = res.data.event?._id || res.data.data?._id;
      navigate(createdEventId ? `/events/${createdEventId}` : '/my-events');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        toast.error(apiErrors[0].message || 'Validation failed');
      } else {
        toast.error(err.response?.data?.message || 'Failed to create event');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="container">
        <div className="page-header">
          <h1>Create New Event</h1>
          <p>Fill in the details to create your event</p>
        </div>

        <div className="create-event-form">
          {/* Cover Image */}
          <div className="form-section">
            <h3><FiImage /> Cover Image</h3>
            <div className="cover-upload" onClick={() => document.getElementById('coverInput').click()}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" />
              ) : (
                <div className="upload-placeholder">
                  <FiImage size={40} />
                  <p>Click to upload cover image</p>
                  <span>Recommended: 1200x600px, Max 5MB</span>
                </div>
              )}
              <input id="coverInput" type="file" accept="image/*" onChange={handleImageChange} hidden />
            </div>
          </div>

          {/* Basic Info */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your event a catchy title"
                className={`form-control ${errors.title ? 'error' : ''}`}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event in detail..."
                rows={6}
                className={`form-control ${errors.description ? 'error' : ''}`}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className={`form-control ${errors.category ? 'error' : ''}`}>
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Event Type *</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} className="form-control">
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Faculty</label>
              <select name="faculty" value={formData.faculty} onChange={handleChange} className="form-control">
                <option value="All">All Faculties</option>
                <option value="Business">Business</option>
                <option value="IT">IT</option>
                <option value="Engineering">Engineering</option>
                <option value="Hospitality">Hospitality</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. tech, networking, workshop" className="form-control" />
            </div>
          </div>

          {/* Date & Time */}
          <div className="form-section">
            <h3><FiCalendar /> Date & Time</h3>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={`form-control ${errors.startDate ? 'error' : ''}`} />
                {errors.startDate && <span className="error-text">{errors.startDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={`form-control ${errors.startTime ? 'error' : ''}`} />
                {errors.startTime && <span className="error-text">{errors.startTime}</span>}
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={`form-control ${errors.endDate ? 'error' : ''}`} />
                {errors.endDate && <span className="error-text">{errors.endDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="form-control" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h3><FiMapPin /> Location</h3>
            {formData.eventType !== 'virtual' && (
              <>
                <div className="form-group">
                  <label className="form-label">Venue Name *</label>
                  <input type="text" name="venue.name" value={formData.venue.name} onChange={handleChange} placeholder="e.g. Convention Center" className={`form-control ${errors.venue ? 'error' : ''}`} />
                  {errors.venue && <span className="error-text">{errors.venue}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" name="venue.address" value={formData.venue.address} onChange={handleChange} placeholder="Street address" className="form-control" />
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" name="venue.city" value={formData.venue.city} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input type="text" name="venue.state" value={formData.venue.state} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" name="venue.country" value={formData.venue.country} onChange={handleChange} className="form-control" />
                  </div>
                </div>
              </>
            )}
            {formData.eventType !== 'in-person' && (
              <div className="form-group">
                <label className="form-label">Virtual Meeting Link *</label>
                <input type="url" name="virtualLink" value={formData.virtualLink} onChange={handleChange} placeholder="https://zoom.us/..." className={`form-control ${errors.virtualLink ? 'error' : ''}`} />
                {errors.virtualLink && <span className="error-text">{errors.virtualLink}</span>}
              </div>
            )}
          </div>

          {/* Capacity & Price */}
          <div className="form-section">
            <h3><FiUsers /> Capacity & Pricing</h3>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Max Capacity</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="Leave empty for unlimited" className="form-control" min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Pricing</label>
                <div className="toggle-group">
                  <label className="toggle-label">
                    <input type="radio" name="isFree" checked={formData.isFree === true} onChange={() => setFormData({ ...formData, isFree: true })} />
                    Free Event
                  </label>
                  <label className="toggle-label">
                    <input type="radio" name="isFree" checked={formData.isFree === false} onChange={() => setFormData({ ...formData, isFree: false })} />
                    Paid Event
                  </label>
                </div>
              </div>
            </div>
            {!formData.isFree && (
              <div className="form-group">
                <label className="form-label">Ticket Price ($) *</label>
                <input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} placeholder="0.00" step="0.01" min="0" className={`form-control ${errors.ticketPrice ? 'error' : ''}`} />
                {errors.ticketPrice && <span className="error-text">{errors.ticketPrice}</span>}
              </div>
            )}
            <div className="checkbox-group">
              <label><input type="checkbox" name="requiresApproval" checked={formData.requiresApproval} onChange={handleChange} /> Require approval for registrations</label>
              <label><input type="checkbox" name="allowWaitlist" checked={formData.allowWaitlist} onChange={handleChange} /> Allow waitlist when full</label>
              <label><input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} /> Public event (visible to everyone)</label>
            </div>
          </div>

          {/* Speakers */}
          <div className="form-section">
            <div className="section-header-row">
              <h3>Speakers</h3>
              <button type="button" className="add-btn" onClick={addSpeaker}><FiPlus /> Add Speaker</button>
            </div>
            {formData.speakers.map((speaker, i) => (
              <div key={i} className="dynamic-field-card">
                <button className="remove-field-btn" onClick={() => removeSpeaker(i)}><FiTrash2 /></button>
                <div className="form-row-2">
                  <input type="text" placeholder="Speaker Name" value={speaker.name} onChange={(e) => updateSpeaker(i, 'name', e.target.value)} className="form-control" />
                  <input type="text" placeholder="Title / Position" value={speaker.title} onChange={(e) => updateSpeaker(i, 'title', e.target.value)} className="form-control" />
                </div>
                <textarea placeholder="Short bio..." value={speaker.bio} onChange={(e) => updateSpeaker(i, 'bio', e.target.value)} className="form-control" rows={2} />
              </div>
            ))}
          </div>

          {/* Agenda */}
          <div className="form-section">
            <div className="section-header-row">
              <h3>Agenda</h3>
              <button type="button" className="add-btn" onClick={addAgendaItem}><FiPlus /> Add Item</button>
            </div>
            {formData.agenda.map((item, i) => (
              <div key={i} className="dynamic-field-card">
                <button className="remove-field-btn" onClick={() => removeAgenda(i)}><FiTrash2 /></button>
                <div className="form-row-2">
                  <input type="text" placeholder="Time (e.g. 09:00 AM)" value={item.time} onChange={(e) => updateAgenda(i, 'time', e.target.value)} className="form-control" />
                  <input type="text" placeholder="Title" value={item.title} onChange={(e) => updateAgenda(i, 'title', e.target.value)} className="form-control" />
                </div>
                <textarea placeholder="Description (optional)" value={item.description} onChange={(e) => updateAgenda(i, 'description', e.target.value)} className="form-control" rows={2} />
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="form-section">
            <div className="section-header-row">
              <h3>FAQs</h3>
              <button type="button" className="add-btn" onClick={addFAQ}><FiPlus /> Add FAQ</button>
            </div>
            {formData.faqs.map((faq, i) => (
              <div key={i} className="dynamic-field-card">
                <button className="remove-field-btn" onClick={() => removeFAQ(i)}><FiTrash2 /></button>
                <input type="text" placeholder="Question" value={faq.question} onChange={(e) => updateFAQ(i, 'question', e.target.value)} className="form-control" />
                <textarea placeholder="Answer" value={faq.answer} onChange={(e) => updateFAQ(i, 'answer', e.target.value)} className="form-control" rows={2} />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => handleSubmit('draft')} disabled={loading}>
              <FiSave /> Save as Draft
            </button>
            <button className="btn btn-primary" onClick={() => handleSubmit('published')} disabled={loading}>
              {loading ? <LoadingSpinner size="small" text="" /> : <><FiEye /> Publish Event</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
