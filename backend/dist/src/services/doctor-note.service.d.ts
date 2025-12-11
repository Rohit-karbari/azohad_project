import { Knex } from 'knex';
import { ClinicalNoteDTO } from '../dtos';
export declare class ClinicalNoteService {
    private noteRepo;
    private auditLogger;
    constructor(_knex: Knex);
    createClinicalNote(data: ClinicalNoteDTO, userId: string, ipAddress: string, correlationId: string): Promise<ClinicalNoteDTO>;
    updateClinicalNote(noteId: string, updates: Partial<ClinicalNoteDTO>, userId: string, ipAddress: string, correlationId: string): Promise<ClinicalNoteDTO>;
    finalizeClinicalNote(noteId: string, userId: string, ipAddress: string, correlationId: string): Promise<void>;
    getClinicalNoteByAppointment(appointmentId: string, userId: string, userType: 'patient' | 'doctor', correlationId: string): Promise<ClinicalNoteDTO | null>;
}
//# sourceMappingURL=doctor-note.service.d.ts.map