const Event = require('../models/Event.model');
const Registration = require('../models/Registration.model');
const Notification = require('../models/Notification.model');
const Category = require('../models/Category.model');
const { AppError } = require('../middleware/error.middleware');
const cloudinary = require('../config/cloudinary');

const parseJSONField = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (organizer/admin)
const createEvent = async (req, res, next) => {
  try {
    req.body.venue = parseJSONField(req.body.venue, req.body.venue || {});
    
    // Convert flattened venue from frontend to nested Mongoose schema
    if (req.body.venue && typeof req.body.venue.address === 'string') {
      const v = req.body.venue;
      req.body.venue = {
        name: v.name,
        address: {
          street: v.address,
          city: v.city,
          state: v.state,
          country: v.country
        }
      };
    }
    
    req.body.speakers = parseJSONField(req.body.speakers, []);
    req.body.agenda = parseJSONField(req.body.agenda, []);
    req.body.faqs = parseJSONField(req.body.faqs, []);

    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    if (req.file?.buffer) {
      const uploadedImage = await uploadBufferToCloudinary(req.file.buffer, 'eventrix/events');
      req.body.coverImage = uploadedImage.secure_url;
    } else if (req.body.coverImage && typeof req.body.coverImage !== 'string') {
      delete req.body.coverImage;
    }

    req.body.organizer = req.user.id;

    // Validate category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    const event = await Event.create(req.body);

    // Update category event count
    await Category.findByIdAndUpdate(req.body.category, { $inc: { eventCount: 1 } });

    // Add event to user's created events
    req.user.eventsCreated.push(event._id);
    await req.user.save({ validateBeforeSave: false });

    await event.populate('category', 'name slug icon color');
    await event.populate('organizer', 'firstName lastName email avatar');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events (with filters, search, pagination)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      eventType,
      status = 'published',
      startDate,
      endDate,
      isFree,
      sortBy = 'startDate',
      sortOrder = 'asc',
      location
    } = req.query;

    // Build query
    const query = {};

    // Status filter
    if (status) query.status = status;

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) query.category = category;

    // Event type filter
    if (eventType) query.eventType = eventType;

    // Faculty filter
    if (req.query.faculty && req.query.faculty !== 'All') {
      query.faculty = req.query.faculty;
    }

    // Date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    // Free/paid filter
    if (isFree !== undefined) {
      query.isFree = isFree === 'true';
    }

    // Location filter
    if (location) {
      query['venue.address.city'] = { $regex: location, $options: 'i' };
    }

    // Only show public events
    query.isPublic = true;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('category', 'name slug icon color')
        .populate('organizer', 'firstName lastName avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Event.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID or slug
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    let event;

    // Try finding by ID first, then by slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(id);
    }
    if (!event) {
      event = await Event.findOne({ slug: id });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment view count
    event.viewCount += 1;
    await event.save({ validateBeforeSave: false });

    await event.populate('category', 'name slug icon color');
    await event.populate('organizer', 'firstName lastName email avatar bio organization');
    await event.populate('coOrganizers', 'firstName lastName avatar');
 
    let isRegistered = false;
    let registrationId = null;
    if (req.user) {
      const registration = await Registration.findOne({
        event: event._id,
        user: req.user.id,
        status: { $ne: 'cancelled' }
      });
      if (registration) {
        isRegistered = true;
        registrationId = registration._id;
      }
    }
 
    res.status(200).json({
      success: true,
      event,
      isRegistered,
      registrationId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (owner/admin)
const updateEvent = async (req, res, next) => {
  try {
    req.body.venue = parseJSONField(req.body.venue, req.body.venue);
    
    // Convert flattened venue from frontend to nested Mongoose schema
    if (req.body.venue && typeof req.body.venue.address === 'string') {
      const v = req.body.venue;
      req.body.venue = {
        name: v.name,
        address: {
          street: v.address,
          city: v.city,
          state: v.state,
          country: v.country
        }
      };
    }

    req.body.speakers = parseJSONField(req.body.speakers, req.body.speakers);
    req.body.agenda = parseJSONField(req.body.agenda, req.body.agenda);
    req.body.faqs = parseJSONField(req.body.faqs, req.body.faqs);

    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    if (req.file?.buffer) {
      const uploadedImage = await uploadBufferToCloudinary(req.file.buffer, 'eventrix/events');
      req.body.coverImage = uploadedImage.secure_url;
    } else if (req.body.coverImage && typeof req.body.coverImage !== 'string') {
      delete req.body.coverImage;
    }

    let event = await Event.findById(req.params.id);

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
        message: 'You are not authorized to update this event'
      });
    }

    // Prevent updating completed/cancelled events (admin can override)
    if (['completed', 'cancelled'].includes(event.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${event.status} event`
      });
    }

    // Don't allow reducing capacity below registered count
    if (req.body.capacity && req.body.capacity < event.registeredCount) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce capacity below registered count (${event.registeredCount})`
      });
    }

    // Update event fields safely using Mongoose's .set() method
    event.set(req.body);

    await event.save();

    await event.populate('category', 'name slug icon color');
    await event.populate('organizer', 'firstName lastName email avatar');

    // Notify registered users about update
    const registrations = await Registration.find({
      event: event._id,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (registrations.length > 0) {
      const notifications = registrations.map((reg) => ({
        recipient: reg.user,
        sender: req.user.id,
        type: 'event_updated',
        title: 'Event Updated',
        message: `"${event.title}" has been updated. Please check the latest details.`,
        relatedEvent: event._id,
        priority: 'medium'
      }));

      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (owner/admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

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
        message: 'You are not authorized to delete this event'
      });
    }

    // Check for existing registrations
    const activeRegistrations = await Registration.countDocuments({
      event: event._id,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (activeRegistrations > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event with ${activeRegistrations} active registrations. Cancel the event instead.`
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Update category event count
    if (event.category) {
      await Category.findByIdAndUpdate(event.category, { $inc: { eventCount: -1 } });
    }

    // Remove event from user's created events
    await User.findByIdAndUpdate(event.organizer, {
      $pull: { eventsCreated: event._id }
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel event
// @route   PATCH /api/events/:id/cancel
// @access  Private (owner/admin)
const cancelEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this event'
      });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Event is already cancelled'
      });
    }

    event.status = 'cancelled';
    await event.save();

    // Cancel all registrations
    await Registration.updateMany(
      { event: event._id, status: { $in: ['confirmed', 'pending', 'waitlisted'] } },
      { status: 'cancelled', cancelledAt: new Date() }
    );

    // Notify all registered users
    const registrations = await Registration.find({ event: event._id });
    if (registrations.length > 0) {
      const notifications = registrations.map((reg) => ({
        recipient: reg.user,
        sender: req.user.id,
        type: 'event_cancelled',
        title: 'Event Cancelled',
        message: `"${event.title}" has been cancelled. ${req.body.reason || ''}`,
        relatedEvent: event._id,
        priority: 'high'
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      message: 'Event cancelled successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events created by current user
// @route   GET /api/events/my-events
// @access  Private
const getMyEvents = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { organizer: req.user.id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('category', 'name icon color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Event.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/unsave event
// @route   PATCH /api/events/:id/save
// @access  Private
const toggleSaveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const user = req.user;
    const isSaved = user.savedEvents.includes(event._id);

    if (isSaved) {
      user.savedEvents = user.savedEvents.filter(
        (id) => id.toString() !== event._id.toString()
      );
    } else {
      user.savedEvents.push(event._id);
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: isSaved ? 'Event removed from saved' : 'Event saved successfully',
      isSaved: !isSaved
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved events
// @route   GET /api/events/saved
// @access  Private
const getSavedEvents = async (req, res, next) => {
  try {
    const user = await req.user.populate({
      path: 'savedEvents',
      populate: [
        { path: 'category', select: 'name icon color' },
        { path: 'organizer', select: 'firstName lastName avatar' }
      ]
    });

    res.status(200).json({
      success: true,
      count: user.savedEvents.length,
      events: user.savedEvents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured/upcoming events
// @route   GET /api/events/featured
// @access  Public
const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      status: 'published',
      startDate: { $gte: new Date() },
      isPublic: true
    })
      .populate('category', 'name icon color')
      .populate('organizer', 'firstName lastName avatar')
      .sort({ registeredCount: -1, viewCount: -1 })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feed events (Social Feed with faculty filter)
// @route   GET /api/events/feed
// @access  Public
const getFeedEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      faculty,
      category,
      sort = '-createdAt'
    } = req.query;

    const query = {
      status: 'published',
      isPublic: true
    };

    if (faculty && faculty !== 'All') query.faculty = faculty;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('category', 'name slug icon color')
        .populate('organizer', 'firstName lastName avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Event.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export event as ICS calendar file
// @route   GET /api/events/:id/calendar
// @access  Public
const exportCalendar = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const formatDate = (date) => {
      return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const location = event.eventType === 'virtual'
      ? 'Online'
      : `${event.venue?.name || ''} ${event.venue?.address?.city || ''}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Eventrix//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${(event.shortDescription || event.description || '').replace(/\n/g, '\\n').substring(0, 500)}`,
      `LOCATION:${location.trim()}`,
      `UID:${event._id}@eventrix`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${event.slug || event.title}.ics"`);
    res.send(icsContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getMyEvents,
  toggleSaveEvent,
  getSavedEvents,
  getFeaturedEvents,
  getFeedEvents,
  exportCalendar
};
