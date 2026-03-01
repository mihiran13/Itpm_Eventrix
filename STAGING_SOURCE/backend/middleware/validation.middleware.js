const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  }
  next();
};

// ==================== AUTH VALIDATIONS ====================

const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, hyphens and apostrophes'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters, spaces, hyphens and apostrophes'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  validate
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

  validate
];

const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  validate
];

// ==================== EVENT VALIDATIONS ====================
// Event validation
const createEventValidation = [
  (req, res, next) => {
    console.log('--- EVENT CREATE INCOMING req.body ---');
    console.log('startDate:', req.body.startDate);
    console.log('endDate:', req.body.endDate);
    console.log('--------------------------------------');
    next();
  },
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),

  body('eventType')
    .notEmpty().withMessage('Event type is required')
    .isIn(['in-person', 'virtual', 'hybrid']).withMessage('Invalid event type'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format')
    .custom((value) => {
      // NOTE: Do not skip validation in custom if value is faulty. The previous validators handle it.
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),

  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      const start = new Date(req.body.startDate);
      const end = new Date(value);
      if (end <= start) {
        throw new Error(`End date (${end.toISOString()}) must be after start date (${start.toISOString()})`);
      }
      return true;
    }),

  body('capacity')
    .notEmpty().withMessage('Event capacity is required')
    .isInt({ min: 1, max: 100000 }).withMessage('Capacity must be between 1 and 100,000'),

  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Ticket price cannot be negative'),

  body('venue.name')
    .optional()
    .isLength({ max: 200 }).withMessage('Venue name cannot exceed 200 characters'),

  body('virtualLink')
    .optional()
    .isURL().withMessage('Please provide a valid URL for the virtual link'),

  body('registrationDeadline')
    .optional()
    .isISO8601().withMessage('Invalid registration deadline format')
    .custom((value, { req }) => {
      if (new Date(value) > new Date(req.body.startDate)) {
        throw new Error('Registration deadline must be before start date');
      }
      return true;
    }),

  validate
];

const updateEventValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 150 }).withMessage('Title must be between 5 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),

  body('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),

  body('eventType')
    .optional()
    .isIn(['in-person', 'virtual', 'hybrid']).withMessage('Event type must be in-person, virtual, or hybrid'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100000 }).withMessage('Capacity must be between 1 and 100,000'),

  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed', 'postponed']).withMessage('Invalid event status'),

  validate
];

// ==================== REGISTRATION VALIDATIONS ====================

const registerForEventValidation = [
  body('ticketType')
    .optional()
    .isObject().withMessage('Invalid ticket type'),

  body('additionalInfo.dietaryRestrictions')
    .optional()
    .isLength({ max: 200 }).withMessage('Dietary restrictions cannot exceed 200 characters'),

  body('additionalInfo.specialRequirements')
    .optional()
    .isLength({ max: 500 }).withMessage('Special requirements cannot exceed 500 characters'),

  body('additionalInfo.tshirtSize')
    .optional()
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL']).withMessage('Invalid t-shirt size'),

  validate
];

// ==================== USER PROFILE VALIDATIONS ====================

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters'),

  body('phone')
    .optional()
    .matches(/^[\+]?[0-9]{10,15}$/).withMessage('Please provide a valid phone number'),

  body('bio')
    .optional()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),

  body('organization')
    .optional()
    .isLength({ max: 100 }).withMessage('Organization name cannot exceed 100 characters'),

  body('location')
    .optional()
    .isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),

  body('website')
    .optional()
    .isURL().withMessage('Please provide a valid URL'),

  validate
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  validate
];

// ==================== CATEGORY VALIDATIONS ====================

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),

  body('description')
    .optional()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),

  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Please provide a valid hex color'),

  validate
];

// ==================== REVIEW VALIDATIONS ====================

const reviewValidation = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Review title cannot exceed 100 characters'),

  validate
];

// ==================== PARAM VALIDATIONS ====================

const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),

  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  createEventValidation,
  updateEventValidation,
  registerForEventValidation,
  updateProfileValidation,
  changePasswordValidation,
  categoryValidation,
  reviewValidation,
  mongoIdValidation
};
