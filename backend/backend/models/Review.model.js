const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Review title cannot exceed 100 characters']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isVerifiedAttendee: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// One review per user per event
reviewSchema.index({ event: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (eventId) {
  const stats = await this.aggregate([
    { $match: { event: eventId } },
    {
      $group: {
        _id: '$event',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  const Event = mongoose.model('Event');
  if (stats.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].numReviews
    });
  } else {
    await Event.findByIdAndUpdate(eventId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

// Recalculate ratings after save/remove
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.event);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.event);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
