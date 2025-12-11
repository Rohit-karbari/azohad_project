"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalNoteService = void 0;
const audit_log_repository_1 = require("../repositories/audit-log.repository");
const dtos_1 = require("../dtos");
const errors_1 = require("../utils/errors");
const audit_logger_1 = require("../utils/audit-logger");
const logging_1 = require("../logging");
class ClinicalNoteService {
    constructor(_knex) {
        this.noteRepo = new audit_log_repository_1.ClinicalNoteRepository(_knex);
        this.auditLogger = new audit_logger_1.AuditLogger(_knex);
    }
    async createClinicalNote(data, userId, ipAddress, correlationId) {
        (0, errors_1.validateInput)(dtos_1.clinicalNoteSchema, data);
        // RBAC: Only the treating doctor can add notes
        const note = await this.noteRepo.create({
            appointmentId: data.appointmentId,
            patientId: data.patientId,
            doctorId: userId,
            chiefComplaint: data.chiefComplaint,
            historyOfPresentIllness: data.historyOfPresentIllness,
            physicalExamination: data.physicalExamination,
            assessment: data.assessment,
            plan: data.plan,
            medications: data.medications,
            followUp: data.followUp,
            status: 'draft',
        });
        await this.auditLogger.log(userId, 'doctor', 'CREATE', 'clinical_note', note.id, `Clinical note created for patient ${data.patientId}`, undefined, { appointmentId: note.appointmentId }, ipAddress, correlationId, 'success');
        logging_1.logger.info('Clinical note created', {
            noteId: note.id,
            patientId: data.patientId,
            doctorId: userId,
        });
        return {
            id: note.id,
            appointmentId: note.appointmentId,
            patientId: note.patientId,
            doctorId: note.doctorId,
            status: note.status,
        };
    }
    async updateClinicalNote(noteId, updates, userId, ipAddress, correlationId) {
        const note = await this.noteRepo.findById(noteId);
        if (!note) {
            throw new errors_1.ApiError(404, 'NOT_FOUND', 'Clinical note not found');
        }
        // RBAC: Only the doctor who created the note can update it
        if (note.doctorId !== userId) {
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Can only update your own notes');
        }
        // Cannot update finalized or signed notes
        if (note.status !== 'draft') {
            throw new errors_1.ApiError(400, 'INVALID_STATE', 'Cannot modify finalized or signed notes');
        }
        const updated = await this.noteRepo.update(noteId, {
            ...note,
            ...updates,
            status: (updates.status || note.status),
        });
        if (!updated) {
            throw new errors_1.ApiError(500, 'UPDATE_FAILED', 'Failed to update clinical note');
        }
        await this.auditLogger.log(userId, 'doctor', 'UPDATE', 'clinical_note', noteId, 'Clinical note updated', { old: note }, { new: updated }, ipAddress, correlationId, 'success');
        logging_1.logger.info('Clinical note updated', { noteId });
        return {
            id: updated.id,
            appointmentId: updated.appointmentId,
            patientId: updated.patientId,
            doctorId: updated.doctorId,
            status: updated.status,
        };
    }
    async finalizeClinicalNote(noteId, userId, ipAddress, correlationId) {
        const note = await this.noteRepo.findById(noteId);
        if (!note) {
            throw new errors_1.ApiError(404, 'NOT_FOUND', 'Clinical note not found');
        }
        if (note.doctorId !== userId) {
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Can only finalize your own notes');
        }
        if (note.status !== 'draft') {
            throw new errors_1.ApiError(400, 'INVALID_STATE', 'Only draft notes can be finalized');
        }
        await this.noteRepo.update(noteId, {
            ...note,
            status: 'finalized',
        });
        await this.auditLogger.log(userId, 'doctor', 'FINALIZE', 'clinical_note', noteId, 'Clinical note finalized', { status: note.status }, { status: 'finalized' }, ipAddress, correlationId, 'success');
        logging_1.logger.info('Clinical note finalized', { noteId });
    }
    async getClinicalNoteByAppointment(appointmentId, userId, userType, correlationId) {
        const note = await this.noteRepo.findByAppointmentId(appointmentId);
        if (!note) {
            return null;
        }
        // RBAC: Patient can view notes, doctor can view their own notes
        if (userType === 'patient' && note.patientId !== userId) {
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Can only view your own medical records');
        }
        if (userType === 'doctor' && note.doctorId !== userId) {
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Can only view your own notes');
        }
        await this.auditLogger.log(userId, userType, 'VIEW', 'clinical_note', note.id, 'Clinical note viewed', undefined, undefined, undefined, correlationId, 'success');
        return {
            id: note.id,
            appointmentId: note.appointmentId,
            patientId: note.patientId,
            doctorId: note.doctorId,
            chiefComplaint: note.chiefComplaint,
            historyOfPresentIllness: note.historyOfPresentIllness,
            physicalExamination: note.physicalExamination,
            assessment: note.assessment,
            plan: note.plan,
            medications: note.medications,
            followUp: note.followUp,
            status: note.status,
        };
    }
}
exports.ClinicalNoteService = ClinicalNoteService;
//# sourceMappingURL=doctor-note.service.js.map