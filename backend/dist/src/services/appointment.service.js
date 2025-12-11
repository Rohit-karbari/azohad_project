"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const appointment_repository_1 = require("../repositories/appointment.repository");
const patient_repository_1 = require("../repositories/patient.repository");
const doctor_repository_1 = require("../repositories/doctor.repository");
const errors_1 = require("../utils/errors");
const audit_logger_1 = require("../utils/audit-logger");
const logging_1 = require("../logging");
class AppointmentService {
    constructor(_knex) {
        this.appointmentRepo = new appointment_repository_1.AppointmentRepository(_knex);
        this.patientRepo = new patient_repository_1.PatientRepository(_knex);
        this.doctorRepo = new doctor_repository_1.DoctorRepository(_knex);
        this.auditLogger = new audit_logger_1.AuditLogger(_knex);
    }
    async createAppointment(data, userId, userType, ipAddress, correlationId) {
        // RBAC: only patients can create appointments for themselves
        if (userType === 'patient' && data.patientId !== userId) {
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Can only create appointments for yourself');
        }
        // Validate patient exists
        const patient = await this.patientRepo.findById(data.patientId);
        if (!patient) {
            throw new errors_1.ApiError(404, 'NOT_FOUND', 'Patient not found');
        }
        // Validate doctor exists
        const doctor = await this.doctorRepo.findById(data.doctorId);
        if (!doctor) {
            throw new errors_1.ApiError(404, 'NOT_FOUND', 'Doctor not found');
        }
        // Validate appointment is in future
        if (new Date(data.scheduledAt) <= new Date()) {
            throw new errors_1.ApiError(400, 'INVALID_DATE', 'Appointment must be scheduled for future date');
        }
        const appointment = await this.appointmentRepo.create({
            patientId: data.patientId,
            doctorId: data.doctorId,
            scheduledAt: new Date(data.scheduledAt),
            durationMinutes: data.durationMinutes || 30,
            reasonForVisit: data.reasonForVisit,
            appointmentType: (data.appointmentType || 'in-person'),
            status: 'scheduled',
            notes: undefined,
        });
        await this.auditLogger.log(userId, userType, 'CREATE', 'appointment', appointment.id, `Appointment created between patient ${data.patientId} and doctor ${data.doctorId}`, undefined, { appointmentId: appointment.id }, ipAddress, correlationId, 'success');
        logging_1.logger.info('Appointment created', {
            appointmentId: appointment.id,
            patientId: data.patientId,
            doctorId: data.doctorId,
        });
        return {
            id: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            scheduledAt: appointment.scheduledAt.toISOString(),
            durationMinutes: appointment.durationMinutes,
            reasonForVisit: appointment.reasonForVisit,
            appointmentType: appointment.appointmentType,
            status: appointment.status,
        };
    }
    async getUpcomingAppointments(patientId, userId, correlationId) {
        // RBAC: patients can only view their own appointments
        if (patientId !== userId) {
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Can only view your own appointments');
        }
        const appointments = await this.appointmentRepo.findUpcoming(patientId, 10);
        await this.auditLogger.log(userId, 'patient', 'VIEW', 'appointment', undefined, 'Retrieved upcoming appointments', undefined, undefined, undefined, correlationId, 'success');
        return appointments.map((apt) => ({
            id: apt.id,
            patientId: apt.patientId,
            doctorId: apt.doctorId,
            scheduledAt: apt.scheduledAt.toISOString(),
            durationMinutes: apt.durationMinutes,
            reasonForVisit: apt.reasonForVisit,
            appointmentType: apt.appointmentType,
            status: apt.status,
        }));
    }
    async cancelAppointment(appointmentId, userId, userType, correlationId) {
        const appointment = await this.appointmentRepo.findById(appointmentId);
        if (!appointment) {
            throw new errors_1.ApiError(404, 'NOT_FOUND', 'Appointment not found');
        }
        // RBAC: only patient or assigned doctor can cancel
        if (userType === 'patient' && appointment.patientId !== userId) {
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Can only cancel your own appointments');
        }
        if (userType === 'doctor' && appointment.doctorId !== userId) {
            throw new errors_1.ApiError(403, 'FORBIDDEN', 'Can only cancel your own appointments');
        }
        await this.appointmentRepo.update(appointmentId, {
            ...appointment,
            status: 'cancelled',
        });
        await this.auditLogger.log(userId, userType, 'CANCEL', 'appointment', appointmentId, 'Appointment cancelled', { status: appointment.status }, { status: 'cancelled' }, undefined, correlationId, 'success');
        logging_1.logger.info('Appointment cancelled', { appointmentId });
    }
}
exports.AppointmentService = AppointmentService;
//# sourceMappingURL=appointment.service.js.map