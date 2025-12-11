import { Knex } from 'knex';
import { Doctor } from '../entities';

export class DoctorRepository {
  constructor(private knex: Knex) {}

  async create(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
    const [result] = await this.knex('doctors')
      .insert({
        email: doctor.email,
        password_hash: doctor.passwordHash,
        first_name: doctor.firstName,
        last_name: doctor.lastName,
        license_number: doctor.licenseNumber,
        specialization: doctor.specialization,
        bio: doctor.bio,
        phone: doctor.phone,
        status: doctor.status,
        email_verified: doctor.emailVerified,
      })
      .returning('*');

    return this.mapToEntity(result);
  }

  async findById(id: string): Promise<Doctor | null> {
    const result = await this.knex('doctors').where({ id }).first();
    return result ? this.mapToEntity(result) : null;
  }

  async findByEmail(email: string): Promise<Doctor | null> {
    const result = await this.knex('doctors').where({ email }).first();
    return result ? this.mapToEntity(result) : null;
  }

  async findBySpecialization(specialization: string): Promise<Doctor[]> {
    const results = await this.knex('doctors').where({ specialization });
    return results.map((r: any) => this.mapToEntity(r));
  }

  async findAll(): Promise<Doctor[]> {
    const results = await this.knex('doctors').select();
    return results.map((r: any) => this.mapToEntity(r));
  }

  async update(id: string, updates: Partial<Doctor>): Promise<Doctor | null> {
    const [result] = await this.knex('doctors')
      .where({ id })
      .update({
        email: updates.email,
        first_name: updates.firstName,
        last_name: updates.lastName,
        bio: updates.bio,
        phone: updates.phone,
        status: updates.status,
      })
      .returning('*');

    return result ? this.mapToEntity(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.knex('doctors').where({ id }).delete();
    return result > 0;
  }

  private mapToEntity(row: any): Doctor {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      licenseNumber: row.license_number,
      specialization: row.specialization,
      bio: row.bio,
      phone: row.phone,
      status: row.status,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
