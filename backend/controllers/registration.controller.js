const Registration = require('../models/Registration.model');
const Event = require('../models/Event.model');
const Notification = require('../models/Notification.model');

const MAX_ALLOWED_PAYMENT_AMOUNT = 1000000;

const getSafePaymentAmount = (amount, fallback = 0) => {
  const primary = Number(amount);
  if (Number.isFinite(primary) && primary >= 0 && primary <= MAX_ALLOWED_PAYMENT_AMOUNT) {
    return primary;
  }

  const fallbackNumber = Number(fallback);
  if (Number.isFinite(fallbackNumber) && fallbackNumber >= 0 && fallbackNumber <= MAX_ALLOWED_PAYMENT_AMOUNT) {
    return fallbackNumber;
  }

  return 0;
};

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private
const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Validation checks
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not available for this event'
      });
    }

    if (event.organizer.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot register for your own event'
      });
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check for existing registration
    const existingReg = await Registration.findOne({
      event: event._id,
      user: req.user.id
    });

    if (existingReg) {
      if (existingReg.status === 'cancelled') {
        // Allow re-registration after cancellation
        existingReg.status = event.registeredCount >= event.capacity ? 'waitlisted' : 'pending';
        existingReg.cancelledAt = undefined;
        existingReg.cancellationReason = undefined;
        existingReg.additionalInfo = req.body.additionalInfo || existingReg.additionalInfo;
        await existingReg.save();

        if (existingReg.status !== 'waitlisted') {
          event.registeredCount += 1;
          await event.save({ validateBeforeSave: false });
        }

        return res.status(200).json({
          success: true,
          message: existingReg.status === 'waitlisted'
            ? 'Event is full. You have been added to the waitlist.'
            : 'Re-registered successfully',
          registration: existingReg
        });
      }

      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check capacity
    let status = 'pending';
    if (event.registeredCount >= event.capacity) {
      if (event.allowWaitlist) {
        status = 'waitlisted';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Event is full and waitlist is not available'
        });
      }
    }

    // Auto-confirm unless approval required
    if (!event.requiresApproval && status !== 'waitlisted') {
      status = 'confirmed';
    }

    // Create registration
    const paymentAmount = getSafePaymentAmount(req.body.ticketType?.price, event.ticketPrice);

    const registration = await Registration.create({
      event: event._id,
      user: req.user.id,
      status,
      ticketType: req.body.ticketType,
      paymentStatus: event.isFree ? 'free' : 'pending',
      paymentAmount,
      additionalInfo: req.body.additionalInfo
    });

    // Update event registered count
    if (status !== 'waitlisted') {
      event.registeredCount += 1;
      await event.save({ validateBeforeSave: false });
    }

    // Send notification
    await Notification.create({
      recipient: req.user.id,
      type: status === 'waitlisted' ? 'registration_waitlisted' : 'registration_confirmed',
      title: status === 'waitlisted' ? 'Added to Waitlist' : 'Registration Confirmed',
      message: status === 'waitlisted'
        ? `You've been added to the waitlist for "${event.title}".`
        : `Your registration for "${event.title}" has been confirmed.`,
      relatedEvent: event._id,
      relatedRegistration: registration._id
    });

    // Notify organizer
    await Notification.create({
      recipient: event.organizer,
      sender: req.user.id,
      type: 'registration_confirmed',
      title: 'New Registration',
      message: `${req.user.firstName} ${req.user.lastName} registered for "${event.title}".`,
      relatedEvent: event._id,
      relatedRegistration: registration._id
    });

    await registration.populate('event', 'title startDate endDate venue');
    await registration.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: status === 'waitlisted'
        ? 'Added to waitlist successfully'
        : 'Registered successfully',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel registration
// @route   PATCH /api/registrations/:id/cancel
// @access  Private
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title startDate organizer');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check ownership
    if (registration.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is already cancelled'
      });
    }

    // Check cancellation deadline (2 hours before event)
    const event = await Event.findById(registration.event._id || registration.event);
    const cancellationDeadline = new Date(event.startDate.getTime() - 2 * 60 * 60 * 1000);

    if (new Date() > cancellationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration within 2 hours of event start time'
      });
    }

    const previousStatus = registration.status;
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    registration.cancellationReason = req.body.reason || '';
    await registration.save();

    // Update event count if it was confirmed
    if (previousStatus === 'confirmed' || previousStatus === 'pending') {
      await Event.findByIdAndUpdate(registration.event._id || registration.event, {
        $inc: { registeredCount: -1 }
      });

      // Move first waitlisted user to confirmed
      const waitlisted = await Registration.findOne({
        event: registration.event._id || registration.event,
        status: 'waitlisted'
      }).sort({ createdAt: 1 });

      if (waitlisted) {
        waitlisted.status = 'confirmed';
        await waitlisted.save();

        await Event.findByIdAndUpdate(registration.event._id || registration.event, {
          $inc: { registeredCount: 1 }
        });

        await Notification.create({
          recipient: waitlisted.user,
          type: 'registration_confirmed',
          title: 'Registration Confirmed!',
          message: `A spot opened up! Your registration for "${event.title}" is now confirmed.`,
          relatedEvent: event._id,
          relatedRegistration: waitlisted._id,
          priority: 'high'
        });
      }
    }

    // Notify
    await Notification.create({
      recipient: req.user.id,
      type: 'registration_cancelled',
      title: 'Registration Cancelled',
      message: `Your registration for "${event.title}" has been cancelled.`,
      relatedEvent: event._id
    });

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my-registrations
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [registrations, total] = await Promise.all([
      Registration.find(query)
        .populate({
          path: 'event',
          select: 'title startDate endDate venue coverImage status eventType organizer category',
          populate: [
            { path: 'organizer', select: 'firstName lastName avatar' },
            { path: 'category', select: 'name icon color' }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Registration.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: registrations.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registrations for an event (organizer only)
// @route   GET /api/registrations/event/:eventId
// @access  Private (owner/admin)
const getEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations for this event'
      });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const query = { event: event._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [registrations, total, statusCounts] = await Promise.all([
      Registration.find(query)
        .populate('user', 'firstName lastName email avatar phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Registration.countDocuments(query),
      Registration.aggregate([
        { $match: { event: event._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const counts = {};
    statusCounts.forEach((s) => {
      counts[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      count: registrations.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      statusCounts: counts,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in attendee
// @route   PATCH /api/registrations/:id/check-in
// @access  Private (organizer/admin)
const checkInAttendee = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'organizer title');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check ownership
    const event = registration.event;
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (registration.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed registrations can be checked in'
      });
    }

    if (registration.checkedIn) {
      return res.status(400).json({
        success: false,
        message: 'Attendee is already checked in'
      });
    }

    registration.checkedIn = true;
    registration.checkInTime = new Date();
    registration.status = 'attended';
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Attendee checked in successfully',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for an event
// @route   POST /api/registrations/:id/feedback
// @access  Private
const submitFeedback = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this registration'
      });
    }

    if (!['attended', 'confirmed'].includes(registration.status)) {
      return res.status(400).json({
        success: false,
        message: 'You can only submit feedback for attended events'
      });
    }

    if (registration.feedback && registration.feedback.submittedAt) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this registration'
      });
    }

    registration.feedback = {
      rating: req.body.rating,
      comment: req.body.comment,
      submittedAt: new Date()
    };
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate E-Ticket PDF data (returns JSON for frontend PDF)
// @route   GET /api/registrations/:id/e-ticket
// @access  Private
const generateETicket = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title startDate endDate venue eventType organizer coverImage faculty')
      .populate('user', 'firstName lastName email');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['confirmed', 'attended'].includes(registration.status)) {
      return res.status(400).json({ success: false, message: 'E-ticket only available for confirmed registrations' });
    }

    // QR code data: JSON with registration info
    const qrData = JSON.stringify({
      registrationId: registration._id,
      registrationNumber: registration.registrationNumber,
      eventId: registration.event._id,
      userId: registration.user._id,
      eventTitle: registration.event.title,
      userName: `${registration.user.firstName} ${registration.user.lastName}`
    });

    res.status(200).json({
      success: true,
      ticketData: {
        registrationNumber: registration.registrationNumber,
        eventTitle: registration.event.title,
        eventDate: registration.event.startDate,
        eventEndDate: registration.event.endDate,
        eventVenue: registration.event.venue,
        eventType: registration.event.eventType,
        faculty: registration.event.faculty,
        attendeeName: `${registration.user.firstName} ${registration.user.lastName}`,
        attendeeEmail: registration.user.email,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
        paymentAmount: registration.paymentAmount,
        registeredAt: registration.createdAt,
        qrData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate payment for a registration
// @route   POST /api/registrations/:id/payment
// @access  Private
const simulatePayment = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title isFree ticketPrice');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    if (registration.event.isFree) {
      return res.status(400).json({ success: false, message: 'This is a free event — no payment required' });
    }

    // Simulate payment processing
    registration.paymentAmount = getSafePaymentAmount(registration.paymentAmount, registration.event.ticketPrice);
    registration.paymentStatus = 'paid';
    registration.paymentMethod = req.body.paymentMethod || 'credit_card';
    registration.paymentDate = new Date();
    registration.transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Auto-confirm registration after successful payment
    if (registration.status === 'pending') {
      registration.status = 'confirmed';
    }
    
    await registration.save();

    // Notify user
    await Notification.create({
      recipient: req.user.id,
      type: 'payment_received',
      title: 'Payment Confirmed',
      message: `Payment of $${registration.paymentAmount} for "${registration.event.title}" has been confirmed. Transaction ID: ${registration.transactionId}`,
      relatedEvent: registration.event._id,
      relatedRegistration: registration._id,
      priority: 'high'
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        transactionId: registration.transactionId,
        amount: registration.paymentAmount,
        method: registration.paymentMethod,
        date: registration.paymentDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback/reviews for an event
// @route   GET /api/registrations/event/:eventId/feedback
// @access  Public
const getEventFeedback = async (req, res, next) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId,
      'feedback.submittedAt': { $exists: true }
    })
      .populate('user', 'firstName lastName avatar')
      .select('user feedback status createdAt')
      .sort({ 'feedback.submittedAt': -1 })
      .lean();

    const reviews = registrations.map((r) => ({
      _id: r._id,
      user: r.user,
      rating: r.feedback.rating,
      comment: r.feedback.comment,
      submittedAt: r.feedback.submittedAt
    }));

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark certificate as issued
// @route   PATCH /api/registrations/:id/issue-certificate
// @access  Private
const markCertificateIssued = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (registration.status !== 'attended') {
      return res.status(400).json({ success: false, message: 'Certificate only available for attended registrations' });
    }

    registration.certificateIssued = true;
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Certificate marked as issued',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm/Approve registration (organizer only)
// @route   PATCH /api/registrations/:id/confirm
// @access  Private
const confirmRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'organizer title');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Check ownership
    const event = registration.event;
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending registrations can be confirmed' });
    }

    registration.status = 'confirmed';
    await registration.save();

    // Notify student
    await Notification.create({
      recipient: registration.user,
      type: 'registration_confirmed',
      title: 'Registration Approved!',
      message: `Your registration for "${event.title}" has been approved by the organizer. You can now access your E-Ticket.`,
      relatedEvent: event._id,
      relatedRegistration: registration._id
    });

    res.status(200).json({
      success: true,
      message: 'Registration confirmed successfully',
      registration
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  checkInAttendee,
  submitFeedback,
  generateETicket,
  simulatePayment,
  getEventFeedback,
  markCertificateIssued,
  confirmRegistration
};
