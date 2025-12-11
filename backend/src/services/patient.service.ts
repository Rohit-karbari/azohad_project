import { Knex } from 'knex';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientDTO } from '../dtos';
import { ApiError } from '../utils/errors';
import { AuditLogger } from '../utils/audit-logger';
import { logger } from '../logging';

export class PatientService {
  private patientRepo: PatientRepository;
  private auditLogger: AuditLogger;

  constructor(_knex: Knex) {
    this.patientRepo = new PatientRepository(_knex);
    this.auditLogger = new AuditLogger(_knex);
  }

  async getPatientById(
    id: string,
    requestingUserId: string,
    correlationId: string
  ): Promise<Partial<PatientDTO>> {
    // RBAC: patients can only view their own data
    if (id !== requestingUserId) {
      await this.auditLogger.log(
        requestingUserId,
        'patient',
        'VIEW',
        'patient',
        id,
        'Unauthorized access to patient data',
        undefined,
        undefined,
        undefined,
        correlationId,
        'failure'
      );
      throw new ApiError(403, 'FORBIDDEN', 'Cannot access other patients data');
    }

    const patient = await this.patientRepo.findById(id);
    if (!patient) {
      throw new ApiError(404, 'NOT_FOUND', 'Patient not found');
    }

    await this.auditLogger.log(
      requestingUserId,
      'patient',
      'VIEW',
      'patient',
      id,
      'Patient data accessed',
      undefined,
      undefined,
      undefined,
      correlationId,
      'success'
    );

    return {
      id: patient.id,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      city: patient.city,
      state: patient.state,
      zipCode: patient.zipCode,
    };
  }

  async updatePatient(
    id: string,
    updates: Partial<PatientDTO>,
    requestingUserId: string,
    correlationId: string
  ): Promise<Partial<PatientDTO>> {
    // RBAC: patients can only update their own data
    if (id !== requestingUserId) {
      throw new ApiError(403, 'FORBIDDEN', 'Cannot update other patients data');
    }

    const patient = await this.patientRepo.findById(id);
    if (!patient) {
      throw new ApiError(404, 'NOT_FOUND', 'Patient not found');
    }

    const updated = await this.patientRepo.update(id, {
      ...patient,
      ...updates,
    });

    if (!updated) {
      throw new ApiError(500, 'UPDATE_FAILED', 'Failed to update patient');
    }

    await this.auditLogger.log(
      requestingUserId,
      'patient',
      'UPDATE',
      'patient',
      id,
      'Patient updated',
      { old: patient },
      { new: updated },
      undefined,
      correlationId,
      'success'
    );

    logger.info('Patient updated', { patientId: id });

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
    };
  }
}
