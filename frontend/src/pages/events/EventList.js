import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsAPI, categoriesAPI } from '../../services/api';
import EventCard from '../../components/common/EventCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight, FiCalendar, FiGrid, FiList } from 'react-icons/fi';
import './Events.css';

const EventList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    eventType: searchParams.get('eventType') || '',
    isFree: searchParams.get('isFree') || '',
    startDate: searchParams.get('startDate') || '',
    sort: searchParams.get('sort') || '-createdAt',
    faculty: searchParams.get('faculty') || ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      const res = await eventsAPI.getAll(params);
      setEvents(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', eventType: '', isFree: '', startDate: '', sort: '-createdAt', faculty: '' });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    const params = Object.fromEntries(searchParams);
    params.page = page;
    setSearchParams(params);
    window.scrollTo({ top: 0 });
  };

  const activeFiltersCount = [filters.category, filters.eventType, filters.isFree, filters.startDate, filters.faculty].filter(Boolean).length;

  return (
    <div className="events-page">
      {/* Hero / Search Bar */}
      <div className="events-hero">
        <div className="container">
          <h1>Discover Events</h1>
          <p>Find amazing events happening around you</p>
          <div className="search-bar-large">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search events by name, description, or location..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
            <button onClick={applyFilters} className="search-btn">Search</button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Toolbar */}
        <div className="events-toolbar">
          <div className="toolbar-left">
            <button className={`filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <FiFilter />
              Filters
              {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
            </button>
            {activeFiltersCount > 0 && (
              <button className="clear-filters" onClick={clearFilters}>
                <FiX /> Clear All
              </button>
            )}
            <span className="results-count">{pagination.total} events found</span>
          </div>

          <div className="toolbar-right">
            <select value={filters.sort} onChange={(e) => { setFilters({ ...filters, sort: e.target.value }); }} className="sort-select">
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="startDate">Upcoming First</option>
              <option value="-registeredCount">Most Popular</option>
              <option value="ticketPrice">Price: Low to High</option>
              <option value="-ticketPrice">Price: High to Low</option>
            </select>
            <div className="view-toggle">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><FiGrid /></button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><FiList /></button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel animate-slideDown">
            <div className="filter-group">
              <label>Category</label>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Faculty</label>
              <select value={filters.faculty} onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}>
                <option value="">All Faculties</option>
                <option value="Business">Business</option>
                <option value="IT">IT</option>
                <option value="Engineering">Engineering</option>
                <option value="Hospitality">Hospitality</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Event Type</label>
              <select value={filters.eventType} onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}>
                <option value="">All Types</option>
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Price</label>
              <select value={filters.isFree} onChange={(e) => setFilters({ ...filters, isFree: e.target.value })}>
                <option value="">Any Price</option>
                <option value="true">Free</option>
                <option value="false">Paid</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Start Date</label>
              <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            </div>
            <button className="apply-filters-btn" onClick={applyFilters}>Apply Filters</button>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <LoadingSpinner text="Loading events..." />
        ) : events.length === 0 ? (
          <div className="no-results">
            <FiCalendar size={48} />
            <h3>No Events Found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
            <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className={`events-grid ${viewMode}`}>
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="page-btn"
                >
                  <FiChevronLeft /> Prev
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 2)
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && <span className="page-dots">...</span>}
                      <button
                        className={`page-btn ${pagination.page === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="page-btn"
                >
                  Next <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventList;
