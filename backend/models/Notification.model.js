const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required']
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: {
        values: [
          'event_created',
          'event_updated',
          'event_cancelled',
          'event_reminder',
          'registration_confirmed',
          'registration_cancelled',
          'registration_waitlisted',
          'payment_received',
          'feedback_request',
          'system_announcement',
          'event_invitation'
        ],
        message: 'Invalid notification type'
      },
      required: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    relatedRegistration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    actionUrl: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete old notifications (older than 90 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
