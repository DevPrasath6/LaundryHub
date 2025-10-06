// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  SERVICES: {
    AUTH: process.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
    LAUNDRY: process.env.VITE_LAUNDRY_SERVICE_URL || 'http://localhost:3002',
    PAYMENT: process.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3003',
    NOTIFICATION: process.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
    LOST_FOUND: process.env.VITE_LOSTFOUND_SERVICE_URL || 'http://localhost:3005',
    REPORTING: process.env.VITE_REPORTING_SERVICE_URL || 'http://localhost:3006',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth Service (Port 3001)
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
  },

  // Laundry Service (Port 3002)
  LAUNDRY: {
    MACHINES: '/api/laundry/machines',
    BOOKINGS: '/api/laundry/bookings',
    AVAILABILITY: '/api/laundry/availability',
    SCHEDULE: '/api/laundry/schedule',
  },

  // Payment Service (Port 3003)
  PAYMENT: {
    PROCESS: '/api/payment/process',
    HISTORY: '/api/payment/history',
    METHODS: '/api/payment/methods',
    CRYPTO: '/api/payment/crypto',
  },

  // Notification Service (Port 3004)
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/read',
    SUBSCRIBE: '/api/notifications/subscribe',
    SETTINGS: '/api/notifications/settings',
  },

  // Lost & Found Service (Port 3005)
  LOST_FOUND: {
    ITEMS: '/api/lostfound/items',
    REPORT_LOST: '/api/lostfound/report-lost',
    REPORT_FOUND: '/api/lostfound/report-found',
    MATCH: '/api/lostfound/match',
  },

  // Reporting Service (Port 3006)
  REPORTING: {
    ANALYTICS: '/api/reports/analytics',
    USAGE: '/api/reports/usage',
    REVENUE: '/api/reports/revenue',
    EXPORT: '/api/reports/export',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};
