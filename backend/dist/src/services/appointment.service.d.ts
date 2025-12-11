import { Knex } from 'knex';
import { AppointmentDTO } from '../dtos';
export declare class AppointmentService {
    private appointmentRepo;
    private patientRepo;
    private doctorRepo;
    private auditLogger;
    constructor(_knex: Knex);
    createAppointment(data: AppointmentDTO, userId: string, userType: 'patient' | 'doctor', ipAddress: string, correlationId: string): Promise<AppointmentDTO>;
    getUpcomingAppointments(patientId: string, userId: string, correlationId: string): Promise<AppointmentDTO[]>;
    cancelAppointment(appointmentId: string, userId: string, userType: 'patient' | 'doctor', correlationId: string): Promise<void>;
}
//# sourceMappingURL=appointment.service.d.ts.map