const express = require('express');
const router = express.Router();
const {
  getOrganizerDashboard,
  getUserDashboard,
  getAdminDashboard
} = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// Student/User dashboard - only for users with 'user' role
router.get('/user', authorize('user'), getUserDashboard);

// Organizer dashboard - only for users with 'organizer' role
router.get('/organizer', authorize('organizer'), getOrganizerDashboard);

// Admin dashboard - only for users with 'admin' role
router.get('/admin', authorize('admin'), getAdminDashboard);

module.exports = router;
