import { Knex } from 'knex';
import { PatientDTO } from '../dtos';
export declare class AuthService {
    private patientRepo;
    private auditLogger;
    constructor(_knex: Knex);
    registerPatient(data: PatientDTO, ipAddress: string, correlationId: string): Promise<{
        token: string;
        patient: Partial<PatientDTO>;
    }>;
    loginPatient(email: string, password: string, ipAddress: string, correlationId: string): Promise<{
        token: string;
        patient: Partial<PatientDTO>;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map