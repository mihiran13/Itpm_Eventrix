const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
      match: [/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens and apostrophes']
    },
    lastName: {
      type: String,
      required: function() {
        // lastName required only for local auth, optional for OAuth
        return this.authProvider === 'local';
      },
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      match: [/^[a-zA-Z\s'-]*$/, 'Last name can only contain letters, spaces, hyphens and apostrophes'],
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[0-9]{10,15}$/, 'Please provide a valid phone number']
    },
    avatar: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'organizer', 'admin'],
        message: 'Role must be either user, organizer, or admin'
      },
      default: 'user'
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    organization: {
      type: String,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
      default: ''
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: ''
    },
    website: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
        'Please provide a valid URL'
      ],
      default: ''
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' }
    },
    eventsCreated: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }],
    eventsRegistered: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration'
    }],
    savedEvents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }],
    personalSchedule: [{
      session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
      },
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      }
    }],
    lastLogin: {
      type: Date
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for search (email index is already created by unique:true in schema)
userSchema.index({ firstName: 'text', lastName: 'text' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
