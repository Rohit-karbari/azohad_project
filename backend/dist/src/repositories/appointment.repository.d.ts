import { Knex } from 'knex';
import { Appointment } from '../entities';
export declare class AppointmentRepository {
    private knex;
    constructor(knex: Knex);
    create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
    findById(id: string): Promise<Appointment | null>;
    findByPatientId(patientId: string): Promise<Appointment[]>;
    findByDoctorId(doctorId: string): Promise<Appointment[]>;
    findUpcoming(patientId: string, limit?: number): Promise<Appointment[]>;
    update(id: string, updates: Partial<Appointment>): Promise<Appointment | null>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
//# sourceMappingURL=appointment.repository.d.ts.map