export interface Patient {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  gender: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  specialization: string;
  bio?: string;
  phone: string;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  durationMinutes: number;
  reasonForVisit?: string;
  notes?: string;
  appointmentType: 'in-person' | 'telehealth';
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicalNote {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  assessment?: string;
  plan?: string;
  medications?: string;
  followUp?: string;
  status: 'draft' | 'finalized' | 'signed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  userType: 'patient' | 'doctor' | 'admin';
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  correlationId?: string;
  description?: string;
  status: 'success' | 'failure';
  createdAt: Date;
}
