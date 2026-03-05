const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled', 'waitlisted', 'attended', 'no-show'],
        message: 'Invalid registration status'
      },
      default: 'pending'
    },
    registrationNumber: {
      type: String,
      unique: true
    },
    ticketType: {
      name: String,
      price: Number
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'free'],
      default: 'free'
    },
    paymentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    // Additional info collected during registration
    additionalInfo: {
      dietaryRestrictions: String,
      specialRequirements: String,
      tshirtSize: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '']
      },
      emergencyContact: {
        name: String,
        phone: String
      }
    },
    // Check-in details
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkInTime: Date,
    // Feedback
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: [1000, 'Feedback comment cannot exceed 1000 characters']
      },
      submittedAt: Date
    },
    // Cancellation
    cancelledAt: Date,
    cancellationReason: {
      type: String,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },
    // QR Code for check-in
    qrCode: String,
    // Notes from organizer
    organizerNotes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    // Certificate status
    certificateIssued: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index to prevent duplicate registrations
registrationSchema.index({ event: 1, user: 1 }, { unique: true });
// registrationNumber index already created by unique:true in schema
registrationSchema.index({ status: 1 });

// Generate registration number before saving
registrationSchema.pre('save', function (next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.registrationNumber = `EVT-${timestamp}-${random}`;
  }
  next();
});

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
