const Event = require('../models/Event.model');
const Registration = require('../models/Registration.model');
const User = require('../models/User.model');
const Category = require('../models/Category.model');

const MAX_ALLOWED_PAYMENT_AMOUNT = 1000000;

// @desc    Get dashboard stats for organizer
// @route   GET /api/dashboard/organizer
// @access  Private
const getOrganizerDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get organizer's events
    const [
      totalEvents,
      publishedEvents,
      upcomingEvents,
      completedEvents,
      cancelledEvents,
      totalRegistrations,
      recentRegistrations,
      popularEvents,
      monthlyStats
    ] = await Promise.all([
      Event.countDocuments({ organizer: userId }),
      Event.countDocuments({ organizer: userId, status: 'published' }),
      Event.countDocuments({
        organizer: userId,
        status: 'published',
        startDate: { $gte: new Date() }
      }),
      Event.countDocuments({ organizer: userId, status: 'completed' }),
      Event.countDocuments({ organizer: userId, status: 'cancelled' }),
      Registration.countDocuments({
        event: { $in: await Event.find({ organizer: userId }).distinct('_id') }
      }),
      Registration.find({
        event: { $in: await Event.find({ organizer: userId }).distinct('_id') }
      })
        .populate('user', 'firstName lastName email avatar')
        .populate('event', 'title startDate')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Event.find({ organizer: userId })
        .sort({ registeredCount: -1, viewCount: -1 })
        .limit(5)
        .select('title registeredCount capacity viewCount startDate status coverImage')
        .lean(),
      Registration.aggregate([
        {
          $match: {
            event: { $in: await Event.find({ organizer: userId }).distinct('_id') }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);

    // Calculate total revenue (for paid events)
    const revenueData = await Registration.aggregate([
      {
        $match: {
          event: { $in: await Event.find({ organizer: userId }).distinct('_id') },
          paymentStatus: 'paid'
        }
      },
      {
        $addFields: {
          normalizedPaymentAmount: {
            $convert: {
              input: '$paymentAmount',
              to: 'double',
              onError: 0,
              onNull: 0
            }
          }
        }
      },
      {
        $match: {
          normalizedPaymentAmount: { $gte: 0, $lte: MAX_ALLOWED_PAYMENT_AMOUNT }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$normalizedPaymentAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEvents,
          publishedEvents,
          upcomingEvents,
          completedEvents,
          cancelledEvents,
          totalRegistrations,
          totalRevenue: revenueData[0]?.totalRevenue || 0
        },
        recentRegistrations,
        popularEvents,
        monthlyStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats for user
// @route   GET /api/dashboard/user
// @access  Private
const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      totalRegistrations,
      upcomingRegistrations,
      pastRegistrations,
      cancelledRegistrations,
      savedEventsCount,
      upcomingEvents,
      recentNotifications
    ] = await Promise.all([
      Registration.countDocuments({ user: userId }),
      Registration.countDocuments({
        user: userId,
        status: { $in: ['confirmed', 'pending'] }
      }),
      Registration.countDocuments({
        user: userId,
        status: 'attended'
      }),
      Registration.countDocuments({
        user: userId,
        status: 'cancelled'
      }),
      User.findById(userId).then((u) => u.savedEvents.length),
      Registration.find({
        user: userId,
        status: { $in: ['confirmed', 'pending'] }
      })
        .populate({
          path: 'event',
          select: 'title startDate endDate venue coverImage status eventType category',
          populate: { path: 'category', select: 'name icon color' },
          match: { startDate: { $gte: new Date() } }
        })
        .sort({ 'event.startDate': 1 })
        .limit(5)
        .lean(),
      require('../models/Notification.model')
        .find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Filter out registrations where event didn't match (past events)
    const filteredUpcoming = upcomingEvents.filter((r) => r.event);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRegistrations,
          upcomingRegistrations,
          pastRegistrations,
          cancelledRegistrations,
          savedEventsCount
        },
        upcomingEvents: filteredUpcoming,
        recentNotifications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard
// @route   GET /api/dashboard/admin
// @access  Private (admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalCategories,
      revenueData,
      recentUsers,
      recentEvents,
      eventsByCategory,
      eventsByStatus,
      registrationsByMonth
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Event.countDocuments(),
      Registration.countDocuments(),
      Category.countDocuments({ isActive: true }),
      Registration.aggregate([
        {
          $match: {
            paymentStatus: 'paid'
          }
        },
        {
          $addFields: {
            normalizedPaymentAmount: {
              $convert: {
                input: '$paymentAmount',
                to: 'double',
                onError: 0,
                onNull: 0
              }
            }
          }
        },
        {
          $match: {
            normalizedPaymentAmount: { $gte: 0, $lte: MAX_ALLOWED_PAYMENT_AMOUNT }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$normalizedPaymentAmount' }
          }
        }
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('firstName lastName email avatar role createdAt')
        .lean(),
      Event.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('organizer', 'firstName lastName')
        .populate('category', 'name')
        .select('title status startDate registeredCount capacity createdAt')
        .lean(),
      Event.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo'
          }
        },
        { $unwind: '$categoryInfo' },
        {
          $group: {
            _id: '$categoryInfo.name',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Event.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Registration.aggregate([
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlyEvents = registrationsByMonth
      .slice()
      .reverse()
      .map((item) => ({
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        count: item.count
      }));

    const categoryStats = eventsByCategory.map((item) => ({
      name: item._id,
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalEvents,
          totalRegistrations,
          totalCategories,
          totalRevenue: revenueData[0]?.totalRevenue || 0
        },
        recentUsers,
        recentEvents,
        eventsByCategory,
        categoryStats,
        eventsByStatus,
        registrationsByMonth,
        monthlyEvents
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizerDashboard,
  getUserDashboard,
  getAdminDashboard
};
