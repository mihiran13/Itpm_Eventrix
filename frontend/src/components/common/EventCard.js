import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin, FiUsers, FiHeart, FiClock } from 'react-icons/fi';
import './EventCard.css';

const EventCard = ({ event, onSave, isSaved }) => {
  const {
    _id,
    title,
    shortDescription,
    coverImage,
    startDate,
    venue,
    eventType,
    category,
    capacity,
    registeredCount,
    isFree,
    ticketPrice,
    organizer,
    status
  } = event;

  const availableSpots = capacity - (registeredCount || 0);
  const isFull = availableSpots <= 0;

  return (
    <div className="event-card animate-slideUp">
      <Link to={`/events/${_id}`} className="event-card-link">
        <div className="event-card-image">
          <img
            src={coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format'}
            alt={title}
            loading="lazy"
          />
          <div className="event-card-badges">
            {category && (
              <span className="event-badge category-badge" style={{ backgroundColor: category.color || '#6366f1' }}>
                {category.icon} {category.name}
              </span>
            )}
            <span className={`event-badge type-badge ${eventType}`}>
              {eventType === 'in-person' ? '📍 In-Person' : eventType === 'virtual' ? '💻 Virtual' : '🔄 Hybrid'}
            </span>
          </div>
          {isFree ? (
            <span className="event-price free">Free</span>
          ) : (
            <span className="event-price paid">${ticketPrice}</span>
          )}
        </div>

        <div className="event-card-content">
          <h3 className="event-card-title">{title}</h3>
          
          <p className="event-card-description">
            {shortDescription || (event.description && event.description.substring(0, 120) + '...')}
          </p>

          <div className="event-card-details">
            <div className="event-detail">
              <FiCalendar className="detail-icon" />
              <span>{format(new Date(startDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="event-detail">
              <FiClock className="detail-icon" />
              <span>{format(new Date(startDate), 'hh:mm a')}</span>
            </div>
            {venue?.name && (
              <div className="event-detail">
                <FiMapPin className="detail-icon" />
                <span>{venue.name}</span>
              </div>
            )}
            <div className="event-detail">
              <FiUsers className="detail-icon" />
              <span>
                {isFull ? (
                  <span className="text-error">Full</span>
                ) : (
                  `${availableSpots} spots left`
                )}
              </span>
            </div>
          </div>

          <div className="event-card-footer">
            <div className="event-organizer">
              <img
                src={organizer?.avatar || `https://ui-avatars.com/api/?name=${organizer?.firstName}+${organizer?.lastName}&background=6366f1&color=fff`}
                alt={organizer?.firstName}
                className="organizer-avatar"
              />
              <span className="organizer-name">
                {organizer?.firstName} {organizer?.lastName}
              </span>
            </div>
            {status === 'cancelled' && (
              <span className="status-badge cancelled">Cancelled</span>
            )}
          </div>
        </div>
      </Link>

      {onSave && (
        <button
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSave(_id);
          }}
          title={isSaved ? 'Remove from saved' : 'Save event'}
        >
          <FiHeart className={isSaved ? 'filled' : ''} />
        </button>
      )}
    </div>
  );
};

export default EventCard;
