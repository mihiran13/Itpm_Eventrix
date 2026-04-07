import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../../services/api';
import EventCard from '../../components/common/EventCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiCalendar } from 'react-icons/fi';
import './Events.css';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await eventsAPI.getMyEvents();
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (activeTab === 'all') return true;
    return event.status === activeTab;
  });

  const tabs = [
    { key: 'all', label: 'All', count: events.length },
    { key: 'published', label: 'Published', count: events.filter((e) => e.status === 'published').length },
    { key: 'draft', label: 'Drafts', count: events.filter((e) => e.status === 'draft').length },
    { key: 'completed', label: 'Completed', count: events.filter((e) => e.status === 'completed').length },
    { key: 'cancelled', label: 'Cancelled', count: events.filter((e) => e.status === 'cancelled').length }
  ];

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="my-events-page">
      <div className="container">
        <div className="page-header-row">
          <div>
            <h1>My Events</h1>
            <p>Manage your created events</p>
          </div>
          <Link to="/events/create" className="btn btn-primary">
            <FiPlus /> Create Event
          </Link>
        </div>

        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="no-results">
            <FiCalendar size={48} />
            <h3>No Events Found</h3>
            <p>{activeTab === 'all' ? "You haven't created any events yet." : `No ${activeTab} events.`}</p>
            <Link to="/events/create" className="btn btn-primary"><FiPlus /> Create Your First Event</Link>
          </div>
        ) : (
          <div className="events-grid grid">
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} showActions />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
