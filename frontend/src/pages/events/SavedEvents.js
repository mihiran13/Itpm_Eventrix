import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import EventCard from '../../components/common/EventCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiBookmark } from 'react-icons/fi';
import './Events.css';

const SavedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  const fetchSavedEvents = async () => {
    try {
      const res = await eventsAPI.getSaved();
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="my-events-page">
      <div className="container">
        <div className="page-header">
          <h1>Saved Events</h1>
          <p>Events you've bookmarked for later</p>
        </div>

        {events.length === 0 ? (
          <div className="no-results">
            <FiBookmark size={48} />
            <h3>No Saved Events</h3>
            <p>Events you save will appear here. Browse events and click the bookmark icon to save them.</p>
          </div>
        ) : (
          <div className="events-grid grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedEvents;
