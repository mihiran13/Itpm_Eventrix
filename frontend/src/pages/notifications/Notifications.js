import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import {
  FiBell, FiCheckCircle, FiTrash2, FiCalendar,
  FiUser, FiAlertCircle, FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.notifications || res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    const icons = {
      event_created: <FiCalendar />,
      event_updated: <FiCalendar />,
      event_cancelled: <FiAlertCircle />,
      registration_confirmed: <FiCheckCircle />,
      registration_cancelled: <FiAlertCircle />,
      new_registration: <FiUser />,
      event_reminder: <FiBell />
    };
    return icons[type] || <FiBell />;
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="page-header-row">
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllAsRead}>
              <FiCheck /> Mark All as Read
            </button>
          )}
        </div>

        <div className="notif-filters">
          {['all', 'unread', 'read'].map((f) => (
            <button key={f} className={`notif-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="no-results">
            <FiBell size={48} />
            <h3>No Notifications</h3>
            <p>{filter === 'unread' ? "You're all caught up!" : 'No notifications to display'}</p>
          </div>
        ) : (
          <div className="notification-list">
            {filtered.map((notif) => (
              <div
                key={notif._id}
                className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
              >
                <div className={`notif-icon ${notif.type}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="notif-content">
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{format(new Date(notif.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <button className="notif-delete" onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
