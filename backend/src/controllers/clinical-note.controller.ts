import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ClinicalNoteService } from '../services/doctor-note.service';
import { Knex } from 'knex';
import { validateInput } from '../utils/errors';
import { clinicalNoteSchema } from '../dtos';

export class ClinicalNoteController {
  private noteService: ClinicalNoteService;

  constructor(_knex: Knex) {
    this.noteService = new ClinicalNoteService(_knex);
  }

  async createNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      validateInput(clinicalNoteSchema, req.body);
      const result = await this.noteService.createClinicalNote(
        req.body,
        req.user!.id,
        req.ip || '',
        req.correlationId || ''
      );
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        code: error.code || 'ERROR',
        message: error.message,
      });
    }
  }

  async updateNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await this.noteService.updateClinicalNote(
        req.params.noteId,
        req.body,
        req.user!.id,
        req.ip || '',
        req.correlationId || ''
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        code: error.code || 'ERROR',
        message: error.message,
      });
    }
  }

  async finalizeNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      await this.noteService.finalizeClinicalNote(
        req.params.noteId,
        req.user!.id,
        req.ip || '',
        req.correlationId || ''
      );
      res.status(204).send();
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        code: error.code || 'ERROR',
        message: error.message,
      });
    }
  }

  async getNoteByAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const note = await this.noteService.getClinicalNoteByAppointment(
        req.params.appointmentId,
        req.user!.id,
        req.user!.type,
        req.correlationId || ''
      );
      res.status(200).json({
        success: true,
        data: note,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        code: error.code || 'ERROR',
        message: error.message,
      });
    }
  }
}
