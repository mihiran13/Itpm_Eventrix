const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required']
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: ''
    },
    speaker: {
      name: {
        type: String,
        required: [true, 'Speaker name is required']
      },
      bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: ''
      },
      avatar: {
        type: String,
        default: ''
      },
      designation: {
        type: String,
        default: ''
      }
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    location: {
      type: String,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      default: ''
    },
    materials: [{
      name: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['pdf', 'doc', 'ppt', 'image', 'video', 'other'],
        default: 'other'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
      default: 100
    },
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
sessionSchema.index({ event: 1, startTime: 1 });
sessionSchema.index({ event: 1, order: 1 });

// Virtual for attendee count
sessionSchema.virtual('attendeeCount').get(function () {
  return this.attendees ? this.attendees.length : 0;
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
