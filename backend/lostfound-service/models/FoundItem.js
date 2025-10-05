const mongoose = require('mongoose');

const FoundItemSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
    required: true
  },
  location: {
    foundAt: {
      type: String,
      required: true
    },
    currentLocation: {
      type: String,
      required: true
    },
    machineNumber: String,
    floor: String,
    section: String,
    storageUnit: String
  },
  dateFound: {
    type: Date,
    required: true
  },
  dateReported: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['stored', 'matched', 'claimed', 'donated', 'disposed'],
    default: 'stored'
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
  matches: [{
    lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem' },
    similarityScore: Number,
    matchedFeatures: [String],
    aiConfidence: Number,
    matchedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' }
  }],
  claimProcess: {
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    claimDate: Date,
    verificationQuestions: [{
      question: String,
      answer: String,
      correct: Boolean
    }],
    verificationScore: Number,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalDate: Date,
    pickupDeadline: Date,
    pickupCode: String
  },
  storage: {
    shelfLocation: String,
    bagNumber: String,
    storageDate: { type: Date, default: Date.now },
    accessCount: { type: Number, default: 0 },
    lastAccessed: Date
  },
  disposition: {
    type: String,
    enum: ['pending', 'return_to_owner', 'donate', 'dispose', 'auction'],
    default: 'pending'
  },
  dispositionDate: Date,
  dispositionReason: String,
  value: {
    estimated: Number,
    currency: { type: String, default: 'USD' },
    assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assessmentDate: Date
  },
  tags: [String],
  notes: [{
    content: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: false }
  }],
  auditLog: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: String,
    oldValue: String,
    newValue: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
FoundItemSchema.index({ reportedBy: 1, status: 1 });
FoundItemSchema.index({ itemType: 1, status: 1 });
FoundItemSchema.index({ dateFound: -1 });
FoundItemSchema.index({ dateReported: -1 });
FoundItemSchema.index({ 'location.foundAt': 1 });
FoundItemSchema.index({ 'location.currentLocation': 1 });
FoundItemSchema.index({ 'color.primary': 1, itemType: 1 });
FoundItemSchema.index({ 'storage.shelfLocation': 1 });

// Virtual for days in storage
FoundItemSchema.virtual('daysInStorage').get(function() {
  const storageDate = this.storage.storageDate || this.dateReported;
  return Math.floor((Date.now() - storageDate) / (1000 * 60 * 60 * 24));
});

// Virtual for match count
FoundItemSchema.virtual('matchCount').get(function() {
  return this.matches ? this.matches.length : 0;
});

// Virtual for pending matches
FoundItemSchema.virtual('pendingMatches').get(function() {
  return this.matches ? this.matches.filter(match => match.status === 'pending') : [];
});

// Virtual for storage location
FoundItemSchema.virtual('fullStorageLocation').get(function() {
  const parts = [
    this.storage.shelfLocation,
    this.storage.bagNumber && `Bag: ${this.storage.bagNumber}`,
    this.location.currentLocation
  ].filter(Boolean);
  return parts.join(' - ');
});

// Instance methods
FoundItemSchema.methods.addMatch = function(lostItemId, similarityScore, matchedFeatures, aiConfidence) {
  this.matches.push({
    lostItemId,
    similarityScore,
    matchedFeatures,
    aiConfidence,
    status: 'pending'
  });
  return this.save();
};

FoundItemSchema.methods.updateMatchStatus = function(matchId, status, userId) {
  const match = this.matches.id(matchId);
  if (match) {
    match.status = status;
    if (status === 'confirmed') {
      this.status = 'matched';
    }
    this.addAuditEntry('match_updated', userId, `Match status changed to ${status}`);
    return this.save();
  }
  throw new Error('Match not found');
};

FoundItemSchema.methods.initiateClaim = function(claimantId, verificationQuestions) {
  this.claimProcess = {
    claimedBy: claimantId,
    claimDate: new Date(),
    verificationQuestions: verificationQuestions || [],
    pickupDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    pickupCode: this.generatePickupCode()
  };
  this.status = 'matched';
  return this.save();
};

FoundItemSchema.methods.approveClaim = function(approverUserId, verificationScore) {
  if (!this.claimProcess.claimedBy) {
    throw new Error('No active claim to approve');
  }

  this.claimProcess.approvedBy = approverUserId;
  this.claimProcess.approvalDate = new Date();
  this.claimProcess.verificationScore = verificationScore;
  this.disposition.type = 'return_to_owner';

  this.addAuditEntry('claim_approved', approverUserId, `Claim approved with score: ${verificationScore}`);
  return this.save();
};

FoundItemSchema.methods.completeClaim = function(staffUserId) {
  this.status = 'claimed';
  this.dispositionDate = new Date();
  this.addAuditEntry('item_claimed', staffUserId, 'Item successfully claimed by owner');
  return this.save();
};

FoundItemSchema.methods.updateAIFeatures = function(features) {
  this.aiFeatures = {
    ...this.aiFeatures,
    ...features,
    lastAnalyzed: new Date()
  };
  return this.save();
};

FoundItemSchema.methods.updateStorageLocation = function(location, bagNumber, userId) {
  this.storage.shelfLocation = location;
  if (bagNumber) this.storage.bagNumber = bagNumber;
  this.storage.lastAccessed = new Date();
  this.storage.accessCount += 1;

  this.addAuditEntry('storage_updated', userId, `Moved to ${location}`);
  return this.save();
};

FoundItemSchema.methods.addNote = function(content, userId, isPublic = false) {
  this.notes.push({
    content,
    addedBy: userId,
    isPublic
  });
  return this.save();
};

FoundItemSchema.methods.addAuditEntry = function(action, userId, details, oldValue, newValue) {
  this.auditLog.push({
    action,
    performedBy: userId,
    details,
    oldValue,
    newValue
  });
};

FoundItemSchema.methods.generatePickupCode = function() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

FoundItemSchema.methods.scheduleDisposition = function(dispositionType, reason, userId) {
  this.disposition.type = dispositionType;
  this.dispositionReason = reason;

  // Set disposition date based on type
  const daysToWait = {
    'donate': 30,
    'dispose': 90,
    'auction': 60
  };

  this.dispositionDate = new Date(Date.now() + (daysToWait[dispositionType] || 30) * 24 * 60 * 60 * 1000);
  this.addAuditEntry('disposition_scheduled', userId, `Scheduled for ${dispositionType}: ${reason}`);
  return this.save();
};

// Static methods
FoundItemSchema.statics.findStoredItems = function() {
  return this.find({
    status: { $in: ['stored', 'matched'] }
  });
};

FoundItemSchema.statics.findByLocation = function(location) {
  return this.find({
    $or: [
      { 'location.foundAt': new RegExp(location, 'i') },
      { 'location.currentLocation': new RegExp(location, 'i') },
      { 'storage.shelfLocation': new RegExp(location, 'i') }
    ]
  });
};

FoundItemSchema.statics.findSimilarItems = function(itemType, color, size) {
  const query = { status: { $in: ['stored', 'matched'] }, itemType };

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

FoundItemSchema.statics.getStorageStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDaysInStorage: {
          $avg: {
            $divide: [
              { $subtract: [new Date(), '$storage.storageDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]);
};

FoundItemSchema.statics.getItemsForDisposition = function() {
  return this.find({
    dispositionDate: { $lte: new Date() },
    status: { $in: ['stored', 'matched'] },
    'disposition.type': { $ne: 'pending' }
  });
};

// Pre-save middleware
FoundItemSchema.pre('save', function(next) {
  if (this.isModified('description')) {
    this.description = this.description.toLowerCase().trim();
  }

  if (this.isModified('brand')) {
    this.brand = this.brand.toLowerCase().trim();
  }

  // Auto-generate pickup code if claim is initiated
  if (this.isModified('claimProcess.claimedBy') && !this.claimProcess.pickupCode) {
    this.claimProcess.pickupCode = this.generatePickupCode();
  }

  next();
});

module.exports = mongoose.model('FoundItem', FoundItemSchema);
