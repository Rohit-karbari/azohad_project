import { Knex } from 'knex';
import { PatientDTO } from '../dtos';
export declare class PatientService {
    private patientRepo;
    private auditLogger;
    constructor(_knex: Knex);
    getPatientById(id: string, requestingUserId: string, correlationId: string): Promise<Partial<PatientDTO>>;
    updatePatient(id: string, updates: Partial<PatientDTO>, requestingUserId: string, correlationId: string): Promise<Partial<PatientDTO>>;
}
//# sourceMappingURL=patient.service.d.ts.map