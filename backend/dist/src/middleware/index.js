"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlationIdMiddleware = correlationIdMiddleware;
exports.requestLoggerMiddleware = requestLoggerMiddleware;
exports.errorHandlerMiddleware = errorHandlerMiddleware;
const uuid_1 = require("uuid");
const logging_1 = require("../logging");
function correlationIdMiddleware(req, res, next) {
    const correlationId = req.headers['x-correlation-id'] || (0, uuid_1.v4)();
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    // Store in logger metadata for all subsequent logs
    logging_1.logger.defaultMeta = {
        ...logging_1.logger.defaultMeta,
        correlationId,
    };
    next();
}
function requestLoggerMiddleware(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logging_1.logger.info('HTTP Request', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            correlationId: req.correlationId,
            ip: req.ip,
        });
    });
    next();
}
function errorHandlerMiddleware(err, req, res, _next) {
    logging_1.logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        correlationId: req.correlationId,
    });
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const message = statusCode === 500 ? 'Internal server error' : err.message;
    res.status(statusCode).json({
        code,
        message,
        correlationId: req.correlationId,
    });
}
//# sourceMappingURL=index.js.map