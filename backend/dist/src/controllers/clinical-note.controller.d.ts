import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Knex } from 'knex';
export declare class ClinicalNoteController {
    private noteService;
    constructor(_knex: Knex);
    createNote(req: AuthRequest, res: Response): Promise<void>;
    updateNote(req: AuthRequest, res: Response): Promise<void>;
    finalizeNote(req: AuthRequest, res: Response): Promise<void>;
    getNoteByAppointment(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=clinical-note.controller.d.ts.map