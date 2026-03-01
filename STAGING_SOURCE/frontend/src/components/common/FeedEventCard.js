import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { interactionsAPI, eventsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import {
  FiCalendar, FiMapPin, FiHeart, FiShare2, FiEye,
  FiUsers, FiBookmark, FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './FeedEventCard.css';

const REACTIONS = ['👏', '🔥', '❤️', '😍', '🎉', '💡'];

const FeedEventCard = ({ event, onUpdate }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState({
    counts: { likes: 0, interested: 0, going: 0, views: 0 },
    reactions: [],
    userStatus: { liked: false, interested: false, going: false, reaction: null }
  });
  const [showReactions, setShowReactions] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchInteractions();
    // eslint-disable-next-line
  }, [event._id]);

  const fetchInteractions = async () => {
    try {
      const res = await interactionsAPI.getEventInteractions(event._id);
      setInteractions(res.data.data);
    } catch (err) {
      // Fallback to event data
      setInteractions((prev) => ({
        ...prev,
        counts: { likes: event.likeCount || 0, interested: event.interestedCount || 0, going: event.goingCount || 0, views: event.viewCount || 0 }
      }));
    }
  };

  const handleAction = async (action) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (actionLoading) return;
    setActionLoading(action);
    try {
      if (action === 'like') await interactionsAPI.toggleLike(event._id);
      else if (action === 'interested') await interactionsAPI.toggleInterested(event._id);
      else if (action === 'going') await interactionsAPI.toggleGoing(event._id);
      await fetchInteractions();
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleReaction = async (emoji) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await interactionsAPI.addReaction(event._id, emoji);
      setShowReactions(false);
      await fetchInteractions();
    } catch (err) {
      toast.error('Failed to react');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/events/${event._id}`;
    if (navigator.share) {
      navigator.share({ title: event.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  const handleCalendarExport = () => {
    eventsAPI.exportCalendar(event._id);
    toast.success('Calendar file downloading...');
  };

  const { counts, userStatus } = interactions;

  return (
    <div className="feed-card">
      {/* Cover Image */}
      <Link to={`/events/${event._id}`} className="feed-card-image">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} />
        ) : (
          <div className="feed-card-placeholder"><FiCalendar size={32} /></div>
        )}
        <div className="feed-card-badges">
          {event.category && <span className="feed-badge cat">{event.category.name}</span>}
          {event.faculty && event.faculty !== 'All' && (
            <span className="feed-badge faculty">{event.faculty}</span>
          )}
          <span className={`feed-badge type ${event.eventType}`}>{event.eventType}</span>
        </div>
        {!event.isFree && (
          <span className="feed-price">${event.ticketPrice}</span>
        )}
        {event.isFree && <span className="feed-price free">FREE</span>}
      </Link>

      {/* Content */}
      <div className="feed-card-body">
        <Link to={`/events/${event._id}`} className="feed-card-title">{event.title}</Link>
        <div className="feed-card-meta">
          <span><FiCalendar /> {format(new Date(event.startDate), 'MMM d, yyyy · h:mm a')}</span>
          <span><FiMapPin /> {event.eventType === 'virtual' ? 'Online' : (event.venue?.name || 'TBA')}</span>
        </div>
        {event.organizer && (
          <div className="feed-card-organizer">
            <span>by {event.organizer.firstName} {event.organizer.lastName}</span>
          </div>
        )}

        {/* Counters */}
        <div className="feed-card-counters">
          <span><FiEye /> {counts.views} views</span>
          <span><FiHeart /> {counts.likes}</span>
          <span><FiUsers /> {counts.going} going</span>
          <span>⭐ {counts.interested} interested</span>
        </div>

        {/* Reaction Display */}
        {interactions.reactions.length > 0 && (
          <div className="feed-reactions-display">
            {interactions.reactions.slice(0, 5).map((r) => (
              <span key={r.emoji} className="reaction-bubble">{r.emoji} {r.count}</span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="feed-card-actions">
        <button
          className={`feed-action-btn ${userStatus.liked ? 'active' : ''}`}
          onClick={() => handleAction('like')}
          disabled={!!actionLoading}
        >
          <FiHeart /> {userStatus.liked ? 'Liked' : 'Like'}
        </button>

        <button
          className={`feed-action-btn interested-btn ${userStatus.interested ? 'active' : ''}`}
          onClick={() => handleAction('interested')}
          disabled={!!actionLoading}
        >
          <FiBookmark /> {userStatus.interested ? 'Interested' : 'Interested'}
        </button>

        <button
          className={`feed-action-btn going-btn ${userStatus.going ? 'active' : ''}`}
          onClick={() => handleAction('going')}
          disabled={!!actionLoading}
        >
          <FiUsers /> {userStatus.going ? 'Going ✓' : 'Going'}
        </button>

        <div className="feed-action-more">
          <button
            className="feed-action-btn emoji-btn"
            onClick={() => setShowReactions(!showReactions)}
          >
            {userStatus.reaction || '😊'}
          </button>
          {showReactions && (
            <div className="reactions-popup">
              {REACTIONS.map((emoji) => (
                <button key={emoji} onClick={() => handleReaction(emoji)} className="reaction-option">
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="feed-action-btn" onClick={handleShare}>
          <FiShare2 />
        </button>

        <button className="feed-action-btn" onClick={handleCalendarExport} title="Add to Calendar">
          <FiDownload />
        </button>
      </div>
    </div>
  );
};

export default FeedEventCard;
