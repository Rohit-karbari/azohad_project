import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Knex } from 'knex';
export declare class DoctorController {
    private doctorService;
    constructor(_knex: Knex);
    registerDoctor(req: AuthRequest, res: Response): Promise<void>;
    loginDoctor(req: AuthRequest, res: Response): Promise<void>;
    getDoctorById(req: AuthRequest, res: Response): Promise<void>;
    listDoctorsBySpecialization(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=doctor.controller.d.ts.map