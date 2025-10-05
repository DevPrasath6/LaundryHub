import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'BKG' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  machineId: {
    type: String,
    required: true
  },
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  program: {
    name: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true // in minutes
    },
    price: {
      type: Number,
      required: true
    }
  },
  scheduledTime: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  actualTime: {
    start: Date,
    end: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  payment: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ['card', 'cash', 'digital_wallet', 'subscription'],
      default: 'card'
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  items: [{
    type: {
      type: String,
      enum: ['clothing', 'bedding', 'curtains', 'shoes', 'delicate', 'other']
    },
    description: String,
    quantity: Number,
    weight: Number // in kg
  }],
  notifications: {
    sms: {
      type: Boolean,
      default: false
    },
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  rating: {
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    efficiency: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      maxlength: 1000
    },
    ratedAt: Date
  },
  cancellation: {
    reason: String,
    cancelledAt: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'rejected']
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'kiosk', 'staff'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String,
    promocode: String,
    discount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ machineId: 1, status: 1 });
bookingSchema.index({ 'scheduledTime.start': 1, 'scheduledTime.end': 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ bookingId: 1 });

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  if (this.actualTime.start && this.actualTime.end) {
    return Math.round((this.actualTime.end - this.actualTime.start) / (1000 * 60)); // in minutes
  }
  return this.program.duration;
});

// Virtual for time remaining
bookingSchema.virtual('timeRemaining').get(function() {
  if (this.status === 'in_progress' && this.actualTime.start) {
    const elapsed = (new Date() - this.actualTime.start) / (1000 * 60); // in minutes
    return Math.max(0, this.program.duration - elapsed);
  }
  return 0;
});

// Virtual for is overdue
bookingSchema.virtual('isOverdue').get(function() {
  if (this.status === 'scheduled') {
    return new Date() > this.scheduledTime.start;
  }
  return false;
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  // Calculate end time if not set
  if (this.scheduledTime.start && !this.scheduledTime.end) {
    this.scheduledTime.end = new Date(this.scheduledTime.start.getTime() + this.program.duration * 60000);
  }

  // Update payment amount based on program price and discounts
  if (this.program.price && this.metadata.discount) {
    this.payment.amount = this.program.price - this.metadata.discount;
  } else if (this.program.price) {
    this.payment.amount = this.program.price;
  }

  next();
});

// Methods
bookingSchema.methods.confirm = function() {
  this.status = 'confirmed';
  return this.save();
};

bookingSchema.methods.start = function() {
  this.status = 'in_progress';
  this.actualTime.start = new Date();
  this.actualTime.end = new Date(Date.now() + this.program.duration * 60000);
  return this.save();
};

bookingSchema.methods.complete = function() {
  this.status = 'completed';
  this.actualTime.end = new Date();
  return this.save();
};

bookingSchema.methods.cancel = function(reason = 'User cancelled') {
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    cancelledAt: new Date(),
    refundAmount: this.calculateRefund(),
    refundStatus: 'pending'
  };
  return this.save();
};

bookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  const timeUntilStart = this.scheduledTime.start - now;
  const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);

  // Refund policy: 100% if cancelled 24+ hours before, 50% if 2-24 hours, 0% if less than 2 hours
  if (hoursUntilStart >= 24) {
    return this.payment.amount;
  } else if (hoursUntilStart >= 2) {
    return this.payment.amount * 0.5;
  } else {
    return 0;
  }
};

bookingSchema.methods.addRating = function(ratingData) {
  this.rating = {
    ...ratingData,
    ratedAt: new Date()
  };
  return this.save();
};

// Static methods
bookingSchema.statics.findByUser = function(userId, status = null) {
  const query = { userId };
  if (status) query.status = status;
  return this.find(query).populate('machine').sort({ createdAt: -1 });
};

bookingSchema.statics.findByMachine = function(machineId, dateRange = null) {
  const query = { machineId };
  if (dateRange) {
    query['scheduledTime.start'] = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  return this.find(query).populate('userId', 'name email').sort({ 'scheduledTime.start': 1 });
};

bookingSchema.statics.getUpcoming = function(userId = null) {
  const query = {
    status: { $in: ['scheduled', 'confirmed'] },
    'scheduledTime.start': { $gte: new Date() }
  };
  if (userId) query.userId = userId;
  return this.find(query).populate('machine').sort({ 'scheduledTime.start': 1 });
};

bookingSchema.statics.getRevenueStats = function(dateRange) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        'payment.status': 'completed',
        createdAt: {
          $gte: dateRange.start,
          $lte: dateRange.end
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        totalRevenue: { $sum: '$payment.amount' },
        bookingCount: { $sum: 1 },
        avgBookingValue: { $avg: '$payment.amount' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

export default mongoose.model('Booking', bookingSchema);
