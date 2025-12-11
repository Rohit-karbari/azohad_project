"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const middleware_1 = require("./middleware");
const logging_1 = require("./logging");
const telemetry_1 = require("./telemetry");
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../knexfile"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_controller_1 = require("./controllers/auth.controller");
const appointment_controller_1 = require("./controllers/appointment.controller");
const doctor_controller_1 = require("./controllers/doctor.controller");
const clinical_note_controller_1 = require("./controllers/clinical-note.controller");
(0, telemetry_1.initializeTelemetry)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Initialize database connection
const db = (0, knex_1.default)(knexfile_1.default[process.env.NODE_ENV || 'development']);
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
}));
app.use(middleware_1.correlationIdMiddleware);
app.use(middleware_1.requestLoggerMiddleware);
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MediConnect API',
            version: '1.0.0',
            description: 'Healthcare Patient Appointment & Notes Platform',
            contact: {
                name: 'Support',
                email: 'support@mediconnect.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
});
// Initialize controllers
const authController = new auth_controller_1.AuthController(db);
const appointmentController = new appointment_controller_1.AppointmentController(db);
const doctorController = new doctor_controller_1.DoctorController(db);
const clinicalNoteController = new clinical_note_controller_1.ClinicalNoteController(db);
// Auth Routes
/**
 * @swagger
 * /auth/patient/register:
 *   post:
 *     summary: Register a new patient
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
/**
 * @swagger
 * /auth/patient/login:
 *   post:
 *     summary: Login as patient
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
app.post('/auth/patient/login', (req, res) => authController.loginPatient(req, res));
/**
 * @swagger
 * /auth/doctor/register:
 *   post:
 *     summary: Register a new doctor
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               specialization:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       409:
 *         description: Email already exists
 */
app.post('/auth/doctor/register', (req, res) => doctorController.registerDoctor(req, res));
/**
 * @swagger
 * /auth/doctor/login:
 *   post:
 *     summary: Login as doctor
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
app.post('/auth/doctor/login', (req, res) => doctorController.loginDoctor(req, res));
app.post('/auth/patient/login', (req, res) => authController.loginPatient(req, res));
// Appointment Routes (Protected)
/**
 * @swagger
 * /appointments:
/**
 * @swagger
 * /appointments/{appointmentId}:
 *   delete:
 *     summary: Cancel appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: appointmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Cannot cancel other's appointments
 *       404:
 *         description: Appointment not found
 */
app.delete('/appointments/:appointmentId', auth_1.authMiddleware, (req, res) => appointmentController.cancelAppointment(req, res));
// Doctor Routes
/**
 * @swagger
 * /doctors/{doctorId}:
 *   get:
 *     summary: Get doctor profile
 *     tags: [Doctors]
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Doctor profile retrieved
 *       404:
 *         description: Doctor not found
 */
app.get('/doctors/:doctorId', (req, res) => doctorController.getDoctorById(req, res));
/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: List doctors by specialization
 *     tags: [Doctors]
 *     parameters:
 *       - name: specialization
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of doctors
 *       400:
 *         description: Missing specialization parameter
 */
app.get('/doctors', (req, res) => doctorController.listDoctorsBySpecialization(req, res));
// Clinical Notes Routes
/**
 * @swagger
 * /clinical-notes:
 *   post:
 *     summary: Create clinical note for appointment
 *     tags: [Clinical Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 format: uuid
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               chiefComplaint:
 *                 type: string
 *               assessment:
 *                 type: string
 *               plan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Clinical note created
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Only doctors can create notes
 */
app.post('/clinical-notes', auth_1.authMiddleware, (0, auth_1.rbacMiddleware)(['doctor']), (req, res) => clinicalNoteController.createNote(req, res));
/**
 * @swagger
 * /clinical-notes/{noteId}:
 *   put:
 *     summary: Update clinical note (draft status only)
 *     tags: [Clinical Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: noteId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Clinical note updated
 *       403:
 *         description: Cannot modify finalized notes
 */
app.put('/clinical-notes/:noteId', auth_1.authMiddleware, (0, auth_1.rbacMiddleware)(['doctor']), (req, res) => clinicalNoteController.updateNote(req, res));
/**
 * @swagger
 * /clinical-notes/{noteId}/finalize:
 *   post:
 *     summary: Finalize clinical note
 *     tags: [Clinical Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: noteId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Note finalized successfully
 */
app.post('/clinical-notes/:noteId/finalize', auth_1.authMiddleware, (0, auth_1.rbacMiddleware)(['doctor']), (req, res) => clinicalNoteController.finalizeNote(req, res));
/**
 * @swagger
 * /appointments/{appointmentId}/notes:
 *   get:
 *     summary: Get clinical note for appointment
 *     tags: [Clinical Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: appointmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Clinical note retrieved
 *       403:
 *         description: Cannot access other's medical records
 */
app.get('/appointments/:appointmentId/notes', auth_1.authMiddleware, (req, res) => clinicalNoteController.getNoteByAppointment(req, res));
/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               reasonForVisit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Insufficient permissions
 */
app.post('/appointments', auth_1.authMiddleware, (req, res) => appointmentController.createAppointment(req, res));
/**
 * @swagger
 * /appointments/upcoming:
 *   get:
 *     summary: Get upcoming appointments for patient
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming appointments
 *       401:
 *         description: Missing or invalid token
 */
app.get('/appointments/upcoming', auth_1.authMiddleware, (0, auth_1.rbacMiddleware)(['patient']), (req, res) => appointmentController.getUpcomingAppointments(req, res));
/**
 * @swagger
 * /appointments/{appointmentId}:
 *   delete:
 *     summary: Cancel appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: appointmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Cannot cancel other's appointments
 *       404:
 *         description: Appointment not found
 */
app.delete('/appointments/:appointmentId', auth_1.authMiddleware, (req, res) => appointmentController.cancelAppointment(req, res));
// Error handling middleware (must be last)
app.use(middleware_1.errorHandlerMiddleware);
// Graceful shutdown
process.on('SIGTERM', async () => {
    logging_1.logger.info('SIGTERM signal received: closing HTTP server');
    await db.destroy();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logging_1.logger.info('SIGINT signal received: closing HTTP server');
    await db.destroy();
    process.exit(0);
});
// Start server
app.listen(port, () => {
    logging_1.logger.info(`MediConnect Backend running on port ${port}`);
    logging_1.logger.info(`API Documentation available at http://localhost:${port}/api-docs`);
});
exports.default = app;
//# sourceMappingURL=index.js.map