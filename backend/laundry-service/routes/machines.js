import express from 'express';
import Machine from '../models/Machine.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, query, param } from 'express-validator';

const router = express.Router();

// Get all machines with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['washer', 'dryer', 'combo']),
  query('status').optional().isIn(['available', 'in_use', 'maintenance', 'out_of_order']),
  query('building').optional().isString(),
  query('floor').optional().isInt(),
  validateRequest
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.building) query['location.building'] = req.query.building;
    if (req.query.floor) query['location.floor'] = parseInt(req.query.floor);

    // Execute query
    const [machines, total] = await Promise.all([
      Machine.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ 'location.building': 1, 'location.floor': 1, machineId: 1 }),
      Machine.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        machines,
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
      message: 'Error fetching machines',
      error: error.message
    });
  }
});

// Get available machines
router.get('/available', [
  query('type').optional().isIn(['washer', 'dryer', 'combo']),
  query('building').optional().isString(),
  query('floor').optional().isInt(),
  validateRequest
], async (req, res) => {
  try {
    const location = {};
    if (req.query.building) location.building = req.query.building;
    if (req.query.floor) location.floor = parseInt(req.query.floor);

    const machines = await Machine.findAvailable(req.query.type, location);

    res.json({
      success: true,
      data: machines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available machines',
      error: error.message
    });
  }
});

// Get machine by ID
router.get('/:id', [
  param('id').isString().notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const machine = await Machine.findOne({
      $or: [
        { _id: req.params.id },
        { machineId: req.params.id }
      ],
      isActive: true
    });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching machine',
      error: error.message
    });
  }
});

// Create new machine (admin only)
router.post('/', [
  auth,
  body('machineId').isString().notEmpty().trim(),
  body('type').isIn(['washer', 'dryer', 'combo']),
  body('brand').isString().notEmpty().trim(),
  body('model').isString().notEmpty().trim(),
  body('capacity').isNumeric().isFloat({ min: 1, max: 50 }),
  body('location.building').isString().notEmpty().trim(),
  body('location.floor').isInt({ min: 0 }),
  body('location.room').isString().notEmpty().trim(),
  body('pricing.basePrice').isNumeric().isFloat({ min: 0 }),
  validateRequest
], async (req, res) => {
  try {
    // Check if machine ID already exists
    const existingMachine = await Machine.findOne({ machineId: req.body.machineId });
    if (existingMachine) {
      return res.status(400).json({
        success: false,
        message: 'Machine ID already exists'
      });
    }

    const machine = new Machine(req.body);
    await machine.save();

    res.status(201).json({
      success: true,
      message: 'Machine created successfully',
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating machine',
      error: error.message
    });
  }
});

// Update machine
router.put('/:id', [
  auth,
  param('id').isString().notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const machine = await Machine.findOneAndUpdate(
      {
        $or: [
          { _id: req.params.id },
          { machineId: req.params.id }
        ]
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      message: 'Machine updated successfully',
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating machine',
      error: error.message
    });
  }
});

// Update machine status
router.patch('/:id/status', [
  auth,
  param('id').isString().notEmpty(),
  body('status').isIn(['available', 'in_use', 'maintenance', 'out_of_order']),
  validateRequest
], async (req, res) => {
  try {
    const machine = await Machine.findOneAndUpdate(
      {
        $or: [
          { _id: req.params.id },
          { machineId: req.params.id }
        ]
      },
      { status: req.body.status },
      { new: true }
    );

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      message: 'Machine status updated successfully',
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating machine status',
      error: error.message
    });
  }
});

// Update machine sensors
router.patch('/:id/sensors', [
  param('id').isString().notEmpty(),
  body('temperature').optional().isNumeric(),
  body('humidity').optional().isNumeric(),
  body('vibration').optional().isNumeric(),
  body('waterLevel').optional().isNumeric(),
  body('doorStatus').optional().isBoolean(),
  validateRequest
], async (req, res) => {
  try {
    const machine = await Machine.findOne({
      $or: [
        { _id: req.params.id },
        { machineId: req.params.id }
      ]
    });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    await machine.updateSensors(req.body);

    res.json({
      success: true,
      message: 'Sensor data updated successfully',
      data: machine.sensors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating sensor data',
      error: error.message
    });
  }
});

// Start machine cycle
router.post('/:id/start', [
  auth,
  param('id').isString().notEmpty(),
  body('program').isString().notEmpty(),
  body('userId').isMongoId(),
  body('bookingId').optional().isMongoId(),
  validateRequest
], async (req, res) => {
  try {
    const machine = await Machine.findOne({
      $or: [
        { _id: req.params.id },
        { machineId: req.params.id }
      ]
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
    const program = machine.programs.find(p => p.name === req.body.program);
    if (!program) {
      return res.status(400).json({
        success: false,
        message: 'Program not found'
      });
    }

    await machine.startCycle(program, req.body.userId, req.body.bookingId);

    res.json({
      success: true,
      message: 'Machine cycle started successfully',
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting machine cycle',
      error: error.message
    });
  }
});

// Complete machine cycle
router.post('/:id/complete', [
  auth,
  param('id').isString().notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const machine = await Machine.findOne({
      $or: [
        { _id: req.params.id },
        { machineId: req.params.id }
      ]
    });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    if (machine.status !== 'in_use') {
      return res.status(400).json({
        success: false,
        message: 'Machine is not in use'
      });
    }

    await machine.completeCycle();

    res.json({
      success: true,
      message: 'Machine cycle completed successfully',
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing machine cycle',
      error: error.message
    });
  }
});

// Get machine usage statistics
router.get('/:id/stats', [
  param('id').isString().notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const machine = await Machine.findOne({
      $or: [
        { _id: req.params.id },
        { machineId: req.params.id }
      ]
    });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    const stats = {
      totalCycles: machine.usage.totalCycles,
      totalHours: machine.usage.totalHours,
      averageRating: machine.usage.averageRating,
      lastUsed: machine.usage.lastUsed,
      uptime: machine.usage.totalHours > 0 ? (machine.usage.totalHours / (24 * 7)) * 100 : 0, // Weekly uptime %
      efficiency: machine.usage.totalCycles > 0 ? machine.usage.totalHours / machine.usage.totalCycles : 0 // Hours per cycle
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching machine statistics',
      error: error.message
    });
  }
});

// Delete machine (soft delete)
router.delete('/:id', [
  auth,
  param('id').isString().notEmpty(),
  validateRequest
], async (req, res) => {
  try {
    const machine = await Machine.findOneAndUpdate(
      {
        $or: [
          { _id: req.params.id },
          { machineId: req.params.id }
        ]
      },
      { isActive: false },
      { new: true }
    );

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      message: 'Machine deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting machine',
      error: error.message
    });
  }
});

export default router;
