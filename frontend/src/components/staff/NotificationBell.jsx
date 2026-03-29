import React, { useState, useEffect } from 'react';
import * as staffApi from '../../services/staffDashboardApi';
import './NotificationBell.css';

/**
 * Notification Bell Component
 * Shows unread notification count and displays notification dropdown
 * Real-time updates when new notifications arrive
 */
const NotificationBell = ({ refreshInterval = 5000 }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const count = await staffApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getNotifications({ limit: 10 });
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and set up polling
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      fetchNotifications();
    }
  }, [isDropdownOpen]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await staffApi.markNotificationAsRead(notificationId);
      // Refresh notifications
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await staffApi.markAllNotificationsAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await staffApi.deleteNotification(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return '#dc3545';
      case 'High':
        return '#ff6b6b';
      case 'Medium':
        return '#ffc107';
      case 'Low':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="notification-bell-container">
      {/* Bell Icon Button */}
      <button
        className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        title={`${unreadCount} unread notifications`}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isDropdownOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="btn-mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="notification-list">
            {loading ? (
              <div className="loading">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  {/* Priority Indicator */}
                  <div
                    className="priority-indicator"
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  ></div>

                  {/* Content */}
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        className="btn-icon"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(notification._id)}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="notification-footer">
            <a href="/staff/notifications" className="view-all-link">
              View all notifications <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
