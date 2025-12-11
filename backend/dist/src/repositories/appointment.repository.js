"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRepository = void 0;
class AppointmentRepository {
    constructor(knex) {
        this.knex = knex;
    }
    async create(appointment) {
        const [result] = await this.knex('appointments')
            .insert({
            patient_id: appointment.patientId,
            doctor_id: appointment.doctorId,
            scheduled_at: appointment.scheduledAt,
            status: appointment.status || 'scheduled',
            duration_minutes: appointment.durationMinutes || 30,
            reason_for_visit: appointment.reasonForVisit,
            notes: appointment.notes,
            appointment_type: appointment.appointmentType || 'in-person',
        })
            .returning('*');
        return this.mapToEntity(result);
    }
    async findById(id) {
        const result = await this.knex('appointments').where({ id }).first();
        return result ? this.mapToEntity(result) : null;
    }
    async findByPatientId(patientId) {
        const results = await this.knex('appointments')
            .where({ patient_id: patientId })
            .orderBy('scheduled_at', 'asc');
        return results.map((r) => this.mapToEntity(r));
    }
    async findByDoctorId(doctorId) {
        const results = await this.knex('appointments')
            .where({ doctor_id: doctorId })
            .orderBy('scheduled_at', 'asc');
        return results.map((r) => this.mapToEntity(r));
    }
    async findUpcoming(patientId, limit = 10) {
        const results = await this.knex('appointments')
            .where({ patient_id: patientId })
            .where('scheduled_at', '>', new Date())
            .orderBy('scheduled_at', 'asc')
            .limit(limit);
        return results.map((r) => this.mapToEntity(r));
    }
    async update(id, updates) {
        const [result] = await this.knex('appointments')
            .where({ id })
            .update({
            status: updates.status,
            notes: updates.notes,
        })
            .returning('*');
        return result ? this.mapToEntity(result) : null;
    }
    async delete(id) {
        const result = await this.knex('appointments').where({ id }).delete();
        return result > 0;
    }
    mapToEntity(row) {
        return {
            id: row.id,
            patientId: row.patient_id,
            doctorId: row.doctor_id,
            scheduledAt: row.scheduled_at,
            status: row.status,
            durationMinutes: row.duration_minutes,
            reasonForVisit: row.reason_for_visit,
            notes: row.notes,
            appointmentType: row.appointment_type,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
exports.AppointmentRepository = AppointmentRepository;
//# sourceMappingURL=appointment.repository.js.map