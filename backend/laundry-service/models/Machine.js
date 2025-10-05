import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  machineId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['washer', 'dryer', 'combo'],
    lowercase: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 50 // kg
  },
  location: {
    building: {
      type: String,
      required: true,
      trim: true
    },
    floor: {
      type: Number,
      required: true
    },
    room: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'in_use', 'maintenance', 'out_of_order'],
    default: 'available'
  },
  features: [{
    type: String,
    enum: ['steam', 'sanitize', 'eco_mode', 'quick_wash', 'heavy_duty', 'delicate']
  }],
  programs: [{
    name: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true // in minutes
    },
    temperature: {
      type: String,
      enum: ['cold', 'warm', 'hot', 'variable']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  currentCycle: {
    startTime: Date,
    endTime: Date,
    program: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  sensors: {
    temperature: {
      type: Number,
      default: 0
    },
    humidity: {
      type: Number,
      default: 0
    },
    vibration: {
      type: Number,
      default: 0
    },
    waterLevel: {
      type: Number,
      default: 0
    },
    doorStatus: {
      type: Boolean,
      default: false
    },
    lastUpdate: {
      type: Date,
      default: Date.now
    }
  },
  maintenance: {
    lastService: Date,
    nextService: Date,
    serviceHistory: [{
      date: Date,
      type: String,
      technician: String,
      notes: String,
      cost: Number
    }],
    warrantyExpiry: Date
  },
  usage: {
    totalCycles: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    pricePerMinute: {
      type: Number,
      default: 0,
      min: 0
    },
    peakHourMultiplier: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
machineSchema.index({ machineId: 1 });
machineSchema.index({ type: 1, status: 1 });
machineSchema.index({ 'location.building': 1, 'location.floor': 1 });
machineSchema.index({ status: 1, isActive: 1 });

// Virtual for estimated availability
machineSchema.virtual('estimatedAvailable').get(function() {
  if (this.status === 'in_use' && this.currentCycle.endTime) {
    return this.currentCycle.endTime;
  }
  return new Date();
});

// Virtual for full location string
machineSchema.virtual('fullLocation').get(function() {
  return `${this.location.building}, Floor ${this.location.floor}, ${this.location.room}`;
});

// Methods
machineSchema.methods.startCycle = function(program, userId, bookingId) {
  this.status = 'in_use';
  this.currentCycle = {
    startTime: new Date(),
    endTime: new Date(Date.now() + program.duration * 60000),
    program: program.name,
    userId,
    bookingId
  };
  this.usage.totalCycles += 1;
  return this.save();
};

machineSchema.methods.completeCycle = function() {
  this.status = 'available';
  if (this.currentCycle.startTime && this.currentCycle.endTime) {
    const duration = (this.currentCycle.endTime - this.currentCycle.startTime) / (1000 * 60 * 60);
    this.usage.totalHours += duration;
  }
  this.usage.lastUsed = new Date();
  this.currentCycle = {};
  return this.save();
};

machineSchema.methods.setMaintenance = function(type = 'scheduled') {
  this.status = 'maintenance';
  this.maintenance.lastService = new Date();
  return this.save();
};

machineSchema.methods.updateSensors = function(sensorData) {
  this.sensors = {
    ...this.sensors,
    ...sensorData,
    lastUpdate: new Date()
  };
  return this.save();
};

// Static methods
machineSchema.statics.findAvailable = function(type = null, location = null) {
  const query = { status: 'available', isActive: true };
  if (type) query.type = type;
  if (location) {
    if (location.building) query['location.building'] = location.building;
    if (location.floor) query['location.floor'] = location.floor;
    if (location.room) query['location.room'] = location.room;
  }
  return this.find(query);
};

machineSchema.statics.getUsageStats = function(machineId = null, timeRange = null) {
  const pipeline = [];

  if (machineId) {
    pipeline.push({ $match: { machineId } });
  }

  pipeline.push({
    $group: {
      _id: '$type',
      totalMachines: { $sum: 1 },
      totalCycles: { $sum: '$usage.totalCycles' },
      totalHours: { $sum: '$usage.totalHours' },
      avgRating: { $avg: '$usage.averageRating' }
    }
  });

  return this.aggregate(pipeline);
};

export default mongoose.model('Machine', machineSchema);
