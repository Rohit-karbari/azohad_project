import { Knex } from 'knex';
import { DoctorDTO } from '../dtos';
export declare class DoctorService {
    private doctorRepo;
    private auditLogger;
    constructor(_knex: Knex);
    registerDoctor(data: DoctorDTO, ipAddress: string, correlationId: string): Promise<{
        token: string;
        doctor: Partial<DoctorDTO>;
    }>;
    loginDoctor(email: string, password: string, ipAddress: string, correlationId: string): Promise<{
        token: string;
        doctor: Partial<DoctorDTO>;
    }>;
    getDoctorById(id: string): Promise<Partial<DoctorDTO>>;
    listDoctorsBySpecialization(specialization: string): Promise<Partial<DoctorDTO>[]>;
}
//# sourceMappingURL=doctor.service.d.ts.map