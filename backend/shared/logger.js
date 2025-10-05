const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Custom colors for log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'blue'
};

winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, ...meta }) => {
    let logMessage = `${timestamp} [${service || 'APP'}] ${level}: ${message}`;
    
    if (requestId) {
      logMessage += ` (reqId: ${requestId})`;
    }
    
    if (userId) {
      logMessage += ` (userId: ${userId})`;
    }
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create log directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');

// Transport for general application logs
const generalTransport = new DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '30d',
  format: fileFormat,
  level: 'info'
});

// Transport for error logs
const errorTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '30d',
  format: fileFormat,
  level: 'error'
});

// Transport for HTTP access logs
const httpTransport = new DailyRotateFile({
  filename: path.join(logDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '30d',
  format: fileFormat,
  level: 'http'
});

// Transport for audit logs (security events)
const auditTransport = new DailyRotateFile({
  filename: path.join(logDir, 'audit-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '90d', // Keep audit logs longer
  format: fileFormat
});

// Create the main logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'smart-laundry',
    hostname: require('os').hostname(),
    pid: process.pid
  },
  transports: [
    generalTransport,
    errorTransport,
    httpTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      format: fileFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      format: fileFormat
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Create specialized loggers
const auditLogger = winston.createLogger({
  levels: logLevels,
  format: fileFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'smart-laundry',
    type: 'audit'
  },
  transports: [auditTransport]
});

const performanceLogger = winston.createLogger({
  levels: logLevels,
  format: fileFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'smart-laundry',
    type: 'performance'
  },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '7d',
      format: fileFormat
    })
  ]
});

// Helper functions for structured logging
const createLogContext = (req, additionalData = {}) => {
  return {
    requestId: req.headers['x-request-id'] || req.id,
    userId: req.user?.id || req.user?._id,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    method: req.method,
    url: req.originalUrl || req.url,
    ...additionalData
  };
};

// Wrapper functions for different log types
const logInfo = (message, context = {}) => {
  logger.info(message, context);
};

const logError = (message, error, context = {}) => {
  const errorContext = {
    ...context,
    error: {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      status: error?.status
    }
  };
  logger.error(message, errorContext);
};

const logWarning = (message, context = {}) => {
  logger.warn(message, context);
};

const logDebug = (message, context = {}) => {
  logger.debug(message, context);
};

const logHttp = (message, context = {}) => {
  logger.http(message, context);
};

// Audit logging functions
const logAudit = (event, user, details = {}) => {
  auditLogger.info('Security Event', {
    event,
    userId: user?.id || user?._id,
    userEmail: user?.email,
    timestamp: new Date().toISOString(),
    ...details
  });
};

const logLogin = (user, req, success = true) => {
  logAudit('user_login', user, {
    success,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method
  });
};

const logLogout = (user, req) => {
  logAudit('user_logout', user, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};

const logFailedLogin = (email, req, reason) => {
  logAudit('failed_login', { email }, {
    reason,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};

const logDataAccess = (user, resource, action, req) => {
  logAudit('data_access', user, {
    resource,
    action,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};

const logAdminAction = (user, action, target, req) => {
  logAudit('admin_action', user, {
    action,
    target,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
};

// Performance logging functions
const logPerformance = (operation, duration, context = {}) => {
  performanceLogger.info('Performance Metric', {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...context
  });
};

const logDatabaseQuery = (query, duration, collection) => {
  logPerformance('database_query', duration, {
    query: typeof query === 'string' ? query : JSON.stringify(query),
    collection
  });
};

const logApiResponse = (endpoint, method, duration, statusCode, req) => {
  logPerformance('api_response', duration, {
    endpoint,
    method,
    statusCode,
    requestId: req.headers['x-request-id'] || req.id,
    userId: req.user?.id || req.user?._id
  });
};

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Generate request ID if not present
  req.id = req.headers['x-request-id'] || require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.id);
  
  // Log incoming request
  logHttp('Incoming Request', createLogContext(req, {
    body: req.method !== 'GET' ? req.body : undefined
  }));
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    // Log response
    logHttp('Request Completed', createLogContext(req, {
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length')
    }));
    
    // Log performance metric
    logApiResponse(req.route?.path || req.path, req.method, duration, res.statusCode, req);
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const context = createLogContext(req, {
    statusCode: err.status || 500
  });
  
  logError('Request Error', err, context);
  next(err);
};

// Security event logger middleware
const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const userAgent = req.get('User-Agent');
  const ip = req.ip;
  
  // Check for common attack patterns
  if (req.url.includes('..') || req.url.includes('<script>')) {
    logAudit('suspicious_request', req.user, {
      type: 'path_traversal_or_xss',
      url: req.url,
      ip,
      userAgent
    });
  }
  
  // Log sensitive operations
  if (req.method === 'DELETE' || 
      (req.method === 'POST' && req.url.includes('/admin'))) {
    logAudit('sensitive_operation', req.user, {
      method: req.method,
      url: req.url,
      ip,
      userAgent
    });
  }
  
  next();
};

// Database operation logger
const dbLogger = {
  logQuery: (collection, operation, query, duration) => {
    logDatabaseQuery(`${operation} on ${collection}`, duration, collection);
  },
  
  logSlowQuery: (collection, operation, query, duration) => {
    if (duration > 1000) { // Log queries slower than 1 second
      logWarning('Slow Database Query', {
        collection,
        operation,
        query: JSON.stringify(query),
        duration
      });
    }
  }
};

// Health check logger
const healthLogger = {
  logCheck: (service, status, duration, details = {}) => {
    const level = status === 'healthy' ? 'info' : 'warn';
    logger.log(level, 'Health Check', {
      service,
      status,
      duration,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
};

// Graceful shutdown logging
const shutdownLogger = {
  logShutdown: (reason, signal) => {
    logger.info('Application Shutdown', {
      reason,
      signal,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
};

module.exports = {
  logger,
  auditLogger,
  performanceLogger,
  
  // Logging functions
  logInfo,
  logError,
  logWarning,
  logDebug,
  logHttp,
  
  // Audit functions
  logAudit,
  logLogin,
  logLogout,
  logFailedLogin,
  logDataAccess,
  logAdminAction,
  
  // Performance functions
  logPerformance,
  logDatabaseQuery,
  logApiResponse,
  
  // Middleware
  requestLogger,
  errorLogger,
  securityLogger,
  
  // Specialized loggers
  dbLogger,
  healthLogger,
  shutdownLogger,
  
  // Utilities
  createLogContext
};