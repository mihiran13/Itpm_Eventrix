const User = require('../models/User.model');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-passwordResetToken -passwordResetExpire -emailVerificationToken -emailVerificationExpire');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'bio', 'avatar',
      'organization', 'location', 'website', 'socialLinks'
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'socialLinks' && typeof req.body[field] === 'string') {
          try {
            updateData[field] = JSON.parse(req.body[field]);
          } catch (e) {
            updateData[field] = req.body[field];
          }
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    // Handle avatar file upload
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      updateData.avatar = `data:${req.file.mimetype};base64,${base64}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    }).select('-passwordResetToken -passwordResetExpire');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for Google-authenticated accounts'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public user profile
// @route   GET /api/users/:id
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName avatar bio organization location website socialLinks eventsCreated createdAt')
      .populate('eventsCreated', 'title startDate coverImage status category');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // For local auth, verify password
    if (user.authProvider === 'local') {
      if (!req.body.password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to delete account'
        });
      }

      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    // Soft delete - deactivate account
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save({ validateBeforeSave: false });

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Account has been deactivated'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordResetToken -passwordResetExpire')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin only)
// @route   PATCH /api/users/:id/role
// @access  Private (admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, organizer, or admin.'
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Admin accounts cannot be demoted to other roles
    if (targetUser.role === 'admin' && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin role cannot be changed to another role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create organizer account (admin only)
// @route   POST /api/users/organizers
// @access  Private (admin)
const createOrganizer = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email and password are required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const organizer = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'organizer',
      authProvider: 'local',
      isEmailVerified: true
    });

    const organizerResponse = {
      _id: organizer._id,
      firstName: organizer.firstName,
      lastName: organizer.lastName,
      email: organizer.email,
      role: organizer.role,
      authProvider: organizer.authProvider,
      isActive: organizer.isActive,
      createdAt: organizer.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Organizer account created successfully',
      user: organizerResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organizer account (admin only)
// @route   DELETE /api/users/:id/organizer
// @access  Private (admin)
const deleteOrganizer = async (req, res, next) => {
  try {
    const organizer = await User.findById(req.params.id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (organizer.role !== 'organizer') {
      return res.status(400).json({
        success: false,
        message: 'Only organizer accounts can be deleted from this action'
      });
    }

    await User.findByIdAndDelete(organizer._id);

    res.status(200).json({
      success: true,
      message: 'Organizer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getPublicProfile,
  deleteAccount,
  getAllUsers,
  updateUserRole,
  createOrganizer,
  deleteOrganizer
};
