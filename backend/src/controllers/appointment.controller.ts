import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppointmentService } from '../services/appointment.service';
import { Knex } from 'knex';
import { validateInput } from '../utils/errors';
import { appointmentSchema } from '../dtos';

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor(_knex: Knex) {
    this.appointmentService = new AppointmentService(_knex);
  }

  async createAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      validateInput(appointmentSchema, req.body);
      const result = await this.appointmentService.createAppointment(
        req.body,
        req.user!.id,
        req.user!.type,
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

  async getUpcomingAppointments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const patientId = req.params.patientId || req.user!.id;
      const appointments = await this.appointmentService.getUpcomingAppointments(
        patientId,
        req.user!.id,
        req.correlationId || ''
      );
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        code: error.code || 'ERROR',
        message: error.message,
      });
    }
  }

  async cancelAppointment(req: AuthRequest, res: Response): Promise<void> {
    try {
      await this.appointmentService.cancelAppointment(
        req.params.appointmentId,
        req.user!.id,
        req.user!.type,
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
}
