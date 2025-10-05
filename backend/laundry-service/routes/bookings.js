import express from 'express';
import Booking from '../models/Booking.js';
import Machine from '../models/Machine.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, query, param } from 'express-validator';

const router = express.Router();

// Get all bookings with filtering and pagination
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  query('userId').optional().isMongoId(),
  query('machineId').optional().isString(),
  validateRequest
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.machineId) query.machineId = req.query.machineId;

    // If not admin, only show user's own bookings
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }

    // Execute query
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('machine', 'machineId type location')
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Booking.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// Get user's bookings
router.get('/my-bookings', [
  auth,
  query('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  validateRequest
], async (req, res) => {
  try {
    const bookings = await Booking.findByUser(req.user.id, req.query.status);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user bookings',
      error: error.message
    });
  }
});

// Get upcoming bookings
router.get('/upcoming', [
  auth,
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const bookings = await Booking.getUpcoming(userId);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming bookings',
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:id', [
  auth,
  param('id').isMongoId(),
  validateRequest
], async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // If not admin, only show user's own booking
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }

    const booking = await Booking.findOne(query)
      .populate('machine', 'machineId type location programs')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// Create new booking
router.post('/', [
  auth,
  body('machineId').isString().notEmpty(),
  body('program.name').isString().notEmpty(),
  body('scheduledTime.start').isISO8601(),
  body('specialInstructions').optional().isString().isLength({ max: 500 }),
  body('items').optional().isArray(),
  validateRequest
], async (req, res) => {
  try {
    // Find the machine
    const machine = await Machine.findOne({
      $or: [
        { _id: req.body.machineId },
        { machineId: req.body.machineId }
      ],
      isActive: true
    });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    if (machine.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Machine is not available'
      });
    }

    // Find the program
    const program = machine.programs.find(p => p.name === req.body.program.name);
    if (!program) {
      return res.status(400).json({
        success: false,
        message: 'Program not found for this machine'
      });
    }

    // Check for time conflicts
    const scheduledStart = new Date(req.body.scheduledTime.start);
    const scheduledEnd = new Date(scheduledStart.getTime() + program.duration * 60000);

    const conflictingBooking = await Booking.findOne({
      machineId: machine.machineId,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      $or: [
        {
          'scheduledTime.start': { $lt: scheduledEnd },
          'scheduledTime.end': { $gt: scheduledStart }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Create booking
    const bookingData = {
      userId: req.user.id,
      machineId: machine.machineId,
      machine: machine._id,
      program: {
        name: program.name,
        duration: program.duration,
        price: program.price
      },
      scheduledTime: {
        start: scheduledStart,
        end: scheduledEnd
      },
      specialInstructions: req.body.specialInstructions,
      items: req.body.items,
      metadata: {
        source: req.body.source || 'web',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate the booking before returning
    await booking.populate('machine', 'machineId type location');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// Confirm booking
router.patch('/:id/confirm', [
  auth,
  param('id').isMongoId(),
  validateRequest
], async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // If not admin, only allow user to confirm their own booking
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be confirmed'
      });
    }

    await booking.confirm();

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error confirming booking',
      error: error.message
    });
  }
});

// Start booking
router.patch('/:id/start', [
  auth,
  param('id').isMongoId(),
  validateRequest
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('machine');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'confirmed' && booking.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be started'
      });
    }

    // Check if it's time to start (within 15 minutes of scheduled time)
    const now = new Date();
    const timeDiff = Math.abs(now - booking.scheduledTime.start) / (1000 * 60); // in minutes

    if (timeDiff > 15) {
      return res.status(400).json({
        success: false,
        message: 'Booking can only be started within 15 minutes of scheduled time'
      });
    }

    // Start the booking
    await booking.start();

    // Start the machine cycle
    const program = {
      name: booking.program.name,
      duration: booking.program.duration
    };
    await booking.machine.startCycle(program, booking.userId, booking._id);

    res.json({
      success: true,
      message: 'Booking started successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting booking',
      error: error.message
    });
  }
});

// Complete booking
router.patch('/:id/complete', [
  auth,
  param('id').isMongoId(),
  validateRequest
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('machine');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in progress'
      });
    }

    // Complete the booking
    await booking.complete();

    // Complete the machine cycle
    await booking.machine.completeCycle();

    res.json({
      success: true,
      message: 'Booking completed successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing booking',
      error: error.message
    });
  }
});

// Cancel booking
router.patch('/:id/cancel', [
  auth,
  param('id').isMongoId(),
  body('reason').optional().isString().isLength({ max: 500 }),
  validateRequest
], async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // If not admin, only allow user to cancel their own booking
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!['scheduled', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }

    await booking.cancel(req.body.reason);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// Add rating to booking
router.patch('/:id/rating', [
  auth,
  param('id').isMongoId(),
  body('overall').isInt({ min: 1, max: 5 }),
  body('cleanliness').optional().isInt({ min: 1, max: 5 }),
  body('efficiency').optional().isInt({ min: 1, max: 5 }),
  body('feedback').optional().isString().isLength({ max: 1000 }),
  validateRequest
], async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Completed booking not found'
      });
    }

    if (booking.rating.overall) {
      return res.status(400).json({
        success: false,
        message: 'Booking has already been rated'
      });
    }

    await booking.addRating(req.body);

    // Update machine's average rating
    const machine = await Machine.findById(booking.machine);
    if (machine) {
      const allRatings = await Booking.find({
        machine: machine._id,
        'rating.overall': { $exists: true }
      });

      if (allRatings.length > 0) {
        const avgRating = allRatings.reduce((sum, b) => sum + b.rating.overall, 0) / allRatings.length;
        machine.usage.averageRating = Math.round(avgRating * 10) / 10;
        await machine.save();
      }
    }

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding rating',
      error: error.message
    });
  }
});

// Get booking revenue statistics (admin only)
router.get('/stats/revenue', [
  auth,
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  validateRequest
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const dateRange = {
      start: new Date(req.query.startDate),
      end: new Date(req.query.endDate)
    };

    const stats = await Booking.getRevenueStats(dateRange);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue statistics',
      error: error.message
    });
  }
});

export default router;
