import express from 'express';
import Payment from '../models/Payment.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, query, param } from 'express-validator';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Process payment
router.post('/process', [
  auth,
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'INR', 'ETH', 'BTC']),
  body('paymentMethod').isIn(['card', 'wallet', 'crypto', 'cash', 'bank_transfer']),
  body('paymentGateway').optional().isIn(['stripe', 'paypal', 'blockchain', 'razorpay', 'square']),
  validateRequest
], async (req, res) => {
  try {
    const { bookingId, amount, currency, paymentMethod, paymentGateway } = req.body;

    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({ 
      bookingId, 
      status: { $in: ['completed', 'processing'] } 
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Payment already processed for this booking'
      });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.user.id,
      bookingId,
      amount,
      currency: currency || 'USD',
      paymentMethod,
      paymentGateway,
      status: 'pending',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await payment.save();

    // Process payment based on method
    let paymentResult;
    switch (paymentMethod) {
      case 'card':
        paymentResult = await processCardPayment(payment);
        break;
      case 'wallet':
        paymentResult = await processWalletPayment(payment, req.user.id);
        break;
      case 'crypto':
        paymentResult = await processCryptoPayment(payment);
        break;
      case 'cash':
        paymentResult = await processCashPayment(payment);
        break;
      default:
        throw new Error('Unsupported payment method');
    }

    // Update payment status
    payment.status = paymentResult.success ? 'completed' : 'failed';
    payment.gatewayPaymentId = paymentResult.gatewayPaymentId;
    payment.blockchainTxHash = paymentResult.txHash;
    payment.failureReason = paymentResult.error;

    await payment.save();

    res.status(200).json({
      success: paymentResult.success,
      message: paymentResult.success ? 'Payment processed successfully' : 'Payment failed',
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      }
    });

  } catch (error) {
    logger.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// Get payment history
router.get('/history', [
  auth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']),
  validateRequest
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };
    if (req.query.status) query.status = req.query.status;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('bookingId', 'machineId scheduledTime')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Payment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

// Get payment details
router.get('/:paymentId', [
  auth,
  param('paymentId').isMongoId(),
  validateRequest
], async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('userId', 'firstName lastName email')
      .populate('bookingId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Users can only view their own payments (unless admin)
    if (payment.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    logger.error('Payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
});

// Refund payment
router.post('/:paymentId/refund', [
  auth,
  param('paymentId').isMongoId(),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('reason').isString().isLength({ min: 5, max: 500 }),
  validateRequest
], async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    const refundAmount = amount || payment.amount;
    
    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed original payment amount'
      });
    }

    // Process refund based on original payment method
    const refundResult = await processRefund(payment, refundAmount, reason);

    if (refundResult.success) {
      payment.status = 'refunded';
      payment.refundInfo = {
        refundId: refundResult.refundId,
        refundAmount,
        refundReason: reason,
        refundedAt: new Date()
      };
      await payment.save();
    }

    res.json({
      success: refundResult.success,
      message: refundResult.success ? 'Refund processed successfully' : 'Refund failed',
      data: refundResult.success ? {
        refundId: refundResult.refundId,
        refundAmount,
        originalAmount: payment.amount
      } : null
    });

  } catch (error) {
    logger.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund processing failed',
      error: error.message
    });
  }
});

// Mock payment processing functions (replace with actual gateway integrations)
async function processCardPayment(payment) {
  // Simulate card payment processing
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      resolve({
        success,
        gatewayPaymentId: success ? `card_${Date.now()}` : null,
        error: success ? null : 'Card payment failed'
      });
    }, 2000);
  });
}

async function processWalletPayment(payment, userId) {
  // Check wallet balance and deduct amount
  return {
    success: true,
    gatewayPaymentId: `wallet_${Date.now()}`
  };
}

async function processCryptoPayment(payment) {
  // Simulate blockchain transaction
  return {
    success: true,
    gatewayPaymentId: `crypto_${Date.now()}`,
    txHash: `0x${Math.random().toString(16).substr(2, 64)}`
  };
}

async function processCashPayment(payment) {
  // Mark as pending for cash collection
  return {
    success: true,
    gatewayPaymentId: `cash_${Date.now()}`
  };
}

async function processRefund(payment, amount, reason) {
  // Simulate refund processing
  return {
    success: true,
    refundId: `refund_${Date.now()}`
  };
}

export default router;