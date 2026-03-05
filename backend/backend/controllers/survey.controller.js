const Survey = require('../models/Survey.model');
const Event = require('../models/Event.model');

// @desc    Create a survey for an event
// @route   POST /api/surveys/:eventId
// @access  Private (Organizer)
exports.createSurvey = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const survey = await Survey.create({
      ...req.body,
      event: req.params.eventId,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get surveys for an event
// @route   GET /api/surveys/:eventId
// @access  Public
exports.getSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ event: req.params.eventId })
      .populate('createdBy', 'firstName lastName')
      .sort('-createdAt');
    res.json({ success: true, data: surveys });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single survey
// @route   GET /api/surveys/detail/:id
// @access  Public
exports.getSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('event', 'title');
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    res.json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Submit survey response
// @route   POST /api/surveys/detail/:id/respond
// @access  Private
exports.submitResponse = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    if (!survey.isActive) return res.status(400).json({ success: false, message: 'Survey is closed' });

    // Check if user already responded
    const alreadyResponded = survey.responses.some(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyResponded) {
      return res.status(400).json({ success: false, message: 'You have already responded to this survey' });
    }

    survey.responses.push({
      user: req.user._id,
      answers: req.body.answers,
      submittedAt: new Date()
    });
    await survey.save();
    res.json({ success: true, message: 'Response submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get survey results
// @route   GET /api/surveys/detail/:id/results
// @access  Private (Organizer)
exports.getResults = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('responses.user', 'firstName lastName email')
      .populate('event', 'title organizer');
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });

    res.json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete survey
// @route   DELETE /api/surveys/detail/:id
// @access  Private (Organizer)
exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).populate('event');
    if (!survey) return res.status(404).json({ success: false, message: 'Survey not found' });
    if (survey.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Survey.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Survey deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
