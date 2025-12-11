import express, { Express } from 'express';
import cors from 'cors';
import { AuthRequest, authMiddleware, rbacMiddleware } from './middleware/auth';
import {
  correlationIdMiddleware,
  requestLoggerMiddleware,
  errorHandlerMiddleware,
} from './middleware';
import { logger } from './logging';
import { initializeTelemetry } from './telemetry';
import knex from 'knex';
import knexConfig from '../knexfile';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { AuthController } from './controllers/auth.controller';
import { AppointmentController } from './controllers/appointment.controller';
import { DoctorController } from './controllers/doctor.controller';
import { ClinicalNoteController } from './controllers/clinical-note.controller';

initializeTelemetry();

const app: Express = express();
const port = process.env.PORT || 3001;

// Initialize database connection
const db = knex(knexConfig[process.env.NODE_ENV || 'development']);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
  })
);
app.use(correlationIdMiddleware);
app.use(requestLoggerMiddleware);

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

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Initialize controllers
const authController = new AuthController(db);
const appointmentController = new AppointmentController(db);
const doctorController = new DoctorController(db);
const clinicalNoteController = new ClinicalNoteController(db);

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
app.post('/auth/patient/login', (req, res) => authController.loginPatient(req as AuthRequest, res));
// Patient registration endpoint
app.post('/auth/patient/register', (req, res) =>
  authController.registerPatient(req as AuthRequest, res)
);

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
app.post('/auth/doctor/register', (req, res) =>
  doctorController.registerDoctor(req as AuthRequest, res)
);

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
app.post('/auth/doctor/login', (req, res) => doctorController.loginDoctor(req as AuthRequest, res));
app.post('/auth/patient/login', (req, res) => authController.loginPatient(req as AuthRequest, res));

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
app.delete('/appointments/:appointmentId', authMiddleware, (req, res) =>
  appointmentController.cancelAppointment(req as AuthRequest, res)
);

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
app.get('/doctors/:doctorId', (req, res) =>
  doctorController.getDoctorById(req as AuthRequest, res)
);

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
app.get('/doctors', (req, res) =>
  doctorController.listDoctorsBySpecialization(req as AuthRequest, res)
);

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
app.post('/clinical-notes', authMiddleware, rbacMiddleware(['doctor']), (req, res) =>
  clinicalNoteController.createNote(req as AuthRequest, res)
);

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
app.put('/clinical-notes/:noteId', authMiddleware, rbacMiddleware(['doctor']), (req, res) =>
  clinicalNoteController.updateNote(req as AuthRequest, res)
);

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
app.post(
  '/clinical-notes/:noteId/finalize',
  authMiddleware,
  rbacMiddleware(['doctor']),
  (req, res) => clinicalNoteController.finalizeNote(req as AuthRequest, res)
);

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
app.get('/appointments/:appointmentId/notes', authMiddleware, (req, res) =>
  clinicalNoteController.getNoteByAppointment(req as AuthRequest, res)
);

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
app.post('/appointments', authMiddleware, (req, res) =>
  appointmentController.createAppointment(req as AuthRequest, res)
);

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
app.get('/appointments/upcoming', authMiddleware, rbacMiddleware(['patient']), (req, res) =>
  appointmentController.getUpcomingAppointments(req as AuthRequest, res)
);

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
app.delete('/appointments/:appointmentId', authMiddleware, (req, res) =>
  appointmentController.cancelAppointment(req as AuthRequest, res)
);

// Error handling middleware (must be last)
app.use(errorHandlerMiddleware);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await db.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await db.destroy();
  process.exit(0);
});

// Start server
app.listen(port, () => {
  logger.info(`MediConnect Backend running on port ${port}`);
  logger.info(`API Documentation available at http://localhost:${port}/api-docs`);
});

export default app;
