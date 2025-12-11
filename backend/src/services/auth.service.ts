import { Knex } from 'knex';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientDTO, patientRegistrationSchema } from '../dtos';
import { hashPassword, verifyPassword, generateToken } from '../middleware/auth';
import { validateInput, ApiError } from '../utils/errors';
import { AuditLogger } from '../utils/audit-logger';
import { logger } from '../logging';

export class AuthService {
  private patientRepo: PatientRepository;
  private auditLogger: AuditLogger;

  constructor(_knex: Knex) {
    this.patientRepo = new PatientRepository(_knex);
    this.auditLogger = new AuditLogger(_knex);
  }

  async registerPatient(
    data: PatientDTO,
    ipAddress: string,
    correlationId: string,
  ): Promise<{ token: string; patient: Partial<PatientDTO> }> {
    validateInput(patientRegistrationSchema, data);

    const existing = await this.patientRepo.findByEmail(data.email);
    if (existing) {
      await this.auditLogger.log(
        'unknown',
        'patient',
        'REGISTER',
        'patient',
        undefined,
        'Patient registration failed - email already exists',
        undefined,
        undefined,
        ipAddress,
        correlationId,
        'failure',
      );
      throw new ApiError(409, 'EMAIL_EXISTS', 'Email already registered');
    }

    const passwordHash = await hashPassword(data.password!);
    const patient = await this.patientRepo.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      phone: data.phone,
      gender: data.gender,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      status: 'active',
      emailVerified: false,
    });

    const token = generateToken({
      id: patient.id,
      email: patient.email,
      type: 'patient',
    });

    await this.auditLogger.log(
      patient.id,
      'patient',
      'REGISTER',
      'patient',
      patient.id,
      'Patient registered successfully',
      undefined,
      { email: patient.email },
      ipAddress,
      correlationId,
      'success',
    );

    logger.info('Patient registered', { patientId: patient.id, email: patient.email });

    return {
      token,
      patient: {
        id: patient.id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
    };
  }

  async loginPatient(
    email: string,
    password: string,
    ipAddress: string,
    correlationId: string,
  ): Promise<{ token: string; patient: Partial<PatientDTO> }> {
    const patient = await this.patientRepo.findByEmail(email);
    if (!patient) {
      await this.auditLogger.log(
        'unknown',
        'patient',
        'LOGIN',
        'patient',
        undefined,
        'Login failed - patient not found',
        undefined,
        undefined,
        ipAddress,
        correlationId,
        'failure',
      );
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValid = await verifyPassword(password, patient.passwordHash);
    if (!isValid) {
      await this.auditLogger.log(
        patient.id,
        'patient',
        'LOGIN',
        'patient',
        patient.id,
        'Login failed - invalid password',
        undefined,
        undefined,
        ipAddress,
        correlationId,
        'failure',
      );
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = generateToken({
      id: patient.id,
      email: patient.email,
      type: 'patient',
    });

    await this.auditLogger.log(
      patient.id,
      'patient',
      'LOGIN',
      'patient',
      patient.id,
      'Patient logged in successfully',
      undefined,
      undefined,
      ipAddress,
      correlationId,
      'success',
    );

    logger.info('Patient logged in', { patientId: patient.id });

    return {
      token,
      patient: {
        id: patient.id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
    };
  }
}
