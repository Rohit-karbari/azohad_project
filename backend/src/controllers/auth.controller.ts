import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/auth.service';
import { Knex } from 'knex';
import { validateInput } from '../utils/errors';
import { loginSchema } from '../dtos';

export class AuthController {
  private authService: AuthService;

  constructor(_knex: Knex) {
    this.authService = new AuthService(_knex);
  }

  async registerPatient(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await this.authService.registerPatient(
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

  async loginPatient(req: AuthRequest, res: Response): Promise<void> {
    try {
      validateInput(loginSchema, req.body);
      const result = await this.authService.loginPatient(
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
}
