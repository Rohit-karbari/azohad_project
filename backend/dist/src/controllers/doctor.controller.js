"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const doctor_service_1 = require("../services/doctor.service");
const dtos_1 = require("../dtos");
const errors_1 = require("../utils/errors");
class DoctorController {
    constructor(_knex) {
        this.doctorService = new doctor_service_1.DoctorService(_knex);
    }
    async registerDoctor(req, res) {
        try {
            const result = await this.doctorService.registerDoctor(req.body, req.ip || '', req.correlationId || '');
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
    async loginDoctor(req, res) {
        try {
            (0, errors_1.validateInput)(dtos_1.loginSchema, req.body);
            const result = await this.doctorService.loginDoctor(req.body.email, req.body.password, req.ip || '', req.correlationId || '');
            res.status(200).json({
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
    async getDoctorById(req, res) {
        try {
            const doctor = await this.doctorService.getDoctorById(req.params.doctorId);
            res.status(200).json({
                success: true,
                data: doctor,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                code: error.code || 'ERROR',
                message: error.message,
            });
        }
    }
    async listDoctorsBySpecialization(req, res) {
        try {
            const { specialization } = req.query;
            if (!specialization || typeof specialization !== 'string') {
                res.status(400).json({
                    code: 'MISSING_PARAM',
                    message: 'specialization query parameter is required',
                });
                return;
            }
            const doctors = await this.doctorService.listDoctorsBySpecialization(specialization);
            res.status(200).json({
                success: true,
                data: doctors,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                code: error.code || 'ERROR',
                message: error.message,
            });
        }
    }
}
exports.DoctorController = DoctorController;
//# sourceMappingURL=doctor.controller.js.map