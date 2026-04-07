const EventInteraction = require('../models/EventInteraction.model');
const Event = require('../models/Event.model');

// Helper to update event counts
const updateEventCounts = async (eventId) => {
  const [likeCount, interestedCount, goingCount] = await Promise.all([
    EventInteraction.countDocuments({ event: eventId, type: 'like' }),
    EventInteraction.countDocuments({ event: eventId, type: 'interested' }),
    EventInteraction.countDocuments({ event: eventId, type: 'going' })
  ]);
  await Event.findByIdAndUpdate(eventId, { likeCount, interestedCount, goingCount });
};

// @desc    Toggle like on an event
// @route   POST /api/interactions/:eventId/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const { eventId } = req.params;
    const existing = await EventInteraction.findOne({
      user: req.user._id,
      event: eventId,
      type: 'like'
    });

    if (existing) {
      await EventInteraction.findByIdAndDelete(existing._id);
      await updateEventCounts(eventId);
      return res.json({ success: true, liked: false, message: 'Like removed' });
    }

    await EventInteraction.create({ user: req.user._id, event: eventId, type: 'like' });
    await updateEventCounts(eventId);
    res.status(201).json({ success: true, liked: true, message: 'Event liked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Toggle interested on an event
// @route   POST /api/interactions/:eventId/interested
// @access  Private
exports.toggleInterested = async (req, res) => {
  try {
    const { eventId } = req.params;
    const existing = await EventInteraction.findOne({
      user: req.user._id,
      event: eventId,
      type: 'interested'
    });

    if (existing) {
      await EventInteraction.findByIdAndDelete(existing._id);
      await updateEventCounts(eventId);
      return res.json({ success: true, interested: false, message: 'Removed from interested' });
    }

    // Remove 'going' if user marks as 'interested'
    await EventInteraction.findOneAndDelete({ user: req.user._id, event: eventId, type: 'going' });
    await EventInteraction.create({ user: req.user._id, event: eventId, type: 'interested' });
    await updateEventCounts(eventId);
    res.status(201).json({ success: true, interested: true, message: 'Marked as interested' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Toggle going on an event
// @route   POST /api/interactions/:eventId/going
// @access  Private
exports.toggleGoing = async (req, res) => {
  try {
    const { eventId } = req.params;
    const existing = await EventInteraction.findOne({
      user: req.user._id,
      event: eventId,
      type: 'going'
    });

    if (existing) {
      await EventInteraction.findByIdAndDelete(existing._id);
      await updateEventCounts(eventId);
      return res.json({ success: true, going: false, message: 'Removed from going' });
    }

    // Remove 'interested' if user marks as 'going'
    await EventInteraction.findOneAndDelete({ user: req.user._id, event: eventId, type: 'interested' });
    await EventInteraction.create({ user: req.user._id, event: eventId, type: 'going' });
    await updateEventCounts(eventId);
    res.status(201).json({ success: true, going: true, message: 'Marked as going' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Add reaction to an event
// @route   POST /api/interactions/:eventId/reaction
// @access  Private
exports.addReaction = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reaction } = req.body;

    const validReactions = ['👏', '🔥', '❤️', '😍', '🎉', '💡'];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction emoji' });
    }

    // Upsert — update reaction if exists, create if not
    await EventInteraction.findOneAndUpdate(
      { user: req.user._id, event: eventId, type: 'like' },
      { user: req.user._id, event: eventId, type: 'like', reaction },
      { upsert: true, new: true }
    );

    await updateEventCounts(eventId);
    res.json({ success: true, reaction, message: 'Reaction added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Remove reaction from an event
// @route   DELETE /api/interactions/:eventId/reaction
// @access  Private
exports.removeReaction = async (req, res) => {
  try {
    const { eventId } = req.params;
    await EventInteraction.findOneAndUpdate(
      { user: req.user._id, event: eventId, type: 'like' },
      { reaction: null }
    );
    res.json({ success: true, message: 'Reaction removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all interactions for an event (with user status)
// @route   GET /api/interactions/:eventId
// @access  Public (user status is optional)
exports.getEventInteractions = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).select('likeCount interestedCount goingCount viewCount');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    let userInteractions = { liked: false, interested: false, going: false, reaction: null };

    if (req.user) {
      const interactions = await EventInteraction.find({ user: req.user._id, event: eventId });
      interactions.forEach((interaction) => {
        if (interaction.type === 'like') {
          userInteractions.liked = true;
          userInteractions.reaction = interaction.reaction;
        }
        if (interaction.type === 'interested') userInteractions.interested = true;
        if (interaction.type === 'going') userInteractions.going = true;
      });
    }

    // Get reaction breakdown
    const reactions = await EventInteraction.aggregate([
      { $match: { event: event._id, reaction: { $ne: null } } },
      { $group: { _id: '$reaction', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        counts: {
          likes: event.likeCount,
          interested: event.interestedCount,
          going: event.goingCount,
          views: event.viewCount
        },
        reactions: reactions.map((r) => ({ emoji: r._id, count: r.count })),
        userStatus: userInteractions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
