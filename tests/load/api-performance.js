import k6 from 'k6';
import http from 'k6/http';
import { check, sleep } from 'k6';

// Load test configuration
export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

const BASE_URL = 'http://localhost:3000';

// Test data
const users = [
  { email: 'user1@example.com', password: 'password123' },
  { email: 'user2@example.com', password: 'password123' },
  { email: 'user3@example.com', password: 'password123' },
];

export function setup() {
  // Setup test data by registering users
  users.forEach(user => {
    http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
      ...user,
      firstName: 'Load',
      lastName: 'Test'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export default function () {
  // Test authentication flow
  const user = users[Math.floor(Math.random() * users.length)];

  // Login
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => JSON.parse(r.body).token !== undefined,
  });

  if (loginResponse.status === 200) {
    const { token } = JSON.parse(loginResponse.body);
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Test machine listing
    const machinesResponse = http.get(`${BASE_URL}/api/machines`, { headers });
    check(machinesResponse, {
      'machines status is 200': (r) => r.status === 200,
      'machines response is array': (r) => Array.isArray(JSON.parse(r.body)),
    });

    // Test booking creation
    const bookingData = {
      machineId: 'WASH001',
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      duration: 60,
    };

    const bookingResponse = http.post(`${BASE_URL}/api/bookings`, JSON.stringify(bookingData), { headers });
    check(bookingResponse, {
      'booking creation status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    });

    // Test user profile
    const profileResponse = http.get(`${BASE_URL}/api/auth/profile`, { headers });
    check(profileResponse, {
      'profile status is 200': (r) => r.status === 200,
      'profile has user data': (r) => JSON.parse(r.body).user !== undefined,
    });
  }

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

export function teardown() {
  // Cleanup test data if needed
  console.log('Load test completed');
}
