import Joi from 'joi';
export interface PatientDTO {
    id?: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    gender: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}
export interface DoctorDTO {
    id?: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    specialization: string;
    bio?: string;
    phone: string;
}
export interface AppointmentDTO {
    id?: string;
    patientId: string;
    doctorId: string;
    scheduledAt: string;
    durationMinutes?: number;
    reasonForVisit?: string;
    appointmentType?: string;
    status?: string;
}
export interface ClinicalNoteDTO {
    id?: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    physicalExamination?: string;
    assessment?: string;
    plan?: string;
    medications?: string;
    followUp?: string;
    status?: string;
}
export declare const patientRegistrationSchema: Joi.ObjectSchema<any>;
export declare const doctorRegistrationSchema: Joi.ObjectSchema<any>;
export declare const appointmentSchema: Joi.ObjectSchema<any>;
export declare const clinicalNoteSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=index.d.ts.map