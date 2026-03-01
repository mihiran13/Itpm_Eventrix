import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { registrationsAPI, eventsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { FiUser, FiMail, FiCheck, FiSearch, FiCamera, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Scanner } from '@yudiel/react-qr-scanner';
import './Registrations.css';

const EventRegistrations = () => {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({});
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      const [regRes, eventRes] = await Promise.all([
        registrationsAPI.getEventRegistrations(eventId),
        eventsAPI.getById(eventId)
      ]);
      setRegistrations(regRes.data.registrations || regRes.data.data || []);
      setStats(regRes.data.statusCounts || regRes.data.stats || {});
      setEvent(eventRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (regId) => {
    try {
      const res = await registrationsAPI.confirm(regId);
      toast.success(res.data.message || 'Registration confirmed!');
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm registration');
    }
  };

  const handleCheckIn = async (regId) => {
    try {
      await registrationsAPI.checkIn(regId);
      toast.success('Attendee checked in!');
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const filtered = registrations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = !search || 
      r.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.registrationNumber?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="registrations-page">
      <div className="container">
        <div className="page-header">
          <h1>Event Registrations</h1>
          {event && <h2 style={{ fontSize: '1.1rem', color: '#6366f1', marginTop: '0.5rem' }}>{event.title}</h2>}
          <p>Manage attendees for your event</p>
        </div>

        {/* Stats */}
        <div className="reg-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total || registrations.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card confirmed">
            <span className="stat-value">{stats.confirmed || 0}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-value">{stats.pending || 0}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card attended">
            <span className="stat-value">{stats.attended || 0}</span>
            <span className="stat-label">Attended</span>
          </div>
        </div>

        {/* Filters */}
        <div className="reg-filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowScanner(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#4f46e5', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <FiCamera size={18} /> Scan Ticket
          </button>
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name, email, or registration number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="attended">Attended</option>
            <option value="waitlisted">Waitlisted</option>
          </select>
        </div>

        {/* Table */}
        <div className="reg-table-wrapper">
          <table className="reg-table">
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Reg #</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg._id}>
                  <td>
                    <div className="attendee-info">
                      <div className="attendee-avatar">
                        {reg.user?.avatar ? <img src={reg.user.avatar} alt="" /> : <FiUser />}
                      </div>
                      <div>
                        <span className="attendee-name">{reg.user?.firstName} {reg.user?.lastName}</span>
                        <span className="attendee-email"><FiMail /> {reg.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="reg-num">{reg.registrationNumber}</span></td>
                  <td>{format(new Date(reg.createdAt), 'MMM d, yyyy')}</td>
                  <td>
                    <span className={`status-badge ${reg.status}`}>{reg.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {reg.status === 'pending' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleConfirm(reg._id)}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: '#10b981' }}
                        >
                          <FiCheck /> Confirm
                        </button>
                      )}
                      {reg.status === 'confirmed' && !reg.checkedIn && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleCheckIn(reg._id)}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          <FiCheck /> Check In
                        </button>
                      )}
                      {reg.checkedIn && <span className="checked-in-label">✓ Checked In</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="no-results" style={{ padding: '2rem' }}>
              <p>No registrations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowScanner(false)}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Scan Attendee QR</h3>
              <button onClick={() => setShowScanner(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><FiXCircle size={24} /></button>
            </div>
            
            <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Scanner 
                onScan={(result) => {
                  if (result && result.length > 0) {
                    handleCheckIn(result[0].rawValue);
                    setShowScanner(false);
                  }
                }}
                components={{ audio: false }}
              />
            </div>
            <p style={{ marginTop: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
              Point your camera at the student's E-Ticket
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventRegistrations;
