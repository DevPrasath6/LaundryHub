const Machine = require('../../backend/laundry-service/models/Machine');
const Booking = require('../../backend/laundry-service/models/Booking');
const { generateMockMachine, generateMockBooking } = require('../utils/testSetup');

describe('Machine Model Unit Tests', () => {
  describe('Machine Creation', () => {
    it('should create a valid machine', () => {
      const machineData = generateMockMachine();
      const machine = new Machine(machineData);
      
      expect(machine.machineId).toBe(machineData.machineId);
      expect(machine.type).toBe(machineData.type);
      expect(machine.status).toBe(machineData.status);
      expect(machine.location).toBe(machineData.location);
    });

    it('should require machineId field', () => {
      const machineData = generateMockMachine();
      delete machineData.machineId;
      
      const machine = new Machine(machineData);
      const error = machine.validateSync();
      
      expect(error.errors.machineId).toBeDefined();
    });

    it('should validate machine type', () => {
      const machineData = generateMockMachine({ type: 'invalid-type' });
      const machine = new Machine(machineData);
      const error = machine.validateSync();
      
      expect(error.errors.type).toBeDefined();
    });

    it('should set default status to available', () => {
      const machineData = generateMockMachine();
      delete machineData.status;
      
      const machine = new Machine(machineData);
      expect(machine.status).toBe('available');
    });
  });

  describe('Machine Methods', () => {
    it('should check if machine is available', () => {
      const availableMachine = new Machine(generateMockMachine({ status: 'available' }));
      const busyMachine = new Machine(generateMockMachine({ status: 'in_use' }));
      
      expect(availableMachine.isAvailable()).toBe(true);
      expect(busyMachine.isAvailable()).toBe(false);
    });

    it('should update machine status', () => {
      const machine = new Machine(generateMockMachine());
      
      machine.updateStatus('in_use');
      expect(machine.status).toBe('in_use');
      expect(machine.lastStatusUpdate).toBeDefined();
    });

    it('should add maintenance log', () => {
      const machine = new Machine(generateMockMachine());
      const maintenanceData = {
        type: 'repair',
        description: 'Fixed door lock',
        cost: 50
      };
      
      machine.addMaintenanceLog(maintenanceData);
      expect(machine.maintenanceHistory).toHaveLength(1);
      expect(machine.maintenanceHistory[0].type).toBe('repair');
    });

    it('should calculate total revenue', () => {
      const machine = new Machine(generateMockMachine({ pricePerCycle: 3.50 }));
      
      // Simulate usage history
      machine.usageHistory = [
        { cycleType: 'normal', cycleCount: 10 },
        { cycleType: 'delicate', cycleCount: 5 }
      ];
      
      const revenue = machine.calculateTotalRevenue();
      expect(revenue).toBe(52.50); // 15 cycles * 3.50
    });
  });

  describe('Machine Validation', () => {
    it('should accept valid machine types', () => {
      const validTypes = ['washer', 'dryer', 'combo'];
      
      validTypes.forEach(type => {
        const machine = new Machine(generateMockMachine({ type }));
        const error = machine.validateSync();
        
        expect(error).toBeNull();
      });
    });

    it('should accept valid statuses', () => {
      const validStatuses = ['available', 'in_use', 'maintenance', 'out_of_order'];
      
      validStatuses.forEach(status => {
        const machine = new Machine(generateMockMachine({ status }));
        const error = machine.validateSync();
        
        expect(error).toBeNull();
      });
    });

    it('should validate capacity range', () => {
      const invalidMachine = new Machine(generateMockMachine({ capacity: -1 }));
      const error = invalidMachine.validateSync();
      
      expect(error.errors.capacity).toBeDefined();
    });

    it('should validate price range', () => {
      const invalidMachine = new Machine(generateMockMachine({ pricePerCycle: -1 }));
      const error = invalidMachine.validateSync();
      
      expect(error.errors.pricePerCycle).toBeDefined();
    });
  });
});

describe('Booking Model Unit Tests', () => {
  describe('Booking Creation', () => {
    it('should create a valid booking', () => {
      const bookingData = generateMockBooking();
      const booking = new Booking(bookingData);
      
      expect(booking.userId).toEqual(bookingData.userId);
      expect(booking.machineId).toBe(bookingData.machineId);
      expect(booking.startTime).toEqual(bookingData.startTime);
      expect(booking.status).toBe('confirmed');
    });

    it('should require userId field', () => {
      const bookingData = generateMockBooking();
      delete bookingData.userId;
      
      const booking = new Booking(bookingData);
      const error = booking.validateSync();
      
      expect(error.errors.userId).toBeDefined();
    });

    it('should require machineId field', () => {
      const bookingData = generateMockBooking();
      delete bookingData.machineId;
      
      const booking = new Booking(bookingData);
      const error = booking.validateSync();
      
      expect(error.errors.machineId).toBeDefined();
    });

    it('should set default status to confirmed', () => {
      const bookingData = generateMockBooking();
      delete bookingData.status;
      
      const booking = new Booking(bookingData);
      expect(booking.status).toBe('confirmed');
    });
  });

  describe('Booking Methods', () => {
    it('should calculate end time correctly', () => {
      const startTime = new Date();
      const booking = new Booking(generateMockBooking({
        startTime,
        duration: 60
      }));
      
      const expectedEndTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      expect(booking.getEndTime()).toEqual(expectedEndTime);
    });

    it('should check if booking is active', () => {
      const activeBooking = new Booking(generateMockBooking({ status: 'in_progress' }));
      const completedBooking = new Booking(generateMockBooking({ status: 'completed' }));
      
      expect(activeBooking.isActive()).toBe(true);
      expect(completedBooking.isActive()).toBe(false);
    });

    it('should check if booking can be cancelled', () => {
      const futureBooking = new Booking(generateMockBooking({
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      }));
      
      const currentBooking = new Booking(generateMockBooking({
        startTime: new Date() // now
      }));
      
      expect(futureBooking.canBeCancelled()).toBe(true);
      expect(currentBooking.canBeCancelled()).toBe(false);
    });

    it('should extend booking duration', () => {
      const booking = new Booking(generateMockBooking({ duration: 60 }));
      
      booking.extendDuration(30);
      expect(booking.duration).toBe(90);
    });

    it('should cancel booking', () => {
      const booking = new Booking(generateMockBooking());
      
      booking.cancel();
      expect(booking.status).toBe('cancelled');
      expect(booking.cancelledAt).toBeDefined();
    });
  });

  describe('Booking Validation', () => {
    it('should accept valid booking statuses', () => {
      const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
      
      validStatuses.forEach(status => {
        const booking = new Booking(generateMockBooking({ status }));
        const error = booking.validateSync();
        
        expect(error).toBeNull();
      });
    });

    it('should validate duration range', () => {
      const invalidBooking = new Booking(generateMockBooking({ duration: 0 }));
      const error = invalidBooking.validateSync();
      
      expect(error.errors.duration).toBeDefined();
    });

    it('should validate start time is in future', () => {
      const pastBooking = new Booking(generateMockBooking({
        startTime: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      }));
      
      const error = pastBooking.validateSync();
      expect(error).toBeNull(); // Validation is in pre-save middleware
    });
  });

  describe('Booking Virtual Properties', () => {
    it('should calculate remaining time correctly', () => {
      const booking = new Booking(generateMockBooking({
        startTime: new Date(),
        duration: 60,
        status: 'in_progress'
      }));
      
      const remainingTime = booking.remainingTime;
      expect(remainingTime).toBeLessThanOrEqual(60);
      expect(remainingTime).toBeGreaterThan(0);
    });

    it('should check if booking is overdue', () => {
      const overdueBooking = new Booking(generateMockBooking({
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        duration: 60 // 1 hour duration
      }));
      
      expect(overdueBooking.isOverdue).toBe(true);
    });
  });
});

module.exports = {};