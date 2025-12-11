"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const patient_repository_1 = require("../repositories/patient.repository");
const errors_1 = require("../utils/errors");
const audit_logger_1 = require("../utils/audit-logger");
const logging_1 = require("../logging");
class PatientService {
    constructor(_knex) {
        this.patientRepo = new patient_repository_1.PatientRepository(_knex);
        this.auditLogger = new audit_logger_1.AuditLogger(_knex);
    }
    async getPatientById(id, requestingUserId, correlationId) {
        // RBAC: patients can only view their own data
        if (id !== requestingUserId) {
            await this.auditLogger.log(requestingUserId, 'patient', 'VIEW', 'patient', id, 'Unauthorized access to patient data', undefined, undefined, undefined, correlationId, 'failure');
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Cannot access other patients data');
        }
        const patient = await this.patientRepo.findById(id);
        if (!patient) {
            throw new errors_1.ApiError(404, 'NOT_FOUND', 'Patient not found');
        }
        await this.auditLogger.log(requestingUserId, 'patient', 'VIEW', 'patient', id, 'Patient data accessed', undefined, undefined, undefined, correlationId, 'success');
        return {
            id: patient.id,
            email: patient.email,
            firstName: patient.firstName,
            lastName: patient.lastName,
            phone: patient.phone,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            address: patient.address,
            city: patient.city,
            state: patient.state,
            zipCode: patient.zipCode,
        };
    }
    async updatePatient(id, updates, requestingUserId, correlationId) {
        // RBAC: patients can only update their own data
        if (id !== requestingUserId) {
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Cannot update other patients data');
        }
        const patient = await this.patientRepo.findById(id);
        if (!patient) {
            throw new errors_1.ApiError(404, 'NOT_FOUND', 'Patient not found');
        }
        const updated = await this.patientRepo.update(id, {
            ...patient,
            ...updates,
        });
        if (!updated) {
            throw new errors_1.ApiError(500, 'UPDATE_FAILED', 'Failed to update patient');
        }
        await this.auditLogger.log(requestingUserId, 'patient', 'UPDATE', 'patient', id, 'Patient updated', { old: patient }, { new: updated }, undefined, correlationId, 'success');
        logging_1.logger.info('Patient updated', { patientId: id });
        return {
            id: updated.id,
            email: updated.email,
            firstName: updated.firstName,
            lastName: updated.lastName,
        };
    }
}
exports.PatientService = PatientService;
//# sourceMappingURL=patient.service.js.map