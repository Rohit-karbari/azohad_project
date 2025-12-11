import { Knex } from 'knex';
import { ClinicalNoteRepository } from '../repositories/audit-log.repository';
import { ClinicalNoteDTO, clinicalNoteSchema } from '../dtos';
import { ApiError, validateInput } from '../utils/errors';
import { AuditLogger } from '../utils/audit-logger';
import { logger } from '../logging';

export class ClinicalNoteService {
  private noteRepo: ClinicalNoteRepository;
  private auditLogger: AuditLogger;

  constructor(_knex: Knex) {
    this.noteRepo = new ClinicalNoteRepository(_knex);
    this.auditLogger = new AuditLogger(_knex);
  }

  async createClinicalNote(
    data: ClinicalNoteDTO,
    userId: string,
    ipAddress: string,
    correlationId: string
  ): Promise<ClinicalNoteDTO> {
    validateInput(clinicalNoteSchema, data);

    // RBAC: Only the treating doctor can add notes
    const note = await this.noteRepo.create({
      appointmentId: data.appointmentId,
      patientId: data.patientId,
      doctorId: userId,
      chiefComplaint: data.chiefComplaint,
      historyOfPresentIllness: data.historyOfPresentIllness,
      physicalExamination: data.physicalExamination,
      assessment: data.assessment,
      plan: data.plan,
      medications: data.medications,
      followUp: data.followUp,
      status: 'draft',
    });

    await this.auditLogger.log(
      userId,
      'doctor',
      'CREATE',
      'clinical_note',
      note.id,
      `Clinical note created for patient ${data.patientId}`,
      undefined,
      { appointmentId: note.appointmentId },
      ipAddress,
      correlationId,
      'success'
    );

    logger.info('Clinical note created', {
      noteId: note.id,
      patientId: data.patientId,
      doctorId: userId,
    });

    return {
      id: note.id,
      appointmentId: note.appointmentId,
      patientId: note.patientId,
      doctorId: note.doctorId,
      status: note.status,
    };
  }

  async updateClinicalNote(
    noteId: string,
    updates: Partial<ClinicalNoteDTO>,
    userId: string,
    ipAddress: string,
    correlationId: string
  ): Promise<ClinicalNoteDTO> {
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new ApiError(404, 'NOT_FOUND', 'Clinical note not found');
    }

    // RBAC: Only the doctor who created the note can update it
    if (note.doctorId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Can only update your own notes');
    }

    // Cannot update finalized or signed notes
    if (note.status !== 'draft') {
      throw new ApiError(400, 'INVALID_STATE', 'Cannot modify finalized or signed notes');
    }

    const updated = await this.noteRepo.update(noteId, {
      ...note,
      ...updates,
      status: (updates.status || note.status) as 'draft' | 'finalized' | 'signed',
    });

    if (!updated) {
      throw new ApiError(500, 'UPDATE_FAILED', 'Failed to update clinical note');
    }

    await this.auditLogger.log(
      userId,
      'doctor',
      'UPDATE',
      'clinical_note',
      noteId,
      'Clinical note updated',
      { old: note },
      { new: updated },
      ipAddress,
      correlationId,
      'success'
    );

    logger.info('Clinical note updated', { noteId });

    return {
      id: updated.id,
      appointmentId: updated.appointmentId,
      patientId: updated.patientId,
      doctorId: updated.doctorId,
      status: updated.status,
    };
  }

  async finalizeClinicalNote(
    noteId: string,
    userId: string,
    ipAddress: string,
    correlationId: string
  ): Promise<void> {
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new ApiError(404, 'NOT_FOUND', 'Clinical note not found');
    }

    if (note.doctorId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Can only finalize your own notes');
    }

    if (note.status !== 'draft') {
      throw new ApiError(400, 'INVALID_STATE', 'Only draft notes can be finalized');
    }

    await this.noteRepo.update(noteId, {
      ...note,
      status: 'finalized',
    });

    await this.auditLogger.log(
      userId,
      'doctor',
      'FINALIZE',
      'clinical_note',
      noteId,
      'Clinical note finalized',
      { status: note.status },
      { status: 'finalized' },
      ipAddress,
      correlationId,
      'success'
    );

    logger.info('Clinical note finalized', { noteId });
  }

  async getClinicalNoteByAppointment(
    appointmentId: string,
    userId: string,
    userType: 'patient' | 'doctor',
    correlationId: string
  ): Promise<ClinicalNoteDTO | null> {
    const note = await this.noteRepo.findByAppointmentId(appointmentId);

    if (!note) {
      return null;
    }

    // RBAC: Patient can view notes, doctor can view their own notes
    if (userType === 'patient' && note.patientId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Can only view your own medical records');
    }

    if (userType === 'doctor' && note.doctorId !== userId) {
      throw new ApiError(403, 'FORBIDDEN', 'Can only view your own notes');
    }

    await this.auditLogger.log(
      userId,
      userType,
      'VIEW',
      'clinical_note',
      note.id,
      'Clinical note viewed',
      undefined,
      undefined,
      undefined,
      correlationId,
      'success'
    );

    return {
      id: note.id,
      appointmentId: note.appointmentId,
      patientId: note.patientId,
      doctorId: note.doctorId,
      chiefComplaint: note.chiefComplaint,
      historyOfPresentIllness: note.historyOfPresentIllness,
      physicalExamination: note.physicalExamination,
      assessment: note.assessment,
      plan: note.plan,
      medications: note.medications,
      followUp: note.followUp,
      status: note.status,
    };
  }
}
