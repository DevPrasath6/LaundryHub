const mongoose = require('mongoose');

const LostItemSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    required: true,
    enum: ['clothing', 'accessory', 'personal_item', 'electronic', 'jewelry', 'document', 'other']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  color: {
    primary: { type: String, required: true },
    secondary: String,
    pattern: String
  },
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'ONE_SIZE', 'CHILD', 'ADULT']
  },
  brand: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    enum: ['cotton', 'polyester', 'wool', 'silk', 'denim', 'leather', 'synthetic', 'mixed', 'unknown']
  },
  location: {
    lastSeen: {
      type: String,
      required: true
    },
    foundAt: String,
    machineNumber: String,
    floor: String,
    section: String
  },
  dateReported: {
    type: Date,
    default: Date.now,
    required: true
  },
  dateLost: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'matched', 'claimed', 'expired', 'cancelled'],
    default: 'active'
  },
  images: [{
    url: String,
    description: String,
    uploadedAt: { type: Date, default: Date.now },
    aiAnalysis: {
      dominantColors: [String],
      detectedObjects: [String],
      textContent: [String],
      confidence: Number
    }
  }],
  aiFeatures: {
    visualEmbedding: [Number], // 512-dimensional feature vector
    textEmbedding: [Number],   // 384-dimensional text embedding
    colorHistogram: [Number],   // Color distribution
    shapeFeatures: [Number],    // Shape and texture features
    lastAnalyzed: Date
  },
  matchingCriteria: {
    strictMode: { type: Boolean, default: false },
    toleranceLevel: { type: Number, default: 0.8, min: 0.1, max: 1.0 },
    priorityFeatures: [String] // ['color', 'type', 'size', 'brand']
  },
  matches: [{
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem' },
    similarityScore: Number,
    matchedFeatures: [String],
    aiConfidence: Number,
    matchedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' }
  }],
  notifications: {
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
    pushSent: { type: Boolean, default: false },
    reminderCount: { type: Number, default: 0 },
    lastNotified: Date
  },
  reward: {
    offered: { type: Boolean, default: false },
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    claimed: { type: Boolean, default: false }
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  tags: [String],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
LostItemSchema.index({ reportedBy: 1, status: 1 });
LostItemSchema.index({ itemType: 1, status: 1 });
LostItemSchema.index({ dateReported: -1 });
LostItemSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
LostItemSchema.index({ 'location.lastSeen': 1 });
LostItemSchema.index({ 'color.primary': 1, itemType: 1 });

// Virtual for days since reported
LostItemSchema.virtual('daysSinceReported').get(function() {
  return Math.floor((Date.now() - this.dateReported) / (1000 * 60 * 60 * 24));
});

// Virtual for match count
LostItemSchema.virtual('matchCount').get(function() {
  return this.matches ? this.matches.length : 0;
});

// Virtual for active matches
LostItemSchema.virtual('activeMatches').get(function() {
  return this.matches ? this.matches.filter(match => match.status === 'pending') : [];
});

// Instance methods
LostItemSchema.methods.addMatch = function(foundItemId, similarityScore, matchedFeatures, aiConfidence) {
  this.matches.push({
    foundItemId,
    similarityScore,
    matchedFeatures,
    aiConfidence,
    status: 'pending'
  });
  return this.save();
};

LostItemSchema.methods.updateMatchStatus = function(matchId, status) {
  const match = this.matches.id(matchId);
  if (match) {
    match.status = status;
    if (status === 'confirmed') {
      this.status = 'matched';
    }
    return this.save();
  }
  throw new Error('Match not found');
};

LostItemSchema.methods.markAsClaimed = function() {
  this.status = 'claimed';
  if (this.reward.offered) {
    this.reward.claimed = true;
  }
  return this.save();
};

LostItemSchema.methods.updateAIFeatures = function(features) {
  this.aiFeatures = {
    ...this.aiFeatures,
    ...features,
    lastAnalyzed: new Date()
  };
  return this.save();
};

LostItemSchema.methods.sendNotification = function(type) {
  switch (type) {
    case 'email':
      this.notifications.emailSent = true;
      break;
    case 'sms':
      this.notifications.smsSent = true;
      break;
    case 'push':
      this.notifications.pushSent = true;
      break;
  }
  this.notifications.lastNotified = new Date();
  this.notifications.reminderCount += 1;
  return this.save();
};

// Static methods
LostItemSchema.statics.findActiveItems = function() {
  return this.find({
    status: { $in: ['active', 'matched'] },
    expiresAt: { $gt: new Date() }
  });
};

LostItemSchema.statics.findByLocation = function(location) {
  return this.find({
    $or: [
      { 'location.lastSeen': new RegExp(location, 'i') },
      { 'location.foundAt': new RegExp(location, 'i') },
      { 'location.section': new RegExp(location, 'i') }
    ],
    status: 'active'
  });
};

LostItemSchema.statics.findSimilarItems = function(itemType, color, size) {
  const query = { status: 'active', itemType };

  if (color) {
    query.$or = [
      { 'color.primary': new RegExp(color, 'i') },
      { 'color.secondary': new RegExp(color, 'i') }
    ];
  }

  if (size) {
    query.size = size;
  }

  return this.find(query);
};

LostItemSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDaysOpen: {
          $avg: {
            $divide: [
              { $subtract: [new Date(), '$dateReported'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]);
};

// Pre-save middleware
LostItemSchema.pre('save', function(next) {
  if (this.isModified('description')) {
    this.description = this.description.toLowerCase().trim();
  }

  if (this.isModified('brand')) {
    this.brand = this.brand.toLowerCase().trim();
  }

  next();
});

// Pre-remove middleware
LostItemSchema.pre('remove', function(next) {
  // Clean up associated files/images
  // This would typically involve cloud storage cleanup
  next();
});

module.exports = mongoose.model('LostItem', LostItemSchema);
