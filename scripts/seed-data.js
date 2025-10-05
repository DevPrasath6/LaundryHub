// Database migration and seeding script for Smart Laundry System
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_laundry');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  isEmailVerified: { type: Boolean, default: false },
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' }
  }
}, { timestamps: true });

// Machine Schema
const machineSchema = new mongoose.Schema({
  machineId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['washer', 'dryer'], required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['available', 'in-use', 'maintenance', 'offline'], default: 'available' },
  capacity: { type: String, required: true },
  estimatedTime: { type: Number, required: true }, // in minutes
  pricePerCycle: { type: Number, required: true },
  specifications: {
    brand: String,
    model: String,
    energyRating: String,
    features: [String]
  },
  maintenance: {
    lastServiceDate: Date,
    nextServiceDate: Date,
    serviceHistory: [{
      date: Date,
      type: String,
      description: String,
      cost: Number
    }]
  },
  iotSensors: {
    temperature: { type: Number, default: 0 },
    vibration: { type: Number, default: 0 },
    waterLevel: { type: Number, default: 0 },
    powerConsumption: { type: Number, default: 0 },
    lastUpdate: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// Create models
const User = mongoose.model('User', userSchema);
const Machine = mongoose.model('Machine', machineSchema);

// Seed data
const seedData = async () => {
  console.log('Starting database seeding...');

  try {
    // Clear existing data
    await User.deleteMany({});
    await Machine.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      email: 'admin@smartlaundry.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isEmailVerified: true,
      phoneNumber: '+1234567890',
      address: {
        street: '123 Admin Street',
        city: 'Tech City',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      }
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create staff users
    const staffUsers = [
      {
        email: 'staff1@smartlaundry.com',
        password: await bcrypt.hash('staff123', 12),
        firstName: 'John',
        lastName: 'Maintenance',
        role: 'staff',
        isEmailVerified: true,
        phoneNumber: '+1234567891'
      },
      {
        email: 'staff2@smartlaundry.com',
        password: await bcrypt.hash('staff123', 12),
        firstName: 'Jane',
        lastName: 'Support',
        role: 'staff',
        isEmailVerified: true,
        phoneNumber: '+1234567892'
      }
    ];

    for (const staffData of staffUsers) {
      const staff = new User(staffData);
      await staff.save();
    }
    console.log('Created staff users');

    // Create demo customer users
    const customerUsers = [
      {
        email: 'customer1@example.com',
        password: await bcrypt.hash('customer123', 12),
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'customer',
        isEmailVerified: true,
        phoneNumber: '+1234567893',
        address: {
          street: '456 Student Ave',
          city: 'University Town',
          state: 'CA',
          zipCode: '12346',
          country: 'USA'
        }
      },
      {
        email: 'customer2@example.com',
        password: await bcrypt.hash('customer123', 12),
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'customer',
        isEmailVerified: true,
        phoneNumber: '+1234567894',
        address: {
          street: '789 Dorm Blvd',
          city: 'University Town',
          state: 'CA',
          zipCode: '12347',
          country: 'USA'
        }
      }
    ];

    for (const customerData of customerUsers) {
      const customer = new User(customerData);
      await customer.save();
    }
    console.log('Created customer users');

    // Create laundry machines
    const machines = [
      // Washers
      {
        machineId: 'W001',
        name: 'Washer A1',
        type: 'washer',
        location: 'Block A - Floor 1',
        status: 'available',
        capacity: '8kg',
        estimatedTime: 45,
        pricePerCycle: 3.50,
        specifications: {
          brand: 'LG',
          model: 'WM3900HWA',
          energyRating: 'A+++',
          features: ['Steam Clean', 'Smart Diagnosis', 'Cold Wash']
        },
        maintenance: {
          lastServiceDate: new Date('2024-01-15'),
          nextServiceDate: new Date('2024-04-15')
        }
      },
      {
        machineId: 'W002',
        name: 'Washer A2',
        type: 'washer',
        location: 'Block A - Floor 1',
        status: 'available',
        capacity: '8kg',
        estimatedTime: 45,
        pricePerCycle: 3.50,
        specifications: {
          brand: 'Samsung',
          model: 'WF45R6100AP',
          energyRating: 'A+++',
          features: ['VRT Plus', 'Smart Care', 'Self Clean']
        },
        maintenance: {
          lastServiceDate: new Date('2024-01-20'),
          nextServiceDate: new Date('2024-04-20')
        }
      },
      {
        machineId: 'W003',
        name: 'Washer B1',
        type: 'washer',
        location: 'Block B - Floor 1',
        status: 'available',
        capacity: '10kg',
        estimatedTime: 50,
        pricePerCycle: 4.00,
        specifications: {
          brand: 'Whirlpool',
          model: 'WFW9620HC',
          energyRating: 'A++',
          features: ['Load & Go', 'Steam Clean', 'Smart Dispense']
        },
        maintenance: {
          lastServiceDate: new Date('2024-02-01'),
          nextServiceDate: new Date('2024-05-01')
        }
      },
      {
        machineId: 'W004',
        name: 'Washer C1',
        type: 'washer',
        location: 'Block C - Floor 1',
        status: 'maintenance',
        capacity: '8kg',
        estimatedTime: 45,
        pricePerCycle: 3.50,
        specifications: {
          brand: 'GE',
          model: 'GFW850SPNRS',
          energyRating: 'A++',
          features: ['UltraFresh Vent', 'SmartDispense', 'Sanitize']
        },
        maintenance: {
          lastServiceDate: new Date('2024-01-10'),
          nextServiceDate: new Date('2024-04-10')
        }
      },

      // Dryers
      {
        machineId: 'D001',
        name: 'Dryer A1',
        type: 'dryer',
        location: 'Block A - Floor 1',
        status: 'available',
        capacity: '8kg',
        estimatedTime: 60,
        pricePerCycle: 3.00,
        specifications: {
          brand: 'LG',
          model: 'DLEX3900W',
          energyRating: 'A++',
          features: ['Steam Fresh', 'Sensor Dry', 'Smart Diagnosis']
        },
        maintenance: {
          lastServiceDate: new Date('2024-01-15'),
          nextServiceDate: new Date('2024-04-15')
        }
      },
      {
        machineId: 'D002',
        name: 'Dryer A2',
        type: 'dryer',
        location: 'Block A - Floor 1',
        status: 'available',
        capacity: '8kg',
        estimatedTime: 60,
        pricePerCycle: 3.00,
        specifications: {
          brand: 'Samsung',
          model: 'DV45R6100EW',
          energyRating: 'A++',
          features: ['Moisture Sensors', 'Steam Sanitize', 'Smart Care']
        },
        maintenance: {
          lastServiceDate: new Date('2024-01-20'),
          nextServiceDate: new Date('2024-04-20')
        }
      },
      {
        machineId: 'D003',
        name: 'Dryer B1',
        type: 'dryer',
        location: 'Block B - Floor 1',
        status: 'available',
        capacity: '10kg',
        estimatedTime: 65,
        pricePerCycle: 3.50,
        specifications: {
          brand: 'Whirlpool',
          model: 'WED9620HC',
          energyRating: 'A+',
          features: ['Advanced Moisture Sensing', 'Steam Refresh', 'Wrinkle Shield']
        },
        maintenance: {
          lastServiceDate: new Date('2024-02-01'),
          nextServiceDate: new Date('2024-05-01')
        }
      },
      {
        machineId: 'D004',
        name: 'Dryer C1',
        type: 'dryer',
        location: 'Block C - Floor 1',
        status: 'offline',
        capacity: '8kg',
        estimatedTime: 60,
        pricePerCycle: 3.00,
        specifications: {
          brand: 'GE',
          model: 'GFD85ESPNRS',
          energyRating: 'A+',
          features: ['Sanitize Cycle', 'Extended Tumble', 'Quick Dry']
        },
        maintenance: {
          lastServiceDate: new Date('2024-01-10'),
          nextServiceDate: new Date('2024-04-10')
        }
      }
    ];

    for (const machineData of machines) {
      const machine = new Machine(machineData);
      await machine.save();
    }
    console.log('Created laundry machines');

    // Create some sample IoT sensor data
    const activeMachines = await Machine.find({ status: { $in: ['available', 'in-use'] } });
    for (const machine of activeMachines) {
      machine.iotSensors = {
        temperature: Math.round(20 + Math.random() * 15), // 20-35°C
        vibration: Math.round(Math.random() * 100), // 0-100
        waterLevel: Math.round(Math.random() * 100), // 0-100%
        powerConsumption: Math.round(500 + Math.random() * 1500), // 500-2000W
        lastUpdate: new Date()
      };
      await machine.save();
    }
    console.log('Updated IoT sensor data');

    console.log('\n=== Seeding completed successfully! ===');
    console.log('\nDefault user accounts:');
    console.log('Admin: admin@smartlaundry.com / admin123');
    console.log('Staff: staff1@smartlaundry.com / staff123');
    console.log('Staff: staff2@smartlaundry.com / staff123');
    console.log('Customer: customer1@example.com / customer123');
    console.log('Customer: customer2@example.com / customer123');
    console.log('\nMachines created:');
    console.log('- 4 Washers (W001-W004)');
    console.log('- 4 Dryers (D001-D004)');
    console.log('- Various statuses for testing');

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
const runSeeding = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed');
  process.exit(0);
};

// Check if running directly or imported
if (require.main === module) {
  runSeeding();
}

module.exports = { runSeeding };
