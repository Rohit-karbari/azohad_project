import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DoctorService } from '../services/doctor.service';
import { Knex } from 'knex';
import { loginSchema } from '../dtos';
import { validateInput } from '../utils/errors';

export class DoctorController {
  private doctorService: DoctorService;

  constructor(_knex: Knex) {
    this.doctorService = new DoctorService(_knex);
  }

  async registerDoctor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await this.doctorService.registerDoctor(
        req.body,
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

  async loginDoctor(req: AuthRequest, res: Response): Promise<void> {
    try {
      validateInput(loginSchema, req.body);
      const result = await this.doctorService.loginDoctor(
        req.body.email,
        req.body.password,
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

  async getDoctorById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const doctor = await this.doctorService.getDoctorById(req.params.doctorId);
      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        code: error.code || 'ERROR',
        message: error.message,
      });
    }
  }

  async listDoctorsBySpecialization(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { specialization } = req.query;
      if (!specialization || typeof specialization !== 'string') {
        res.status(400).json({
          code: 'MISSING_PARAM',
          message: 'specialization query parameter is required',
        });
        return;
      }

      const doctors = await this.doctorService.listDoctorsBySpecialization(specialization);
      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        code: error.code || 'ERROR',
        message: error.message,
      });
    }
  }
}
