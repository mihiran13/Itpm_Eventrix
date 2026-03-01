import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiPlus, FiCalendar, FiHeart, FiGrid, FiChevronDown, FiSettings, FiShield, FiUsers, FiTrendingUp, FiBookmark } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  // Fetch unread notifications count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const response = await notificationsAPI.getUnreadCount();
          setUnreadCount(response.data.unreadCount);
        } catch (error) {
          // Silently fail
        }
      };
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎉</span>
          <span className="logo-text">Eventrix</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          {!isHomePage && (
            <>
              <Link to="/feed" className={`nav-link ${location.pathname === '/feed' ? 'active' : ''}`}>
                <FiTrendingUp />
                <span>Feed</span>
              </Link>
              <Link to="/events" className={`nav-link ${location.pathname === '/events' ? 'active' : ''}`}>
                <FiCalendar />
                <span>Events</span>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              {/* Student Dashboard */}
              {user?.role === 'user' && (
                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                  <FiGrid />
                  <span>Dashboard</span>
                </Link>
              )}
              
              {/* Organizer Dashboard & Create Event */}
              {user?.role === 'organizer' && (
                <>
                  <Link to="/organizer/dashboard" className={`nav-link ${location.pathname === '/organizer/dashboard' ? 'active' : ''}`}>
                    <FiGrid />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/events/create" className="nav-link create-btn">
                    <FiPlus />
                    <span>Create Event</span>
                  </Link>
                </>
              )}

              {/* Admin Dashboard & Create Event */}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                    <FiShield />
                    <span>Admin</span>
                  </Link>
                  <Link to="/events/create" className="nav-link create-btn">
                    <FiPlus />
                    <span>Create Event</span>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link to="/notifications" className="nav-icon-btn">
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="profile-dropdown-wrapper" ref={dropdownRef}>
                <button
                  className="profile-trigger"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=6366f1&color=fff`}
                    alt={user?.firstName}
                    className="profile-avatar"
                  />
                  <span className="profile-name">{user?.firstName}</span>
                  <FiChevronDown className={`dropdown-arrow ${profileDropdownOpen ? 'rotated' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="profile-dropdown animate-slideDown">
                    <div className="dropdown-header">
                      <p className="dropdown-user-name">{user?.firstName} {user?.lastName}</p>
                      <p className="dropdown-user-email">{user?.email}</p>
                      <span className={`role-badge ${user?.role}`}>{user?.role}</span>
                    </div>
                    <div className="dropdown-divider"></div>

                    {/* Common Links */}
                    <Link to="/profile" className="dropdown-item">
                      <FiUser /> My Profile
                    </Link>
                    <Link to="/notifications" className="dropdown-item">
                      <FiBell /> Notifications
                    </Link>

                    {/* Student Specific Links */}
                    {user?.role === 'user' && (
                      <>
                        <div className="dropdown-divider"></div>
                        <Link to="/my-registrations" className="dropdown-item">
                          <FiCalendar /> My Registrations
                        </Link>
                        <Link to="/saved-events" className="dropdown-item">
                          <FiHeart /> Saved Events
                        </Link>
                        <Link to="/schedule" className="dropdown-item">
                          <FiBookmark /> My Schedule
                        </Link>
                      </>
                    )}

                    {/* Organizer Specific Links */}
                    {user?.role === 'organizer' && (
                      <>
                        <div className="dropdown-divider"></div>
                        <Link to="/my-events" className="dropdown-item">
                          <FiCalendar /> My Events
                        </Link>
                        <Link to="/events/create" className="dropdown-item">
                          <FiPlus /> Create Event
                        </Link>
                      </>
                    )}

                    {/* Admin Links */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="dropdown-divider"></div>
                        <Link to="/admin" className="dropdown-item admin-item">
                          <FiShield /> Admin Panel
                        </Link>
                        <Link to="/admin/users" className="dropdown-item admin-item">
                          <FiUsers /> Manage Users
                        </Link>
                        <Link to="/admin/categories" className="dropdown-item admin-item">
                          <FiGrid /> Manage Categories
                        </Link>
                        <Link to="/my-events" className="dropdown-item">
                          <FiCalendar /> My Events
                        </Link>
                        <Link to="/events/create" className="dropdown-item">
                          <FiPlus /> Create Event
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>
                    <Link to="/profile/edit" className="dropdown-item">
                      <FiSettings /> Settings
                    </Link>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu animate-slideDown">
          {!isHomePage && (
            <>
              <Link to="/feed" className="mobile-menu-item">
                <FiTrendingUp /> Feed
              </Link>
              <Link to="/events" className="mobile-menu-item">
                <FiCalendar /> Events
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <>
              {/* Student Menu */}
              {user?.role === 'user' && (
                <>
                  <Link to="/dashboard" className="mobile-menu-item">
                    <FiGrid /> Dashboard
                  </Link>
                  <Link to="/my-registrations" className="mobile-menu-item">
                    <FiGrid /> My Registrations
                  </Link>
                  <Link to="/saved-events" className="mobile-menu-item">
                    <FiHeart /> Saved Events
                  </Link>
                  <Link to="/schedule" className="mobile-menu-item">
                    <FiBookmark /> My Schedule
                  </Link>
                </>
              )}

              {/* Organizer Menu */}
              {user?.role === 'organizer' && (
                <>
                  <Link to="/organizer/dashboard" className="mobile-menu-item">
                    <FiGrid /> Dashboard
                  </Link>
                  <Link to="/my-events" className="mobile-menu-item">
                    <FiCalendar /> My Events
                  </Link>
                  <Link to="/events/create" className="mobile-menu-item">
                    <FiPlus /> Create Event
                  </Link>
                </>
              )}

              {/* Admin Menu */}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="mobile-menu-item">
                    <FiShield /> Admin Panel
                  </Link>
                  <Link to="/admin/users" className="mobile-menu-item">
                    <FiUsers /> Manage Users
                  </Link>
                  <Link to="/admin/categories" className="mobile-menu-item">
                    <FiGrid /> Manage Categories
                  </Link>
                  <Link to="/my-events" className="mobile-menu-item">
                    <FiCalendar /> My Events
                  </Link>
                  <Link to="/events/create" className="mobile-menu-item">
                    <FiPlus /> Create Event
                  </Link>
                </>
              )}

              <Link to="/notifications" className="mobile-menu-item">
                <FiBell /> Notifications
                {unreadCount > 0 && <span className="mobile-badge">{unreadCount}</span>}
              </Link>
              <Link to="/profile" className="mobile-menu-item">
                <FiUser /> Profile
              </Link>
              <button className="mobile-menu-item logout" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-menu-item">Login</Link>
              <Link to="/register" className="mobile-menu-item highlight">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
