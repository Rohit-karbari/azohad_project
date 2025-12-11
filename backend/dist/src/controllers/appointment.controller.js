"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
const errors_1 = require("../utils/errors");
const dtos_1 = require("../dtos");
class AppointmentController {
    constructor(_knex) {
        this.appointmentService = new appointment_service_1.AppointmentService(_knex);
    }
    async createAppointment(req, res) {
        try {
            (0, errors_1.validateInput)(dtos_1.appointmentSchema, req.body);
            const result = await this.appointmentService.createAppointment(req.body, req.user.id, req.user.type, req.ip || '', req.correlationId || '');
            res.status(201).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                code: error.code || 'ERROR',
                message: error.message,
            });
        }
    }
    async getUpcomingAppointments(req, res) {
        try {
            const patientId = req.params.patientId || req.user.id;
            const appointments = await this.appointmentService.getUpcomingAppointments(patientId, req.user.id, req.correlationId || '');
            res.status(200).json({
                success: true,
                data: appointments,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                code: error.code || 'ERROR',
                message: error.message,
            });
        }
    }
    async cancelAppointment(req, res) {
        try {
            await this.appointmentService.cancelAppointment(req.params.appointmentId, req.user.id, req.user.type, req.correlationId || '');
            res.status(204).send();
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                code: error.code || 'ERROR',
                message: error.message,
            });
        }
    }
}
exports.AppointmentController = AppointmentController;
//# sourceMappingURL=appointment.controller.js.map