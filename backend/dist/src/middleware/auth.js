"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.authMiddleware = authMiddleware;
exports.rbacMiddleware = rbacMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logging_1 = require("../logging");
function generateToken(payload) {
    const secret = process.env.JWT_SECRET || 'secret';
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRY || '24h',
    });
}
function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET || 'secret';
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
}
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 10);
}
async function verifyPassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ code: 'MISSING_TOKEN', message: 'Missing authentication token' });
            return;
        }
        const user = verifyToken(token);
        req.user = user;
        next();
    }
    catch (error) {
        logging_1.logger.warn('Authentication failed', {
            error: error.message,
            path: req.path,
        });
        res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid authentication token' });
    }
}
function rbacMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ code: 'MISSING_AUTH', message: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.type)) {
            logging_1.logger.warn('Unauthorized access attempt', {
                user: req.user.id,
                userType: req.user.type,
                allowedRoles,
                path: req.path,
            });
            res.status(403).json({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map