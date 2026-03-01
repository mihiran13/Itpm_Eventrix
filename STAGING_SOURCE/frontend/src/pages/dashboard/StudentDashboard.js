import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import {
  FiCalendar, FiUsers, FiBookmark, FiTrendingUp,
  FiArrowRight, FiClock, FiMapPin
} from 'react-icons/fi';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const res = await dashboardAPI.getUser();
      setData(res.data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Unable to Load Dashboard</h2>
            <p>{error}</p>
            <button onClick={fetchDashboard} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.firstName}!</h1>
            <p>Track your event registrations and discover new events</p>
          </div>
          <Link to="/events" className="btn btn-primary">
            <FiArrowRight /> Explore Events
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#ede9fe' }}>
              <FiCalendar style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <span className="dash-stat-value">
                {data?.stats?.upcomingRegistrations || 0}
              </span>
              <span className="dash-stat-label">Upcoming Events</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#dbeafe' }}>
              <FiUsers style={{ color: '#2563eb' }} />
            </div>
            <div>
              <span className="dash-stat-value">
                {data?.stats?.totalRegistrations || 0}
              </span>
              <span className="dash-stat-label">Total Registrations</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#dcfce7' }}>
              <FiTrendingUp style={{ color: '#16a34a' }} />
            </div>
            <div>
              <span className="dash-stat-value">
                {data?.stats?.pastRegistrations || 0}
              </span>
              <span className="dash-stat-label">Events Attended</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#fef3c7' }}>
              <FiBookmark style={{ color: '#d97706' }} />
            </div>
            <div>
              <span className="dash-stat-value">
                {data?.stats?.savedEventsCount || 0}
              </span>
              <span className="dash-stat-label">Saved Events</span>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Your Upcoming Events</h2>
            <Link to="/my-registrations" className="view-all">
              View All <FiArrowRight />
            </Link>
          </div>

          {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
            <div className="events-list">
              {data.upcomingEvents.map((registration) => (
                <Link
                  key={registration._id}
                  to={`/events/${registration.event._id}`}
                  className="event-list-item"
                >
                  {registration.event.coverImage && (
                    <div className="event-list-img">
                      <img src={registration.event.coverImage} alt={registration.event.title} />
                    </div>
                  )}
                  <div className="event-list-content">
                    <h3>{registration.event.title}</h3>
                    <div className="event-list-meta">
                      <span className="event-date">
                        <FiClock size={14} />
                        {format(new Date(registration.event.startDate), 'MMM dd, yyyy hh:mm a')}
                      </span>
                      {registration.event.venue?.name && (
                        <span className="event-venue">
                          <FiMapPin size={14} />
                          {registration.event.venue.name}
                        </span>
                      )}
                      <span className={`event-type ${registration.event.eventType}`}>
                        {registration.event.eventType}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No upcoming events registered yet</p>
              <Link to="/events" className="btn btn-outline">
                Browse Events
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="dashboard-quick-links">
          <h2>Quick Access</h2>
          <div className="links-grid">
            <Link to="/my-registrations" className="quick-link">
              <FiCalendar />
              <span>My Registrations</span>
            </Link>
            <Link to="/saved-events" className="quick-link">
              <FiBookmark />
              <span>Saved Events</span>
            </Link>
            <Link to="/notifications" className="quick-link">
              <FiUsers />
              <span>Notifications</span>
            </Link>
            <Link to="/profile" className="quick-link">
              <FiMapPin />
              <span>My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
