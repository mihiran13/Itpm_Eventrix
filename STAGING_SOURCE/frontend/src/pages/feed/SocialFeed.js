import React, { useState, useEffect, useCallback } from 'react';
import { eventsAPI, categoriesAPI } from '../../services/api';
import FeedEventCard from '../../components/common/FeedEventCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiTrendingUp, FiFilter, FiCalendar } from 'react-icons/fi';
import './SocialFeed.css';

const FACULTIES = ['All', 'Business', 'IT', 'Engineering', 'Hospitality'];

const SocialFeed = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaculty, setActiveFaculty] = useState('All');
  const [activeCategory, setActiveCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (activeFaculty !== 'All') params.faculty = activeFaculty;
      if (activeCategory) params.category = activeCategory;

      const res = await eventsAPI.getFeed(params);
      setEvents(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, activeFaculty, activeCategory]);

  useEffect(() => {
    categoriesAPI.getAll().then((res) => {
      setCategories(res.data.data || res.data.categories || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFacultyChange = (faculty) => {
    setActiveFaculty(faculty);
    setPage(1);
  };

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId === activeCategory ? '' : catId);
    setPage(1);
  };

  return (
    <div className="social-feed-page">
      {/* Header */}
      <div className="feed-header">
        <div className="container">
          <div className="feed-header-content">
            <div>
              <h1>
                <FiTrendingUp className="feed-title-icon" />
                {user ? `Welcome back, ${user.firstName}!` : 'Event Feed'}
              </h1>
              <p>Discover events across all faculties</p>
            </div>
            <div className="feed-stats">
              <span className="feed-stat"><FiCalendar /> {total} Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Tabs */}
      <div className="faculty-tabs-wrapper">
        <div className="container">
          <div className="faculty-tabs">
            {FACULTIES.map((faculty) => (
              <button
                key={faculty}
                className={`faculty-tab ${activeFaculty === faculty ? 'active' : ''}`}
                onClick={() => handleFacultyChange(faculty)}
              >
                <span className="faculty-emoji">
                  {faculty === 'All' && '🎓'}
                  {faculty === 'Business' && '💼'}
                  {faculty === 'IT' && '💻'}
                  {faculty === 'Engineering' && '⚙️'}
                  {faculty === 'Hospitality' && '🏨'}
                </span>
                {faculty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Chips */}
      {categories.length > 0 && (
        <div className="category-chips-wrapper">
          <div className="container">
            <div className="category-chips">
              <button
                className={`category-chip ${!activeCategory ? 'active' : ''}`}
                onClick={() => handleCategoryChange('')}
              >
                <FiGrid /> All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`category-chip ${activeCategory === cat._id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat._id)}
                >
                  {cat.icon || '📌'} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Events Feed */}
      <div className="container">
        {loading ? (
          <LoadingSpinner text="Loading events..." />
        ) : events.length === 0 ? (
          <div className="feed-empty">
            <FiFilter size={48} />
            <h3>No Events Found</h3>
            <p>Try changing the faculty or category filters.</p>
          </div>
        ) : (
          <>
            <div className="feed-grid">
              {events.map((event) => (
                <FeedEventCard key={event._id} event={event} onUpdate={fetchEvents} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="feed-pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="page-btn">← Previous</button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="page-btn">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
