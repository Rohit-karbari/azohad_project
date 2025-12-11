import { Knex } from 'knex';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { DoctorRepository } from '../repositories/doctor.repository';
import { AppointmentDTO } from '../dtos';
import { ApiError } from '../utils/errors';
import { AuditLogger } from '../utils/audit-logger';
import { logger } from '../logging';

export class AppointmentService {
  private appointmentRepo: AppointmentRepository;
  private patientRepo: PatientRepository;
  private doctorRepo: DoctorRepository;
  private auditLogger: AuditLogger;

  constructor(_knex: Knex) {
    this.appointmentRepo = new AppointmentRepository(_knex);
    this.patientRepo = new PatientRepository(_knex);
    this.doctorRepo = new DoctorRepository(_knex);
    this.auditLogger = new AuditLogger(_knex);
  }

  async createAppointment(
    data: AppointmentDTO,
    userId: string,
    userType: 'patient' | 'doctor',
    ipAddress: string,
    correlationId: string
  ): Promise<AppointmentDTO> {
    // RBAC: only patients can create appointments for themselves
    if (userType === 'patient' && data.patientId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Can only create appointments for yourself');
    }

    // Validate patient exists
    const patient = await this.patientRepo.findById(data.patientId);
    if (!patient) {
      throw new ApiError(404, 'NOT_FOUND', 'Patient not found');
    }

    // Validate doctor exists
    const doctor = await this.doctorRepo.findById(data.doctorId);
    if (!doctor) {
      throw new ApiError(404, 'NOT_FOUND', 'Doctor not found');
    }

    // Validate appointment is in future
    if (new Date(data.scheduledAt) <= new Date()) {
      throw new ApiError(400, 'INVALID_DATE', 'Appointment must be scheduled for future date');
    }

    const appointment = await this.appointmentRepo.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes || 30,
      reasonForVisit: data.reasonForVisit,
      appointmentType: (data.appointmentType || 'in-person') as 'in-person' | 'telehealth',
      status: 'scheduled',
      notes: undefined,
    });

    await this.auditLogger.log(
      userId,
      userType,
      'CREATE',
      'appointment',
      appointment.id,
      `Appointment created between patient ${data.patientId} and doctor ${data.doctorId}`,
      undefined,
      { appointmentId: appointment.id },
      ipAddress,
      correlationId,
      'success'
    );

    logger.info('Appointment created', {
      appointmentId: appointment.id,
      patientId: data.patientId,
      doctorId: data.doctorId,
    });

    return {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      scheduledAt: appointment.scheduledAt.toISOString(),
      durationMinutes: appointment.durationMinutes,
      reasonForVisit: appointment.reasonForVisit,
      appointmentType: appointment.appointmentType,
      status: appointment.status,
    };
  }

  async getUpcomingAppointments(
    patientId: string,
    userId: string,
    correlationId: string
  ): Promise<AppointmentDTO[]> {
    // RBAC: patients can only view their own appointments
    if (patientId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Can only view your own appointments');
    }

    const appointments = await this.appointmentRepo.findUpcoming(patientId, 10);

    await this.auditLogger.log(
      userId,
      'patient',
      'VIEW',
      'appointment',
      undefined,
      'Retrieved upcoming appointments',
      undefined,
      undefined,
      undefined,
      correlationId,
      'success'
    );

    return appointments.map((apt) => ({
      id: apt.id,
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      scheduledAt: apt.scheduledAt.toISOString(),
      durationMinutes: apt.durationMinutes,
      reasonForVisit: apt.reasonForVisit,
      appointmentType: apt.appointmentType,
      status: apt.status,
    }));
  }

  async cancelAppointment(
    appointmentId: string,
    userId: string,
    userType: 'patient' | 'doctor',
    correlationId: string
  ): Promise<void> {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
    }

    // RBAC: only patient or assigned doctor can cancel
    if (userType === 'patient' && appointment.patientId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Can only cancel your own appointments');
    }
    if (userType === 'doctor' && appointment.doctorId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Can only cancel your own appointments');
    }

    await this.appointmentRepo.update(appointmentId, {
      ...appointment,
      status: 'cancelled',
    });

    await this.auditLogger.log(
      userId,
      userType,
      'CANCEL',
      'appointment',
      appointmentId,
      'Appointment cancelled',
      { status: appointment.status },
      { status: 'cancelled' },
      undefined,
      correlationId,
      'success'
    );

    logger.info('Appointment cancelled', { appointmentId });
  }
}
