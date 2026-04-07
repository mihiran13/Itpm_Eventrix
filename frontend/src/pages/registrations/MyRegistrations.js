import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin, FiClock, FiXCircle, FiCheckCircle, FiDownload, FiStar, FiCreditCard } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import CertificateTemplate from '../../components/registrations/CertificateTemplate';
import toast from 'react-hot-toast';
import './Registrations.css';

const MyRegistrations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [feedbackForm, setFeedbackForm] = useState({ id: null, rating: 5, comment: '' });
  const [qrModalTicket, setQrModalTicket] = useState(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await registrationsAPI.getMine();
      setRegistrations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;
    try {
      await registrationsAPI.cancel(id);
      toast.success('Registration cancelled');
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleDownloadTicket = async (regId) => {
    try {
      const res = await registrationsAPI.getETicket(regId);
      const t = res.data.ticketData;
      const ticketContent = `
===========================================
        EVENTRIX E-TICKET
===========================================

Event: ${t.eventTitle}
Date: ${t.eventDate ? new Date(t.eventDate).toLocaleDateString() : 'TBA'}
Venue: ${t.eventVenue?.name || 'Online'}
Faculty: ${t.faculty || 'All'}

-------------------------------------------
Attendee: ${t.attendeeName}
Email: ${t.attendeeEmail}
Registration #: ${t.registrationNumber}
Status: ${t.status}
Payment: ${t.paymentStatus} ($${t.paymentAmount || 0})

-------------------------------------------
QR Data: ${t.qrData}
===========================================
      `;
      const blob = new Blob([ticketContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${t.registrationNumber}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('E-Ticket downloaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download ticket');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await registrationsAPI.submitFeedback(feedbackForm.id, { rating: feedbackForm.rating, comment: feedbackForm.comment });
      toast.success('Feedback submitted!');
      setFeedbackForm({ id: null, rating: 5, comment: '' });
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const handleDownloadCertificate = async (reg) => {
    if (reg.certificateIssued) {
      toast.error('This certificate has already been issued.');
      return;
    }

    setDownloadingCertificate(reg);
    const toastId = toast.loading('Generating your official certificate...');
    
    setTimeout(async () => {
      try {
        const element = document.getElementById('certificate-to-print');
        if (!element) {
          toast.error('Template rendering error. Please try again.', { id: toastId });
          setDownloadingCertificate(null);
          return;
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1000, 700]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, 1000, 700);
        pdf.save(`Certificate-${reg.registrationNumber}.pdf`);
        
        // Mark as issued in the backend
        await registrationsAPI.issueCertificate(reg._id);
        
        // Update local state immediately for instant UI feedback
        setRegistrations(prev => prev.map(r => 
          r._id === reg._id ? { ...r, certificateIssued: true } : r
        ));
        
        toast.success('Certificate issued and downloaded!', { id: toastId });
      } catch (err) {
        console.error('Certificate Issue Error:', err);
        toast.error(err.response?.data?.message || 'Download worked, but failed to lock certificate on server.', { id: toastId });
      } finally {
        setDownloadingCertificate(null);
      }
    }, 800);
  };

  const filtered = registrations.filter((r) => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'attended', label: 'Attended' }
  ];

  const getStatusBadge = (status) => {
    const map = {
      confirmed: { bg: '#dcfce7', color: '#166534' },
      pending: { bg: '#fef3c7', color: '#92400e' },
      cancelled: { bg: '#fef2f2', color: '#991b1b' },
      attended: { bg: '#dbeafe', color: '#1e40af' },
      waitlisted: { bg: '#faf5ff', color: '#6b21a8' }
    };
    const style = map[status] || { bg: '#f3f4f6', color: '#374151' };
    return <span className="status-badge" style={{ background: style.bg, color: style.color }}>{status}</span>;
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="registrations-page">
      <div className="container">
        <div className="page-header">
          <h1>My Registrations</h1>
          <p>Track your event registrations</p>
        </div>

        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="no-results">
            <FiCalendar size={48} />
            <h3>No Registrations</h3>
            <p>You haven't registered for any events yet.</p>
            <Link to="/events" className="btn btn-primary">Browse Events</Link>
          </div>
        ) : (
          <div className="registration-list">
            {filtered.map((reg) => (
              <div key={reg._id} className="registration-card">
                <div className="reg-event-image">
                  {reg.event?.coverImage ? (
                    <img src={reg.event.coverImage} alt={reg.event.title} />
                  ) : (
                    <div className="reg-placeholder"><FiCalendar /></div>
                  )}
                </div>

                <div className="reg-details">
                  <div className="reg-header">
                    <Link to={`/events/${reg.event?._id}`} className="reg-event-title">
                      {reg.event?.title}
                    </Link>
                    {getStatusBadge(reg.status)}
                  </div>

                  <div className="reg-meta">
                    <span><FiCalendar /> {reg.event?.startDate ? format(new Date(reg.event.startDate), 'MMM d, yyyy') : 'TBA'}</span>
                    <span><FiClock /> {reg.event?.startDate ? format(new Date(reg.event.startDate), 'h:mm a') : ''}</span>
                    <span><FiMapPin /> {reg.event?.venue?.name || 'Virtual'}</span>
                  </div>

                  <div className="reg-info">
                    <span className="reg-number">#{reg.registrationNumber}</span>
                    <span className="reg-date">Registered: {format(new Date(reg.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <div className="reg-actions">
                  {(reg.status === 'confirmed' || reg.status === 'pending') && (
                    <button className="btn-cancel" onClick={() => handleCancel(reg._id)}>
                      <FiXCircle /> Cancel
                    </button>
                  )}
                  {reg.status === 'confirmed' && (
                    <button className="btn-review" onClick={() => setQrModalTicket({ eventTitle: reg.event?.title, id: reg._id })}>
                      <FiDownload /> E-Ticket
                    </button>
                  )}
                  {reg.status === 'confirmed' && reg.paymentStatus !== 'paid' && !reg.event?.isFree && (
                    <button className="btn-review" onClick={() => navigate(`/payment/${reg._id}`, { state: { eventTitle: reg.event?.title, amount: reg.paymentAmount } })}>
                      <FiCreditCard /> Pay
                    </button>
                  )}
                  {reg.status === 'attended' && !reg.feedback?.submittedAt && (
                    feedbackForm.id === reg._id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Rating:</label>
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setFeedbackForm({...feedbackForm, rating: n})} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: n <= feedbackForm.rating ? '#f59e0b' : '#d1d5db' }}>
                              <FiStar fill={n <= feedbackForm.rating ? '#f59e0b' : 'none'} />
                            </button>
                          ))}
                        </div>
                        <textarea value={feedbackForm.comment} onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})} placeholder="Your feedback..." rows={2} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={handleSubmitFeedback} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Submit</button>
                          <button onClick={() => setFeedbackForm({ id: null, rating: 5, comment: '' })} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-review" onClick={() => setFeedbackForm({ ...feedbackForm, id: reg._id })}>
                        <FiCheckCircle /> Leave Review
                      </button>
                    )
                  )}
                  {reg.status === 'attended' && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => !reg.certificateIssued && handleDownloadCertificate(reg)}
                      style={{ 
                        background: reg.certificateIssued ? '#4b5563' : '#1a237e', 
                        marginTop: '0.5rem', 
                        width: '100%', 
                        color: '#fff',
                        cursor: reg.certificateIssued ? 'default' : 'pointer',
                        opacity: reg.certificateIssued ? 0.8 : 1
                      }}
                      disabled={downloadingCertificate?.id === reg._id}
                    >
                      {reg.certificateIssued ? '🎖️ Certificate Issued' : '🎖️ Download Certificate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Ticket Modal */}
      {qrModalTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setQrModalTicket(null)}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>E-Ticket</h3>
              <button onClick={() => setQrModalTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><FiXCircle size={24} /></button>
            </div>
            
            <h4 style={{ margin: '0 0 1.5rem 0', color: '#4f46e5' }}>{qrModalTicket.eventTitle}</h4>
            
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', display: 'inline-block' }}>
              <QRCodeSVG value={qrModalTicket.id} size={200} />
            </div>
            
            <p style={{ marginTop: '1.5rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>
              Show this QR code at the entrance
            </p>

            <button 
              onClick={() => handleDownloadTicket(qrModalTicket.id)}
              style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '6px', color: '#374151', cursor: 'pointer', fontWeight: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiDownload /> Download Text Version
            </button>
          </div>
        </div>
      )}

      {/* Hidden Certificate Renderer for Background Processing */}
      {downloadingCertificate && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <CertificateTemplate 
            attendeeName={`${user?.firstName} ${user?.lastName}`}
            eventTitle={downloadingCertificate.event?.title}
            completionDate={downloadingCertificate.event?.startDate || new Date()}
            regNumber={downloadingCertificate.registrationNumber}
          />
        </div>
      )}

    </div>
  );
};

export default MyRegistrations;
