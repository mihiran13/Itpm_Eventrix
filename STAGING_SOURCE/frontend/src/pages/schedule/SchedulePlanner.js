import React, { useState, useEffect } from 'react';
import { sessionsAPI, registrationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { FiCalendar, FiClock, FiMapPin, FiBookmark, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SchedulePlanner = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scheduleRes, regRes] = await Promise.all([
        sessionsAPI.getMySchedule(),
        registrationsAPI.getMyRegistrations({ limit: 50 })
      ]);
      setSchedule(scheduleRes.data.data || []);
      setRegistrations(regRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeSession = async (sessionId) => {
    try {
      await sessionsAPI.removeFromSchedule(sessionId);
      toast.success('Session removed from schedule');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove session');
    }
  };

  if (loading) return <LoadingSpinner text="Loading your schedule..." />;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
        <FiCalendar style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        My Schedule Planner
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Track your registered events and planned sessions.
      </p>

      {/* Registered Events */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        📅 My Registered Events
      </h2>
      {registrations.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem' }}>
          <FiCalendar size={32} /><p style={{ marginTop: '0.5rem' }}>No registered events yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {registrations.filter(r => ['confirmed', 'pending'].includes(r.status)).map((reg) => (
            <div key={reg._id} style={{
              background: '#fff', borderRadius: '12px', padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', border: '1px solid #f1f5f9'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{reg.event?.title || 'Untitled'}</h3>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <span><FiClock style={{ marginRight: '0.2rem' }} />{reg.event?.startDate ? format(new Date(reg.event.startDate), 'MMM d, yyyy · h:mm a') : 'TBA'}</span>
                  <span><FiMapPin style={{ marginRight: '0.2rem' }} />{reg.event?.venue?.name || 'TBA'}</span>
                </div>
              </div>
              <span style={{
                padding: '0.3rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600,
                background: reg.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                color: reg.status === 'confirmed' ? '#166534' : '#92400e'
              }}>{reg.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Scheduled Sessions */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <FiBookmark style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> My Scheduled Sessions
      </h2>
      {schedule.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
          <FiBookmark size={32} /><p style={{ marginTop: '0.5rem' }}>No sessions scheduled yet. Browse events to add sessions.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {schedule.map((item, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '12px', padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                    {item.session?.title || 'Session'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
                    Event: {item.session?.event?.title || item.event?.title || ''}
                  </p>
                  {item.session?.startTime && (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                      <FiClock style={{ marginRight: '0.2rem' }} />
                      {format(new Date(item.session.startTime), 'MMM d · h:mm a')}
                      {item.session.endTime && ` - ${format(new Date(item.session.endTime), 'h:mm a')}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeSession(item.session?._id)}
                  style={{
                    background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px',
                    padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.78rem'
                  }}
                >
                  <FiTrash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePlanner;
