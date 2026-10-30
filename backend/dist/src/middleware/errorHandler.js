"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.Errors = exports.AppError = void 0;
const zod_1 = require("zod");
const logger_1 = require("../lib/logger");
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode, code, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Common error factories
exports.Errors = {
    unauthorized: (message = 'Unauthorized') => new AppError(message, 401, 'UNAUTHORIZED'),
    forbidden: (message = 'Access denied') => new AppError(message, 403, 'FORBIDDEN'),
    notFound: (resource = 'Resource') => new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
    conflict: (message) => new AppError(message, 409, 'CONFLICT'),
    badRequest: (message) => new AppError(message, 400, 'BAD_REQUEST'),
    internal: (message = 'Internal server error') => new AppError(message, 500, 'INTERNAL_ERROR', false),
};
function errorHandler(err, req, res, _next) {
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: err.flatten().fieldErrors,
        });
        return;
    }
    // Known operational errors
    if (err instanceof AppError) {
        if (!err.isOperational) {
            logger_1.logger.error('Non-operational error', { error: err.message, stack: err.stack });
        }
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
        return;
    }
    // Unknown errors — log full details, return generic message
    logger_1.logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
    });
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map