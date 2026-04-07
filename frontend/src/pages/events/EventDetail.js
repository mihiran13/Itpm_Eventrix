import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsAPI, registrationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CountdownTimer from '../../components/common/CountdownTimer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import {
  FiCalendar, FiMapPin, FiUsers, FiDollarSign,
  FiShare2, FiBookmark, FiEdit2, FiArrowLeft, FiGlobe,
  FiUser, FiStar, FiTag, FiChevronDown, FiChevronUp, FiDownload,
  FiClock, FiClipboard, FiMessageSquare, FiTrash2, FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Events.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [showAgenda, setShowAgenda] = useState(false);
  const [showFAQs, setShowFAQs] = useState({});

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getById(id);
      setEvent(res.data.data || res.data.event);
      setIsRegistered(res.data.isRegistered);
      setRegistrationId(res.data.registrationId);
      if (user) {
        setIsSaved(user.savedEvents?.includes((res.data.data || res.data.event)._id));
      }
    } catch (err) {
      toast.error('Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    try {
      const res = await registrationsAPI.register(event._id);
      const registration = res.data.registration;

      // If it's a paid event and the registration is confirmed (not waitlisted), navigate to payment
      if (!event.isFree && registration && registration.paymentStatus !== 'free' && registration.paymentStatus !== 'paid' && registration.status !== 'waitlisted') {
        toast.success('Registration successful! Redirecting to payment...');
        navigate(`/payment/${registration._id}`, {
          state: {
            eventTitle: event.title,
            amount: registration.paymentAmount || event.ticketPrice || 0
          }
        });
      } else {
        toast.success(res.data.message || 'Successfully registered for the event!');
        fetchEvent();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await eventsAPI.toggleSave(event._id);
      setIsSaved(res.data.saved);
      toast.success(res.data.saved ? 'Event saved!' : 'Event removed from saved');
    } catch (err) {
      toast.error('Failed to save event');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!event) return null;

  const isOrganizer = user && event.organizer?._id === user._id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOrganizer || isAdmin;
  const isUpcoming = new Date(event.startDate) > new Date();
  const isFull = event.capacity && event.registeredCount >= event.capacity;

  const handleDelete = async () => {
    if (window.confirm('Are you strictly sure you want to permanently delete this event? This action cannot be undone.')) {
      setLoading(true);
      try {
        await eventsAPI.deleteEvent(event._id);
        toast.success('Event permanently deleted');
        navigate(isAdmin ? '/admin/dashboard' : '/my-events');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete event');
        setLoading(false);
      }
    }
  };

  return (
    <div className="event-detail-page">
      {/* Cover Image */}
      <div className="event-cover" style={{ backgroundImage: event.coverImage ? `url(${event.coverImage})` : undefined }}>
        <div className="cover-overlay">
          <div className="container">
            <button onClick={() => navigate(-1)} className="back-btn-detail">
              <FiArrowLeft /> Back
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="event-detail-layout">
          {/* Main Content */}
          <div className="event-detail-main">
            {/* Title Section */}
            <div className="event-detail-header">
              <div className="event-meta-badges">
                {event.category && (
                  <span className="badge badge-category">{event.category.name}</span>
                )}
                <span className={`badge badge-type ${event.eventType}`}>{event.eventType}</span>
                {event.faculty && event.faculty !== 'All' && (
                  <span className="badge badge-category" style={{ background: '#ec4899', color: '#fff' }}>{event.faculty}</span>
                )}
                {event.status !== 'published' && (
                  <span className={`badge badge-status ${event.status}`}>{event.status}</span>
                )}
              </div>
              <h1>{event.title}</h1>
              <div className="event-organizer-info">
                <div className="organizer-avatar">
                  {event.organizer?.avatar ? (
                    <img src={event.organizer.avatar} alt={event.organizer.firstName} />
                  ) : (
                    <FiUser />
                  )}
                </div>
                <div>
                  <span className="organized-by">Organized by</span>
                  <Link to={`/users/${event.organizer?._id}`} className="organizer-name">
                    {event.organizer?.firstName} {event.organizer?.lastName}
                  </Link>
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="detail-section">
              <h2>About This Event</h2>
              <div className="event-description" dangerouslySetInnerHTML={{ __html: event.description?.replace(/\n/g, '<br/>') }} />
            </section>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="event-tags">
                {event.tags.map((tag, i) => (
                  <span key={i} className="tag"><FiTag /> {tag}</span>
                ))}
              </div>
            )}

            {/* Speakers */}
            {event.speakers?.length > 0 && (
              <section className="detail-section">
                <h2>Speakers</h2>
                <div className="speakers-grid">
                  {event.speakers.map((speaker, i) => (
                    <div key={i} className="speaker-card">
                      <div className="speaker-avatar">
                        {speaker.image ? <img src={speaker.image} alt={speaker.name} /> : <FiUser />}
                      </div>
                      <h4>{speaker.name}</h4>
                      <p className="speaker-title">{speaker.title}</p>
                      {speaker.bio && <p className="speaker-bio">{speaker.bio}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Agenda */}
            {event.agenda?.length > 0 && (
              <section className="detail-section">
                <button className="section-toggle" onClick={() => setShowAgenda(!showAgenda)}>
                  <h2>Event Agenda</h2>
                  {showAgenda ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {showAgenda && (
                  <div className="agenda-list">
                    {event.agenda.map((item, i) => (
                      <div key={i} className="agenda-item">
                        <span className="agenda-time">{item.time}</span>
                        <div className="agenda-content">
                          <h4>{item.title}</h4>
                          {item.description && <p>{item.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* FAQs */}
            {event.faqs?.length > 0 && (
              <section className="detail-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                  {event.faqs.map((faq, i) => (
                    <div key={i} className="faq-item">
                      <button className="faq-question" onClick={() => setShowFAQs({ ...showFAQs, [i]: !showFAQs[i] })}>
                        <span>{faq.question}</span>
                        {showFAQs[i] ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                      {showFAQs[i] && <p className="faq-answer">{faq.answer}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {event.averageRating > 0 && (
              <section className="detail-section">
                <h2>Reviews</h2>
                <div className="rating-summary">
                  <FiStar className="star-icon" />
                  <span className="rating-value">{event.averageRating?.toFixed(1)}</span>
                  <span className="rating-count">({event.reviewCount || 0} reviews)</span>
                </div>
              </section>
            )}

            {/* Event Navigation Links */}
            <section className="detail-section">
              <h2>Event Resources</h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to={`/events/${event._id}/sessions`} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiClock /> Sessions
                </Link>
                <Link to={`/events/${event._id}/announcements`} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiMessageSquare /> Announcements
                </Link>
                <Link to={`/events/${event._id}/surveys`} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiClipboard /> Surveys
                </Link>
                <button onClick={() => eventsAPI.exportCalendar(event._id)} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiDownload /> Add to Calendar
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="event-detail-sidebar">
            <div className="sidebar-card sticky">
              {/* Date & Time */}
              <div className="sidebar-section">
                <h3><FiCalendar /> Date & Time</h3>
                <p className="detail-value">
                  {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="detail-sub">
                  {format(new Date(event.startDate), 'h:mm a')}
                  {event.endDate && ` - ${format(new Date(event.endDate), 'h:mm a')}`}
                </p>
              </div>

              {/* Location */}
              <div className="sidebar-section">
                <h3><FiMapPin /> Location</h3>
                {event.eventType === 'virtual' ? (
                  <p className="detail-value"><FiGlobe /> Online Event</p>
                ) : (
                  <>
                    <p className="detail-value">{event.venue?.name || 'TBA'}</p>
                    {event.venue?.address && (
                      <p className="detail-sub">
                        {typeof event.venue.address === 'object' ? event.venue.address.street : event.venue.address}, {typeof event.venue.address === 'object' ? event.venue.address.city : event.venue.city}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Capacity */}
              <div className="sidebar-section">
                <h3><FiUsers /> Capacity</h3>
                <p className="detail-value">
                  {event.registeredCount || 0} / {event.capacity || '∞'} registered
                </p>
                {event.capacity && (
                  <div className="capacity-bar">
                    <div
                      className="capacity-fill"
                      style={{ width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="sidebar-section">
                <h3><FiDollarSign /> Price</h3>
                <p className="detail-value price-value">
                  {event.isFree ? 'FREE' : `$${event.ticketPrice?.toFixed(2)}`}
                </p>
              </div>

              {/* Countdown Timer */}
              {isUpcoming && (
                <div className="sidebar-section">
                  <CountdownTimer targetDate={event.startDate} />
                </div>
              )}

              {/* Actions */}
              <div className="sidebar-actions">
                {canEdit ? (
                  <>
                    <Link to={`/events/${event._id}/registrations`} className="btn btn-primary btn-block" style={{ marginBottom: '10px', background: '#6366f1' }}>
                      <FiUsers /> View Registrations
                    </Link>
                    <Link to={`/events/${event._id}/edit`} className="btn btn-primary btn-block">
                      <FiEdit2 /> Edit Event
                    </Link>
                    <button onClick={handleDelete} className="btn btn-secondary btn-block" style={{ marginTop: '10px', color: '#ef4444', borderColor: '#ef4444' }}>
                      <FiTrash2 /> Delete Event
                    </button>
                  </>
                ) : isRegistered ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn btn-primary btn-block" disabled style={{ background: '#10b981', color: '#fff', border: 'none', opacity: 1 }}>
                      <FiCheck /> Already Registered
                    </button>
                    <Link to="/my-registrations" className="btn btn-secondary btn-block" style={{ textAlign: 'center' }}>
                      View My Ticket
                    </Link>
                  </div>
                ) : isUpcoming && event.status === 'published' ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering || isFull}
                    className="btn btn-primary btn-block"
                  >
                    {registering ? <LoadingSpinner size="small" text="" /> :
                      isFull ? 'Event Full' : 'Register Now'}
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-block" disabled>
                    {event.status === 'cancelled' ? 'Event Cancelled' : 'Event Ended'}
                  </button>
                )}

                <div className="sidebar-secondary-actions">
                  <button onClick={handleSave} className={`action-btn ${isSaved ? 'saved' : ''}`}>
                    <FiBookmark /> {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button onClick={handleShare} className="action-btn">
                    <FiShare2 /> Share
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
