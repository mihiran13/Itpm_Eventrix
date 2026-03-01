const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
} = require('../controllers/announcement.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Event announcements
router.post('/:eventId', protect, authorize('organizer', 'admin'), createAnnouncement);
router.get('/:eventId', getAnnouncements);

// Single announcement
router.delete('/detail/:id', protect, authorize('organizer', 'admin'), deleteAnnouncement);

module.exports = router;
