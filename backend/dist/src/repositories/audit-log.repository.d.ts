import { Knex } from 'knex';
import { ClinicalNote } from '../entities';
export declare class ClinicalNoteRepository {
    private knex;
    constructor(knex: Knex);
    create(note: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClinicalNote>;
    findById(id: string): Promise<ClinicalNote | null>;
    findByAppointmentId(appointmentId: string): Promise<ClinicalNote | null>;
    findByPatientId(patientId: string): Promise<ClinicalNote[]>;
    update(id: string, updates: Partial<ClinicalNote>): Promise<ClinicalNote | null>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
//# sourceMappingURL=audit-log.repository.d.ts.map