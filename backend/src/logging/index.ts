import winston from 'winston';
import path from 'path';

// Custom format to sanitize PHI (Personally Identifiable Health Information)
const sanitizePhiFormat = winston.format((info: any) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value !== 'string') return value;
    
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

const logDir = path.join(process.cwd(), 'logs');

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    sanitizePhiFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'mediconnect-backend', environment: process.env.NODE_ENV },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        sanitizePhiFormat(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}
