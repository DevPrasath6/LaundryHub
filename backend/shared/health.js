const express = require('express');
const mongoose = require('mongoose');
const Redis = require('redis');
const { logInfo, logError, logWarning, healthLogger } = require('./logger');

class HealthCheckService {
  constructor() {
    this.checks = new Map();
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Basic health check
    this.router.get('/health', async (req, res) => {
      try {
        const health = await this.performHealthCheck();
        const status = health.status === 'healthy' ? 200 : 503;
        
        res.status(status).json({
          status: health.status,
          timestamp: new Date().toISOString(),
          service: process.env.SERVICE_NAME || 'smart-laundry',
          version: process.env.npm_package_version || '1.0.0',
          uptime: process.uptime(),
          checks: health.checks
        });
        
        healthLogger.logCheck('overall', health.status, 0, health.checks);
      } catch (error) {
        logError('Health check failed', error);
        res.status(503).json({
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Readiness check (for Kubernetes)
    this.router.get('/ready', async (req, res) => {
      try {
        const readiness = await this.performReadinessCheck();
        const status = readiness.ready ? 200 : 503;
        
        res.status(status).json({
          ready: readiness.ready,
          timestamp: new Date().toISOString(),
          checks: readiness.checks
        });
      } catch (error) {
        logError('Readiness check failed', error);
        res.status(503).json({
          ready: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Liveness check (for Kubernetes)
    this.router.get('/live', (req, res) => {
      res.status(200).json({
        alive: true,
        timestamp: new Date().toISOString(),
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      });
    });

    // Detailed system metrics
    this.router.get('/metrics', (req, res) => {
      const metrics = this.getSystemMetrics();
      res.json(metrics);
    });
  }

  async performHealthCheck() {
    const startTime = Date.now();
    const checks = {};
    let overallStatus = 'healthy';

    // Check MongoDB connection
    try {
      const mongoStart = Date.now();
      await mongoose.connection.db.admin().ping();
      checks.mongodb = {
        status: 'healthy',
        duration: Date.now() - mongoStart,
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port
        }
      };
    } catch (error) {
      checks.mongodb = {
        status: 'unhealthy',
        error: error.message,
        duration: Date.now() - startTime
      };
      overallStatus = 'unhealthy';
    }

    // Check Redis connection
    try {
      const redisStart = Date.now();
      const redisClient = Redis.createClient({ url: process.env.REDIS_URL });
      await redisClient.ping();
      await redisClient.quit();
      
      checks.redis = {
        status: 'healthy',
        duration: Date.now() - redisStart
      };
    } catch (error) {
      checks.redis = {
        status: 'unhealthy',
        error: error.message,
        duration: Date.now() - redisStart
      };
      overallStatus = 'unhealthy';
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 500 * 1024 * 1024; // 500MB threshold
    
    checks.memory = {
      status: memoryUsage.heapUsed < memoryThreshold ? 'healthy' : 'warning',
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      threshold: memoryThreshold
    };

    // Check disk space (if available)
    try {
      const diskUsage = await this.checkDiskSpace();
      checks.disk = diskUsage;
    } catch (error) {
      checks.disk = {
        status: 'unknown',
        error: error.message
      };
    }

    // Check external services
    checks.external = await this.checkExternalServices();

    return {
      status: overallStatus,
      duration: Date.now() - startTime,
      checks
    };
  }

  async performReadinessCheck() {
    const checks = {};
    let ready = true;

    // Essential services for readiness
    try {
      // MongoDB readiness
      await mongoose.connection.db.admin().ping();
      checks.mongodb = { ready: true };
    } catch (error) {
      checks.mongodb = { ready: false, error: error.message };
      ready = false;
    }

    try {
      // Redis readiness
      const redisClient = Redis.createClient({ url: process.env.REDIS_URL });
      await redisClient.ping();
      await redisClient.quit();
      checks.redis = { ready: true };
    } catch (error) {
      checks.redis = { ready: false, error: error.message };
      ready = false;
    }

    return { ready, checks };
  }

  async checkDiskSpace() {
    try {
      const fs = require('fs').promises;
      const stats = await fs.stat(process.cwd());
      
      return {
        status: 'healthy',
        available: 'unknown', // Would need platform-specific implementation
        used: 'unknown'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async checkExternalServices() {
    const services = {};

    // Check other microservices
    const serviceUrls = {
      auth: process.env.AUTH_SERVICE_URL,
      payment: process.env.PAYMENT_SERVICE_URL,
      notification: process.env.NOTIFICATION_SERVICE_URL
    };

    for (const [name, url] of Object.entries(serviceUrls)) {
      if (url) {
        try {
          const startTime = Date.now();
          const response = await fetch(`${url}/health`, {
            method: 'GET',
            timeout: 5000
          });
          
          services[name] = {
            status: response.ok ? 'healthy' : 'unhealthy',
            duration: Date.now() - startTime,
            statusCode: response.status
          };
        } catch (error) {
          services[name] = {
            status: 'unreachable',
            error: error.message
          };
        }
      }
    }

    return services;
  }

  getSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      },
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      eventLoop: {
        delay: this.getEventLoopDelay()
      }
    };
  }

  getEventLoopDelay() {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const delay = process.hrtime.bigint() - start;
      return Number(delay) / 1000000; // Convert to milliseconds
    });
    return 0; // Placeholder
  }

  // Custom health check registration
  registerCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  // Performance monitoring
  startPerformanceMonitoring() {
    const interval = parseInt(process.env.PERFORMANCE_MONITOR_INTERVAL) || 30000;
    
    setInterval(() => {
      const metrics = this.getSystemMetrics();
      
      // Log performance warnings
      if (metrics.memory.heapUsed > 400 * 1024 * 1024) { // 400MB
        logWarning('High memory usage detected', {
          heapUsed: metrics.memory.heapUsed,
          heapTotal: metrics.memory.heapTotal
        });
      }
      
      // Log system metrics for monitoring
      logInfo('System metrics', {
        type: 'performance_metrics',
        ...metrics
      });
    }, interval);
  }

  // Circuit breaker pattern for external services
  createCircuitBreaker(serviceName, options = {}) {
    const config = {
      timeout: options.timeout || 5000,
      threshold: options.threshold || 5,
      resetTimeout: options.resetTimeout || 60000,
      ...options
    };

    let failures = 0;
    let lastFailureTime = null;
    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN

    return async (serviceCall) => {
      if (state === 'OPEN') {
        if (Date.now() - lastFailureTime > config.resetTimeout) {
          state = 'HALF_OPEN';
          logInfo(`Circuit breaker for ${serviceName} entering HALF_OPEN state`);
        } else {
          throw new Error(`Circuit breaker is OPEN for ${serviceName}`);
        }
      }

      try {
        const result = await Promise.race([
          serviceCall(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Service timeout')), config.timeout)
          )
        ]);

        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          failures = 0;
          logInfo(`Circuit breaker for ${serviceName} is now CLOSED`);
        }

        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();

        if (failures >= config.threshold) {
          state = 'OPEN';
          logError(`Circuit breaker for ${serviceName} is now OPEN`, error);
        }

        throw error;
      }
    };
  }
}

// Monitoring middleware for response times
const responseTimeMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow responses
    if (duration > 1000) {
      logWarning('Slow response detected', {
        method: req.method,
        url: req.originalUrl,
        duration,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
};

// Memory leak detection
const memoryLeakDetector = () => {
  let baseline = null;
  const interval = 60000; // Check every minute
  
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    
    if (!baseline) {
      baseline = memoryUsage.heapUsed;
      return;
    }
    
    const growth = memoryUsage.heapUsed - baseline;
    const growthPercent = (growth / baseline) * 100;
    
    if (growthPercent > 50) { // 50% growth from baseline
      logWarning('Potential memory leak detected', {
        currentHeap: memoryUsage.heapUsed,
        baseline,
        growth,
        growthPercent
      });
    }
    
    // Update baseline gradually
    baseline = baseline * 0.9 + memoryUsage.heapUsed * 0.1;
  }, interval);
};

// Resource usage monitor
const resourceMonitor = () => {
  setInterval(() => {
    const usage = process.resourceUsage();
    
    logInfo('Resource usage', {
      type: 'resource_metrics',
      userCPUTime: usage.userCPUTime,
      systemCPUTime: usage.systemCPUTime,
      maxRSS: usage.maxRSS,
      sharedMemorySize: usage.sharedMemorySize,
      unsharedDataSize: usage.unsharedDataSize,
      unsharedStackSize: usage.unsharedStackSize,
      minorPageFault: usage.minorPageFault,
      majorPageFault: usage.majorPageFault,
      swappedOut: usage.swappedOut,
      fsRead: usage.fsRead,
      fsWrite: usage.fsWrite,
      ipcSent: usage.ipcSent,
      ipcReceived: usage.ipcReceived,
      signalsCount: usage.signalsCount,
      voluntaryContextSwitches: usage.voluntaryContextSwitches,
      involuntaryContextSwitches: usage.involuntaryContextSwitches
    });
  }, 300000); // Every 5 minutes
};

module.exports = {
  HealthCheckService,
  responseTimeMonitor,
  memoryLeakDetector,
  resourceMonitor
};