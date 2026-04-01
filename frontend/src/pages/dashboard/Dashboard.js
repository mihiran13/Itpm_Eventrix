import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import {
  FiCalendar, FiUsers, FiBookmark, FiTrendingUp,
  FiPlus, FiArrowRight
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboard = async () => {
    try {
      const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
      const res = isOrganizer
        ? await dashboardAPI.getOrganizer()
        : await dashboardAPI.getUser();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.firstName}!</h1>
            <p>{isOrganizer ? 'Manage your events and track performance' : 'Your upcoming events and activity'}</p>
          </div>
          {isOrganizer && (
            <Link to="/events/create" className="btn btn-primary"><FiPlus /> Create Event</Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#ede9fe' }}><FiCalendar style={{ color: '#7c3aed' }} /></div>
            <div>
              <span className="dash-stat-value">{data?.stats?.totalEvents || data?.stats?.upcomingEvents || 0}</span>
              <span className="dash-stat-label">{isOrganizer ? 'Total Events' : 'Upcoming Events'}</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#dbeafe' }}><FiUsers style={{ color: '#2563eb' }} /></div>
            <div>
              <span className="dash-stat-value">{data?.stats?.totalRegistrations || 0}</span>
              <span className="dash-stat-label">Registrations</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#dcfce7' }}><FiTrendingUp style={{ color: '#16a34a' }} /></div>
            <div>
              <span className="dash-stat-value">{data?.stats?.totalAttendees || data?.stats?.attendedEvents || 0}</span>
              <span className="dash-stat-label">{isOrganizer ? 'Total Attendees' : 'Events Attended'}</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#fef3c7' }}><FiBookmark style={{ color: '#d97706' }} /></div>
            <div>
              <span className="dash-stat-value">{data?.stats?.savedEvents || data?.stats?.publishedEvents || 0}</span>
              <span className="dash-stat-label">{isOrganizer ? 'Published' : 'Saved Events'}</span>
            </div>
          </div>
        </div>

        {/* Chart - Organizer Only */}
        {isOrganizer && data?.monthlyStats?.length > 0 && (
          <div className="dashboard-chart">
            <h2>Registration Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#eef2ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="dashboard-grid">
          {/* Upcoming / Recent Events */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>{isOrganizer ? 'Popular Events' : 'Upcoming Events'}</h2>
              <Link to={isOrganizer ? '/my-events' : '/events'} className="view-all"><FiArrowRight /></Link>
            </div>
            <div className="dash-event-list">
              {(data?.upcomingEvents || data?.popularEvents || []).slice(0, 5).map((event) => (
                <Link to={`/events/${event._id}`} key={event._id} className="dash-event-item">
                  <div className="dash-event-img">
                    {event.coverImage ? <img src={event.coverImage} alt="" /> : <FiCalendar />}
                  </div>
                  <div className="dash-event-info">
                    <h4>{event.title}</h4>
                    <span>{event.startDate ? format(new Date(event.startDate), 'MMM d, yyyy') : ''}</span>
                  </div>
                  <div className="dash-event-stat">
                    <FiUsers /> {event.registeredCount || 0}
                  </div>
                </Link>
              ))}
              {(!data?.upcomingEvents?.length && !data?.popularEvents?.length) && (
                <p className="empty-text">No events to display</p>
              )}
            </div>
          </div>

          {/* Recent Registrations / Notifications */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>{isOrganizer ? 'Recent Registrations' : 'Recent Notifications'}</h2>
            </div>
            <div className="dash-activity-list">
              {isOrganizer ? (
                (data?.recentRegistrations || []).slice(0, 5).map((reg) => (
                  <div key={reg._id} className="activity-item">
                    <div className="activity-avatar">
                      {reg.user?.firstName?.[0] || 'U'}
                    </div>
                    <div className="activity-info">
                      <span className="activity-text">
                        <strong>{reg.user?.firstName} {reg.user?.lastName}</strong> registered for <strong>{reg.event?.title}</strong>
                      </span>
                      <span className="activity-time">{format(new Date(reg.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                ))
              ) : (
                (data?.recentNotifications || []).slice(0, 5).map((notif) => (
                  <div key={notif._id} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-info">
                      <span className="activity-text">{notif.message}</span>
                      <span className="activity-time">{format(new Date(notif.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                ))
              )}
              {(!data?.recentRegistrations?.length && !data?.recentNotifications?.length) && (
                <p className="empty-text">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
