const request = require('supertest');
const { TestEnvironment, generateMockBooking, generateMockMachine } = require('../utils/testSetup');

describe('Laundry Service Integration Tests', () => {
  let testEnv;
  let app;
  let authToken;
  let staffToken;

  beforeAll(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();

    // Import app after test environment is ready
    app = require('../../backend/laundry-service/src/app').app;

    // Register and login test users
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'customer@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Customer'
      });
    authToken = userResponse.body.token;

    const staffResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'staff@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Staff',
        role: 'staff'
      });
    staffToken = staffResponse.body.token;
  });

  afterAll(async () => {
    await testEnv.teardown();
  });

  beforeEach(async () => {
    await testEnv.clearDatabase();
  });

  describe('Machine Management', () => {
    it('should create a new machine (staff only)', async () => {
      const machineData = generateMockMachine();

      const response = await request(app)
        .post('/api/machines')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(machineData)
        .expect(201);

      expect(response.body.data).toMatchObject({
        machineId: machineData.machineId,
        type: machineData.type,
        status: machineData.status
      });
    });

    it('should reject machine creation by regular user', async () => {
      const machineData = generateMockMachine();

      await request(app)
        .post('/api/machines')
        .set('Authorization', `Bearer ${authToken}`)
        .send(machineData)
        .expect(403);
    });

    it('should list all machines', async () => {
      // Create test machines
      const machine1 = generateMockMachine({ machineId: 'WASH001' });
      const machine2 = generateMockMachine({ machineId: 'DRY001', type: 'dryer' });

      await request(app)
        .post('/api/machines')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(machine1);

      await request(app)
        .post('/api/machines')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(machine2);

      const response = await request(app)
        .get('/api/machines')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('machineId');
      expect(response.body.data[1]).toHaveProperty('machineId');
    });

    it('should update machine status', async () => {
      const machine = generateMockMachine();

      const createResponse = await request(app)
        .post('/api/machines')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(machine);

      const machineId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/machines/${machineId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'in_use' })
        .expect(200);

      expect(response.body.data.status).toBe('in_use');
    });
  });

  describe('Booking Management', () => {
    let machineId;

    beforeEach(async () => {
      // Create a test machine
      const machine = generateMockMachine();
      const machineResponse = await request(app)
        .post('/api/machines')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(machine);
      machineId = machineResponse.body.data._id;
    });

    it('should create a new booking', async () => {
      const bookingData = {
        machineId,
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        duration: 60,
        cycleType: 'normal_wash'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.data).toMatchObject({
        machineId,
        duration: 60,
        status: 'confirmed'
      });
    });

    it('should reject booking for unavailable machine', async () => {
      // Update machine to maintenance status
      await request(app)
        .patch(`/api/machines/${machineId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'maintenance' });

      const bookingData = {
        machineId,
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        duration: 60
      };

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(400);
    });

    it('should prevent double booking', async () => {
      const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const bookingData = {
        machineId,
        startTime,
        duration: 60
      };

      // First booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      // Second booking at same time should fail
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(409);
    });

    it('should list user bookings', async () => {
      const booking1 = {
        machineId,
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        duration: 60
      };

      const booking2 = {
        machineId,
        startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        duration: 45
      };

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(booking1);

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(booking2);

      const response = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    it('should cancel a booking', async () => {
      const bookingData = {
        machineId,
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        duration: 60
      };

      const createResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      const bookingId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.status).toBe('cancelled');
    });

    it('should extend booking duration', async () => {
      const bookingData = {
        machineId,
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        duration: 60
      };

      const createResponse = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      const bookingId = createResponse.body.data._id;

      const response = await request(app)
        .patch(`/api/bookings/${bookingId}/extend`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ additionalMinutes: 30 })
        .expect(200);

      expect(response.body.data.duration).toBe(90);
    });
  });

  describe('Machine Availability', () => {
    let machineIds = [];

    beforeEach(async () => {
      // Create multiple test machines
      for (let i = 1; i <= 3; i++) {
        const machine = generateMockMachine({
          machineId: `WASH00${i}`,
          status: 'available'
        });

        const response = await request(app)
          .post('/api/machines')
          .set('Authorization', `Bearer ${staffToken}`)
          .send(machine);

        machineIds.push(response.body.data._id);
      }
    });

    it('should get available machines for time slot', async () => {
      const startTime = new Date(Date.now() + 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const response = await request(app)
        .get('/api/machines/availability')
        .query({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
    });

    it('should exclude booked machines from availability', async () => {
      const startTime = new Date(Date.now() + 60 * 60 * 1000);

      // Book one machine
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          machineId: machineIds[0],
          startTime: startTime.toISOString(),
          duration: 60
        });

      const response = await request(app)
        .get('/api/machines/availability')
        .query({
          startTime: startTime.toISOString(),
          endTime: new Date(startTime.getTime() + 60 * 60 * 1000).toISOString()
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('Real-time Updates', () => {
    it('should send real-time machine status updates', async () => {
      const machine = generateMockMachine();

      const createResponse = await request(app)
        .post('/api/machines')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(machine);

      const machineId = createResponse.body.data._id;

      // Test socket.io connection would go here
      // This is a placeholder for WebSocket testing
      expect(machineId).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid machine ID', async () => {
      const invalidId = '507f1f77bcf86cd799439011';

      await request(app)
        .get(`/api/machines/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle invalid booking data', async () => {
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ invalid: 'data' })
        .expect(400);
    });

    it('should handle unauthorized access', async () => {
      await request(app)
        .get('/api/machines')
        .expect(401);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent booking requests', async () => {
      const machine = generateMockMachine();

      const createResponse = await request(app)
        .post('/api/machines')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(machine);

      const machineId = createResponse.body.data._id;

      // Create multiple concurrent booking requests
      const bookingPromises = [];
      for (let i = 0; i < 5; i++) {
        const promise = request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            machineId,
            startTime: new Date(Date.now() + (i + 1) * 60 * 60 * 1000).toISOString(),
            duration: 30
          });
        bookingPromises.push(promise);
      }

      const results = await Promise.allSettled(bookingPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 201);

      expect(successful.length).toBeGreaterThan(0);
    });
  });
});

module.exports = {};
