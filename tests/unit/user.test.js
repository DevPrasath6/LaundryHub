const User = require('../../backend/auth-service/models/User');
const { generateMockUser } = require('../utils/testSetup');

describe('User Model Unit Tests', () => {
  describe('User Creation', () => {
    it('should create a valid user', () => {
      const userData = generateMockUser();
      const user = new User(userData);
      
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe('customer');
      expect(user.isActive).toBe(true);
    });

    it('should require email field', () => {
      const userData = generateMockUser();
      delete userData.email;
      
      const user = new User(userData);
      const error = user.validateSync();
      
      expect(error.errors.email).toBeDefined();
    });

    it('should validate email format', () => {
      const userData = generateMockUser({ email: 'invalid-email' });
      const user = new User(userData);
      const error = user.validateSync();
      
      expect(error.errors.email).toBeDefined();
    });

    it('should set default role to customer', () => {
      const userData = generateMockUser();
      delete userData.role;
      
      const user = new User(userData);
      expect(user.role).toBe('customer');
    });

    it('should set default active status to true', () => {
      const userData = generateMockUser();
      delete userData.isActive;
      
      const user = new User(userData);
      expect(user.isActive).toBe(true);
    });
  });

  describe('User Methods', () => {
    it('should generate full name correctly', () => {
      const userData = generateMockUser({
        firstName: 'John',
        lastName: 'Doe'
      });
      const user = new User(userData);
      
      expect(user.getFullName()).toBe('John Doe');
    });

    it('should check admin role correctly', () => {
      const adminUser = new User(generateMockUser({ role: 'admin' }));
      const customerUser = new User(generateMockUser({ role: 'customer' }));
      
      expect(adminUser.isAdmin()).toBe(true);
      expect(customerUser.isAdmin()).toBe(false);
    });

    it('should check staff role correctly', () => {
      const staffUser = new User(generateMockUser({ role: 'staff' }));
      const customerUser = new User(generateMockUser({ role: 'customer' }));
      
      expect(staffUser.isStaff()).toBe(true);
      expect(customerUser.isStaff()).toBe(false);
    });
  });

  describe('User Validation', () => {
    it('should accept valid roles', () => {
      const validRoles = ['customer', 'staff', 'admin'];
      
      validRoles.forEach(role => {
        const user = new User(generateMockUser({ role }));
        const error = user.validateSync();
        
        expect(error).toBeNull();
      });
    });

    it('should reject invalid roles', () => {
      const user = new User(generateMockUser({ role: 'invalid-role' }));
      const error = user.validateSync();
      
      expect(error.errors.role).toBeDefined();
    });

    it('should validate password minimum length', () => {
      const user = new User(generateMockUser({ password: '123' }));
      const error = user.validateSync();
      
      expect(error.errors.password).toBeDefined();
    });
  });

  describe('User Timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      const user = new User(generateMockUser());
      
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });
});

module.exports = {};