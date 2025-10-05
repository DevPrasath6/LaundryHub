import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['booking', 'payment', 'machine_status', 'lost_found', 'system', 'promotional', 'reminder'],
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread',
    index: true
  },
  deliveryChannels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push', 'websocket']
  }],
  metadata: {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    machineId: { type: String },
    itemId: { type: String },
    actionUrl: { type: String },
    imageUrl: { type: String },
    expiresAt: { type: Date },
    customData: { type: Schema.Types.Mixed }
  },
  deliveryStatus: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      error: { type: String }
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      error: { type: String }
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      error: { type: String }
    }
  },
  readAt: {
    type: Date
  },
  archivedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ 'metadata.expiresAt': 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is urgent
notificationSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent';
});

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.metadata.expiresAt && this.metadata.expiresAt < new Date();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Method to archive
notificationSchema.methods.archive = function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, status: 'unread' });
};

// Static method to cleanup old notifications
notificationSchema.statics.cleanupOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    status: 'archived',
    archivedAt: { $lt: cutoffDate }
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;