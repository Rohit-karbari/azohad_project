"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const errors_1 = require("../utils/errors");
const dtos_1 = require("../dtos");
class AuthController {
    constructor(_knex) {
        this.authService = new auth_service_1.AuthService(_knex);
    }
    async registerPatient(req, res) {
        try {
            const result = await this.authService.registerPatient(req.body, req.ip || '', req.correlationId || '');
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
    async loginPatient(req, res) {
        try {
            (0, errors_1.validateInput)(dtos_1.loginSchema, req.body);
            const result = await this.authService.loginPatient(req.body.email, req.body.password, req.ip || '', req.correlationId || '');
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
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map