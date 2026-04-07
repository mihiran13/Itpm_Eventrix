const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    title: {
      type: String,
      required: [true, 'Survey title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    questions: [{
      text: {
        type: String,
        required: [true, 'Question text is required']
      },
      type: {
        type: String,
        enum: ['text', 'radio', 'checkbox'],
        default: 'text'
      },
      options: [{
        type: String
      }],
      required: {
        type: Boolean,
        default: false
      }
    }],
    responses: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      answers: [{
        questionIndex: Number,
        answer: String,
        selectedOptions: [String]
      }],
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    deadline: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
surveySchema.index({ event: 1 });
surveySchema.index({ createdBy: 1 });

// Virtual for response count
surveySchema.virtual('responseCount').get(function () {
  return this.responses ? this.responses.length : 0;
});

const Survey = mongoose.model('Survey', surveySchema);
module.exports = Survey;
