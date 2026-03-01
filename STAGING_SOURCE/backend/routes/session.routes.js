const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  addToSchedule,
  removeFromSchedule,
  getMySchedule
} = require('../controllers/session.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Personal schedule (must come before param routes)
router.get('/my-schedule', protect, getMySchedule);

// Event sessions
router.post('/:eventId', protect, authorize('organizer', 'admin'), createSession);
router.get('/:eventId', getSessions);

// Single session operations
router.get('/detail/:id', getSession);
router.put('/detail/:id', protect, authorize('organizer', 'admin'), updateSession);
router.delete('/detail/:id', protect, authorize('organizer', 'admin'), deleteSession);

// Schedule management
router.post('/detail/:id/schedule', protect, addToSchedule);
router.delete('/detail/:id/schedule', protect, removeFromSchedule);

module.exports = router;
