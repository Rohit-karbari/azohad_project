"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const patient_repository_1 = require("../repositories/patient.repository");
const dtos_1 = require("../dtos");
const auth_1 = require("../middleware/auth");
const errors_1 = require("../utils/errors");
const audit_logger_1 = require("../utils/audit-logger");
const logging_1 = require("../logging");
class AuthService {
    constructor(_knex) {
        this.patientRepo = new patient_repository_1.PatientRepository(_knex);
        this.auditLogger = new audit_logger_1.AuditLogger(_knex);
    }
    async registerPatient(data, ipAddress, correlationId) {
        (0, errors_1.validateInput)(dtos_1.patientRegistrationSchema, data);
        const existing = await this.patientRepo.findByEmail(data.email);
        if (existing) {
            await this.auditLogger.log('unknown', 'patient', 'REGISTER', 'patient', undefined, 'Patient registration failed - email already exists', undefined, undefined, ipAddress, correlationId, 'failure');
            throw new errors_1.ApiError(409, 'EMAIL_EXISTS', 'Email already registered');
        }
        const passwordHash = await (0, auth_1.hashPassword)(data.password);
        const patient = await this.patientRepo.create({
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            phone: data.phone,
            gender: data.gender,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            status: 'active',
            emailVerified: false,
        });
        const token = (0, auth_1.generateToken)({
            id: patient.id,
            email: patient.email,
            type: 'patient',
        });
        await this.auditLogger.log(patient.id, 'patient', 'REGISTER', 'patient', patient.id, 'Patient registered successfully', undefined, { email: patient.email }, ipAddress, correlationId, 'success');
        logging_1.logger.info('Patient registered', { patientId: patient.id, email: patient.email });
        return {
            token,
            patient: {
                id: patient.id,
                email: patient.email,
                firstName: patient.firstName,
                lastName: patient.lastName,
            },
        };
    }
    async loginPatient(email, password, ipAddress, correlationId) {
        const patient = await this.patientRepo.findByEmail(email);
        if (!patient) {
            await this.auditLogger.log('unknown', 'patient', 'LOGIN', 'patient', undefined, 'Login failed - patient not found', undefined, undefined, ipAddress, correlationId, 'failure');
            throw new errors_1.ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        const isValid = await (0, auth_1.verifyPassword)(password, patient.passwordHash);
        if (!isValid) {
            await this.auditLogger.log(patient.id, 'patient', 'LOGIN', 'patient', patient.id, 'Login failed - invalid password', undefined, undefined, ipAddress, correlationId, 'failure');
            throw new errors_1.ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        const token = (0, auth_1.generateToken)({
            id: patient.id,
            email: patient.email,
            type: 'patient',
        });
        await this.auditLogger.log(patient.id, 'patient', 'LOGIN', 'patient', patient.id, 'Patient logged in successfully', undefined, undefined, ipAddress, correlationId, 'success');
        logging_1.logger.info('Patient logged in', { patientId: patient.id });
        return {
            token,
            patient: {
                id: patient.id,
                email: patient.email,
                firstName: patient.firstName,
                lastName: patient.lastName,
            },
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map