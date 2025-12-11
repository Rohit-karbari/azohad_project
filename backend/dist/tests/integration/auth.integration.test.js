"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const knex_1 = __importDefault(require("knex"));
const index_1 = __importDefault(require("../../src/index"));
describe('Auth API Integration Tests', () => {
    let db;
    beforeAll(async () => {
        db = (0, knex_1.default)({
            client: 'pg',
            connection: {
                host: 'localhost',
                port: 5432,
                user: 'postgres',
                password: 'postgres',
                database: 'mediconnect_test',
            },
        });
        await db.migrate.latest();
    });
    afterAll(async () => {
        await db.migrate.rollback();
        await db.destroy();
    });
    afterEach(async () => {
        await db('appointments').del();
        await db('patients').del();
        await db('doctors').del();
        await db('clinical_notes').del();
        await db('audit_logs').del();
    });
    describe('POST /auth/patient/register', () => {
        test('should register a new patient', async () => {
            const response = await (0, supertest_1.default)(index_1.default).post('/auth/patient/register').send({
                email: 'newpatient@example.com',
                password: 'SecurePassword123!',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                phone: '+1-555-1234',
                gender: 'male',
            });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.patient.email).toBe('newpatient@example.com');
        });
        test('should fail with duplicate email', async () => {
            await (0, supertest_1.default)(index_1.default).post('/auth/patient/register').send({
                email: 'duplicate@example.com',
                password: 'SecurePassword123!',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                phone: '+1-555-1234',
                gender: 'male',
            });
            const response = await (0, supertest_1.default)(index_1.default).post('/auth/patient/register').send({
                email: 'duplicate@example.com',
                password: 'AnotherPassword123!',
                firstName: 'Jane',
                lastName: 'Doe',
                dateOfBirth: '1992-01-01',
                phone: '+1-555-5678',
                gender: 'female',
            });
            expect(response.status).toBe(409);
            expect(response.body.code).toBe('EMAIL_EXISTS');
        });
        test('should fail with invalid password', async () => {
            const response = await (0, supertest_1.default)(index_1.default).post('/auth/patient/register').send({
                email: 'test@example.com',
                password: 'short', // too short
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                phone: '+1-555-1234',
                gender: 'male',
            });
            expect(response.status).toBe(400);
            expect(response.body.code).toBe('VALIDATION_ERROR');
        });
    });
    describe('POST /auth/patient/login', () => {
        beforeEach(async () => {
            await (0, supertest_1.default)(index_1.default).post('/auth/patient/register').send({
                email: 'login@example.com',
                password: 'SecurePassword123!',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                phone: '+1-555-1234',
                gender: 'male',
            });
        });
        test('should login with correct credentials', async () => {
            const response = await (0, supertest_1.default)(index_1.default).post('/auth/patient/login').send({
                email: 'login@example.com',
                password: 'SecurePassword123!',
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
        });
        test('should fail with incorrect password', async () => {
            const response = await (0, supertest_1.default)(index_1.default).post('/auth/patient/login').send({
                email: 'login@example.com',
                password: 'WrongPassword123!',
            });
            expect(response.status).toBe(401);
            expect(response.body.code).toBe('INVALID_CREDENTIALS');
        });
        test('should fail with non-existent email', async () => {
            const response = await (0, supertest_1.default)(index_1.default).post('/auth/patient/login').send({
                email: 'nonexistent@example.com',
                password: 'SecurePassword123!',
            });
            expect(response.status).toBe(401);
            expect(response.body.code).toBe('INVALID_CREDENTIALS');
        });
    });
    describe('GET /health', () => {
        test('should return health status', async () => {
            const response = await (0, supertest_1.default)(index_1.default).get('/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('UP');
            expect(response.body.timestamp).toBeDefined();
        });
    });
});
//# sourceMappingURL=auth.integration.test.js.map