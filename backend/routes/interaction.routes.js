const express = require('express');
const router = express.Router();
const {
  toggleLike,
  toggleInterested,
  toggleGoing,
  addReaction,
  removeReaction,
  getEventInteractions
} = require('../controllers/interaction.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// Public (with optional auth for user status)
router.get('/:eventId', optionalAuth, getEventInteractions);

// Protected routes
router.post('/:eventId/like', protect, toggleLike);
router.post('/:eventId/interested', protect, toggleInterested);
router.post('/:eventId/going', protect, toggleGoing);
router.post('/:eventId/reaction', protect, addReaction);
router.delete('/:eventId/reaction', protect, removeReaction);

module.exports = router;
