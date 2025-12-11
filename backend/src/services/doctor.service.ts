import { Knex } from 'knex';
import { DoctorRepository } from '../repositories/doctor.repository';
import { DoctorDTO, doctorRegistrationSchema } from '../dtos';
import { hashPassword, generateToken } from '../middleware/auth';
import { validateInput, ApiError } from '../utils/errors';
import { AuditLogger } from '../utils/audit-logger';
import { logger } from '../logging';

export class DoctorService {
  private doctorRepo: DoctorRepository;
  private auditLogger: AuditLogger;

  constructor(_knex: Knex) {
    this.doctorRepo = new DoctorRepository(_knex);
    this.auditLogger = new AuditLogger(_knex);
  }

  async registerDoctor(
    data: DoctorDTO,
    ipAddress: string,
    correlationId: string
  ): Promise<{ token: string; doctor: Partial<DoctorDTO> }> {
    validateInput(doctorRegistrationSchema, data);

    const existing = await this.doctorRepo.findByEmail(data.email);
    if (existing) {
      await this.auditLogger.log(
        'unknown',
        'doctor',
        'REGISTER',
        'doctor',
        undefined,
        'Doctor registration failed - email already exists',
        undefined,
        undefined,
        ipAddress,
        correlationId,
        'failure'
      );
      throw new ApiError(409, 'EMAIL_EXISTS', 'Email already registered');
    }

    const passwordHash = await hashPassword(data.password!);
    const doctor = await this.doctorRepo.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      licenseNumber: data.licenseNumber,
      specialization: data.specialization,
      bio: data.bio,
      phone: data.phone,
      status: 'active',
      emailVerified: false,
    });

    const token = generateToken({
      id: doctor.id,
      email: doctor.email,
      type: 'doctor',
    });

    await this.auditLogger.log(
      doctor.id,
      'doctor',
      'REGISTER',
      'doctor',
      doctor.id,
      'Doctor registered successfully',
      undefined,
      { email: doctor.email },
      ipAddress,
      correlationId,
      'success'
    );

    logger.info('Doctor registered', { doctorId: doctor.id, email: doctor.email });

    return {
      token,
      doctor: {
        id: doctor.id,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
      },
    };
  }

  async loginDoctor(
    email: string,
    password: string,
    ipAddress: string,
    correlationId: string
  ): Promise<{ token: string; doctor: Partial<DoctorDTO> }> {
    const doctor = await this.doctorRepo.findByEmail(email);
    if (!doctor) {
      await this.auditLogger.log(
        'unknown',
        'doctor',
        'LOGIN',
        'doctor',
        undefined,
        'Login failed - doctor not found',
        undefined,
        undefined,
        ipAddress,
        correlationId,
        'failure'
      );
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const { verifyPassword } = await import('../middleware/auth');
    const isValid = await verifyPassword(password, doctor.passwordHash);
    if (!isValid) {
      await this.auditLogger.log(
        doctor.id,
        'doctor',
        'LOGIN',
        'doctor',
        doctor.id,
        'Login failed - invalid password',
        undefined,
        undefined,
        ipAddress,
        correlationId,
        'failure'
      );
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = generateToken({
      id: doctor.id,
      email: doctor.email,
      type: 'doctor',
    });

    await this.auditLogger.log(
      doctor.id,
      'doctor',
      'LOGIN',
      'doctor',
      doctor.id,
      'Doctor logged in successfully',
      undefined,
      undefined,
      ipAddress,
      correlationId,
      'success'
    );

    logger.info('Doctor logged in', { doctorId: doctor.id });

    return {
      token,
      doctor: {
        id: doctor.id,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
      },
    };
  }

  async getDoctorById(id: string): Promise<Partial<DoctorDTO>> {
    const doctor = await this.doctorRepo.findById(id);
    if (!doctor) {
      throw new ApiError(404, 'NOT_FOUND', 'Doctor not found');
    }

    return {
      id: doctor.id,
      email: doctor.email,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      licenseNumber: doctor.licenseNumber,
      specialization: doctor.specialization,
      phone: doctor.phone,
    };
  }

  async listDoctorsBySpecialization(specialization: string): Promise<Partial<DoctorDTO>[]> {
    const doctors = await this.doctorRepo.findBySpecialization(specialization);

    return doctors.map((doctor) => ({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      bio: doctor.bio,
      phone: doctor.phone,
    }));
  }
}
