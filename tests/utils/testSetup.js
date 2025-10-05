// Test configuration and setup utilities
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const redis = require('redis');

class TestEnvironment {
  constructor() {
    this.mongoServer = null;
    this.redisClient = null;
  }

  async setup() {
    // Setup in-memory MongoDB for testing
    this.mongoServer = await MongoMemoryServer.create();
    const mongoUri = this.mongoServer.getUri();

    await mongoose.connect(mongoUri);

    // Setup Redis mock
    const { createClient } = require('redis-mock');
    this.redisClient = createClient();

    console.log('Test environment setup complete');
  }

  async teardown() {
    await mongoose.disconnect();
    if (this.mongoServer) {
      await this.mongoServer.stop();
    }
    if (this.redisClient) {
      this.redisClient.quit();
    }
    console.log('Test environment cleaned up');
  }

  async clearDatabase() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

// Mock data generators
const generateMockUser = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'hashedPassword123',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer',
  isActive: true,
  ...overrides
});

const generateMockMachine = (overrides = {}) => ({
  machineId: 'WASH001',
  type: 'washer',
  status: 'available',
  location: 'Floor 1 - Section A',
  capacity: 8,
  pricePerCycle: 3.50,
  features: ['hot_water', 'delicate_cycle'],
  ...overrides
});

const generateMockBooking = (overrides = {}) => ({
  userId: new mongoose.Types.ObjectId(),
  machineId: 'WASH001',
  startTime: new Date(),
  endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  status: 'confirmed',
  totalAmount: 3.50,
  ...overrides
});

module.exports = {
  TestEnvironment,
  generateMockUser,
  generateMockMachine,
  generateMockBooking
};
