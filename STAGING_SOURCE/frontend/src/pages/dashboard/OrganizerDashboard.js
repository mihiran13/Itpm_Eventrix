import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import {
  FiCalendar, FiUsers, FiTrendingUp, FiPlus, FiArrowRight,
  FiDollarSign, FiBarChart2, FiEye
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import './Dashboard.css';

const OrganizerDashboard = () => {
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
      const res = await dashboardAPI.getOrganizer();
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
            <p>Manage your events and track performance</p>
          </div>
          <Link to="/events/create" className="btn btn-primary">
            <FiPlus /> Create New Event
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#ede9fe' }}>
              <FiCalendar style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <span className="dash-stat-value">{data?.stats?.totalEvents || 0}</span>
              <span className="dash-stat-label">Total Events</span>
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
              <span className="dash-stat-value">{data?.stats?.upcomingEvents || 0}</span>
              <span className="dash-stat-label">Upcoming Events</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: '#fef3c7' }}>
              <FiDollarSign style={{ color: '#d97706' }} />
            </div>
            <div>
              <span className="dash-stat-value">
                ${data?.stats?.totalRevenue?.toLocaleString() || 0}
              </span>
              <span className="dash-stat-label">Total Revenue</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-charts-grid">
          {/* Registration Trends */}
          {data?.monthlyStats && data.monthlyStats.length > 0 && (
            <div className="dashboard-chart">
              <h2>Registration Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyStats.map(s => ({ ...s, name: `${s._id.month}/${s._id.year}` }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#7c3aed"
                    fill="#ede9fe"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Popular Events */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Your Popular Events</h2>
              <Link to="/my-events" className="view-all">
                View All <FiArrowRight />
              </Link>
            </div>

            {data?.popularEvents && data.popularEvents.length > 0 ? (
              <div className="events-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Date</th>
                      <th>Registrations</th>
                      <th>Views</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.popularEvents.map((event) => (
                      <tr key={event._id}>
                        <td>
                          <Link to={`/events/${event._id}`} className="event-link">
                            {event.title}
                          </Link>
                        </td>
                        <td>{format(new Date(event.startDate), 'MMM dd, yyyy')}</td>
                        <td>
                          <span className="badge badge-blue">
                            {event.registeredCount}/{event.capacity}
                          </span>
                        </td>
                        <td>
                          <span>
                            <FiEye size={14} /> {event.viewCount || 0}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${event.status}`}>
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't created any events yet</p>
                <Link to="/events/create" className="btn btn-outline">
                  Create Your First Event
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Registrations</h2>
            <span className="text-muted">Last 10 registrations</span>
          </div>

          {data?.recentRegistrations && data.recentRegistrations.length > 0 ? (
            <div className="registrations-list">
              {data.recentRegistrations.map((reg) => (
                <div key={reg._id} className="registration-item">
                  {reg.user.avatar && (
                    <img
                      src={reg.user.avatar}
                      alt={reg.user.firstName}
                      className="user-avatar"
                    />
                  )}
                  <div className="registration-info">
                    <h4>
                      {reg.user.firstName} {reg.user.lastName}
                    </h4>
                    <p className="text-muted">{reg.user.email}</p>
                    <p className="text-muted small">
                      Registered for {reg.event.title}
                    </p>
                  </div>
                  <span className="registration-date">
                    {format(new Date(reg.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No registrations yet</p>
            </div>
          )}
        </div>

        {/* Event Status Summary */}
        <div className="dashboard-summary">
          <div className="summary-card">
            <h3>Event Status</h3>
            <div className="status-list">
              <div className="status-item">
                <span>Published: </span>
                <strong>{data?.stats?.publishedEvents || 0}</strong>
              </div>
              <div className="status-item">
                <span>Completed: </span>
                <strong>{data?.stats?.completedEvents || 0}</strong>
              </div>
              <div className="status-item">
                <span>Cancelled: </span>
                <strong>{data?.stats?.cancelledEvents || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
