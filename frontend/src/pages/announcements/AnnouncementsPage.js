import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { announcementsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { FiPlus, FiTrash2, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AnnouncementsPage = () => {
  const { eventId, id } = useParams();
  const activeEventId = eventId || id;
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', priority: 'medium' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAnnouncements(); }, [eventId]);

  const fetchAnnouncements = async () => {
    if (!activeEventId) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await announcementsAPI.getAnnouncements(activeEventId);
      setAnnouncements(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await announcementsAPI.createAnnouncement(activeEventId, formData);
      toast.success('Announcement posted! All registered attendees will be notified.');
      setFormData({ title: '', message: '', priority: 'medium' });
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post announcement'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementsAPI.deleteAnnouncement(id);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
  const priorityColors = { high: { bg: '#fef2f2', border: '#fecaca', icon: '#ef4444' }, medium: { bg: '#fffbeb', border: '#fde68a', icon: '#f59e0b' }, low: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#22c55e' } };
  const PriorityIcon = ({ priority }) => {
    if (priority === 'high') return <FiAlertCircle color={priorityColors.high.icon} />;
    if (priority === 'medium') return <FiAlertTriangle color={priorityColors.medium.icon} />;
    return <FiInfo color={priorityColors.low.icon} />;
  };

  if (loading) return <LoadingSpinner text="Loading announcements..." />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>📢 Announcements</h1>
        {isOrganizer && (
          <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            <FiPlus /> Post Announcement
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Announcement Title *" required style={{ width: '100%', padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.95rem' }} />
          <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Message *" required rows={3} style={{ width: '100%', padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', marginBottom: '0.75rem', resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Priority:</label>
            {['low', 'medium', 'high'].map((p) => (
              <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                <input type="radio" name="priority" value={p} checked={formData.priority === p} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} />
                {p}
              </label>
            ))}
          </div>
          <button type="submit" style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            Post Announcement
          </button>
        </form>
      )}

      {announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
          <p>No announcements for this event yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {announcements.map((ann) => {
            const colors = priorityColors[ann.priority] || priorityColors.medium;
            return (
              <div key={ann._id} style={{ background: colors.bg, borderRadius: '12px', padding: '1.25rem', border: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ marginTop: '0.1rem' }}><PriorityIcon priority={ann.priority} /></div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.3rem' }}>{ann.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{ann.message}</p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        {ann.author?.firstName} {ann.author?.lastName} · {ann.createdAt ? format(new Date(ann.createdAt), 'MMM d, yyyy h:mm a') : ''}
                      </p>
                    </div>
                  </div>
                  {isOrganizer && (
                    <button onClick={() => handleDelete(ann._id)} style={{ padding: '0.3rem', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', color: '#ef4444' }}>
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
