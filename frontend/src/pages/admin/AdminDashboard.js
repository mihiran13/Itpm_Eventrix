import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FiUsers, FiCalendar, FiActivity, FiTrendingUp
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './Admin.css';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const monthlyEventsData = data?.monthlyEvents
    || (data?.registrationsByMonth || []).slice().reverse().map((item) => ({
      month: `${item?._id?.month || ''}/${item?._id?.year || ''}`,
      count: item?.count || 0
    }));

  const categoryStatsData = data?.categoryStats
    || (data?.eventsByCategory || []).map((item) => ({
      name: item?._id || 'Unknown',
      count: item?.count || 0
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.getAdmin();
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Platform overview and analytics</p>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-icon users"><FiUsers /></div>
            <div>
              <span className="admin-stat-value">{data?.stats?.totalUsers || 0}</span>
              <span className="admin-stat-label">Total Users</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon events"><FiCalendar /></div>
            <div>
              <span className="admin-stat-value">{data?.stats?.totalEvents || 0}</span>
              <span className="admin-stat-label">Total Events</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon registrations"><FiActivity /></div>
            <div>
              <span className="admin-stat-value">{data?.stats?.totalRegistrations || 0}</span>
              <span className="admin-stat-label">Registrations</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon revenue"><FiTrendingUp /></div>
            <div>
              <span className="admin-stat-value">${data?.stats?.totalRevenue?.toFixed(2) || '0.00'}</span>
              <span className="admin-stat-label">Total Revenue</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="admin-charts">
          <div className="admin-chart-card">
            <h3>Monthly Events</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyEventsData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="admin-chart-card">
            <h3>Events by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStatsData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(categoryStatsData || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
