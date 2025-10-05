const client = require('prom-client');
const express = require('express');
const { logInfo, logError } = require('./logger');

class MetricsService {
  constructor(serviceName = 'smart-laundry') {
    this.serviceName = serviceName;
    this.register = new client.Registry();
    this.router = express.Router();
    
    // Set default labels
    this.register.setDefaultLabels({
      service: serviceName,
      version: process.env.npm_package_version || '1.0.0'
    });
    
    // Collect default metrics
    client.collectDefaultMetrics({ 
      register: this.register,
      prefix: `${serviceName}_`
    });
    
    this.initializeCustomMetrics();
    this.setupRoutes();
  }

  initializeCustomMetrics() {
    // HTTP request metrics
    this.httpRequestDuration = new client.Histogram({
      name: `${this.serviceName}_http_request_duration_seconds`,
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    this.httpRequestTotal = new client.Counter({
      name: `${this.serviceName}_http_requests_total`,
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    this.httpRequestSize = new client.Histogram({
      name: `${this.serviceName}_http_request_size_bytes`,
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000]
    });

    this.httpResponseSize = new client.Histogram({
      name: `${this.serviceName}_http_response_size_bytes`,
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000]
    });

    // Database metrics
    this.dbQueryDuration = new client.Histogram({
      name: `${this.serviceName}_db_query_duration_seconds`,
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'collection'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
    });

    this.dbConnectionsActive = new client.Gauge({
      name: `${this.serviceName}_db_connections_active`,
      help: 'Number of active database connections'
    });

    this.dbQueryErrors = new client.Counter({
      name: `${this.serviceName}_db_query_errors_total`,
      help: 'Total number of database query errors',
      labelNames: ['operation', 'collection', 'error_type']
    });

    // Business metrics
    this.bookingsTotal = new client.Counter({
      name: `${this.serviceName}_bookings_total`,
      help: 'Total number of bookings created',
      labelNames: ['machine_type', 'status']
    });

    this.bookingDuration = new client.Histogram({
      name: `${this.serviceName}_booking_duration_minutes`,
      help: 'Duration of bookings in minutes',
      labelNames: ['machine_type'],
      buckets: [15, 30, 45, 60, 90, 120, 180]
    });

    this.machinesActive = new client.Gauge({
      name: `${this.serviceName}_machines_active`,
      help: 'Number of active machines',
      labelNames: ['type', 'status']
    });

    this.paymentsTotal = new client.Counter({
      name: `${this.serviceName}_payments_total`,
      help: 'Total number of payments processed',
      labelNames: ['method', 'status']
    });

    this.paymentAmount = new client.Histogram({
      name: `${this.serviceName}_payment_amount_dollars`,
      help: 'Payment amounts in dollars',
      labelNames: ['method'],
      buckets: [1, 5, 10, 20, 50, 100, 200]
    });

    // System metrics
    this.memoryUsage = new client.Gauge({
      name: `${this.serviceName}_memory_usage_bytes`,
      help: 'Memory usage in bytes',
      labelNames: ['type']
    });

    this.activeConnections = new client.Gauge({
      name: `${this.serviceName}_active_connections`,
      help: 'Number of active connections'
    });

    this.errorRate = new client.Counter({
      name: `${this.serviceName}_errors_total`,
      help: 'Total number of errors',
      labelNames: ['type', 'code']
    });

    // Authentication metrics
    this.authAttempts = new client.Counter({
      name: `${this.serviceName}_auth_attempts_total`,
      help: 'Total authentication attempts',
      labelNames: ['result', 'method']
    });

    this.activeUsers = new client.Gauge({
      name: `${this.serviceName}_active_users`,
      help: 'Number of currently active users',
      labelNames: ['role']
    });

    // Cache metrics
    this.cacheHits = new client.Counter({
      name: `${this.serviceName}_cache_hits_total`,
      help: 'Total cache hits',
      labelNames: ['cache_type']
    });

    this.cacheMisses = new client.Counter({
      name: `${this.serviceName}_cache_misses_total`,
      help: 'Total cache misses',
      labelNames: ['cache_type']
    });

    // AI/ML metrics
    this.mlPredictions = new client.Counter({
      name: `${this.serviceName}_ml_predictions_total`,
      help: 'Total ML predictions made',
      labelNames: ['model_type', 'result']
    });

    this.mlPredictionDuration = new client.Histogram({
      name: `${this.serviceName}_ml_prediction_duration_seconds`,
      help: 'Duration of ML predictions in seconds',
      labelNames: ['model_type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    });

    // Register all metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestTotal);
    this.register.registerMetric(this.httpRequestSize);
    this.register.registerMetric(this.httpResponseSize);
    this.register.registerMetric(this.dbQueryDuration);
    this.register.registerMetric(this.dbConnectionsActive);
    this.register.registerMetric(this.dbQueryErrors);
    this.register.registerMetric(this.bookingsTotal);
    this.register.registerMetric(this.bookingDuration);
    this.register.registerMetric(this.machinesActive);
    this.register.registerMetric(this.paymentsTotal);
    this.register.registerMetric(this.paymentAmount);
    this.register.registerMetric(this.memoryUsage);
    this.register.registerMetric(this.activeConnections);
    this.register.registerMetric(this.errorRate);
    this.register.registerMetric(this.authAttempts);
    this.register.registerMetric(this.activeUsers);
    this.register.registerMetric(this.cacheHits);
    this.register.registerMetric(this.cacheMisses);
    this.register.registerMetric(this.mlPredictions);
    this.register.registerMetric(this.mlPredictionDuration);
  }

  setupRoutes() {
    // Prometheus metrics endpoint
    this.router.get('/metrics', async (req, res) => {
      try {
        res.set('Content-Type', this.register.contentType);
        const metrics = await this.register.metrics();
        res.end(metrics);
      } catch (error) {
        logError('Failed to generate metrics', error);
        res.status(500).json({ error: 'Failed to generate metrics' });
      }
    });

    // Health metrics endpoint
    this.router.get('/metrics/health', (req, res) => {
      const healthMetrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        timestamp: new Date().toISOString()
      };
      
      res.json(healthMetrics);
    });
  }

  // Middleware to track HTTP requests
  trackHttpRequests() {
    return (req, res, next) => {
      const start = Date.now();
      const route = req.route?.path || req.path;
      
      // Track request size
      const requestSize = parseInt(req.get('content-length')) || 0;
      if (requestSize > 0) {
        this.httpRequestSize.observe(
          { method: req.method, route },
          requestSize
        );
      }

      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const labels = {
          method: req.method,
          route,
          status_code: res.statusCode
        };

        this.httpRequestDuration.observe(labels, duration);
        this.httpRequestTotal.inc(labels);

        // Track response size
        const responseSize = parseInt(res.get('content-length')) || 0;
        if (responseSize > 0) {
          this.httpResponseSize.observe(
            { method: req.method, route },
            responseSize
          );
        }
      });

      next();
    };
  }

  // Database operation tracking
  trackDbQuery(operation, collection, duration, error = null) {
    const durationSeconds = duration / 1000;
    
    this.dbQueryDuration.observe(
      { operation, collection },
      durationSeconds
    );

    if (error) {
      this.dbQueryErrors.inc({
        operation,
        collection,
        error_type: error.name || 'Unknown'
      });
    }
  }

  // Business metrics tracking
  trackBooking(machineType, status, duration = null) {
    this.bookingsTotal.inc({ machine_type: machineType, status });
    
    if (duration && status === 'completed') {
      this.bookingDuration.observe(
        { machine_type: machineType },
        duration
      );
    }
  }

  trackPayment(method, status, amount) {
    this.paymentsTotal.inc({ method, status });
    
    if (status === 'success' && amount) {
      this.paymentAmount.observe({ method }, amount);
    }
  }

  trackMachineStatus(type, status, count) {
    this.machinesActive.set({ type, status }, count);
  }

  trackAuthentication(result, method = 'password') {
    this.authAttempts.inc({ result, method });
  }

  trackActiveUsers(role, count) {
    this.activeUsers.set({ role }, count);
  }

  trackCache(type, hit = true) {
    if (hit) {
      this.cacheHits.inc({ cache_type: type });
    } else {
      this.cacheMisses.inc({ cache_type: type });
    }
  }

  trackMLPrediction(modelType, result, duration) {
    this.mlPredictions.inc({ model_type: modelType, result });
    
    if (duration) {
      this.mlPredictionDuration.observe(
        { model_type: modelType },
        duration / 1000
      );
    }
  }

  trackError(type, code = 'unknown') {
    this.errorRate.inc({ type, code });
  }

  // System metrics updater
  updateSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    
    this.memoryUsage.set({ type: 'heap_used' }, memoryUsage.heapUsed);
    this.memoryUsage.set({ type: 'heap_total' }, memoryUsage.heapTotal);
    this.memoryUsage.set({ type: 'external' }, memoryUsage.external);
    this.memoryUsage.set({ type: 'rss' }, memoryUsage.rss);
  }

  // Start periodic system metrics collection
  startPeriodicCollection() {
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000); // Every 30 seconds

    logInfo('Started periodic metrics collection');
  }

  // Get current metrics as JSON (for debugging)
  async getMetricsAsJson() {
    try {
      const metrics = await this.register.getMetricsAsJSON();
      return metrics;
    } catch (error) {
      logError('Failed to get metrics as JSON', error);
      throw error;
    }
  }

  // Clear all metrics (useful for testing)
  clearMetrics() {
    this.register.clear();
    logInfo('Cleared all metrics');
  }
}

// Database monitoring wrapper
const createDbMonitor = (metricsService) => {
  return {
    async executeQuery(collection, operation, queryFn) {
      const start = Date.now();
      let error = null;

      try {
        const result = await queryFn();
        return result;
      } catch (err) {
        error = err;
        throw err;
      } finally {
        const duration = Date.now() - start;
        metricsService.trackDbQuery(operation, collection, duration, error);
      }
    }
  };
};

// Cache monitoring wrapper
const createCacheMonitor = (metricsService, cacheType) => {
  return {
    async get(key, fetchFn) {
      try {
        // Try to get from cache first
        const cached = await this.getFromCache(key);
        if (cached) {
          metricsService.trackCache(cacheType, true);
          return cached;
        }

        // Cache miss - fetch and store
        metricsService.trackCache(cacheType, false);
        const result = await fetchFn();
        await this.setCache(key, result);
        return result;
      } catch (error) {
        metricsService.trackError('cache_error', error.code);
        throw error;
      }
    },

    async getFromCache(key) {
      // Implementation depends on cache provider
      return null;
    },

    async setCache(key, value) {
      // Implementation depends on cache provider
    }
  };
};

module.exports = {
  MetricsService,
  createDbMonitor,
  createCacheMonitor
};