import express from 'express';
import Machine from '../models/Machine.js';
import Booking from '../models/Booking.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { query } from 'express-validator';

const router = express.Router();

// Get laundry overview/dashboard
router.get('/overview', [
  auth,
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id;

    // Get machine statistics
    const [
      totalMachines,
      availableMachines,
      inUseMachines,
      maintenanceMachines,
      userBookings,
      upcomingBookings
    ] = await Promise.all([
      Machine.countDocuments({ isActive: true }),
      Machine.countDocuments({ status: 'available', isActive: true }),
      Machine.countDocuments({ status: 'in_use', isActive: true }),
      Machine.countDocuments({ status: 'maintenance', isActive: true }),
      userId ? Booking.countDocuments({ userId, status: { $in: ['scheduled', 'confirmed', 'in_progress'] } }) : 0,
      Booking.getUpcoming(userId)
    ]);

    const overview = {
      machines: {
        total: totalMachines,
        available: availableMachines,
        inUse: inUseMachines,
        maintenance: maintenanceMachines,
        utilizationRate: totalMachines > 0 ? Math.round((inUseMachines / totalMachines) * 100) : 0
      },
      bookings: {
        active: userBookings,
        upcoming: upcomingBookings.length
      },
      upcomingBookings: upcomingBookings.slice(0, 5) // Show next 5 bookings
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching laundry overview',
      error: error.message
    });
  }
});

// Get real-time machine status
router.get('/machines/status', [
  query('building').optional().isString(),
  query('floor').optional().isInt(),
  validateRequest
], async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.query.building) query['location.building'] = req.query.building;
    if (req.query.floor) query['location.floor'] = parseInt(req.query.floor);

    const machines = await Machine.find(query)
      .select('machineId type status location currentCycle sensors estimatedAvailable')
      .sort({ 'location.building': 1, 'location.floor': 1, machineId: 1 });

    // Group machines by location
    const locationGroups = machines.reduce((acc, machine) => {
      const locationKey = `${machine.location.building}-${machine.location.floor}`;
      if (!acc[locationKey]) {
        acc[locationKey] = {
          building: machine.location.building,
          floor: machine.location.floor,
          machines: []
        };
      }
      acc[locationKey].machines.push(machine);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        locations: Object.values(locationGroups),
        summary: {
          total: machines.length,
          available: machines.filter(m => m.status === 'available').length,
          inUse: machines.filter(m => m.status === 'in_use').length,
          maintenance: machines.filter(m => m.status === 'maintenance').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching machine status',
      error: error.message
    });
  }
});

// Get available time slots for a machine
router.get('/machines/:machineId/availability', [
  query('date').isISO8601(),
  validateRequest
], async (req, res) => {
  try {
    const machine = await Machine.findOne({
      $or: [
        { _id: req.params.machineId },
        { machineId: req.params.machineId }
      ],
      isActive: true
    });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    const queryDate = new Date(req.query.date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    // Get existing bookings for the day
    const bookings = await Booking.find({
      machineId: machine.machineId,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      'scheduledTime.start': {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ 'scheduledTime.start': 1 });

    // Generate time slots (operating hours: 6 AM to 11 PM)
    const operatingStart = 6; // 6 AM
    const operatingEnd = 23; // 11 PM
    const slotDuration = 30; // 30 minutes
    const timeSlots = [];

    for (let hour = operatingStart; hour < operatingEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(startOfDay);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Check if slot conflicts with existing bookings
        const isAvailable = !bookings.some(booking => {
          const bookingStart = new Date(booking.scheduledTime.start);
          const bookingEnd = new Date(booking.scheduledTime.end);
          return (slotStart < bookingEnd && slotEnd > bookingStart);
        });

        timeSlots.push({
          start: slotStart,
          end: slotEnd,
          available: isAvailable && slotStart > new Date() // Can't book past slots
        });
      }
    }

    res.json({
      success: true,
      data: {
        machine: {
          id: machine.machineId,
          type: machine.type,
          location: machine.fullLocation
        },
        date: queryDate.toISOString().split('T')[0],
        timeSlots,
        existingBookings: bookings.map(b => ({
          id: b._id,
          start: b.scheduledTime.start,
          end: b.scheduledTime.end,
          program: b.program.name,
          status: b.status
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching machine availability',
      error: error.message
    });
  }
});

// Get machine usage analytics (admin only)
router.get('/analytics/usage', [
  auth,
  query('period').optional().isIn(['daily', 'weekly', 'monthly']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const period = req.query.period || 'weekly';
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    let startDate;
    switch (period) {
      case 'daily':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
    }

    // Get booking analytics
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            program: '$program.name'
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$payment.amount' },
          avgDuration: { $avg: '$duration' }
        }
      },
      {
        $sort: { '_id.date': 1, '_id.program': 1 }
      }
    ]);

    // Get machine utilization
    const machineStats = await Machine.getUsageStats();

    res.json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate,
          type: period
        },
        bookings: bookingStats,
        machines: machineStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching usage analytics',
      error: error.message
    });
  }
});

// Get popular programs
router.get('/analytics/programs', [
  auth,
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const popularPrograms = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: '$program.name',
          usage: { $sum: 1 },
          avgRating: { $avg: '$rating.overall' },
          totalRevenue: { $sum: '$payment.amount' }
        }
      },
      {
        $sort: { usage: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.json({
      success: true,
      data: popularPrograms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching program analytics',
      error: error.message
    });
  }
});

export default router;
