const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getPublicProfile,
  deleteAccount,
  getAllUsers,
  updateUserRole,
  createOrganizer,
  deleteOrganizer
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { updateProfileValidation, changePasswordValidation } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfileValidation, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.delete('/account', protect, deleteAccount);

// Admin routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.patch('/:id/role', protect, authorize('admin'), updateUserRole);
router.post('/organizers', protect, authorize('admin'), createOrganizer);
router.delete('/:id/organizer', protect, authorize('admin'), deleteOrganizer);

// Public routes
router.get('/:id', getPublicProfile);

module.exports = router;
