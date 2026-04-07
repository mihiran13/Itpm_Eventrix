const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  login,
  googleAuth,
  googleCallback,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  refreshToken
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, resetPassword);

// Google OAuth routes (passport-based)
router.get(
  '/google/passport',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh-token', protect, refreshToken);

module.exports = router;
