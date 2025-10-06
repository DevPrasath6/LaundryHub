"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    const { statusCode = 500, message } = err;
    logger_1.logger.error(`Error ${statusCode}: ${message}`, {
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal server error' : message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map