import { Knex } from 'knex';
import { Appointment } from '../entities';

export class AppointmentRepository {
  constructor(private knex: Knex) {}

  async create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
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

  async findById(id: string): Promise<Appointment | null> {
    const result = await this.knex('appointments').where({ id }).first();
    return result ? this.mapToEntity(result) : null;
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const results = await this.knex('appointments')
      .where({ patient_id: patientId })
      .orderBy('scheduled_at', 'asc');
    return results.map((r: any) => this.mapToEntity(r));
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    const results = await this.knex('appointments')
      .where({ doctor_id: doctorId })
      .orderBy('scheduled_at', 'asc');
    return results.map((r: any) => this.mapToEntity(r));
  }

  async findUpcoming(patientId: string, limit: number = 10): Promise<Appointment[]> {
    const results = await this.knex('appointments')
      .where({ patient_id: patientId })
      .where('scheduled_at', '>', new Date())
      .orderBy('scheduled_at', 'asc')
      .limit(limit);
    return results.map((r: any) => this.mapToEntity(r));
  }

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const [result] = await this.knex('appointments')
      .where({ id })
      .update({
        status: updates.status,
        notes: updates.notes,
      })
      .returning('*');

    return result ? this.mapToEntity(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.knex('appointments').where({ id }).delete();
    return result > 0;
  }

  private mapToEntity(row: any): Appointment {
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
