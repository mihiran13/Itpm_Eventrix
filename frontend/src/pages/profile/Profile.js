import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI, registrationsAPI } from '../../services/api';
import { FiEdit2, FiCalendar, FiMail, FiPhone, FiSettings } from 'react-icons/fi';
import { format } from 'date-fns';
import EventCard from '../../components/common/EventCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ eventsCreated: 0, eventsRegistered: 0, eventsSaved: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isOrgOrAdmin = user?.role === 'organizer' || user?.role === 'admin';
        const promises = [registrationsAPI.getMyRegistrations()];
        if (isOrgOrAdmin) {
          promises.push(eventsAPI.getMyEvents());
        }
        const results = await Promise.all(promises);
        const regsRes = results[0];
        const myEventsRes = isOrgOrAdmin ? results[1] : null;

        setStats({
          eventsCreated: myEventsRes ? (myEventsRes.data.data?.length || myEventsRes.data.events?.length || 0) : 0,
          eventsRegistered: regsRes.data.data?.length || regsRes.data.registrations?.length || 0,
          eventsSaved: user?.savedEvents?.length || 0
        });
        setRecentEvents(myEventsRes ? (myEventsRes.data.data || myEventsRes.data.events || []).slice(0, 3) : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-cover">
              <div className="profile-avatar-lg">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.firstName} />
                ) : (
                  <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                )}
              </div>
            </div>
            <div className="profile-info">
              <h1>{user?.firstName} {user?.lastName}</h1>
              <span className="profile-role">{user?.role}</span>
              
              <div className="profile-details">
                <div className="detail-item"><FiMail /> {user?.email}</div>
                {user?.phone && <div className="detail-item"><FiPhone /> {user.phone}</div>}
                <div className="detail-item"><FiCalendar /> Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'N/A'}</div>
              </div>

              <div className="profile-actions">
                <Link to="/profile/edit" className="btn btn-primary"><FiEdit2 /> Edit Profile</Link>
                <Link to="/profile/change-password" className="btn btn-secondary"><FiSettings /> Change Password</Link>
              </div>
            </div>

            {/* Stats */}
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-number">{stats.eventsCreated}</span>
                <span className="stat-text">Events Created</span>
              </div>
              <div className="profile-stat">
                <span className="stat-number">{stats.eventsRegistered}</span>
                <span className="stat-text">Registered</span>
              </div>
              <div className="profile-stat">
                <span className="stat-number">{stats.eventsSaved}</span>
                <span className="stat-text">Saved</span>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="profile-content">
            <div className="section-title-row">
              <h2>{(user?.role === 'organizer' || user?.role === 'admin') ? 'My Recent Events' : 'My Activity'}</h2>
              <Link to={(user?.role === 'organizer' || user?.role === 'admin') ? '/my-events' : '/my-registrations'} className="view-all-link">View All</Link>
            </div>
            {recentEvents.length > 0 ? (
              <div className="profile-events-grid">
                {recentEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiCalendar size={40} />
                <p>No events created yet</p>
                {(user?.role === 'organizer' || user?.role === 'admin') ? (
                  <Link to="/events/create" className="btn btn-primary">Create Event</Link>
                ) : (
                  <Link to="/events" className="btn btn-primary">Browse Events</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
