import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsAPI, categoriesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FiImage, FiCalendar, FiMapPin, FiUsers, FiPlus, FiTrash2, FiSave, FiEye
} from 'react-icons/fi';
import './Events.css';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, catRes] = await Promise.all([eventsAPI.getById(id), categoriesAPI.getAll()]);
        const event = eventRes.data.event || eventRes.data.data;
        setCategories(catRes.data.categories || catRes.data.data || []);

        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : null;

        setFormData({
          title: event.title || '',
          description: event.description || '',
          category: event.category?._id || event.category || '',
          tags: event.tags?.join(', ') || '',
          eventType: event.eventType || 'in-person',
          startDate: format(startDate, 'yyyy-MM-dd'),
          startTime: format(startDate, 'HH:mm'),
          endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
          endTime: endDate ? format(endDate, 'HH:mm') : '',
          venue: event.venue ? {
            name: event.venue.name || '',
            address: typeof event.venue.address === 'object' ? (event.venue.address?.street || '') : (event.venue.address || ''),
            city: typeof event.venue.address === 'object' ? (event.venue.address?.city || '') : (event.venue.city || ''),
            state: typeof event.venue.address === 'object' ? (event.venue.address?.state || '') : (event.venue.state || ''),
            country: typeof event.venue.address === 'object' ? (event.venue.address?.country || '') : (event.venue.country || ''),
            zipCode: typeof event.venue.address === 'object' ? (event.venue.address?.zipCode || '') : (event.venue.zipCode || '')
          } : { name: '', address: '', city: '', state: '', country: '', zipCode: '' },
          virtualLink: event.virtualLink || '',
          capacity: event.capacity || '',
          isFree: event.isFree,
          ticketPrice: event.ticketPrice || '',
          isPublic: event.isPublic,
          requiresApproval: event.requiresApproval,
          allowWaitlist: event.allowWaitlist,
          speakers: event.speakers || [],
          agenda: event.agenda || [],
          faqs: event.faqs || [],
          status: event.status,
          faculty: event.faculty || 'All'
        });

        if (event.coverImage) setCoverPreview(event.coverImage);
      } catch (err) {
        toast.error('Event not found');
        navigate('/my-events');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading || !formData) return <LoadingSpinner fullScreen />;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
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
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
      setCoverPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, coverImage: file }));
    }
  };

  const addSpeaker = () => setFormData((p) => ({ ...p, speakers: [...p.speakers, { name: '', title: '', bio: '' }] }));
  const updateSpeaker = (i, field, value) => { const u = [...formData.speakers]; u[i][field] = value; setFormData((p) => ({ ...p, speakers: u })); };
  const removeSpeaker = (i) => setFormData((p) => ({ ...p, speakers: p.speakers.filter((_, idx) => idx !== i) }));

  const addAgendaItem = () => setFormData((p) => ({ ...p, agenda: [...p.agenda, { time: '', title: '', description: '' }] }));
  const updateAgenda = (i, field, value) => { const u = [...formData.agenda]; u[i][field] = value; setFormData((p) => ({ ...p, agenda: u })); };
  const removeAgenda = (i) => setFormData((p) => ({ ...p, agenda: p.agenda.filter((_, idx) => idx !== i) }));

  const addFAQ = () => setFormData((p) => ({ ...p, faqs: [...p.faqs, { question: '', answer: '' }] }));
  const updateFAQ = (i, field, value) => { const u = [...formData.faqs]; u[i][field] = value; setFormData((p) => ({ ...p, faqs: u })); };
  const removeFAQ = (i) => setFormData((p) => ({ ...p, faqs: p.faqs.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (status) => {
    if (!validateForm()) { toast.error('Please fix the errors'); return; }
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('eventType', formData.eventType);
      data.append('isPublic', formData.isPublic);
      data.append('requiresApproval', formData.requiresApproval);
      data.append('allowWaitlist', formData.allowWaitlist);
      if (status) data.append('status', status);
      if (formData.tags) data.append('tags', formData.tags);
      if (formData.faculty) data.append('faculty', formData.faculty);

      const startDate = new Date(`${formData.startDate}T${formData.startTime}`);
      data.append('startDate', startDate.toISOString());
      if (formData.endDate && formData.endTime) {
        data.append('endDate', new Date(`${formData.endDate}T${formData.endTime}`).toISOString());
      }
      if (formData.eventType !== 'virtual') data.append('venue', JSON.stringify(formData.venue));
      if (formData.eventType !== 'in-person') data.append('virtualLink', formData.virtualLink);
      if (formData.capacity) data.append('capacity', formData.capacity);
      data.append('isFree', formData.isFree);
      if (!formData.isFree) data.append('ticketPrice', formData.ticketPrice);
      if (formData.speakers.length) data.append('speakers', JSON.stringify(formData.speakers));
      if (formData.agenda.length) data.append('agenda', JSON.stringify(formData.agenda));
      if (formData.faqs.length) data.append('faqs', JSON.stringify(formData.faqs));
      if (formData.coverImage instanceof File) data.append('coverImage', formData.coverImage);

      await eventsAPI.update(id, data);
      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="container">
        <div className="page-header">
          <h1>Edit Event</h1>
          <p>Update your event details</p>
        </div>

        <div className="create-event-form">
          {/* Cover Image */}
          <div className="form-section">
            <h3><FiImage /> Cover Image</h3>
            <div className="cover-upload" onClick={() => document.getElementById('coverInput').click()}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover Preview" />
              ) : (
                <div className="upload-placeholder">
                  <FiImage size={40} />
                  <p>Click to upload cover image</p>
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
              <input type="text" name="title" value={formData.title} onChange={handleChange} className={`form-control ${errors.title ? 'error' : ''}`} />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className={`form-control ${errors.description ? 'error' : ''}`} />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className={`form-control ${errors.category ? 'error' : ''}`}>
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} className="form-control">
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="form-control" />
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
          </div>

          {/* Date & Time */}
          <div className="form-section">
            <h3><FiCalendar /> Date & Time</h3>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="form-control" />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">End Date</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="form-control" /></div>
              <div className="form-group"><label className="form-label">End Time</label><input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="form-control" /></div>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h3><FiMapPin /> Location</h3>
            {formData.eventType !== 'virtual' && (
              <>
                <div className="form-group"><label className="form-label">Venue Name *</label><input type="text" name="venue.name" value={formData.venue.name} onChange={handleChange} className="form-control" /></div>
                <div className="form-group"><label className="form-label">Address</label><input type="text" name="venue.address" value={formData.venue.address} onChange={handleChange} className="form-control" /></div>
                <div className="form-row-3">
                  <div className="form-group"><label className="form-label">City</label><input type="text" name="venue.city" value={formData.venue.city} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label">State</label><input type="text" name="venue.state" value={formData.venue.state} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label">Country</label><input type="text" name="venue.country" value={formData.venue.country} onChange={handleChange} className="form-control" /></div>
                </div>
              </>
            )}
            {formData.eventType !== 'in-person' && (
              <div className="form-group"><label className="form-label">Virtual Link</label><input type="url" name="virtualLink" value={formData.virtualLink} onChange={handleChange} className="form-control" /></div>
            )}
          </div>

          {/* Capacity */}
          <div className="form-section">
            <h3><FiUsers /> Capacity & Pricing</h3>
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">Capacity</label><input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="form-control" min="1" /></div>
              <div className="form-group">
                <label className="form-label">Pricing</label>
                <div className="toggle-group">
                  <label className="toggle-label"><input type="radio" name="isFree" checked={formData.isFree === true} onChange={() => setFormData({ ...formData, isFree: true })} /> Free</label>
                  <label className="toggle-label"><input type="radio" name="isFree" checked={formData.isFree === false} onChange={() => setFormData({ ...formData, isFree: false })} /> Paid</label>
                </div>
              </div>
            </div>
            {!formData.isFree && (
              <div className="form-group"><label className="form-label">Ticket Price ($)</label><input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} step="0.01" min="0" className="form-control" /></div>
            )}
          </div>

          {/* Speakers */}
          <div className="form-section">
            <div className="section-header-row"><h3>Speakers</h3><button type="button" className="add-btn" onClick={addSpeaker}><FiPlus /> Add</button></div>
            {formData.speakers.map((s, i) => (
              <div key={i} className="dynamic-field-card">
                <button className="remove-field-btn" onClick={() => removeSpeaker(i)}><FiTrash2 /></button>
                <div className="form-row-2">
                  <input type="text" placeholder="Name" value={s.name} onChange={(e) => updateSpeaker(i, 'name', e.target.value)} className="form-control" />
                  <input type="text" placeholder="Title" value={s.title} onChange={(e) => updateSpeaker(i, 'title', e.target.value)} className="form-control" />
                </div>
                <textarea placeholder="Bio" value={s.bio} onChange={(e) => updateSpeaker(i, 'bio', e.target.value)} className="form-control" rows={2} />
              </div>
            ))}
          </div>

          {/* Agenda */}
          <div className="form-section">
            <div className="section-header-row"><h3>Agenda</h3><button type="button" className="add-btn" onClick={addAgendaItem}><FiPlus /> Add</button></div>
            {formData.agenda.map((item, i) => (
              <div key={i} className="dynamic-field-card">
                <button className="remove-field-btn" onClick={() => removeAgenda(i)}><FiTrash2 /></button>
                <div className="form-row-2">
                  <input type="text" placeholder="Time" value={item.time} onChange={(e) => updateAgenda(i, 'time', e.target.value)} className="form-control" />
                  <input type="text" placeholder="Title" value={item.title} onChange={(e) => updateAgenda(i, 'title', e.target.value)} className="form-control" />
                </div>
                <textarea placeholder="Description" value={item.description} onChange={(e) => updateAgenda(i, 'description', e.target.value)} className="form-control" rows={2} />
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="form-section">
            <div className="section-header-row"><h3>FAQs</h3><button type="button" className="add-btn" onClick={addFAQ}><FiPlus /> Add</button></div>
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
            <button className="btn btn-secondary" onClick={() => handleSubmit('draft')} disabled={saving}><FiSave /> Save Draft</button>
            <button className="btn btn-primary" onClick={() => handleSubmit('published')} disabled={saving}>
              {saving ? <LoadingSpinner size="small" text="" /> : <><FiEye /> Update & Publish</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
