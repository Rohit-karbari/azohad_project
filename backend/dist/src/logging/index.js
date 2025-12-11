"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Custom format to sanitize PHI (Personally Identifiable Health Information)
const sanitizePhiFormat = winston_1.default.format((info) => {
    const sanitizeValue = (value) => {
        if (typeof value !== 'string')
            return value;
        // Remove patterns that look like email addresses (PHI)
        let sanitized = value.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '[REDACTED_EMAIL]');
        // Remove phone numbers (PHI)
        sanitized = sanitized.replace(/\d{3}-?\d{3}-?\d{4}/g, '[REDACTED_PHONE]');
        // Remove SSN-like patterns (PHI)
        sanitized = sanitized.replace(/\d{3}-\d{2}-\d{4}/g, '[REDACTED_SSN]');
        return sanitized;
    };
    if (typeof info.message === 'string') {
        info.message = sanitizeValue(info.message);
    }
    // Sanitize all other properties
    Object.keys(info).forEach((key) => {
        if (key !== 'timestamp' && key !== 'level') {
            info[key] = sanitizeValue(info[key]);
        }
    });
    return info;
});
const logDir = path_1.default.join(process.cwd(), 'logs');
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(sanitizePhiFormat(), winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
    defaultMeta: { service: 'mediconnect-backend', environment: process.env.NODE_ENV },
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(sanitizePhiFormat(), winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
//# sourceMappingURL=index.js.map