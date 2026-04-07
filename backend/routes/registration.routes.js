const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  checkInAttendee,
  submitFeedback,
  generateETicket,
  simulatePayment,
  getEventFeedback,
  confirmRegistration,
  markCertificateIssued
} = require('../controllers/registration.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { registerForEventValidation } = require('../middleware/validation.middleware');

// Protected routes (specific paths first)
router.get('/my-registrations', protect, getMyRegistrations);

// Only organizers can view registrations for their events
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventRegistrations);

// --- SPECIFIC ACTIONS FIRST (Priority) ---
router.patch('/:id/confirm', protect, confirmRegistration);
router.patch('/:id/check-in', protect, authorize('organizer', 'admin'), checkInAttendee);
router.patch('/:id/cancel', protect, cancelRegistration);
router.patch('/:id/issue-certificate', protect, markCertificateIssued);

// --- GENERAL PARAM ROUTES BELOW ---
router.post('/:eventId', protect, registerForEventValidation, registerForEvent);
router.post('/:id/feedback', protect, submitFeedback);
router.get('/:id/e-ticket', protect, generateETicket);
router.post('/:id/payment', protect, simulatePayment);

// Public: Get event feedback/reviews
router.get('/event/:eventId/feedback', getEventFeedback);

module.exports = router;
