import { Knex } from 'knex';
import { Patient } from '../entities';
export declare class PatientRepository {
    private knex;
    constructor(knex: Knex);
    create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
    findById(id: string): Promise<Patient | null>;
    findByEmail(email: string): Promise<Patient | null>;
    findAll(): Promise<Patient[]>;
    update(id: string, updates: Partial<Patient>): Promise<Patient | null>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
//# sourceMappingURL=patient.repository.d.ts.map