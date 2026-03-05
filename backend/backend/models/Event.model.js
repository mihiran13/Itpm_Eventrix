const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    slug: {
      type: String,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Event category is required']
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    faculty: {
      type: String,
      enum: {
        values: ['Business', 'IT', 'Engineering', 'Hospitality', 'All'],
        message: 'Faculty must be Business, IT, Engineering, Hospitality, or All'
      },
      default: 'All'
    },
    eventType: {
      type: String,
      enum: {
        values: ['in-person', 'virtual', 'hybrid'],
        message: 'Event type must be in-person, virtual, or hybrid'
      },
      required: [true, 'Event type is required']
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'cancelled', 'completed', 'postponed'],
        message: 'Invalid event status'
      },
      default: 'draft'
    },
    // Date & Time
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: function (value) {
          // Only validate for new events, not updates
          if (this.isNew) {
            return value > new Date();
          }
          return true;
        },
        message: 'Start date must be in the future'
      }
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          console.log('--- MONGOOSE endDate VALIDATOR ---');
          console.log('value (endDate):', value);
          console.log('this.startDate:', this.startDate);
          console.log('value > this.startDate:', value > this.startDate);
          console.log('----------------------------------');
          return value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    registrationDeadline: {
      type: Date,
      validate: {
        validator: function (value) {
          return value <= this.startDate;
        },
        message: 'Registration deadline must be before or on the start date'
      }
    },
    // Location
    venue: {
      name: {
        type: String,
        maxlength: [200, 'Venue name cannot exceed 200 characters']
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    virtualLink: {
      type: String,
      validate: {
        validator: function (value) {
          if (this.eventType === 'virtual' || this.eventType === 'hybrid') {
            return value && value.length > 0;
          }
          return true;
        },
        message: 'Virtual link is required for virtual/hybrid events'
      }
    },
    // Images
    coverImage: {
      type: String,
      default: ''
    },
    images: [{
      url: String,
      caption: String
    }],
    // Capacity & Pricing
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [100000, 'Capacity cannot exceed 100,000']
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isFree: {
      type: Boolean,
      default: true
    },
    ticketPrice: {
      type: Number,
      default: 0,
      min: [0, 'Ticket price cannot be negative'],
      validate: {
        validator: function (value) {
          if (!this.isFree && value <= 0) return false;
          return true;
        },
        message: 'Paid events must have a ticket price greater than 0'
      }
    },
    ticketTypes: [{
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      sold: {
        type: Number,
        default: 0,
        min: 0
      },
      description: String
    }],
    // Organizer
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event organizer is required']
    },
    coOrganizers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    // Speakers/Guests
    speakers: [{
      name: {
        type: String,
        required: true
      },
      bio: String,
      avatar: String,
      designation: String,
      socialLinks: {
        linkedin: String,
        twitter: String
      }
    }],
    // Schedule/Agenda
    agenda: [{
      time: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      description: String,
      speaker: String
    }],
    // FAQs
    faqs: [{
      question: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      }
    }],
    // Settings
    isPublic: {
      type: Boolean,
      default: true
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    allowWaitlist: {
      type: Boolean,
      default: true
    },
    // Ratings & Reviews
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    // Analytics
    viewCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    },
    // Social Interaction Counters
    likeCount: {
      type: Number,
      default: 0
    },
    interestedCount: {
      type: Number,
      default: 0
    },
    goingCount: {
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

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.registeredCount;
});

// Virtual for isFull
eventSchema.virtual('isFull').get(function () {
  return this.registeredCount >= this.capacity;
});

// Virtual for isUpcoming
eventSchema.virtual('isUpcoming').get(function () {
  return this.startDate > new Date();
});

// Indexes
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ faculty: 1 });
// slug index already created by unique:true in schema

// Generate slug before saving
eventSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  
  // Auto-generate short description if not provided
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 297) + '...';
  }
  
  next();
});

// Auto-update status based on dates
eventSchema.pre('save', function (next) {
  if (this.endDate < new Date() && this.status === 'published') {
    this.status = 'completed';
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
