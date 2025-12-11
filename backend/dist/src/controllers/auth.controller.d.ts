import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Knex } from 'knex';
export declare class AuthController {
    private authService;
    constructor(_knex: Knex);
    registerPatient(req: AuthRequest, res: Response): Promise<void>;
    loginPatient(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map