"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalNoteController = void 0;
const doctor_note_service_1 = require("../services/doctor-note.service");
const errors_1 = require("../utils/errors");
const dtos_1 = require("../dtos");
class ClinicalNoteController {
    constructor(_knex) {
        this.noteService = new doctor_note_service_1.ClinicalNoteService(_knex);
    }
    async createNote(req, res) {
        try {
            (0, errors_1.validateInput)(dtos_1.clinicalNoteSchema, req.body);
            const result = await this.noteService.createClinicalNote(req.body, req.user.id, req.ip || '', req.correlationId || '');
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
    async updateNote(req, res) {
        try {
            const result = await this.noteService.updateClinicalNote(req.params.noteId, req.body, req.user.id, req.ip || '', req.correlationId || '');
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
    async finalizeNote(req, res) {
        try {
            await this.noteService.finalizeClinicalNote(req.params.noteId, req.user.id, req.ip || '', req.correlationId || '');
            res.status(204).send();
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                code: error.code || 'ERROR',
                message: error.message,
            });
        }
    }
    async getNoteByAppointment(req, res) {
        try {
            const note = await this.noteService.getClinicalNoteByAppointment(req.params.appointmentId, req.user.id, req.user.type, req.correlationId || '');
            res.status(200).json({
                success: true,
                data: note,
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
exports.ClinicalNoteController = ClinicalNoteController;
//# sourceMappingURL=clinical-note.controller.js.map