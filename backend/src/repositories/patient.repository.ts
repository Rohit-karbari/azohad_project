import { Knex } from 'knex';
import { Patient } from '../entities';

export class PatientRepository {
  constructor(private knex: Knex) {}

  async create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const [result] = await this.knex('patients')
      .insert({
        email: patient.email,
        password_hash: patient.passwordHash,
        first_name: patient.firstName,
        last_name: patient.lastName,
        date_of_birth: patient.dateOfBirth,
        phone: patient.phone,
        gender: patient.gender,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        zip_code: patient.zipCode,
        status: patient.status,
        email_verified: patient.emailVerified,
      })
      .returning('*');

    return this.mapToEntity(result);
  }

  async findById(id: string): Promise<Patient | null> {
    const result = await this.knex('patients').where({ id }).first();
    return result ? this.mapToEntity(result) : null;
  }

  async findByEmail(email: string): Promise<Patient | null> {
    const result = await this.knex('patients').where({ email }).first();
    return result ? this.mapToEntity(result) : null;
  }

  async findAll(): Promise<Patient[]> {
    const results = await this.knex('patients').select();
    return results.map((r: any) => this.mapToEntity(r));
  }

  async update(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    const [result] = await this.knex('patients')
      .where({ id })
      .update({
        email: updates.email,
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        address: updates.address,
        city: updates.city,
        state: updates.state,
        zip_code: updates.zipCode,
        status: updates.status,
      })
      .returning('*');

    return result ? this.mapToEntity(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.knex('patients').where({ id }).delete();
    return result > 0;
  }

  private mapToEntity(row: any): Patient {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth,
      phone: row.phone,
      gender: row.gender,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      status: row.status,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
