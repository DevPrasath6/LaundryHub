import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      laundry: process.env.LAUNDRY_SERVICE_URL || 'http://localhost:3002',
      payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
      notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
      lostfound: process.env.LOSTFOUND_SERVICE_URL || 'http://localhost:3005',
      reporting: process.env.REPORTING_SERVICE_URL || 'http://localhost:3006'
    }
  });
});

// Authentication middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Service endpoints configuration
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    protected: false // Auth routes don't need authentication
  },
  laundry: {
    url: process.env.LAUNDRY_SERVICE_URL || 'http://localhost:3002',
    protected: true
  },
  payment: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
    protected: true
  },
  notification: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
    protected: true
  },
  lostfound: {
    url: process.env.LOSTFOUND_SERVICE_URL || 'http://localhost:3005',
    protected: true
  },
  reporting: {
    url: process.env.REPORTING_SERVICE_URL || 'http://localhost:3006',
    protected: true
  }
};

// Create proxy middleware for each service
Object.keys(services).forEach(serviceName => {
  const service = services[serviceName];

  // Apply authentication middleware for protected services
  const middlewares = service.protected ? [authenticateToken] : [];

  const proxyMiddleware = createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1/${serviceName}`]: '/api/v1'
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${serviceName}:`, err.message);
      res.status(503).json({
        success: false,
        message: `${serviceName} service unavailable`,
        error: err.message
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add user info to headers for downstream services
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }

      // Log proxy request
      console.log(`Proxying ${req.method} ${req.path} to ${service.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';
    }
  });

  // Route with authentication middleware if needed
  app.use(`/api/v1/${serviceName}`, ...middlewares, proxyMiddleware);
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Smart Laundry System API Gateway',
      version: '1.0.0',
      description: 'Central API Gateway for Smart Laundry System microservices',
      services: {
        auth: {
          baseUrl: '/api/v1/auth',
          description: 'Authentication and user management',
          endpoints: [
            'POST /api/v1/auth/register',
            'POST /api/v1/auth/login',
            'POST /api/v1/auth/refresh',
            'GET /api/v1/auth/profile',
            'PUT /api/v1/auth/profile'
          ]
        },
        laundry: {
          baseUrl: '/api/v1/laundry',
          description: 'Laundry operations and machine management',
          endpoints: [
            'GET /api/v1/laundry/overview',
            'GET /api/v1/laundry/machines',
            'GET /api/v1/laundry/bookings',
            'POST /api/v1/laundry/bookings',
            'GET /api/v1/laundry/machines/:id/availability'
          ]
        },
        payment: {
          baseUrl: '/api/v1/payment',
          description: 'Payment processing and transactions',
          endpoints: [
            'POST /api/v1/payment/process',
            'GET /api/v1/payment/transactions',
            'POST /api/v1/payment/refund'
          ]
        },
        notification: {
          baseUrl: '/api/v1/notification',
          description: 'Push notifications and messaging',
          endpoints: [
            'POST /api/v1/notification/send',
            'GET /api/v1/notification/history',
            'PUT /api/v1/notification/preferences'
          ]
        },
        lostfound: {
          baseUrl: '/api/v1/lostfound',
          description: 'Lost and found item management',
          endpoints: [
            'GET /api/v1/lostfound/items',
            'POST /api/v1/lostfound/report',
            'POST /api/v1/lostfound/match'
          ]
        },
        reporting: {
          baseUrl: '/api/v1/reporting',
          description: 'Analytics and reporting',
          endpoints: [
            'GET /api/v1/reporting/dashboard',
            'GET /api/v1/reporting/usage',
            'GET /api/v1/reporting/revenue'
          ]
        }
      }
    }
  });
});

// Global route aggregation endpoints
app.get('/api/v1/dashboard', authenticateToken, async (req, res) => {
  try {
    // Aggregate data from multiple services for dashboard
    const dashboardData = {
      user: req.user,
      timestamp: new Date().toISOString()
    };

    // This would typically make calls to multiple services
    // For now, return basic structure
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: Object.keys(services).map(service => `/api/v1/${service}`)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📋 Available services:');
  Object.keys(services).forEach(service => {
    console.log(`   - ${service}: ${services[service].url}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
