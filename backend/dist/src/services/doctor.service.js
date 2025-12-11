"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorService = void 0;
const doctor_repository_1 = require("../repositories/doctor.repository");
const dtos_1 = require("../dtos");
const auth_1 = require("../middleware/auth");
const errors_1 = require("../utils/errors");
const audit_logger_1 = require("../utils/audit-logger");
const logging_1 = require("../logging");
class DoctorService {
    constructor(_knex) {
        this.doctorRepo = new doctor_repository_1.DoctorRepository(_knex);
        this.auditLogger = new audit_logger_1.AuditLogger(_knex);
    }
    async registerDoctor(data, ipAddress, correlationId) {
        (0, errors_1.validateInput)(dtos_1.doctorRegistrationSchema, data);
        const existing = await this.doctorRepo.findByEmail(data.email);
        if (existing) {
            await this.auditLogger.log('unknown', 'doctor', 'REGISTER', 'doctor', undefined, 'Doctor registration failed - email already exists', undefined, undefined, ipAddress, correlationId, 'failure');
            throw new errors_1.ApiError(409, 'EMAIL_EXISTS', 'Email already registered');
        }
        const passwordHash = await (0, auth_1.hashPassword)(data.password);
        const doctor = await this.doctorRepo.create({
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            licenseNumber: data.licenseNumber,
            specialization: data.specialization,
            bio: data.bio,
            phone: data.phone,
            status: 'active',
            emailVerified: false,
        });
        const token = (0, auth_1.generateToken)({
            id: doctor.id,
            email: doctor.email,
            type: 'doctor',
        });
        await this.auditLogger.log(doctor.id, 'doctor', 'REGISTER', 'doctor', doctor.id, 'Doctor registered successfully', undefined, { email: doctor.email }, ipAddress, correlationId, 'success');
        logging_1.logger.info('Doctor registered', { doctorId: doctor.id, email: doctor.email });
        return {
            token,
            doctor: {
                id: doctor.id,
                email: doctor.email,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization,
            },
        };
    }
    async loginDoctor(email, password, ipAddress, correlationId) {
        const doctor = await this.doctorRepo.findByEmail(email);
        if (!doctor) {
            await this.auditLogger.log('unknown', 'doctor', 'LOGIN', 'doctor', undefined, 'Login failed - doctor not found', undefined, undefined, ipAddress, correlationId, 'failure');
            throw new errors_1.ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        const { verifyPassword } = await Promise.resolve().then(() => __importStar(require('../middleware/auth')));
        const isValid = await verifyPassword(password, doctor.passwordHash);
        if (!isValid) {
            await this.auditLogger.log(doctor.id, 'doctor', 'LOGIN', 'doctor', doctor.id, 'Login failed - invalid password', undefined, undefined, ipAddress, correlationId, 'failure');
            throw new errors_1.ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        const token = (0, auth_1.generateToken)({
            id: doctor.id,
            email: doctor.email,
            type: 'doctor',
        });
        await this.auditLogger.log(doctor.id, 'doctor', 'LOGIN', 'doctor', doctor.id, 'Doctor logged in successfully', undefined, undefined, ipAddress, correlationId, 'success');
        logging_1.logger.info('Doctor logged in', { doctorId: doctor.id });
        return {
            token,
            doctor: {
                id: doctor.id,
                email: doctor.email,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization,
            },
        };
    }
    async getDoctorById(id) {
        const doctor = await this.doctorRepo.findById(id);
        if (!doctor) {
            throw new errors_1.ApiError(404, 'NOT_FOUND', 'Doctor not found');
        }
        return {
            id: doctor.id,
            email: doctor.email,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            licenseNumber: doctor.licenseNumber,
            specialization: doctor.specialization,
            phone: doctor.phone,
        };
    }
    async listDoctorsBySpecialization(specialization) {
        const doctors = await this.doctorRepo.findBySpecialization(specialization);
        return doctors.map((doctor) => ({
            id: doctor.id,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            specialization: doctor.specialization,
            bio: doctor.bio,
            phone: doctor.phone,
        }));
    }
}
exports.DoctorService = DoctorService;
//# sourceMappingURL=doctor.service.js.map