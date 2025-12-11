"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalNoteRepository = void 0;
class ClinicalNoteRepository {
    constructor(knex) {
        this.knex = knex;
    }
    async create(note) {
        const [result] = await this.knex('clinical_notes')
            .insert({
            appointment_id: note.appointmentId,
            doctor_id: note.doctorId,
            patient_id: note.patientId,
            chief_complaint: note.chiefComplaint,
            history_of_present_illness: note.historyOfPresentIllness,
            physical_examination: note.physicalExamination,
            assessment: note.assessment,
            plan: note.plan,
            medications: note.medications,
            follow_up: note.followUp,
            status: note.status || 'draft',
        })
            .returning('*');
        return this.mapToEntity(result);
    }
    async findById(id) {
        const result = await this.knex('clinical_notes').where({ id }).first();
        return result ? this.mapToEntity(result) : null;
    }
    async findByAppointmentId(appointmentId) {
        const result = await this.knex('clinical_notes')
            .where({ appointment_id: appointmentId })
            .first();
        return result ? this.mapToEntity(result) : null;
    }
    async findByPatientId(patientId) {
        const results = await this.knex('clinical_notes')
            .where({ patient_id: patientId })
            .orderBy('created_at', 'desc');
        return results.map((r) => this.mapToEntity(r));
    }
    async update(id, updates) {
        const [result] = await this.knex('clinical_notes')
            .where({ id })
            .update({
            chief_complaint: updates.chiefComplaint,
            history_of_present_illness: updates.historyOfPresentIllness,
            physical_examination: updates.physicalExamination,
            assessment: updates.assessment,
            plan: updates.plan,
            medications: updates.medications,
            follow_up: updates.followUp,
            status: updates.status,
        })
            .returning('*');
        return result ? this.mapToEntity(result) : null;
    }
    async delete(id) {
        const result = await this.knex('clinical_notes').where({ id }).delete();
        return result > 0;
    }
    mapToEntity(row) {
        return {
            id: row.id,
            appointmentId: row.appointment_id,
            doctorId: row.doctor_id,
            patientId: row.patient_id,
            chiefComplaint: row.chief_complaint,
            historyOfPresentIllness: row.history_of_present_illness,
            physicalExamination: row.physical_examination,
            assessment: row.assessment,
            plan: row.plan,
            medications: row.medications,
            followUp: row.follow_up,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
exports.ClinicalNoteRepository = ClinicalNoteRepository;
//# sourceMappingURL=audit-log.repository.js.map