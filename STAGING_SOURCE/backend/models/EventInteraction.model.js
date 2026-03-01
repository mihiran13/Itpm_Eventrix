const mongoose = require('mongoose');

const eventInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required']
    },
    type: {
      type: String,
      enum: {
        values: ['like', 'interested', 'going'],
        message: 'Interaction type must be like, interested, or going'
      },
      required: [true, 'Interaction type is required']
    },
    reaction: {
      type: String,
      enum: ['👏', '🔥', '❤️', '😍', '🎉', '💡', null],
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate interactions of the same type per user per event
eventInteractionSchema.index({ user: 1, event: 1, type: 1 }, { unique: true });
eventInteractionSchema.index({ event: 1, type: 1 });
eventInteractionSchema.index({ user: 1 });

const EventInteraction = mongoose.model('EventInteraction', eventInteractionSchema);
module.exports = EventInteraction;
