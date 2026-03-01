const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getMyEvents,
  toggleSaveEvent,
  getSavedEvents,
  getFeaturedEvents,
  getFeedEvents,
  exportCalendar
} = require('../controllers/event.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { createEventValidation, updateEventValidation, mongoIdValidation } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes (specific paths first, then params)
router.get('/featured', getFeaturedEvents);
router.get('/feed', getFeedEvents);
router.get('/', getEvents);

// Protected routes (specific paths must come before /:id)
// Only organizers and admins can create events
router.post('/', protect, authorize('organizer', 'admin'), upload.single('coverImage'), createEventValidation, createEvent);

// Student routes - my registrations
router.get('/user/saved', protect, getSavedEvents);

// Organizer routes - my events
router.get('/user/my-events', protect, authorize('organizer', 'admin'), getMyEvents);

// Param routes (must come after all specific paths)
router.get('/:id', optionalAuth, getEvent);

// Only organizers and admins can update and delete events
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('coverImage'), updateEventValidation, updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.patch('/:id/cancel', protect, authorize('organizer', 'admin'), cancelEvent);

// Any authenticated user can save events
router.patch('/:id/save', protect, toggleSaveEvent);
router.get('/:id/calendar', exportCalendar);

module.exports = router;
