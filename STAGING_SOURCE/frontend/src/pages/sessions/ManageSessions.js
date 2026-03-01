import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sessionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiUser, FiMapPin, FiDownload, FiBookmark } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageSessions = () => {
  const { eventId, id } = useParams();
  const activeEventId = eventId || id;
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', startTime: '', endTime: '', location: '',
    speaker: { name: '', bio: '', designation: '' }, capacity: 100
  });

  useEffect(() => { fetchSessions(); }, [eventId]);

  const fetchSessions = async () => {
    if (!activeEventId) {
      setSessions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await sessionsAPI.getSessions(activeEventId);
      setSessions(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', startTime: '', endTime: '', location: '', speaker: { name: '', bio: '', designation: '' }, capacity: 100 });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await sessionsAPI.updateSession(editing, formData);
        toast.success('Session updated');
      } else {
        await sessionsAPI.createSession(activeEventId, formData);
        toast.success('Session created');
      }
      resetForm();
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save session');
    }
  };

  const handleEdit = (session) => {
    setFormData({
      title: session.title, description: session.description || '',
      startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
      endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
      location: session.location || '',
      speaker: session.speaker || { name: '', bio: '', designation: '' },
      capacity: session.capacity || 100
    });
    setEditing(session._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await sessionsAPI.deleteSession(id);
      toast.success('Session deleted');
      fetchSessions();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleAddToSchedule = async (id) => {
    try {
      await sessionsAPI.addToSchedule(id);
      toast.success('Added to your schedule!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  if (loading) return <LoadingSpinner text="Loading sessions..." />;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
          <FiClock style={{ marginRight: '0.5rem' }} />Event Sessions
        </h1>
        {isOrganizer && (
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            <FiPlus /> Add Session
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#475569' }}>{editing ? 'Edit Session' : 'New Session'}</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Session Title *" required style={{ padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={2} style={{ padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={{ fontSize: '0.8rem', color: '#64748b' }}>Start Time *</label><input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required style={{ width: '100%', padding: '0.65rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div><label style={{ fontSize: '0.8rem', color: '#64748b' }}>End Time *</label><input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required style={{ width: '100%', padding: '0.65rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} /></div>
            </div>
            <input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Room / Location" style={{ padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input value={formData.speaker.name} onChange={(e) => setFormData({ ...formData, speaker: { ...formData.speaker, name: e.target.value } })} placeholder="Speaker Name *" required style={{ padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
              <input value={formData.speaker.designation} onChange={(e) => setFormData({ ...formData, speaker: { ...formData.speaker, designation: e.target.value } })} placeholder="Speaker Designation" style={{ padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
            </div>
            <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} placeholder="Capacity" min={1} style={{ padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', maxWidth: '200px' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={resetForm} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
          <FiClock size={40} /><p style={{ marginTop: '0.75rem' }}>No sessions yet.{isOrganizer ? ' Create the first one!' : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {sessions.map((session) => (
            <div key={session._id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.4rem' }}>{session.title}</h3>
                  {session.description && <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{session.description}</p>}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
                    <span><FiClock /> {session.startTime ? format(new Date(session.startTime), 'h:mm a') : ''} - {session.endTime ? format(new Date(session.endTime), 'h:mm a') : ''}</span>
                    {session.location && <span><FiMapPin /> {session.location}</span>}
                    <span><FiUser /> {session.speaker?.name || 'TBA'}{session.speaker?.designation ? ` (${session.speaker.designation})` : ''}</span>
                    <span>👥 {session.attendeeCount || 0}/{session.capacity}</span>
                  </div>
                  {session.materials && session.materials.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {session.materials.map((m, i) => (
                        <a key={i} href={m.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: '#6366f1', background: '#eef2ff', padding: '0.25rem 0.6rem', borderRadius: '1rem', textDecoration: 'none' }}>
                          <FiDownload size={12} /> {m.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleAddToSchedule(session._id)} title="Add to My Schedule" style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f0fdf4', cursor: 'pointer', color: '#22c55e' }}>
                    <FiBookmark size={16} />
                  </button>
                  {isOrganizer && (
                    <>
                      <button onClick={() => handleEdit(session)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#6366f1' }}><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(session._id)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#ef4444' }}><FiTrash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageSessions;
