const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();

  const cookieOptions = {
    expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  // Remove sensitive fields
  const userResponse = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    authProvider: user.authProvider
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message,
    token,
    user: userResponse
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Validate role - allow user, organizer, admin
    const allowedRoles = ['user', 'organizer', 'admin'];
    const selectedRole = allowedRoles.includes(role) ? role : 'user';

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: selectedRole,
      authProvider: 'local'
    });

    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user registered with Google
    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google Sign-In. Please login with Google.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth login/register (token-based for frontend)
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Determine if credential is an ID token (JWT) or an access token
    let payload;
    try {
      if (credential.split('.') && credential.split('.').length === 3) {
        // ID token (JWT)
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } else {
        // Access token - fetch token info
        const tokenInfo = await googleClient.getTokenInfo(credential);
        // tokenInfo fields are strings
        payload = {
          sub: tokenInfo.sub,
          email: tokenInfo.email,
          given_name: tokenInfo.given_name || '',
          family_name: tokenInfo.family_name || '',
          picture: tokenInfo.picture || '',
          email_verified: tokenInfo.email_verified === 'true'
        };
      }
    } catch (err) {
      // Fall through to error handler below
      throw err;
    }

    const { sub: googleId, email, given_name, family_name, picture, email_verified } = payload;

    // Check if user exists by Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      return sendTokenResponse(user, 200, res, 'Google login successful');
    }

    // Check if user exists by email
    user = await User.findOne({ email });

    if (user) {
      // Link Google account
      user.googleId = googleId;
      user.avatar = user.avatar || picture;
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
      return sendTokenResponse(user, 200, res, 'Google account linked successfully');
    }

    // Create new user
    // Ensure lastName has a valid value (generate from email if missing)
    let lastName = family_name && family_name.trim() ? family_name : email.split('@')[0];
    if (!lastName.match(/^[a-zA-Z\s'-]*$/)) {
      lastName = 'User';
    }

    user = await User.create({
      firstName: (given_name && given_name.trim()) ? given_name : 'User',
      lastName: lastName,
      email,
      googleId,
      avatar: picture,
      isEmailVerified: email_verified,
      authProvider: 'google',
      lastLogin: new Date()
    });

    sendTokenResponse(user, 201, res, 'Google registration successful');
  } catch (error) {
    if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        message: 'Google authentication failed. Please try again.'
      });
    }
    next(error);
  }
};

// @desc    Google OAuth callback (passport-based)
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = (req, res) => {
  try {
    const token = req.user.generateAuthToken();
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('eventsCreated', 'title startDate status')
      .populate('savedEvents', 'title startDate coverImage');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email address'
      });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google Sign-In. Password reset is not applicable.'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In a real app, send email with reset link
    // For now, return the token (in production, NEVER return this)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email',
      // Remove this in production:
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    // Hash the token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Private
const refreshToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    sendTokenResponse(user, 200, res, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  googleCallback,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  refreshToken
};
