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

// Validation schemas
export const patientRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  phone: Joi.string().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
});

export const doctorRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  specialization: Joi.string().required(),
  bio: Joi.string().optional(),
  phone: Joi.string().required(),
});

export const appointmentSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  doctorId: Joi.string().uuid().required(),
  scheduledAt: Joi.date().required(),
  durationMinutes: Joi.number().default(30),
  reasonForVisit: Joi.string().optional(),
  appointmentType: Joi.string().valid('in-person', 'telehealth').default('in-person'),
});

export const clinicalNoteSchema = Joi.object({
  appointmentId: Joi.string().uuid().required(),
  chiefComplaint: Joi.string().optional(),
  historyOfPresentIllness: Joi.string().optional(),
  physicalExamination: Joi.string().optional(),
  assessment: Joi.string().optional(),
  plan: Joi.string().optional(),
  medications: Joi.string().optional(),
  followUp: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
