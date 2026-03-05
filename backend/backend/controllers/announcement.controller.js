const Announcement = require('../models/Announcement.model');
const Event = require('../models/Event.model');
const Notification = require('../models/Notification.model');
const Registration = require('../models/Registration.model');

// @desc    Create announcement for an event
// @route   POST /api/announcements/:eventId
// @access  Private (Organizer)
exports.createAnnouncement = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const announcement = await Announcement.create({
      ...req.body,
      event: req.params.eventId,
      author: req.user._id
    });

    // Notify all registered attendees
    const registrations = await Registration.find({ event: req.params.eventId, status: { $in: ['confirmed', 'pending'] } });
    const notifications = registrations.map((reg) => ({
      recipient: reg.user,
      sender: req.user._id,
      type: 'announcement',
      title: `New Announcement: ${req.body.title}`,
      message: req.body.message.substring(0, 200),
      relatedEvent: req.params.eventId,
      priority: req.body.priority || 'medium'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get announcements for an event
// @route   GET /api/announcements/:eventId
// @access  Public
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ event: req.params.eventId })
      .populate('author', 'firstName lastName avatar')
      .sort('-createdAt');
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Organizer)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('event');
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    if (announcement.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
