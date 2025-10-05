import express from 'express';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, query, param } from 'express-validator';
import { logger } from '../utils/logger.js';
import { sendEmail, sendSMS, sendPushNotification } from '../services/notificationService.js';

const router = express.Router();

// Get user notifications
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['unread', 'read', 'archived']),
  query('type').optional().isIn(['booking', 'payment', 'machine_status', 'lost_found', 'system']),
  validateRequest
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Notification.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Create notification
router.post('/', [
  auth,
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('title').isString().isLength({ min: 1, max: 100 }),
  body('message').isString().isLength({ min: 1, max: 500 }),
  body('type').isIn(['booking', 'payment', 'machine_status', 'lost_found', 'system']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('channels').optional().isArray(),
  validateRequest
], async (req, res) => {
  try {
    const { userId, title, message, type, priority, channels, metadata } = req.body;

    // Create notification record
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      priority: priority || 'medium',
      metadata: metadata || {},
      deliveryChannels: channels || ['in_app']
    });

    await notification.save();

    // Send notification through specified channels
    if (channels) {
      const user = await getUserById(userId); // Assume this function exists
      
      for (const channel of channels) {
        try {
          switch (channel) {
            case 'email':
              if (user.email) {
                await sendEmail(user.email, title, message);
              }
              break;
            case 'sms':
              if (user.phoneNumber) {
                await sendSMS(user.phoneNumber, message);
              }
              break;
            case 'push':
              if (user.pushTokens && user.pushTokens.length > 0) {
                await sendPushNotification(user.pushTokens, title, message);
              }
              break;
            case 'websocket':
              // Send real-time notification via Socket.IO
              req.io.to(`user_${userId}`).emit('notification', {
                id: notification._id,
                title,
                message,
                type,
                priority,
                timestamp: notification.createdAt
              });
              break;
          }
        } catch (channelError) {
          logger.error(`Failed to send notification via ${channel}:`, channelError);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Notification created and sent',
      data: notification
    });

  } catch (error) {
    logger.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', [
  auth,
  param('notificationId').isMongoId(),
  validateRequest
], async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.notificationId, 
        userId: req.user.id 
      },
      { 
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', [
  auth,
  validateRequest
], async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { 
        userId: req.user.id,
        status: 'unread'
      },
      { 
        status: 'read',
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });

  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:notificationId', [
  auth,
  param('notificationId').isMongoId(),
  validateRequest
], async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

// Get notification statistics
router.get('/stats', [auth], async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Notification.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Notification.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        byType: typeStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        byPriority: priorityStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    logger.error('Notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
});

// Mock function - replace with actual user service call
async function getUserById(userId) {
  // This should call your user service or database
  return {
    id: userId,
    email: 'user@example.com',
    phoneNumber: '+1234567890',
    pushTokens: []
  };
}

export default router;