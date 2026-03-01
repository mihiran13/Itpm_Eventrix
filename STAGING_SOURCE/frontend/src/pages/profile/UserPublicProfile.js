import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, eventsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { FiUser, FiMail, FiCalendar, FiMapPin, FiArrowLeft } from 'react-icons/fi';

const UserPublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersAPI.getPublicProfile(id);
        setProfile(res.data.data || res.data.user);

        // If organizer, fetch their events
        if (res.data.data?.role === 'organizer' || res.data.user?.role === 'organizer') {
          try {
            const evRes = await eventsAPI.getAll({ organizer: id, limit: 6 });
            setEvents(evRes.data.data || []);
          } catch (e) { /* ignore */ }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
        <FiUser size={48} />
        <h2 style={{ marginTop: '1rem' }}>User not found</h2>
        <Link to="/feed" style={{ color: '#6366f1', marginTop: '0.5rem', display: 'inline-block' }}>
          <FiArrowLeft /> Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        borderRadius: '16px',
        padding: '2.5rem',
        color: '#fff',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
          margin: '0 auto 1rem', border: '3px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.2)'
        }}>
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <FiUser size={32} />
          )}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {profile.firstName} {profile.lastName}
        </h1>
        <span style={{
          padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.78rem',
          fontWeight: 600, textTransform: 'capitalize',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)'
        }}>
          {profile.role}
        </span>
        {profile.bio && (
          <p style={{ marginTop: '0.75rem', opacity: 0.9, fontSize: '0.9rem', maxWidth: '400px', margin: '0.75rem auto 0' }}>
            {profile.bio}
          </p>
        )}
      </div>

      {/* Info */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem'
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Profile Info</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
            <FiMail /> {profile.email}
          </div>
          {profile.createdAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
              <FiCalendar /> Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}
            </div>
          )}
        </div>
      </div>

      {/* Organizer Events */}
      {events.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Events Organized</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {events.map((event) => (
              <Link to={`/events/${event._id}`} key={event._id} style={{
                display: 'flex', gap: '1rem', padding: '0.75rem', borderRadius: '10px',
                background: '#f8fafc', textDecoration: 'none', transition: 'background 0.2s'
              }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#e2e8f0' }}>
                  {event.coverImage ? (
                    <img src={event.coverImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}><FiCalendar /></div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.2rem' }}>{event.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FiCalendar size={12} /> {event.startDate ? format(new Date(event.startDate), 'MMM d, yyyy') : 'TBA'}
                    {event.venue?.name && <><FiMapPin size={12} style={{ marginLeft: '0.5rem' }} /> {event.venue.name}</>}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPublicProfile;
