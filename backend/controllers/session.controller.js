const Session = require('../models/Session.model');
const Event = require('../models/Event.model');
const User = require('../models/User.model');

// @desc    Create a session for an event
// @route   POST /api/sessions/:eventId
// @access  Private (Organizer)
exports.createSession = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const session = await Session.create({ ...req.body, event: req.params.eventId });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all sessions for an event
// @route   GET /api/sessions/:eventId
// @access  Public
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ event: req.params.eventId })
      .sort({ startTime: 1, order: 1 })
      .populate('attendees', 'firstName lastName avatar');
    res.json({ success: true, data: sessions, count: sessions.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single session
// @route   GET /api/sessions/detail/:id
// @access  Public
exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('event', 'title startDate')
      .populate('attendees', 'firstName lastName avatar');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update a session
// @route   PUT /api/sessions/detail/:id
// @access  Private (Organizer)
exports.updateSession = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id).populate('event');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/detail/:id
// @access  Private (Organizer)
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('event');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove from all users' personal schedules
    await User.updateMany(
      { 'personalSchedule.session': session._id },
      { $pull: { personalSchedule: { session: session._id } } }
    );

    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Add session to personal schedule
// @route   POST /api/sessions/detail/:id/schedule
// @access  Private
exports.addToSchedule = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const user = await User.findById(req.user._id);
    const alreadyAdded = user.personalSchedule.some((s) => s.session.toString() === session._id.toString());
    if (alreadyAdded) {
      return res.status(400).json({ success: false, message: 'Session already in schedule' });
    }

    // Add to attendees
    if (!session.attendees.includes(req.user._id)) {
      session.attendees.push(req.user._id);
      await session.save();
    }

    user.personalSchedule.push({ session: session._id, event: session.event });
    await user.save();
    res.json({ success: true, message: 'Session added to schedule' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Remove session from personal schedule
// @route   DELETE /api/sessions/detail/:id/schedule
// @access  Private
exports.removeFromSchedule = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Remove from attendees
    session.attendees = session.attendees.filter((a) => a.toString() !== req.user._id.toString());
    await session.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { personalSchedule: { session: session._id } }
    });
    res.json({ success: true, message: 'Session removed from schedule' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get user's personal schedule
// @route   GET /api/sessions/my-schedule
// @access  Private
exports.getMySchedule = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'personalSchedule.session',
        populate: { path: 'event', select: 'title startDate endDate venue coverImage' }
      })
      .populate('personalSchedule.event', 'title startDate endDate venue coverImage');

    res.json({ success: true, data: user.personalSchedule || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
