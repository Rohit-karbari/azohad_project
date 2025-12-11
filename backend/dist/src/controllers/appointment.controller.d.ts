import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Knex } from 'knex';
export declare class AppointmentController {
    private appointmentService;
    constructor(_knex: Knex);
    createAppointment(req: AuthRequest, res: Response): Promise<void>;
    getUpcomingAppointments(req: AuthRequest, res: Response): Promise<void>;
    cancelAppointment(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=appointment.controller.d.ts.map