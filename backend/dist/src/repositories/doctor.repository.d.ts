import { Knex } from 'knex';
import { Doctor } from '../entities';
export declare class DoctorRepository {
    private knex;
    constructor(knex: Knex);
    create(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor>;
    findById(id: string): Promise<Doctor | null>;
    findByEmail(email: string): Promise<Doctor | null>;
    findBySpecialization(specialization: string): Promise<Doctor[]>;
    findAll(): Promise<Doctor[]>;
    update(id: string, updates: Partial<Doctor>): Promise<Doctor | null>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
//# sourceMappingURL=doctor.repository.d.ts.map