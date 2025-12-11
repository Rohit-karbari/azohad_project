"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.clinicalNoteSchema = exports.appointmentSchema = exports.doctorRegistrationSchema = exports.patientRegistrationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation schemas
exports.patientRegistrationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    dateOfBirth: joi_1.default.date().required(),
    phone: joi_1.default.string().required(),
    gender: joi_1.default.string().valid('male', 'female', 'other').required(),
    address: joi_1.default.string().optional(),
    city: joi_1.default.string().optional(),
    state: joi_1.default.string().optional(),
    zipCode: joi_1.default.string().optional(),
});
exports.doctorRegistrationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    licenseNumber: joi_1.default.string().required(),
    specialization: joi_1.default.string().required(),
    bio: joi_1.default.string().optional(),
    phone: joi_1.default.string().required(),
});
exports.appointmentSchema = joi_1.default.object({
    patientId: joi_1.default.string().uuid().required(),
    doctorId: joi_1.default.string().uuid().required(),
    scheduledAt: joi_1.default.date().required(),
    durationMinutes: joi_1.default.number().default(30),
    reasonForVisit: joi_1.default.string().optional(),
    appointmentType: joi_1.default.string().valid('in-person', 'telehealth').default('in-person'),
});
exports.clinicalNoteSchema = joi_1.default.object({
    appointmentId: joi_1.default.string().uuid().required(),
    chiefComplaint: joi_1.default.string().optional(),
    historyOfPresentIllness: joi_1.default.string().optional(),
    physicalExamination: joi_1.default.string().optional(),
    assessment: joi_1.default.string().optional(),
    plan: joi_1.default.string().optional(),
    medications: joi_1.default.string().optional(),
    followUp: joi_1.default.string().optional(),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
//# sourceMappingURL=index.js.map