import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiGithub, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">🎉</span>
              <span>Eventrix</span>
            </Link>
            <p className="footer-description">
              Your all-in-one platform for discovering, creating, and managing events. 
              Connect with people, share experiences, and make every event memorable.
            </p>
            <div className="footer-social">
              <span className="social-link"><FiFacebook /></span>
              <span className="social-link"><FiTwitter /></span>
              <span className="social-link"><FiInstagram /></span>
              <span className="social-link"><FiGithub /></span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/events">Browse Events</Link></li>
              <li><Link to="/events/create">Create Event</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/my-registrations">My Registrations</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-links-section">
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              <li><Link to="/events?category=conference">Conference</Link></li>
              <li><Link to="/events?category=workshop">Workshop</Link></li>
              <li><Link to="/events?category=technology">Technology</Link></li>
              <li><Link to="/events?category=networking">Networking</Link></li>
              <li><Link to="/events?category=social">Social</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-links-section">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <FiMail />
                <span>support@eventrix.com</span>
              </li>
              <li>
                <FiPhone />
                <span>+94 11 234 5678</span>
              </li>
              <li>
                <FiMapPin />
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Eventrix. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span className="footer-policy-link">Privacy Policy</span>
            <span className="footer-policy-link">Terms of Service</span>
            <span className="footer-policy-link">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
