const express = require('express');
const router = express.Router();
const {
  createSurvey,
  getSurveys,
  getSurvey,
  submitResponse,
  getResults,
  deleteSurvey
} = require('../controllers/survey.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Event surveys
router.post('/:eventId', protect, authorize('organizer', 'admin'), createSurvey);
router.get('/:eventId', getSurveys);

// Single survey operations
router.get('/detail/:id', getSurvey);
router.post('/detail/:id/respond', protect, submitResponse);
router.get('/detail/:id/results', protect, authorize('organizer', 'admin'), getResults);
router.delete('/detail/:id', protect, authorize('organizer', 'admin'), deleteSurvey);

module.exports = router;
