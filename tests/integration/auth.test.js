const request = require('supertest');
const { TestEnvironment, generateMockUser } = require('../utils/testSetup');

describe('Authentication Service Integration Tests', () => {
  let testEnv;
  let app;

  beforeAll(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();
    
    // Import app after test environment is ready
    app = require('../../backend/auth-service/src/index').app;
  });

  afterAll(async () => {
    await testEnv.teardown();
  });

  beforeEach(async () => {
    await testEnv.clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Pre-register a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securePassword123',
          firstName: 'Test',
          lastName: 'User'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securePassword123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongPassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Protected Routes', () => {
    let authToken;

    beforeEach(async () => {
      // Register and login to get auth token
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securePassword123',
          firstName: 'Test',
          lastName: 'User'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securePassword123'
        });

      authToken = loginResponse.body.token;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject access without token', async () => {
      await request(app)
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Token Refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securePassword123',
          firstName: 'Test',
          lastName: 'User'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securePassword123'
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject refresh with invalid token', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });
});

module.exports = {};